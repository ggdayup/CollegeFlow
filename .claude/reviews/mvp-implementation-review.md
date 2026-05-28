# Code Review: MVP Implementation Changes

**Reviewed**: 2026-05-28
**Branch**: feat/mvp-core-implementation
**Decision**: REQUEST CHANGES

## Summary

The MVP implementation adds substantial functionality (Stripe, PDF reports, onboarding, confidence UI, data seeding). The TypeScript build passes cleanly. However, there are **2 CRITICAL** type safety violations and **4 HIGH** issues that must be addressed before merge, particularly around the `any` usage in pdfGenerator.tsx and missing path traversal protection.

## Findings

### CRITICAL

#### C1. `pdfGenerator.tsx:70` — `prisma: any` parameter bypasses all type safety

```typescript
export async function generateComparisonPdf(sessionId: string, prisma: any): Promise<Buffer> {
```

The `any` type defeats the entire type system for a function that does complex Prisma queries and data transformation. Every Prisma call inside inherits `any`, meaning typos in field names, wrong model names, and schema mismatches are invisible at compile time.

**Suggested fix**: Import the PrismaClient type from `@prisma/client` and use it:
```typescript
import type { PrismaClient } from '@prisma/client';
export async function generateComparisonPdf(sessionId: string, prisma: PrismaClient): Promise<Buffer> {
```

#### C2. `pdfGenerator.tsx:92-95` — Multiple `any` in data transformation

```typescript
const options = session.options.map((opt: any) => {
  const ipedsMetrics: any[] = opt.university.institutionMetrics || [];
  const getMetric = (key: string) => {
    const m = ipedsMetrics.find((x: any) => x.metricKey === key);
```

Three `any` types in a tight loop. Since `session` is already properly typed from the Prisma query, `opt` and `x` can be inferred or typed from the generated types.

**Suggested fix**: Remove `any` annotations and let TypeScript infer from the Prisma query result, or define explicit interfaces.

### HIGH

#### H1. `server/server.ts:report download` — No path traversal guard on `sendFile`

```typescript
const pdfPath = path.join(__dirname, '../reports', `${report.sessionId}.pdf`);
res.sendFile(pdfPath);
```

While `report.sessionId` comes from the DB (UUID), adding an explicit UUID validation is cheap defense-in-depth.

**Suggested fix**: Add UUID validation:
```typescript
if (!/^[0-9a-f-]{36}$/.test(report.sessionId)) {
  return res.status(400).json({ error: 'INVALID_SESSION_ID' });
}
```

#### H2. `server/stripe.ts:10` — Placeholder Stripe key causes silent failures

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
```

A non-empty placeholder key will be passed to Stripe in dev mode, causing confusing API errors instead of a clear "configure STRIPE_SECRET_KEY" message.

**Suggested fix**: Throw on missing key or only initialize Stripe when the key is configured.

#### H3. `server/stripe.ts` — `getPrisma()` creates a new connection pool per call

Every webhook handler calls `getPrisma()` which creates a fresh `pg.Pool` and `PrismaClient`. Under load (e.g., Stripe retries), this leaks connection pools.

**Suggested fix**: Export a shared Prisma instance from `server.ts` and pass it to the stripe module, or create a singleton.

#### H4. `server/server.ts` — Inline email HTML template in route handler (~40 lines)

The invite email HTML is embedded directly in the route handler. Adds ~40 lines to an already 2879-line file.

**Suggested fix**: Extract to a `sendInviteEmail()` function in `server/email.ts` for consistency.

### MEDIUM

#### M1. `pdfGenerator.tsx:243-263` — `computeFit` is duplicated logic

The `computeFit` function in pdfGenerator is a different implementation from the fit scoring in `server/server.ts` comparison engine. PDF reports may show different fit scores than the web UI.

**Suggested fix**: Extract fit computation to a shared module.

#### M2. `server/server.ts` — File is now ~2879 lines

Consider extracting route groups (e.g., `server/routes/subscription.ts`, `server/routes/report.ts`).

#### M3. `SubscriptionPage.tsx:56` — Silent error catch

```typescript
} catch {
  // error
}
```

The `handleManage` function silently swallows errors. Users get no feedback if the billing portal fails.

#### M4. `seed-top50-universities.ts:150` — String concatenation for synthetic ID

```typescript
where: { id: candidate.id + '_publish' },
```

Appending `_publish` to a UUID is not a valid UUID format.

**Suggested fix**: Use `crypto.randomUUID()` instead.

### LOW

#### L1. `pdfGenerator.tsx` — File extension is `.tsx` for server-side code

Correct for JSX but may confuse readers.

#### L2. `PaywallModal.tsx:26-27` — Hardcoded plan prices

Prices are hardcoded in both `PaywallModal.tsx` and `SubscriptionPage.tsx`.

## Validation Results

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`) | **Pass** |
| Lint (`npm run lint`) | **Pass** |
| Tests | Not run (E2E requires running services) |

## Files Reviewed

| File | Change Type |
|---|---|
| `prisma/schema.prisma` | Modified (+20 lines) |
| `server/server.ts` | Modified (+176 lines) |
| `server/stripe.ts` | **New** (259 lines) |
| `server/pdfGenerator.tsx` | **New** (265 lines) |
| `scripts/seed-top50-universities.ts` | **New** (181 lines) |
| `src/App.tsx` | Modified (+5 lines) |
| `src/utils/useEntitlements.ts` | Modified (+23 lines) |
| `src/utils/useSession.ts` | Modified (+1 line) |
| `src/pages/ComparisonPage.tsx` | Modified (+33 lines) |
| `src/pages/OnboardingPage.tsx` | Modified (+107 lines) |
| `src/pages/UniversityDetailPage.tsx` | **New** (136 lines) |
| `src/pages/SubscriptionPage.tsx` | **New** (120 lines) |
| `src/components/PaywallModal.tsx` | **New** (57 lines) |
| `tests/e2e/mvp-full-flow.py` | Modified (+127 lines) |

## Next Steps

1. **Fix C1+C2**: Replace all `any` types in `pdfGenerator.tsx` with proper Prisma types
2. **Fix H1**: Add UUID validation before `res.sendFile`
3. **Fix H2**: Guard Stripe initialization on missing key
4. **Fix H3**: Use shared Prisma client in stripe.ts
5. **Fix M4**: Use `crypto.randomUUID()` instead of string concatenation for synthetic IDs
