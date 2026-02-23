import { useMemo, memo } from 'react';
import { usePresence } from '../../hooks/usePresence';
import { useAuthStore } from '../../store/auth.store';
import type { User } from '../../types/user.types';

interface UserItemProps {
    user: User;
    isMe: boolean;
    online: boolean;
}

const UserItem = memo(({ user, isMe, online }: UserItemProps) => {
    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-tertiary transition-colors">
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-primary font-semibold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg-secondary ${online ? 'bg-success' : 'bg-text-muted'
                        }`}
                />
            </div>

            <div className="flex-1 truncate">
                <span className={`font-medium ${isMe ? 'text-accent' : 'text-text-primary'}`}>
                    {user.username}
                </span>
                {isMe && (
                    <span className="ml-1 text-xs text-text-muted">
                        (you)
                    </span>
                )}
            </div>
        </div>
    );
});
UserItem.displayName = 'UserItem';

interface UserListProps {
    users: User[];
}

export const UserList = ({ users }: UserListProps) => {
    const { isOnline } = usePresence();
    const currentUser = useAuthStore(s => s.user);

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            // Current user always first
            if (a.id === currentUser?.id) return -1;
            if (b.id === currentUser?.id) return 1;

            // Then online users
            const aOnline = isOnline(a.id);
            const bOnline = isOnline(b.id);
            if (aOnline && !bOnline) return -1;
            if (!aOnline && bOnline) return 1;

            // Then alphabetical
            return a.username.localeCompare(b.username);
        });
    }, [users, currentUser?.id, isOnline]);

    return (
        <div className="flex flex-col w-64 bg-bg-secondary border-l border-border h-full overflow-y-auto shrink-0">
            <div className="px-4 py-3 border-b border-border bg-bg-secondary sticky top-0 z-10 shrink-0">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Members ({users.length})
                </h3>
            </div>

            <div className="p-2 space-y-1">
                {sortedUsers.map(user => (
                    <UserItem
                        key={user.id}
                        user={user}
                        isMe={user.id === currentUser?.id}
                        online={isOnline(user.id)}
                    />
                ))}
            </div>
        </div>
    );
};