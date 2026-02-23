import { useMemo } from 'react';
import { useTyping } from '../../hooks/useTyping';
import { useAuthStore } from '../../store/auth.store';

interface TypingIndicatorProps {
    roomId: string;
}

export const TypingIndicator = ({ roomId }: TypingIndicatorProps) => {
    const { typingUsers } = useTyping(roomId);
    const currentUser = useAuthStore(s => s.user);

    const otherTypingUsers = useMemo(() => {
        return typingUsers.filter(u => u.userId !== currentUser?.id);
    }, [typingUsers, currentUser?.id]);

    if (otherTypingUsers.length === 0) {
        return <div className="h-0 overflow-hidden transition-all duration-300 ease-in-out" />;
    }

    let text = '';
    if (otherTypingUsers.length === 1) {
        text = `${otherTypingUsers[0].username} is typing`;
    } else if (otherTypingUsers.length === 2) {
        text = `${otherTypingUsers[0].username}, ${otherTypingUsers[1].username} are typing`;
    } else {
        text = 'Several people are typing';
    }

    return (
        <div className="px-6 py-2 bg-bg-primary h-8 flex items-center gap-2 transition-all duration-300 ease-in-out">
            <span className="text-xs text-text-muted italic flex items-center gap-1">
                {text}
                <span className="inline-flex gap-[2px] ml-1">
                    <span className="w-1 h-1 bg-text-muted rounded-full typing-dot"></span>
                    <span className="w-1 h-1 bg-text-muted rounded-full typing-dot" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-1 bg-text-muted rounded-full typing-dot" style={{ animationDelay: '0.4s' }}></span>
                </span>
            </span>
        </div>
    );
};