import React from 'react';
import { Folder, Video, Music, ChevronRight } from 'lucide-react';

const FolderCard = ({ folder, onClick }) => {
    const hasVideos = folder.videoCount > 0;
    const hasAudio = folder.audioCount > 0;
    const hasSubfolders = folder.subfolderCount > 0;

    return (
        <div
            onClick={onClick}
            className="glass glass-hover rounded-2xl p-4 cursor-pointer group animate-scale-in"
        >
            <div className="relative aspect-video rounded-xl bg-gradient-to-br from-primary-600/20 to-primary-800/20 mb-3 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />
                <Folder className="w-16 h-16 text-primary-400 relative z-10" />
                {hasSubfolders && (
                    <div className="absolute top-2 right-2 bg-primary-500/80 rounded-full px-2 py-1 text-xs font-semibold z-10 flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {folder.subfolderCount}
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center">
                        <ChevronRight className="w-7 h-7 text-white" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                    {folder.name}
                </h3>

                <div className="flex items-center gap-3 text-sm">
                    {hasVideos && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <Video className="w-4 h-4" />
                            <span>{folder.videoCount}</span>
                        </div>
                    )}
                    {hasAudio && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <Music className="w-4 h-4" />
                            <span>{folder.audioCount}</span>
                        </div>
                    )}
                    {!hasVideos && !hasAudio && (
                        <span className="text-gray-500 text-xs">Empty</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FolderCard;
