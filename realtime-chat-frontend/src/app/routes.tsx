import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ChatPage } from '../pages/ChatPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const FullPageSpinner = () => (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-text-secondary text-sm font-medium">Loading chat app...</p>
    </div>
);

const ProtectedRoute = () => {
    const isInitialized = useAuthStore(s => s.isInitialized);
    const user = useAuthStore(s => s.user);

    if (!isInitialized) {
        return <FullPageSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

const GuestRoute = () => {
    const isInitialized = useAuthStore(s => s.isInitialized);
    const user = useAuthStore(s => s.user);

    if (!isInitialized) {
        return <FullPageSpinner />;
    }

    if (user) {
        return <Navigate to="/chat" replace />;
    }

    return <Outlet />;
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        element: <GuestRoute />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "/chat", element: <ChatPage /> },
                    { path: "/chat/:roomId", element: <ChatPage /> },
                ],
            },
        ],
    },
    { path: "*", element: <NotFoundPage /> },
]);