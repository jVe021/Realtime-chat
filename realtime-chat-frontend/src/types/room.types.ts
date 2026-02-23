import type { User } from "./user.types";

export type RoomType = "private" | "group";

export interface Room {
    id: string;
    name: string;
    type: RoomType;
    participants: User[];
    createdAt: string;
}

export interface CreateRoomPayload {
    name?: string;
    type: RoomType;
    participantIds: string[];
}