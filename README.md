# Real-Time Chat Application

A full-stack, real-time chat application built with modern web technologies. This repository is structured as a monorepo containing both the frontend and backend applications.

## 🌟 Features

- **Real-Time Messaging**: Built on WebSockets for instant, bi-directional communication.
- **Modern Tech Stack**: React (Vite) frontend + Node.js (Express) backend.
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing.
- **Rich Media**: Support for sending emojis and image attachments.
- **Optimistic UI**: Messages appear instantly while they are being sent to the server.
- **Presence & Typing**: Real-time online user tracking and typing indicators.
- **Responsive Design**: Modern, glassmorphism UI built with Tailwind CSS.

## 🏗️ Architecture

The project is split into two main directories:

### 1. [Frontend (React + Vite)](./realtime-chat-frontend/README.md)
The client-side application located in `realtime-chat-frontend/`. 
- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7

### 2. [Backend (Node.js + Express)](./realtime-chat-backend/README.md)
The server-side application located in `realtime-chat-backend/`.
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-Time**: `ws` (Native WebSockets)
- **Uploads**: Multer (Local Disk Storage)

## 🚀 Getting Started

To run the application locally, you will need to start both the backend and frontend servers.

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)

### 1. Start the Backend
```bash
cd realtime-chat-backend
npm install
# Configure your .env (see backend README)
npm run dev
```

### 2. Start the Frontend
```bash
cd realtime-chat-frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---
*For detailed instructions on configuring or deploying each service, please see the respective `README.md` files in the frontend and backend directories.*
