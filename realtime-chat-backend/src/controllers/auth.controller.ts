import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            res.status(409).json({ message: "Email already registered" });
            return;
        }
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(409).json({ message: "Username already taken" });
            return;
        }
        const user = await User.create({ username, email, passwordHash: password });

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );
        res.status(201).json({ user, token });
    } catch (error: any) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(409).json({ message: `${field} already exists` });
            return;
        }
        console.error("register error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );
        res.status(200).json({ user, token });
    } catch (error) {
        console.error("login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("getMe error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};