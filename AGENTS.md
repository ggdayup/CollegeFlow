# AGENTS.md

## Project Source Of Truth
- Plane is the only task tracker for this project. For complex tasks (e.g., new features, refactoring, multi-file architectural changes), list project issues and move the matched issue to `In Progress` before planning or coding; if none exists, create one in `In Progress`. For simple, trivial tasks (e.g., single-line edits, configuration tweaks, typos, simple UI text adjustments), creating or moving a Plane issue is NOT required.
- Plane metadata: workspace `sheenvita`, project `Collage Major`, project ID `15c381fa-d6ad-4f10-8c47-2b04a3a342b5`.
- Plane state IDs: `Backlog` `e51c56b6-8ef9-4b10-baaf-37b05bc94925`, `Todo` `16406b06-6ecc-4701-b8fc-0e807f5b9e4c`, `In Progress` `c7701ec6-17bc-4b40-a72f-2970f96cdc9e`, `Done` `aa17c124-ecbb-4e70-bfde-7c607685f9f3`, `Cancelled` `08e8c222-091a-4597-9fd0-9969ceb12e5a`.
- Plane CLI: `node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js list-issues sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5`.
- For Plane create/update payloads containing HTML or nested JSON, write a temporary JSON file, pass its path to the CLI, then delete the temp file. The CLI wraps responses as `{ success, data }`; extract issue fields from `data`. Issue lists are paginated under `data.results`.
- At task completion, transition the Plane issue to `Done` and include modified files, key decisions, and verification results in `description_html`.
- 必须及时提取对话中的用户新需求，整理并以 PRD 文档的形式记录到 `docs/prd/` 目录中，确保项目的需求追踪机制完整。


## Project Roadmap
- `src/App.tsx`: top-level React state composition, language/auth/search orchestration, and dashboard gating.
- `src/components/`: primary UI surfaces, including landing page, major directory, university navigator, analytics charts, ROI charts, prerequisite flow, and radar/demand visuals.
- `src/data/majorsData.ts` and `src/data/universitiesData.ts`: static seed definitions used by the frontend and Prisma seed pipeline.
- `src/ingest/`: authoritative ingestion and ranking sync scripts; prefer targeted sources and stable identifiers over broad public queries.
- `src/utils/`: API proxy/cache helpers, entitlement simulation, localization, matching, and subject demand helpers.
- `server/server.ts`: Express BFF on `BFF_PORT` or `38080`; Vite proxies `/api` to `http://localhost:38090` in `vite.config.ts`.
- `backend/`: FastAPI catalog crawler/parser service with Celery/Redis optional path and local background-task fallback.
- `backend/data/tasks/` and `backend/data/crawls/`: local task state and crawl artifacts for curriculum parsing.
- `backend/spiders/catalog_spider.py`: Scrapy crawler; run it as a subprocess from wrappers instead of inside worker threads.
- `prisma/schema.prisma`, `prisma/seed.ts`, and `prisma/migrations/`: PostgreSQL schema, seed, and migrations.
- `docs/adr/`: architectural decisions for PostgreSQL source of truth, ranking lineage, BFF shape, and entitlement boundaries.
- `scratch/`: local investigation and batch scripts. Do not treat scratch scripts as production entry points unless verified.
- `memory/project-notes.md`: condensed historical lessons moved out of this file; keep reusable rules here.

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

## Architecture Understanding
- The app blends static curated frontend data with dynamic PostgreSQL records. `server/server.ts` queries Prisma, then merges DB universities, schools, majors, metrics, and rankings with static premium university metadata.
- `vite.config.ts` mounts frontend dev on port `38030` and proxies `/api` to the BFF target on `38090`. Keep configured ports stable; resolve conflicts by freeing the configured port, not by inventing random alternatives.
- Prisma 7 is configured through `prisma.config.ts`; `schema.prisma` intentionally has no datasource `url`.
- Runtime Prisma clients in app or standalone scripts must use `pg.Pool`, `@prisma/adapter-pg`, and `new PrismaClient({ adapter })`.
- PostgreSQL and Redis are provided by `docker-compose.yml` on host ports `35432` and `36379`.
- The frontend has resilient fallbacks: dynamic DB APIs should degrade to static definitions when the DB/BFF is unavailable, and Redis-backed proxy cache should fall back to in-memory cache.
- The FastAPI backend runs crawl/parse jobs with local `BackgroundTasks` first-class; Celery/Redis is optional. Status polling reads JSON task files when present.
- The Common Data Set (CDS) data asset utilizes a PostgreSQL-native flat facts schema. Ingested JSON trees (leaves, empty structures, and explicit nulls) from the 16 target universities are recursively flattened into the unified `cds_values` table with zero data loss, supporting dynamic on-the-fly fields dictionary (`canonical_fields`) additions.

## Commands
- Install frontend dependencies: `npm install`.
- Frontend dev server: `npm run dev` (`vite --port=38030 --host=0.0.0.0`).
- BFF server: `BFF_PORT=38090 npm run dev:bff` when matching the Vite proxy target.
- Production BFF start: `npm start`.
- Type check/lint: `npm run lint` (`tsc --noEmit`).
- Build: `npm run build`.
- Prisma seed: `npx prisma db seed`.
- Docker services: `docker compose up -d`; if ports were previously conflicted, stop the conflicting process and run `docker compose down` before recreating services.
- Backend API dev: `backend/venv/bin/uvicorn backend.main:app --reload` from the repo root after installing `backend/requirements.txt` into `backend/venv`.
- PostgreSQL CDS Initialization: `backend/venv/bin/python data/cds/CollegeFlow_CDS/database/init_pg_db.py`.
- PostgreSQL CDS Data Ingestion: `backend/venv/bin/python data/cds/CollegeFlow_CDS/database/import_to_pg.py`.
- PostgreSQL CDS Integrity Audit: `backend/venv/bin/python data/cds/CollegeFlow_CDS/database/verify_pg_integrity.py`.

## Coding Conventions
- Keep frontend data types in sync with `src/types.ts`, Prisma models, seed data, and BFF response mapping.
- When adding locale support, update `src/utils/chineseLocalization.ts` and pass `language`/translation helpers through component props instead of scattering ad hoc ternaries.
- For duplicated JSX text conversions, prefer a targeted Node regex script in `scratch/` and inspect the diff rather than hand-editing dozens of near-identical branches.
- For interactive visualizations, custom SVG helpers are acceptable when they avoid fragile library configuration and keep dimensions stable across responsive layouts.
- For cross-widget state such as landing-page search and dashboard search, lift state to the nearest common parent and pass explicit props.
- For university school/category filters, compute visible categories from the active filtered majors and render a polished empty state when a degree level has no programs.
- For coordinate-based diagrams such as prerequisite paths, calculate SVG links from container-relative `getBoundingClientRect()` values on resize, scroll, and drag.
- When packaging repository scripts into an autonomous AI agent skill directory (under `.agents/skills/`), copy all parent/sibling dependencies (helpers, configurations, schemas) to maintain import integrity. Update all script command paths in the skill's `SKILL.md` to reference the localized files under the skill's subdirectory, ensuring absolute self-containment.
- The verification script `verify_canonical.py` expects lowercase snake_case second-level keys (e.g., `c1_applications`, `c9_test_scores`) in `CDS_canonical.json`. Keep the top-level keys in PascalCase (e.g., `C_Admissions`), but ensure all nested keys are lowercase snake_case to match both value range checks and completeness schemas.


## Ingestion And Matching Pitfalls
- Public Wikidata SPARQL can time out or rate-limit. Use small batches, strict HTTP timeouts, exponential backoff, and local fallback seed data.
- Avoid broad `skos:altLabel` SPARQL matches. Prefer indexed exact English label checks and skip short acronyms locally.
- Clean Prisma-only URL parameters such as `?schema=public` before using native drivers like `psycopg2`.
- For pgvector setup, create the `vector` extension before registering vector adapters; initial migration connections should run with vector registration disabled.
- Scrapy/Twisted should run in isolated subprocesses (`scrapy runspider ...`) rather than inside FastAPI/Celery worker threads.
- If Gemini or another LLM parser is exhausted or rate-limited, trigger deterministic regex/heuristic parsing for course requirements and prerequisites.
- For database-driven localization, query the DB for all unique lookup names and complete the dictionary for records that exist only in PostgreSQL.
- When static university data changes, re-run `npx prisma db seed` if the UI is served from BFF/PostgreSQL-blended endpoints.
- Dynamic CDS Schema Expansion: If a new canonical path appears in a target JSON tree during database ingestion but is missing from pre-seeded definitions, dynamically register it in `canonical_fields` to prevent constraint violations.

## Update Rules
- Add only reusable, project-specific knowledge to this file: paths, commands, schemas, ports, source-of-truth rules, and recurring pitfalls.
- Move task history, long lessons, raw logs, and one-time plans to `memory/` or Plane. Do not append long post-task narratives here.
- Replace stale guidance in place. Do not add contradictory rules.
- Keep secrets, tokens, private personal data, and unverified claims out of both `AGENTS.md` and `memory/`.
