import { WebSocketServer } from "ws";
import { AuthenticatedSocket, SocketEvent } from "../types/types";
import {
    handleAuthenticate, handleJoinRoom, handleLeaveRoom,
    handleSendMessage, handleStartTyping, handleStopTyping
} from "./events";

// In-memory registries
const userSockets = new Map<string, Set<AuthenticatedSocket>>();
const roomMembers = new Map<string, Set<string>>();

export const sendToSocket = (socket: AuthenticatedSocket, event: SocketEvent): void => {
    if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(event));
    }
};

export const broadcastToAll = (event: SocketEvent, excludeUserId?: string): void => {
    userSockets.forEach((sockets, userId) => {
        if (userId === excludeUserId) return;
        sockets.forEach(socket => sendToSocket(socket, event));
    });
};

export const broadcastToRoom = (roomId: string, event: SocketEvent, excludeUserId?: string): void => {
    const members = roomMembers.get(roomId);
    if (!members) return;

    members.forEach(userId => {
        if (userId === excludeUserId) return;
        const sockets = userSockets.get(userId);
        if (sockets) {
            sockets.forEach(socket => sendToSocket(socket, event));
        }
    });
};

export const sendToUser = (userId: string, event: SocketEvent): void => {
    const sockets = userSockets.get(userId);
    if (sockets) {
        sockets.forEach(socket => sendToSocket(socket, event));
    }
};

export const getOnlineUserIds = (): string[] => {
    return Array.from(userSockets.keys());
};

export const addUserSocket = (userId: string, socket: AuthenticatedSocket): boolean => {
    const isFirstSocket = !userSockets.has(userId);
    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket);
    return isFirstSocket; // true = user was offline, now online
};

export const removeUserSocket = (userId: string, socket: AuthenticatedSocket): boolean => {
    const sockets = userSockets.get(userId);
    if (!sockets) return false;
    sockets.delete(socket);
    if (sockets.size === 0) {
        userSockets.delete(userId);
        return true; // true = user is now completely offline
    }
    return false;
};

export const addRoomMember = (roomId: string, userId: string): void => {
    if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Set());
    }
    roomMembers.get(roomId)!.add(userId);
};

export const removeRoomMember = (roomId: string, userId: string): void => {
    const members = roomMembers.get(roomId);
    if (members) {
        members.delete(userId);
        if (members.size === 0) roomMembers.delete(roomId);
    }
};

export const isUserInRoom = (roomId: string, userId: string): boolean => {
    return roomMembers.get(roomId)?.has(userId) ?? false;
};

export const removeUserFromAllRooms = (userId: string): void => {
    roomMembers.forEach((members, roomId) => {
        members.delete(userId);
        if (members.size === 0) roomMembers.delete(roomId);
    });
};

const handleIncomingMessage = (socket: AuthenticatedSocket, data: any): void => {
    try {
        const message = JSON.parse(data.toString());

        if (!message.type) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "Missing event type" } });
            return;
        }

        // Auth gate — must authenticate first
        if (!socket.userId && message.type !== "AUTHENTICATE") {
            sendToSocket(socket, { type: "ERROR", payload: { message: "Not authenticated" } });
            return;
        }

        // Route to handler
        switch (message.type) {
            case "AUTHENTICATE": handleAuthenticate(socket, message.payload); break;
            case "JOIN_ROOM": handleJoinRoom(socket, message.payload); break;
            case "LEAVE_ROOM": handleLeaveRoom(socket, message.payload); break;
            case "SEND_MESSAGE": handleSendMessage(socket, message.payload); break;
            case "START_TYPING": handleStartTyping(socket, message.payload); break;
            case "STOP_TYPING": handleStopTyping(socket, message.payload); break;
            default:
                sendToSocket(socket, { type: "ERROR", payload: { message: "Unknown event type" } });
        }
    } catch (error) {
        sendToSocket(socket, { type: "ERROR", payload: { message: "Invalid JSON" } });
    }
};

const handleDisconnect = (socket: AuthenticatedSocket): void => {
    if (!socket.userId) return;

    const userId = socket.userId;
    const isNowOffline = removeUserSocket(userId, socket);

    if (isNowOffline) {
        removeUserFromAllRooms(userId);
        broadcastToAll({ type: "USER_OFFLINE", payload: { userId } });
        console.log(`🔴 User disconnected: ${socket.username} (${userId})`);
    }
};

export const initWebSocket = (wss: WebSocketServer): void => {
    wss.on("connection", (ws) => {
        const socket = ws as AuthenticatedSocket;
        socket.isAlive = true;

        console.log("🔌 New WebSocket connection");

        socket.on("pong", () => { socket.isAlive = true; });
        socket.on("message", (data) => handleIncomingMessage(socket, data));
        socket.on("close", () => handleDisconnect(socket));
        socket.on("error", (err) => {
            console.error("WebSocket error:", err.message);
            socket.close();
        });
    });

    // Heartbeat — every 30 seconds
    const heartbeat = setInterval(() => {
        wss.clients.forEach((ws) => {
            const socket = ws as AuthenticatedSocket;
            if (socket.isAlive === false) {
                console.log(`💀 Terminating dead connection: ${socket.username || "unknown"}`);
                return socket.terminate();
            }
            socket.isAlive = false;
            socket.ping();
        });
    }, 30000);

    wss.on("close", () => clearInterval(heartbeat));

    console.log("🔌 WebSocket server initialized");
};