import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../store/chat.store";
import { ChatPanel } from "../components/chat/ChatPanel";

export const ChatPage = () => {
    const { roomId } = useParams();
    const setActiveRoom = useChatStore(s => s.setActiveRoom);
    const loadRooms = useChatStore(s => s.loadRooms);

    // Load rooms on mount
    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    // Set active room from URL param
    useEffect(() => {
        setActiveRoom(roomId ?? null);
        return () => setActiveRoom(null);
    }, [roomId, setActiveRoom]);

    return <ChatPanel />;
};