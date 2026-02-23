export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

// ── Client → Server ──
export type ClientEventType =
    | "AUTHENTICATE"
    | "JOIN_ROOM"
    | "LEAVE_ROOM"
    | "SEND_MESSAGE"
    | "START_TYPING"
    | "STOP_TYPING";

export interface ClientEvent<T = unknown> {
    type: ClientEventType;
    payload: T;
}

// ── Server → Client ──
export type ServerEventType =
    | "AUTHENTICATED"
    | "MESSAGE"
    | "USER_ONLINE"
    | "USER_OFFLINE"
    | "TYPING"
    | "STOP_TYPING"
    | "ERROR"
    | "ROOM_JOINED"
    | "ROOM_LEFT"
    | "ONLINE_USERS"
    | "ROOM_CREATED"
    | "ROOM_DELETED"
    | "ROOM_UPDATED";

export interface ServerEvent<T = unknown> {
    type: ServerEventType;
    payload: T;
}