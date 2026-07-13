# PRD-306: Student Personal Dashboard

**Status**: Draft (Derived from PRD-31 & PRD-300 alignment)

## Depends On

- `PRD-300-onboarding` (Onboarding Wizard & First Insight)
- `PRD-200-decision-profile` (User Academic & Priorities Data)
- `PRD-301-major-discovery` (Recommended Majors & Clusters)
- `PRD-304-application-planning-workspace` (Saved Items & Goals)
- `PRD-506-initial-and-full-workspace-boundary` (Premium Lock & CTAs)

## Purpose

Provide a highly personalized, high-value, and action-oriented post-login experience for students immediately after they finish onboarding. The dashboard transitions students from initial curiosity to structured exploration, showcasing immediate value through personalized insights (e.g., ROI predictions, admissions matches) rather than presenting a cold, generic data dump.

## Problem

1. **Lack of Post-Onboarding Personalization**: Currently, the dashboard lands on a static national market signals page. This does not address the student's personal question: *"Given my GPA, budget, and career goals, what majors and schools should I focus on?"*
2. **Cold Start Cognitive Friction**: When students skip fields during the 3-Step Onboarding Wizard, they are thrown into a generic layout with no clear call-to-action on how to build out their decision readiness.
3. **No Clear Visual Hierarchy**: Students need a unified dashboard that houses active insights, saved targets, quick comparison shortcuts, and a clear path to complete their Decision Profile.

---

## Product Principles

- **自适应数据装配 (Dynamic Personalization)**: The dashboard changes state based on whether the student's profile is complete or partial. It must gracefully degrade to national baselines when inputs are skipped.
- **瞬间激活价值 (Value First, Form Later)**: Never block the student with empty states. Lead with instant value (Market Signals and personalized suggestions) and use high-intent widgets to pull students into completing their details.
- **无缝商业转化 (Commercial Funnel Integration)**: Integrate premium visual locked widgets directly into the dashboard (e.g., deep ROI curve charts or prerequisite maps) to encourage upgrade conversions naturally.

---

## Core User Stories

- **As a newly registered student** who completed onboarding, I want to see personalized major recommendations and a clear summary of how competitive I am at target schools, so I know where to begin my research.
- **As a student who skipped onboarding fields**, I want to see a clear list of missing fields (e.g., SAT, Budget) that I can easily complete inline, with real-time updates to my dashboard recommendations.
- **As a returning student**, I want a clean hub where I can quickly search, compare saved options, see high-level labor market updates, and resume active comparison sessions.

---

## Requirements

### 1. Unified Student Sidebar Navigation (统一侧边栏导航)

To streamline student focus, the desktop experience utilizes a 240px wide left sidebar (and a 3-4 button mobile bottom tab bar):
- **📊 Overview (概览)**: Routes to this `/dashboard/student` dashboard.
- **🔍 Explore (探索)**: Routes to `/dashboard/student/explore` (incorporates the Majors Directory and University Navigator).
- **⭐ Saved (收藏)**: Routes to `/dashboard/student/saved`.
- **📈 Compare (对比)**: Routes to `/dashboard/student/compare` (active program comparison tool).
- **⚙️ Settings (设置)**: Routes to `/settings`.

### 2. State-Based Layouts (状态自适应看板布局)

The dashboard renders one of two primary states based on the student's `DecisionProfile` completeness:

#### A. Partial Profile State (未填/跳过部分 Onboarding 状态)
If critical parameters (e.g., school name, SAT/ACT, GPA, financial budget) were skipped:
1. **Guided Profile Setup (引导式简报补全 - 渐进显现设计)**: Displays an active helper widget listing missing profile fields. Supports expanding inline forms to submit missing values one-by-one.
   - **Progressive Reveal (即时渐进显现)**: Submitting any single missing field (e.g., entering a GPA without a SAT score) must trigger an in-place, hot-reload/local spinner of the affected widgets (e.g., `Competitiveness Overview`) to immediately reflect more refined admissions recommendations. The student does not need to complete all fields to see value.
2. **Interest Explorer Widget (兴趣探索器)**: Shows high-level interactive interest category chips (e.g., "Help people", "Build systems") that maps to general recommendations using system defaults.

#### B. Full Profile State (已填 Onboarding 状态)
Displays the personalized bento layout, prioritizing user-specific context at the very top:

```text
┌────────────────────────────────────────────────────────┐
│  Competitiveness Overview (Admissions Fit & Benchmarks)│  ← 首屏顶部：个人竞争力与档案状态
├────────────────────────────────────────────────────────┤
│  Recommended for You (Personalized Majors & ROI)       │  ← 第二屏：三轨个性化推荐卡片
├────────────────────────────────────────────────────────┤
│  Quick Actions Panel                                   │  ← 第三屏：快捷操作面板
├────────────────────────────────────────────────────────┤
│  Market Signals Widget (Compact Overview)               │  ← 底部：后端动态宏观市场大盘
└────────────────────────────────────────────────────────┘
```

#### C. First Landing / Onboarding Integration (首登与新手简报集成)
- **First Insight Modal (一次性新手简报遮罩)**: Immediately upon first visit to `/dashboard/student` post-onboarding, the student is presented with a premium, full-screen **First Insight Card** modal overlay summarizing their tailored recommendations (e.g., UMich/Rice CS ROI match).
- **Dismissal Behavior (关闭行为)**: Once dismissed by clicking the close action or completing a high-intent CTA, the modal is closed permanently and the student lands directly on their standard state-based dashboard dashboard panel. It will never automatically re-appear.
- **Re-access Channel (重新调阅通道)**: A low-profile link to "Re-play Onboarding Insight Report" is made available under the `Competitiveness Overview` settings area to retrieve the presentation again.

### 3. Widget Requirements (看板小组件规范)

#### 3.1 Market Signals Widget (全球/全国市场透视 - 动态数据聚合)
- **Backend Dynamic Aggregation (后端动态数据聚合)**: Served via backend API (`GET /api/majors/market-signals`), which dynamically queries the PostgreSQL IPEDS database to calculate current micro-trends:
  - **Peak Earner (薪资之冠)**: Sourced from the highest median prime-age salary program records.
  - **Caution Base (收入预警)**: Identifies the lowest prime-age median earnings records.
  - **Demand Swell (扩招剧烈)**: Calculates programs with the steepest degree/enrollment volume growth rate over recent years.
  - **Talent Recede (学位萎缩)**: Identifies programs with the largest percent decrease in degrees conferred.
- **Visual Presentation**: Rendered as a compact row of 4 data cards. Displays exact in-platform source citation badges rather than external redirection links.
- **Layout Placement**: Positioned at the **bottom** of the Full Profile Dashboard to ensure the top-of-screen real estate is fully reserved for student-personal context.

#### 3.2 Recommended for You Widget (个性化专业推荐 - 策略差异化匹配)
- **Categorized Recommendation (差异化三轨匹配)**: Displays exactly three distinct recommendation cards based on different decision strategic profiles to help the student weigh trade-offs:
  1. **👑 声誉梦想 (Elite Prestige)**: Sourced from majors aligned with high academic prestige and elite university ranking matrices.
  2. **💰 回报金库 (Peak ROI)**: Displays the highest median-earnings major aligned with their academic background and market demand.
  3. **🧬 兴趣契合 (Passion Match)**: Maps directly to the student's highest-interest categories and prerequisite preferences.
- **Card Metadata**: Each card shows: Major name, strategic badge (Prestige / ROI / Passion), recent median starting salary, matching rationale based on profile weights, and a CTA linking to the deep-dive major detail page.
- **Fallback Rule**: When profile weights or inputs are absent, defaults to balanced national system baseline profiles to select the recommended majors for the 3 categories.

#### 3.3 Competitiveness Overview Widget (录取竞争力看板)
- Combines user's GPA, SAT/ACT, and school parameters to display their matching position in the admissions funnel.
- Computes matching bands dynamically:
  - **Reach (冲刺)**, **Match (匹配)**, **Safety (保底)** categories for pre-seeded target institutions.
- Prominently flags incomplete variables: `"Complete your SAT and budget lines to unlock 12 additional matched target universities."`
- Incorporates a premium-lock preview for detailed admissions percentage curves.

#### 3.4 Quick Actions Panel (快捷入口面板)
- High-level shortcut cards to immediately launch key workflows:
  - **Search Majors (搜索专业)**
  - **Explore Majors (专业探索)**
  - **Compare Programs (对比专业)**
  - **My Saved List (我的收藏)**

---

## Acceptance Criteria

- **Given** a student completes onboarding, **when** they land on their dashboard, **then** they must see a personalized summary matching their GPA/weights rather than a generic national view.
- **Given** a student has skipped Step 2 or 3 of onboarding, **when** they access `/dashboard/student`, **then** the dashboard must display the `Guided Profile Setup` widget highlighting missing fields.
- **Given** a student inputs a missing profile field in the dashboard, **when** the form is submitted, **then** the page must hot-reload recommendations in-place without page refresh.
- **Given** a student views the `Recommended for You` section, **when** they click a recommended major, **then** they are routed to the specific major details page within `/dashboard/student/explore`.
- **Given** a free student clicks the detailed admissions calculator or ROI comparison in `Competitiveness Overview`, **when** the system detects no active premium subscription, **then** it displays the `Premium Lock` signup overlay.

---

## Does Not Own

- Auth/Session management implementation.
- Scraping or seeding IPEDS and College Scorecard datasets.
- Stripe subscription billing status checks (delegated to `PRD-500` / `stripe.ts`).
