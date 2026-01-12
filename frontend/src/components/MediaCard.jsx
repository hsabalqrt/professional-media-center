import React from 'react';
import { Play, Music, Video } from 'lucide-react';

const MediaCard = ({ media, onClick }) => {
    const isVideo = media.type === 'video';
    const Icon = isVideo ? Video : Music;

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    };

    return (
        <div
            onClick={onClick}
            className="glass glass-hover rounded-2xl p-4 cursor-pointer group animate-scale-in"
        >
            <div className="relative aspect-video rounded-xl bg-gradient-to-br from-primary-600/20 to-primary-800/20 mb-3 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />
                <Icon className="w-16 h-16 text-primary-400 relative z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center">
                        <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                    {media.name}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="uppercase text-xs font-medium">{media.extension}</span>
                    <span>{formatSize(media.size)}</span>
                </div>
            </div>
        </div>
    );
};

export default MediaCard;
