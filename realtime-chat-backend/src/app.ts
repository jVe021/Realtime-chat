import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import roomRoutes from "./routes/room.routes";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://realtimechat-orcin.vercel.app"
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_, res) => {
  res.json({ status: "Server running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

export default app;