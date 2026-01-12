import express from 'express';
import cors from 'cors';
import fg from 'fast-glob';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Store scanned media files
let mediaFiles = [];

// Supported media extensions
const VIDEO_EXTENSIONS = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma'];
const ALL_EXTENSIONS = [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS];

// POST /api/scan - Scan directories for media files
app.post('/api/scan', async (req, res) => {
    try {
        let { paths } = req.body;

        if (!paths || !Array.isArray(paths) || paths.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of paths to scan' });
        }

        mediaFiles = [];

        for (let scanPath of paths) {
            // Clean up the path: ensure it doesn't end with a slash unless it's a root drive
            // For example: D: or D:\ should both work
            let normalizedPath = scanPath.replace(/\\/g, '/');
            if (normalizedPath.length > 2 && normalizedPath.endsWith('/')) {
                normalizedPath = normalizedPath.slice(0, -1);
            }

            // Build glob patterns
            const patterns = ALL_EXTENSIONS.map(ext =>
                `${normalizedPath}/**/*.${ext}`
            );

            try {
                const files = await fg(patterns, {
                    caseSensitiveMatch: false,
                    onlyFiles: true,
                    suppressErrors: true,
                    followSymbolicLinks: false,
                    unique: true,
                    ignore: [
                        '**/node_modules/**',
                        '**/Windows/**',
                        '**/Program Files/**',
                        '**/Program Files (x86)/**',
                        '**/$Recycle.Bin/**',
                        '**/System Volume Information/**',
                        '**/Documents and Settings/**',
                        '**/AppData/**',
                        '**/Local Settings/**',
                        '**/Recovery/**',
                        '**/Boot/**',
                        '**/Config.Msi/**',
                        '**/Intel/**',
                        '**/Application Data/**',
                        '**/.gemini/**'
                    ]
                });

                // Process found files
                for (const file of files) {
                    try {
                        // Check if we can actually access the file before adding it
                        if (!fs.existsSync(file)) continue;

                        const stats = fs.statSync(file);
                        const ext = path.extname(file).toLowerCase().substring(1);
                        const type = VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'audio';

                        // Ensure directory is formatted consistently
                        let directory = path.dirname(file).replace(/\\/g, '/');

                        mediaFiles.push({
                            id: Buffer.from(file).toString('base64'),
                            path: file,
                            name: path.basename(file),
                            directory,
                            folderName: path.basename(directory) || directory,
                            type,
                            size: stats.size,
                            modified: stats.mtime,
                            extension: ext
                        });
                    } catch (e) {
                        // Ignore files we can't stat (permission issues)
                        continue;
                    }
                }
            } catch (error) {
                console.error(`Warning: Issues scanning ${scanPath}, skipping restricted areas.`);
            }
        }

        res.json({
            success: true,
            count: mediaFiles.length,
            files: mediaFiles
        });
    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/browse - Browse folder hierarchy (returns subfolders + files)
app.get('/api/browse', (req, res) => {
    try {
        const { path: browsePath, type } = req.query;

        // Normalize the path
        const normalizedBrowsePath = browsePath ? browsePath.replace(/\\/g, '/') : '';

        // Filter files by type if specified
        let files = mediaFiles;
        if (type && ['video', 'audio'].includes(type)) {
            files = mediaFiles.filter(f => f.type === type);
        }

        // If no path specified (ROOT VIEW), return drives/top-level folders
        if (!normalizedBrowsePath) {
            const rootDirs = new Set();
            files.forEach(file => {
                const parts = file.directory.split('/');
                if (parts.length > 0 && parts[0]) {
                    rootDirs.add(parts[0]);
                }
            });

            const rootItems = Array.from(rootDirs).map(rootPath => {
                const filesInRoot = files.filter(f =>
                    f.directory === rootPath || f.directory.startsWith(rootPath + '/')
                );
                return {
                    type: 'folder',
                    path: rootPath,
                    name: rootPath, // Show "D:" or "C:" as is
                    videoCount: filesInRoot.filter(f => f.type === 'video').length,
                    audioCount: filesInRoot.filter(f => f.type === 'audio').length,
                    subfolderCount: countSubfolders(rootPath, files)
                };
            });

            return res.json({
                path: '',
                items: rootItems
            });
        }

        // Get immediate children (files and subfolders) of the specified path
        const items = [];
        const seenSubfolders = new Set();

        for (const file of files) {
            const fileDir = file.directory;

            // 1. Check if file is directly in this folder
            if (fileDir === normalizedBrowsePath) {
                items.push({
                    type: 'file',
                    ...file
                });
            }
            // 2. Check if file is in a subfolder of this folder
            else if (fileDir.startsWith(normalizedBrowsePath + '/')) {
                const relativePath = fileDir.substring(normalizedBrowsePath.length + 1);
                const firstSegment = relativePath.split('/')[0];
                const subfolderPath = `${normalizedBrowsePath}/${firstSegment}`;

                if (!seenSubfolders.has(subfolderPath)) {
                    seenSubfolders.add(subfolderPath);

                    const filesInSubfolder = files.filter(f =>
                        f.directory === subfolderPath || f.directory.startsWith(subfolderPath + '/')
                    );

                    items.push({
                        type: 'folder',
                        path: subfolderPath,
                        name: firstSegment,
                        videoCount: filesInSubfolder.filter(f => f.type === 'video').length,
                        audioCount: filesInSubfolder.filter(f => f.type === 'audio').length,
                        subfolderCount: countSubfolders(subfolderPath, files)
                    });
                }
            }
        }

        // Sort: folders first, then files
        items.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'folder' ? -1 : 1;
        });

        res.json({
            path: normalizedBrowsePath,
            items
        });
    } catch (error) {
        console.error('Browse error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to count subfolders
function countSubfolders(folderPath, files) {
    const subfolders = new Set();
    const normalizedPath = folderPath.replace(/\\/g, '/');

    for (const file of files) {
        const fileDir = file.directory;
        if (fileDir.startsWith(normalizedPath + '/')) {
            const relativePath = fileDir.substring(normalizedPath.length + 1);
            const firstSegment = relativePath.split('/')[0];
            if (firstSegment) {
                subfolders.add(firstSegment);
            }
        }
    }

    return subfolders.size;
}

// GET /api/media - Get files (legacy/fallback)
app.get('/api/media', (req, res) => {
    const { type, folder } = req.query;
    let filtered = mediaFiles;
    if (folder) filtered = filtered.filter(f => f.directory === folder);
    if (type && ['video', 'audio'].includes(type)) filtered = filtered.filter(f => f.type === type);
    res.json({ count: filtered.length, files: filtered });
});

// GET /api/stream/:id - Stream a media file
app.get('/api/stream/:id', (req, res) => {
    try {
        const { id } = req.params;
        const filePath = Buffer.from(id, 'base64').toString('utf-8');
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': mimeType,
            });
            file.pipe(res);
        } else {
            res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': mimeType });
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Media Center Backend running on http://localhost:${PORT}`);
});
