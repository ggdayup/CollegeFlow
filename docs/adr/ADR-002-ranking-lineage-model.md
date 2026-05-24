# ADR-002: University Ranking Lineage & Audit Provenance

*   **Status:** Accepted
*   **Scope:** Data Trust & Provenance
*   **Author:** Antigravity (AI Architect)
*   **Date:** 2026-05-24

---

## Context

Rankings (such as QS World University Rankings, US News Best Colleges, and Department of Education Scorecard metrics) are highly sensitive data points that fluctuate annually. Real-world rankings are subject to:
*   **Annual Iterations**: The same university holds different ranks in 2024, 2025, and 2026.
*   **Ties**: Multiple universities frequently share the same rank (e.g. four universities sharing #6).
*   **Methodology Shifts**: Source criteria change, and unverified data leads to distrust.

The current database structure uses raw static columns (e.g., `rankingQs` and `rankingUsNews` integers directly inside the `University` model). This is insufficient because it strips out the provenance metadata: what was the year of this rank? Who imported it? Is it verified by an admin? What is the official URL of the ranking lineage?

---

## Proposed Decision

We decide to deprecate direct integer columns for rankings in favor of a relational **Ranking Lineage Model** that establishes complete audit verification tracking.

### Proposed Database Schema

We will introduce a new junction model `UniversityRankingLineage` connected to the `University` model:

```prisma
model UniversityRankingLineage {
  id            String   @id @default(uuid())
  universityId  String
  university    University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  rankInteger   Int
  year          Int
  source        String   // 'QS', 'US_NEWS', 'DOE_SCORECARD'
  isGlobal      Boolean  @default(false)
  tieCount      Int      @default(0)
  sourceUrl     String?  // Reference verification URL
  isVerified    Boolean  @default(false)
  verifiedBy    String?  // Admin username or automation engine identifier
  verifiedAt    DateTime?
  createdAt     DateTime @default(now())

  @@unique([universityId, year, source, isGlobal])
}
```

### Transition Strategy

1.  **Migration Setup**: Introduce `UniversityRankingLineage` into `schema.prisma`.
2.  **Backfill Lineage**: During sync operations, populate the lineage table from NCES / NCES NCES matching batches.
3.  **UI Lineage Tooltip**: Frontend rank indicators (e.g. QS #4) must display an interactive verification pill showing:
    *   *Source Name* (e.g., QS World 2025)
    *   *Audit Lineage Status* (e.g. Verified by Wikidata Sync on 2026-05-24)
    *   *Direct link to verification source*.

---

## Consequences

*   **100% Audit Provenance**: Users and administrators can inspect exactly when, how, and why a ranking was computed, eliminating trust concerns.
*   **Contiguous Ranking Validation**: Simplifies building tie-aware and gap-free mathematical ranking matrices.
*   **Historical Dashboard Widgets**: Enables rendering rich multi-year performance charts showing a university's competitive ranking trajectory over time.
