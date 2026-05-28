# AGENTS.md

## Project Source Of Truth
- Plane is the only task tracker for this project. For complex tasks (e.g., new features, refactoring, multi-file architectural changes), list project issues and move the matched issue to `In Progress` before planning or coding; if none exists, create one in `In Progress`. For simple, trivial tasks (e.g., single-line edits, configuration tweaks, typos, simple UI text adjustments), creating or moving a Plane issue is NOT required.
- Plane metadata: workspace `sheenvita`, project `Collage Major`, project ID `15c381fa-d6ad-4f10-8c47-2b04a3a342b5`.
- Plane state IDs: `Backlog` `e51c56b6-8ef9-4b10-baaf-37b05bc94925`, `Todo` `16406b06-6ecc-4701-b8fc-0e807f5b9e4c`, `In Progress` `c7701ec6-17bc-4b40-a72f-2970f9f6cdc9e`, `Done` `aa17c124-ecbb-4e70-bfde-7c607685f9f3`, `Cancelled` `08e8c222-091a-4597-9fd0-9969ceb12e5a`.
- Plane CLI: `node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js list-issues sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5`.
- For Plane create/update payloads containing HTML or nested JSON, write a temporary JSON file, pass its path to the CLI, then delete the temp file. The CLI wraps responses as `{ success, data }`; extract issue fields from `data`. Issue lists are paginated under `data.results`.
- At task completion, transition the Plane issue to `Done` and include modified files, key decisions, and verification results in `description_html`.
- 必须及时提取对话中的用户新需求，整理并以 PRD 文档的形式记录到 `docs/prd/` 目录中，确保项目的需求追踪机制完整。

## Architecture Map

Read these documents first before making any structural changes:

| Doc | Purpose |
|-----|---------|
| [01-system-overview](docs/architecture/01-system-overview.md) | C4 architecture, 5 containers, communication paths |
| [02-module-architecture](docs/architecture/02-module-architecture.md) | Code organization, server.ts sections, frontend modules |
| [03-data-architecture](docs/architecture/03-data-architecture.md) | 4 data domains, role vs userType resolution |
| [04-auth-security-architecture](docs/architecture/04-auth-security-architecture.md) | Auth flow, unified user model, entitlement gaps |
| [05-api-contracts](docs/architecture/05-api-contracts.md) | All API routes grouped by domain |
| [06-deployment](docs/architecture/06-deployment.md) | Dev setup, env vars, production checklist |
| [07-developer-guide](docs/architecture/07-developer-guide.md) | Onboarding, how-tos, common pitfalls |

## System Containers

```
Browser (:38030) ←Vite→ Express BFF (:38090) ←Prisma PG Adapter→ PostgreSQL (:35432)
                              ↕ /api/proxy                           ↕
                         FastAPI (:8000)                      Redis (:36379)
                         (Python data pipeline)               (sessions, cache)
```

| Container | Port | Technology | Owns |
|-----------|------|------------|------|
| React SPA | 38030 | Vite + React 19 + Tailwind | UI rendering, client routing |
| Express BFF | 38090 | Express + Better Auth + Prisma 7 | Auth, API, entitlements, PDF, Stripe |
| FastAPI Pipeline | 8000 | FastAPI + Scrapy + Celery | Data ingestion, crawling, IPEDS ETL |
| PostgreSQL | 35432 | pgvector/pg16 | All persistent data (25+ models) |
| Redis | 36379 | redis:alpine | Better Auth sessions, comparison cache |

### Key Architecture Decisions

- **Unified User Model**: Better Auth writes directly to Prisma's `User` table (`user.modelName = "User"`). No separate `"user"` table. The `syncAppUserFromAuthUser()` hack has been removed.
- **Better Auth tables**: `account`, `session`, `verification` are managed by Better Auth directly via raw PG pool (not Prisma). FK points to `User(id)`.
- **Role vs UserType**: `userType` = persona (STUDENT/COUNSELOR/PARENT), `role` = entitlement tier (GUEST/FREE/PRO/COUNSELOR/ADMIN). Both fields serve different purposes.
- **Entitlement enforcement**: Currently client-side only (`useEntitlements.ts`). Backend middleware exists for role/userType checks but not for feature entitlement. Per ADR-004, backend entitlement middleware is required before billing integration.
- **Self-proxy auth**: BFF calls `auth.handler(new Request(baseUrl + '/api/auth/get-session'))` to validate sessions. `BETTER_AUTH_URL` must be correct.

## Data Model Domains

| Domain | Models | Purpose |
|--------|--------|---------|
| **Identity** | User, SavedItem, SubscriptionHistory | Authentication, bookmarks, billing audit |
| **Workspace** | StudentWorkspace, DecisionProfile, ProfileWeight, ComparisonSession, ComparisonOption, CounselorNote, ReportGeneration | Counselor-student collaboration |
| **Data Asset** | University, School, Major, BroadField, DetailedField, UniversityMajorAssociation, CipCode, MajorCipMapping, MajorRanking, UniversityRankingLineage, UniversityExternalIdentifier | University/major taxonomy and rankings |
| **IPEDS** | MetricDefinition, InstitutionMetric, InstitutionProgramField, InstitutionCandidate, InstitutionPublishDecision | Government data with provenance |

## Project Directory Map

```
docs/architecture/    ← System architecture docs (7 files + index)
docs/prd/             ← Product requirements (30+ PRDs, 7 categories)
docs/adr/             ← Architecture Decision Records (6 ADRs)
docs/customer-research/ ← User research and personas
docs/design/          ← Technical design specifications

server/               ← Express BFF (~2300 lines monolith)
  server.ts           ← All routes, auth, middleware in single file
  email.ts            ← Email transporter and templates
  stripe.ts           ← Stripe checkout, webhook, subscription
  pdfGenerator.tsx    ← PDF report generation (@react-pdf/renderer)

src/                  ← React frontend
  pages/              ← 14 route-level components (Login, Register, Join, CounselorDashboard, StudentProfile, Comparison, etc.)
  components/         ← 15 shared UI components
  utils/              ← 6 utilities (useSession, useEntitlements, apiProxy, etc.)
  data/               ← Static seed data (universities, majors)

backend/              ← Python data pipeline
  main.py             ← FastAPI entry point
  celery_app.py       ← Celery worker configuration
  tasks.py            ← Async crawl tasks
  catalog_discovery.py, gemini_parser.py, matcher.py, parser.py
  spiders/catalog_spider.py  ← Scrapy crawler

prisma/               ← Database layer
  schema.prisma       ← 25+ models across 4 domains
  migrations/         ← Migration history
  seed.ts             ← Static data seeding

data/cds/             ← Common Data Set ingestion pipeline
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start Vite dev server (frontend, port 38030) |
| `npm run dev:bff` | Start Express BFF server (port 38090) |
| `npm run build` | Build production frontend bundle |
| `npm run start` | Start Express BFF in production mode |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm run clean` | Remove build artifacts |
| `docker compose up -d` | Start PostgreSQL + Redis |
| `docker compose down` | Stop infrastructure |
| `npx prisma db push` | Sync schema to database |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev --name <name>` | Create + apply migration (dev) |
| `npx prisma studio` | Open database browser |
| `cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000` | Start FastAPI pipeline |

## Data Authenticity

- Never fabricate university admissions, degree programs, schools, divisions, rankings, salary statistics, identifiers, or academic outcomes.
- Every database record and rendered academic/ranking/statistical attribute must trace to an authoritative source and carry a verification cue such as `USN-2026-CS-001`, `IPEDS-123456`, or equivalent source-specific audit ID.
- Do not redirect users to external ranking or university sites from product UI. Show static in-platform citations, badges, verification IDs, and source names instead.
- For U.S. universities, prefer IPEDS/Scorecard identifiers such as `scorecardUnitId`; for Wikidata, use stable properties such as IPEDS ID `P1771` and QS ID `P5584`.
- Rankings can contain ties. Preserve tied ranks from authentic sources; only null out non-matching records when purifying ranking sync output.
- When mapping official university programs to standard majors, map to verified national major IDs/CIP-aligned entries and keep the official program name intact.

## Absolutely Forbidden

- Do not invent, infer, or "fill in" any university, program, ranking, admissions, salary, school, or source data without authoritative provenance.
- Do not write fake citations, fake audit IDs, fake verification flags, placeholder rankings, or guessed IPEDS/Wikidata/QS identifiers into code, seed data, database records, screenshots, or UI copy.
- Do not add outbound UI links or redirects to external ranking/university sites as a validation shortcut; verification must remain in-platform.
- Do not start implementation, planning, or cleanup work for complex tasks without a corresponding Plane issue moved to `In Progress` (simple, trivial tasks are exempt).
- Do not bypass Prisma 7 driver-adapter setup by instantiating `new PrismaClient()` without the required adapter in runtime or standalone database scripts.
- Do not change configured service ports to dodge conflicts. Free the configured port and restart the intended service instead.
- Do not edit generated, dependency, cache, or environment directories such as `node_modules/`, `dist/`, `backend/venv/`, `.git/`, or `.DS_Store` unless the user explicitly asks.
- Do not commit secrets, API keys, private user data, raw personal data, or credentials into `AGENTS.md`, `memory/`, source files, seed files, or Plane updates.
- Do not delete or revert user changes, scratch investigations, migrations, seed data, or dirty working-tree files unless the user explicitly requests that exact cleanup.

## Architecture Rules

- The app blends static curated frontend data with dynamic PostgreSQL records. `server/server.ts` queries Prisma, then merges DB universities, schools, majors, metrics, and rankings with static premium university metadata.
- `vite.config.ts` mounts frontend dev on port `38030` and proxies `/api` to the BFF on `38090`. Keep configured ports stable; resolve conflicts by freeing the configured port, not by inventing random alternatives.
- Prisma 7 is configured through `prisma.config.ts`; `schema.prisma` intentionally has no datasource `url`.
- Runtime Prisma clients in app or standalone scripts must use `pg.Pool`, `@prisma/adapter-pg`, and `new PrismaClient({ adapter })`.
- PostgreSQL and Redis are provided by `docker-compose.yml` on host ports `35432` and `36379`.
- The frontend has resilient fallbacks: dynamic DB APIs should degrade to static definitions when the DB/BFF is unavailable, and Redis-backed proxy cache should fall back to in-memory cache.
- The FastAPI backend runs crawl/parse jobs with local `BackgroundTasks` first-class; Celery/Redis is optional. Status polling reads JSON task files when present.
- Scrapy/Twisted should run in isolated subprocesses (`scrapy runspider ...`) rather than inside FastAPI/Celery worker threads.
- Better Auth tables (`account`, `session`, `verification`) are managed directly by Better Auth via raw PG pool. Their FK references `User(id)`. Do not manage these through Prisma.
- When adding a new API route, add it before the static file serving section in `server/server.ts` and update `docs/architecture/05-api-contracts.md`.
- When adding a new Prisma model, push schema, regenerate client, type-check, and update `docs/architecture/03-data-architecture.md`.

## Coding Conventions

- Keep frontend data types in sync with `src/types.ts`, Prisma models, seed data, and BFF response mapping.
- When adding locale support, update `src/utils/chineseLocalization.ts` and pass `language`/translation helpers through component props instead of scattering ad hoc ternaries.
- For duplicated JSX text conversions, prefer a targeted Node regex script in `scratch/` and inspect the diff rather than hand-editing dozens of near-identical branches.
- For interactive visualizations, custom SVG helpers are acceptable when they avoid fragile library configuration and keep dimensions stable across responsive layouts.
- For cross-widget state such as landing-page search and dashboard search, lift state to the nearest common parent and pass explicit props.
- For university school/category filters, compute visible categories from the active filtered majors and render a polished empty state when a degree level has no programs.
- For coordinate-based diagrams such as prerequisite paths, calculate SVG links from container-relative `getBoundingClientRect()` values on resize, scroll, and drag.
- When packaging repository scripts into an autonomous AI agent skill directory (under `.agents/skills/`), copy all parent/sibling dependencies (helpers, configurations, schemas) to maintain import integrity. Update all script command paths in the skill's `SKILL.md` to reference the localized files under the skill's subdirectory, ensuring absolute self-containment.

## Ingestion And Matching Pitfalls

- Public Wikidata SPARQL can time out or rate-limit. Use small batches, strict HTTP timeouts, exponential backoff, and local fallback seed data.
- Avoid broad `skos:altLabel` SPARQL matches. Prefer indexed exact English label checks and skip short acronyms locally.
- Clean Prisma-only URL parameters such as `?schema=public` before using native drivers like `psycopg2`.
- For pgvector setup, create the `vector` extension before registering vector adapters; initial migration connections should run with vector registration disabled.
- If Gemini or another LLM parser is exhausted or rate-limited, trigger deterministic regex/heuristic parsing for course requirements and prerequisites.
- For database-driven localization, query the DB for all unique lookup names and complete the dictionary for records that exist only in PostgreSQL.
- When static university data changes, re-run `npx prisma db seed` if the UI is served from BFF/PostgreSQL-blended endpoints.

## Update Rules

- Add only reusable, project-specific knowledge to this file: paths, commands, schemas, ports, source-of-truth rules, and recurring pitfalls.
- Move task history, long lessons, raw logs, and one-time plans to `memory/` or Plane. Do not append long post-task narratives here.
- Replace stale guidance in place. Do not add contradictory rules.
- Keep secrets, tokens, private personal data, and unverified claims out of both `AGENTS.md` and `memory/`.
