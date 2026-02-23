# Real-Time Chat Frontend Setup

This is the React frontend for the Real-Time Chat Application. It features a modern, responsive, and optimistic UI built with Vite, Tailwind CSS v4, and Zustand for state management.

## 🛠️ Tech Stack

- **React 19**: Modern UI library using Hooks.
- **Vite**: Ultra-fast frontend build tool and development server.
- **TypeScript**: Typed superset of JavaScript for robust development.
- **Tailwind CSS v4**: Utility-first styling framework for rapid UI development.
- **Zustand**: Small, fast, and scalable bearbones state management.
- **React Router v7**: Declarative routing for React apps.
- **Axios**: Promised-based HTTP client for the REST API.
- **emoji-picker-react**: Comprehensive emoji selector component.

## ✨ Features

- **Authentication Flows**: Login and Registration screens with client-side validation and visual feedback.
- **Optimistic UI**: Messages appear instantly in the chat view when sent, while the WebSocket transmission occurs in the background.
- **Real-Time Synergy**: 
  - Dynamic user presence (online/offline indicators).
  - Live typing indicators ("User is typing...").
  - Instant room updates and notifications.
- **Rich Media**: Supports text, emojis, and inline image attachments.
- **Smooth Animations**: Uses custom CSS variables and Tailwind utilities for enter animations (`slideUp`) and skeleton loading states.
- **Responsive Layout**: Adapts gracefully to various screen sizes.

## 🚀 Setup Instructions

### 1. Installation

```bash
cd realtime-chat-frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the `realtime-chat-frontend` directory to configure the backend URL:

```env
VITE_API_URL=http://localhost:5000
```
*(Note: Uses `http://localhost:5000` by default if not specified).*

### 3. Running the App

**Development Server** (with Fast Refresh):
```bash
npm run dev
```

**Production Build**:
```bash
npm run build
npm run preview
```

## 📁 Directory Structure

- `src/components/`: Reusable UI components organized by feature (`auth`, `chat`, `layout`, `modals`, `ui`).
- `src/hooks/`: Custom React hooks (`useChat`, `useSocket`, `useTyping`, `usePresence`).
- `src/services/`: API clients (`api.ts`, `auth.api.ts`, `socket.service.ts`, `upload.api.ts`).
- `src/store/`: Zustand state definitions (`auth.store.ts`, `chat.store.ts`, `socket.store.ts`).
- `src/types/`: Shared TypeScript interfaces across the app.

## 🔗 WebSocket Integration

The frontend maintains a singleton instance of the `SocketService`. It automatically authenticates via the JWT token stored in `localStorage` and handles automatic reconnection if the server drops. Zustund stores subscribe directly to WebSocket events to trigger UI updates without complex prop-drilling or Context wrappers.
