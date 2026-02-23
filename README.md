

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-API-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-red)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-black)
![License](https://img.shields.io/badge/License-MIT-green)

# 🚀 Real-Time Chat Application

A full-stack, production-ready real-time chat application built with modern web technologies.  
This project follows a **monorepo architecture**, containing both frontend and backend services.


🌍 **Live Demo:**  
Frontend: https://realtimechat-orcin.vercel.app  
Backend API: https://realtime-chat-backend-p283.onrender.com  


# ✨ Features

- ⚡ Real-Time Messaging using native WebSockets (`ws`)
- 🔐 JWT Authentication with secure password hashing (`bcrypt`)
- 👥 Online Presence Tracking
- ⌨️ Typing Indicators
- 🖼️ Image Upload Support (Multer – local storage)
- 😀 Emoji Support
- 🚀 Optimistic UI Updates
- 🎨 Modern Glassmorphism UI (Tailwind CSS v4)
- 📱 Fully Responsive Design

---

## 🏗 Repository Structure

This repository contains two main applications:

```
root/
│
├── realtime-chat-frontend/
└── realtime-chat-backend/
```

---

## 🏗️ System Architecture

```
          ┌───────────────────────────┐
          │        Frontend           │
          │   React + Vite + Tailwind │
          │   Deployed on Vercel      │
          └─────────────┬─────────────┘
                        │
  REST API (JWT Auth)   │   WebSocket (Real-time)
                        │
            ┌────────────▼────────────┐
            │        Backend          │
            │   Node.js + Express     │
            │   Deployed on Render    │
            ├────────────┬────────────┤
            │            │            │
            │        WebSocket        │
            │        Server           │
            └────────────┬────────────┘
                        │
                        │  Read / Write
                        ▼
          ┌───────────────────────────┐
          │        MongoDB            │
          │  Users, Rooms, Messages   │
          └───────────────────────────┘
```

---

## 🖥️ Frontend — React + Vite

Located in: `realtime-chat-frontend/`

### Tech Stack
- React 19
- Vite
- Zustand (State Management)
- React Router v7
- Tailwind CSS v4

### Deployment
Hosted on **Vercel**

### Required Environment Variable
PORT=10000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

---

# 🗄️ Database Setup (MongoDB Atlas)

1. Create a free **M0 cluster**
2. Create a **Database User**
   - Role: Read and write to any database
3. Add IP Access:


---

# 🗄️ Database Setup (MongoDB Atlas)

1. Create a free **M0 cluster**
2. Create a **Database User**
   - Role: Read and write to any database
3. Add IP Access:

4. Copy connection string and set it as `MONGO_URI`

---

# 🧪 Local Development

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)

---

## 1️⃣ Start Backend
- cd realtime-chat-backend
- npm install
- npm run dev

## 1️⃣ Start Frontend
- cd realtime-chat-frontend
- npm install
- npm run dev

## 🌐 Visit
- Visit: http://localhost:5173


## 🔐 Authentication Flow
- User registers
- Password hashed using bcrypt
- JWT token issued
- Token stored in frontend state
- Authenticated WebSocket connection established


## 🌐 Production Deployment
- Frontend → Vercel
- Root directory: realtime-chat-frontend
- Set VITE_API_URL
- Backend → Render
- Root directory: realtime-chat-backend
- Add environment variables
- WebSockets enabled automatically
- Database → MongoDB Atlas


## 📦 Future Improvements
- Cloud image storage (AWS S3 / Cloudinary)
- Redis for scalable WebSocket sessions
- Docker containerization
- CI/CD pipeline
- Message pagination
- User profile customization


## 🧠 Learning Highlights
- This project demonstrates:
- Full-stack architecture
- WebSocket implementation
- JWT authentication flow
- Production deployment (Render + Vercel + Atlas)
- Environment variable management
- Secure CORS configuration


## 📜 License
- MIT License