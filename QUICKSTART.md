# Quick Start Guide

## Installation

```bash
# Install all dependencies
npm install

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Configuration

Edit `backend/.env` and add your API keys:
```env
OPENAI_API_KEY=your_key_here
BRAZE_API_KEY=6d7b0fc4-6869-4779-b492-a3b74061eb25
```

## Run Development Servers

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:backend    # Backend: http://localhost:3000
npm run dev:frontend   # Frontend: http://localhost:5173
```

## Test API

```bash
curl http://localhost:3000/health
```

## Build for Production

```bash
npm run build
```

## Project Structure

- `backend/` - Node.js + TypeScript + Express API
- `frontend/` - React + TypeScript + Vite application
- Root `package.json` manages both as npm workspaces

## Key Files

- [backend/src/index.ts](backend/src/index.ts) - Backend entry point
- [backend/src/api/index.ts](backend/src/api/index.ts) - API routes
- [frontend/src/App.tsx](frontend/src/App.tsx) - Frontend app component
- [frontend/src/services/api.ts](frontend/src/services/api.ts) - API client
- [vercel.json](vercel.json) - Vercel deployment config
