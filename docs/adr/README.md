# Architecture Decision Records (ADRs) Pack

This directory holds the official Architecture Decision Records (ADRs) and Decision Gates for the **Collage Major** project to ensure governance, single-source-of-truth compliance, and robust production-ready engineering.

## 📌 ADR Index

| Index | Title | Scope | Status | Date |
|---|---|---|---|---|
| **[ADR-001](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-001-postgresql-source-of-truth.md)** | PostgreSQL as Business Source of Truth | Data Sovereignty | **Accepted** | 2026-05-24 |
| **[ADR-002](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-002-ranking-lineage-model.md)** | University Ranking Lineage & Audit Provenance | Data Trust & Audit | **Accepted** | 2026-05-24 |
| **[ADR-003](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-003-vite-middleware-vs-reusable-bff.md)** | BFF/Express Architecture vs Vite Middleware | Runtime Architecture | **Accepted** | 2026-05-24 |
| **[ADR-004](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-004-saas-entitlement-boundary.md)** | SaaS Entitlement Gating before Billing Integration | SaaS & Monetization | **Accepted** | 2026-05-24 |
| **[ADR-005](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-005-ipeds-raw-mirror-and-product-projection.md)** | IPEDS Raw Mirror And Product Projection | Government Data & Provenance | **Accepted** | 2026-05-24 |
| **[ADR-006](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-006-role-based-user-management-and-collaborative-sharing.md)** | Role-Based User Workspaces, Paywall Gating, and Collaborative Sharing | SaaS & Security Boundary | **Proposed (需要商榷)** | 2026-05-24 |


---

## 🚫 Decision Gates (Compliance Acceptance)

The following governance gates strictly constrain active development branch pull requests:

1.  **No Billing Gateway Integration** (Stripe, LemonSqueezy) shall be written or approved until the Entitlement engine defined in [ADR-004](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-004-saas-entitlement-boundary.md) is implemented and validated.
2.  **No Historical Ranking Display Expansion** shall be added until the ranking lineage model schema defined in [ADR-002](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-002-ranking-lineage-model.md) is migrated and integrated.
3.  **No Production Deployment** configuration (Docker, Vercel, Firebase App Hosting) shall rely on the Vite Dev Server middleware; the production BFF server defined in [ADR-003](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-003-vite-middleware-vs-reusable-bff.md) must be configured and tested.
4.  **No IPEDS-Derived Product Field** shall be exposed without the raw mirror, release metadata, metric definition registry, missing-value policy, and provenance requirements defined in [ADR-005](file:///Users/ggdayup/ggdayup-syncthing/code/college_major/docs/adr/ADR-005-ipeds-raw-mirror-and-product-projection.md).
