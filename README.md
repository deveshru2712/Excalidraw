# Excalidraw Clone


This project is a real-time, collaborative whiteboarding application inspired by Excalidraw. It allows multiple users to join a room and draw together, with their actions synchronized across all clients. The application is built as a monorepo using Bun, with a React frontend and a Socket.IO backend.

## ✨ Features

*   **Real-time Collaboration**: Draw with others in shared rooms, with all actions broadcasted instantly.
*   **Variety of Tools**:
    *   Pencil for free-form drawing.
    *   Text tool for adding notes.
    *   Shapes like rectangles and circles.
    *   Eraser to remove elements.
    *   Drag tool to move elements.
    *   Pan tool to navigate the canvas.
*   **Customizable Tools**: Adjust stroke color, width, and style (solid, dashed, dotted) for drawing tools.
*   **Canvas Controls**: Zoom in/out and focus on the entire drawing content.
*   **State Management**: Undo/redo functionality for your actions.
*   **Session Management**: Create unique rooms and share invite links. The session ends for all participants when the host leaves.

## 🛠️ Tech Stack

*   **Monorepo**: Managed with Bun workspaces.
*   **Frontend (`/packages/client`)**:
    *   **Framework**: React (with React Compiler) & Vite
    *   **Language**: TypeScript
    *   **State Management**: Zustand
    *   **Routing**: React Router
    *   **Styling**: Tailwind CSS & shadcn/ui
    *   **Real-time**: Socket.IO Client
*   **Backend (`/packages/server`)**:
    *   **Runtime**: Bun
    *   **Framework**: Socket.IO with `@socket.io/bun-engine`
    *   **Language**: TypeScript
*   **Shared (`/packages/shared`)**:
    *   Contains shared TypeScript types for consistent data structures between the client and server.
*   **Tooling**:
    *   **Package Manager**: Bun
    *   **Linting & Formatting**: ESLint, Prettier
    *   **Git Hooks**: Husky for pre-commit checks

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

You must have [Bun](https://bun.sh/) installed on your machine.

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/deveshru2712/Excalidraw.git
    cd Excalidraw
    ```

2.  **Install dependencies:**
    Run the following command at the root of the project to install dependencies for all workspaces (client, server, and shared).
    ```bash
    bun install
    ```

3.  **Start the development servers:**
    This command will start both the frontend and backend servers concurrently with hot-reloading.
    ```bash
    bun run dev
    ```

    *   The frontend client will be available at `http://localhost:5173`.
    *   The backend server will be running on `http://localhost:8080`.

## 📂 Project Structure

The repository is organized as a monorepo with the following structure:

```
.
├── packages/
│   ├── client/       # The React frontend application
│   ├── server/       # The Socket.IO backend server
│   └── shared/       # Shared TypeScript types
├── .husky/           # Pre-commit hooks configuration
├── eslint.config.js  # ESLint configuration
├── package.json      # Root package configuration and scripts
└── ...
```

## 📜 Available Scripts

From the root directory, you can run the following scripts:

*   `bun run dev`: Starts both the client and server development servers in parallel.
*   `bun run dev:client`: Starts only the client development server.
*   `bun run dev:server`: Starts only the server development server.
*   `bun run prepare`: Installs Husky git hooks. This is run automatically after `bun install`.
