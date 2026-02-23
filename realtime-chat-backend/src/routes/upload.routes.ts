import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload, uploadImage } from "../controllers/upload.controller";

const router = Router();

router.post("/image", authMiddleware, upload.single("image"), uploadImage);

export default router;
