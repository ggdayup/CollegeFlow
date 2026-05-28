# UX Landing Page & Onboarding Overhaul — Implementation Plan

**Date**: 2026-05-28
**Status**: Draft — Pending Review
**Related PRDs**: PRD-300 (Onboarding), PRD-305 (Search Entry Experience)

---

## Context

PRD-300 and PRD-305 define a Google-simple landing page with a 100vh search header and progressive depth, plus a streamlined onboarding wizard. Current implementation gaps:

1. Landing page is a heavy marketing-style page (promo badge + massive H1 + gradient text + subtitle + search bar + 4 bento stat cards all in hero)
2. Anonymous users cannot search — every search triggers login modal
3. Onboarding is a 4-step wizard with excessive fields (GPA, SAT, budget, weights sliders)
4. No `/search-results` route exists — search scrolls to sections on landing page
5. Suggestion tags (PRD-305) not implemented

---

## Design Decisions (Resolved via /grill-me)

| Decision | Resolution |
|----------|-----------|
| Landing page 100vh content | Only: logo + search bar + suggestion tags. Everything else below fold |
| Anonymous search flow | Option A — show categorized results with basic data, lock deep/interactive tools on click |
| Search routing | `AppContent` 内 `searchResultsQuery` state 驱动视图切换，匿名用户和已登录用户共享同一 SearchResultsPage 组件 |
| Search data source | Client-side against existing `majorsData.ts` and `universitiesData.ts` (216 universities, 152 majors) |
| Gap state scope | Only genuinely unrecorded entities — Harvard/Stanford are already in data, should NOT trigger gap |
| Onboarding steps | Simplified from 4 to 2: Role → Competitiveness(with Skip) → Insight Card → Workspace |
| Progressive depth content | Bento showcase, insights, pricing — keep as-is below the fold |

---

## Implementation Details

### 1. Landing Page — Google-Simple 100vh Hero

**File**: `src/components/LandingPage.tsx`

#### Hero (above fold — min-h-screen centered)
- **Brand**: Centered "CollegeFlow" wordmark (clean, no gradient, no subtitle)
- **Search bar**: Prominent, wide input with search icon
- **Suggestion tags**: Interactive chips beneath search input
  - Countries: 美 | 加 | 英 | 澳
  - Majors: 计算机 | 经济
  - Universities: 哈佛 | 斯坦福
  - Salary Explorer: 我想看看这个专业赚多少钱

#### Tag Interaction Model
- **Empty/unfocused input** → click tag → instant navigate to `/search-results?q=<tag>`
- **Focused input** → click tag → append text with space (enables multi-criteria search like "哈佛 计算机")

#### Multilingual (existing `t()` helper)
- zh: "你想去哪个国家：美 | 加 | 英 | 澳 ；你想学什么专业：计算机 | 经济 ..."
- zht: traditional Chinese variant
- en: "Country: US | CA | UK | AU ; Major: CS | Economics ..."

#### Below fold (unchanged)
- Bento showcase (4-block grid: National Outlook, Benchmark Universities, ROI, Course Flow)
- Insights panel (Peak Earners, Caution Zones, Talent Shifts)
- Pricing table (Free / Pro / Counselor)

#### Key change
- **Remove `!isLoggedIn` check** from `handleSearchSubmit` — anonymous users can search freely

---

### 2. Search Results Page — New Route

**New file**: `src/pages/SearchResultsPage.tsx`
**New file**: `src/utils/searchSeed.ts` (client-side search utility)

#### View Switching（详见第 4 节）
- `AppContent` 添加 `searchResultsQuery` state
- LandingPage `onSearch` 设为 `setSearchResultsQuery(query)`
- 当 query 非 null 时，渲染 `<SearchResultsPage query={...} />` 替代 LandingPage + paywall 区块
- SearchResultsPage 提供 "Back to Home" 按钮，调用 `setSearchResultsQuery(null)` 返回首页

#### Search Implementation
```ts
interface SearchResult {
  type: 'major' | 'university' | 'comparison';
  id: string;
  name: string;
  description: string;
  salary?: string;      // Visible to anonymous
  auditCode?: string;   // Visible to anonymous
  locked: boolean;      // True for anonymous on deep features
}
```

- Fuzzy match against `nameEn`, `nameZh`, `shortNameEn`, `shortNameZh`
- Country keyword mapping (美→US, 加→CA, 英→UK, 澳→AU) filters `country` field
- Salary Explorer tag → navigate to major discovery with passion-vs-money framework

#### Result Anatomy (Google-like categorized cards)
- **匹配专业卡片 (Matched Majors)**: Direct link to major directory, starting salary, prerequisites
- **匹配名校卡片 (Matched Universities)**: Direct link to department details, admissions stats
- **匹配问答或对比 (Matched Comparisons)**: Links to ROI lifecycle curves

#### Entitlement Gating (Option A)
- **Anonymous users**: Basic salary numbers and audit codes visible. ROI curves and interactive tools blurred with premium lock overlay → click triggers auth/signup modal
- **Logged-in users**: Full access, no blur locks

#### Gap State
- When query matches nothing in seed data:
  1. Professional "data not yet recorded" message
  2. Suggest UMich/Rice as benchmark alternatives
  3. "Demand Vote" button (register interest for ingestion)

---

### 3. Onboarding — Simplified 2 Steps

**File**: `src/pages/OnboardingPage.tsx`

#### Before (4 steps)
1. Role selection (card grid)
2. Role-specific form (school name, graduation year, etc.)
3. Student profile (GPA, SAT, ACT, budget min/max, interest areas checkboxes, decision weight sliders)
4. Insight card → workspace

#### After (2 steps)
1. **Role selection** — keep as-is (card grid: Student, Teacher, Counselor, Parent, Other)
2. **Competitiveness form** — role-adaptive fields with prominent "Skip for Now"
   - Student: School Name (required), Graduation Year (optional)
   - Teacher: Subject/Discipline (required)
   - Counselor: Specialty/Area (required)
   - Parent: minimal — "That's all we need!" message
   - Other: optional free text
3. **Insight card** → workspace (based on role + basic inputs only)

#### Cut from onboarding (profile data moved to optional workspace setup)
- GPA, SAT, ACT score inputs
- Budget min/max
- Interest area checkboxes
- Decision weight sliders

**Option A 决策**：这些数据**不删除**，保留在已有的 `src/pages/StudentProfilePage.tsx` 中。用户完成 2 步 onboarding 进入 workspace 后，可在 StudentProfilePage 中可选补全。Insight card 的推荐准确度会在补全后提升，但不阻塞首次使用。

#### Insight card simplification
- 基于 role + basic inputs 生成推荐（不再依赖 GPA/SAT 计算 competitive school count）
- 增加 CTA：「完善学术档案以获得更精准推荐」→ 跳转 StudentProfilePage
- 基础 CTA：探索推荐的专业/学校 → 跳转 search results 或相应 feature 页面

---

### 4. Route / State Changes

**File**: `src/App.tsx`

当前架构: `AppContent` 内部通过 `!isLoggedIn` 分支渲染 LandingPage，`onSearch` 回调是 `setSearchQuery`（本地 state），不是路由跳转。

**方案**: 在 `AppContent` 中添加 `searchQuery` state 驱动的视图切换:
```ts
const [searchResultsQuery, setSearchResultsQuery] = useState<string | null>(null);
```
- LandingPage 的 `onSearch` 改为: `setSearchResultsQuery(query)` → 当 `searchResultsQuery` 非 null 时，渲染 `<SearchResultsPage query={searchResultsQuery} />` 替代 LandingPage
- 保留现有 routes 不变
- 搜索结果的返回/退出: 在 SearchResultsPage 中提供 "Back to Home" 按钮，调用 `setSearchResultsQuery(null)`

**为什么不用 `<Route>`**: 现有匿名体验在 `AppContent` 内是条件渲染而非路由，新增 route 需要重构整个条件分支结构，风险更高。用 state 驱动的视图切换更简单、更安全。

---

## File Inventory

| File | Action | Description |
|------|--------|-------------|
| `src/components/LandingPage.tsx` | Rewrite hero, keep below-fold content | Replace heavy hero with Google-simple layout |
| `src/pages/OnboardingPage.tsx` | Simplify steps | Remove step 3 (student profile), move to workspace |
| `src/pages/SearchResultsPage.tsx` | **New** | Categorized search results with entitlement gating |
| `src/utils/searchSeed.ts` | **New** | Client-side search against seed data |
| `src/App.tsx` | 添加 state + 视图切换 | 添加 `searchResultsQuery` state，条件渲染 SearchResultsPage，移除现有 paywall 区块 |

---

## Review: Risks & Mitigations

| # | Risk | Mitigation |
|---|------|------------|
| R1 | `AppContent` 用 `!isLoggedIn` 条件渲染而非路由，新增 search results 页面不能直接加 `<Route>` | 用 `searchResultsQuery` state 驱动视图切换，保持现有条件渲染结构 |
| R2 | 匿名用户搜索后看到的 premium lock 需要替代现有的 paywall 区块（App.tsx line 292-313） | 移除现有 paywall 区块，SearchResultsPage 自带 entitlement gating |
| R3 | Onboarding 砍掉 GPA/SAT 后，insight card 无法计算 "competitive at X of Y schools" | Insight card 改为基于 role + country 的静态推荐，CTA 引导补全档案 |
| R4 | `needsOnboarding` 守卫（App.tsx line 159）检查 `userType` + role fields，2 步 onboarding 完成后 `hasRoleFields` 应为 true（Student 有 schoolName 即满足） | 确认 2 步 onboarding 提交后 `schoolName` 字段已写入，守卫自动通过 |
| R5 | 客户端搜索数据文件体积（majorsData 33KB + universitiesData 89KB） | 122KB 纯文本数据对现代浏览器可忽略，无需优化 |
| R6 | 多词搜索（如 "MIT CS"）需要 AND 匹配 | `searchSeed.ts` 按空格拆分 query 为 tokens，每个 token 匹配任一字段 |

---

## Verification Plan

### Anonymous Flow
1. Open incognito window
2. See Google-simple landing page (logo + search + tags)
3. Type "CS" → see search results with basic salary data
4. Click "View 40-Year ROI Curve" → see auth/signup modal

### Logged-in Flow
1. Login as existing user
2. Search "Harvard CS" → see full results with all tools unlocked
3. Search "University of Xyz" (unrecorded) → see gap state + suggestions + demand vote

### Onboarding Flow
1. New user signup → land on `/onboarding`
2. Step 1: Select role → Step 2: Fill competitiveness (or Skip) → Insight card → Workspace
3. Total friction < 30 seconds with Skip

### Suggestion Tags
1. Click "计算机" with empty input → instant search → results page
2. Type "哈佛" in search bar, then click "计算机" → input becomes "哈佛 计算机"
