# Backend API

Junction 2025 Backend API with automated PostgreSQL database setup.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   This will automatically:
   - Install PostgreSQL (if needed via Homebrew)
   - Start PostgreSQL service
   - Create and initialize the database
   - Start the development server with hot reload

3. **Access the API:**
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key variables:
- `PORT` - Server port (default: 3000)
- `DB_NAME` - Database name (default: junction2025)
- `DB_HOST` - Database host (default: localhost)
- `BRAZE_API_KEY` - Your Braze API key
- `BRAZE_REST_ENDPOINT` - Braze REST endpoint URL

## Available Scripts

- `npm run dev` - Start dev server with database setup
- `npm run dev:skip-db` - Start dev server without database setup
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:setup` - Setup database only
- `npm run db:migrate` - Run database migrations

## Database

The project uses PostgreSQL with a fully automated setup. See [DATABASE.md](./DATABASE.md) for detailed information about:
- Database schema (campaigns, implementations, actions)
- Type-safe database service usage
- Manual setup options
- API examples

## API Endpoints

### Braze Integration
- `POST /api/braze/*` - Braze API proxy endpoints

### Campaign Generator
- `POST /api/campaign-generator/*` - Campaign generation endpoints

### Health Check
- `GET /health` - Server and database health status

## Development

The project uses:
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Zod** - Runtime validation
- **Jest** - Testing

## Project Structure

```
backend/
├── src/
│   ├── api/              # API routes
│   ├── config/           # Configuration
│   ├── db/               # Database setup and migrations
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities
│   └── index.ts          # Entry point
├── .env                  # Environment variables (create from .env.example)
└── package.json
```

## Troubleshooting

**PostgreSQL not starting:**
```bash
# Check PostgreSQL status
brew services list

# Restart PostgreSQL
brew services restart postgresql@15
```

**Database connection issues:**
```bash
# Test connection manually
psql -d junction2025

# Reset database
dropdb junction2025
npm run db:setup
```

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3001
```
