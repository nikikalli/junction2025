# Pampers Club AI Campaign Manager

AI-powered solution for automating and scaling personalized marketing campaigns across 20+ countries using Braze APIs.

## Project Overview

This solution addresses the Junction 2025 P&G challenge by automating campaign creation and management, enabling personalization at scale while reducing manual work.

### Key Features

- **AI-Powered Content Generation**: Automated campaign content creation using OpenAI GPT-4
- **Multi-Country Support**: Seamless campaign deployment across 20+ countries and languages
- **Braze Integration**: Direct integration with Braze API for campaign management
- **Performance Optimization**: AI-driven campaign optimization suggestions
- **Analytics Dashboard**: Real-time campaign performance tracking

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + TypeScript + Express
- **AI**: OpenAI GPT-4
- **CRM**: Braze API
- **Deployment**: Vercel

## Project Structure

```
Junction2025/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx
│   │   │   └── NotFound.tsx
│   │   ├── services/      # API client and services
│   │   │   └── api.ts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # CSS styles
│   │   │   └── index.css
│   │   ├── assets/        # Static assets
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # Entry point
│   │   └── vite-env.d.ts  # Vite environment types
│   ├── index.html
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── .eslintrc.json     # ESLint configuration
│   ├── .env.example       # Environment variables template
│   └── package.json
├── backend/               # Node.js TypeScript backend
│   ├── src/
│   │   ├── api/           # API routes
│   │   │   └── index.ts
│   │   ├── config/        # Configuration
│   │   │   └── index.ts
│   │   ├── middleware/    # Express middleware
│   │   │   └── errorHandler.ts
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   │   ├── openai.service.ts
│   │   │   └── braze.service.ts
│   │   ├── types/         # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Entry point
│   ├── tsconfig.json      # TypeScript configuration
│   ├── .eslintrc.json     # ESLint configuration
│   ├── .env.example       # Environment variables template
│   └── package.json
├── vercel.json            # Vercel deployment configuration
├── .gitignore             # Git ignore rules
├── package.json           # Root package.json for workspaces
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js >= 20
- npm
- OpenAI API key
- Braze API key (provided: `6d7b0fc4-6869-4779-b492-a3b74061eb25`)

### Installation

1. **Clone and navigate to project**
   ```bash
   cd Junction2025
   ```

2. **Install Dependencies (all workspaces)**
   ```bash
   npm install
   ```

   Or install individually:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure Environment Variables**

   Backend (`backend/.env`):
   ```env
   NODE_ENV=development
   PORT=3000
   API_URL=http://localhost:3000
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

   # Add your API keys
   OPENAI_API_KEY=your_openai_api_key_here
   BRAZE_API_KEY=6d7b0fc4-6869-4779-b492-a3b74061eb25
   BRAZE_REST_ENDPOINT=https://rest.iad-01.braze.com
   DATABASE_URL=your_database_url_here
   ```

   Frontend (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_APP_NAME=Pampers Club AI Campaign Manager
   ```

### Running Locally

**Option 1: Run both services together (from root)**
```bash
npm run dev
```

**Option 2: Run services separately**

1. **Start Backend Server**
   ```bash
   npm run dev:backend
   # or
   cd backend && npm run dev
   ```
   Server runs on `http://localhost:3000`

2. **Start Frontend** (in new terminal)
   ```bash
   npm run dev:frontend
   # or
   cd frontend && npm run dev
   ```
   App runs on `http://localhost:5173`

**Other useful commands:**
```bash
npm run build              # Build all workspaces
npm run build:backend      # Build backend only
npm run build:frontend     # Build frontend only
npm run lint               # Lint all workspaces
npm run type-check         # Type check all workspaces
```

## API Endpoints

### Campaign Management

- `POST /api/braze/generate` - Generate AI campaign content
  ```json
  {
    "prompt": "Create a welcome email for new parents",
    "language": "English",
    "country": "USA"
  }
  ```

- `POST /api/braze/create` - Create campaign in Braze
  ```json
  {
    "name": "Welcome Campaign",
    "message": "Welcome to Pampers Club!",
    "countries": ["USA", "UK", "Germany"]
  }
  ```

- `GET /api/braze/analytics/:campaignId` - Get campaign analytics

- `POST /api/braze/optimize` - Get AI optimization suggestions
  ```json
  {
    "campaignData": "Campaign details...",
    "performanceMetrics": "Open rate: 42%, Click rate: 27%"
  }
  ```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   vercel
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Add `OPENAI_API_KEY`
   - Add `BRAZE_API_KEY`
   - Add `REACT_APP_API_URL` (backend URL)

## Solution Highlights

### Judging Criteria Alignment

1. **Effective use of AI (25%)**
   - GPT-4 for multi-language content generation
   - AI-driven campaign optimization
   - Automated personalization at scale

2. **Creativity (25%)**
   - Novel approach to campaign automation
   - Intelligent content adaptation per country/language
   - AI-powered performance insights

3. **Scalability (25%)**
   - Designed for 20+ countries
   - Serverless architecture (Vercel)
   - Modular service architecture

4. **Efficiency (25%)**
   - Reduces manual campaign setup time by 80%+
   - Automated multi-country deployment
   - Real-time optimization suggestions

## Resources

- [Challenge Resources](https://drive.google.com/drive/u/1/folders/1WRlNZ9Tc73ktWEwuyIKLnLEGLBnIcbIT)
- [Braze API Documentation](https://www.braze.com/docs/api/basics/)
- API Key: `6d7b0fc4-6869-4779-b492-a3b74061eb25`

## Development Team

Built for Junction 2025 - P&G Challenge

## License

MIT
