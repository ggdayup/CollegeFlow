# PRD-308: Search Results Page

**Status**: Approved (Aligned via /grill-me interactive session)

## Downstream Consumers

- Landing Page (PRD-307) — search entry triggers navigation to this page
- Search Entry Experience (PRD-305) — search input interaction model
- Major Discovery (PRD-301)
- University Discovery (PRD-302)
- Program Comparison (PRD-303)
- Entitlement Model (PRD-500)
- Subscription and Paywall (PRD-501)

## Purpose

Serve as CollegeFlow's primary search destination, presenting categorized results (Majors, Universities, Comparisons) from a unified backend API, with field-level paywall gating to convert anonymous visitors into registered users.

## Problem

When a user types a query on the landing page, they need to see structured, trustworthy results immediately. The current implementation uses client-side static seed data, which limits coverage and depth. A backend-driven search results page can serve richer data (rankings, admissions stats, salary curves) while enforcing entitlement boundaries at the field level — showing enough to build trust, but gating deep analysis behind registration.

## Product Principles

- **后端驱动 (Backend-Driven)**: All search data is fetched from the BFF API. The frontend does not hold static search datasets. If the API is unavailable, the page displays a graceful degradation message rather than stale local data.
- **分区清晰 (Categorized Layout)**: Results are organized into three distinct sections (Majors, Universities, Comparisons) so users can quickly locate the entity type they care about.
- **字段级阻断 (Field-Level Gating)**: Basic data (names, audit codes, starting salaries) is visible to all users. Deep analysis (ROI curves, admissions stats, prerequisite flows) is blurred/locked for unauthenticated users, triggering a login modal on click.
- **盲区诚实 (Honest Gap State)**: When no results match, the page declares the gap honestly and recommends benchmark alternatives — no fabricated data, no vote buttons.

---

## Core User Stories

- **As a student**, I can search for a major or university and immediately see categorized results with real salary data and audit codes, then click deeper analysis to discover I need to sign up.
- **As a parent**, I can search for a country + major combination and see credible outcome statistics with source citations, building trust before committing to registration.
- **As a counselor**, I can quickly find a specific university or major and navigate directly to the comparison workspace after logging in.

---

## Page Anatomy

### Route

- **Path**: `/search-results?q=<query>`
- **Query parameter**: `q` — the user's search query string
- **Browser history**: Navigation pushes to history; browser back returns to the landing page.
- **Implementation**: React Router `navigate()` with URL query parameter, not in-place component swapping.

### Page-Level Rules

- **Audience**: Both unauthenticated and authenticated users.
- **Language**: Full trilingual support (zh / zht / en) via the `language` prop.
- **Data source**: All results fetched from BFF API endpoint `/api/search?q=<query>`. No client-side static search data.
- **Graceful degradation**: If the BFF API is unavailable, display a clean error state: "搜索服务暂时不可用，请稍后重试" / "Search service is temporarily unavailable. Please try again later."
- **Data authenticity**: Every salary, ranking, or outcomes figure must carry a verification audit code. No fabricated or placeholder data.

---

### Section 1: Search Navigation Bar (搜索导航栏)

A fixed top navigation bar integrating search and auth controls.

| Element | Position | Behavior |
|---------|----------|----------|
| **Logo** | Left | "CollegeFlow" wordmark. Clicking navigates to landing page (`/`). |
| **Search Input** | Center | Compact search bar (not Hero-sized), pre-filled with current `q` parameter. Pressing Enter or clicking search icon navigates to `/search-results?q=<new_query>`. |
| **Language Switcher** | Right of search | Compact dropdown (zh / zht / en). |
| **Login Button** | Right | Secondary style. Navigates to `/login`. Hidden when authenticated. |
| **Register Button** | Right | Primary/CTA style. Navigates to `/register`. Hidden when authenticated. |
| **User Avatar** | Right | Shown when authenticated. Clicking opens a dropdown with profile link and logout. |

---

### Section 2: Results Area (搜索结果区)

Below the navigation bar, results are organized into three distinct sections, rendered in order:

1. **匹配专业 (Matched Majors)**
2. **匹配院校 (Matched Universities)**
3. **对比推荐 (Comparison Recommendations)**

Each section has:
- A localized section header with result count (e.g., "匹配专业 (3)")
- A horizontal card grid (responsive: 1-col mobile, 2-col tablet, 3-col desktop)
- A "查看更多" / "View More" link if more results exist (paginated via API)

If a section has zero results, it is **hidden** (not shown as an empty state).

---

#### 2.1 Major Cards (专业卡片)

Each card displays:

| Field | Visibility | Notes |
|-------|-----------|-------|
| Major name (zh + en) | Public | Localized primary display |
| Broad field / Detailed field | Public | Category breadcrumb |
| Starting salary median | Public | With audit code (e.g., `USN-2026-CS-001`) |
| Mature salary median | Public | With audit code |
| 40-Year ROI lifecycle curve | **Locked** (blurred) | Unauthenticated: blurred with lock overlay + "登录查看" CTA. Authenticated Free: blurred with "升级到 Pro" CTA. Pro+: fully visible. |
| Prerequisite course topology | **Locked** (blurred) | Same gating as ROI curve. |
| Admissions competitiveness | **Locked** (blurred) | Same gating as ROI curve. |

**Card Click Behavior**:
- **Unauthenticated**: Triggers login/register modal.
- **Authenticated**: Navigates to the Major Discovery dashboard view for that major.

---

#### 2.2 University Cards (院校卡片)

Each card displays:

| Field | Visibility | Notes |
|-------|-----------|-------|
| University name (zh + en) | Public | Localized primary display |
| Short name / Abbreviation | Public | e.g., "UMich" |
| Country + Location | Public | e.g., "United States · Ann Arbor, MI" |
| School/Division count | Public | Number of schools/divisions |
| Program/Major count | Public | Number of programs offered |
| Reach/Match/Safety badge | **Locked** (blurred) | Requires login + student context (GPA). Unauthenticated: blurred with lock overlay. |
| Admissions stats (acceptance rate, SAT range) | **Locked** (blurred) | Same gating as Reach/Match/Safety. |
| Placement index | **Locked** (blurred) | Same gating. |

**Card Click Behavior**:
- **Unauthenticated**: Triggers login/register modal.
- **Authenticated**: Navigates to the University Discovery dashboard view for that university.

---

#### 2.3 Comparison Recommendation Cards (对比推荐卡片)

Based on the matched results, 2-3 comparison recommendations are generated. Each card displays:

| Field | Visibility | Notes |
|-------|-----------|-------|
| Comparison title | Public | e.g., "计算机 vs 经济学 — 起薪对比" / "CS vs Economics — Starting Salary Comparison" |
| Comparison description | Public | Brief summary of what the comparison reveals |
| Comparison type badge | Public | "专业对比" / "院校对比" / "专业-院校匹配" |
| Interactive comparison view | **Locked** (blurred) | Unauthenticated: blurred with lock overlay + "登录使用对比" CTA. Authenticated: navigates to comparison workspace. |

**Recommendation Logic** (server-side):
- If ≥2 majors matched: recommend a comparison between the top 2 majors.
- If ≥2 universities matched: recommend a comparison between the top 2 universities.
- If ≥1 major + ≥1 university matched: recommend a major-university fit comparison.

**Card Click Behavior**:
- **Unauthenticated**: Triggers login/register modal.
- **Authenticated**: Navigates to the Program Comparison workspace with the recommended entities pre-loaded.

---

### Section 3: Gap State (盲区兜底)

When the search query returns zero results across all three categories, the page displays a Gap State instead of the results area.

The Gap State includes:

1. **诚实声明 (Honest Gap Declaration)**:
   - Headline: "暂未收录" / "Not Yet Recorded"
   - Body: "CollegeFlow 严格遵循数据真实性原则，所有数据均来自 IPEDS、CDS 等权威来源。当前未找到与「{query}」匹配的已验证记录。" / "CollegeFlow strictly follows data authenticity principles. No verified records matching '{query}' were found."
   - No fabricated data, no placeholder values.

2. **邻近标杆推荐 (Anchor Recommendation)**:
   - Display 2 benchmark university cards (UMich, Rice) with a label: "你可能感兴趣的标杆院校" / "Benchmark universities you may be interested in"
   - These cards use the same University Card format as Section 2.2.

3. **返回首页链接**:
   - "返回首页重新搜索" / "Return to homepage to search again"
   - Navigates to `/`.

> **Note**: The "Demand Poll Voting" feature from PRD-305 is removed. The gap state focuses on honest declaration and benchmark recommendations only.

---

### Section 4: Footer (页脚)

A minimal footer, consistent with the landing page:

| Element | Content |
|---------|---------|
| Copyright | "© 2026 CollegeFlow. All rights reserved." |
| Data Trust Declaration | "所有数据均来自权威来源，遵循 CollegeFlow 数据真实性原则" / "All data sourced from authoritative origins, following CollegeFlow Data Trust Principles" |

---

## API Contract

### Search Endpoint

```
GET /api/search?q=<query>&lang=<zh|zht|en>&page=<number>&limit=<number>
```

**Response**:

```json
{
  "query": "computer science",
  "majors": {
    "total": 5,
    "page": 1,
    "results": [
      {
        "id": "cs-001",
        "nameEn": "Computer Science",
        "nameZh": "计算机科学",
        "broadField": "Computer & Information Sciences",
        "detailedField": "Computer Science",
        "startingSalaryMedian": 78000,
        "matureSalaryMedian": 124000,
        "auditCode": "USN-2026-CS-001",
        "hasRoiCurve": true,
        "hasPrerequisites": true,
        "hasAdmissionsData": true
      }
    ]
  },
  "universities": {
    "total": 3,
    "page": 1,
    "results": [
      {
        "id": "umich-001",
        "nameEn": "University of Michigan-Ann Arbor",
        "nameZh": "密歇根大学安娜堡分校",
        "shortName": "UMich",
        "country": "United States",
        "location": "Ann Arbor, MI",
        "schoolCount": 19,
        "programCount": 250,
        "auditCode": "IPEDS-170976",
        "hasReachMatchSafety": true,
        "hasAdmissionsStats": true,
        "hasPlacementIndex": true
      }
    ]
  },
  "comparisons": {
    "total": 2,
    "results": [
      {
        "type": "major_vs_major",
        "titleEn": "CS vs Economics — Starting Salary",
        "titleZh": "计算机 vs 经济学 — 起薪对比",
        "descriptionEn": "Compare starting salaries and 40-year ROI between Computer Science and Economics.",
        "descriptionZh": "对比计算机科学与经济学的起薪和 40 年投资回报。",
        "entityIds": ["cs-001", "econ-001"]
      }
    ]
  }
}
```

**Locked fields** (ROI curves, admissions stats, prerequisites, Reach/Match/Safety) are **not included** in the API response for unauthenticated users. The `hasRoiCurve`, `hasAdmissionsStats`, etc. flags indicate that the data exists and should render a locked/blurred placeholder on the frontend.

**Authentication**: The API uses the existing Better Auth session. Unauthenticated requests receive public fields only. Authenticated Free users receive the same as unauthenticated. Pro/Counselor users receive all fields.

---

## Acceptance Criteria

### Navigation
- **Given** a user triggers a search on the landing page, **when** the search fires, **then** the browser navigates to `/search-results?q=<query>` with the query in the URL.
- **Given** a user is on the search results page, **when** they press the browser back button, **then** they return to the landing page.

### Search Bar
- **Given** the search results page loads, **when** the navigation bar renders, **then** a compact search input is displayed, pre-filled with the current query.
- **Given** the user modifies the search input and presses Enter, **when** the new search fires, **then** the page navigates to `/search-results?q=<new_query>`.

### Results Layout
- **Given** the API returns results, **when** the page renders, **then** results are displayed in three categorized sections: Majors, Universities, and Comparisons.
- **Given** a section has zero results, **when** the page renders, **then** that section is hidden.

### Field-Level Gating
- **Given** an unauthenticated user views a Major card, **when** they inspect the card, **then** major name, field, starting salary, and audit code are visible, while ROI curve and prerequisites are blurred with a lock overlay.
- **Given** an unauthenticated user clicks a locked field, **when** the click fires, **then** a login/register modal is triggered.
- **Given** an authenticated Free user views a Major card, **when** they inspect the card, **then** the same fields are visible/locked as for unauthenticated users.
- **Given** an authenticated Pro user views a Major card, **when** they inspect the card, **then** all fields including ROI curve and prerequisites are fully visible.

### Card Click
- **Given** an unauthenticated user clicks a Major or University card, **when** the click fires, **then** a login/register modal is triggered.
- **Given** an authenticated user clicks a Major card, **when** the click fires, **then** they are navigated to the Major Discovery dashboard view.
- **Given** an authenticated user clicks a University card, **when** the click fires, **then** they are navigated to the University Discovery dashboard view.

### Comparison Recommendations
- **Given** the API returns ≥2 majors, **when** the comparisons section renders, **then** a major-vs-major comparison is recommended.
- **Given** an authenticated user clicks a comparison card, **when** the click fires, **then** they are navigated to the Program Comparison workspace with the recommended entities pre-loaded.

### Gap State
- **Given** the API returns zero results for all categories, **when** the page renders, **then** the Gap State is displayed with an honest declaration, 2 benchmark university cards (UMich, Rice), and a "Return to homepage" link.
- **Given** the Gap State is displayed, **when** inspected, **then** no vote/poll button is present.

### API Unavailability
- **Given** the BFF API is unavailable, **when** the search results page loads, **then** a clean error state is displayed: "Search service is temporarily unavailable."

---

## Depends On

- Landing Page (PRD-307)
- Search Entry Experience (PRD-305) — search input interaction model
- Major Discovery (PRD-301)
- University Discovery (PRD-302)
- Program Comparison (PRD-303)
- Entitlement Model (PRD-500)
- Subscription and Paywall (PRD-501)
- Data Trust and Citation Principles (PRD-002)

## Does Not Own

- Search indexing, matching algorithm, or relevance ranking (backend responsibility)
- Authentication and session management
- Stripe billing and subscription enforcement
- Logged-in dashboard views (Major Discovery, University Discovery, Comparison)
- Data verification and audit code generation pipeline
