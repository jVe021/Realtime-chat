import api from "./api";
import type { MessagesResponse } from "../types/message.types";

export const messageApi = {
    getMessages: (roomId: string, page = 1, limit = 50): Promise<MessagesResponse> =>
        api.get(`/rooms/${roomId}/messages`, { params: { page, limit } }).then(r => r.data),
};