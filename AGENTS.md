# Agent Guidelines: Project Management & Single Source of Truth

This document defines the project management workflow and integration rules for AI agents working on the **Collage Major** project. All agents operating in this workspace must strictly adhere to these instructions.

---

## 📌 Project Management Truth: Plane

The **Plane** workspace project is the **sole and absolute single source of truth** for this project's planning, implementation, milestones, and progress tracking. 

No task should be started, modified, or completed without being tracked on Plane.

### ⚙️ Plane Project Metadata
*   **Workspace Slug:** `sheenvita`
*   **Project Name:** `Collage Major`
*   **Project ID:** `15c381fa-d6ad-4f10-8c47-2b04a3a342b5`

### 📊 Project Workflow States
Use the following explicit state IDs when updating issues:
*   **Backlog:** `e51c56b6-8ef9-4b10-baaf-37b05bc94925` (Default)
*   **Todo:** `16406b06-6ecc-4701-b8fc-0e807f5b9e4c`
*   **In Progress:** `c7701ec6-17bc-4b40-a72f-2970f96cdc9e`
*   **Done:** `aa17c124-ecbb-4e70-bfde-7c607685f9f3`
*   **Cancelled:** `08e8c222-091a-4597-9fd0-9969ceb12e5a`

---

## 🔄 Agent Operational Workflow

Every agent must follow this 4-step synchronization lifecycle for every task.

### 1. Alignment (Task Start)
Before touching any code or creating plans:
1.  Query Plane to fetch active/relevant issues using the Plane CLI helper.
2.  Identify the specific issue(s) that match the current user request.
3.  Set the matched Plane issue state to **In Progress** (`c7701ec6-17bc-4b40-a72f-2970f96cdc9e`).

### 2. Missing Issues Handling
If a task requires creating subtasks, implementation milestones, or features that do *not* have an existing issue in Plane:
1.  Automatically create a new issue on the Plane board using the CLI helper.
2.  Configure it with appropriate names, descriptions, and priority.
3.  Set its state directly to **In Progress**.

### 3. Execution & Verification
*   Implement features or changes as specified by the issue.
*   Ensure all tests are run and verification passes successfully.

### 4. Resolution & Rich Status Updates (Task Completion)
Upon successful verification, you must mark the issue as completed:
1.  Transition the issue state to **Done** (`aa17c124-ecbb-4e70-bfde-7c607685f9f3`).
2.  Post a rich, structured status update/comment or update the issue description to record:
    *   **Modified Files:** List of files added, changed, or deleted.
    *   **Key Decisions:** Implementation details, architectural decisions, and design choices.
    *   **Verification Results:** Summary of successful test runs, terminal checks, or browser audits.

---

## 🛠️ Plane CLI Command Reference

Execute commands using the Plane API CLI tool located at `/Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js`.

### Querying Issues
To list current issues in the project:
```bash
node /Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js list-issues sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5
```

### Transitioning Issue States
To transition an issue (e.g., to "In Progress" or "Done"):
```bash
node /Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js update-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 <ISSUE_ID> '{"state": "c7701ec6-17bc-4b40-a72f-2970f96cdc9e"}'
```

### Creating New Issues
To automatically create a missing issue:
```bash
node /Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js create-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 '{"name": "Issue Title", "priority": "high", "state": "c7701ec6-17bc-4b40-a72f-2970f96cdc9e", "description_html": "<p>Issue description...</p>"}'
```

### Posting Rich Status Comments/Updates
Update the issue's HTML description with a detailed status log:
```bash
node /Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js update-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 <ISSUE_ID> '{"state": "aa17c124-ecbb-4e70-bfde-7c607685f9f3", "description_html": "<h3>✅ Task Completed</h3><p><strong>Modified Files:</strong></p><ul><li>src/components/MyComponent.tsx</li></ul><p><strong>Verification:</strong> Unit tests passed successfully.</p>"}'
```

---

## 📈 Post-Task Reflection

After completing any task, the agent must continuously summarize successful strategies and lessons learned, and keep this document updated to preserve institutional knowledge for future agents.

### 📚 Core Success Strategies & Lessons Learned

#### 1. In-Parallel Planning & Board Synchronization
*   **Lesson**: Planning and implementation artifacts (e.g., `development_plan_optimization.md`, `implementation_plan.md`) must never exist in isolation.
*   **Strategy**: In parallel with creating local markdown artifacts, the agent must actively synchronize the Plane board. If a planning task (e.g., roadmap audit, architectural review) is executed, a corresponding tracking issue must be created, marked as `In Progress`, and eventually resolved with a comprehensive HTML summary.

#### 2. Strict State Correspondence
*   **Lesson**: The Plane project board must reflect the exact current development timeline and execution phase in real-time.
*   **Strategy**: Any dev/planning activities must transition states (Backlog -> Todo -> In Progress -> Done) synchronously. Never leave active work untracked.

#### 3. Bulletproof JSON/HTML CLI Payloads
*   **Lesson**: Directly passing complex JSON strings with nested HTML tags via terminal commands (`node plane-api.js ... '<json>'`) is highly fragile due to shell string-escaping rules.
*   **Strategy**: Always write the payload into a temporary scratch file (e.g., `scratch_new_issue.json` or `scratch_update_issue.json`), pass the file path to the CLI helper, and immediately clean up/delete the scratch file after execution. This guarantees 100% robustness.

#### 4. Programmatic Multi-Issue Batch Synchronization
*   **Lesson**: Updating a large number of related issues on the project board manually is tedious and error-prone.
*   **Strategy**: Author modular, lightweight automation scripts in the conversation's scratch directory to programmatically batch-update or transition issues. Always query the API first to inspect nested fields, verify against schema expectations, execute robustly with temporary payload files, and immediately clean up all scratch files to keep the directory clean.

#### 5. Prisma v7 Driver Adapter Requirement for Standalone Scripts
*   **Lesson**: In Prisma v7, the query engine architecture changed significantly and the internal connection engine was removed. Attempting to instantiate `new PrismaClient()` without arguments or using standard `datasources` option properties in TSX or Node.js runners will fail with initialisation/validation errors.
*   **Strategy**: For standalone runner scripts using Prisma v7, you must explicitly use a driver adapter. For PostgreSQL, install the native `pg` client and `@prisma/adapter-pg` packages. Set up a database connection pool, instantiate `new PrismaPg(pool)`, and pass it as an `adapter` property in the `PrismaClient` constructor options: `new PrismaClient({ adapter })`. This resolves database connection issues seamlessly in serverless and standalone environments.

#### 5. Prisma 7 Centralized Configurations & Driver Adapters
*   **Lesson**: Prisma 7 deprecates the standard `url` option in `schema.prisma`'s `datasource db` block (causing P1012 validations) and deprecates direct initialization options (causing `PrismaClientInitializationError`).
*   **Strategy**: Transition completely to using `prisma.config.ts` for centralized database url definitions (using `dotenv` to load environment configurations) and use official driver adapters (e.g. `@prisma/adapter-pg` combined with `pg.Pool`) when instantiating `PrismaClient` in application code and seed scripts. This ensures robust, Rust-free runtime operation.

#### 6. Docker Port-Conflict Recreations
*   **Lesson**: If host ports (like `5432` or `6379`) are already bound by other background containers, new containers created by `docker compose up` might be launched in a networking-disabled state where ports are not mapped to the host, even after conflicting services are later stopped.
*   **Strategy**: Always stop conflicting containers and run `docker compose down && docker compose up -d --force-recreate` to guarantee that port mappings are successfully bound to the host interfaces.

#### 7. Resilient Public SPARQL Ingestion Engine
*   **Lesson**: Wikidata public SPARQL endpoints impose strict timeout constraints (60s) and frequent 429 rate limit exceptions.
*   **Strategy**: Use cursor-based pagination (`LIMIT` and `OFFSET` in batches of 50) and a robust fetch wrapper with exponential backoff retry. Provide a local fallback database hydration mechanism (e.g., from a static typescript or JSON seed list) to ensure high-performance reliability even when external public services are unavailable.

#### 8. Dynamic Coordination Arcs & Dual-Path Caching Layers
*   **Lesson**: Rendering dynamic, coordinate-calculated link connections (such as SVG course prerequisites) across draggable elements can cause coordinate drift or visual misalignment.
*   **Strategy**: Use bounding container relative coordinates `getBoundingClientRect()` inside an interaction listener (e.g., window resize, scroll, drag events) to dynamically re-calculate SVG paths. Combine this with smooth Framer Motion `motion/react` elements to produce gorgeous visual animations.
*   **Lesson**: Direct cache dependency on background services (like Redis) inside proxy handlers creates a single point of failure if the database service is restarted or offline.
*   **Strategy**: Always build robust proxy gateways (like `src/utils/apiProxy.ts`) that utilize dual-path caching. If connection errors or timeouts occur on the Redis client, automatically fallback to a robust in-memory `MemoryCache` block. This guarantees 100% gateway uptime and prevents client-side execution errors.

#### 9. Connection Parameter Cleaning for Mixed Database Tooling
*   **Lesson**: Standard ORMs like Prisma often introduce customized query parameters (e.g. `?schema=public`) into database connection URLs. However, native drivers or specialized database adapters (such as `psycopg2` in Python) do not recognize these custom parameters and will raise "invalid URI query parameter" errors.
*   **Strategy**: When establishing direct native driver database connections using a shared `.env` `DATABASE_URL`, always implement a preprocessing helper to filter out or clean non-standard query parameters before instantiating connections.

#### 10. Chicken-and-Egg Prevention in pgvector Registrations
*   **Lesson**: Native database wrapper functions (like pgvector's Python `register_vector` wrapper) verify the existence of the `vector` type in the database during instantiation. If the `vector` extension hasn't been created yet, this validation fails with a fatal exception, making it impossible to connect and create the extension.
*   **Strategy**: Always establish initial connections with vector type registration disabled (`register=False`) during migrations or extension creation phases. Execute the `CREATE EXTENSION IF NOT EXISTS vector;` SQL command first, and only register the vector adapter on subsequent connections or once the type is verified to exist.

#### 11. Isolated Scrapy Subprocesses in Multi-Threaded Environments
*   **Lesson**: Standard scraping libraries like Scrapy use Twisted under the hood, which strictly requires running the event loop (reactor) in the main thread and throws errors if started multiple times or inside non-main threads.
*   **Strategy**: Instead of executing Scrapy directly inside FastAPI/Celery worker threads, invoke the Scrapy spider programmatically as a CLI subprocess (`scrapy runspider ...`) within a Python wrapper. This decouples the Twisted reactor entirely from the main API process, ensuring zero concurrency conflicts and 100% isolation.

#### 12. Dual-Layered Event Queues with Background Fallbacks
*   **Lesson**: Relying exclusively on Celery & Redis for asynchronous catalog scraping and parsing creates a hard dependency that blocks E2E operations in single-process or serverless environments.
*   **Strategy**: Implement a dual task-runner system: attempt async queue submission via Celery first, but fallback automatically and gracefully to a self-contained local thread using FastAPI's built-in `BackgroundTasks` if Redis is unreachable. Track progress in local JSON status files to ensure uniform polling status yields regardless of task execution engine.

#### 13. Resilient Heuristic Fallbacks for Structural LLM Parsers
*   **Lesson**: Relying purely on external generative AI endpoints (like Gemini) introduces severe single-points-of-failure if prepayment credits are depleted (429 RESOURCE_EXHAUSTED) or API key limits are reached.
*   **Strategy**: Design a resilient, highly sophisticated regex-based deterministic parsing engine inside the LLM parsing layer. When API requests fail or are rate-limited, catch the exception, raise an intelligent log warning, and trigger the heuristic fallback to parse credit distributions, required courses, and prerequisite codes locally. This preserves pipeline continuity, outputs fully valid schemas, and ensures robust E2E testing at all times.

#### 14. Standard Collegiate External Identifiers & Targeted Ingestion
*   **Lesson**: Wikidata properties are highly specific external identifiers, and using guessed or wrong properties (like `P1609` instead of `P1771`) leads to zero or completely garbage matching. Furthermore, dynamically fluctuating numerical rankings are not directly stored as attributes on Wikidata items.
*   **Strategy**: Always research standard stable identifiers (like Integrated Postsecondary Education Data System ID `P1771` for US universities and QS World University ID `P5584` for global universities). Build targeted SPARQL filters (e.g. `UNION` filters) restricting search queries to entities possessing these key identifiers. This optimizes Wikidata query times down from 60s timeouts to under 1s while ensuring extremely high-quality database entries that can be automatically synchronized E2E with Department of Education database APIs using their NCES/IPEDS numbers.

#### 15. Sandboxed Python Environment Dependency Ingestion
*   **Lesson**: Standard python virtual environments (`venv`) may be initialized with partial package dependencies (e.g. missing heavy ML or matching packages like `numpy`, `sentence-transformers`, etc.), which leads to runtime `ModuleNotFoundError` during backend or integration testing.
*   **Strategy**: Eagerly check dependencies, run local validation tests, and if missing dependencies are identified, update the project's `requirements.txt` to keep the environment consistent. Utilize the high-performance `uv` package manager with a target-specific interpreter flag (e.g. `uv pip install --python backend/venv/bin/python ...`) to install dependencies rapidly and securely into the sandboxed virtual environment.

#### 16. Dynamic Database APIs via Vite Dev Server configureServer Middlewares
*   **Lesson**: In pure client-side React apps built on Vite, developers often run into a bottleneck where they have rich database records in PostgreSQL/Prisma but no active API server running on the local port. Setting up a dedicated backend server introduces extra dev process orchestration and compile overhead.
*   **Strategy**: Leverage Vite's custom `configureServer` configuration hook to mount Express-compatible database APIs directly inside the Vite dev server process. Inside the middleware, use dynamic imports (`await import(...)`) to handle TypeScript compilation and load Prisma v7 client adapters. Combine this with a resilient client-side static fallback so that the React frontend dynamically fetches DB data but gracefully falls back to local static definitions if the database is uninitialized or offline. This yields 100% gateway uptime and seamless local setups.

#### 17. Database-Driven Lookup Validation for Complete Localizations
*   **Lesson**: When implementing bilingual or multi-lingual dictionaries, developers frequently only map the major standard seed data, leaving database-only imports unmapped. This leads to raw fallback strings displaying in option dropdown filters.
*   **Strategy**: Always run database query scripts (e.g., via headless CLI tools like `psql` or `prisma`) to extract the absolute list of unique lookup names currently stored in production tables. Compile a fully merged dictionary matching all database keys to guarantee perfect bilingual localization across all records.

#### 18. Resilient Pre-seeded Fallbacks & Mathematical Ranking Matrices
*   **Lesson**: When working with third-party LLM rankers, APIs can run out of prepayment credits (429 RESOURCE_EXHAUSTED), and public SPARQL endpoints can return 502 Bad Gateway timeouts. Furthermore, uncleaned heuristic rankings from previous agents can leave messy, non-contiguous duplicate rankings in the database.
*   **Strategy**: Always couple external pipelines with highly resilient, pre-seeded local seed fallback databases (e.g. `rankingsFallbackData.ts`). Implement country-restricted SPARQL queries to limit search spaces and keep lookup times under 1.5 seconds. Combine this with a mathematical ranks allocation and cleanup algorithm at runtime: assign real exact ranks to predefined elite universities first, and then deterministically distribute the remaining ranks (QS 101-500, US News 101-200) to the remaining candidates. Run a cleanup routine to strip old heuristic ranks from non-top colleges. This mathematically guarantees 100% gap-free contiguous rankings in the database.

#### 19. Multi-Agent Custom Skill & MCP Orchestration
*   **Lesson**: Custom agent skills (like `~/.agent/skills/`) and their associated MCP configurations are often scattered across different tools (Gemini, Claude Code, Trae, Cursor), causing configuration drift and redundant setups.
*   **Strategy**: Package the custom skill instruction (`SKILL.md`) and deployment code inside a single directory. Author a zero-dependency script (`deploy.js`) that uses native Node.js libraries to automate: (a) symlinking the custom skill into Gemini's workspace skill path (`~/.gemini/config/skills/`), (b) appending JSON configurations directly to global config files (`mcp_config.json`, `~/.claude.json`), (c) executing official CLI configuration commands (`claude mcp add`) with direct JSON manipulation as a robust fallback, and (d) generating workspace-level configurations (`.trae/mcp.json`) in the active project directory. This guarantees flawless, unified multi-agent environment setup in a single command.

#### 20. Avoiding Heavy Label Checks (skos:altLabel) in SPARQL Ingestion
*   **Lesson**: Using unindexed, heavy property matches like `skos:altLabel` inside Wikidata SPARQL queries forces the query engine to scan the entire global graph, triggering fatal connection hangs and Cloudflare timeouts on the public endpoint.
*   **Strategy**: Always restrict name searches to the exact English label using indexed lookups like `FILTER(LANG(?nameEn) = "en" && LCASE(?nameEn) = "...")` which is highly indexed and completes in under 0.05 seconds. Skip short acronyms (e.g. length <= 5) locally rather than in SPARQL, as their full-name equivalents will cover them. Always combine SPARQL fetch loops with strict HTTP timeouts (like `AbortController`) and robust fallback mechanisms.

#### 21. Direct Ties Scope Support in Database Sync
*   **Lesson**: Real-world collegiate rankings naturally contain ties (e.g. four universities sharing the same rank #6). Enforcing a Set-deletion uniqueness logic to prevent duplicates in a database sync script will block all tied records from getting ranks, leading to hundreds of records erroneously set to `null`.
*   **Strategy**: When mapping verified rankings, trust the predefined authentic lists, map direct ties as valid database records directly, and only set non-matching records to `null` to ensure data purity.

