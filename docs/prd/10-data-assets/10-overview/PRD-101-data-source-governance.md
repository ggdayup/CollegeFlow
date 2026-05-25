# PRD-101: Data Source Governance

Status: Draft

## Purpose

Define how the product decides whether a source is authoritative enough to become a recognized data asset.

## Acceptance Rules

- The source must have a named authority, publisher, or institution.
- The source must support stable citation or versioning.
- The source must have a clear product use case.
- The source must have known limitations documented before being used in decision products.

## Source Evaluation Dimensions

Each potential source should be evaluated across:

- **Authority**: Who publishes or controls the source?
- **Decision Relevance**: Which student, parent, counselor, or institution decision does it support?
- **Coverage**: Which schools, programs, regions, years, levels, or categories does it cover?
- **Comparability**: Can its claims be responsibly compared with other sources?
- **Freshness**: How often is the source updated or reissued?
- **Citation Stability**: Can the product cite the claim in a durable, user-understandable way?
- **Known Limitations**: What should users not infer from this source?

## Source Classes

### Authoritative Source

An authoritative source can support user-visible decision claims when lineage, freshness, and limitations are preserved.

### Authoritative with Limitations

The source can support user-visible claims only within a limited scope, such as a specific category, geography, year, degree level, or ranking methodology.

### Context Source

The source can enrich explanation or discovery but should not carry critical decision claims by itself.

### Research-only Source

The source may inform investigation but should not be used in user-facing claims until promoted through governance.

### Rejected Source

The source should not be used because authority, stability, citation, licensing, quality, or product relevance is insufficient.

## Governance Outcomes

- Approved source
- Approved with limitations
- Research-only source
- Rejected source

## Product Rules

- A source should not be approved only because it is attractive to users.
- A source should not be rejected only because it is incomplete; it may be approved with explicit limitations.
- User-visible claims must preserve the source class and limitations when those limitations affect decision quality.
- Commercial PRDs may decide whether a source appears in paid tiers, but source governance owns whether the source is acceptable.

## Does Not Own

- Engineering ingestion pipelines.
- Database schema.
- UI layout.
