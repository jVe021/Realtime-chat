import api from "./api";
import type { User } from "../types/user.types";

export const userApi = {
    searchUsers: (query: string): Promise<User[]> =>
        api.get("/users/search", { params: { q: query } }).then(r => r.data),
};