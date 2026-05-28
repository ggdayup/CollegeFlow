# PRD-31: Post-Login Personal Dashboard & Sidebar Navigation

**Date**: 2026-05-28
**Status**: Draft — Aligned via /grill-me
**Related PRDs**: PRD-300 (Onboarding), PRD-301 (Major Discovery), PRD-304 (Application Planning Workspace)
**Predecessor**: PRD-30 (Landing Page + Onboarding Overhaul)

---

## Context

PRD-30 将 onboarding 从 4 步简化为 2 步，并将 GPA/SAT/budget/weights 等 profile 数据收集移到了 workspace。这导致用户完成 onboarding 后进入的页面（当前的 "全美专业近况透视" dashboard）缺乏个性化——它展示的是全局市场信号，没有回答 "我应该关注什么" 的问题。

此外，当前所有角色共享同一个 dashboard 视图，随着顾问和学生功能各自扩展，统一路由下的条件渲染会膨胀到难以维护。

## Problem

1. 登录后的第一屏（4 个数据卡片 + 8 大行业门类 + 152 专业列表）面向已做决定的用户，对刚完成 onboarding 的用户没有引导价值
2. 所有角色共享同一个视图，无法体现角色差异化
3. 导航栏（2-tab segmented switcher）即将不够用

---

## Design Decisions (Resolved via /grill-me)

| Decision | Resolution |
|----------|-----------|
| 登录后第一屏 | Personal Dashboard（个性化看板），根据角色和 profile 数据动态变化 |
| 学生未填 profile | Guided Profile Setup（inline expand 表单）+ Interest Explorer |
| 学生已填 profile | Recommended Majors + Competitiveness Overview + Quick Actions + Market Signals |
| 角色路由结构 | **B**: 不同路由（`/dashboard/student`、`/dashboard/counselor`、`/dashboard/parent`）|
| 导航组件 | 统一升级为侧边栏导航（桌面端左侧，移动端底部 tab bar）|
| 现有 dashboard 内容 | **B**: 拆开融合——4 个数据卡片变为 Market Signals widget；8 大行业门类变为 Explore tab 的筛选器 |
| Market Insights 入口 | 保留为侧边栏 "探索" tab 下的一个子入口 |

---

## Route Structure

```
/                           → Landing page (PRD-30)
/onboarding                 → 2-step onboarding (PRD-30)
/login, /register           → Auth pages

/dashboard/student          → Student Personal Dashboard (default after onboarding)
/dashboard/student/explore  → Major + University browser (现有内容移到这里)
/dashboard/student/saved    → Saved majors/universities
/dashboard/student/compare  → Comparison tool
/dashboard/student/profile  → Profile editing (GPA/SAT/budget/weights)

/dashboard/counselor        → Counselor overview (students list, deadlines)
/dashboard/counselor/students → Student management
/dashboard/counselor/reports → Report generation

/dashboard/parent           → Parent overview (budget vs ROI, school rankings)
```

---

## Sidebar Navigation

### Desktop (Left sidebar, 240px wide)
```
┌──────────────────────┐
│ CollegeFlow          │  ← Brand
│                      │
│ 📊  概览             │  ← Active (default)
│ 🔍  探索             │  → /dashboard/*/explore
│ ⭐  收藏             │  → /dashboard/*/saved
│ 📈  对比             │  → /dashboard/*/compare
│ ⚙️  设置             │  → /settings
└──────────────────────┘
```

### Mobile (Bottom tab bar)
```
┌────────────────────────────────┐
│                                │
│                                │
│                                │
├────────────────────────────────┤
│ 📊  🔍  ⭐  📈  ⚙️            │
└────────────────────────────────┘
```

---

## Student Dashboard Layout (`/dashboard/student`)

```
┌─────────────────────────────────────────────┐
│ Market Signals (4 cards, compact)            │  ← 现有数据卡片缩小
│  • 薪资之冠: 石油工程 $146k                   │
│  • 收入预警: 学前教育 $51k                    │
│  • 扩招剧烈: CS +159%                        │
│  • 学位萎缩: 人文 -33%                        │
├─────────────────────────────────────────────┤
│ Recommended for You (3-5 majors)             │  ← 新：基于 profile 的推荐
│  • 每个专业: 名称 + 起薪 + 匹配理由 + CTA      │
├─────────────────────────────────────────────┤
│ Quick Actions                                │  ← 新：快捷操作
│  [搜索] [对比] [专业探索] [收藏]               │
├─────────────────────────────────────────────┤
│ Competitiveness Overview                     │  ← 新：学校分布/进展
│  • GPA 3.8 → Competitive at 12/50 schools    │
│  • 待补全: SAT Score, Budget                 │
└─────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: 基础设施
- 新增侧边栏组件 `src/components/Sidebar.tsx`
- 路由重构：`/` → 根据角色 redirect 到 `/dashboard/student|counselor|parent`
- 保留 `/*` fallback route 给 LandingPage（匿名用户）

### Phase 2: Student Personal Dashboard
- Market Signals widget（4 cards compact）
- Recommended Majors 组件（基于 profile 数据）
- Quick Actions 组件
- Competitiveness Overview 组件
- Profile completion prompt（GPA/SAT/budget/weights inline expand）

### Phase 3: Explore Tab
- 将现有 MajorsDirectory + UniversityNavigator 移到 `/dashboard/student/explore`
- 8 大行业门类作为筛选器
- 152 专业列表作为搜索结果

### Phase 4: 其他角色（后续）
- Counselor Dashboard
- Parent Dashboard

---

## File Inventory

| File | Action | Description |
|------|--------|-------------|
| `src/components/Sidebar.tsx` | **New** | Responsive sidebar (desktop left, mobile bottom tab) |
| `src/pages/StudentDashboardPage.tsx` | **New** | Student Personal Dashboard with Market Signals + Recommended + Quick Actions |
| `src/App.tsx` | Modify | Route restructuring, sidebar integration |
| `src/components/LandingPage.tsx` | No change | Already Google-simple (PRD-30) |
| `src/pages/OnboardingPage.tsx` | No change | Already simplified (PRD-30) |

---

## Verification

1. Anonymous → lands on Google-simple landing page → searches → sees results
2. New student → completes 2-step onboarding → redirected to `/dashboard/student` → sees Market Signals + Recommended + Quick Actions
3. Student with profile → sees personalized recommendations + competitiveness overview
4. Sidebar navigates between Overview, Explore, Saved, Compare
5. Responsive: sidebar collapses to bottom tab bar on mobile
