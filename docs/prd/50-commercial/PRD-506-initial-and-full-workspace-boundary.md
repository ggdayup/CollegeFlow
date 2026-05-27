# PRD-506: Initial and Full Workspace Boundary

**Status**: Approved (Aligned via /grill-me interactive session)

## Downstream Consumers

- [PRD-000: Commercial Thesis](../00-charter/PRD-000-commercial-thesis.md)
- [PRD-200: Decision Profile](../20-intelligence-products/PRD-200-decision-profile.md)
- [PRD-205: Decision Readiness](../20-intelligence-products/PRD-205-decision-readiness.md)
- [PRD-206: School / Program Comparison](../20-intelligence-products/PRD-206-school-program-comparison.md)
- [PRD-300: Onboarding](../30-user-experience/PRD-300-onboarding.md)
- [PRD-500: Entitlement Model](PRD-500-entitlement-model.md)
- [PRD-505: Invited User Conversion Path](PRD-505-invited-user-conversion-path.md)

---

## Core Boundary Principle

The **Initial Workspace (初级预览工作台)** proves that the decision work is worth continuing.

The **Full Decision Workspace (深度决策工作台)** delivers enough evidence, explanation, reporting, risk mitigation, and next-step actions for the student, parent, or counselor to act on the decision.

```text
Initial Workspace: worth continuing (Free / Preview)
Full Decision Workspace: ready to decide and act (Paid Pro Upgrade)
```

---

## Product Requirements

### 1. Dual Conversion Pathways (双重支付转化路径)

When a user hits a Pro premium gating barrier in the Initial Workspace, the system provides **two distinct conversion pathways** to cater to all user roles:

#### Pathway A: Direct Checkout (一键直接升级)
- **Target**: Independent students with their own credit cards, parents using their own accounts, or professional counselors purchasing platform tools.
- **Action**: Direct access to credit card payment form / Stripe QR Code to instantly upgrade the active account to Pro Unlimited ($19/mo).

#### Pathway B: Ask Parent to Unlock (发送家长代付简报)
- **Target**: Students dependent on family financing who do not own credit cards.
- **Action**: Clicking "Ask Parent to Unlock" opens a quick form where the student inputs the parent's email/contact.
- **Outcome**: The system generates a personalized, highly professional **Parent Teaser Portal URL (家长代付决策邀请信与简报)** sent directly to the parent.

---

### 2. Parent Teaser Portal & Decision Readiness Matrix (家长代付简报页信息架构)

The generated Parent Teaser Portal is a web view tailored specifically to the psychological concerns of college-paying parents (Return on Investment, Risk Aversion, and Academic Security):

#### A. Decision Readiness Matrix (决策就绪度评估矩阵)
At the top of the portal, render a high-premium diagnostic matrix outlining the student's current status:
- **🎯 方向清晰度 (Direction Clarity)**: `🟢 High` (Shows student has completed onboarding and established a baseline Major direction, e.g. US Computer Science).
- **📊 数据对比度 (Data-backed Comparison)**: `🟡 Pending Activation` (Alerts parent that UMich vs. Rice program cost/salary comparisons are pre-calculated and awaiting unlock).
- **⚠️ 风险防范度 (Risk Awareness)**: `🔴 Salient Risk Warnings Found` (Alerts parent that the system has detected **2 Critical Graduation / Saturated Market Risks** for the child's chosen path. Detail is locked).
- **📝 行动就绪度 (Action Readiness)**: `🔴 Action Pending` (Alerts parent that a 4-year prerequisite scheduling checklist is prepared to avoid graduation delay, awaiting unlock).

#### B. The Credibility Anchors (信任锚点与真数据)
- The page displays actual, authenticated starting salary figures for their child's target school (e.g. UMich CS: $78,000) with official USN/IPEDS verification codes to build maximum data trust.

#### C. The Conversion Goad (风险厌恶升级诱饵)
- Detailed risk explanations and the graduation checklist are teasingly locked.
- **CTA 文案**: `"🔒 Upgrade for $19 (the price of a cup of coffee) to instantly reveal the 2 Critical Graduation Risks, unlock 40-year ROI salary trends, and protect your child's educational yield."`
- Parent pays via one-click checkout, instantly unlocking the parent portal and upgrading the student's main workspace to Pro in real-time.

---

### 3. Dynamic Teaser Gating (真数据动态脱敏预览与精准模糊)

To hook user curiosity without appearing cold or generic, premium components in the Initial Workspace implement **Dynamic Teaser Gating** instead of static locked cards:

#### A. The 40-Year ROI Chart Gating
- **Free Visibility**: The chart displays real, interactive data for the **first 5 years (Recent Grad start years)**. Users can hover and see real salary points.
- **Paid Gating**: The remaining 35 years (Prime-Age & Peak Earnings cohorts) and the Cost-of-Living adjustment toggle are elegantly blurred behind a high-premium frosted-glass overlay with the label:
  - `"🔒 Pro Unlimited unlocks the full 40-year occupational yield and Cost-of-Living adjustment."`

#### B. The Prerequisite Course Flow Gating
- **Free Visibility**: Renders the first 2 core introductory requirement courses (e.g. CS 101, Data Structures) showing actual title cards.
- **Paid Gating**: All advanced 300/400 level electives and the final graduation milestone nodes are blurred behind a misty overlay with interactive click triggers:
  - `"🔒 Unlock full curriculum sequence, 152 credits, and graduation bottleneck warning rules."`

---

## Acceptance Criteria

- **Given** a guest or free user visits the 40-Year ROI Chart, **when** they interact with it, **then** they can view and hover over the first 5 years of salary data, while the remaining 35 years are blurred with a frosted-glass overlay.
- **Given** a free student hits a locked Pro feature, **when** the payment modal is triggered, **then** they are presented with both "Direct Upgrade" and "Ask Parent to Unlock" conversion pathways.
- **Given** a student sends a Parent Teaser link, **when** the parent opens it, **then** they see a customized diagnostic "Decision Readiness Matrix" displaying `🔴 Salient Risks` and UMich CS's verified salary starting stats, completely free.
- **Given** the parent attempts to view the specific 2 Critical Graduation Risks on the teaser portal, **when** clicked, **then** it prompts the parent with a $19 one-click代付 checkout.
- **Given** a parent completes payment on the teaser portal, **when** successful, **then** both the parent's portal and the student's primary workspace are instantly upgraded to Pro status.

---

## Depends On

- [PRD-000: Commercial Thesis](../00-charter/PRD-000-commercial-thesis.md)
- [PRD-200: Decision Profile](../20-intelligence-products/PRD-200-decision-profile.md)
- [PRD-205: Decision Readiness](../20-intelligence-products/PRD-205-decision-readiness.md)
- [PRD-206: School / Program Comparison](../20-intelligence-products/PRD-206-school-program-comparison.md)
- [PRD-300: Onboarding](../30-user-experience/PRD-300-onboarding.md)
- [PRD-500: Entitlement Model](PRD-500-entitlement-model.md)

## Does Not Own

- Raw data crawl policies or ranking math pipelines.
- Stripe payment SDK configurations.
- Counselor CRM administrative dashboards.
