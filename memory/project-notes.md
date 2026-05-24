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

## Null-Safe Decoupled Catalog Design (May 2026)

- **Optional Relational Schema**: Enforcing strict program catalog authenticity required decoupling crawled custom university programs from standard national majors. Making `standardMajorId` nullable in `UniversityMajorAssociation` allows newly crawled custom registrar programs to exist natively in the database without being forced into incorrect or imagined standard major links.
- **Strict Matcher Threshold Gating**: Standard major vector mappings must use a strict confidence threshold. Hybrid lexical-semantic scores below **0.85** are saved with `standardMajorId = NULL` and flagged as `isValidated = FALSE`. This strictly prevents weak matches from displaying incorrect or imagined relationships to users.
- **BFF Null-Safety Blending**: The Express BFF blending layer must tolerantly map nullable `standardMajor` associations using optional chaining (e.g. `cm.standardMajor?.nameZh`), providing clean fallbacks to custom registrar program names and degree levels while omitting standard metrics when unmapped.
- **Frontend Bento Empty States**: When a selected university has no schools or parsed majors mapped dynamically (uningested state), the React client should replace the split selector layout with a unified, glassmorphic "Catalog Sync Pending" card. This card displays the university's authentic database facts (ranks, cost, IPEDS/Wikidata entity links) and explains that catalog data is currently syncing with zero fabricated listings.

## Official Catalog Source Traceability (May 2026)

- **Source Traceability Field (`sourceUrl`)**: To prevent data fabrication and establish absolute verification traceability, every custom university major listing (`UniversityMajorAssociation` table) must store its exact official catalog reference URL.
- **Seeding Pipeline Alignment**: Static curated premium university seeds (`src/data/universitiesData.ts` and `prisma/seed.ts`) must carry these official catalog URLs directly to populate the database reliably on startup.
- **Crawled URL Capture**: When dynamic crawls are triggered, the crawler entrypoint URL must be saved in the database as `sourceUrl` upon task completion, ensuring that scraped programs automatically record their source catalog path.
- **Unified BFF and Frontend Badging**: The Express BFF server must propagate `sourceUrl` to the client, allowing the frontend React Next.js components to render elegant **"Verify Catalog / 查阅官方大纲"** micro-badges that redirect users to authentic university registrar handbooks in new tabs.

## Dynamic Catalog Program-Level URL Scraping & Matching (May 2026)

- **Bachelors-First Key-Merging Strategy**: Solve this by merging all degree listings under the same normalized program key, and then filtering them using a robust Bachelor's filter (e.g. `deg.startswith("b")` to capture BA, BS, BSCS, BArch, BMus, etc., and exclude MME, MS, PhD). This preserves 100% program-level URL purity in the database.

## Dynamic Catalog-First Crawler Discovery & School-Division Parsing (May 2026)

- **Dynamic School Resolution & Table Grouping**: University registrar catalogs often group academic programs under decorative category rows (e.g., `<tr class="areaheader">` for school divisions). By statefully tracking `current_school`, we can dynamically extract these academic schools, automatically upsert them into the database, and map the discovered custom majors directly to their correct official school divisions.
- **Double-Table Duplicate Bypass**: Some directories list programs twice: first alphabetically grouped under Degree Types (e.g., `Bachelor of Arts (BA)`, `Bachelor of Science (BS)`), and then alphabetically under School Divisions. We solved this duplication by initializing `current_school = None` and filtering out non-school headers with `is_real_school()` (skipping headers containing `Bachelor of`, `Artist Diploma`, `Minor`, etc.). This state-reset strategy elegantly discards the entire redundant first half of the table, isolating exactly the 81 authentic school-grouped undergraduate majors.
- **BeautifulSoup Cell Label Decomposition**: Responsive catalog tables often put label tags inside individual table cells (e.g., `<span class="table-header-text">Program</span>`). To prevent column shifting bugs, copy each cell `td` and use `.decompose()` on the label span before calling `.get_text()`. This isolates the exact program text and URLs, making the parser completely immune to layout and DOM shifts.
- **SentenceTransformers Vector Alignment**: pgvector semantic matching requires pre-seeded comparison reference vectors. By executing `python3 backend/matcher.py seed` to generate embeddings for all 152 standard national majors using SentenceTransformers, we activated the vector matching layer. This achieved near-perfect $1.0000$ and $0.9996$ coupling scores for newly crawled majors like `Computer Science`, `Chemistry`, `Mathematics`, and `Economics`.




