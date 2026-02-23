import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { useSocketStore } from '../../store/socket.store';
import { useChat } from '../../hooks/useChat';
import { useTyping } from '../../hooks/useTyping';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { uploadApi } from '../../services/upload.api';

interface MessageInputProps {
    roomId: string;
}

export const MessageInput = ({ roomId }: MessageInputProps) => {
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const { sendMessage } = useChat();
    const { handleTypingChange } = useTyping(roomId);
    const connectionStatus = useSocketStore(s => s.connectionStatus);

    const isConnected = connectionStatus === 'connected';

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [content]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = async () => {
        if ((!content.trim() && !imageFile) || !isConnected || isUploading) return;

        let imageUrl = undefined;
        setIsUploading(true);
        try {
            if (imageFile) {
                const res = await uploadApi.uploadImage(imageFile);
                imageUrl = res.imageUrl;
            }
            sendMessage(content, imageUrl);
            setContent('');
            setImageFile(null);
            setImagePreview(null);
            setShowEmojiPicker(false);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.focus();
            }
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        handleTypingChange();
    };

    const handleEmojiClick = (emojiData: any) => {
        setContent(prev => prev + emojiData.emoji);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const isSendDisabled = (!content.trim() && !imageFile) || !isConnected || isUploading;

    return (
        <div className="p-4 bg-bg-primary border-t border-border flex flex-col gap-2 relative">
            {imagePreview && (
                <div className="max-w-4xl mx-auto w-full relative">
                    <div className="relative inline-block border border-border rounded-xl overflow-hidden bg-bg-tertiary p-2">
                        <img src={imagePreview} alt="preview" className="max-h-32 object-contain rounded-lg" />
                        <button
                            onClick={removeImage}
                            disabled={isUploading}
                            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-end gap-2 max-w-4xl mx-auto w-full relative">
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-full mb-2 left-0 z-50 shadow-xl rounded-lg">
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} />
                    </div>
                )}

                <div className="flex flex-1 items-end bg-bg-tertiary border border-border rounded-xl transition-shadow focus-within:ring-2 focus-within:ring-accent/50 max-h-[120px]">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-3 transition-colors ${showEmojiPicker ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
                        aria-label="Add emoji"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-text-muted hover:text-accent transition-colors"
                        aria-label="Attach image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        className="hidden"
                    />

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={!isConnected || isUploading}
                        placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
                        className="flex-1 max-h-[110px] min-h-[44px] bg-transparent text-text-primary px-2 py-3 focus:outline-none disabled:opacity-50 resize-none overflow-y-auto hide-scrollbar"
                        rows={1}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    className={`shrink-0 w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all duration-200 ${!isSendDisabled
                        ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20'
                        : 'bg-bg-tertiary text-text-muted cursor-not-allowed border border-border'
                        }`}
                    aria-label="Send message"
                >
                    {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    )}
                </button>
            </div>
        </div>
    );
};