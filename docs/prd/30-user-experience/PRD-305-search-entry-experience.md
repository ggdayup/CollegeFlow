# PRD-305: Search Entry Experience

**Status**: Approved (Aligned via /grill-me interactive session)

## Downstream Consumers

- Onboarding
- Major Discovery
- University Discovery
- Program Comparison
- Initial and Full Workspace Boundary

## Purpose

Make the website entry feel like an ultra-simple search engine so new users can begin with the lowest possible activation cost by typing a country, school, major, program direction, or mixed natural-language intent.

## Problem

CollegeFlow has rich school, program, ranking, outcomes, and decision data, but a first-time user may not know which product surface to open first. If the entry experience asks users to choose a workflow before they have formed a clear question, the product creates unnecessary friction.

The entry should let users start from the words already in their head, then guide them toward trusted, source-backed information and decision surfaces.

## Product Principles

- **首屏绝对极简 (100vh Minimalist Header)**: The first screen prioritizing a single prominent search action over explanation-heavy navigation. Surrounding layout elements should feel as clean as a high-premium search engine (e.g., Google).
- **渐进深度 (Progressive Depth)**: Underneath the 100vh minimalist search header, users can scroll down to explore bento showcase cards (outlining major directory, university navigator, lifecycle curves, and credit bento flows) and pricing/subscription plans.
- **数据真实性红线 (Data Trust Compliance)**: Every academic, ranking, admissions, salary, or outcomes claim shown from search must preserve CollegeFlow's data trust and citation principles. No fake rankings, placeholder values, or unverified claims.
- **盲区兜底设计 (Responsible Gap State)**: When CollegeFlow has incomplete coverage for a query (e.g., non-preseeded universities or majors), the experience displays a clear, responsible gap state instead of fabricating data.

---

## Core User Stories

- **As a student**, I can type a country, school, or major and quickly find the most relevant CollegeFlow information without learning the site's navigation first.
- **As a parent**, I can start with a broad question such as a country plus major direction and see credible options or gaps.
- **As a counselor**, I can use the search entry as a fast way to reach a school, major, program comparison, or decision workspace during a conversation.

---

## Requirements

### 1. Unified Entry & Suggestion Tags (统一入口与快捷标签)

The public entry experience centers on a single prominent search input with minimal surrounding elements, vertically centered in a 100vh viewport.

Beneath the search input, interactive **Quick Suggestion Tags** are pre-seeded to guide initial user exploration:
- **你想去哪个国家 (Countries)**: 美 (US), 加 (CA), 英 (UK), 澳 (AU)
- **你想学什么专业 (Majors)**: 计算机 (Computer Science / CS), 经济 (Economics)
- **你想去哪个学校 (Universities)**: 哈佛 (Harvard), 斯坦福 (Stanford)
- **我想看看这个专业赚多少钱 (Salary Explorer)**: A dedicated entry point for the passion-vs-money exploration path, reflecting the #1 customer research finding

#### Salary Explorer Entry (薪资探索入口)
- When clicked, redirects to the Major Discovery experience with the Passion vs. Money Trade-off Framework pre-loaded
- This addresses the core customer insight: students want to know financial outcomes before committing to exploration
- Example: "我想看看心理学赚多少钱" → shows Psychology major with salary data, AI-resistance, and career paths

#### Tags Interaction Model:
1. **默认即时搜索 (Default Instant Search)**: Clicking a suggestion tag when the search box is empty or unfocused immediately triggers a search and redirects the user to the dedicated results page.
2. **聚焦追加填充 (Append on Focus)**: If the user's cursor is actively focused inside the search input, clicking a tag appends its value to the search input as an additional keyword (enabling easy multi-criteria mixed searches, e.g., `哈佛 + 计算机`).

#### Multilingual Localization:
Suggestion tags dynamically switch depending on the selected system language:
- **Simplified Chinese (zh)**: "你想去哪个国家：美 | 加 | 英 | 澳 ；你想学什么专业：计算机 | 经济 ；你想去哪个学校：哈佛 | 斯坦福"
- **Traditional Chinese (zht)**: "你想去哪個國家：美 | 加 | 英 | 澳 ；你想學什麼專業：計算機 | 經濟 ；你想去哪個學校：哈佛 | 斯坦福"
- **English (en)**: "Country: US | CA | UK | AU ; Major: CS | Economics ; University: Harvard | Stanford"

---

### 2. Dedicated Results Page Anatomy (独立搜索结果页架构)

When a search is triggered, the user is redirected to a dedicated search results view under `/search-results?q=<query>`.

The results page structures and categorizes findings into a Google-like clean index containing:
- **匹配专业卡片 (Matched Majors)**: Direct links to the major's directory, starting salary details, and prerequisites.
- **匹配名校卡片 (Matched Universities)**: Direct links to department details, admissions stats, and placement indexes.
- **匹配问答或对比 (Matched Comparisons)**: Links to ROI lifecycle curves comparing programs or schools.

---

### 3. Gap State & Trust UX (盲区兜底设计)

If the search query matches a country, major, or university that is currently unrecorded or lacks authoritative provenance (e.g., non-seeded universities like Harvard and Stanford), the results page triggers the **Data Trust Compliance Flow**:
1. **诚实声明暂缺 (Honest Gap Declaration)**: Display a clean, highly professional notification stating that the data is currently unrecorded, referencing CollegeFlow's strict data authenticity standards.
2. **邻近标杆推荐 (Anchor Recommendation)**: Suggest closest elite alternatives that are already fully mapped (e.g., UMich or Rice as benchmark representatives for elite universities).
3. **需求投票登记 (Demand Poll Voting)**: Provide an interactive button allowing users to "vote for ingestion" of the requested entity. When user votes reach a high threshold, a demand alert is sent to administrators for ingestion backlog prioritization.

---

### 4. Entitlement & Paywall Gating (免费数据查看边界与升级阻断)

The search results page serves as a primary driver for user registration and Pro upgrades:
- **免费/匿名可见性 (Free Teaser)**: Basic outcome statistics (e.g., "Median Starting Salary: $78k") and their verification/audit codes (e.g., `USN-2026-CS-001`) are visible to all anonymous and free users to build immediate professional trust.
- **深度分析组件阻断 (Pro & Login Gating)**: High-yield interactive tools (such as the 40-Year ROI lifecycle curve and the Prerequisite Course credit topology) are visually blurred/teaser-locked. Clicking them triggers a premium sign-up/login modal ("🔒 Log In to Unlock Interactive Dashboards").

---

## Acceptance Criteria

- **Given** a new user lands on the site, **when** they view the first screen, **then** they see a vertically centered Google-style simple search input and localized suggestion tags with no surrounding clutter.
- **Given** a user clicks a suggestion tag, **when** the search input is focused, **then** the tag's text is appended to the input.
- **Given** a user clicks a tag when the input is not focused, **when** clicked, **then** it immediately runs the query and redirects to `/search-results?q=<query>`.
- **Given** a search matches multiple categories, **when** the results page is loaded, **then** they are structured as categorized cards (Majors, Universities, and Comparisons).
- **Given** a search matches an unrecorded entity (e.g., Harvard), **when** results are shown, **then** the page displays a professional gap state, suggests UMich/Rice as benchmark comparisons, and renders a "Demand Vote" button.
- **Given** a user views a search result as a guest, **when** viewing the outcome details, **then** basic salaries and audit codes are visible, while interactive ROI curves and prerequisite flows are blurred with a premium lock overlay.

---

## Depends On

- Product Charter
- Data Trust and Citation Principles
- Decision Profile
- School / Program Comparison
- Major Discovery
- University Discovery
- Entitlement Model
- Initial and Full Workspace Boundary

## Does Not Own

- Source truth rules for schools, programs, rankings, admissions, salary, or outcomes
- Ranking methodology or data verification policy
- Search implementation, indexing, matching, or API contracts
- Paywall and subscription rules
