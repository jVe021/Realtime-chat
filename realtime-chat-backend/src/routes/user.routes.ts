import { Router } from "express";
import { searchUsers } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/search", authMiddleware, searchUsers);

export default router;