import { create } from "zustand";
import type { User, LoginCredentials, RegisterCredentials } from "../types/user.types";
import { authApi } from "../services/auth.api";
import { socketService } from "../services/socket.service";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isInitialized: boolean;

    login(creds: LoginCredentials): Promise<void>;
    register(creds: RegisterCredentials): Promise<void>;
    logout(): void;
    loadUser(): Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isInitialized: false,

    login: async (creds) => {
        set({ isLoading: true });
        try {
            const { user, token } = await authApi.login(creds);
            localStorage.setItem("chat-token", token);
            set({ user, token, isLoading: false });
            socketService.connect(token);
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (creds) => {
        set({ isLoading: true });
        try {
            const { user, token } = await authApi.register(creds);
            localStorage.setItem("chat-token", token);
            set({ user, token, isLoading: false });
            socketService.connect(token);
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        socketService.disconnect();
        localStorage.removeItem("chat-token");
        set({ user: null, token: null });
        window.location.href = "/login";
    },

    loadUser: async () => {
        const token = localStorage.getItem("chat-token");
        if (!token) {
            set({ isInitialized: true });
            return;
        }
        set({ token });
        try {
            const user = await authApi.getMe();
            set({ user, isInitialized: true });
            socketService.connect(token);
        } catch {
            localStorage.removeItem("chat-token");
            set({ user: null, token: null, isInitialized: true });
        }
    },
}));