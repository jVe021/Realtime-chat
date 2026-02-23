import { create } from "zustand";
import type { ConnectionStatus } from "../types/socket.types";

interface TypingUser {
    userId: string;
    username: string;
}

interface SocketState {
    connectionStatus: ConnectionStatus;
    onlineUsers: Set<string>;
    typingUsers: Record<string, TypingUser[]>;

    setConnectionStatus(status: ConnectionStatus): void;
    setOnlineUsers(userIds: Set<string>): void;
    addOnlineUser(userId: string): void;
    removeOnlineUser(userId: string): void;
    addTypingUser(roomId: string, userId: string, username: string): void;
    removeTypingUser(roomId: string, userId: string): void;
    removeAllTypingForUser(userId: string): void;
}

export const useSocketStore = create<SocketState>((set) => ({
    connectionStatus: "disconnected",
    onlineUsers: new Set(),
    typingUsers: {},

    setConnectionStatus: (status) => set({ connectionStatus: status }),

    setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

    addOnlineUser: (userId) => set(state => {
        const newSet = new Set(state.onlineUsers);
        newSet.add(userId);
        return { onlineUsers: newSet };
    }),

    removeOnlineUser: (userId) => set(state => {
        const newSet = new Set(state.onlineUsers);
        newSet.delete(userId);
        return { onlineUsers: newSet };
    }),

    addTypingUser: (roomId, userId, username) => set(state => {
        const usersInRoom = state.typingUsers[roomId] ?? [];
        if (usersInRoom.some(u => u.userId === userId)) return state;
        return {
            typingUsers: {
                ...state.typingUsers,
                [roomId]: [...usersInRoom, { userId, username }]
            }
        };
    }),

    removeTypingUser: (roomId, userId) => set(state => {
        const usersInRoom = state.typingUsers[roomId];
        if (!usersInRoom) return state;
        return {
            typingUsers: {
                ...state.typingUsers,
                [roomId]: usersInRoom.filter(u => u.userId !== userId)
            }
        };
    }),

    removeAllTypingForUser: (userId) => set(state => {
        const newTypingUsers = { ...state.typingUsers };
        let changed = false;

        Object.keys(newTypingUsers).forEach(roomId => {
            const users = newTypingUsers[roomId];
            const filtered = users.filter(u => u.userId !== userId);
            if (filtered.length !== users.length) {
                newTypingUsers[roomId] = filtered;
                changed = true;
            }
        });

        return changed ? { typingUsers: newTypingUsers } : state;
    })
}));