import { Request, Response } from "express";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { sendToUser } from "../websocket/socketManager";

export const createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, type, participantIds } = req.body;

        if (!["private", "group"].includes(type)) {
            res.status(400).json({ message: "type must be 'private' or 'group'" });
            return;
        }

        if (!Array.isArray(participantIds) || participantIds.length === 0) {
            res.status(400).json({ message: "participantIds must be a non-empty array" });
            return;
        }

        const allParticipants = [...new Set([req.userId, ...participantIds])];

        let roomName = "";

        if (type === "private") {
            if (allParticipants.length !== 2) {
                res.status(400).json({ message: "Private room must have exactly 2 participants" });
                return;
            }

            const existing = await Room.findOne({
                type: "private",
                participants: { $all: allParticipants, $size: 2 },
            }).populate("participants", "username");

            if (existing) {
                res.status(200).json(existing);
                return;
            }

            const otherUser = await User.findById(participantIds[0]);
            if (!otherUser) {
                res.status(400).json({ message: "One or more participant IDs are invalid" });
                return;
            }
            const currentUser = await User.findById(req.userId);
            if (!currentUser) {
                res.status(404).json({ message: "Current user not found" });
                return;
            }
            roomName = `${currentUser.username} & ${otherUser.username}`;
        }

        if (type === "group") {
            if (!name || !name.trim()) {
                res.status(400).json({ message: "Group room name is required" });
                return;
            }
            if (allParticipants.length < 2) {
                res.status(400).json({ message: "Group must have at least 2 participants" });
                return;
            }
            roomName = name.trim();
        }

        const validUsers = await User.find({ _id: { $in: allParticipants } });
        if (validUsers.length !== allParticipants.length) {
            res.status(400).json({ message: "One or more participant IDs are invalid" });
            return;
        }

        const room = await Room.create({
            name: roomName,
            type,
            participants: allParticipants,
        });

        await room.populate("participants", "username");

        // Broadcast ROOM_CREATED to all participants except the creator
        // (creator already gets the room from the REST response)
        const roomPayload = room.toJSON();
        for (const participantId of allParticipants) {
            if (participantId !== req.userId) {
                sendToUser(participantId, {
                    type: "ROOM_CREATED",
                    payload: roomPayload,
                });
            }
        }

        res.status(201).json(room);
    } catch (error) {
        console.error("createRoom error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRooms = async (req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await Room.find({ participants: req.userId })
            .populate("participants", "username")
            .sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        console.error("getRooms error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
    try {
        const room = await Room.findById(req.params.roomId)
            .populate("participants", "username");
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const isMember = room.participants.some(
            (p: any) => p._id.toString() === req.userId
        );
        if (!isMember) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        res.json(room);
    } catch (error) {
        console.error("getRoomById error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const leaveRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const userId = req.userId!;

        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        const isParticipant = room.participants.some(
            (p: any) => p.toString() === userId
        );
        if (!isParticipant) {
            res.status(403).json({ message: "You are not a member of this room" });
            return;
        }

        // Remove user from participants
        room.participants = room.participants.filter(
            (p: any) => p.toString() !== userId
        ) as any;

        if (room.participants.length < 2) {
            // Not enough members — delete the room
            // Notify remaining participant (if any) that room was deleted
            for (const p of room.participants) {
                sendToUser(p.toString(), {
                    type: "ROOM_DELETED",
                    payload: { roomId },
                });
            }
            await Room.findByIdAndDelete(roomId);
            res.json({ message: "Left and room deleted" });
        } else {
            await room.save();
            await room.populate("participants", "username");

            // Notify remaining participants that the room was updated
            const roomPayload = room.toJSON();
            for (const p of room.participants) {
                const pid = typeof p === "string" ? p : (p as any)._id?.toString() || (p as any).toString();
                sendToUser(pid, {
                    type: "ROOM_UPDATED",
                    payload: roomPayload,
                });
            }
            res.json({ message: "Left room successfully" });
        }
    } catch (error) {
        console.error("leaveRoom error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};