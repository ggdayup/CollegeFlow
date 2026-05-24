# College Major Intelligence Platform

A bilingual college-major and university exploration app for comparing academic fields, university program coverage, outcomes, ROI, and source-backed institutional data. The product combines curated frontend seed data with PostgreSQL-backed records, role-aware authentication, and an IPEDS ingestion pipeline.

## What This App Does

- Explores 152 standardized bachelor majors across broad and detailed academic fields.
- Shows salary, employment, graduate-degree, ROI, prerequisite, and subject-demand views.
- Blends static curated university profiles with dynamic PostgreSQL university, school, ranking, metric, and program records.
- Uses IPEDS as the primary U.S. institution/program data source while keeping technical provenance in admin/backend surfaces.
- Provides authenticated user flows, settings, saved items, and admin-only audit/management surfaces.

## Stack

- Frontend: React 19, Vite 6, TypeScript, Tailwind CSS v4, Motion, Recharts.
- BFF: Express in [server/server.ts](server/server.ts), proxied by Vite under `/api`.
- Database: PostgreSQL via Prisma 7, `pg`, and `@prisma/adapter-pg`.
- Auth: Better Auth plus app-level `User` profile/role records.
- Optional services: Redis for proxy/cache paths, FastAPI/Scrapy backend for catalog crawling.
- IPEDS ETL: Python scripts under [scripts/ipeds](scripts/ipeds).

## Important Ports

| Service | Port | Command |
| --- | ---: | --- |
| Vite frontend | `38030` | `npm run dev` |
| Express BFF | `38090` | `BFF_PORT=38090 npm run dev:bff` |
| PostgreSQL Docker host | `35432` | `docker compose up -d` |
| Redis Docker host | `36379` | `docker compose up -d` |

Do not change these ports to dodge conflicts. Stop the conflicting process and restart the intended service.

## Prerequisites

- Node.js 22 or compatible modern Node runtime.
- Docker Desktop or another Docker-compatible runtime.
- Python 3.10+ for backend and IPEDS scripts.
- The IPEDS Access database if running the full ETL:

```text
/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional/IPEDS202425.accdb
```

## Environment

Start from the sample file:

```sh
cp .env.example .env
```

Common local values:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:35432/college_major"
BETTER_AUTH_SECRET="replace-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:38090"
FRONTEND_URL="http://localhost:38030"
GEMINI_API_KEY="optional-for-parser-features"
```

Generate a local auth secret:

```sh
openssl rand -base64 32
```

Never commit real secrets or raw private data.

## Local Setup

Install dependencies:

```sh
npm install
```

Start database services:

```sh
docker compose up -d
```

Apply migrations:

```sh
npx prisma migrate deploy
```

Seed baseline data when needed:

```sh
npx prisma db seed
```

Start the BFF:

```sh
BFF_PORT=38090 npm run dev:bff
```

Start the frontend in another terminal:

```sh
npm run dev
```

Open:

```text
http://localhost:38030
```

Registration and login require both the frontend and BFF to be running. If `/register` shows a generic registration failure, first confirm that `BFF_PORT=38090 npm run dev:bff` is still running.

## Verification

Run TypeScript checks:

```sh
npm run lint
```

Build the frontend:

```sh
npm run build
```

Check Prisma schema and migrations:

```sh
npx prisma validate
npx prisma migrate status
```

Smoke-check the BFF:

```sh
curl -sS -D - http://127.0.0.1:38090/api/universities -o /tmp/universities.json
curl -sS -D - http://127.0.0.1:38090/api/auth/me -o /tmp/auth-me.json
```

An anonymous `/api/auth/me` request should return `401`; that still confirms the BFF is alive.

## Backend Catalog Service

The optional FastAPI service supports catalog crawling and curriculum parsing.

Create and populate the Python environment:

```sh
python3 -m venv backend/venv
backend/venv/bin/pip install -r backend/requirements.txt
```

Run the service from the repo root:

```sh
backend/venv/bin/uvicorn backend.main:app --reload
```

Scrapy crawls should run through subprocess wrappers rather than directly inside worker threads.

## IPEDS Data Pipeline

IPEDS is the primary source for U.S. institution/program data. The Access database stays outside the repository and is treated as the immutable raw source artifact.

Primary source:

```text
/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional/IPEDS202425.accdb
```

Metadata source:

```text
/Users/ggdayup/Downloads/college/IPEDS_2024-25_Provisional/IPEDS202425Tablesdoc.xlsx
```

Pipeline documentation:

- [scripts/ipeds/README.md](scripts/ipeds/README.md)
- [docs/adr/ADR-005-ipeds-raw-mirror-and-product-projection.md](docs/adr/ADR-005-ipeds-raw-mirror-and-product-projection.md)
- [ipeds-implementation-plan.md](ipeds-implementation-plan.md)

Typical sequence:

```sh
backend/venv/bin/python scripts/ipeds/import_metadata_from_xlsx.py
backend/venv/bin/python scripts/ipeds/extract_access_to_csv.py --mode docker
backend/venv/bin/python scripts/ipeds/import_raw_to_postgres.py
backend/venv/bin/python scripts/ipeds/import_metric_definitions.py
backend/venv/bin/python scripts/ipeds/sync_curated_projection.py
backend/venv/bin/python scripts/ipeds/score_eligibility.py
```

Do not commit the Access database, extracted CSV files, or raw dumps.

## Key Directories

| Path | Purpose |
| --- | --- |
| [src/App.tsx](src/App.tsx) | Top-level app state, routes, auth/session orchestration, dashboard gating. |
| [src/components](src/components) | Main UI surfaces: landing, major directory, university navigator, charts, admin audit, settings. |
| [src/data](src/data) | Static seed definitions used by frontend and Prisma seeding. |
| [src/ingest](src/ingest) | Ranking/source ingestion helpers. |
| [src/utils](src/utils) | API proxy/cache, localization, matching, entitlement, session utilities. |
| [server](server) | Express BFF and email helpers. |
| [prisma](prisma) | Prisma schema, migrations, seed pipeline. |
| [backend](backend) | FastAPI catalog crawler/parser service. |
| [scripts/ipeds](scripts/ipeds) | IPEDS metadata/raw/curated import scripts. |
| [docs/adr](docs/adr) | Architecture decision records. |
| [memory](memory) | Project notes and local import reports. |

## Data Integrity Rules

- Do not fabricate universities, programs, rankings, admissions data, salary statistics, identifiers, or outcomes.
- Keep academic/statistical records traceable to authoritative source systems.
- Public UI should not expose low-level technical source details unless the product design explicitly calls for it.
- Admin/backend surfaces should retain source lineage and audit identifiers.
- Use IPEDS/Scorecard identifiers for U.S. institutions where available.

See [AGENTS.md](AGENTS.md) for the full project operating rules.

## Useful Commands

```sh
npm install
npm run dev
BFF_PORT=38090 npm run dev:bff
npm run lint
npm run build
npx prisma migrate deploy
npx prisma migrate status
npx prisma db seed
docker compose up -d
docker compose down
```

## Troubleshooting

### Registration Fails

Make sure the BFF is running:

```sh
BFF_PORT=38090 npm run dev:bff
```

Then verify:

```sh
curl -sS -D - http://127.0.0.1:38090/api/auth/me -o /tmp/auth-me.json
```

`401 Unauthorized` is expected when anonymous; connection failure means the BFF is down.

### Prisma Cannot Connect

Confirm Docker services are up and `DATABASE_URL` points at host port `35432`:

```sh
docker compose up -d
npx prisma migrate status
```

### Vite Loads But API Calls Fail

Vite only serves the frontend. Start the BFF on `38090` so `/api` proxy requests have a target.

### IPEDS Extraction Fails

Run dependency checks:

```sh
backend/venv/bin/python scripts/ipeds/extract_access_to_csv.py --check-only
```

If local `mdbtools` is unavailable, use the Docker extractor mode described in [scripts/ipeds/README.md](scripts/ipeds/README.md).
