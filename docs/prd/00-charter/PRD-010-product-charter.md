# PRD-010: Product Charter

Status: Draft

## Depends On

- PRD-000: Commercial Thesis
- PRD-001: User Segments and Roles
- PRD-002: Data Trust and Citation Principles

## Purpose

Define the product's purpose, positioning, non-negotiable principles, and success criteria — so every downstream PRD and implementation decision can be evaluated against a shared understanding of what CollegeFlow is and is not.

## Product Purpose

The product helps students, parents, and counselors make data-informed college-major and university decisions using trusted admissions data assets, explainable decision products, and counselor-friendly delivery workflows.

## Product Positioning

The platform is not only a directory or recommendation interface. Its core value comes from combining authoritative admissions data assets with explainable decision products and counselor-friendly delivery workflows.

## Non-Negotiable Product Principles

- **Do not fabricate admissions, ranking, school, program, salary, outcome, or source data.** Every claim must trace to an authoritative source. (See PRD-002)
- **Product surfaces must preserve data provenance and show verification cues where users rely on factual claims.** Users should always know where a number comes from.
- **Data assets are first-class product capabilities, not hidden implementation details.** The data itself is part of the value proposition.
- **User experiences consume data contracts rather than redefining source truth locally.** UX PRDs should not redefine data quality rules established by data asset PRDs.
- **Commercial packaging may control access, but it must not weaken data authenticity rules.** Free users and paid users see the same verified data.

## Primary User Groups

- **Students** exploring majors, schools, programs, and admission paths.
- **Parents** evaluating fit, cost, credibility, and trade-offs.
- **Counselors** managing multiple student decisions and deliverables.
- **Internal operators** reviewing data quality, source freshness, and user trust risks.

## Research Context

Customer research confirms:

- *"I don't know what I want to be"* — Students need structured exploration, not just data dumps.
- *"My heart says UGA for the lifestyle, but my brain says Tech for the career"* — Students need both lifestyle and career data to make trade-offs.
- *"Most parents get zero training on how to support their kids"* — Parents need a distinct view focused on ROI and cost.
- *"I was drowning in spreadsheets"* — Counselors need a unified workspace, not another tool.

## Success Criteria

- Users can understand why a school, major, program, or recommendation appears.
- Counselors can package trusted data-backed decisions into client-facing workflows.
- Data claims are traceable to authoritative sources and versioned when source years change.
- New data sources can be added without rewriting unrelated experience PRDs.

## What CollegeFlow Is Not

- **Not a college ranking site**: Rankings are one lens, not the product.
- **Not an application submission platform**: Common App integration is out of scope.
- **Not a counselor replacement**: The platform strengthens counselor relationships, not replaces them.
- **Not a college admissions predictor**: Competitiveness is context, not prediction.
- **Not a financial aid calculator**: Cost data supports decisions but does not replace official financial aid offices.

## Downstream Consumers

- All PRDs in the system reference this charter for product alignment.
- Any new feature should be evaluated against the non-negotiable principles before implementation.
