# Project Notes

This file preserves condensed historical context that is useful but too bulky for prompt-resident `AGENTS.md`. Keep durable rules in `AGENTS.md`; keep task narratives and lower-frequency lessons here.

## Historical Strategy Notes

- Plane synchronization has been a recurring source of drift. Successful agents created or updated Plane issues in parallel with local planning artifacts, used robust temporary JSON payload files for HTML-rich updates, and always recorded modified files plus verification results before closing issues.
- Prisma 7 migration work established the current pattern: keep datasource URLs in `prisma.config.ts`, use `@prisma/adapter-pg` and `pg.Pool` for runtime clients and standalone scripts, and avoid old direct datasource initialization options.
- Docker port conflicts previously caused containers to start without host bindings. Reliable recovery was to stop the conflicting process, run `docker compose down`, then recreate services instead of changing configured app ports.
- Ranking and university ingestion stabilized after switching from broad public searches to targeted identifiers: IPEDS/Scorecard for U.S. schools, Wikidata IPEDS `P1771`, Wikidata QS `P5584`, source-specific ranking audit IDs, fallback datasets, and tie-preserving sync.
- SPARQL ingestion became reliable after replacing heavy `skos:altLabel` scans with indexed exact English label checks, local acronym filtering, strict timeouts, pagination, and fallback data.
- Ranking cleanup required deterministic allocation and purification: seed verified elite ranks first, distribute fallback ranges only when clearly marked as fallback, preserve direct ties, and null ranks for non-matching records.
- Curriculum crawling became stable by isolating Scrapy/Twisted in subprocesses, using FastAPI `BackgroundTasks` as a local execution path, treating Celery/Redis as optional, and storing task status in JSON files for uniform polling.
- Parser resilience improved after adding deterministic regex fallbacks for LLM failures such as `RESOURCE_EXHAUSTED`, especially for credit distributions, required courses, and prerequisite codes.
- Database and vector setup issues were resolved by cleaning ORM-specific connection parameters for native drivers and creating the pgvector extension before registering vector adapters.
- Frontend performance and UX improved through state lifting between landing and dashboard search, pre-wired entitlement gates, guest-mode paywall interceptions, custom SVG charts, and dynamic empty states for degree-level filters.
- Localization work succeeded by centralizing translations in `src/utils/chineseLocalization.ts`, extending component language props, translating dynamic data in memoized transformations, and using targeted scripts for repetitive JSX string conversions.
- University navigator data integrity issues included substring classification bugs such as matching `art` inside `Dartmouth`; prefer word boundaries and explicit category rules in enrichment scripts.
- Static premium university data and PostgreSQL records are blended at runtime. When updating official university majors, seed both static source data and PostgreSQL so the BFF output reflects the change.
- Previous UI/seed milestones include Harvard official undergraduate concentration seeding, multi-source major rankings, graduate/doctoral degree-level filtering, radar charts, cascade-card demands previews, and in-platform verification badges. Check Plane issue history for full task details.

## Source And Verification Reminders

- Authoritative university program data should come from official handbooks/catalogs or recognized public datasets. Example: Harvard undergraduate concentrations were aligned to the Harvard College Office of Undergraduate Education concentration handbook and recorded with a Harvard-specific audit ID.
- Academic routing should be deterministic: map verified standard majors into generic or official school divisions without inventing schools or programs.
- UI validation should retain users in-platform: source names, static citations, verification IDs, and badges are preferred over outbound links.

## Local Tooling Notes

- Scratch scripts under `scratch/` have been used for ingestion checks, ranking cleanup, Plane batch updates, and targeted file rewrites. Treat them as local utilities and verify behavior before reusing.
- If a compaction or interrupted edit leaves JSX syntax damaged, inspect terminal errors and conversation logs if available, then restore the nearest missing conditional/container structure before broad refactors.
