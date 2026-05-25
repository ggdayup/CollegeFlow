# PRD-506: Initial and Full Workspace Boundary

Status: Draft

## Purpose

Define the product boundary between the free Initial Workspace and the paid Full Decision Workspace.

This boundary controls the most important conversion moment in the product: the user should see enough value to trust the platform, but the complete decision workflow should remain paid.

## Depends On

- [PRD-000: Commercial Thesis](../00-charter/PRD-000-commercial-thesis.md)
- [PRD-200: Decision Profile](../20-intelligence-products/PRD-200-decision-profile.md)
- [PRD-205: Decision Readiness](../20-intelligence-products/PRD-205-decision-readiness.md)
- [PRD-206: School / Program Comparison](../20-intelligence-products/PRD-206-school-program-comparison.md)
- [PRD-300: Onboarding](../30-user-experience/PRD-300-onboarding.md)
- [PRD-500: Entitlement Model](PRD-500-entitlement-model.md)
- [PRD-505: Invited User Conversion Path](PRD-505-invited-user-conversion-path.md)

## Core Boundary Principle

The Initial Workspace proves that the decision work is worth continuing.

The Full Decision Workspace delivers enough evidence, explanation, reporting, and next-step workflow for the student, parent, counselor, or institution to act on the decision. This paid outcome is defined by [PRD-205: Decision Readiness](../20-intelligence-products/PRD-205-decision-readiness.md).

In short:

```text
Initial Workspace: worth continuing
Full Decision Workspace: ready to decide and act
```

## Initial Workspace

The Initial Workspace is the free or pre-unlock workspace. It should make the product feel personal, credible, and worth continuing without completing the full decision workflow.

### Free Value

The Initial Workspace may include:

- basic Decision Profile summary;
- high-level initial insight;
- top decision risk previews;
- major, school, or program direction preview;
- visible data gap or uncertainty previews;
- locked comparison, report, checklist, and collaboration previews;
- parent unlock call to action when a student starts alone.

### Product Requirements

- The user should understand that the workspace is based on their own profile, not generic content.
- The user should see that deeper analysis exists.
- The user should see why paying unlocks meaningful decision progress.
- The Initial Workspace should not provide a complete school, major, program, or report-level decision package.
- The Initial Workspace should avoid unsupported certainty and should show missing or uncertain data honestly.

## Full Decision Workspace

The Full Decision Workspace is the core paid product.

It should help users complete a decision cycle:

```text
Direction Clarity
  -> Data-backed Comparison
    -> Risk Awareness
      -> Parent-readable Report
        -> Action Readiness
```

### Paid Unlock Value

The Full Decision Workspace may unlock:

- full Decision Profile;
- full insight explanation;
- major, school, or program direction analysis;
- School / Program Decision Option comparisons;
- source and confidence cues;
- detailed risk and gap explanations;
- parent-readable report;
- next-step checklist;
- optional counselor or institution collaboration layer;
- workspace updates as the user's decision evolves.

### Product Requirements

- The user should understand what changed after unlock.
- The workspace should support both self-guided and guided usage.
- Direction Clarity and Data-backed Comparison should be the highest-priority paid workspace outcomes.
- The first paid comparison should focus on School / Program Decision Options.
- The parent-readable report should make payment feel like a tangible decision deliverable.
- Data-backed comparisons should connect the product's data assets to user-perceived value.
- Next-step checklists should convert analysis into progress.
- Collaboration should enhance channel-led workflows without making counselor service mandatory.

## Usage Modes After Unlock

### Self-guided

The student or parent uses the full workspace independently and acts as their own counselor.

### Counselor-guided

An attached counselor uses the workspace to review profile data, add recommendations, interpret risks, prepare reports, and continue service delivery.

### Institution-guided

A school, agency, or institution uses the workspace as part of a broader student service workflow.

## Product Rules

- Do not frame the paid unlock as merely a subscription upgrade.
- Do not frame the paid unlock as mandatory counselor continuation.
- Do not give away the complete decision package in the Initial Workspace.
- Do not hide uncertainty or missing data to make the paid unlock look stronger.
- Do make the paid unlock feel like access to a complete decision environment.
- Do preserve self-guided value even when the user arrived through a counselor or institution.

## Open Questions

- How much initial insight is enough to establish trust without weakening paid conversion?
- Which locked previews should appear first for students versus parents?
- Should the Initial Workspace differ when the invite comes from a required workspace channel?
- Should workspace updates be part of the first paid tier or a higher tier?
