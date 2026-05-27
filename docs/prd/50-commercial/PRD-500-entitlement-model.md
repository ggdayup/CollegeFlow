# PRD-500: Entitlement Model

Status: Draft

## Purpose

Define which product capabilities are available to each user or package tier without changing data authenticity requirements. Entitlement boundaries must be understandable to users before they encounter a paywall, and must respect the different needs of students, parents, and counselors.

## Research Context

Customer research reveals distinct willingness-to-pay patterns across user groups:

- **Students**: Value exploration tools and decision confidence. Reluctant to pay without parental approval. *"I want to wake up in the morning and have something I look forward to"* — values passion alignment tools.
- **Parents**: Value ROI data, cost transparency, and risk assessment. Most likely to pay when they see risk mitigation value. *"They saved, scrimped and borrowed... then watched the ROI evaporate."*
- **Counselors**: Value time savings and professional credibility. Will pay if it replaces their spreadsheet stack and generates revenue. *"The tracker saved me at least 15 hours per week."*

## Product Rules

- Commercial access may control visibility, limits, exports, collaboration capacity, and advanced decision support.
- Commercial access must not alter source truth, verification, or data freshness rules.
- Locked features should communicate product value without fabricating unavailable data.
- Every tier should provide enough value that a user feels the product is useful even without upgrading.

## Tier Structure

### Free Tier (免费层)

**Purpose**: Prove relevance and build trust. Let users experience the "Aha! Moment" without paying.

**Includes**:
- Search entry and basic results
- Major Discovery with top-level outcomes data (median salary, employment rate)
- University Discovery with basic admissions and cost data
- One Decision Option saved to shortlist
- Application Planning Workspace with up to 3 schools
- Basic Decision Readiness score (direction clarity only)
- View-only parent access (when invited by student)

**Excludes**:
- 40-Year ROI lifecycle curve
- Prerequisite course credit topology
- Passion vs. Money Trade-off Framework (full view)
- Heart vs. Brain Framework (full view)
- Program Comparison (more than 1 comparison)
- Exportable reports
- Counselor CRM features
- Revenue share dashboard

### Pro Tier (专业层 — $19/month)

**Purpose**: Full Decision Workspace for self-guided students and parents.

**Includes everything in Free, plus**:
- Unlimited Decision Options in shortlist
- Full 40-Year ROI lifecycle curve with Cost-of-Living adjustment
- Full prerequisite course credit topology
- Passion vs. Money Trade-off Framework (interactive quadrant)
- Heart vs. Brain Framework (interactive display)
- Program Comparison (unlimited comparisons)
- Exportable PDF reports (unbranded)
- Parent-readable Decision Report
- Parent Weekly Digest
- Shareable links with access tracking
- Ask Parent to Unlock conversion pathway

### Counselor Tier (顾问层 — $49/month or practice pricing)

**Purpose**: Full CRM + decision support for professional counselors.

**Includes everything in Pro, plus**:
- Multi-student dashboard (up to 50 students)
- Spreadsheet import and migration
- Private counselor notes and annotations
- Bulk deadline reminders
- Branded PDF reports (with practice name/logo)
- Revenue share dashboard
- Team collaboration (multi-counselor practice)
- Outcome analytics (for marketing)
- Priority support

### Institution Tier (机构层 — custom pricing)

**Purpose**: Organization-wide distribution with admin oversight.

**Includes everything in Counselor, plus**:
- Organization-wide dashboard
- Distribution management (invite students at scale)
- Channel attribution and revenue share at organization level
- Custom branding
- Admin review and data quality access

## Entitlement Enforcement Rules

- **Data authenticity**: No tier may alter source truth, verification, or data freshness. A free user and a Pro user see the same salary number for the same major.
- **Progressive reveal**: Higher tiers reveal more depth, not different data.
- **No fake scarcity**: Paywalls should explain what the user gets, not threaten what they lose.
- **Graceful degradation**: When a free user hits a paywall, they should see a teaser of the full feature, not a blank locked card.

## Downstream Consumers

- Subscription and paywall
- Sponsored access
- Counselor SaaS packages
- Reports and shareable deliverables
- Channel partner and revenue share
