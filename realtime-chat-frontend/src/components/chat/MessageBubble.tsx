import { memo } from 'react';
import type { Message } from '../../types/message.types';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
}

export const MessageBubble = memo(({ message, isOwnMessage }: MessageBubbleProps) => {
    const timeString = new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    const isUploading = message.isOptimistic && message.imageUrl;
    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://realtime-chat-backend-p283.onrender.com" : "http://localhost:5000");
        return `${apiUrl}${url}`;
    };

    if (isOwnMessage) {
        return (
            <div className={`flex flex-col items-end w-full message-enter ${message.isOptimistic ? 'opacity-70' : ''}`}>
                <div className="max-w-[70%] bg-accent text-white px-4 py-2 rounded-2xl rounded-tr-sm shadow-sm flex flex-col gap-1">
                    {message.imageUrl && (
                        <div className="relative rounded-lg overflow-hidden max-h-60 mb-1 mt-1 bg-black/10">
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                            <img src={getImageUrl(message.imageUrl)} alt="attachment" className="max-w-full max-h-60 object-contain rounded-lg" />
                        </div>
                    )}
                    {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                    <div className="text-[10px] text-right mt-1 opacity-70">
                        {timeString}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start w-full message-enter">
            <div className="max-w-[70%] bg-bg-tertiary text-text-primary px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm flex flex-col gap-1">
                <div className="text-xs font-semibold text-accent-light mb-1">
                    {message.senderUsername}
                </div>
                {message.imageUrl && (
                    <div className="rounded-lg overflow-hidden max-h-60 mb-1 bg-black/5">
                        <img src={getImageUrl(message.imageUrl)} alt="attachment" className="max-w-full max-h-60 object-contain rounded-lg" />
                    </div>
                )}
                {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                <div className="text-[10px] text-right mt-1 text-text-muted">
                    {timeString}
                </div>
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';