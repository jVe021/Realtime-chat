import { useCallback } from "react";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../store/auth.store";
import { socketService } from "../services/socket.service";

export const useChat = () => {
    const activeRoomId = useChatStore(s => s.activeRoomId);

    // Selective subscription — only messages for active room
    const messagesRaw = useChatStore(
        useCallback(s => s.messages[activeRoomId ?? ""], [activeRoomId])
    );
    const messages = messagesRaw || [];

    const hasMoreRaw = useChatStore(
        useCallback(s => s.hasMoreMessages[activeRoomId ?? ""], [activeRoomId])
    );
    const hasMore = hasMoreRaw ?? true;

    const isLoading = useChatStore(s => s.isLoadingMessages);

    const sendMessage = useCallback((content: string, imageUrl?: string) => {
        if (!activeRoomId || (!content.trim() && !imageUrl)) return;

        const user = useAuthStore.getState().user;
        if (!user) return;

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Optimistic: show message immediately
        useChatStore.getState().addOptimisticMessage({
            id: tempId,
            tempId,
            roomId: activeRoomId,
            senderId: user.id,
            senderUsername: user.username,
            content: content.trim(),
            imageUrl,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        });

        // Send via WebSocket
        socketService.sendMessage(activeRoomId, content.trim(), tempId, imageUrl);
    }, [activeRoomId]);

    const loadMore = useCallback(() => {
        if (!activeRoomId) return;
        useChatStore.getState().loadMoreMessages(activeRoomId);
    }, [activeRoomId]);

    return { messages, sendMessage, loadMore, hasMore, isLoading, activeRoomId };
};