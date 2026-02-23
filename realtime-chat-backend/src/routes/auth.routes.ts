import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post("/register", validate([
    { field: "username", required: true, minLength: 3, maxLength: 30 },
    { field: "email", required: true, isEmail: true },
    { field: "password", required: true, minLength: 6 },
]), register);

router.post("/login", validate([
    { field: "email", required: true },
    { field: "password", required: true },
]), login);

router.get("/me", authMiddleware, getMe);

export default router;