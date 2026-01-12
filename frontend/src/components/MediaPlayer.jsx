import React from 'react';
import { X } from 'lucide-react';

const MediaPlayer = ({ media, onClose }) => {
    if (!media) return null;

    const streamUrl = `http://localhost:5000/api/stream/${media.id}`;
    const isVideo = media.type === 'video';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-5xl mx-4 glass rounded-3xl p-6 animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full glass glass-hover flex items-center justify-center z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{media.name}</h2>
                    <div className="flex gap-3 text-sm text-gray-400">
                        <span className="uppercase font-medium">{media.extension}</span>
                        <span>•</span>
                        <span>{media.type}</span>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-black">
                    {isVideo ? (
                        <video
                            controls
                            autoPlay
                            className="w-full max-h-[70vh]"
                            src={streamUrl}
                        >
                            Your browser does not support video playback.
                        </video>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-primary-900/20 to-primary-700/20">
                            <div className="w-32 h-32 rounded-full bg-primary-500/20 flex items-center justify-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-primary-500/30 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <audio
                                controls
                                autoPlay
                                className="w-full max-w-md"
                                src={streamUrl}
                            >
                                Your browser does not support audio playback.
                            </audio>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaPlayer;
