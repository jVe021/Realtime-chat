# Real-Time Chat Backend Setup

This is the Node.js / Express backend for the Real-Time Chat Application. It handles RESTful API routes, WebSocket connections, database interactions, and secure image uploads.

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated web framework.
- **TypeScript**: Typed superset of JavaScript.
- **MongoDB + Mongoose**: NoSQL database and Object Data Modeling (ODM) library.
- **WebSockets (`ws`)**: Native, lightweight WebSocket implementation for real-time traffic.
- **JWT + bcrypt**: Secure authentication and password hashing.
- **Multer**: Middleware for handling `multipart/form-data`, primarily used for uploading files.

## 📦 Features

- **Authentication**: User registration and login with JWT issuance.
- **Room Management**: Create public or private chat rooms, retrieve room lists, and handle user joins/leaves.
- **Messaging API**: REST endpoints for retrieving paginated chat history.
- **WebSocket Hub**: 
  - Connection authentication.
  - Broadcasting messages instantly to connected clients.
  - Tracking online status and typing indicators.
  - Ping/Pong heartbeat for connection stability.
- **File Uploads**: Handles incoming image attachments (up to 5MB, accepted formats: JPEG, PNG, GIF, WebP).

## 🚀 Setup Instructions

### 1. Installation

```bash
cd realtime-chat-backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the `realtime-chat-backend` directory with the following configuration:

```env
# Server Port
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/realtime-chat

# JWT Secret Key (replace with a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173
```

### 3. Running the Server

**Development Mode** (with hot-reloading via `ts-node-dev`):
```bash
npm run dev
```

**Production Build**:
```bash
npm run build
npm start
```

## 📁 Directory Structure

- `src/controllers/`: Route handlers for auth, messages, rooms, and uploads.
- `src/middleware/`: JWT authentication middleware.
- `src/models/`: Mongoose schemas (User, Room, Message).
- `src/routes/`: Express router definitions.
- `src/websocket/`: WebSocket manager and event handlers.
- `uploads/`: Directory where uploaded files are saved (ensure this is ignored in `.gitignore`).

## 🔌 WebSocket Events

The backend emits and listens to various WebSocket events to ensure a seamless real-time experience:
- `AUTH` / `AUTH_SUCCESS` / `AUTH_ERROR` 
- `USER_ONLINE` / `USER_OFFLINE` / `ONLINE_USERS`
- `SEND_MESSAGE` / `MESSAGE`
- `TYPING` / `STOP_TYPING`
- `ROOM_CREATED` / `ROOM_UPDATED` / `ROOM_DELETED`
