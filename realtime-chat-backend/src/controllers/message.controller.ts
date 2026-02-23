import { Request, Response } from "express";
import { Message } from "../models/Message";
import { Room } from "../models/Room";

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const isMember = room.participants.some(
            (p: any) => p.toString() === req.userId
        );
        if (!isMember) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        const messages = await Message.find({ roomId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit + 1)
            .populate("senderId", "username");

        const hasMore = messages.length > limit;

        const result = messages.slice(0, limit).reverse();

        const transformedMessages = result.map(message => ({
            id: message._id,
            roomId: message.roomId,
            senderId: (message.senderId as any)._id || message.senderId,
            senderUsername: (message.senderId as any).username || "Unknown",
            content: message.content,
            imageUrl: message.imageUrl || null,
            createdAt: message.createdAt.toISOString(),
        }));

        res.json({ messages: transformedMessages, hasMore, page });
    } catch (error) {
        console.error("getMessages error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};