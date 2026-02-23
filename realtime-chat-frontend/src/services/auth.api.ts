import api from "./api";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../types/user.types";

export const authApi = {
    login: (creds: LoginCredentials): Promise<AuthResponse> =>
        api.post("/auth/login", creds).then(r => r.data),

    register: (creds: RegisterCredentials): Promise<AuthResponse> =>
        api.post("/auth/register", creds).then(r => r.data),

    getMe: (): Promise<User> =>
        api.get("/auth/me").then(r => r.data),
};