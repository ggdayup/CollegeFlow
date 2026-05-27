# CollegeFlow MVP Scope Document

**Date**: 2026-05-27
**Version**: v1.0
**Status**: Draft — needs validation

---

## Hypothesis Statement

We believe that **college counselors serving 20-50 students** will pay $49/month for a workspace that lets them invite students, compare 2-4 school/program options with verified data, and generate a branded report for family meetings — and we'll know we're right when **3 counselors use it for at least 2 family meetings each within 30 days**.

---

## MoSCoW Classification

### Must Have (v1 — ships or the product fails)

| Feature | PRD Reference | Rationale | Risk | Effort |
|---------|--------------|-----------|------|--------|
| User auth (student + counselor roles) | PRD-001 | No workspace without identity | Low | S |
| Onboarding wizard | PRD-300 | Collect GPA, budget, preferences | Low | M |
| Decision Profile | PRD-200 | Foundation for all recommendations | Medium | M |
| Institution identity | PRD-110 | Anchor all data to correct school | Low | S |
| Major CIP mapping | PRD-131 | Connect programs to standard categories | Medium | M |
| Program catalogs (top 50 US) | PRD-130 | Students need to know what programs exist | Low | M |
| College Scorecard outcomes (top 50 US) | PRD-111 | Core value: real salary/debt data | Low | M |
| CDS data (top 50 US) | PRD-112 | Admissions rates, costs, enrollment | Low | M |
| School/Program comparison (4 lenses) | PRD-206 | The paid value moment | Medium | L |
| Fit engine (basic scoring) | PRD-201 | Why is this school a good match? | Medium | M |
| Confidence score (basic states) | PRD-203 | Users need to know what data to trust | Low | S |
| Data gap warnings (missing/stale) | PRD-204 | Don't fabricate data | Low | S |
| Counselor CRM (invite + dashboard) | PRD-400 | Distribution channel: counselors invite families | Low | M |
| Reports (branded PDF, 1 template) | PRD-402 | Tangible artifact for family meetings | Medium | M |
| Entitlement model (Free + Pro) | PRD-500 | Monetization gate | Low | S |

### Should Have (v1.1 — 2-4 weeks after launch)

| Feature | PRD Reference | Rationale | Effort |
|---------|--------------|-----------|--------|
| Parent view + weekly digest | PRD-401 | Parents are the payers but can wait one cycle | M |
| US News rankings | PRD-121 | Attraction signal, not core decision data | M |
| Application tracking | PRD-304 | Useful but not needed for first family meeting | L |
| Revenue share dashboard | PRD-504 | Counselor incentive, not v1 blocker | M |
| Sponsored access | PRD-502 | Distribution enhancement | M |
| Heart vs. Brain framework | PRD-302 | Nice comparison lens | S |

### Could Have (v1.2+ — if v1 data supports it)

| Feature | PRD Reference | Rationale |
|---------|--------------|-----------|
| QS/THE/Niche rankings | PRD-122, 123, 124 | International expansion, low US relevance |
| AI-resistance signal | PRD-141 | Compelling but unvalidated user demand |
| Curriculum prerequisites | PRD-132 | Deep academic detail, not needed for first decision |
| Major ROI projections | PRD-140 | College Scorecard covers v1 basics; ROI model is v2 |
| Team collaboration (Agency tier) | PRD-400 | Multi-counselor practices, not solo IECs |
| Shareable links with tracking | PRD-402 | Enhancement, not core |

### Won't Have (not this product/quarter)

| Feature | Why |
|---------|-----|
| Institution/Enterprise tier | Need to validate with solo counselors first |
| Common App integration | Out of scope, complex partnership |
| Institution-wide distribution | Requires sales motion, not self-serve |
| International institution coverage | Data complexity too high for v1 |
| Full search experience (PRD-305) | Users should start from counselor invite, not search |
| Admin console (PRD-600) | Can manually operate for first 100 customers |
| Privacy/compliance automation (PRD-602) | Basic encryption + audit log is enough for v1 |

---

## Risk Register

| Risk | Category | Likelihood | Impact | Mitigation |
|------|----------|------------|--------|------------|
| Data ingestion takes longer than expected for top 50 schools | Technical | Medium | High | Start with College Scorecard + CDS only; manual data entry for gaps |
| Counselors won't distribute the platform | Market | Medium | High | Manual concierge: create reports for counselors yourself first |
| Comparison UI is too complex for parents | UX | Low | Medium | Test with 3 real parents before shipping; simplify to 3 columns max |
| Fit engine scores feel arbitrary | Technical | Medium | Medium | Use simple rule-based scoring v1; ML can come later |
| Revenue share model confuses counselors | Market | Low | Medium | Hide revenue share in v1; add after distribution is proven |

---

## MVP Scope Summary

**v1 is a counselor-invited student workspace** where a counselor invites 1-5 students, each student completes a basic profile, and the counselor can generate a comparison report for 2-4 school/program options showing: admissions context, salary outcomes, cost, and fit score. The report is a branded PDF the counselor can present in a family meeting.

**Tiers**: Free — 1 student, 1 comparison. Pro ($19/month) — unlimited students, unlimited comparisons. Counselor ($49/month) — up to 50 students, branded reports, dashboard.

**Data scope**: Top 50 US universities only, with College Scorecard, CDS, and IPEDS data. Rankings deferred. International institutions deferred.

**Explicitly not**: A search engine, an application platform, a ranking site, or a counselor replacement.

---

## Success Criteria

| Metric | Target | How Measured |
|--------|--------|--------------|
| Counselor activation | 3 counselors invite ≥2 students each | Dashboard analytics |
| Report generation | 6 family meeting reports generated in first 30 days | Report download logs |
| Family conversion | 1 family upgrades to Pro ($19) | Stripe events |
| Counselor retention | 2 of 3 counselors still active after 30 days | Weekly active counselors |
| Time-to-value | Student completes onboarding → sees first comparison in <5 minutes | Session analytics |

---

## Deferred Backlog (with triggers)

| Feature | Build When |
|---------|-----------|
| Parent view + weekly digest | When 5+ families have converted to Pro |
| US News rankings | When users ask "why isn't [school] ranked?" in 3+ support conversations |
| Application tracking | When counselors report managing applications as their #2 pain point (after comparison) |
| Revenue share | When 5+ counselors are actively distributing the platform |
| International institutions | When 20% of user searches are for non-US schools |
| Admin console | When manual data operations exceed 2 hours/week |

---

## PRD-to-MVP Mapping

| PRD | Status in MVP | Notes |
|-----|--------------|-------|
| PRD-000 Commercial Thesis | ✅ Informed | Guides monetization strategy |
| PRD-001 User Segments | ✅ Partially | Student + Counselor only; Parent deferred |
| PRD-002 Data Trust | ✅ Informed | Principles apply to all data |
| PRD-010 Product Charter | ✅ Informed | Non-negotiables preserved |
| PRD-100 Data Asset Strategy | ✅ Informed | Top 50 US first |
| PRD-101 Data Source Governance | ✅ Informed | CDS + Scorecard + IPEDS only |
| PRD-102 Data Lineage | ✅ Partially | Basic source citation only |
| PRD-103 P0 Data Asset Loop | ⏸️ Deferred | Post-MVP data operations |
| PRD-110 IPEDS | ✅ Must | Institution identity anchor |
| PRD-111 College Scorecard | ✅ Must | Core outcomes data |
| PRD-112 CDS | ✅ Must | Admissions + cost data |
| PRD-120-125 Rankings | ⏸️ Deferred | v1.1+ (US News first) |
| PRD-130 Program Catalogs | ✅ Must (top 50) | Manual curation acceptable |
| PRD-131 CIP Mapping | ✅ Must | Standardization needed |
| PRD-132 Curriculum | ⏸️ Deferred | v1.2+ |
| PRD-140 Major ROI | ⏸️ Deferred | Scorecard covers v1 basics |
| PRD-141 Labor Market | ⏸️ Deferred | v1.2+ |
| PRD-200 Decision Profile | ✅ Must | Core recommendation engine |
| PRD-201 Fit Engine | ✅ Must (basic) | Rule-based v1 |
| PRD-202 Competitiveness | ⏸️ Deferred | Can be added to comparison later |
| PRD-203 Confidence Score | ✅ Must (basic) | Verified/Stale/Missing states |
| PRD-204 Data Gap Warnings | ✅ Must (basic) | Missing + stale only |
| PRD-205 Decision Readiness | ✅ Informed | Guides comparison output |
| PRD-206 Comparison | ✅ Must (4 lenses) | Ranking, Admissions, Outcomes, Cost |
| PRD-300 Onboarding | ✅ Must | 3-step wizard |
| PRD-301 Major Discovery | ⏸️ Deferred | v1.1+ |
| PRD-302 University Discovery | ⏸️ Deferred | v1.1+ |
| PRD-303 Program Comparison | ✅ Covered by PRD-206 | Same capability |
| PRD-304 Application Workspace | ⏸️ Deferred | v1.1+ |
| PRD-305 Search Entry | ⏸️ Deferred | Not needed for counselor-invited flow |
| PRD-400 Counselor CRM | ✅ Must (basic) | Invite + dashboard |
| PRD-401 Student/Parent Workspace | ⏸️ Partially | Student yes, Parent v1.1 |
| PRD-402 Reports | ✅ Must | Branded PDF, 1 template |
| PRD-500 Entitlement | ✅ Must | Free + Pro |
| PRD-501 Paywall | ✅ Informed | Basic gating |
| PRD-502 Sponsored Access | ⏸️ Deferred | v1.1+ |
| PRD-503 SaaS Packages | ✅ Partially | Free + Pro + Counselor only |
| PRD-504 Revenue Share | ⏸️ Deferred | v1.1+ |
| PRD-505 Conversion Path | ✅ Informed | Counselor invite flow |
| PRD-506 Workspace Boundary | ✅ Informed | Free vs Pro gating |
| PRD-600 Admin Console | ⏸️ Deferred | Manual ops for first 100 customers |
| PRD-601 Data Quality Ops | ⏸️ Deferred | Post-MVP |
| PRD-602 Privacy/Audit | ✅ Minimal | Basic encryption + audit log |

---

*Generated: 2026-05-27*
*Status: DRAFT — needs counselor validation before implementation*
