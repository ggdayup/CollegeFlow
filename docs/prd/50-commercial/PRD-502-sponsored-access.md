# PRD-502: Sponsored Access

Status: Draft

## Depends On

- Entitlement model
- User roles
- Counselor CRM
- Student, parent, and counselor workspace
- Channel partner and revenue share (PRD-504)

## Purpose

Define product requirements for counselor or organization-sponsored student access — so counselors and institutions can distribute the platform to families without requiring each family to pay independently, while maintaining clear boundaries between sponsor, student, and platform.

## Problem

Counselors and institutions want to distribute the platform as part of their service offering, but the current model requires each family to pay independently. Research confirms:

- *"Counselors will distribute the platform when it helps them earn, save, and sell."* — PRD-000 commercial thesis. Sponsored access is a key distribution mechanism.
- *"An institution can distribute the platform as a standard workflow without needing to buy every seat upfront."* — PRD-000 success criterion.
- Counselors need to feel they are strengthening their service relationship, not being bypassed by the platform.

## Product Rules

- Sponsored access should clearly communicate who sponsors access and what capabilities are included.
- Sponsorship should not override user privacy, source truth, or data trust rules.
- Access boundaries must be visible to counselors and sponsored users.
- Sponsored users retain ownership of their personal data and Decision Profile.
- The sponsor cannot revoke a student's access to their own Decision Profile data.

## Sponsorship Models

### 1. Counselor-Sponsored Access

**How it works**: A counselor invites a student into the platform as part of their paid counseling service. The counselor pays for (or subsidizes) the student's workspace access.

**What the student gets**:
- Full Decision Workspace access (or a defined subset, per counselor configuration)
- Their own Decision Profile, which they own and control
- Collaboration with their counselor within the workspace

**What the counselor gets**:
- Visibility into the student's workspace progress (per student awareness)
- Ability to add professional annotations and recommendations
- Revenue share eligibility when the student or family upgrades to paid Pro tier

**Sponsorship boundaries**:
- The counselor can see the student's workspace progress and Decision Profile (with student awareness)
- The counselor cannot edit the student's Decision Profile — only suggest changes
- The student can opt out of counselor-sponsored access and continue independently (their data transfers to self-guided mode)

### 2. Institution-Sponsored Access

**How it works**: A school, agency, or organization distributes the platform to its students or members. The institution may pay for access or subsidize it.

**What the student gets**:
- Full or partial Decision Workspace access (per institution configuration)
- Their own Decision Profile, which they own and control
- Access to institution-branded workspace (if the institution has custom branding enabled)

**What the institution gets**:
- Distribution visibility: which students are active, which are not
- Aggregate analytics: usage rates, conversion rates (individual student data requires consent)
- Channel attribution and revenue share when eligible (PRD-504)

**Sponsorship boundaries**:
- The institution can see aggregate usage metrics but not individual student Decision Profiles without consent
- The student can continue using the platform independently after leaving the institution (data ownership transfers to student)

## Sponsorship Lifecycle

```
Counselor/Institution creates sponsorship → Invites student → Student accepts
  → Student receives sponsored access (with clear visibility of sponsor)
    → Student can use full or partial workspace
      → Student or parent can upgrade to paid Pro tier (sponsor receives revenue share when eligible)
        → Sponsorship continues or ends based on configuration
```

## Sponsor Visibility to Students

When a student enters the platform through a sponsor:

- The sponsor's name and role are clearly displayed: "Your counselor [Name] has invited you to CollegeFlow"
- The student understands what the sponsor can and cannot see
- The student can view their sponsorship details at any time

## Privacy and Data Ownership

- The student owns their Decision Profile, preferences, and personal data
- The sponsor (counselor or institution) does not own the student's data
- When sponsorship ends, the student retains access to their data in free or self-guided mode
- Sponsored access does not grant the sponsor any commercial rights to the student's data

## Entitlement and Gating

- Sponsored access may provide full or partial workspace access, depending on sponsor configuration
- If the sponsor pays for full workspace, the student gets Pro-tier features
- If the sponsor provides limited access, the student can upgrade to Pro independently
- Sponsored users who upgrade to Pro become independent payers; the sponsor's role remains as an advisor

## Does Not Own

- Payment processing or billing for sponsors
- Institution branding or custom domain configuration
- Revenue share payout mechanics (handled by PRD-504)
- Database schema or API contracts
