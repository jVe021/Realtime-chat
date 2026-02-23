import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { WebSocketServer } from "ws";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

import { initWebSocket } from "./websocket/socketManager";

const wss = new WebSocketServer({ server });
initWebSocket(wss);


connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});