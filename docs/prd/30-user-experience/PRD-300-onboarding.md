# PRD-300: Onboarding

**Status**: Approved (Aligned via /grill-me interactive session)

## Downstream Consumers

- User Profile
- Decision Profile
- Fit Engine
- Admissions Competitiveness Model
- Initial and Full Workspace Boundary

## Purpose

Help students, parents, and counselors reach a useful first decision moment quickly while collecting enough context to initialize the user's customized **Decision Profile (决策画像)** without creating registration friction.

## Problem

CollegeFlow's decision engine relies on multi-dimensional inputs (GPA, test scores, financial budget, and personal weights). However, asking users to input this vast amount of context immediately upon registration creates extreme cognitive load and leads to high drop-off rates.

Onboarding must balance collecting critical personal context with delivering immediate, high-value visual gratification (the **"Aha! Moment"**) on the very first screen.

---

## Product Principles

- **极速画像向导 (3-Step Wizard)**: Collect core data in a structured, progressive 3-step向导 rather than a massive single form.
- **跳过安全阀 (Skip Safeguard)**: Step 2 and Step 3 are entirely optional. Users can click "Skip for Now" (暂不填写) to maintain a sub-30-second friction-free signup. When skipped, the system applies robust national baseline averages.
- **角色差异化深定 (Role Adaptation)**: Customize onboarding inputs and weights dynamically based on whether the user is a Student, Parent, or Counselor.
- **价值瞬间激活 (First Value Aha! Moment)**: Immediately upon onboarding completion, present a bespoke, highly personalized "First Insight" report card to demonstrate platform power instantly, rather than throwing the user onto a cold dashboard.

---

## Core User Stories

- **As a student**, I can complete onboarding quickly, skip heavy standardized testing inputs if I want, and immediately see which majors and elite schools match my GPA and career ROI desires.
- **As a parent**, I can complete onboarding focused on my tuition budget and the long-term career outcome of my child without getting bogged down by raw coursework prerequisites.
- **As a counselor**, I can onboard using my target advising regions and agency context, and immediately reach a workspace built to manage multiple student records and export PDF reports.

---

## Requirements

### 1. The 3-Step Wizard Flow (三步智能新手向导)

The onboarding experience is centered on a clean, modern card wizard:

#### Step 1: Role Selection & Academic Context (角色与学术起点)
- **Action**: Select user role: **STUDENT** (学生), **PARENT** (家长), **COUNSELOR** (顾问), or **OTHER** (其他).
- **Inputs**: Current school/institution name, graduation year.

#### Step 2: Competitiveness & Financial Baseline (竞争力与资金基础 - 角色自适应)
- Form fields dynamically morph depending on the selected role (see Section 2).
- **Rule**: A prominent, secondary "Skip for Now" button must be available to proceed without friction.

#### Step 3: Decision Factors Allocation (决策因子权重配置 - 角色自适应)
- Users adjust simple sliders or order cards to define their personal priorities (Prestige, Median Salary, or Prerequisites flexibilities).
- **Rule**: A "Skip for Now" button is available, defaulting weights to `Salary/ROI: 50%`, `School Prestige: 30%`, `Academic Fit: 20%`.

---

### 2. Role-Specific Customization (多角色深度定制表单)

To maximize data fidelity and trust, the onboarding forms adapt dynamically to the user's primary objectives:

#### A. STUDENT (学生模型)
* **Step 2 (Competitiveness)**: Inputs current Cumulative GPA (e.g. `3.8`), and optional SAT/ACT scores.
* **Step 3 (Weights Allocation)**: Adjusts weights for:
  - `🤑 薪资与长期回报 (Median starting & prime salary)`
  - `🎓 学术排名与声誉 (US News / QS Elite Prestige)`
  - `🧬 先修学分与毕业阻碍 (Prerequisite coursework flexibility)`

#### B. PARENT (家长模型)
* **Step 2 (Financial Constraints)**: Bypasses standard testing scores. Instead, inputs **"Annual Tuition & Living Budget"** (年学费与生活成本预算线，如 `$30k - $50k`) or cost sensitivity.
* **Step 3 (Weights Allocation)**: Adjusts weights for:
  - `💸 学费与生活成本敏感度 (Affordability & Cost-of-Living adjusted yields)`
  - `📈 40年长期职业回报 (40-year cumulative salary yield)`
  - *Note: Academic prerequisites and micro-coursework weights are fully hidden to keep the vocabulary tailored to family decisions.*

#### C. COUNSELOR (顾问模型)
* **Step 2 (Advising Scope)**: Inputs current counseling agency/high school, target countries (美, 加, 英, 澳), and target student volume.
* **Step 3 (Platform Goals)**: Instead of personal scores or family budgets, selects primary tool helper requirements:
  - `📄 导出多维PDF研判报告 (Printable counselor deliverables)`
  - `🔗 连线验证先修学分拓扑 (Course topology maps)`
  - `🛡️ 一键审计数据源真实性 (IPEDS/CDS audit trails)`
* *Note: Instantly routes counselors to the Multi-Client counselor dashboard panel on completion.*

---

### 3. "Aha! Moment" First Insight Activation (首期智能决策简报卡片)

Upon clicking the final "Generate My Workspace" button on Step 3:

#### Step 3.1: "画像数据灌溉中" (Data Synthesis Loading)
- Render a 3-second high-premium progress animation. This builds psychological weight, making the user feel that the decision engine is actively parsing verified CDS and IPEDS datasets for their specific profile.

#### Step 3.2: Bespoke Welcome Presentation (个性化首期智能决策简报卡片)
Instead of the default dashboard, show a personalized **First Insight Card** matching their exact inputs:
- **Bespoke Recommendation**: Match their GPA, Country, and Weights to pre-seeded target universities (e.g., UMich or Rice) and majors (e.g., Computer Science).
  - *Example Copy*: `"Welcome! Based on your GPA of 3.8 and preference for Elite Prestige + CS ROI in the US, we recommend exploring Computer Science at UMich. Graduates hitting prime age average a median salary of $78k (Audit Code: USN-2026-CS-001)."`
- **Call to Action (CTA)**: Provide high-intent interactive buttons:
  - `[查看 UMich 40年生命周期 ROI 曲线]`
  - `[查看 6 门核心先修课程学分拓扑图]`
- **Smooth Premium Upsell**: Clicking these CTAs seamlessly prompts the user to verify/sign up or unlock the paid full workspace, ensuring perfect commercial funnel integration.

---

## Acceptance Criteria

- **Given** a newly registered user lands on `/onboarding`, **when** they select a role, **then** they are guided through a 3-step wizard with role-specific customized questions.
- **Given** the user is in Step 2 or Step 3, **when** they click "Skip for Now", **then** they proceed to the next step immediately, with system-default baseline profiles applied silently.
- **Given** a user is logged in as a **Parent**, **when** they complete Step 2 & 3, **then** the input screens gather tuition budget range and ROI yields weight, completely omitting academic prerequisites.
- **Given** a user is logged in as a **Counselor**, **when** onboarding completes, **then** they bypass personal GPA screens and route directly to the Counselor SaaS workspace.
- **Given** a student completes onboarding, **when** the final screen finishes loading, **then** they are shown a 3-second synthesis animation followed by a personalized **First Insight Card** recommending a specific seeded university (UMich/Rice) or major matching their parameters.
- **Given** a user clicks on the prerequisite flow or ROI curve links on the First Insight card, **when** they are free users, **then** the system displays a premium-lock sign-up overlay to incentivize conversions.

---

## Depends On

- User Segments and Roles
- Decision Profile
- Fit Engine
- Admissions Competitiveness Model
- Initial and Full Workspace Boundary
- Data Trust and Citation Principles

## Does Not Own

- Authentication implementation details
- Raw university seed crawler logic
- Commercial pricing/Stripe billing contracts
