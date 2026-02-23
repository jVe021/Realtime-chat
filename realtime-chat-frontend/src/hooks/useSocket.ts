import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { socketService } from "../services/socket.service";

export const useSocket = () => {
    const token = useAuthStore(s => s.token);
    const isInitialized = useAuthStore(s => s.isInitialized);

    useEffect(() => {
        // Only connect after auth is initialized and token exists
        if (isInitialized && token) {
            socketService.connect(token);
        }
        return () => {
            // Don't disconnect on unmount — socket lifecycle is managed by auth
            // Only disconnect explicitly on logout
        };
    }, [isInitialized, token]);
};