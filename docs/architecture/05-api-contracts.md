# 05 — API Contracts

> Route reference for all Express BFF endpoints. Grouped by domain.

## Auth Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/auth/me` | Session required | Return current user profile (enriched from Prisma) |
| `POST` | `/api/auth/sign-up/email` | None | Register with email + password |
| `POST` | `/api/auth/sign-in/email` | None | Login, returns session cookie |
| `POST` | `/api/auth/sign-out` | Session | Invalidate session |
| `GET` | `/api/auth/verify-status` | Session | Check email verification status |
| `PATCH` | `/api/auth/resend-verification` | Session | Resend verification email |
| `POST` | `/api/auth/verify-email` | None | Verify email with token |

All auth routes (except `/me`) are handled by Better Auth's HTTP handler. The `/me` endpoint enriches Better Auth session data with Prisma User fields.

## User Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/:email` | None | Get user by email (deprecated, public) |
| `GET` | `/api/users/me` | Session | Get current user profile |
| `PATCH` | `/api/users/me` | Session | Update profile fields (name, userType, schoolName, etc.) |
| `PATCH` | `/api/users/me/password` | Session | Change password via Better Auth |
| `DELETE` | `/api/users/me` | Session | Delete account |
| `GET` | `/api/users/me/saved-items` | Session | List saved universities/majors |
| `DELETE` | `/api/users/me/saved-items/:id` | Session | Delete saved item |
| `POST` | `/api/users` | None | Register/update user (deprecated) |

## University Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/universities` | None | Get all universities with schools, majors, rankings, IPEDS metrics |

Returns rich university data including hand-crafted metadata for 16 premium universities and DB data for the rest.

## Counselor Routes

| Method | Path | Auth | userType | Description |
|--------|------|------|----------|-------------|
| `POST` | `/api/counselor/invite` | Required | COUNSELOR | Invite student by email, creates StudentWorkspace + invite token |
| `GET` | `/api/counselor/students` | Required | COUNSELOR | List all invited students with status |
| `POST` | `/api/counselor/note` | Required | COUNSELOR | Create counselor note for a workspace |
| `GET` | `/api/counselor/notes/:workspaceId` | Required | COUNSELOR | List notes for a workspace |

### Invite Response
```json
{ "workspaceId": "uuid", "inviteToken": "hex", "inviteLink": "http://localhost:38030/join?token=..." }
```

### Students List Response
```json
{ "students": [{ "workspaceId": "...", "email": "...", "inviteAccepted": true, "profileComplete": true, "lastComparisonAt": "..." }] }
```

## Student Routes

| Method | Path | Auth | userType | Description |
|--------|------|------|----------|-------------|
| `GET` | `/api/student/invite/:token` | None | — | Check invite token validity |
| `POST` | `/api/student/invite/:token/accept` | Required | — | Accept invite, link student to workspace |
| `GET` | `/api/student/profile` | Required | STUDENT | Get decision profile + completeness score |
| `POST` | `/api/student/profile` | Required | STUDENT | Update decision profile + weights |
| `GET` | `/api/student/workspace` | Required | STUDENT | Get workspace + counselor info |

### Profile Response
```json
{
  "profile": { "gpa": 3.75, "satScore": 1400, "annualBudgetMin": 30000, "annualBudgetMax": 60000, "interestAreas": ["stem"], "weights": { "salary": 0.3, "prestige": 0.2, "cost": 0.3, "fit": 0.2 } },
  "completeness": 100
}
```

## Comparison Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/comparison` | Required | Create comparison session (2-4 universities). FREE tier: max 1 |
| `GET` | `/api/comparison/:sessionId` | Required | Get comparison results with 4 lenses |
| `GET` | `/api/comparison/list` | Required | List all comparison sessions for user |

### Comparison Result Response
```json
{
  "sessionId": "uuid",
  "name": "My Comparison",
  "options": [{
    "universityId": "uuid",
    "universityName": "Harvard University",
    "lenses": {
      "admissions": { "acceptanceRate": 3, "sat25th": 1460, "sat75th": 1580, "confidence": "verified" },
      "outcomes": { "medianSalary2yr": 85000, "medianDebt": 15000, "gradRate": 97, "confidence": "verified" },
      "cost": { "tuitionOutState": 54269, "roomBoard": 19840, "totalCost": 74109, "confidence": "verified" },
      "fit": { "overallScore": 85, "breakdown": { "academic": 90, "financial": 70, "interest": 95 }, "exploration": "GPA above school median" }
    }
  }],
  "tradeoffs": [{ "description": "Significant cost difference", "options": ["Harvard", "State U"] }]
}
```

## Report Routes

| Method | Path | Auth | Entitlement | Description |
|--------|------|------|-------------|-------------|
| `POST` | `/api/report/generate` | Required | PRO or COUNSELOR | Generate PDF report for comparison |
| `GET` | `/api/report/list` | Required | — | List generated reports |

FREE tier receives `403 { error: "UPGRADE_REQUIRED", currentTier: "FREE", requiredTier: "PRO" }`.

## Admin Routes

All admin routes require `requireAdmin` middleware (`role === 'ADMIN'`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/users` | Paginated user list with search/filter |
| `GET` | `/api/admin/users/:id` | Single user details |
| `PATCH` | `/api/admin/users/:id/role` | Change user role |
| `PATCH` | `/api/admin/users/:id/disable` | Toggle account disabled |
| `POST` | `/api/admin/users/:id/reset-password` | Admin password reset |
| `PATCH` | `/api/admin/users/:id/subscription` | Update subscription status |
| `POST` | `/api/admin/users/:id/trial` | Grant 14-day trial |
| `GET` | `/api/admin/users/:id/subscription-history` | Subscription audit log |
| `GET` | `/api/admin/ipeds/candidates` | Institution candidates list |
| `GET` | `/api/admin/ipeds/institution/:unitId` | Full institution audit view |
| `GET` | `/api/admin/ipeds/metrics/:unitId` | Metrics for a unit |
| `GET` | `/api/admin/ipeds/program-fields/:unitId` | Program fields for a unit |
| `GET` | `/api/admin/ipeds/dictionary` | IPEDS metadata dictionary |
| `GET` | `/api/admin/ipeds/release-status` | Release/import status summary |

## IPEDS Public Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/ipeds/university/:universityId` | None | Public metrics and programs for a university |

## Proxy Route

| Method | Path | Description |
|--------|------|-------------|
| `*` | `/api/proxy/*` | Proxy to FastAPI Python services (`expressProxyMiddleware`) |

## Standard Error Format

```json
{ "error": "ERROR_CODE" }
// or with details:
{ "error": "VALIDATION_ERROR", "details": [{ "path": "...", "message": "..." }] }
```

| Status | Error Code | Meaning |
|--------|-----------|---------|
| 400 | `VALIDATION_ERROR` | Input validation failed (Zod) |
| 401 | `UNAUTHORIZED` / `Not authenticated` | No valid session |
| 403 | `COUNSELOR_ACCESS_REQUIRED` / `STUDENT_ACCESS_REQUIRED` | Wrong userType |
| 403 | `UPGRADE_REQUIRED` | Insufficient entitlement tier |
| 404 | `NOT_FOUND` | Resource not found |
| 422 | `COMPARISON_LIMIT` | Business rule violation |

## BFF Proxy Contract

```
Browser → Vite (:38030) → /api/* → BFF (:38090)
BFF → /api/proxy/* → FastAPI (:8000)
```

The BFF proxies `/api/proxy/*` to the FastAPI data pipeline via `expressProxyMiddleware`. See `src/utils/apiProxy.ts` for caching and gateway logic.

## Related ADRs

- [ADR-003](../adr/ADR-003-vite-middleware-vs-reusable-bff.md) — BFF architecture
- [ADR-004](../adr/ADR-004-saas-entitlement-boundary.md) — Entitlement gating
