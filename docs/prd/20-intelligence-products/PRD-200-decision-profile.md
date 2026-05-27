# PRD-200: Decision Profile

Status: Draft

## Depends On

- Data trust and citation principles
- Institution, ranking, program, curriculum, and outcomes data asset PRDs
- User segments and roles

## Purpose

Create a user-facing decision profile that combines goals, preferences, constraints, and trusted data signals into an explainable college-major decision context. The Decision Profile is the foundation for all recommendation, comparison, and readiness scoring in the platform.

## Problem

Students don't know what they want, parents care about different factors, and counselors need a structured way to capture student context. Without a shared profile, every recommendation feels like a black box. Research confirms:

- *"I don't know what I want to be"* — Students lack a framework for articulating their interests and constraints.
- *"My heart says X, my brain says Y"* — Students have competing priorities but no way to express or reconcile them.
- *"Most parents get zero training on how to support their kids"* — Parents don't know what factors matter for the decision.
- Counselors need a structured intake: *"Can I import my existing spreadsheet?"* — existing student profiles live in unstructured notes and spreadsheets.

## Product Principles

- **渐进式画像 (Progressive Profiling)**: Collect critical data early via onboarding, but allow continuous refinement. Never demand complete information upfront.
- **可解释权重 (Explainable Weights)**: Every recommendation derived from the profile must answer "why." Users should see which profile factors drove each suggestion.
- **角色差异化 (Role-Adaptive)**: Students, parents, and counselors see and edit different parts of the profile.
- **不确定性友好 (Uncertainty-Friendly)**: The profile should not require certainty. "I'm exploring" is a valid profile state.

## Core User Stories

- **As a student**, I can define what matters to me (salary, prestige, location, campus culture, academic fit) and see how my preferences shape recommendations.
- **As a student who is undecided**, I can start with broad interests and let the system suggest areas to explore without committing to a major.
- **As a parent**, I can set financial constraints (tuition budget, max acceptable debt) without overriding my child's preferences.
- **As a counselor**, I can annotate a student's profile with professional observations and adjust recommendation weights on their behalf.

## Requirements

### 1. Profile Dimensions (决策画像维度)

The Decision Profile must capture five dimensions:

**A. Academic Context (学术背景)**
- GPA, test scores (SAT/ACT), class rank (if available)
- Intended major / field direction (can be "undecided")
- AP/IB coursework and performance
- Extracurricular interests and leadership roles

**B. Decision Weights (决策权重)**
- User-adjustable weights for the factors that matter most:
  - `💰 薪资与长期回报 (Median starting & prime salary)`
  - `🎓 学术排名与声誉 (Elite prestige)`
  - `🧬 先修学分与学术匹配 (Academic fit & prerequisites)`
  - `💸 学费与成本敏感度 (Affordability & cost-of-living)`
  - `🌍 地理位置与环境 (Location, campus culture, social environment)`
  - `🤖 AI 抵御指数 (AI-resistance of career paths)`
- Weights sum to 100% or use a drag-to-rank interface
- Default weights apply when user skips: Salary 50%, Prestige 30%, Academic Fit 20%

**C. Financial Constraints (财务约束)**
- Annual tuition & living budget range (e.g., "$30K-$50K")
- Maximum acceptable debt load
- Financial aid eligibility (FAFSA, CSS Profile status)
- Parent vs. student financial responsibility split

**D. Preference Signals (偏好信号)**
- Geographic preferences (region, urban/suburban/rural, distance from home)
- Campus size preference (small liberal arts vs. large research university)
- Social environment preferences (Greek life, sports culture, arts scene)
- Career direction preferences (stable career, high growth, purpose-driven, entrepreneurial)
- AI anxiety signal: "I want fields where AI can't yet do it" vs. "I'm open to AI-adjacent fields"

**E. Counselor Annotations (顾问批注)**
- Counselor-observed strengths and weaknesses
- Professional recommendation direction
- Family dynamic notes (e.g., "parent pushes for STEM, student prefers humanities")
- Private by default; visible to student and parent only when shared

### 2. Role-Specific Profile Views (角色自适应画像视图)

**Student View**:
- Sees and edits all dimensions except counselor annotations
- Can adjust weights and see real-time impact on recommendations
- Can mark dimensions as "still exploring" without committing

**Parent View**:
- Sees and edits financial constraints
- Can view (not edit) student's decision weights
- Can add "concerns" that appear in the counselor annotation panel
- Cannot edit academic context or preference signals

**Counselor View**:
- Sees all dimensions including private annotations
- Can suggest weight adjustments (visible to student as suggestions, not overrides)
- Can mark profile as "complete enough for recommendations" or "needs more data"

### 3. Explainable Recommendations (可解释推荐)

Every recommendation derived from the Decision Profile must include:

- **Why this matches**: "This school scores high because it aligns with your top 3 priorities: salary ($78K median), prestige (Top 20), and location (urban, Northeast)"
- **Why this doesn't match**: "This school ranks lower because it doesn't match your budget ($65K COA exceeds your $50K budget) and your AI-resistance preference (top careers in this program have moderate AI exposure)"
- **Confidence level**: "High confidence" (all profile dimensions complete), "Partial confidence" (some dimensions missing), "Low confidence" (mostly exploratory profile)

### 4. Profile Completeness Indicator (画像完整度指示)

- Visual indicator showing profile completeness (e.g., 3 of 5 dimensions filled)
- Gentle nudge to complete missing dimensions: "Adding your financial budget will help us recommend schools within your price range"
- Never block progress due to incomplete profile — apply sensible defaults

## Product Rules

- The profile should explain which data signals influenced a decision.
- Missing or low-confidence data should reduce confidence or trigger warnings instead of being silently filled.
- Students, parents, and counselors may view different collaboration surfaces, but the underlying evidence should remain traceable.
- The profile should never claim to know what the user wants better than the user does. Recommendations are suggestions, not verdicts.

## Does Not Own

- Source truth rules.
- Ranking normalization.
- Commercial entitlement packaging.
- Database schema or API contracts.
