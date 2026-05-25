# PRD Index

This directory is the product requirement source for the College Major Intelligence Platform.

Plane remains the task tracker. PRDs describe product intent, user value, decision rules, data asset contracts, and acceptance boundaries. Technical design, database schema, API contracts, and implementation plans belong outside `docs/prd/`.

## Information Architecture

PRDs are organized by product knowledge layer:

1. `00-charter/`: product charter, user segments, and non-negotiable trust principles.
2. `10-data-assets/`: source-specific admissions data assets and shared data governance rules.
3. `20-intelligence-products/`: decision products that combine data assets into user-facing judgments.
4. `30-user-experience/`: student, parent, and counselor-facing product experiences.
5. `40-collaboration/`: shared workspaces, counselor CRM, reports, and delivery workflows.
6. `50-commercial/`: entitlement, subscription, sponsored access, and SaaS packaging.
7. `60-trust-operations/`: admin review, data quality operations, privacy, compliance, and auditability.
8. `90-archive/`: superseded PRDs retained for traceability.

## Dependency Direction

PRDs should depend in one direction:

```text
Charter
  -> Data Assets
    -> Intelligence Products
      -> User Experience
        -> Collaboration
          -> Commercial
            -> Trust Operations
```

Data asset PRDs define source authority, product value, verification, freshness, versioning, and limitations. User experience PRDs consume those data contracts; they do not redefine source truth or data quality rules.

## Current Starting Points

- [Product Charter](00-charter/PRD-000-product-charter.md)
- [Data Trust and Citation Principles](00-charter/PRD-002-data-trust-and-citation-principles.md)
- [Data Asset Strategy](10-data-assets/10-overview/PRD-100-data-asset-strategy.md)
- [Data Source Governance](10-data-assets/10-overview/PRD-101-data-source-governance.md)
- [Data Lineage, Verification, and Freshness](10-data-assets/10-overview/PRD-102-data-lineage-verification-and-freshness.md)
- [Decision Profile](20-intelligence-products/PRD-200-decision-profile.md)
- [Entitlement Model](50-commercial/PRD-500-entitlement-model.md)

## Archived Source

The previous unified PRD was retained at [90-archive/deprecated/PRD-unified-user-auth-collaboration-monetization.md](90-archive/deprecated/PRD-unified-user-auth-collaboration-monetization.md). It should be treated as historical source material, not the current structure of record.

