# 02 — Module Architecture

> How code is organized today and how it should evolve. The key problem: `server/server.ts` is a monolith.

## Current State — `server/server.ts` (~2300 lines)

The BFF server is a single file with all routes, middleware, and configuration inline.

| Line Range | Section | Dependencies |
|------------|---------|--------------|
| 1–35 | Imports, pool, Prisma client | All sections |
| 37–102 | Better Auth config | Auth routes, session helper |
| 104–460 | Auth routes (me, sign-in, verify, etc.) | Better Auth, fetchSession, prisma |
| 460–493 | `fetchSession()` helper | Better Auth |
| 493–515 | `requireAdmin()` middleware | fetchSession, prisma |
| 515–937 | Universities endpoint | prisma, static data |
| 937–1210 | User settings endpoints (me, password, saved-items) | fetchSession, prisma |
| 1210–1270 | Deprecated endpoints, proxy middleware | expressProxyMiddleware |
| 1270–1317 | IPEDS public endpoints | prisma |
| 1317–1510 | IPEDS admin endpoints | requireAdmin, prisma |
| 1510–1837 | Admin user management, subscription management | requireAdmin, fetchSession, prisma |
| 1837–2050 | MVP: Counselor workspace, student profile, comparison, reports, notes | requireSession, requireCounselor, requireStudent, prisma, zod |

## Target State

```
server/
├── server.ts                    # Entry point, middleware setup, static serving (<200 lines)
├── email.ts                     # [DONE] Email transporter and templates
├── stripe.ts                    # [DONE] Stripe checkout, webhook, subscription
├── pdfGenerator.tsx             # [DONE] PDF report generation
├── auth/
│   ├── config.ts                # Better Auth configuration
│   └── middleware.ts            # fetchSession, requireAdmin, requireSession, requireCounselor, requireStudent
├── routes/
│   ├── auth.ts                  # /api/auth/me, verify-status, resend-verification, verify-email
│   ├── users.ts                 # /api/users/* — profile, settings, saved items
│   ├── universities.ts          # /api/universities
│   ├── ipeds.ts                 # /api/ipeds/* — public + admin
│   ├── admin.ts                 # /api/admin/* — user management, subscription mgmt
│   ├── counselor.ts             # /api/counselor/* — invite, students, notes
│   ├── student.ts               # /api/student/* — profile, workspace, invite accept
│   ├── comparison.ts            # /api/comparison/* — create, get, list, fit engine
│   └── report.ts                # /api/report/* — list, generate, download
└── middleware/
    ├── entitlement.ts           # Backend entitlement enforcement (NEW — currently missing)
    └── validation.ts            # Shared Zod validation patterns
```

### Migration Sequence

Extract in order of **least dependency first**:

1. **Auth middleware** — `fetchSession`, `requireAdmin`, `requireSession`, `requireCounselor`, `requireStudent` → `server/auth/middleware.ts`
2. **Route groups** — Each logical route group → `server/routes/*.ts`
3. **Entitlement middleware** — New backend enforcement → `server/middleware/entitlement.ts`
4. **Server entry** — Wire everything together in <200 lines

## Frontend Module Organization

```
src/
├── main.tsx                     # App entry point
├── App.tsx                      # Router, language state, nav layout
├── pages/                       # Route-level components (14 files)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── OnboardingPage.tsx
│   ├── ProfilePage.tsx
│   ├── SettingsPage.tsx
│   ├── SubscriptionPage.tsx
│   ├── UniversityDetailPage.tsx
│   ├── JoinPage.tsx             # Accept counselor invite
│   ├── CounselorDashboardPage.tsx  # Counselor CRM
│   ├── StudentProfilePage.tsx   # 3-step onboarding wizard
│   └── ComparisonPage.tsx       # Comparison builder + 4-lens results
├── components/                  # Shared UI components (15 files)
│   ├── LandingPage.tsx
│   ├── MajorsDirectory.tsx
│   ├── UniversityNavigator.tsx
│   ├── AnalyticsCharts.tsx
│   ├── ROICharts.tsx
│   ├── SubjectRadarChart.tsx
│   ├── PaywallModal.tsx
│   ├── CreditBento.tsx
│   ├── PrerequisiteFlow.tsx
│   ├── ProtectedRoute.tsx
│   ├── UserMenu.tsx
│   ├── AdminUserManagement.tsx
│   ├── IPEDSAdminAudit.tsx
│   ├── SettingsDrawer/          # Tab components
│   └── useUniversityNavigator.ts # Hook
├── utils/                       # Shared utilities (6 files)
│   ├── useSession.ts            # Session hook → /api/auth/me
│   ├── useEntitlements.ts       # Tier derivation (GUEST/FREE/PRO/COUNSELOR/ADMIN)
│   ├── apiProxy.ts              # Redis caching + API proxy utilities
│   ├── chineseLocalization.ts
│   ├── matchingHelper.ts
│   └── demands.ts
├── data/                        # Static data
│   ├── universitiesData.ts      # 16 premium universities (hand-crafted)
│   ├── majorsData.ts            # Broad/detailed fields + majors taxonomy
│   └── ipedsMetrics.ts          # Metric definitions
└── index.css                    # Tailwind imports
```

### Frontend Routing

```
/                        → Landing / AppContent
/login                   → LoginPage
/register                → RegisterPage
/verify-email            → VerifyEmailPage
/forgot-password         → ForgotPasswordPage
/reset-password          → ResetPasswordPage
/profile                 → ProfilePage
/settings                → SettingsPage
/onboarding              → OnboardingPage
/join?token=xxx          → JoinPage (accept counselor invite)
/dashboard/counselor     → CounselorDashboardPage
/dashboard/student/profile → StudentProfilePage (3-step wizard)
/dashboard/student/compare → ComparisonPage (builder mode)
/dashboard/student/results/:sessionId → ComparisonPage (results mode)
/admin/users             → AdminPage (protected)
```

## Data Pipeline Module Organization

```
backend/
├── main.py                    # FastAPI entry point, /curriculum/* endpoints
├── celery_app.py              # Celery worker configuration
├── tasks.py                   # Async crawl tasks
├── catalog_discovery.py       # University catalog discovery
├── gemini_parser.py           # AI-powered curriculum extraction
├── parser.py                  # HTML/structured data parsing
├── matcher.py                 # Major matching / semantic similarity
├── spiders/
│   └── catalog_spider.py      # Scrapy spider for catalog crawling
├── data/                      # Raw data files
└── requirements.txt           # Python dependencies
```

## Related ADRs

- [ADR-003](../adr/ADR-003-vite-middleware-vs-reusable-bff.md) — BFF architecture
- [ADR-004](../adr/ADR-004-saas-entitlement-boundary.md) — Entitlement gating requires backend middleware
