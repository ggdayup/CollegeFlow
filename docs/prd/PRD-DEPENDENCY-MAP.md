# PRD Dependency Map

## Rule

Dependencies should move from the commercial thesis and stable upstream product knowledge to downstream user and commercial surfaces:

```text
00-charter / commercial thesis
  -> 00-charter / product charter
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
| `PRD-000-commercial-thesis` | None | All PRDs |
| `PRD-010-product-charter` | `PRD-000` | All product and data PRDs |
| `PRD-001-user-segments-and-roles` | `PRD-000`, `PRD-010` | Experience, collaboration, commercial PRDs |
| `PRD-002-data-trust-and-citation-principles` | `PRD-000`, `PRD-010` | All data and intelligence PRDs |
| `PRD-100-data-asset-strategy` | `PRD-002` | All data asset PRDs |
| `PRD-101-data-source-governance` | `PRD-100` | All source-specific data PRDs |
| `PRD-102-data-lineage-verification-and-freshness` | `PRD-100`, `PRD-101` | All data consumers |
| `PRD-103-p0-data-asset-loop` | `PRD-100`, `PRD-101`, `PRD-102`, `PRD-206` | P0 comparison, workspace boundary, data asset PRDs |
| `PRD-200-decision-profile` | Data asset PRDs | User experience and collaboration PRDs |
| `PRD-205-decision-readiness` | `PRD-000`, `PRD-100`, `PRD-200`, `PRD-203`, `PRD-204`, `PRD-206` | Full workspace boundary, invited conversion, reports, comparisons |
| `PRD-206-school-program-comparison` | `PRD-000`, `PRD-100`, `PRD-120`, `PRD-200`, `PRD-203`, `PRD-204`, `PRD-205` | Full workspace boundary, invited conversion, reports |
| `PRD-305-search-entry-experience` | `PRD-001`, `PRD-002`, `PRD-200`, `PRD-206`, `PRD-301`, `PRD-302`, `PRD-500`, `PRD-506` | Onboarding, major discovery, university discovery, program comparison |
| `PRD-500-entitlement-model` | Charter, user segment, and experience PRDs | Commercial PRDs |
| `PRD-504-channel-partner-and-revenue-share` | `PRD-000`, `PRD-001`, `PRD-500`, `PRD-503` | Invited conversion, paywall, sponsored access |
| `PRD-505-invited-user-conversion-path` | `PRD-000`, `PRD-200`, `PRD-205`, `PRD-206`, `PRD-300`, `PRD-500`, `PRD-504`, `PRD-506` | Onboarding, paywall, collaboration, reports |
| `PRD-506-initial-and-full-workspace-boundary` | `PRD-000`, `PRD-200`, `PRD-205`, `PRD-206`, `PRD-300`, `PRD-500`, `PRD-505` | Invited conversion, paywall, onboarding, reports |

## Anti-Patterns

- A page PRD defining source truth for ranking, admissions, salary, or program data.
- A commercial PRD changing data verification or freshness rules.
- A ranking PRD overwriting institution identity rules owned by NCES/IPEDS or equivalent source governance.
- A product experience PRD duplicating source-specific field definitions instead of linking to data asset PRDs.
- A conversion PRD implying that users must unlock counselor service instead of the full Decision Workspace.
- A channel PRD that weakens counselor or institution trust by making the platform appear to replace the channel partner.
- A free Initial Workspace that gives away the complete decision package before payment.
- A paid Full Decision Workspace that feels like a generic feature upgrade rather than a complete decision environment.
- A Full Decision Workspace that overwhelms users with data before creating Direction Clarity.
- A data asset experience that does not turn data into user-visible Data-backed Comparison.
- A School / Program Comparison that becomes a generic school ranking table.
- A ranking experience that mixes overall rankings and subject/program rankings without scope labels.
- A P0 paid comparison that excludes ranking or outcomes even though they are primary paid attraction signals.
- A comparison that attaches outcomes to a program when mapping confidence is too low for responsible use.
- A search entry that hides coverage gaps or presents unverified academic data as if it were complete.
