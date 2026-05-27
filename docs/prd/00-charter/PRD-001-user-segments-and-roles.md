# PRD-001: User Segments and Roles

Status: Draft

## Purpose

Define product-facing user groups and their decision needs so downstream PRDs can use consistent role language, informed by real customer research.

## Research Basis

All segment definitions below are grounded in the customer research report (`docs/customer-research/2026-05-27-college-decision-pain-points.md`) and three ICP personas (`docs/customer-research/personas/`).

## Segments

### Student — The Anxious Explorer

**Decision role**: Builds a Decision Profile, explores majors and schools, compares programs, and manages application planning.

**Research profile**:
- Age 16-18, high school junior/senior or college freshman exploring
- Experiences paralyzing uncertainty about major choice
- Core tension: passion vs. money — wants to wake up excited but also wants financial security
- Information overload leads to decision paralysis
- Fears making an irreversible mistake
- *"The more they get asked 'What do you want to do?' the more panicked they feel."*

**Product behavior**:
- Uses search entry to explore countries, schools, and majors
- Engages with Major Discovery through interest-based or outcome-based entry paths
- Compares programs side-by-side before making shortlist decisions
- Tracks application deadlines and task progress in the workspace
- Sees the "Passion vs. Money" trade-off framework
- Sees AI-resistance signals for majors and career paths

**Needs from the platform**: Structured exploration, explainable recommendations, visible decision progress, data to back conversations with parents.

### Parent — The ROI-Focused Guardian

**Decision role**: Reviews decision evidence, cost, risk, and progress with appropriate collaboration permissions. Provides financial support and family input but should not control the student's decision.

**Research profile**:
- Age 45-55, mid-career, household income $75K-$250K+
- Deeply anxious about the financial investment ($50K-$300K+) and whether it will pay off
- Wants to support without controlling — struggles to find the line
- Zero training on how to help with college decisions
- *"They saved, scrimped and borrowed... then watched the return on that investment evaporate."*
- Needs program-level ROI data, not university-level prestige

**Product behavior**:
- Uses search entry to explore schools and majors through a cost/ROI lens
- Engages with Major Discovery through the Parent View (financial outcomes prominent, academic details simplified)
- Views university profiles with cost, graduation rate, and employment data
- Monitors child's application progress without editing capability
- Receives weekly email digests of application status
- Reads the parent-readable decision report before family meetings

**Needs from the platform**: Program-level ROI data, cost transparency, risk assessment, family conversation tools.

### Counselor — The Overwhelmed Organizer

**Decision role**: Manages a portfolio of students, creates deliverables, sponsors access, and interprets data-backed recommendations. Acts as a distribution channel for the platform.

**Research profile**:
- Independent Educational Consultant (IEC) or school-based counselor
- Manages 20-50 students (private) or 300-500 (school), each with 10-15 applications = 300-750 total
- Currently uses Google Sheets, email, WhatsApp, and "the inside of their head"
- *"I was drowning in spreadsheets... saved me at least 15 hours per week."*
- 80% of public school counselors have experienced burnout
- Needs to scale without adding weekend admin work
- Must not feel disintermediated by the platform (channel safety)

**Product behavior**:
- Uses the Counselor Dashboard to see all students' application status at a glance
- Imports existing Google Sheets data without starting from scratch
- Adds private notes and annotations per student per application
- Sends deadline reminders and bulk communications
- Generates comparison reports for family meetings
- Earns revenue share when families convert through their referral

**Needs from the platform**: Unified workspace, automated deadline alerts, spreadsheet migration, client portal, revenue share, professional credibility.

### Operator — The Trust Guardian

**Decision role**: Maintains data quality, reviews trust issues, and monitors source freshness and auditability.

**Research profile**:
- Internal CollegeFlow team member
- Ensures all data shown to users is sourced, cited, and auditable
- Manages the data ingestion pipeline and quality operations
- Responds to user "demand votes" for missing entities

**Product behavior**:
- Reviews data quality flags and gap states
- Prioritizes ingestion backlog based on user demand thresholds
- Monitors source freshness and versioning
- Audits data provenance and citation accuracy

**Needs from the platform**: Admin review console, data quality operations dashboard, audit trail system.

## Product Rules

- Role behavior must be described in product terms, not implementation permissions.
- Each role has a distinct **View** for every product surface (Major Discovery, University Discovery, Program Comparison, Application Workspace).
- Collaboration PRDs own workspace interaction rules between roles.
- Commercial PRDs own paid entitlement packaging per role.
- Data asset PRDs own source truth and verification rules.

## Role Interaction Matrix

| Surface | Student | Parent | Counselor | Operator |
|---------|---------|--------|-----------|----------|
| Search Entry | Full access | Full access | Full access | Full access |
| Major Discovery | Full view + Passion vs. Money | Parent View (ROI-focused) | Student-overview + annotation | N/A |
| University Discovery | Full view + Heart vs. Brain | Parent View (cost/ROI-focused) | Student-overview + annotation | N/A |
| Program Comparison | Full view | Parent View (cost/ROI-focused) | Generate + annotate reports | N/A |
| Application Workspace | Own applications, edit progress | View-only, no edit | Multi-student dashboard, edit notes, send reminders | N/A |
| Decision Report | View own | View child's | Generate for families + annotate | N/A |
| Admin Console | N/A | N/A | N/A | Full access |

## Downstream Consumers

- User experience PRDs
- Collaboration PRDs
- Commercial and entitlement PRDs
- Trust operations PRDs
