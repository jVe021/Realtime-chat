import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // 1. Get header
        const authHeader = req.headers.authorization;

        // 2. Check existence
        if (!authHeader) {
            res.status(401).json({ message: "No token provided" });
            return;
        }

        // 3. Check Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Invalid token format" });
            return;
        }

        // 4. Extract token
        const token = authHeader.split(" ")[1];

        // 5. Verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
            username: string;
        };

        // 6. Attach to request
        req.userId = decoded.userId;
        req.username = decoded.username;

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};