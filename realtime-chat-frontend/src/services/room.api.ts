import api from "./api";
import type { Room, CreateRoomPayload } from "../types/room.types";

export const roomApi = {
    getRooms: (): Promise<Room[]> =>
        api.get("/rooms").then(r => r.data),

    createRoom: (payload: CreateRoomPayload): Promise<Room> =>
        api.post("/rooms", payload).then(r => r.data),

    getRoomById: (roomId: string): Promise<Room> =>
        api.get(`/rooms/${roomId}`).then(r => r.data),

    leaveRoom: (roomId: string): Promise<void> =>
        api.post(`/rooms/${roomId}/leave`).then(r => r.data),
};