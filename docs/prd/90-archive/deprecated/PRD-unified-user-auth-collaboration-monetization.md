# PRD-001: Unified Decision Space (Decision Profile), Collaborative Workspaces, and Bi-Regional Monetization Platform

## 1. 核心商业定位与以“顾问”为核心的增长闭环 (Core Value & B2B2C Loop)

在审视 `College Major` 引擎的商业化变现时，我们确立了核心的产品战略共识：**这个平台绝非单纯的“用户管理与登录系统”，而是一个围绕全球大学、专业和 ROI 数据进行选校决策的 SaaS 平台。**

我们明确做出两个关键的产品研判：
1.  **付费顾问（Counselor PRO）是平台的第一增长及变现引擎**：学生个人用户通常面临“低频、单次决策”的痛点，其付费倾向和生命周期价值（LTV）有限；而专业顾问需要高频、反复地向多个学生交付选校方案，具备极强的付费能力和转介绍杠杆。因此，系统一切设计应围绕 **“让顾问愿意每天打开本系统管理交付”** 这一核心诉求展开。
2.  **产品主轴是“顾问交付系统”**：我们必须将功能重心从底层的“用户管理与认证系统”中解放出来，将开发资源高度聚焦在帮助升学顾问标准化交付、提升家长信任、扩大客户传播的 SaaS 工具链上。
3.  **MVP 交付的北极星指标**：**“让一个付费顾问可以在 30 分钟内完成一个学生的第一份阶段性选校评估报告。”** 为了达成该指标，我们必须把功能流程紧密收缩在合理的时间预算内：

| 步骤/阶段 | 理想耗时 | 核心产品提效机制 |
| :--- | ---: | :--- |
| **创建学生 Workspace** | 1 分钟 | 仅需学生姓名与基本标签，绝不强行阻塞在初始配置页。 |
| **收集/录入基础背景** | 5 分钟 | 支持极速滑块与区间选择，无需繁琐冗长的字段录入。 |
| **生成初步专业建议** | 5 分钟 | 系统智能推荐 Top 专业，顾问仅需进行一键筛选与微调。 |
| **生成初步大学清单** | 8 分钟 | 系统预填 Reach / Target / Safety 备选清单，支持一键拖拽。 |
| **添加 Counselor Rationale** | 6 分钟 | 提供三种类型的**智能草稿 (Draft Assist)** 辅助一键导入改写。 |
| **预览并补齐报告** | 3 分钟 | **Report Preview Mode** 与 **Readiness Score** 一键直达缺失点。 |
| **生成 Print Report** | 2 分钟 | 网页版 6 页报告一键响应式渲染排版，无需排版纠结。 |

```
[Onboarding 三角色极速分流] (三分钟内呈现首个交付/分析 Aha! Moment)
↓
[Decision Engine] (学术背景、RIASEC、财务预算云端固化，反馈完备度与可信度)
↓
[Counselor Dashboard] (今日任务工作台，帮助顾问瞬间决定今天处理谁，带一键 action)
↓
[Admission Workspace] (CRM 四阶段向导式工作流：Collect -> Strategy -> Family Review -> Deliver)
↓
[Parent Decision Page] (一页式判断：Cost + ROI + Risk + 顾问理由 + 决策动作记录)
↓
[Print Report Page] (漂亮的网页端 6 页标准阶段性交付报告)
↓
[Shareable Read-only Link] (无 PII 匿名报告分享，拉动新家庭病毒传播)
```

---

## 2. 动态决策引擎与 Onboarding 最短成功路径 (First-Mile & Decision Engine)

### 2.1 三角色 3 分钟最短成功路径 (First Success Onboarding)

新用户（无论何种登录渠道）注册完毕后，系统将通过角色自选分流机制，让三类不同身份的用户在 3 分钟内极速体验产品的核心商业价值（First Success Onboarding）：

*   **Student Path (学生极速探索路径)**
    1.  *操作流*：选择身份为学生 $\rightarrow$ 自选/拖拽 3 个学术或职业兴趣关键词 $\rightarrow$ 拖动 GPA 到大致区间 $\rightarrow$ 选择目标国家/地区。
    2.  *核心展示*：系统立即呈现 5 个高匹配专业方向与 3 个典型推荐高校，同时展现“匹配可信度”计算结果，并提供完整 Holland/RIASEC 测评引导按钮（CTA）。
    *   *原则*：不在第一步强制要求耗时冗长的 Holland / RIASEC 完整评测，最大程度降低流失率。
*   **Parent Path (家长极速测算路径)**
    1.  *操作流*：选择身份为家长 $\rightarrow$ 输入家庭年度学费与生活费预算上限 $\rightarrow$ 拖动孩子大致学术水平 $\rightarrow$ 选择目标国家/地区。
    2.  *核心展示*：系统立即生成一屏动态 Cost/ROI 测算沙盘：展示该预算对家庭的真实负债压力级别（High / Medium / Low）、预算范围内可负担的高校比例、推荐高 ROI 专业和高风险选项警告。
    *   *CTA引导*：邀请孩子共享 Decision Profile，或输入顾问专属 Workspace 密钥直接加入协作。
*   **Counselor Path (顾问极速交付体验)**
    1.  *操作流*：选择身份为顾问 $\rightarrow$ 输入顾问真实姓名和机构名称。
    2.  *核心展示*：系统跳过复杂的注册信息，立即渲染并呈现一份高度预填充的 **Sample Print Report Preview（标准交付报告样例预览）**。
    *   *Aha! Moment*：让顾问一眼动作系统的交付排版能力与专业机构品牌包装深度，触发其 60 秒创建首个学生 Admission Workspace 的渴望。

### 2.2 决策引擎核心计算规则与变动约束 (Decision Profile Metrics)

作为云端画像数据仓（Decision Profile），系统引入严格的计算与提示校验逻辑以维护客观数据权威度：

1.  **完备度评分机制 (Profile Completeness Score)**
    系统根据学术背景（GPA、课程体系、标化）、RIASEC 测评结果以及家庭财务参数（年度预算、负债容忍度）的字段完整程度，进行实时百分比计算，并动态提示提升推荐准确性所需的核心缺失点。
2.  **推荐可信度分级 (Recommendation Confidence)**
    系统对所出具的大学/专业推荐报告贴附明确的可信度评级：
    *   *High Confidence*：学术数据、RIASEC 测评结果、家庭财务偏好全部完整。
    *   *Medium Confidence*：缺少财务预算或部分标化科目。
    *   *Low Confidence*：缺少学术成绩背景或没有任何兴趣评测。
3.  **客观数据变动控制律 (Change-Notification Guardrails)**
    为维护平台的权威度与顾问的最终交付信用，**严禁引入伪实时的变动通知**（如为了强行拉升活跃而制造的高频数据假更新）。系统仅允许以下两类事件触发“上次登录以来的新变化（What Changed Since Last Time）”提示：
    *   *用户数据主动更新*：用户主动修改了 GPA/标化导致学校分类门槛跳变、调整预算导致部分学校触发风险警告、或补做 RIASEC 导致专业推荐库扩容。
    *   *权威官方数据同步*：IPEDS 学费数据更替、劳工部最新毕业生薪资统计发布、或官方录取难度区间批次更新。
4.  **决策时间线审计日志 (Decision Timeline)**
    系统自动捕获并记录该 Workspace 下的高价值决策事件（如：学生完成 Holland 测评、顾问划档、顾问发布建议版本、家长 Approve 某学校、顾问导出 Print 报告），用于向家长及顾问双方证明服务进展与决策留痕，禁止记录无价值的低频操作。

---

## 3. 顾问决策 CRM 架构 (Counselor CRM & Workspace)

### 3.1 顾问全局首页：今日工作台 (Counselor Dashboard)

顾问是系统的高频付费用户，MVP 首页设计为**任务驱动的动态工作台**，具有直接的 **Action Button**。今日工作台的核心特性在于**由家长决策与系统完备度“双向反向驱动”**，帮助顾问瞬间决定今天应该处理什么：

```
[Today’s Priorities] (今天最需要处理的 3–5 件事)
  ├── 1. 家长决策警报：学生 A 家长因 Cost 拒绝了 NYU  ——> [Suggest Alternatives (推荐替换学校)]
  ├── 2. 家长提问通知：学生 B 家长就 UCSD ROI 留言咨询 ——> [Reply (答复留言)]
  ├── 3. 交付就绪提醒：学生 C 决策就绪度已达 100%       ——> [Generate Final Report (生成并导出最终报告)]
  └── 4. 选校分类 override 提醒：学生 D 有 3 个推荐学校未进行 Reach 分类 ——> [Classify Schools (一键划档)]

[Students Needing Attention] (亮黄灯学生 - 数据不完备催填)
  ├── 学生 D 缺 GPA/目标地区数据 (影响推荐精度)      ——> [Smart Reminder: Student (一键催填学生资料)]
  └── 学生 E 家长未配置学费预算 (影响 ROI 测算)      ——> [Smart Reminder: Parent (一键催填家长预算)]

[Workspace Quota Panel] (席位额度：Active x 个 / 已归档 y 个 / 剩余可用席位 z 个 ——> [Upgrade / Archive])
```
*   **一键智能催填 (Smart Reminder)**：顾问点击后，系统根据缺失数据点自动生成格式化短信/邮件模板（如：*“Hi [Name], 请花 2 分钟进入系统补充您的家庭年度学费预算，以便为您测算最精准的 Net Cost 与 ROI。—— [顾问姓名]”*），极具实用价值。

---

### 3.2 升学决策 CRM：学生专属 "Admission Workspace" 阶段交付流

每一个看板物理上对应一个学生专属的 **Admission Workspace（升学决策 CRM）**。它将顾问日常低效零散的 Excel、微信和 Notion 集中化，引导顾问沿着标准服务阶段向下推进：

```
阶段 1: Collect Background ──> 阶段 2: Build Strategy ──> 阶段 3: Review with Family ──> 阶段 4: Deliver Report
  (GPA/RIASEC/预算录入)          (Reach/Target/Safety)        (一页式家长决策确认卡)        (Print网页版 6页报告)
```

#### 3.2.1 引导式流程 Progress Bar 与完成门槛限制 (Hard Block 与 Soft Warning)

我们在 Workspace 顶部增加全局 **Progress Bar (进度条)**。为平衡“业务规范性”与“现实灵活性”，门槛限制明确划分为硬性阻塞与软性提示：

1.  **引导式解锁门槛 (Workflow Progress Stages)**：
    *   **阶段 1: Collect Background (背景收集阶段)**
        *   *解锁门槛（满足方可进入下一阶段）*：GPA 已填写、至少 1 个目标地偏好、至少 1 个家庭预算参数、学生已接受 Workspace 激活邀请。
    *   **阶段 2: Build Strategy (策略制定阶段)**
        *   *解锁门槛*：至少圈定 3 个专业短名单、至少圈定 6 所大学目标、Reach/Target/Safety 三档分类中至少各有 1 个目标项、且每个项都包含顾问撰写的 **Counselor Rationale (顾问推荐理由)**。
    *   **阶段 3: Review with Family (家庭评审阶段)**
        *   *解锁门槛*：家长已登录并查看 Parent View 决策确认页、家长对关键学校做出了 `Approve / Needs Discussion / Rejected` 操作、预算风险已确认。
    *   **阶段 4: Deliver Report (报告交付阶段)**
        *   *解锁门槛*：**Report Readiness Score (报告就绪度)** 达到 100%（例如：*“报告就绪度 72%，补齐 2 处选校推荐理由即可解锁导出”*）、顾问正式建议发布、下一步行动计划指派完毕。

2.  **硬性阻塞 (Hard Block - 安全与核心权益)**：
    *   *学生未接受 Workspace 邀请*：系统强制隐藏学生私密学术 Profile 与背景。
    *   *家长未接受 Handshake 邀请*：禁止向该家庭发送 Parent View 决策网页。
    *   *顾问非 PRO 账号*：锁定导出 PDF/网页 Print 报告及无 PII 匿名分享功能。
    *   *未发布最终顾问建议综述*：不允许锁定发布 Final 报告。

3.  **软性提示 (Soft Warning - 资料完整度)**：
    *   *缺少 RIASEC 评测*、*缺失家庭预算*、*选校 shortlist 少于 6 所*、*缺失部分专业/大学的 Rationale 推荐语*、*Action Checklist 为空*。
    *   *控制机制*：触发软性警告（如：*“此报告缺失 3 项推荐背景字段，您仍可预览或生成带 [Incomplete] 水印的草稿报告，但建议补齐以达到最佳交付效果。”*），确保顾问在家长催促等现实场景下不被硬性卡死。

#### 3.2.2 核心机制：Counselor Rationale 强制性与“半自动化智能草稿”

本平台的核心壁垒是**顾问用自己的专业判断去解释数据**，因此，系统在以下关键节点强制要求填写 **Counselor Rationale** 以确保交付报告的含金量：

| 对象/触发场景 | Rationale 强制性 | 校验与控制机制 |
| :--- | :--- | :--- |
| **推荐专业 (Major Recommendation)** | **必须 (Required)** | 专业加入 Shortlist 时必须填写理由，否则无法保存。 |
| **推荐大学 (University Recommendation)** | **必须 (Required)** | 大学加入 Shortlist 时必须填写选校理由，否则无法保存。 |
| **Reach / Target / Safety 划档变化** | **建议 (Recommended)** | 顾问手动 override 系统推荐难度分类时，提示填写变动原因。 |
| **高风险学校保留 (High-risk retained)** | **必须 (Required)** | 保留学费超标或 ROI 极低的学校时，必须写明专业保留原因。 |
| **家长待确认项 (Parent review items)** | **必须 (Required)** | 标记为“需要家长重点确认”的决策项，必须说明顾问判断。 |
| **交付报告最终结论 (Final Recommendation)** | **必须 (Required)** | 报告发布（Deliver Report 阶段）必须有最终顾问建议综述。 |

为守住 30 分钟交付目标，系统提供 **Rationale Draft Assist (智能理由草稿)**：
1.  **三种细分理由类型 (Rationale Categories)**：
    *   **Fit Rationale (匹配理由)**：用于专业与大学推荐。结合学生的 GPA、RIASEC 测评匹配度和学术背景阐述适合原因。
    *   **Risk Rationale (风险理由)**：用于高学费、低 ROI、录取难度偏高或先修课程不匹配。阐述为什么该学校/专业存在财务或录取上的中高风险。
    *   **Decision Rationale (最终建议理由)**：用于 Parent View 决策引导、Reach/Target/Safety override 手动调整及最终报告综述。
2.  **智能草稿助手 (Rationale Draft Assist)**：
    *   当顾问将大学/专业拖入 Shortlist 时，系统根据学生 profile 自动生成一段 100-150 字的结构化理由草稿（例如：*“该生 Investigative 维度较高，且数学先修课优秀，与 Cognitive Science 极匹配。该校虽 ROI 卓越，但年度 Cost 偏高，建议作为条件性 Reach 目标。”*）。
    *   顾问可执行一键导入 `[Use Draft]`、一键重写 `[Regenerate]`、极速改写 `[Edit]`，或另存为常用模板 `[Save as Template]`。**系统提供专业底稿，顾问把控最终话语权**。

#### 3.2.3 核心机制：Report Readiness Score & Report Preview Mode

为解决顾问“无资料时无法感知报告品质”的痛点，并辅助督促资料收集：
1.  **Report Preview Mode (报告预览模式)**：即使学生资料未填完，顾问亦可一键进入预览页，以高保真网页形式查看报告整体版面。未填字段会自动用带色彩提示的占位符表示（如：*“[未填写: 缺少 RIASEC 测评结果]”*、*“[未填写: 缺少 2 所高校的顾问推荐语]”*），极具交互引导感。
2.  **Report Readiness Score (报告就绪度评分)**：显式计算报告完备度（如：72%）。并在预览页面侧边栏列出**缺失行动清单 (Missing Actions Checklist)**，支持点击直接定位到具体的输入表单，实现极速补齐。
3.  **就绪度划分 4 种交付状态 (Delivery States)**：
    *   `Draft Preview` (内部预览)：可以预览，但缺失关键数据，系统内标有未完备色块，仅供顾问内部查看。
    *   `Family Review Ready` (家庭评审就绪)：关键信息完整，Parent View 页面解锁，家长可登录进行确认和 Approve 动作。
    *   `Print Ready` (可生成交付)：满足 100% 完备门槛，网页版 Print 报告一键响应式渲染解锁。
    *   `Final Published` (正式发布)：正式发布后锁定当前版本，生成 Published Version (v1/v2...) 并记录历史。

#### 3.2.4 极简家长决策卡 (University Decision Cards)

`Parent View` 放弃复杂的系统 Dashboard 概念，将核心功能提炼为针对个校的 **University Decision Card (选校决策卡)**，每一所学校一张卡片，直击家长痛点并回答 4 个核心焦虑：
1.  **这个学校适合吗？**（展示 Fit 度与专业方向匹配）
2.  **贵不贵？**（展示 4 年 Net Cost 实际花费与家庭预算比对）
3.  **风险高不高？**（以 Financial Risk 和 Admission Risk 双向标签明确标示风险等级）
4.  **顾问建议保留还是放弃？**（展示 Advisor Override 后的最终判断与 Counselor Rationale）

*   **家长决策手势 (Parent Actions)**：卡片底部提供醒目的 `Approve (同意保留)`、`Needs Discussion (需要商讨)`、`Question Asked (向顾问提问)`、`Rejected (不同意申请)` 按钮。每一次点击都会在顾问今日工作台 (Priority Queue) 顶端生成警报，并将问题归入 Checklist，实现高黏性 CRM 闭环。

#### 3.2.5 系统判断与顾问判断“双轨显示” (Dual-Track Display)

为了展示数据可信度并强烈体现顾问专业价值，系统在 **University Shortlist**、**Parent View** 以及 **Print Report** 中，对录取难度和风险评定采用**双轨并列呈现机制 (Dual-Track Display)**：

*   **系统判定**：`NYU - Target (基于 GPA、标化成绩及录取历史画像模型)`
*   **顾问判定**：`NYU - Reach (顾问一键强行 Override)`
*   **顾问理由**：`“鉴于今年国际生申请池竞争空前激烈，且该生艺术作品集尚在打磨中，保守判定为 Reach，防止盲目乐观。”`
*   **家庭信任效应**：家长能够清晰感知到“系统提供理性数据，顾问提供感性经验与最终把关”，显著提升顾问的核心交付价值与家庭续费信任。

#### 3.2.6 空间区域与协作逻辑

| 空间区域 | 包含数据点与核心资产 | 协作交付与 CRM 逻辑 |
| :--- | :--- | :--- |
| **Student Profile** | 汇总学生的成绩背景、课程体系、RIASEC 代码与目标偏好。 | 提供学术画像。顾问一键审阅，随时查漏补缺。 |
| **Major Shortlist** | 顾问推荐与学生收藏的专业清单，系统自动渲染 **“劳动力饱和/行业风险”** 等智能标签。 | 专业的过滤与校验。系统**强制要求**顾问必须为每一个加入的专业填写 **Counselor Rationale (顾问推荐语)**，学生可发表追问。 |
| **University Shortlist** | 按照 **Reach（冲刺）**、**Target（匹配）**、**Safety（保底）** 三档进行选校分类陈列。 | 顾问一键将高校拖入不同分类，系统强制要求对分类的调整编写**顾问推荐理由**。 |
| **ROI View** | 实时结合大学 IPEDS 学费、预期债务以及毕业后 Prime-Age 薪资回本周期对比。 | 用量化数据辅助科学理性决策，免除家长对巨额学费支出与毕业后回报不匹配的焦虑。 |
| **Counselor Notes (建议版本记录)** | 顾问草拟的正式交付评语。系统采用**轻量化正式建议版本记录 (Published Version)**。 | 顾问的意见可记录为：*“ v2 · Published Mar 17 (v2正式建议) / Status: Recommend / Reason for change: 家长调高年度预算”*，避免扯皮，无需复杂的字段级比较。 |
| **Parent View (决策确认页)** | 家长专有的极简化财务看板：**学费花费 (Cost) + 就业预期 (ROI) + 债务压力 (Risk) + 顾问推荐理由**。 | 包含家长决策记录系统（Parent Decision Status）：`Not Viewed`（未看）、`Viewed`（已看）、`Approved`（已批准）、`Needs Discussion`（待讨论）、`Question Asked`（已提问）、`Rejected`（已拒绝）。提供一键操作按钮。家长的每一次动作都会在 Timeline 和 Dashboard 中标记。 |
| **Action Checklist** | 升学考试、文书 deadline，支持**任务与申请对象/执行人/审核人强绑定**。 | 例如：*“任务：文书初稿” 绑定学校 UCSD，执行人：Student，Reviewer：Counselor*。这使其区别于普通 to-do list，成为升学进度的一部分。 |
| **Export Print Report** | 一键渲染网页版 **网页端阶段性评估报告 (Print Report Page)**。 | 下文详述。包含 **Report Readiness Score** 完备度计算。 |

---

## 4. 三层 Paywall 机制与 Sponsored Access (SaaS Monetization)

### 4.1 三层价值与功能类型导向 Paywall

我们摒弃粗糙的 Top 10 专业数据拦截，改为按“价值类型”精准锁闭，让 Paywall 在用户“已经投入了数据背景与注意力”之后自然发生：

*   **Free Layer (免费探索)**：搜索所有大学/专业名称、查看基础事实、进行一次 RIASEC 测评、建立基础画像、限制收藏 10 个大学。
*   **Analysis Paywall (深度分析锁)**：针对个性化深度分析：完整 ROI 走势、薪资分布、录取画像 bounds、先修课 Prerequisite Mismatch、多校横向 ROI 比较、长期债务压力预测。**（驱使个人学生或家长升级 PRO 个人版）**
*   **Delivery Paywall (交付与协作锁)**：锁定创建 Counselor Workspace、Counselor Dashboard 今日工作台、Parent View 确认与指派、Sponsored 权益穿透、Print 阶段报告导出、只读链接分享。**（驱使专业顾问升级 Counselor PRO）**

### 4.2 Sponsored Access 权益穿透的边界与可见提示

为了既发挥 B2B2C 的分发机制，又不损害个人 PRO 的销售，我们对 Sponsored Access 的数据解锁边界实施精细化隔离：
*   **看板内数据解锁**：免费学生仅在当前 ACCEPTED 状态的 sponsored Admission Workspace **看板内**，可以完整读取由顾问手动加入的 Premium 专业和大学细节。
*   **全站探索锁定**：免费学生如果在 Workspace 之外自己进行全局探索、搜索新大学/专业、或者试图建立新的 Workspace，系统将继续实施 FREE 级别 paywall 限制。
*   **导出与操作锁定**：免费学生在 sponsored workspace 内不允许自主导出 CSV/Print 报告，不允许更改看板所有权。
*   **清晰的转化指引 (Sponsored Badge)**：在 **Workspace 顶部**、**Premium数据卡片旁边**、以及**学生尝试跳出 Board 进行独立搜索**时，展示精美的提权角标或气泡提示：*“本数据已由您的顾问 [Name] 赞助解锁。若想在全站自由无限制搜索所有高校与 ROI 数据，请[升级 Student PRO]”*。

### 4.3 顾问套餐 Quota 管理：Active 与 Archive 状态设计

顾问套餐根据其服务的 **Active Student Workspace** 数量进行计费。
*   **Active 状态**：Workspace 只要处于 active 状态、或过去 90 天有更新、或有未完成的 checklist，即占用 Quota 额度。
*   **Archive (归档) 状态**：当年申请季结束的学生，顾问可以一键将其 Workspace 进行“归档”。
    *   *归档后允许 (Read-Only)*：查看历史资料、查看与打印旧报告、查看时间轴 Timeline、复制该 Workspace 作为新模板。
    *   *归档后禁止*：修改学校列表、修改建议、新增评论/回复、生成新的 sponsored 密钥、邀请新成员、获取 premium 数据的后续实时更新。
    *   *恢复规则 (Reopen)*：顾问可随时点击 `Reopen Workspace`，重新转为 active 状态并重新占用 active quota 席位额度。

### 4.4 商业化套餐矩阵与计费详情

| 套餐名称 | 适用用户 | 核心功能与权限范围 | Active 席位限制 |
| :--- | :--- | :--- | :--- |
| **Free Explorer** | 学生 / 家长 | 基础全库搜索、1 次 RIASEC 测评、基础画像、收藏上限 10 所高校、在 Sponsored Board 内共享查看 Premium 数据。 | 无 |
| **Student PRO** | 独立学生 | 完整 ROI 曲线、薪资分布、先修课校验、录取画像 bounds、无限收藏 wishlist 与个性化推荐。 | 无 |
| **Counselor Starter** | 独立/新晋顾问 | 包含全部 PRO 数据、5 个 Active Workspaces 席位、网页 Print 报告导出、Parent View 确认、Sponsored 穿透。 | 5 Active |
| **Counselor Pro** | 专业/机构顾问 | 包含 Starter 全部权益、25 个 Active Workspaces 席位、智能今日工作台、轻量机构品牌化、Published 历史版本追溯。 | 25 Active |
| **Counselor Studio** | 中大型机构 | 包含 Pro 全部权益、多顾问座席（Seats）管理、自定义 Quota 容量、自定义 Logo 及机构品牌样式扩展（Post-MVP）。 | 弹性分配 |

---

## 5. 顾问交付物： Print 报告、轻量品牌与数据合规 (Deliverables)

### 5.1 网页端 6 页阶段性交付报告 (Print Report Page)

Print Report 是体现顾问专业度和工作量的核心载体。网页版 Print 报告应设计为标准的 6 页响应式报告：

1.  **Student Snapshot (学生背景摘要)**：学生学术背景、目标地区、学术强项、当前申请风险与数据不完备警告。
2.  **Interest & Major Fit (专业匹配)**：Holland RIASEC 六维测评雷达图、Top 5 推荐专业、各专业的推荐理由（Counselor Rationale）。
3.  **University Strategy (选校金字塔)**：按照 Reach / Target / Safety 分类，展示每所学校的关键风险与顾问针对性推荐语。
4.  **Cost & ROI (成本与回报)**：年度成本、4年成本、预期回报、债务压力散点图，并在每个图表旁边配有大白话的解释文字（*“什么是此项评估对您家庭的实际意义”*）。
5.  **Counselor Recommendation (顾问正式意见)**：推荐结论、条件性建议、家长需要确认的重点问题。
6.  **Next Action Plan (行动计划)**：指派给学生、家长、顾问的三方任务，以及下次 review 的时间。

### 5.2 顾问轻量级品牌化设置 (Advisor Branding)

为了提高顾问使用和转介绍意愿，我们在 **P1a 阶段提前预留轻量化品牌设置**（在导出的 Print 报告头部与页脚自动渲染）：
*   **P1a 必需**：顾问真实姓名、机构名称、联系方式、报告页脚的自定义版权与页码。
*   **P1b 增强**：顾问个人头像、机构自定义 Logo 上传、个性化服务 Tagline 渲染。

### 5.3 无 PII 网页只读分享链接 (Shareable Read-only Link)

为了促成自然转介绍，系统提供只读分享链接：
*   顾问可为某个 Admission Workspace 生成一份**有效期 14 天的只读加密分享链接 (No-PII Shared Report)**。
*   **彻底的无 PII 脱敏**：分享链接展示匿名画像。自动剥离并模糊学生姓名、具体学校名称（可仅保留排名范围或脱敏为“某常春藤高校”）、精准 GPA、精准标化成绩、精准家庭预算和私密草稿 Notes，仅保留匿名大纲、顾问理由与 ROI 走势。
*   **营销 CTA 转化**：家长可将此极富专业度的精美报告网页转发给其他家庭。只读网页底部包含：*“您也想要一份专业选校 ROI 评估？[点击定制您的 Decision Profile]”* 快速裂变。

### 5.4 数据可信度与顾问责任边界机制 (Data Credibility & Override)

*   **数据源与时间标签 (Data Source Disclosure)**：每个图表均附带显式披露，如：“数据源：IPEDS / 劳工部薪资数据 | 更新时间：2026-03”。
*   **估算标签与模型声明 (Estimate Label)**：所有预测和估算数据必须带有明确的 `[Estimate]` 标志和免责弹窗，声明为模型估算值而非录取/财务最终担保，提供历史波动区间而非绝对数字。
*   **顾问经验覆写 (Counselor Override)**：系统判定等级为理性参考，顾问可通过 Override 修改录取档次判定，覆写时强制要求填写理由并呈现在双轨显示中，明确以顾问最终判定为交付依据。

---

## 6. User Stories (MVP prioritized Backlog)

### P0：极简认证、决策画像与安全收单 (Must-Have for Launch)

#### A. 基础认证与 Decision Engine 建立
1. As a Visitor, I want to browse basic platform content without signing up, so that I can quickly evaluate the platform value.
2. As a Global User, I want to sign up and log in using email/password or Google OAuth.
3. As a Chinese User, I want to log in using phone number and SMS OTP.
4. As a New User, I want to verify my email or phone number.
5. As a Registered User, I want secure session persistence via HTTP-only cookie.
6. As a User, I want to log out and invalidate my current session.
7. As a Forgetful User, I want to reset my password via a secure one-hour link.
8. As a Logged-in User, I want to update my display name, avatar, and academic goals.
9. As the System, I want every account to have at least one valid identity identifier.

#### B. 极简双地域门户与手动切流
10. As a User, I want to manually switch between China and Global portals.
11. As a Domestic Chinese User, I want to see explicit PIPL/CAC consent checkboxes.
12. As an International User, I want to see GDPR / cookie consent declarations.

#### C. 动态决策画像 (Decision Engine Profile)
13. As a Student, I want to save GPA, curriculum, test scores, RIASEC and interests.
14. As a Student or Parent, I want to save majors and universities.
15. As a Parent, I want to enter budget and debt tolerance.
16. As a User, I want to see Profile Completeness and Recommendation Confidence.
17. As a User, I want reliable What Changed Since Last Time alerts.
18. As a User, I want a Decision Timeline.
19. As a Free Student, I want limited premium access that explains why PRO is valuable.

#### E. 统一收单闭环
20. As an International User, I want to upgrade via Stripe.
21. As a Domestic Chinese User, I want to upgrade via WeChat/Alipay.

#### F. 极简运营后台 (Admin Operations)
22. As an Admin, I want to search/filter users.
23. As an Admin, I want to toggle roles, reset password, ban/unban users.
24. As the System, I want basic operational audit logs.

### P1a：B2B2C CRM 看板交付、核心闭环、权益穿透与极简家长确认 (MVP core loop)

#### G. 三级角色分流 Onboarding 引导与 Aha! Moment
25. As a New User, I want role-based onboarding with immediate value.
26. As a Counselor, I want to preview a sample report before creating my first workspace.

#### H. 任务驱动型今日工作台与席位配额管理
27. As a Counselor, I want task-driven Dashboard action buttons.
28. As a Counselor, I want Students Needing Attention alerts.
29. As a Counselor, I want to archive and reopen workspaces.
30. As a Counselor, I want workspace quota visibility.

#### I. 引导式 Admission Workspace CRM 流程与强制推荐语
31. As a Counselor, I want to create a student Admission Workspace.
32. As a Counselor, I want a four-stage guided workflow.
33. As a Counselor, I want to invite student and parent via secure 48-hour link.
34. As a Student or Parent, I want to accept workspace invitation.
35. As a Counselor, I want to add majors and universities to shortlists.
36. As a Counselor, I want required Counselor Rationale fields.
37. As a Counselor, I want rationale draft assistance.
38. As a Counselor, I want to classify schools as Reach / Target / Safety.
39. As a Counselor, I want to override system classification with a reason.

#### J. 极简家长决策确认卡与决策状态跟踪
40. As a Parent, I want University Decision Cards with Cost, ROI, Risk and counselor reason.
41. As a Parent, I want to Approve, Reject, Ask Counselor or mark Needs Discussion.
42. As a Counselor, I want Parent Decision Status surfaced on dashboard.

#### K. 6页网页端交付报告、轻量化个人品牌与看板穿透
43. As a Counselor, I want to see Report Readiness Score.
44. As a Counselor, I want to preview incomplete reports.
45. As a Counselor, I want to generate a 6-page print-friendly report.
46. As a Counselor, I want my name, agency, contact and footer on the report.
47. As a Free Student, I want sponsored premium access inside accepted workspace only.

### P1b：增强传播、效率与顾问品牌化 (Secondary Enhancements)

#### L. 深度品牌化与无 PII 分享传播机制
48. As a Counselor, I want to upload logo/avatar and tagline.
49. As a Counselor, I want No-PII shareable report links.

#### M. 增强协作效率
50. As a Counselor, Student or Parent, I want action tasks linked to schools and owners.
51. As a Counselor, I want recommendation version history.
52. As a Counselor, I want smart reminders to students/parents.
53. As a Registered User, I want a referral code.
54. As a Counselor, I want to create and insert custom boilerplate text templates.

### P2：后置升级功能 (Out of MVP MVP 后再做)

#### N. 长期功能后置
55. As a Teacher, I want to map my local high school coursework to collegiate prerequisites, so that my students understand academic expectations (Post-MVP Education Version).

---

## 7. Implementation Decisions

### 1. Unified Authentication Base & Better Auth Hashing
采用 Better Auth 原生会话管理。明文令牌保存在浏览器 HTTP-only Cookie，在数据库中仅以加密哈希形式存储。三方凭证令牌（Google OAuth 等）在入库前全部由应用级 AES-256 对称加密保护。
*   **物理参考链接**：关于会话哈希函数、对称加密算法的具体实现方案，请参考 [技术设计规范 - 第 4 节](../design/user-auth-collaboration-technical-spec.md#4-安全合规机制与加密存储实现-aes-256-gcm--bcrypt)。

### 2. Manual Regional Toggle & SMS Challenge Hashing
摒弃复杂的 GeoIP 自动识别，在登录页头部或底部提供一个精美的手动区域切换按钮。
*   **登录优先级逻辑**：
    *   **China Manual Portal**：主要显示区突出手机号免密 OTP 登录，邮箱登录隐藏折叠。
    *   **Global Manual Portal**：主要显示区突出 Google 一键 OAuth 与标准邮箱登录。
*   **验证码安全**：防刷由 Redis 完成，DB 仅以单向哈希形式（codeHash）存根以作审计，限定 5 次失败自动锁定废弃并记录消耗状态。
*   **物理参考链接**：关于 CN/INTL 门户的布局定义与后端中间件的详细位置，请参考 [技术设计规范 - 第 3 节](../design/user-auth-collaboration-technical-spec.md#3-前后端物理文件路径与布局映射)。

### 3. Admission Workspace & B2B2C Sponsorship Penetration
引入解耦式的多角色看板协作机制。
*   **关系表设计**：使用 `BoardCollaboration` 与 `BoardMember` 关系表，支持 `STUDENT`、`PARENT` 和 `COUNSELOR` 三方加入。
*   **Sponsor 权益穿透**：FREE 级别学生请求 PRO 数据时，Express BFF 拦截器严格校验：该 Board 状态是否为 `ACCEPTED` $\rightarrow$ 顾问是否为 `COUNSELOR_PRO` 角色且 `userType` 为 `COUNSELOR` $\rightarrow$ 顾问订阅是否活跃有效且未过期 $\rightarrow$ 学生是否处于成员表中。仅通过方提权并附加 `x-sponsored-by` 标头，否则强制 `LIMIT 10` 拦截。
*   **嵌入式极简 Parent View**：系统不向 Parent 提供独立 dashboard 权限。Parent 作为 BoardMember 进入 Board 作用域后，系统强制拦截，仅向其渲染 `Cost + ROI + Risk + Counselor Rec` 四宫格极简视图。
*   **物理参考链接**：关于这 11 张模型表（User, Session, BoardMember 等）的完整 Prisma 物理定义，请参考 [技术设计规范 - 第 1 节](../design/user-auth-collaboration-technical-spec.md#1-数据库物理-schema-模型-prisma-models)。

### 4. Basic Billing Integration & Operational Admin Logs
*   **计费激活与 Quota 预留**：Stripe 续期直接更新 `subscriptionEndsAt`，国内扫码固定时长天数以 `max(existingEndsAt, now) + purchasedDays` 事务性累加。Prisma User 模型中新增 `workspaceQuota` 字段预留席位扩容，新增 `isArchived` 属性供 Workspace Quota 回收。
*   **基础运营后台日志**：不要求前后台使用 immutable 的 ledger 式审计表，但管理员每次手动修改订阅状态、修改角色和封禁用户，必须在 `AdminAuditLog` 中插入一条基础记录，标明 `actorType: 'ADMIN'` 以及具体的 action 动作文本。
*   **物理参考链接**：关于统一服务的 TypeScript 签名与 6 步数据库事务的执行细节，请参考 [技术设计规范 - 第 2 节](../design/user-auth-collaboration-technical-spec.md#2-统一计费服务接口与事务逻辑-subscriptionservice)。

### 5. Board Authorization Matrix (看板操作权限矩阵)

| 操作行为 | STUDENT (学生) | PARENT (家长) | COUNSELOR (顾问) | ADMIN (管理员) |
| :--- | :--- | :--- | :--- | :--- |
| **查看看板** | 仅限受邀 Board | 仅限受邀 Board，强制渲染极简视图 | 仅限自己创建的 Board | 全局可见 |
| **添加/移动卡片** | 允许 (大学/专业) | 禁止 | 允许 (大学/专业，划定 Reach/Target/Safety) | 允许 |
| **发表批注** | 允许 | 允许 | 允许 (可勾选私人 draft 还是公开 published) | 允许 |
| **数据导出** | 禁止 | 禁止 | 允许 (CSV 格式 / 网页打印) | 允许 |
| **撤销共享** | 允许 (单方面断开) | 禁止 | 允许 (删除看板) | 允许 |

---

## 8. Testing Decisions

### 1. 外部行为测试原则
测试必须采用 `supertest` 挂载 Express 服务端，发起真实的 HTTP 模拟请求进行端点与最终数据库状态断言，杜绝直接 Mock Prisma 内部方法。

### 2. MVP 测试用例矩阵
*   **Password Reset Revoke**：校验成功修改密码后，数据库中该用户的所有旧 `Session` 记录清空，旧 Session Cookie 访问个人中心返回 401。
*   **OTP Verification & Lockout**：同一手机验证码在第 5 次校验失败后，`OtpChallenge` 状态锁定为作废，此后即使输入正确验证码也必须返回 400。
*   **Immediate Block Revocation**：校验管理员封禁用户后，该用户持有的 Session 访问中间件立即返回 403 拦截。
*   **Sponsor Board Access Bounds & Penetration**：免费学生使用他人 `boardId` 试图穿透 PRO 数据，校验接口是否返回 200 但数据依然被 `LIMIT 10` 拦截。而在受邀 ACCEPTED 的 Sponsored Board 内，Premium 限制自动穿透解除。
*   **Role Downgrade**：订阅期结束后，校验普通用户角色回滚降级至 `FREE`，而 `ADMIN` 的角色降级不受影响。
*   **Basic Operational Admin Logging**：管理员延长订阅或封禁用户后，校验 `AdminAuditLog` 是否成功生成一条包含 Action 描述的基础记录。

---

## 9. Out of Scope

1.  **多租户学区层级架构（School District Panel）**：不包含学校学区、高中集团的多校统一层级管理。
2.  **Teacher 角色及教学工作流仪表盘**：Teacher 角色被彻底降级出 MVP。
3.  **前端 PDF 自研渲染引擎**：仅支持 CSV 文本导出，PDF 导出交由客户端使用标准的 `window.print()`。
4.  **多人协作即时打字光标渲染**：多人协作时不包含 Google Docs 风格的“多人即时打字光标”，基于 SWR 轮询机制。
5.  **自动化 GeoIP 地理重定向与多重合规文案分流**：使用登录页手动 China / Global 切换。
6.  **社交扫码与一键 OAuth (WeChat QR, Apple, Facebook)**：MVP 阶段仅支持国内手机 OTP 和国际 Google 登录。
7.  **不可篡改审计与 Compliance 合规官角色矩阵**：降级为基础日志记录。

---

## 10. Success Metrics (业务与体验保障)

为评估 MVP 交付价值及商业推广进展，项目确立了 5 大维度的核心成功指标：

1.  **极速激活指标 (Activation)**
    *   *Student Onboarding 完成率*：注册后 3 分钟内建立 Decision Profile 并完成首轮专业探索的比例 $\ge 80\%$。
    *   *Parent Budget Sandbox 完成率*：家长用户输入学费预算并保存首批 Cost/ROI 测算的比例 $\ge 75\%$。
    *   *Counselor Onboarding 转化率*：新注册顾问在 3 分钟内查看 Sample Report 预览并点击创建首个 Workspace 的比例 $\ge 90\%$。
2.  **顾问交付效率指标 (Delivery Efficiency)**
    *   *首份报告生成平均耗时*：新顾问在系统引导下，完成第一个学生 Workspace 并达到 Report Readiness 100% 直至生成首份 Print 报告的平均耗时 $\le 30$ 分钟。
    *   *Rationale 平均密度*：顾问所交付的每份报告中，平均包含的 Counselor Rationale 数量 $\ge 6$ 条，体现高含金量专业交付。
    *   *SaaS 活跃黏性*：付费顾问平均每周登录系统次数 $\ge 4.5$ 次。
3.  **家庭协作参与指标 (Collaboration & Engagement)**
    *   *Parent View 访问率*：受邀家长 48 小时内点击并登录 Parent View 看板的比例 $\ge 85\%$。
    *   *Parent Action 活跃度*：家长对个校卡片执行决策手势（Approve/Needs Discussion/Reject）的平均操作率 $\ge 90\%$。
    *   *家长报告在线阅读时长*：家长在线审阅选校 Cost/ROI 报告的平均单次停留时长 $\ge 8$ 分钟。
4.  **商业变现转化指标 (Monetization)**
    *   *Counselor PRO 付费转化率*：注册顾问在免费席位满额（5 Active）后，升级至 Counselor Pro 席位（25 Active）的升级率 $\ge 15\%$。
    *   *Student PRO 付费转化率*：接受 Sponsored Access 穿透的免费学生中，跳出 Board 自主升级 Student PRO 解锁全站自由探索的二阶转化率 $\ge 8\%$。
5.  **B2B2C 病毒式传播指标 (Viral Propagation)**
    *   *No-PII 匿名分享率*：顾问为 Workspace 生成 14 天有效期脱敏只读链接（No-PII Shared Report）的比例 $\ge 40\%$。
    *   *二阶裂变注册量*：通过匿名只读链接底部的营销 CTA 吸引新家庭注册建立 Decision Profile 的病毒式增长系数（K-Factor） $\ge 0.15$。

---

## 11. Risks and Mitigations (产品风险与应对)

在真实业务场景中，本方案可能面临以下体验及运营风险，并已在产品机制层面进行了前置兜底：

1.  **风险一：顾问嫌数据录入或操作太重，无法在 30 分钟内完成首份报告**
    *   *产品应对*：
        *   **Sample Report 先行**：顾问登录即可看到完美排版的现成样例，降低冷启动心智门槛。
        *   **Rationale Draft Assist (智能草稿)**：系统提供专业底稿，支持顾问“一键采用、轻度微调”，将手写评语耗时缩减 80%。
        *   **Soft Warning 机制**：允许在关键数据（如标化、RIASEC）未齐备时先生成 Draft 预览，不卡死紧急交付。
2.  **风险二：家长看不懂数据，或因过度关注学费支出产生选校焦虑**
    *   *产品应对*：
        *   **Parent View 极端简化**：不给家长展示任何学术术语或复杂的模型计算细节，以四宫格决策卡直击痛点。
        *   **大白话翻译（What this means for your family）**：任何 Cost / ROI 数据图表旁，必须自动配置系统翻译的家庭财务影响白话文解读。
        *   **顾问观点置顶**：将顾问的 Counselor Rationale 和 Reach/Safety override 强行呈现在家长卡最顶端，用顾问的感性专业度进行情绪安抚。
3.  **风险三：数据预测被家长或学生误解为“录取结果保证”或“最终财务保证”，引发纠纷**
    *   *产品应对*：
        *   **Est. Label 标志与历史区间**：所有录取难度、Net Cost 均打上明显的 `[Estimate]` 估算标志。
        *   **去绝对值化**：用历史数据范围、散点图趋势或估计区间替代单个确定性数值。
        *   **免责版权说明**：报告页脚及界面底部常驻显式数据源披露标签及法律免责声明（Disclaimer）。
4.  **风险四：Sponsored Access 穿透机制过于宽泛，导致学生完全没有升级 PRO 的动力**
    *   *产品应对*：
        *   **严格的工作空间物理隔离**：免费学生只有在接受邀请且激活的特定 Workspace *看板内部*，才能读取顾问手动加入的 Premium 大学/专业数据。
        *   **全站拦截依然生效**：当学生脱离该看板进行全站独立搜索、自主添加收藏时，三层 Paywall 依然会强力弹出并进行 Student PRO 转化引导。
        *   **Sponsored Badge 强刷存在感**：在所有被赞助解锁的数据卡片旁均常驻提权角标和顾问赞助 badge，随时提示升级自主探索权。

---

## 12. Further Notes

任何后续对于数据库字段的物理扩充或加密方法的微调，应直接同步更新 [技术设计规范 (TDD)](../design/user-auth-collaboration-technical-spec.md)，以保证 PRD 文档长期免于陷入过时的风险。
