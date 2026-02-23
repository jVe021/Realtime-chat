import { create } from "zustand";
import type { Room, CreateRoomPayload } from "../types/room.types";
import type { Message } from "../types/message.types";
import { roomApi } from "../services/room.api";
import { messageApi } from "../services/message.api";
import { socketService } from "../services/socket.service";

interface ChatState {
    rooms: Room[];
    activeRoomId: string | null;
    messages: Record<string, Message[]>;
    isLoadingRooms: boolean;
    isLoadingMessages: boolean;
    hasMoreMessages: Record<string, boolean>;
    currentPage: Record<string, number>;

    loadRooms(): Promise<void>;
    setActiveRoom(roomId: string | null): void;
    loadMessages(roomId: string): Promise<void>;
    loadMoreMessages(roomId: string): Promise<void>;
    addMessage(message: Message): void;
    addOptimisticMessage(message: Message): void;
    confirmOptimisticMessage(tempId: string, realMessage: Message): void;
    createRoom(payload: CreateRoomPayload): Promise<Room>;
    addRoom(room: Room): void;
    leaveRoom(roomId: string): Promise<void>;
    removeRoom(roomId: string): void;
    updateRoom(room: Room): void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    rooms: [],
    activeRoomId: null,
    messages: {},
    isLoadingRooms: false,
    isLoadingMessages: false,
    hasMoreMessages: {},
    currentPage: {},

    loadRooms: async () => {
        set({ isLoadingRooms: true });
        try {
            const rooms = await roomApi.getRooms();
            set({ rooms, isLoadingRooms: false });
        } catch {
            set({ isLoadingRooms: false });
        }
    },

    setActiveRoom: (roomId) => {
        const prev = get().activeRoomId;
        if (prev === roomId) return;
        if (prev) socketService.leaveRoom(prev);
        set({ activeRoomId: roomId });
        if (roomId) {
            socketService.joinRoom(roomId);
            if (!get().messages[roomId]?.length) {
                get().loadMessages(roomId);
            }
        }
    },

    loadMessages: async (roomId) => {
        set({ isLoadingMessages: true });
        try {
            const data = await messageApi.getMessages(roomId, 1);
            set(state => ({
                messages: { ...state.messages, [roomId]: data.messages },
                hasMoreMessages: { ...state.hasMoreMessages, [roomId]: data.hasMore },
                currentPage: { ...state.currentPage, [roomId]: 1 },
                isLoadingMessages: false,
            }));
        } catch {
            set({ isLoadingMessages: false });
        }
    },

    loadMoreMessages: async (roomId) => {
        if (get().hasMoreMessages[roomId] === false) return;
        const nextPage = (get().currentPage[roomId] ?? 1) + 1;
        try {
            const data = await messageApi.getMessages(roomId, nextPage);
            set(state => ({
                messages: {
                    ...state.messages,
                    [roomId]: [...data.messages, ...(state.messages[roomId] ?? [])],
                },
                hasMoreMessages: { ...state.hasMoreMessages, [roomId]: data.hasMore },
                currentPage: { ...state.currentPage, [roomId]: nextPage },
            }));
        } catch (error) {
            console.error("loadMoreMessages error:", error);
        }
    },

    addMessage: (message) => {
        set(state => {
            const existing = state.messages[message.roomId] ?? [];
            if (existing.some(m => m.id === message.id)) return state;
            if (message.tempId) {
                const filtered = existing.filter(m => m.id !== message.tempId);
                return {
                    messages: {
                        ...state.messages,
                        [message.roomId]: [...filtered, message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
                    },
                };
            }
            return {
                messages: {
                    ...state.messages,
                    [message.roomId]: [...existing, message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
                },
            };
        });
    },

    addOptimisticMessage: (message) => {
        set(state => ({
            messages: {
                ...state.messages,
                [message.roomId]: [...(state.messages[message.roomId] ?? []), message],
            },
        }));
    },

    confirmOptimisticMessage: (tempId, realMessage) => {
        set(state => {
            const roomId = realMessage.roomId;
            const existing = state.messages[roomId] ?? [];
            const hasOptimistic = existing.some(m => m.id === tempId);

            if (!hasOptimistic) {
                return {
                    messages: {
                        ...state.messages,
                        [roomId]: [...existing, { ...realMessage, isOptimistic: false }].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
                    }
                };
            }

            return {
                messages: {
                    ...state.messages,
                    [roomId]: existing.map(m => m.id === tempId ? { ...realMessage, isOptimistic: false } : m),
                }
            };
        });
    },

    createRoom: async (payload) => {
        const newRoom = await roomApi.createRoom(payload);
        set(state => ({
            rooms: [newRoom, ...state.rooms]
        }));
        return newRoom;
    },

    addRoom: (room) => {
        set(state => {
            if (state.rooms.find(r => r.id === room.id)) return state;
            return { rooms: [room, ...state.rooms] };
        });
    },

    leaveRoom: async (roomId) => {
        await roomApi.leaveRoom(roomId);
        const { activeRoomId } = get();
        if (activeRoomId === roomId) {
            socketService.leaveRoom(roomId);
            set({ activeRoomId: null });
        }
        set(state => ({
            rooms: state.rooms.filter(r => r.id !== roomId),
            messages: { ...state.messages, [roomId]: [] },
        }));
    },

    removeRoom: (roomId) => {
        const { activeRoomId } = get();
        if (activeRoomId === roomId) {
            socketService.leaveRoom(roomId);
            set({ activeRoomId: null });
        }
        set(state => ({
            rooms: state.rooms.filter(r => r.id !== roomId),
            messages: { ...state.messages, [roomId]: [] },
        }));
    },

    updateRoom: (room) => {
        set(state => ({
            rooms: state.rooms.map(r => r.id === room.id ? room : r),
        }));
    },
}));