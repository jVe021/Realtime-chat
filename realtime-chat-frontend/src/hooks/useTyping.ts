import { useCallback, useEffect, useRef } from "react";
import { useSocketStore } from "../store/socket.store";
import { socketService } from "../services/socket.service";

export const useTyping = (roomId: string | null) => {
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);

    // Selective subscription
    const typingUsersRaw = useSocketStore(
        useCallback(s => s.typingUsers[roomId ?? ""], [roomId])
    );
    const typingUsers = typingUsersRaw || [];

    const handleTypingChange = useCallback(() => {
        if (!roomId) return;

        // Send START_TYPING only if not already in typing state
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socketService.startTyping(roomId);
        }

        // Reset the stop timer
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Auto-stop after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            socketService.stopTyping(roomId);
        }, 2000);
    }, [roomId]);

    // Cleanup: send STOP_TYPING when switching rooms or unmounting
    useEffect(() => {
        return () => {
            if (isTypingRef.current && roomId) {
                socketService.stopTyping(roomId);
                isTypingRef.current = false;
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [roomId]);

    return { typingUsers, handleTypingChange };
};