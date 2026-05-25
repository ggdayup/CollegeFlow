# PRD-505: Invited User Conversion Path

Status: Draft

## Purpose

Define the paid conversion path after a student or parent enters the platform through a counselor, institution, school, agency, or other trusted channel.

## Depends On

- [PRD-000: Commercial Thesis](../00-charter/PRD-000-commercial-thesis.md)
- [PRD-200: Decision Profile](../20-intelligence-products/PRD-200-decision-profile.md)
- [PRD-205: Decision Readiness](../20-intelligence-products/PRD-205-decision-readiness.md)
- [PRD-206: School / Program Comparison](../20-intelligence-products/PRD-206-school-program-comparison.md)
- [PRD-300: Onboarding](../30-user-experience/PRD-300-onboarding.md)
- [PRD-500: Entitlement Model](PRD-500-entitlement-model.md)
- [PRD-504: Channel Partner and Revenue Share](PRD-504-channel-partner-and-revenue-share.md)
- [PRD-506: Initial and Full Workspace Boundary](PRD-506-initial-and-full-workspace-boundary.md)

## Core Conversion Principle

The user does not pay to unlock counselor service. The user pays to unlock the full Decision Workspace.

The full Decision Workspace can then be used in multiple modes:

- **Self-guided**: the student or parent continues independently and acts as their own counselor.
- **Counselor-guided**: the student or parent continues with an attached counselor.
- **Institution-guided**: the student or parent continues through a school, agency, or institution workflow.

The Initial Workspace should prove that the decision work is worth continuing. The Full Decision Workspace should deliver Decision Readiness: direction clarity, data-backed comparison, risk awareness, a parent-readable report, and action readiness.

## Standard Conversion Path

```text
Trusted invite or recommendation
  -> Basic profile
    -> Initial Workspace and initial insight
      -> Unlock full Decision Workspace
        -> Self-guided or guided decision work
          -> Reports, comparisons, collaboration, and next steps
            -> Channel attribution and revenue share when eligible
```

## Experience Requirements

### 1. Trusted Entry

The invite or recommendation should make the trusted source clear. The user should understand whether the workspace came from a counselor, institution, school, agency, or direct self-guided path.

### 2. Basic Profile Before Payment

The user should be able to complete enough profile information to make the workspace feel personal before encountering the main unlock moment.

### 3. Initial Insight

The product should provide an Initial Workspace that proves relevance without giving away the full paid workspace. This may include a basic profile summary, high-level direction, visible decision risk previews, data gap previews, and locked comparison, report, or checklist previews.

### 4. Full Workspace Unlock

The unlock moment should frame payment as access to complete decision work, not as a generic subscription upgrade.

The user should understand that the unlocked workspace may include deeper analysis, school and major comparisons, data-backed explanations, source cues, reports, collaboration, and next steps.

Direction Clarity and Data-backed Comparison should be the strongest early paid signals. Comparison is the primary way the user experiences the value of the platform's data assets. For P0, the first paid comparison should compare School / Program Decision Options.

### 5. Payer Flexibility

The student may pay directly or invite a parent to pay. Parent-facing payment should explain the decision value and service context in plain language.

### 6. Post-payment Activation

After payment, the product should immediately activate value for the relevant participants:

- Students receive full decision workspace access and next steps.
- Parents receive understandable summaries, risks, and decision context.
- Counselors receive workspace visibility and follow-up prompts when attached.
- Institutions receive attribution or distribution visibility when eligible.

## Product Rules

- Payment unlocks the full Decision Workspace, not mandatory counselor continuation.
- Counselor or institution involvement should improve trust and distribution, but self-guided continuation must remain valid.
- The unlock should occur after the user has enough context to understand the value.
- The product should avoid making the user feel trapped by a channel relationship.
- Channel attribution should be captured when the conversion comes through an eligible counselor or institution.
- The free-to-paid boundary should follow [PRD-506: Initial and Full Workspace Boundary](PRD-506-initial-and-full-workspace-boundary.md).

## Open Questions

- Should counselor-guided and self-guided unlocks have the same price?
- Should institutions be able to require platform entry while leaving payment to families?
- What should happen when a student declines payment after entering through a required workspace channel?
