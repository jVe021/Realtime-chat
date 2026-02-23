import jwt from "jsonwebtoken";
import { AuthenticatedSocket, SendMessagePayload, TypingPayload } from "../types/types";
import {
    sendToSocket, broadcastToAll, broadcastToRoom,
    addUserSocket, addRoomMember, removeRoomMember,
    isUserInRoom, getOnlineUserIds,
} from "./socketManager";
import { Room } from "../models/Room";
import { Message } from "../models/Message";

export const handleAuthenticate = (socket: AuthenticatedSocket, payload: { token: string }): void => {
    try {
        if (!payload?.token) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "Token is required" } });
            socket.close();
            return;
        }

        const decoded = jwt.verify(payload.token, process.env.JWT_SECRET as string) as {
            userId: string;
            username: string;
        };

        socket.userId = decoded.userId;
        socket.username = decoded.username;

        const isFirstSocket = addUserSocket(decoded.userId, socket);

        // Only broadcast ONLINE if this is the user's first connection
        if (isFirstSocket) {
            broadcastToAll(
                { type: "USER_ONLINE", payload: { userId: decoded.userId, username: decoded.username } },
                decoded.userId // exclude self
            );
            console.log(`🟢 User online: ${decoded.username} (${decoded.userId})`);
        }

        // Send auth confirmation
        sendToSocket(socket, {
            type: "AUTHENTICATED",
            payload: { userId: decoded.userId, username: decoded.username },
        });

        // Send current online users list
        sendToSocket(socket, {
            type: "ONLINE_USERS",
            payload: { userIds: getOnlineUserIds() },
        });
    } catch (error) {
        sendToSocket(socket, { type: "ERROR", payload: { message: "Authentication failed" } });
        socket.close();
    }
};

export const handleJoinRoom = async (
    socket: AuthenticatedSocket,
    payload: { roomId: string }
): Promise<void> => {
    try {
        if (!payload?.roomId) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "roomId is required" } });
            return;
        }

        // DB check: room exists AND user is a participant
        const room = await Room.findById(payload.roomId);
        if (!room) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "Room not found" } });
            return;
        }

        const isParticipant = room.participants.some(
            (p: any) => p.toString() === socket.userId
        );
        if (!isParticipant) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "Access denied" } });
            return;
        }

        addRoomMember(payload.roomId, socket.userId!);
        sendToSocket(socket, { type: "ROOM_JOINED", payload: { roomId: payload.roomId } });
        console.log(`📥 ${socket.username} joined room ${payload.roomId}`);
    } catch (error) {
        sendToSocket(socket, { type: "ERROR", payload: { message: "Failed to join room" } });
    }
};

export const handleLeaveRoom = (
    socket: AuthenticatedSocket,
    payload: { roomId: string }
): void => {
    if (!payload?.roomId) return;

    removeRoomMember(payload.roomId, socket.userId!);
    sendToSocket(socket, { type: "ROOM_LEFT", payload: { roomId: payload.roomId } });
    console.log(`📤 ${socket.username} left room ${payload.roomId}`);
};

export const handleSendMessage = async (
    socket: AuthenticatedSocket,
    payload: SendMessagePayload
): Promise<void> => {
    try {
        // Validate
        if (!payload?.roomId || (!payload?.content?.trim() && !payload?.imageUrl)) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "roomId and content or imageUrl are required" } });
            return;
        }

        if (payload.content && payload.content.length > 5000) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "Message too long (max 5000)" } });
            return;
        }

        // Check user is in room
        if (!isUserInRoom(payload.roomId, socket.userId!)) {
            sendToSocket(socket, { type: "ERROR", payload: { message: "Join the room first" } });
            return;
        }

        // Persist to MongoDB
        const newMsgData = {
            roomId: payload.roomId,
            senderId: socket.userId,
            content: payload.content?.trim() || "",
            imageUrl: payload.imageUrl || undefined,
        };
        const message = await Message.create(newMsgData) as any;

        // Broadcast to ALL room members (including sender for optimistic UI confirmation)
        broadcastToRoom(payload.roomId, {
            type: "MESSAGE",
            payload: {
                id: message._id.toString(),
                roomId: payload.roomId,
                senderId: socket.userId!,
                senderUsername: socket.username!,
                content: message.content,
                imageUrl: message.imageUrl || undefined,
                createdAt: message.createdAt.toISOString(),
                tempId: payload.tempId, // pass back for client-side matching
            },
        });

        console.log(`Message in room ${payload.roomId} from ${socket.username}`);
    } catch (error) {
        console.error("handleSendMessage error:", error);
        sendToSocket(socket, { type: "ERROR", payload: { message: "Failed to send message" } });
    }
};

export const handleStartTyping = (socket: AuthenticatedSocket, payload: TypingPayload): void => {
    if (!payload?.roomId) return;
    if (!isUserInRoom(payload.roomId, socket.userId!)) return;

    broadcastToRoom(payload.roomId, {
        type: "TYPING",
        payload: { userId: socket.userId!, username: socket.username!, roomId: payload.roomId },
    }, socket.userId); // exclude sender
};

export const handleStopTyping = (socket: AuthenticatedSocket, payload: TypingPayload): void => {
    if (!payload?.roomId) return;

    broadcastToRoom(payload.roomId, {
        type: "STOP_TYPING",
        payload: { userId: socket.userId!, roomId: payload.roomId },
    }, socket.userId); // exclude sender
};