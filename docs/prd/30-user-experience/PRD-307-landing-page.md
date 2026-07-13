# PRD-307: Landing Page (Public Homepage)

**Status**: Approved (Aligned via /grill-me interactive session)

## Downstream Consumers

- Onboarding (PRD-300)
- Search Entry Experience (PRD-305)
- Major Discovery (PRD-301)
- University Discovery (PRD-302)
- Program Comparison (PRD-303)
- Entitlement Model (PRD-500)
- Subscription and Paywall (PRD-501)

## Purpose

Serve as CollegeFlow's primary acquisition surface for unauthenticated visitors, converting curiosity into action through a search-first entry, data-driven trust, product capability showcase, and subscription conversion — in that priority order.

## Problem

CollegeFlow has rich school, program, ranking, outcomes, and decision data, but a first-time visitor may not know what the product does or whether its data is trustworthy. The landing page must accomplish four goals in a single scroll:

1. **Acquisition**: Let users start searching immediately (lowest activation cost).
2. **Trust**: Prove data authenticity before asking for commitment.
3. **Showcase**: Demonstrate product capabilities through real data previews.
4. **Monetization**: Present subscription tiers and drive registration.

If any of these layers is missing or out of order, the page either loses visitors who can't act, loses credibility by looking like a generic SaaS, or loses revenue by failing to convert interest into sign-up.

## Product Principles

- **搜索优先 (Search-First Entry)**: The first screen centers on a single prominent search input (per PRD-305). No explanation-heavy navigation before the user can act.
- **信任锚点 (Trust Anchors)**: Every section of the page embeds verifiable data with audit codes. No decorative placeholders, no unverified claims.
- **渐进深度 (Progressive Depth)**: Hero → Bento → Insights → Pricing + CTA. Each scroll step adds depth without repeating the previous layer's message.
- **闭环转化 (Conversion Loop)**: The page begins with a search action and ends with a final CTA, forming a complete acquisition loop.

---

## Core User Stories

- **As a student**, I can land on CollegeFlow and immediately type a school, major, or career question — then scroll to see real salary data and product capabilities that convince me to sign up.
- **As a parent**, I can see credible salary and outcome data with source citations on the first screen, building trust before I consider registering.
- **As a counselor**, I can quickly assess CollegeFlow's data depth and product scope from the Bento showcase, then evaluate the Counselor subscription tier.

---

## Page Anatomy

### Page-Level Rules

- **Audience**: Unauthenticated visitors only. Authenticated users are redirected to the Logged-In Dashboard.
- **Route**: Rendered at the catch-all `/*` path when `isLoggedIn === false` and no search query is active.
- **Language**: Full trilingual support (zh / zht / en) via the `language` prop.
- **Data Authenticity**: Every salary, ranking, or outcomes figure must carry a verification audit code (e.g., `USN-2026-CS-001`). No fabricated or placeholder data.

---

### Section 1: Lightweight Header (轻量导航栏)

A fixed top navigation bar, always visible.

| Element | Behavior |
|---------|----------|
| **Logo** | "CollegeFlow" wordmark, left-aligned. Clicking scrolls to top. |
| **Language Switcher** | Compact dropdown or flag toggle (zh / zht / en), right side. |
| **Login Button** | Secondary style, right side. Navigates to `/login`. |
| **Register Button** | Primary/CTA style, right side. Navigates to `/register`. |

**Scroll Behavior**: On scroll-down, the header shrinks to a compact variant (smaller logo, smaller buttons) to maximize content area.

---

### Section 2: Hero (首屏搜索 + 信任锚点)

A 100vh viewport-height section, vertically centered, following PRD-305's search entry design with one addition: a rotating trust anchor.

#### 2.1 Search Entry (per PRD-305)

- Brand title: "CollegeFlow"
- Subtitle (localized): "高校毕业生薪资与行业人才供求透视" / "Graduate Salary & Talent Supply Insights"
- **Search Input**: Full-width, rounded, with placeholder "搜索大学、专业或职业方向..." / "Search universities, majors, or career paths..."
- **Quick Suggestion Tags** (per PRD-305 Section 1): Countries, Majors, Universities, Salary Explorer — with the same click/append interaction model and trilingual localization.

#### Search Navigation Behavior

When a search is triggered (via Enter key, suggestion tag click, or trust anchor click), the user is navigated to the dedicated search results route:

- **Route**: `/search-results?q=<query>`
- **Browser history**: The navigation pushes to history, so the browser back button returns the user to the landing page.
- **Implementation**: Use React Router's `navigate()` (or equivalent) rather than in-place component swapping. This ensures URL sharability, browser back/forward support, and alignment with PRD-305's dedicated results page architecture.

#### 2.2 Trust Anchor Carousel (信任锚点轮播)

Positioned directly beneath the suggestion tags. Rotates through 3-5 curated data points every 4 seconds with a smooth crossfade animation.

Each data point displays:
- A concise headline (e.g., "石油工程毕业生中位年薪 $146k")
- A source audit code (e.g., `USN-2026-PET-001`)
- A subtle category icon (💰 Salary / ⚠️ Warning / 📊 Trend)

**Curated Data Points** (initial set, all must be verified):

| # | Category | zh | en | Audit Code |
|---|----------|----|----|------------|
| 1 | 💰 Peak Salary | 石油工程毕业生中位年薪 $146k | Petroleum Engineering median salary $146k | USN-2026-PET-001 |
| 2 | ⚠️ Low Salary | 学前教育中位年薪 $51k — 收入预警 | Early Childhood Education median $51k — caution | USN-2026-EDU-001 |
| 3 | 📊 Talent Shift | 计算机 +159% vs 人文 -33% | CS +159% vs Humanities -33% | BLS-2026-CS-001 |
| 4 | 💰 Top ROI | 计算机 40 年累计回报 $5.2M | CS 40-year cumulative ROI $5.2M | IPEDS-2026-CS-001 |
| 5 | 🎓 Elite Benchmark | 密歇根大学 CS 起薪 $78k | UMich CS starting salary $78k | USN-2026-CS-001 |

**Interaction**: Clicking a trust anchor data point triggers a search for the referenced entity (e.g., clicking "石油工程" searches for Petroleum Engineering).

**Pause on Hover**: The carousel pauses when the user hovers over the current data point.

---

### Section 3: Bento Showcase (核心智能分析看板)

A 2-card bento grid showcasing 2 core product capabilities. Each card embeds **real data with audit codes** rather than decorative placeholders.

> **Deferred**: The Prerequisite Flow (专业核心主修课程流) and ROI Lifecycle (专业 ROI 回报曲线) cards are removed from the initial landing page. These features are complex to implement and not homepage priorities; they will be reconsidered in future iterations when production-ready.

#### Card Layout

| Position | Size | Card |
|----------|------|------|
| Row 1, Left | 1.5-col span | 全美专业近况透视 (Major Landscape) |
| Row 1, Right | 1.5-col span | 标杆名校专业地图 (University Map) |

#### Card Content Requirements

Each card must include:
1. **Title** (localized)
2. **Real data preview**: At least one verifiable data point with audit code embedded in the visual
3. **Decorative visual**: Chart, graph, or node diagram using the real data (not random numbers)
4. **CTA button**: "查看详情" / "View Details"

**Data Embedding Rules**:
- Major Landscape card: Shows real starting/mature salary figures for seeded majors (CS, Economics, etc.) with audit codes
- University Map card: Shows UMich/Rice as benchmark nodes with real program counts

**Interaction Model** (per existing behavior):
- **Unauthenticated users**: Clicking any CTA triggers the login/register modal
- **Authenticated users**: Clicking navigates to the corresponding dashboard view

---

### Section 4: Insights & Warnings (毕业生职场洞察与预警)

A 3-card section providing narrative depth beyond the Hero's data snapshots.

| Card | Icon | Color | Content |
|------|------|-------|---------|
| 💰 薪资之冠 (Peak Earners) | Green | Top-earning major with verified median salary + audit code |
| ⚠️ 收入预警 (Caution Zones) | Red | Low-earning majors with verified median salary + audit code |
| 📊 人才供给转移 (Talent Shifts) | Orange | Supply/demand trend with verified percentage + audit code |

Each card includes:
- A concise headline with real data
- A source audit code
- A CTA link button (e.g., "查看回报折线" / "View ROI Curve")

**CTA Interaction**: Same model as Bento — unauthenticated users see login modal; authenticated users navigate to the relevant dashboard view.

---

### Section 5: Pricing + Final CTA (定价方案 + 闭环行动召唤)

#### 5.1 Pricing Table

3-column pricing cards:

| Tier | Price | Key Features |
|------|-------|-------------|
| 标准免费版 (Free) | $0/mo | 1 comparison, Top 50 basic data, salary overview |
| 专业版 (Pro) | $19/mo | Unlimited comparisons, full data, 40-year ROI, branded PDF |
| 顾问版 (Counselor) | $49/mo | 50 student management, progress tracking, branded reports, all Pro features |

**Visual Treatment**: Pro card has elevated style (dark background, "最受欢迎" badge, slight vertical offset) as the recommended tier.

**CTA Buttons**: "开始使用" (Free) / "升级到 Pro" / "升级到 Counselor"

**Interaction**: Until Stripe integration is live, clicking a pricing CTA shows the existing subscription simulation modal.

#### 5.2 Final CTA (闭环行动召唤)

Immediately below the pricing table, a full-width section with:
- **Headline**: "开始你的数据驱动选校之旅" / "Start Your Data-Driven College Journey"
- **Search Input**: A secondary search bar (same style as Hero), allowing users to act immediately after reviewing pricing
- **Register Button**: Primary CTA "免费注册" / "Sign Up Free"

This creates a conversion loop: Hero search → scroll → pricing → final action.

---

### Section 6: Minimal Footer (最小页脚)

| Element | Content |
|---------|---------|
| Copyright | "© 2026 CollegeFlow. All rights reserved." |
| Data Trust Declaration | "所有数据均来自权威来源，遵循 CollegeFlow 数据真实性原则" / "All data sourced from authoritative origins, following CollegeFlow Data Trust Principles" |
| Language Switcher | Compact toggle (zh / zht / en) — mirrors header switcher |

---

## Logged-In User Behavior

When `isLoggedIn === true`, the landing page is **not rendered**. The user is shown the `<LoggedInDashboard />` component directly. This PRD does not govern the authenticated experience.

---

## Acceptance Criteria

### Hero & Search
- **Given** an unauthenticated visitor, **when** the page loads, **then** they see a 100vh Hero with a centered search input, suggestion tags, and a rotating trust anchor carousel.
- **Given** the trust anchor carousel is playing, **when** 4 seconds elapse, **then** it crossfades to the next data point.
- **Given** the user hovers over the current trust anchor, **when** the hover is active, **then** the carousel pauses.
- **Given** the user clicks a trust anchor data point, **when** the click fires, **then** a search is triggered for the referenced entity.

### Header
- **Given** the page is scrolled down, **when** the header is in compact mode, **then** the logo and buttons are smaller but still visible and functional.

### Bento Showcase
- **Given** an unauthenticated user views a Bento card, **when** they click the CTA, **then** a login/register modal is triggered.
- **Given** a Bento card is rendered, **when** the visual data is inspected, **then** at least one verifiable data point with an audit code is present.

### Insights
- **Given** the insights section is rendered, **when** a card is inspected, **then** it contains a real data point with an audit code, not a placeholder.

### Pricing & Final CTA
- **Given** the user scrolls to the bottom, **when** the pricing section is visible, **then** a final CTA section with a search input and register button is displayed below the pricing table.
- **Given** the user clicks the final CTA register button, **when** they are unauthenticated, **then** they are navigated to `/register`.

### Footer
- **Given** the page is rendered, **when** the footer is visible, **then** it contains a copyright notice, a data trust declaration, and a language switcher.

### Logged-In Redirect
- **Given** an authenticated user visits the root path, **when** the page loads, **then** they see the Logged-In Dashboard, not the landing page.

---

## Depends On

- Product Charter (PRD-010)
- Data Trust and Citation Principles (PRD-002)
- Search Entry Experience (PRD-305) — Hero search input and suggestion tags are governed by PRD-305
- Onboarding (PRD-300) — Post-registration flow
- Major Discovery (PRD-301)
- University Discovery (PRD-302)
- Program Comparison (PRD-303)
- Entitlement Model (PRD-500)
- Subscription and Paywall (PRD-501)
- Initial and Full Workspace Boundary (PRD-506)

## Does Not Own

- Search implementation, indexing, matching, or API contracts (PRD-305)
- Authentication and session management
- Stripe billing and subscription enforcement
- Logged-in dashboard layout and navigation
- Data verification and audit code generation pipeline
