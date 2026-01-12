# Professional Media Center

A modern, high-performance Media Center web application built with Node.js and React. Features hierarchical folder navigation, real-time media scanning, and a premium glassmorphic UI.

## ✨ Features

- **Hierarchical Browsing**: Navigate your media library level by level, just like a file explorer.
- **Support for All Media**: Handles popular video (MP4, MKV, AVI, etc.) and audio (MP3, WAV, FLAC, etc.) formats.
- **Smart Scanning**: Recursive directory scanning with recursive file counting for subfolders.
- **Glassmorphic UI**: A stunning, modern dark theme with frosted glass effects and smooth animations.
- **Breadcrumb Navigation**: Easily jump between nested folders.
- **Real-time Streaming**: Efficient media streaming with range support for instant seeking.

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS v4, Lucide React Icons.
- **Backend**: Node.js, Express.js, Fast-glob.
- **Aesthetics**: Custom-built glassmorphic design system.

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/media-center.git
cd media-center
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

## 🏃 Running the Application

You need to run both the backend and frontend servers.

### Start Backend
```bash
cd backend
node server.js
```
The backend will run on `http://localhost:5000`.

### Start Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`.

## 📖 Usage

1. Open `http://localhost:5173` in your browser.
2. Enter the path to your media directory (e.g., `D:\Videos` or `C:\Users\Name\Music`).
3. Click **Scan**.
4. Browse your folders hierarchically.
5. Click any media card to play.

## 🛡️ Security & Permissions

The application includes built-in safeguards to skip protected Windows system directories (like `Windows`, `Program Files`, `AppData`) to ensure smooth operation without permission errors.

## 📄 License

MIT
