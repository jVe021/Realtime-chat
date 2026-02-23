import { Document } from "mongoose";
import { WebSocket } from "ws";

// DATABASE DOCUMENT INTERFACES

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export type RoomType = "private" | "group";

export interface IRoom extends Document {
    name: string;
    type: RoomType;
    participants: string[]; // ObjectId refs → User
    createdAt: Date;
}

export interface IMessage extends Document {
    roomId: string; // ObjectId ref → Room
    senderId: string; // ObjectId ref → User
    content: string;
    imageUrl?: string;
    createdAt: Date;
}

// EXPRESS EXTENSIONS

// Augment Express Request to carry auth data
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            username?: string;
        }
    }
}

// WEBSOCKET TYPES

export interface AuthenticatedSocket extends WebSocket {
    userId?: string;
    username?: string;
    isAlive?: boolean;
}

// Client → Server event types
export type ClientEventType =
    | "AUTHENTICATE"
    | "JOIN_ROOM"
    | "LEAVE_ROOM"
    | "SEND_MESSAGE"
    | "START_TYPING"
    | "STOP_TYPING";

// Server → Client event types
export type ServerEventType =
    | "AUTHENTICATED"
    | "MESSAGE"
    | "USER_ONLINE"
    | "USER_OFFLINE"
    | "TYPING"
    | "STOP_TYPING"
    | "ERROR"
    | "ROOM_JOINED"
    | "ROOM_LEFT"
    | "ONLINE_USERS"
    | "ROOM_CREATED"
    | "ROOM_DELETED"
    | "ROOM_UPDATED";

export interface SocketEvent<T = any> {
    type: ClientEventType | ServerEventType;
    payload: T;
}

// PAYLOAD INTERFACES (for type safety)

export interface AuthenticatePayload {
    token: string;
}

export interface JoinRoomPayload {
    roomId: string;
}

export interface LeaveRoomPayload {
    roomId: string;
}

export interface SendMessagePayload {
    roomId: string;
    content: string;
    tempId?: string; // client-generated ID for optimistic UI matching
    imageUrl?: string;
}

export interface TypingPayload {
    roomId: string;
}

export interface MessagePayload {
    id: string;
    roomId: string;
    senderId: string;
    senderUsername: string;
    content: string;
    createdAt: string;
    tempId?: string;
}