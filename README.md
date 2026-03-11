# CodeBot Arena
A full-stack coding challenges platform with topic-based progression and peer discussion.

Live: https://b6-application-with-bot-for-coding.vercel.app/

## Project Overview
CodeBot Arena is a coding practice platform where users solve AI-generated challenges, track progress, and improve over time. Challenges are organized by topic, and difficulty levels are tracked per topic. Users gain XP per topic and difficulty level, and can optionally start peer-to-peer discussion sessions for feedback and collaboration.

Key ideas:
- Solve coding challenges generated for specific topics.
- Track progress with topic-based difficulty levels and XP.
- Switch topics and continue at the saved level and XP for that topic.
- Optional WebRTC P2P discussion and live chat for peer review.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Real-time: WebRTC (P2P data channels), WebSocket signaling (`ws`)
- AI Integration: OpenAI SDK (backend)

## Prerequisites
- Node.js (recommended v18+)
- npm (or yarn/pnpm if you prefer)
- MongoDB running locally or a hosted MongoDB instance
- Environment variables for backend services (see below)

## Installation and Running the Project
1) Clone the repository
2) Install backend dependencies
3) Configure environment variables
4) Start the backend
5) Install frontend dependencies
6) Start the frontend

### Backend
```
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

Run the backend:
```
npm start
```

### Frontend
```
cd coding-bot-app
npm install
npm run dev
```

Open the app in your browser:
```
http://localhost:5173
```

## Environment Variables
Backend (`backend/.env`):
- `MONGO_URI`: MongoDB connection string
- `OPENAI_API_KEY`: OpenAI API key for challenge generation and evaluation
- `PORT`: Optional; defaults to 5000 if not set

Frontend:
- No required environment variables for local development

## Project Structure
```
/backend
  server.js         Express API and WebSocket signaling server
  /models           Mongoose models (User, SolvedChallenge)

/coding-bot-app
  /src
    App.jsx         App shell and routing
    /components     UI components (Navbar, ChallengeGenerator, P2P modals)
    /pages          Pages (Landing, Auth, History, Settings)
```

## XP and Topic System (High Level)
- XP and difficulty are tracked per topic, not globally.
- Each topic stores:
  - Current difficulty level (Beginner, Intermediate, Advanced)
  - XP per difficulty level
- Switching topics restores the saved difficulty and XP for that topic.
- Progress is persisted in MongoDB and synchronized on login and topic change.

## How to Use the App
1) Open the app and sign up or sign in.
2) Choose a topic and start an assessment.
3) Solve challenges to gain XP in the current topic and difficulty.
4) Switch topics to continue from the saved level and XP for that topic.
5) Optionally start a P2P discussion session to chat about solutions.

## Notes for Developers
- Backend API runs on port 5000 by default; the frontend expects it at `http://localhost:5000`.
- WebRTC signaling is provided by the backend and is used only for session setup; data flows over P2P channels.
- XP and difficulty logic are topic-scoped; avoid introducing global difficulty or XP to keep consistency.
