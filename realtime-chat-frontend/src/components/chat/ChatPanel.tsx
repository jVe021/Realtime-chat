import { useChatStore } from '../../store/chat.store';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';

export const ChatPanel = () => {
    const activeRoomId = useChatStore(s => s.activeRoomId);

    if (!activeRoomId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary h-full">
                <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4 text-3xl">
                    💬
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Select a room</h3>
                <p className="text-text-secondary text-center max-w-sm">
                    Choose a conversation from the sidebar or create a new one to start chatting.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] w-full max-w-full overflow-hidden bg-bg-primary relative" style={{ height: 'calc(100vh - 64px)' }}>
            <MessageList />
            <div className="mt-auto shrink-0 w-full relative bg-bg-primary flex flex-col">
                <TypingIndicator roomId={activeRoomId} />
                <MessageInput roomId={activeRoomId} />
            </div>
        </div>
    );
};