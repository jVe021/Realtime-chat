import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useChat } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../../types/message.types';

export const MessageList = () => {
    const { messages, loadMore, hasMore, isLoading } = useChat();
    const user = useAuthStore(s => s.user);

    const containerRef = useRef<HTMLDivElement>(null);
    const isNearBottom = useRef(true);
    const prevScrollHeight = useRef(0);

    // Group messages by date
    const groupedMsgs = useMemo(() => {
        const groups: { date: string; messages: Message[] }[] = [];
        if (messages.length === 0) return groups;

        let currentDateStr = '';
        let currentGroup: Message[] = [];

        messages.forEach((msg) => {
            const dateObj = new Date(msg.createdAt);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let dateLabel = '';
            if (dateObj.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
            } else if (dateObj.toDateString() === yesterday.toDateString()) {
                dateLabel = 'Yesterday';
            } else {
                dateLabel = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
            }

            if (dateLabel !== currentDateStr) {
                if (currentGroup.length > 0) {
                    groups.push({ date: currentDateStr, messages: currentGroup });
                }
                currentDateStr = dateLabel;
                currentGroup = [msg];
            } else {
                currentGroup.push(msg);
            }
        });

        if (currentGroup.length > 0) {
            groups.push({ date: currentDateStr, messages: currentGroup });
        }
        return groups;
    }, [messages]);

    const onScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;

        // Infinite scroll up
        if (el.scrollTop === 0 && hasMore && !isLoading) {
            prevScrollHeight.current = el.scrollHeight;
            loadMore();
        }
    }, [hasMore, isLoading, loadMore]);

    // Auto-scroll on new messages
    useEffect(() => {
        const el = containerRef.current;
        if (el && isNearBottom.current) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
    }, [messages.length]);

    // Preserve scroll on history load
    useEffect(() => {
        const el = containerRef.current;
        if (el && prevScrollHeight.current > 0) {
            el.scrollTop = el.scrollHeight - prevScrollHeight.current;
            prevScrollHeight.current = 0;
        }
    }, [messages]);

    return (
        <div
            ref={containerRef}
            onScroll={onScroll}
            className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
        >
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full min-h-full justify-end">
                {isLoading && messages.length === 0 && (
                    <div className="flex flex-col gap-4 w-full px-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`flex flex-col gap-1 w-full max-w-[75%] ${i % 2 === 0 ? 'self-end items-end' : 'self-start'}`}>
                                <div className={`h-4 w-24 bg-bg-tertiary rounded animate-pulse ${i % 2 === 0 ? 'mr-2' : 'ml-12'}`}></div>
                                <div className="flex gap-2 items-end w-full">
                                    {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-bg-tertiary animate-pulse shrink-0"></div>}
                                    <div className={`h-16 bg-bg-tertiary rounded-2xl animate-pulse w-full ${i % 2 === 0 ? 'rounded-br-sm' : 'rounded-bl-sm'
                                        }`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && messages.length > 0 && (
                    <div className="py-2 text-center text-xs text-text-muted">
                        {isLoading ? 'Loading older messages...' : 'Scroll up to load more'}
                    </div>
                )}

                {groupedMsgs.map((group: { date: string; messages: Message[] }) => (
                    <div key={group.date} className="flex flex-col gap-4 w-full">
                        <div className="flex justify-center my-2">
                            <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1 rounded-full border border-border shadow-sm">
                                {group.date}
                            </span>
                        </div>
                        {group.messages.map((msg: Message) => (
                            <MessageBubble
                                key={msg.tempId || msg.id}
                                message={msg}
                                isOwnMessage={msg.senderId === user?.id}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};