import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useChatStore } from '../../store/chat.store';
import { userApi } from '../../services/user.api';
import type { User } from '../../types/user.types';
import type { RoomType } from '../../types/room.types';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateRoomModal = ({ isOpen, onClose }: CreateRoomModalProps) => {
    const navigate = useNavigate();
    const createRoom = useChatStore(s => s.createRoom);

    const [type, setType] = useState<RoomType>('private');
    const [name, setName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await userApi.searchUsers(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error('Failed to search users', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset when modal closes or type changes
    useEffect(() => {
        if (!isOpen) {
            setType('private');
            setName('');
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUsers([]);
        } else {
            // If it opens and type changes, reset selections
            setSelectedUsers([]);
            setSearchQuery('');
        }
    }, [isOpen, type]);

    const toggleUser = (user: User) => {
        const isSelected = selectedUsers.some(u => u.id === user.id);

        if (isSelected) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            if (type === 'private') {
                setSelectedUsers([user]);
            } else {
                setSelectedUsers(prev => [...prev, user]);
            }
        }
    };

    const removeUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleSubmit = async () => {
        if (type === 'private' && selectedUsers.length !== 1) {
            toast.error('Please select exactly one user for a private chat');
            return;
        }
        if (type === 'group') {
            if (!name.trim()) {
                toast.error('Group name is required');
                return;
            }
            if (selectedUsers.length === 0) {
                toast.error('Please select at least one participant');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const participantIds = selectedUsers.map(u => u.id);
            const newRoom = await createRoom({
                name: type === 'group' ? name.trim() : undefined,
                type,
                participantIds
            });

            toast.success('Room created successfully!');
            onClose();
            navigate(`/chat/${newRoom.id}`);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create room';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-bg-secondary border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        {type === 'private' ? '👤 New Private Chat' : '👥 New Group Chat'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">

                    {/* Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Room Type</label>
                        <div className="flex p-1 bg-bg-tertiary rounded-lg border border-border">
                            <button
                                type="button"
                                onClick={() => setType('private')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'private' ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'
                                    }`}
                            >
                                Private
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('group')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'group' ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'
                                    }`}
                            >
                                Group
                            </button>
                        </div>
                    </div>

                    {/* Group Name */}
                    {type === 'group' && (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Group Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Design Team"
                                className="w-full bg-bg-tertiary border border-border text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
                            />
                        </div>
                    )}

                    {/* Participants Search */}
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Add Participants {type === 'private' ? '(Select 1)' : ''}
                        </label>

                        <div className="relative mb-2 shrink-0">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="🔍 Search users by username or email..."
                                className="w-full bg-bg-tertiary border border-border text-text-primary rounded-lg px-3 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                                🔍
                            </span>
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 overflow-y-auto min-h-[120px] max-h-[160px] border border-border rounded-lg bg-bg-tertiary/50">
                            {isSearching ? (
                                <div className="p-3 text-center text-sm text-text-muted">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {searchResults.map(user => {
                                        const isSelected = selectedUsers.some(u => u.id === user.id);
                                        return (
                                            <li
                                                key={user.id}
                                                className={`flex items-center gap-2 p-2 px-3 cursor-pointer hover:bg-bg-tertiary transition-colors ${isSelected ? 'bg-accent/10' : ''
                                                    }`}
                                                onClick={() => toggleUser(user)}
                                            >
                                                <input
                                                    type={type === 'private' ? 'radio' : 'checkbox'}
                                                    checked={isSelected}
                                                    readOnly
                                                    className="w-4 h-4 accent-accent"
                                                />
                                                <div className="w-6 h-6 rounded-full bg-bg-secondary flex items-center justify-center text-xs font-bold text-text-primary">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-sm font-medium text-text-primary">{user.username}</span>
                                                    <span className="text-xs text-text-muted">{user.email}</span>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : searchQuery.trim() ? (
                                <div className="p-3 text-center text-sm text-text-muted">No users found.</div>
                            ) : (
                                <div className="p-3 text-center text-sm text-text-muted">Type to search users...</div>
                            )}
                        </div>
                    </div>

                    {/* Selected Tags */}
                    {selectedUsers.length > 0 && (
                        <div className="shrink-0">
                            <div className="text-xs font-semibold text-text-muted mb-1">Selected:</div>
                            <div className="flex flex-wrap gap-1">
                                {selectedUsers.map(u => (
                                    <span
                                        key={u.id}
                                        className="inline-flex items-center gap-1 bg-bg-tertiary border border-border text-xs text-text-primary pl-2 pr-1 py-1 rounded-full"
                                    >
                                        {u.username}
                                        <button
                                            onClick={() => removeUser(u.id)}
                                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-bg-secondary text-text-muted hover:text-error transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-border shrink-0 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedUsers.length === 0 || (type === 'group' && !name.trim())}
                        className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        Create Room
                    </button>
                </div>

            </div>
        </div>
    );
};