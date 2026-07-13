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

/dashboard/counselor                 → Counselor Overview Bento Dashboard (Students list, deadlines, activity feed)
/dashboard/counselor/student/:id     → Counselor Student Deep-Dive Workspace (Profile, notes notepad, comparison inspector)
/dashboard/counselor/tools           → Counselor Toolkit (Admissions Report Center + Matcher Sandbox)

/dashboard/parent           → Parent overview (budget vs ROI, school rankings)
```

---

## Sidebar Navigation

### Desktop (Left sidebar, 240px wide)

#### Student View
```
┌──────────────────────┐
│ CollegeFlow          │  ← Brand
│                      │
│ 📊  概览             │  ← Active (default)
│ 🔍  探索             │  → /dashboard/student/explore
│ ⭐  收藏             │  → /dashboard/student/saved
│ 📈  对比             │  → /dashboard/student/compare
│ ⚙️  设置             │  → /settings
└──────────────────────┘
```

#### Counselor View
```
┌──────────────────────┐
│ CollegeFlow          │  ← Brand
│                      │
│ 👥  学生管理         │  ← Active (default, /dashboard/counselor)
│ 🛠️  工具             │  → /dashboard/counselor/tools
│ ⚙️  设置             │  → /settings
└──────────────────────┘
```

### Mobile (Bottom tab bar)
底栏 Tab 会根据登录的 `userType` 动态调整渲染的 3-4 个快捷按钮。

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

## Counselor Dashboard Layout (`/dashboard/counselor`)

采用**三栏 Bento Grid 智能工作台**布局，以最高的信息密度辅助顾问追踪学生进度与申请生命周期。

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Quick Stats (KPI Ribbon)                                                              │
│  • Total Invited: 8/50 seats  • Accepted: 6  • Profiles Complete: 4                    │
├───────────────────────────────────────────────────────┬────────────────────────────────┤
│  Main Workspace - Students List                       │  Deadlines & Activity Sidebar  │
│  • Search bar + [Invite Student] Form                 │  ⏰ Upcoming Deadlines         │
│  ┌──────────────────────────────────────────────────┐ │   • Student A: UC Berkeley     │
│  │ Email / Name    GPA/SAT    Last Session  Actions │ │     (RD, 01-01) - 45 Days left │
│  ├──────────────────────────────────────────────────┤ │   • Student B: Stanford        │
│  │ a@school.edu    3.9 / 1520 2 hours ago   [View]  │ │     (EA, 11-01) - Overdue      │
│  │ b@school.edu    3.55 / --  5 days ago    [View]  │ │                                │
│  │ c@school.edu    -- / --    Pending Invite[View]  │ │ ⚡ Live Activity Feed          │
│  └──────────────────────────────────────────────────┘ │   • a@school.edu ran a CS vs   │
│                                                       │     EE comparison (2h ago)     │
│                                                       │   • b@school.edu added UIUC    │
│                                                       │     to saved list (1d ago)     │
└───────────────────────────────────────────────────────┴────────────────────────────────┘
```

### 1. 顶部 KPI 与名额指示器 (KPI Ribbon)
*   继承已有的 `StudentLimitIndicator` 组件，展示已购席位利用率（默认最大 50 人，超额触发 `PaywallModal`）。

### 2. 左侧主体：智能学生看板 (Students List)
*   **搜索与快速邀请**：在列表上方集成“邀请学生”表单，支持直接发起 `POST /api/counselor/invite` 生成激活链接与邮件通知。
*   **多维度进度数据表**：
    *   **学术概览**：GPA 与 SAT/ACT 分数，若为空则显示“待补全”。
    *   **最新活跃**：展示该学生最近一次进行 Comparison 对比的模块与具体时间戳，方便顾问针对性回访。
    *   **快捷操作**：一键“调阅详情 (View Progress)”、“重新发送邀请”。

### 3. 右侧副栏：申请时间轴与活动流 (Deadlines & Activity)
*   **Deadlines 看板**：关联学生已收藏的大学的官方截止日期（EA/ED/RD），以倒计时天数形式警告顾问即将到来的关键节点。
*   **实时活动流**：通过轮询或更新记录展示所管辖学生的系统操作记录（收藏动作、对比记录），实现数据的实时透视。

---

## Counselor Student Workspace Layout (`/dashboard/counselor/student/:workspaceId`)

顾问对特定单名学生的“学术协同舱”，通过深度集成偏好画像与实时记事本，形成完整的指导闭环。

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Header: [Back to Dashboard]  Student: a@school.edu (Active)     [Generate PDF Report]   │
├──────────────────────────────┬────────────────────────┬────────────────────────────────┤
│ 👤 Academic & Priorities      │ 📊 Comparison Sessions │ 📝 Counselor Notebook          │
│  • GPA: 3.9  SAT: 1520       │  • Computer Science vs │  ┌──────────────────────────┐  │
│  • Budget: $30k - $60k       │    Electrical Eng      │  │ 2026-05-28 16:50          │  │
│  • Priorities Radar Chart:   │    [View CS vs EE Tree]│  │ 学生在考虑 Berkeley 和     │  │
│      💼 Career/Salary: 40%   │  • CMU vs UC Berkeley  │  │ CMU。建议主攻CMU，因为其     │  │
│      🏆 Prestige: 30%        │    [View CMU vs UCB]   │  │ 匹配度打分在Fit上更高。    │  │
│      💰 Affordability: 10%   │                        │  └──────────────────────────┘  │
│      🎯 Personal Fit: 20%    │ ⭐ Saved Items         │  • Auto-saves in real-time     │
│                              │  • UC Berkeley (Univ)  │                                │
│                              │  • Software Eng (Major)│                                │
└──────────────────────────────┴────────────────────────┴────────────────────────────────┘
```

### 1. 左侧：标化画像与决策权重 (Academic & Priorities)
*   **可视化权重图**：使用雷达图或弧形进度条，直观展示学生设置的 `salary` / `prestige` / `cost` / `fit` 的百分比分配。
*   **收藏清单**：只读读取学生收藏的专业和院校，了解直观偏好。

### 2. 中间：对比会话与决策树监视器 (Comparison Sessions)
*   **对比会话提取**：列出该 Workspace 下所有的 `ComparisonSession`。
*   **对比树调阅**：顾问点击某个会话时，直接在当前页面浮窗或跳转加载对应的 [ComparisonPage](file:///Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/src/pages/ComparisonPage.tsx) 视图，顾问可以完全查看该学生录入的对比院校、各项指标评分和最终系统推荐等级，进行精细化“把脉”。

### 3. 右侧：实时协同记事本 (Counselor Notepad)
*   **无感保存输入区**：顾问的指导记录本，直接绑定后端 `POST /api/counselor/note`。在输入文本框失焦 (onBlur) 时，自动静默发起请求保存，并在保存时展示“Saved”绿色标记。
*   **一键生成 PDF 报告**：右上角提供“生成选校对比报告”按钮，传入当前激活的 `sessionId`，调用 `/api/report/generate`，生成包含该学生个性化权重分析、决策对比图谱、以及顾问指导笔记的精美 PDF 报告。

---

## Counselor Tools Page Layout (`/dashboard/counselor/tools`)

```
┌───────────────────────────────────────────────────────┬────────────────────────────────┐
│ 📄 PDF Report Center                                  │ 🛠️ Matcher Sandbox (Playground) │
│  • [Generate New PDF Report] Form                     │  • Enter GPA / SAT / Budget    │
│  ┌──────────────────────────────────────────────────┐ │  • Set Priorities (Salary,     │
│  │ Student    Session Name    Date    Actions       │ │    Prestige, Cost, Fit Sliders)│
│  ├──────────────────────────────────────────────────┤ │                                │
│  │ a@sch.edu  CS vs EE        05-28   [Download]    │ │  ⚡ Matches Result             │
│  │ b@sch.edu  CMU vs UCB      05-25   [Download]    │ │   • Reach: CMU, Stanford       │
│  │                                                  │ │   • Match: UIUC, UW            │
│  └──────────────────────────────────────────────────┘ │   • Safety: SJSU               │
└───────────────────────────────────────────────────────┴────────────────────────────────┘
```

### 1. 左侧：PDF 报告中心 (PDF Report Center)
*   **历史报告列表**：调用 `/api/report/list` 获取该顾问生成的所有历史 PDF，支持快速下载。
*   **快捷发起表单**：下拉选择“管辖下的学生”和“该学生已有的对比 Session”，一键合成最新的 PDF。

### 2. 右侧：模拟选校沙盒 (Matcher Playground)
*   **推演星图**：顾问的“幕后决策推演游乐场”。允许顾问输入假设性成绩和偏好权重，实时通过底层 IPEDS/Scorecard 匹配算法，计算并分类展现各高校的申请推荐级别（冲刺、匹配、保底），支持一键“推送此选校建议至学生 Workspace”。

---

## Implementation Phases

### Phase 1: 基础设施与路由调整
- 新增侧边栏组件 `src/components/Sidebar.tsx`（已部分实现，需补充顾问/学生动态渲染）。
- 重构 `src/App.tsx` 中的 `LoggedInDashboard`，使其支持通用角色 Layout。当 `user.userType === 'COUNSELOR'` 时，使用顾问 Sidebar，并注册 `/dashboard/counselor/*` 子路由。
- 修复顾问登录后被强制渲染为学生个人主页的缺陷。

### Phase 2: Student Personal Dashboard
- 实现 Market Signals widget (4 cards compact)
- 实现 Recommended Majors 组件
- 实现 Quick Actions 与 Competitiveness Overview
- 支持 Profile 补全弹窗与扩展表单

### Phase 3: Explore Tab
- 将原有的 MajorsDirectory 和 UniversityNavigator 封装到 `/dashboard/student/explore` 路由下。

### Phase 4: Counselor Workspace & Tools (当前核心)
- **顾问概览主页 (`src/pages/CounselorDashboardPage.tsx`)**：
  - 重构页面使其适配 Sidebar 结构（去除独立 Header）。
  - 实现三栏 Bento 布局，接入 Deadlines（学生目标院校截止日）和 Activity Feed（最新对比与收藏动态）。
- **学生详情协同舱 (`src/pages/CounselorStudentDetailPage.tsx` - 新增)**：
  - 实现 Academic Image 画像面板 + 权重可视化组件。
  - 对接 `GET /api/counselor/notes/:workspaceId` 和 `POST /api/counselor/note` 实现失焦自动保存的实时记事本。
  - 调阅学生的 `ComparisonSession` 并加载对比矩阵。
- **顾问工具箱 (`src/pages/CounselorToolsPage.tsx` - 新增)**：
  - 实现 PDF 生成历史列表与一键合成表单。
  - 实现模拟选校沙盒 Playground。

### Phase 5: Parent Dashboard (后续)
- 适配家长端的专属 ROI/学费分析概览。

---

## File Inventory

| File | Action | Description |
|------|--------|-------------|
| `src/components/Sidebar.tsx` | Modify | 确保正确获取并根据 `user.userType` 动态调整菜单项 |
| `src/pages/CounselorDashboardPage.tsx` | **Modify** | 彻底重构为 Bento 布局，移入 `LoggedInDashboard` shell，集成 Deadlines 和活动流 |
| `src/pages/CounselorStudentDetailPage.tsx` | **New** | 顾问代入特定学生 Workspace 进行协同笔记、决策调阅和 PDF 生成的页面 |
| `src/pages/CounselorToolsPage.tsx` | **New** | 包含 PDF 生成下载历史和“模拟选校沙盒 (Matcher Playground)”的工具集页面 |
| `src/App.tsx` | **Modify** | 将所有顾问子路由融入 `LoggedInDashboard` 的 `Sidebar` 统一外壳，完成页面注册 |

---

## Verification

1. **匿名用户**：访问 `/` 进入简洁的 Landing 搜索页。
2. **学生账号登录**：登录后重定向到 `/dashboard/student`，左侧侧边栏展示学生项（概览、探索、收藏、对比），右侧为个性化推荐与对比入口。
3. **顾问账号登录**：登录后重定向到 `/dashboard/counselor`，左侧侧边栏展示顾问项（学生管理、工具），右侧为 3-column Bento 板块：Stats KPI、学生管理大表、Deadlines & 活动流栏。
4. **顾问查看特定学生**：点击 "View Progress →" 跳转到 `/dashboard/counselor/student/:workspaceId`，能够查看该生画像、调阅对比树、在右侧实时书写笔记且网络失焦时静默保存，并能一键合成下载 PDF。
5. **顾问进入工具箱**：点击“工具”菜单跳转 `/dashboard/counselor/tools`，可在右侧通过 sliders 随意模拟标化推演 Reach/Match/Safety 结果，在左侧查询及合成 PDF。
