# 07 — Developer Guide

> How to get started, add features, and avoid common pitfalls.

## Getting Started Checklist

```
□ 1. Clone the repo
□ 2. Start infrastructure: docker compose up -d
□ 3. Install deps: npm install
□ 4. Push schema: npx prisma db push && npx prisma generate
□ 5. Start BFF: npm run dev:bff  (Terminal 1)
□ 6. Start frontend: npm run dev  (Terminal 2)
□ 7. Open http://localhost:38030
□ 8. Register a test account at /register
```

## Adding a New API Route

1. **Identify the section** in `server/server.ts` (see [02-module-architecture.md](02-module-architecture.md#current-state))
2. **Add session check** if route requires auth:
   ```typescript
   const session = await fetchSession(req);
   if (!session?.email) return res.status(401).json({ error: 'UNAUTHORIZED' });
   ```
3. **Add role/userType check** if needed:
   ```typescript
   const user = await prisma.user.findUnique({
     where: { email: session.email.toLowerCase() },
     select: { role: true, userType: true },
   });
   if (user?.userType !== 'COUNSELOR') return res.status(403).json({ error: 'COUNSELOR_ACCESS_REQUIRED' });
   ```
4. **Add Zod validation** for input:
   ```typescript
   const parse = mySchema.safeParse(req.body);
   if (!parse.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.errors });
   ```
5. **Add route before the static file serving section** (line ~1837 in current file)
6. **Update** [05-api-contracts.md](05-api-contracts.md) with the new route

## Adding a New Prisma Model

1. **Edit** `prisma/schema.prisma`
2. **Add relation** fields on both sides
3. **Push schema**: `npx prisma db push`
4. **Generate client**: `npx prisma generate`
5. **Type-check**: `npm run lint`
6. **Update** [03-data-architecture.md](03-data-architecture.md) with the new model in the appropriate domain

## Adding a New Frontend Page

1. **Create** `src/pages/NewPage.tsx`
2. **Import** in `src/App.tsx`
3. **Add route** in the `<Routes>` block:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
4. **Use `useSession()`** for auth state:
   ```typescript
   const { user, loading } = useSession();
   if (loading) return <LoadingSpinner />;
   if (!user) { navigate('/login'); return null; }
   ```
5. **Use `useEntitlements()`** for feature gating:
   ```typescript
   const { entitlements } = useEntitlements(user);
   if (!entitlements.canGenerateReports) { /* show upgrade prompt */ }
   ```

## Testing Strategy

### Current State
- No formal test framework configured
- E2E test exists at `tests/e2e/mvp-full-flow.py` (Playwright + Python)
- Manual testing is the primary verification method

### E2E Test

```bash
# Install Playwright
pip install playwright && playwright install chromium

# Ensure both servers are running
npm run dev:bff   # Terminal 1
npm run dev       # Terminal 2

# Run E2E tests
python3 tests/e2e/mvp-full-flow.py
```

The E2E test covers: registration, login, counselor invite, student onboarding, profile completion, comparison creation, 4-lens results, entitlement enforcement, and counselor notes.

### Manual Testing Checklist for New Features

- [ ] Works when user is not logged in (redirects to login)
- [ ] Works for FREE tier user (entitlement limits enforced)
- [ ] Works for PRO tier user (all features available)
- [ ] Works for COUNSELOR userType (correct routes visible)
- [ ] Error states display correctly (401, 403, 404, 500)
- [ ] Mobile responsive (test at 375px width)
- [ ] TypeScript passes: `npm run lint`
- [ ] Build passes: `npm run build`

## Common Pitfalls

### 1. Port Conflicts

Ports 38030, 38090, 35432, 36379 must be free. Check with:
```bash
lsof -i :38030 -i :38090 -i :35432 -i :36379
```

### 2. Prisma PG Adapter

Prisma 7 uses `@prisma/adapter-pg` with a raw `pg.Pool`. This is different from the traditional Prisma connection. The pool is created in `server/server.ts`, not via Prisma's internal connection manager.

### 3. Better Auth Self-Proxy

The BFF calls itself via HTTP to validate sessions. This means `BETTER_AUTH_URL` must be correct and the BFF must be running. If auth seems broken, check:
```bash
curl http://localhost:38090/api/auth/get-session -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

### 4. Better Auth Tables

Better Auth manages its own tables (`account`, `session`, `verification`). If you run `prisma db push` after a fresh database create, these tables won't exist. The SQL for creating them is documented in the unification migration.

### 5. Email Verification in Dev Mode

When `EMAIL_DEV_MODE=true`, verification links are logged to the BFF terminal, not emailed. After registering, check the BFF terminal output for:
```
[Email] Verification link: http://localhost:38030/verify-email?token=...
```

### 6. Vite Proxy

In dev mode, Vite proxies `/api/*` to `localhost:38090`. If you get 404 on API calls, check that the BFF is running on port 38090.

### 7. Route Guard Null User Redirect

When writing route guards, use `user && user.userType !== 'STUDENT'` instead of `user?.userType !== 'STUDENT'`. The optional chaining form returns `undefined !== 'STUDENT'` which is `true`, causing premature redirects when the session is still loading:

```typescript
// WRONG: redirects while loading
useEffect(() => {
  if (user?.userType !== 'STUDENT') { navigate('/'); return; }
  loadData();
}, [user, sessionLoading, navigate]);

// CORRECT: waits for user to resolve
useEffect(() => {
  if (user && user.userType !== 'STUDENT') { navigate('/'); return; }
  loadData();
}, [user, sessionLoading, navigate]);
```

### 8. Better Auth Session emailVerified Column

Better Auth stores sessions in raw PostgreSQL (not Prisma). The `session` table does **not** have an `emailVerified` column by default. To mark a user as verified after registration, update the `User` table directly — do not try to modify the Better Auth session table.

## Project Structure Quick Reference

```
docs/architecture/     ← Architecture docs (this directory)
docs/prd/             ← Product requirements
docs/adr/             ← Architecture Decision Records
docs/customer-research/ ← User research

server/               ← Express BFF
  server.ts           ← Main server file (~2300 lines)
  email.ts            ← Email service
  stripe.ts           ← Stripe integration
  pdfGenerator.tsx    ← PDF generation

src/                  ← React frontend
  pages/              ← Route-level components (14 files)
  components/         ← Shared components (15 files)
  utils/              ← Utilities (6 files)
  data/               ← Static data

backend/              ← Python data pipeline
  main.py             ← FastAPI entry
  celery_app.py       ← Celery config
  tasks.py            ← Async tasks

prisma/               ← Database
  schema.prisma       ← Data model (25+ models)
  migrations/         ← Migration history
```

## Related ADRs

- [ADR Index](../adr/README.md)
