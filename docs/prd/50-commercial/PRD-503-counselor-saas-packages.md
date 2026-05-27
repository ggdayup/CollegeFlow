# PRD-503: Counselor SaaS Packages

Status: Draft

## Depends On

- Entitlement model
- Counselor CRM
- Reports and deliverables
- Sponsored access (PRD-502)
- Channel partner and revenue share (PRD-504)

## Purpose

Define product packaging for counselors using CRM, collaboration, data-backed reports, and sponsored student access — so counselors can choose a package that matches their practice size and service model.

## Problem

Counselors have diverse practice sizes and needs. A solo practitioner managing 20 students has different requirements than a multi-counselor agency managing 200+. Research confirms:

- *"I was drowning in spreadsheets... saved me at least 15 hours per week."* — Counselors value time savings above feature count.
- *"Current systems can't handle growth without burning out."* — Packages must support practice scaling.
- Counselors need to understand pricing in terms they care about: students managed, hours saved, and revenue earned.

## Product Rules

- Packages should align with counselor workflow capacity and client delivery value.
- Package limits should be expressed in product terms users can understand.
- Data trust requirements remain the same across packages.
- Upgrades should be seamless — counselors should never lose data or student history when changing packages.

## Package Tiers

### Starter (Free — Up to 3 Students)

**Purpose**: Let counselors experience the platform's value before committing.

**Includes**:
- Multi-student dashboard for up to 3 students
- Basic application tracking per student
- Standard reports (unbranded, text-only)
- Student invitation and workspace setup
- Basic email notifications

**Excludes**:
- Spreadsheet import
- Branded PDF reports
- Bulk communications
- Private counselor notes
- Revenue share dashboard
- Team collaboration

### Professional ($49/month — Up to 50 Students)

**Purpose**: Full CRM for independent practitioners.

**Includes everything in Starter, plus**:
- Up to 50 students
- Spreadsheet import and migration
- Branded PDF reports (practice name, logo, color scheme)
- Bulk deadline reminders
- Private counselor notes and annotations
- Revenue share dashboard
- Parent Weekly Digest generation
- Outcome analytics (basic: acceptance rates, school distribution)
- Priority email support

### Agency ($149/month — Up to 200 Students)

**Purpose**: Multi-counselor practices and mid-size agencies.

**Includes everything in Professional, plus**:
- Up to 200 students
- Team collaboration (up to 5 counselors)
- Student assignment and caseload management
- Practice-wide dashboard (total caseload, acceptance rates, revenue)
- Role-based permissions (admin, counselor, assistant)
- Outcome analytics (advanced: year-over-year trends, counselor performance)
- Custom report templates
- API access (read-only, for integrations)

### Enterprise (Custom Pricing — Unlimited Students)

**Purpose**: Large agencies, school districts, and institutional distributors.

**Includes everything in Agency, plus**:
- Unlimited students
- Unlimited counselors
- Custom branding (white-label option)
- SSO/SAML integration
- Dedicated account manager
- Custom data ingestion requests
- SLA guarantees
- Admin review and data quality access

## Package Limits and Communication

- Package limits are expressed in terms counselors understand: "up to X students"
- When a counselor approaches their limit (80% of capacity), they receive a gentle upgrade prompt
- When a counselor hits their limit, they cannot add more students but existing students retain full access
- Downgrades are allowed but take effect at the start of the next billing cycle

## Revenue Share Interaction

- All paid tiers (Professional and above) are eligible for revenue share when their sponsored families convert to Pro
- Revenue share is calculated per counselor/agency tier and displayed in the revenue share dashboard
- Sponsored families who upgrade through the counselor's referral link are attributed to that counselor

## Upgrade Path

```
Starter (3 students) → Professional (50 students) → Agency (200 students) → Enterprise (unlimited)
```

- Upgrades are instant and include prorated billing
- All existing data, students, and reports are preserved during upgrades
- Counselors can trial higher tiers for 14 days before committing

## Does Not Own

- Payment processing or Stripe billing configuration
- Revenue share calculation or payout mechanics (PRD-504)
- Database schema or API contracts
