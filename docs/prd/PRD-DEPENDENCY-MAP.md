# PRD Dependency Map

## Rule

Dependencies should move from stable upstream product knowledge to downstream user and commercial surfaces:

```text
00-charter
  -> 10-data-assets
    -> 20-intelligence-products
      -> 30-user-experience
        -> 40-collaboration
          -> 50-commercial
            -> 60-trust-operations
```

## Current Map

| PRD | Depends On | Primary Consumers |
| --- | --- | --- |
| `PRD-000-product-charter` | None | All PRDs |
| `PRD-001-user-segments-and-roles` | `PRD-000` | Experience, collaboration, commercial PRDs |
| `PRD-002-data-trust-and-citation-principles` | `PRD-000` | All data and intelligence PRDs |
| `PRD-100-data-asset-strategy` | `PRD-002` | All data asset PRDs |
| `PRD-101-data-source-governance` | `PRD-100` | All source-specific data PRDs |
| `PRD-102-data-lineage-verification-and-freshness` | `PRD-100`, `PRD-101` | All data consumers |
| `PRD-200-decision-profile` | Data asset PRDs | User experience and collaboration PRDs |
| `PRD-500-entitlement-model` | Charter, user segment, and experience PRDs | Commercial PRDs |

## Anti-Patterns

- A page PRD defining source truth for ranking, admissions, salary, or program data.
- A commercial PRD changing data verification or freshness rules.
- A ranking PRD overwriting institution identity rules owned by NCES/IPEDS or equivalent source governance.
- A product experience PRD duplicating source-specific field definitions instead of linking to data asset PRDs.

