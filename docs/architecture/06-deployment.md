# 06 — Deployment & Infrastructure

> How to run, deploy, and configure CollegeFlow.

## Development Setup

### Prerequisites

- Node.js 22+
- Python 3.10+ (for data pipeline)
- Docker + Docker Compose

### Start Infrastructure

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Verify
docker compose ps
# college_major_postgres  running  0.0.0.0:35432->5432/tcp
# college_major_redis     running  0.0.0.0:36379->6379/tcp
```

### Install Dependencies

```bash
# Node.js
npm install

# Python (optional, for data pipeline)
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### Database Setup

```bash
# Push Prisma schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed static data
# npx prisma db seed
```

### Start Services

**Terminal 1 — BFF (Backend):**
```bash
npm run dev:bff
# → http://localhost:38090
```

**Terminal 2 — Vite (Frontend):**
```bash
npm run dev
# → http://localhost:38030
```

**Terminal 3 — FastAPI (optional, for data pipeline):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

### Dev Ports

| Service | Port | Purpose |
|---------|------|---------|
| Vite (Frontend) | 38030 | React SPA + HMR |
| Express BFF | 38090 | API + Auth |
| PostgreSQL | 35432 | Database |
| Redis | 36379 | Caching |
| FastAPI | 8000 | Data pipeline (optional) |

## Docker Compose

Current `docker-compose.yml` provides infrastructure only:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports: ["35432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:alpine
    ports: ["36379:6379"]
    volumes: [redis_data:/data]
```

The BFF and FastAPI run directly on the host (not containerized). This is intentional for development but needs to change for production.

## Environment Variables

### Required (`.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `BFF_PORT` | `38090` | Express server port |
| `DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:35432/college_major?schema=public` | Prisma + Better Auth connection string |
| `REDIS_URL` | `redis://127.0.0.1:36379` | Redis connection string |
| `BETTER_AUTH_SECRET` | *(64+ char base64)* | Session signing key. Generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `http://localhost:38090` | Base URL for auth cookies/redirects |
| `FRONTEND_URL` | `http://localhost:38030` | Frontend URL for verification links, OAuth callbacks |

### Email (optional, dev defaults to console logging)

| Variable | Example | Purpose |
|----------|---------|---------|
| `EMAIL_DEV_MODE` | `true` | When `true`, verification links are logged to console |
| `EMAIL_FROM` | `College Major <noreply@collegemajor.edu>` | Sender address |
| `EMAIL_HOST` | `smtp.ethereal.email` | SMTP server |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | *(Ethereal username)* | SMTP auth |
| `EMAIL_PASSWORD` | *(Ethereal password)* | SMTP auth |
| `EMAIL_SECURE` | `false` | Use TLS |

### Production Changes

When deploying to production:

1. **Generate a real secret**: `openssl rand -base64 32` → `BETTER_AUTH_SECRET`
2. **Change `BETTER_AUTH_URL`** to production domain
3. **Change `FRONTEND_URL`** to production domain
4. **Set `EMAIL_DEV_MODE=false`** and configure real SMTP
5. **Change `DATABASE_URL`** to production database (not localhost)
6. **Change `REDIS_URL`** to production Redis
7. **Set `NODE_ENV=production`**

## Production Deployment Architecture

Target:

```
                ┌─────────────────────┐
                │   Load Balancer     │
                │   (Nginx / Cloud)   │
                └──────────┬──────────┘
                           │
              ┌────────────┼────────────┐
              │                         │
    ┌─────────▼─────────┐   ┌──────────▼─────────┐
    │  Express BFF      │   │  FastAPI Pipeline   │
    │  (Node 22)        │   │  (Python 3.10)      │
    │  :8080            │   │  :8000              │
    │  Serves static    │   │  Async via Celery   │
    │  via middleware   │   │  Celery: Redis/PG   │
    └─────────┬─────────┘   └──────────┬─────────┘
              │                        │
    ┌─────────▼────────────────────────▼─────────┐
    │  PostgreSQL (managed or containerized)      │
    │  - public schema: app data                  │
    │  - ipeds_raw: raw government data           │
    │  - ipeds_meta: metadata dictionaries        │
    └─────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────┐
    │  Redis (managed or containerized)           │
    └─────────────────────────────────────────────┘
```

### Production Checklist

- [ ] `BETTER_AUTH_SECRET` — strong random value, never commit to git
- [ ] `DATABASE_URL` — production database with SSL
- [ ] `REDIS_URL` — production Redis with auth
- [ ] `EMAIL_DEV_MODE=false` — real SMTP configured
- [ ] Stripe webhook endpoint configured (`server/stripe.ts`)
- [ ] HTTPS/SSL configured
- [ ] Database backups configured
- [ ] Error monitoring (Sentry, LogRocket, etc.)
- [ ] Rate limiting configured
- [ ] CORS configured for production domain

## Build Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run dev:bff` | Start Express BFF server |
| `npm run build` | Build production frontend bundle |
| `npm run preview` | Preview production build |
| `npm run start` | Start Express BFF in production mode |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Sync schema to database |
| `npx prisma migrate dev` | Create + apply migration (dev) |
| `npx prisma studio` | Open database browser |

## Related ADRs

- [ADR-003](../adr/ADR-003-vite-middleware-vs-reusable-bff.md) — BFF vs Vite middleware (Decision Gate #3)
