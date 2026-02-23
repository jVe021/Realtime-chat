import { Request, Response } from "express";
import { User } from "../models/User";

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;
        if (!q || !String(q).trim()) {
            res.json([]);
            return;
        }

        const escaped = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const users = await User.find({
            username: { $regex: escaped, $options: "i" },
            _id: { $ne: req.userId },
        })
            .limit(20)
            .select("username");

        res.json(users);
    } catch (error) {
        console.error("searchUsers error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};