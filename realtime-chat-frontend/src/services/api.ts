import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://realtime-chat-backend-p283.onrender.com" : "");

const api = axios.create({
    baseURL: `${apiBaseUrl}/api`,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("chat-token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("chat-token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;