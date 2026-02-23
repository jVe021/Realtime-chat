import { Router } from "express";
import { getRooms, createRoom, getRoomById, leaveRoom } from "../controllers/room.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.get("/", authMiddleware, getRooms);

router.post("/", authMiddleware, validate([
    { field: "type", required: true },
    { field: "participantIds", required: true },
]), createRoom);

router.get("/:roomId", authMiddleware, getRoomById);

router.post("/:roomId/leave", authMiddleware, leaveRoom);

export default router;