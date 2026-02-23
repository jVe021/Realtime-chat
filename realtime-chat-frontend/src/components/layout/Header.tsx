import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSocketStore } from '../../store/socket.store';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import type { Room } from '../../types/room.types';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
    const connectionStatus = useSocketStore(s => s.connectionStatus);
    const activeRoomId = useChatStore(s => s.activeRoomId);
    const rooms = useChatStore(s => s.rooms);
    const leaveRoom = useChatStore(s => s.leaveRoom);
    const user = useAuthStore(s => s.user);
    const [isLeaving, setIsLeaving] = useState(false);

    const activeRoom = rooms.find(r => r.id === activeRoomId);

    const getRoomName = (room?: Room) => {
        if (!room) return 'Select a room';
        if (room.type === 'group') return room.name;
        const otherUser = room.participants?.find((p: any) => p.id !== user?.id);
        return otherUser ? otherUser.username : 'Unknown User';
    };

    const handleLeaveRoom = async () => {
        if (!activeRoomId) return;
        const roomName = getRoomName(activeRoom);
        const confirmed = window.confirm(`Leave "${roomName}"? This will remove the room and clear all messages for you.`);
        if (!confirmed) return;

        setIsLeaving(true);
        try {
            await leaveRoom(activeRoomId);
            toast.success(`Left "${roomName}"`);
        } catch {
            toast.error('Failed to leave room');
        } finally {
            setIsLeaving(false);
        }
    };

    const getStatusDisplay = () => {
        switch (connectionStatus) {
            case 'connected':
                return { color: 'bg-success', text: 'Connected' };
            case 'connecting':
                return { color: 'bg-warning', text: 'Connecting...' };
            case 'reconnecting':
                return { color: 'bg-warning animate-pulse', text: 'Reconnecting...' };
            case 'disconnected':
                return { color: 'bg-error', text: 'Disconnected' };
            default:
                return { color: 'bg-error', text: 'Disconnected' };
        }
    };

    const status = getStatusDisplay();

    return (
        <header className="h-16 border-b border-border bg-bg-secondary flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>

                <div>
                    <h1 className="font-semibold text-text-primary text-lg">
                        {getRoomName(activeRoom)}
                    </h1>
                    {activeRoom?.type === 'group' && (
                        <p className="text-xs text-text-secondary">
                            {activeRoom.participants?.length || 0} members
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">

                {activeRoom?.type === 'group' && activeRoom.participants && (
                    <div className="hidden sm:flex -space-x-2">
                        {activeRoom.participants.slice(0, 3).map((p: any) => (
                            <div key={p.id} className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-secondary flex items-center justify-center text-xs font-semibold text-text-primary" title={p.username}>
                                {p.username.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {activeRoom.participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-secondary flex items-center justify-center text-xs font-semibold text-text-primary z-10">
                                +{activeRoom.participants.length - 3}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 bg-bg-tertiary px-3 py-1.5 rounded-full">
                    <span className={`w-2.5 h-2.5 rounded-full ${status.color}`}></span>
                    <span className="text-xs font-medium text-text-secondary hidden sm:inline-block">
                        {status.text}
                    </span>
                </div>

                {activeRoom && (
                    <button
                        onClick={handleLeaveRoom}
                        disabled={isLeaving}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Leave room"
                        aria-label="Leave room"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    );
};