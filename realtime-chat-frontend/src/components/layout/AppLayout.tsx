import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useSocketStore } from '../../store/socket.store';
import { useSocket } from '../../hooks/useSocket';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
    const isInitialized = useAuthStore(s => s.isInitialized);
    const connectionStatus = useSocketStore(s => s.connectionStatus);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initialize socket connection
    useSocket();

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-bg-primary overflow-hidden relative">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Reconnecting Banner */}
                {connectionStatus === "reconnecting" && (
                    <div className="w-full bg-warning/20 border-b border-warning/50 p-2 flex items-center justify-center gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 z-50 absolute top-0 left-0">
                        <span className="text-xl">⚠️</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-warning-contrast">Connection lost. Reconnecting...</span>
                            <div className="h-1.5 w-full bg-warning/30 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-warning w-1/2 animate-[progress_1s_ease-in-out_infinite]"></div>
                            </div>
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-hidden relative flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};