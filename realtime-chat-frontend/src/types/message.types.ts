export interface Message {
    id: string;
    roomId: string;
    senderId: string;
    senderUsername: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    tempId?: string;
    isOptimistic?: boolean;
}

export interface MessagesResponse {
    messages: Message[];
    hasMore: boolean;
    page: number;
}