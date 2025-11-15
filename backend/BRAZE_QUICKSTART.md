# Braze Service - Quick Start

A Node.js + TypeScript service that wraps Braze's REST API for managing Canvas campaigns and user data.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000

BRAZE_API_KEY=6d7b0fc4-6869-4779-b492-a3b74061eb25
BRAZE_REST_ENDPOINT=https://rest.fra-01.braze.eu

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Available Endpoints

### Canvas Management
- `GET /api/braze/canvas/list` - List all canvases
- `GET /api/braze/canvas/:canvasId` - Get canvas details

### User Data Tracking
- `POST /api/braze/users/attributes` - Send user attributes
- `POST /api/braze/users/events` - Send user events
- `POST /api/braze/users/track` - Send combined attributes and events

### Health Check
- `GET /health` - Service health check
- `GET /api/health` - API health check

## Quick Examples

### Get all canvases
```bash
curl http://localhost:3000/api/braze/canvas/list
```

### Update user attributes
```bash
curl -X POST http://localhost:3000/api/braze/users/attributes \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": [{
      "external_id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "country": "US"
    }]
  }'
```

### Track user event
```bash
curl -X POST http://localhost:3000/api/braze/users/events \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "external_id": "user_123",
      "name": "completed_purchase",
      "time": "2025-01-15T12:00:00Z",
      "properties": {
        "product_id": "prod_456",
        "amount": 99.99
      }
    }]
  }'
```

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Run ESLint

## Architecture

```
backend/
├── src/
│   ├── api/
│   │   ├── index.ts              # Main API router
│   │   └── braze.routes.ts       # Braze endpoints
│   ├── config/
│   │   └── index.ts              # Environment config
│   ├── middleware/
│   │   ├── errorHandler.ts       # Error handling
│   │   └── validate.ts           # Request validation
│   ├── services/
│   │   └── braze.service.ts      # Braze API client
│   ├── types/
│   │   └── braze.ts              # TypeScript types
│   ├── utils/
│   │   └── validation.ts         # Zod schemas
│   └── index.ts                  # Express app
├── .env.example                   # Environment template
├── package.json
└── tsconfig.json
```

## Features

- Full TypeScript support with strict type checking
- Request validation using Zod schemas
- Centralized error handling
- CORS and security headers (Helmet)
- Development hot reload
- Production-ready build
- Vercel deployment ready

## Deployment

The service is configured for Vercel deployment:

```bash
npm run build
vercel deploy
```

## Documentation

See [BRAZE_API.md](./BRAZE_API.md) for complete API documentation.
