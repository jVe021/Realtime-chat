import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useChatStore } from '../../store/chat.store';
import { usePresence } from '../../hooks/usePresence';
import type { Room } from '../../types/room.types';
import { CreateRoomModal } from '../modals/CreateRoomModal';
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RoomItemProps {
    room: Room;
    roomName: string;
    isActive: boolean;
    isOnline: boolean;
    onClick: () => void;
}

const RoomItem = memo(({ room, roomName, isActive, isOnline, onClick }: RoomItemProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-all duration-200 ${isActive
                ? 'bg-accent/10 text-accent shadow-sm ring-1 ring-accent/30'
                : 'text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary'
                }`}
        >
            <div className="relative">
                <span className="text-lg">
                    {room.type === 'group' ? '👥' : '👤'}
                </span>
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-secondary"></span>
                )}
            </div>
            <span className="font-medium truncate flex-1 block">
                {roomName}
            </span>
        </button>
    );
});
RoomItem.displayName = 'RoomItem';

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useAuthStore(s => s.user);
    const logout = useAuthStore(s => s.logout);
    const rooms = useChatStore(s => s.rooms);
    const isLoadingRooms = useChatStore(s => s.isLoadingRooms);
    const activeRoomId = useChatStore(s => s.activeRoomId);
    const { isOnline, onlineCount } = usePresence();
    const navigate = useNavigate();

    const handleRoomClick = (roomId: string) => {
        navigate(`/chat/${roomId}`);
        onClose();
    };

    const getRoomName = (room: Room) => {
        if (room.type === 'group') return room.name;
        const otherUser = room.participants?.find((p: any) => p.id !== user?.id);
        return otherUser ? otherUser.username : 'Unknown User';
    };

    const isRoomOnline = (room: Room) => {
        if (room.type === 'private') {
            const otherUser = room.participants?.find((p: any) => p.id !== user?.id);
            return otherUser ? isOnline(otherUser.id) : false;
        }
        // For groups, check if any participant (other than me) is online
        return room.participants?.some((p: any) => p.id !== user?.id && isOnline(p.id)) ?? false;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-bg-secondary border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                        💬 Chat App
                    </h2>
                    <div className="mt-2 text-sm text-text-secondary flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        Online: {onlineCount}
                    </div>
                </div>

                {/* Rooms List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <button
                        className="w-full py-2 px-4 bg-bg-tertiary hover:bg-bg-tertiary-hover text-accent text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors border border-border"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + New Room
                    </button>

                    <div>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                            Rooms
                        </h3>
                        <div className="space-y-1">
                            {isLoadingRooms ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 w-full animate-pulse transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-bg-tertiary shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="h-4 w-24 bg-bg-tertiary rounded mb-2"></div>
                                            <div className="h-3 w-32 bg-bg-tertiary rounded"></div>
                                        </div>
                                    </div>
                                ))
                            ) : rooms.map(room => {
                                const isActive = activeRoomId === room.id;
                                const isRoomUserOnline = isRoomOnline(room);
                                const roomName = getRoomName(room);

                                return (
                                    <RoomItem
                                        key={room.id}
                                        room={room}
                                        roomName={roomName}
                                        isActive={isActive}
                                        isOnline={isRoomUserOnline}
                                        onClick={() => handleRoomClick(room.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* User Section */}
                <div className="p-4 border-t border-border mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-text-primary truncate">
                                {user?.username}
                            </span>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                            aria-label="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </div>
            </aside>

            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};