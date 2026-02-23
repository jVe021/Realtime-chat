import toast from "react-hot-toast";
import type { ClientEvent } from "../types/socket.types";
import { useSocketStore } from "../store/socket.store";
import { useChatStore } from "../store/chat.store";

class SocketService {
    private socket: WebSocket | null = null;
    private token: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private isIntentionalClose = false;

    connect(token: string): void {
        // Prevent duplicate connections
        if (this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING) {
            return;
        }

        this.token = token;
        this.isIntentionalClose = false;

        useSocketStore.getState().setConnectionStatus("connecting");

        const apiUrl = import.meta.env.VITE_API_URL;
        let url = "";

        if (apiUrl) {
            url = apiUrl.replace(/^http/, 'ws');
        } else {
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const host = import.meta.env.DEV ? "localhost:5000" : window.location.host;
            url = `${protocol}//${host}`;
        }

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.send({ type: "AUTHENTICATE", payload: { token } });
        };

        this.socket.onmessage = (event) => this.handleMessage(event);
        this.socket.onclose = (event) => this.handleClose(event);
        this.socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };
    }

    disconnect(): void {
        this.isIntentionalClose = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        const store = useSocketStore.getState();
        store.setConnectionStatus("disconnected");
        store.setOnlineUsers(new Set());
    }

    send(event: ClientEvent): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.warn("Cannot send, socket not connected");
            return;
        }
        this.socket.send(JSON.stringify(event));
    }

    // Convenience methods
    joinRoom(roomId: string): void {
        this.send({ type: "JOIN_ROOM", payload: { roomId } });
    }

    leaveRoom(roomId: string): void {
        this.send({ type: "LEAVE_ROOM", payload: { roomId } });
    }

    sendMessage(roomId: string, content: string, tempId: string, imageUrl?: string) {
        this.send({
            type: "SEND_MESSAGE",
            payload: { roomId, content, tempId, imageUrl },
        });
    }

    startTyping(roomId: string): void {
        this.send({ type: "START_TYPING", payload: { roomId } });
    }

    stopTyping(roomId: string): void {
        this.send({ type: "STOP_TYPING", payload: { roomId } });
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data);
            const { type, payload } = data;

            const socketStore = useSocketStore.getState();
            const chatStore = useChatStore.getState();

            switch (type) {
                case "AUTHENTICATED":
                    socketStore.setConnectionStatus("connected");
                    if (chatStore.activeRoomId) {
                        this.joinRoom(chatStore.activeRoomId);
                    }
                    break;

                case "ONLINE_USERS":
                    socketStore.setOnlineUsers(new Set(payload.userIds));
                    break;

                case "MESSAGE":
                    if (payload.tempId) {
                        chatStore.confirmOptimisticMessage(payload.tempId, payload);
                    } else {
                        chatStore.addMessage(payload);
                    }
                    break;

                case "USER_ONLINE":
                    socketStore.addOnlineUser(payload.userId);
                    break;

                case "USER_OFFLINE":
                    socketStore.removeOnlineUser(payload.userId);
                    socketStore.removeAllTypingForUser(payload.userId);
                    break;

                case "TYPING":
                    socketStore.addTypingUser(payload.roomId, payload.userId, payload.username);
                    break;

                case "STOP_TYPING":
                    socketStore.removeTypingUser(payload.roomId, payload.userId);
                    break;

                case "ROOM_CREATED":
                    chatStore.addRoom(payload);
                    toast.success(`New chat: ${payload.name}`);
                    break;

                case "ROOM_DELETED":
                    chatStore.removeRoom(payload.roomId);
                    toast(`A chat room was removed`, { icon: '🗑️' });
                    break;

                case "ROOM_UPDATED":
                    chatStore.updateRoom(payload);
                    break;

                case "ROOM_JOINED":
                    console.log(`Joined room: ${payload.roomId}`);
                    break;

                case "ROOM_LEFT":
                    console.log(`Left room: ${payload.roomId}`);
                    break;

                case "ERROR":
                    toast.error(payload.message || "WebSocket error");
                    break;
            }
        } catch (error) {
            console.error("Failed to parse WS message:", error);
        }
    }

    private handleClose(_event: CloseEvent): void {
        useSocketStore.getState().setConnectionStatus("disconnected");

        if (this.isIntentionalClose) return;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            useSocketStore.getState().setConnectionStatus("reconnecting");
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            this.reconnectAttempts++;
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
            this.reconnectTimer = setTimeout(() => {
                if (this.token) this.connect(this.token);
            }, delay);
        } else {
            toast.error("Connection lost. Please refresh the page.");
        }
    }
}

export const socketService = new SocketService();