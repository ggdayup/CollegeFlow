# PRD-501: Subscription and Paywall

Status: Draft

## Depends On

- Entitlement model
- Data asset strategy
- Decision Profile
- Reports and deliverables
- Initial and Full Workspace Boundary (PRD-506)

## Purpose

Define product requirements for paid access to advanced data, decision, collaboration, and deliverable capabilities. Paywalls must communicate decision value, not just feature lists, and must respect the different buying motivations of students, parents, and counselors.

## Research Context

Customer research reveals distinct buying motivations:

- **Parents pay for risk mitigation**: *"Am I making a huge mistake?"* — The conversion message should emphasize what risks are hidden, not what features are locked.
- **Students pay for decision confidence**: *"I don't want my life to be filled with regret"* — The conversion message should emphasize clarity and reduced anxiety.
- **Counselors pay for time savings**: *"Saved me at least 15 hours per week"* — The conversion message should emphasize hours saved, not features added.

## Product Rules

- Paywalls should protect advanced value while preserving trust and transparency.
- Users should understand what additional decision value a paid tier unlocks.
- Paid access must not create fake certainty or hide data limitations.
- Every paywall should include a clear explanation of what the user can do for free.

## Paywall Design Principles

### 1. Value-First Messaging (价值优先)

Paywall copy should describe decision outcomes, not feature names:

| Bad | Good |
|-----|------|
| "Unlock 40-Year ROI Curve" | "See the full career earnings picture — from first salary to peak earning years — so you know if this major is worth the investment" |
| "Upgrade to Pro" | "Protect your child's educational yield — unlock risk warnings, full comparisons, and the parent-readable decision report" |
| "Get more features" | "Save 15 hours per week — replace your spreadsheet stack with one trusted workspace" |

### 2. Role-Aware Paywalls (角色感知升级提示)

The paywall experience changes based on the user's role:

**Student-facing paywall**:
- Emphasize: decision confidence, passion alignment, reduced anxiety
- CTA: "Upgrade to unlock your full Decision Workspace"
- Alternative: "Ask Parent to Unlock" pathway

**Parent-facing paywall**:
- Emphasize: risk awareness, ROI visibility, cost transparency
- CTA: "Unlock the full picture — risks, comparisons, and your child's decision readiness"
- Price framing: "$19/month — less than one hour of college counseling"

**Counselor-facing paywall**:
- Emphasize: time savings, professional credibility, revenue share
- CTA: "Replace your spreadsheet stack — upgrade to Counselor CRM"
- ROI framing: "Save 15 hours/week × your hourly rate = $X/month value"

### 3. Dynamic Teaser Gating (动态预览)

Instead of static locked cards, premium components should show a teaser of real data:

- **40-Year ROI Chart**: First 5 years visible, remaining 35 years blurred
- **Prerequisite Course Flow**: First 2 courses visible, advanced courses blurred
- **Program Comparison**: 1 comparison allowed, additional comparisons blurred
- **Risk Warnings**: Count of risks visible ("2 critical risks found"), details blurred

### 4. Trust Preservation (信任保护)

- Paywalls must never imply that data quality differs between tiers. A free user sees the same verified salary number as a Pro user.
- Paywalls must not use fear-based pressure for upgrades. Risk awareness should inform, not coerce.
- Paywalls must be dismissible. Users should be able to continue using the free tier without repeated pop-ups.

## Paywall Trigger Moments

| Trigger | Context | Recommended Action |
|---------|---------|-------------------|
| User clicks 40-Year ROI curve beyond year 5 | Major Discovery / University Discovery | Dynamic teaser gate with frosted-glass overlay |
| User attempts 2nd program comparison | Program Comparison | "You've used your free comparison. Upgrade for unlimited." |
| User attempts to export a report | Reports & Deliverables | "Branded PDF exports are available with Pro." |
| Counselor attempts to add 4th student | Counselor CRM | "Free tier supports up to 3 students. Upgrade for unlimited." |
| Parent views risk warning details | Decision Readiness | "2 critical risks detected. Upgrade to see details and mitigation steps." |
| Student receives counselor invitation | Workspace Entry | "Your counselor has invited you to CollegeFlow. Create a free account to get started." |

## Acceptance Criteria

- **Given** a free user clicks on a premium component, **when** the paywall appears, **then** it describes the decision value they would unlock, not just the feature name.
- **Given** a student sees a paywall, **when** they view the options, **then** they see both "Upgrade" and "Ask Parent to Unlock" pathways.
- **Given** a parent sees a paywall, **when** they view it, **then** the messaging emphasizes risk awareness, ROI visibility, and cost transparency.
- **Given** a counselor sees a paywall, **when** they view it, **then** the messaging emphasizes time savings and revenue share potential.
- **Given** any user dismisses a paywall, **when** they continue using the free tier, **then** they are not shown the same paywall again for the same component within the same session.

## Does Not Own

- Payment processing or billing infrastructure
- Stripe SDK configuration
- Pricing strategy or discount rules
- Database schema or API contracts
