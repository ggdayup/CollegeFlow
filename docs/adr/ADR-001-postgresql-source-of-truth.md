# ADR-001: PostgreSQL as Business Source of Truth

*   **Status:** Accepted
*   **Scope:** Data Sovereignty & Integrity
*   **Author:** Antigravity (AI Architect)
*   **Date:** 2026-05-24

---

## Context

The application currently manages collegiate and academic major statistics in two overlapping data layers:
1.  **Static Seed Files:** `src/data/majorsData.ts` and `src/data/universitiesData.ts`. These represent hand-curated baseline stats (earnings, descriptions, standard school divisions).
2.  **Operational Database:** PostgreSQL (managed via Prisma v7 ORM). The database has been expanded with:
    *   124,132 dynamically generated custom university majors.
    *   Unified 5D academic demands (including biology).
    *   Dynamic earnings multipliers.

Having two parallel data definitions poses a high systemic risk of data divergence. If frontend components query static data files directly while other panels query Vite REST endpoints, calculations (such as average cost or median salary) can desynchronize, rendering inaccurate dashboard metrics.

---

## Proposed Decision

We declare **PostgreSQL (via Prisma ORM)** as the absolute, canonical business source of truth for the entire application.

### Implementation Rules

1.  **Seed/Fallback Only**: The static datasets (`src/data/majorsData.ts` and `src/data/universitiesData.ts`) are strictly demoted to:
    *   **Seed Baselines**: Used exclusively by `prisma/seed.ts` to hydrate the database from a cold start.
    *   **Client Offline Fallbacks**: Used strictly within resilient client-side loaders if the BFF backend endpoint is entirely unreachable or in offline local-only testing environments.
2.  **API-Priority Hydration**: Frontend components MUST prioritize fetching real-time data from BFF/Express API endpoints (e.g., `/api/universities`).
3.  **Strict View-Model Contracts**: The runtime representation of a university or standard major is governed by a unified TypeScript contract in `src/types.ts`. Handlers mapping DB entities to active React view-models must clean or inject properties dynamically (such as generating HSL visual gradient tokens or computing acronym school divisions).

---

## Consequences

*   **100% Data Consistency**: All widgets, filters, and dashboard panels read from the same source of truth, removing discrepancies in salaries, unemployment, or ranking.
*   **Reduced Front-end Bundle Weight**: The massive universities list and majors collection do not need to be compiled directly into the production React bundle, accelerating Largest Contentful Paint (LCP) and improving Core Web Vitals.
*   **Decoupled Sync Iterations**: The ingestion scripts (SPARQL, NCES tools) can populate the database in real-time, and changes are instantly active without needing a code redeployment or rebuild.
