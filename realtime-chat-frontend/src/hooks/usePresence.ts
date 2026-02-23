import { useCallback, useMemo } from "react";
import { useSocketStore } from "../store/socket.store";

export const usePresence = () => {
    const onlineUsers = useSocketStore(s => s.onlineUsers);

    const isOnline = useCallback(
        (userId: string) => onlineUsers.has(userId),
        [onlineUsers]
    );

    const onlineCount = useMemo(() => onlineUsers.size, [onlineUsers]);

    return { onlineUsers, isOnline, onlineCount };
};