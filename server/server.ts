import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { createTransporter, sendVerificationEmail, sendResetPasswordEmail } from './email';
import { createCheckoutSession, createBillingPortalSession, handleWebhookEvent, setPrisma } from './stripe';
import { generateComparisonPdf } from './pdfGenerator';
import { universities as staticUnis } from '../src/data/universitiesData.ts';
import { expressProxyMiddleware } from '../src/utils/apiProxy.ts';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.BFF_PORT || 38080;

app.use(express.json());

// Create connection pool and Prisma client with PG adapter for Prisma 7
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Share Prisma client with Stripe module
setPrisma(prisma);

// ============================================
// Better Auth Configuration
// ============================================

// Email transporter (dev mode logs to console, production sends via SMTP)
const { transporter: emailTransporter, isDevMode: emailIsDevMode } = createTransporter();

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:38090',
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:38030',
    'http://127.0.0.1:38030',
  ],
  // Unified: use Prisma's User model directly (no separate better-auth "user" table)
  user: {
    modelName: 'User',
    fields: {
      emailVerified: 'emailVerified',
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.EMAIL_DEV_MODE === 'true' ? false : true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url, token }) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:38030';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;
      await sendResetPasswordEmail(
        emailTransporter,
        emailIsDevMode,
        user.email,
        resetLink,
        url,
        user.name || undefined,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    async sendVerificationEmail({ user, url, token }) {
      await sendVerificationEmail(
        emailTransporter,
        emailIsDevMode,
        user.email,
        url,
        user.name || undefined,
      );
    },
    async afterEmailVerification(user) {
      // User model unified — better-auth writes directly to Prisma User
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

// ============================================
// Auth Routes
// ============================================

// GET /api/auth/me - return current authenticated user info
// Must be BEFORE the generic /api/auth middleware so it's not intercepted
app.get('/api/auth/me', async (req, res) => {
  try {
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:38090';
    const url = `${baseUrl}/api/auth/get-session`;

    const requestHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key !== 'content-length' && key !== 'host') {
        requestHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    }
    // Add Origin for Better Auth
    if (!requestHeaders['origin']) {
      requestHeaders['origin'] = baseUrl;
    }
    const sessionResponse = await auth.handler(
      new Request(url, { headers: requestHeaders }),
    );

    if (!sessionResponse.ok) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const responseText = await sessionResponse.text();
    const sessionData = JSON.parse(responseText) as {
      user?: { id?: string; email?: string; name?: string; emailVerified?: boolean };
      session?: { id?: string; expiresAt?: string };
    };

    if (!sessionData?.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const baUser = sessionData.user;
    if (!baUser.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Try to enrich with app-specific data from Prisma User table.
    const dbUser = await prisma.user.findUnique({
      where: { email: baUser.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        schoolName: true,
        gradYear: true,
        counselorSpecialty: true,
        teacherSubject: true,
        customNote: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        emailVerified: true,
        disabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (dbUser?.disabled) {
      return res.status(401).json({ error: 'Account has been disabled' });
    }

    // If the Prisma User doesn't exist yet (legacy account), create it
    if (!dbUser) {
      const newUser = await prisma.user.create({
        data: {
          email: baUser.email.toLowerCase(),
          name: baUser.name || null,
          role: 'FREE',
          userType: 'STUDENT',
          subscriptionStatus: 'none',
          passwordHash: '',
          emailVerified: !!baUser.emailVerified,
          emailVerifiedAt: baUser.emailVerified ? new Date() : null,
        },
      });
      return res.json({
        ...newUser,
        emailVerified: baUser.emailVerified || newUser.emailVerified,
      });
    }

    return res.json({
      ...dbUser,
      emailVerified: baUser.emailVerified || dbUser.emailVerified,
      emailVerifiedAt: baUser.emailVerified && !dbUser.emailVerifiedAt
        ? new Date()
        : dbUser.emailVerifiedAt,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error fetching session:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mount Better Auth handler at /api/auth/*
// Handles: POST /api/auth/sign-up/email, POST /api/auth/sign-in/email,
//          POST /api/auth/sign-out, GET /api/auth/get-session, etc.
app.use('/api/auth', async (req, res, next) => {
  const localAuthRoutes = new Set([
    'GET /verify-status',
    'PATCH /resend-verification',
    'POST /verify-email',
  ]);
  if (localAuthRoutes.has(`${req.method} ${req.path}`)) {
    return next();
  }

  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:38090';
  const url = `${baseUrl}${req.originalUrl}`;

  // Intercept sign-in for disabled account check
  const isSignIn = req.method === 'POST' && req.path === '/sign-in/email';
  const isSignUp = req.method === 'POST' && req.path === '/sign-up/email';
  if (isSignIn && req.body?.email) {
    const user = await prisma.user.findUnique({
      where: { email: (req.body.email as string).toLowerCase() },
      select: { disabled: true },
    });
    if (user?.disabled) {
      return res.status(403).json({
        error: 'Account has been disabled. Please contact support.',
        code: 'ACCOUNT_DISABLED',
      });
    }
  }

  const requestHeaders: Record<string, string> = {};
  const hasBody = !['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0;
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined && key !== 'content-length' && key !== 'host') {
      // Only forward Content-Type if there's actually a body
      if (key === 'content-type' && !hasBody) continue;
      requestHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }
  }
  // Ensure JSON Content-Type when sending a body
  if (hasBody && !requestHeaders['content-type']) {
    requestHeaders['content-type'] = 'application/json';
  }
  // Add Origin and Referer for Better Auth CSRF protection
  if (!requestHeaders['origin']) {
    requestHeaders['origin'] = baseUrl;
  }
  if (!requestHeaders['referer']) {
    requestHeaders['referer'] = `${baseUrl}/`;
  }

  const webRequest = new Request(url, {
    method: req.method,
    headers: requestHeaders,
    body: hasBody ? JSON.stringify(req.body) : undefined,
  });

  const response = await auth.handler(webRequest);

  const responseText = await response.text();
  let responseJson: unknown = null;
  if (responseText) {
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = null;
    }
  }

  // After successful sign-up or sign-in, update lastLoginAt
  if ((isSignUp || isSignIn) && response.ok && req.body?.email) {
    const email = req.body.email as string;
    prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { lastLoginAt: new Date() },
    }).catch(() => { /* ignore - user may not exist yet */ });
  }

  res.status(response.status);
  // Forward Set-Cookie headers (special handling needed - not included in entries())
  const setCookies = response.headers.getSetCookie?.();
  if (setCookies && setCookies.length > 0) {
    for (const cookie of setCookies) {
      res.appendHeader('Set-Cookie', cookie);
    }
  }
  // Forward other headers
  for (const [key, value] of response.headers.entries()) {
    if (key !== 'set-cookie') {
      res.setHeader(key, value);
    }
  }

  if (responseText) {
    if (responseJson !== null) {
      res.json(responseJson);
    } else {
      res.send(responseText);
    }
  } else {
    res.end();
  }
});

// ============================================
// Email Verification Endpoints
// ============================================

// GET /api/auth/verify-status - returns email verification status for current user
app.get('/api/auth/verify-status', async (req, res) => {
  try {
    const session = await fetchSession(req);
    if (!session?.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.email.toLowerCase() },
      select: { emailVerified: true, emailVerifiedAt: true },
    });

    // demo@college.edu bypass
    const isDemoEmail = session.email.toLowerCase() === 'demo@college.edu';
    const isVerified = isDemoEmail || !!session.emailVerified || !!dbUser?.emailVerified;

    res.json({
      emailVerified: isVerified,
      emailVerifiedAt: isDemoEmail || (session.emailVerified && !dbUser?.emailVerifiedAt)
        ? new Date().toISOString()
        : dbUser?.emailVerifiedAt || null,
      email: session.email,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error fetching verify status:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/auth/resend-verification - resend verification email to current user
app.patch('/api/auth/resend-verification', async (req, res) => {
  try {
    const session = await fetchSession(req);
    const email = (session?.email || req.body?.email || '').toString().trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    if (dbUser?.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate a new verification token via Better Auth
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:38090';
    const requestHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key !== 'content-length' && key !== 'host') {
        requestHeaders[key] = Array.isArray(value) ? value.join(',') : String(value);
      }
    }
    if (!requestHeaders['origin']) requestHeaders['origin'] = baseUrl;
    if (!requestHeaders['content-type']) requestHeaders['content-type'] = 'application/json';

    // Use Better Auth's send-verification-email endpoint
    const resendReq = new Request(`${baseUrl}/api/auth/send-verification-email`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ email }),
    });

    const resendRes = await auth.handler(resendReq);
    if (!resendRes.ok) {
      const errorText = await resendRes.text();
      return res.status(resendRes.status).json({ error: errorText });
    }

    res.json({ message: 'Verification email resent' });
  } catch (e: unknown) {
    console.error('[BFF] Error resending verification:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/verify-email - verify email using token from verification link
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Use Better Auth's email verification endpoint
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:38090';
    const requestHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key !== 'content-length' && key !== 'host') {
        requestHeaders[key] = Array.isArray(value) ? value.join(',') : String(value);
      }
    }
    if (!requestHeaders['origin']) requestHeaders['origin'] = baseUrl;
    if (!requestHeaders['content-type']) requestHeaders['content-type'] = 'application/json';

    // Better Auth email verification endpoint
    const verifyReq = new Request(`${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: requestHeaders,
    });

    const verifyRes = await auth.handler(verifyReq);

    if (!verifyRes.ok) {
      const errorText = await verifyRes.text();
      let errorBody: Record<string, unknown> = {};
      try { errorBody = JSON.parse(errorText); } catch { /* ignore */ }
      return res.status(verifyRes.status).json({
        error: (errorBody.message as string) || 'Verification failed',
      });
    }

    const setCookies = verifyRes.headers.getSetCookie?.();
    if (setCookies && setCookies.length > 0) {
      for (const cookie of setCookies) {
        res.appendHeader('Set-Cookie', cookie);
      }
    }

    // Parse the response to get user email
    const responseText = await verifyRes.text();
    let responseData: { user?: { email?: string } } = {};
    try { responseData = JSON.parse(responseText); } catch { /* ignore */ }

    if (responseData.user?.email) {
      const email = responseData.user.email.toLowerCase();
      await prisma.user.update({
        where: { email },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }).catch(() => { /* ignore - user may not exist in Prisma table yet */ });
    }

    res.json({ message: 'Email verified successfully', verified: true });
  } catch (e: unknown) {
    console.error('[BFF] Error verifying email:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================
// Session Helper
// ============================================

/** Extract current session user info from Better Auth via request cookies. */
async function fetchSession(
  req: express.Request,
): Promise<{ id?: string; email?: string; name?: string | null; emailVerified?: boolean } | null> {
  try {
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:38090';
    const url = `${baseUrl}/api/auth/get-session`;

    const requestHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key !== 'content-length' && key !== 'host') {
        requestHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    }
    if (!requestHeaders['origin']) requestHeaders['origin'] = baseUrl;

    const sessionRes = await auth.handler(new Request(url, { headers: requestHeaders }));
    if (!sessionRes.ok) return null;

    const text = await sessionRes.text();
    const data = JSON.parse(text) as {
      user?: { id?: string; email?: string; name?: string | null; emailVerified?: boolean };
    };
    return data.user || null;
  } catch {
    return null;
  }
}

async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = await fetchSession(req);
  if (!session?.email) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email.toLowerCase() },
    select: { role: true, disabled: true },
  });

  if (!user || user.disabled) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Backend entitlement enforcement (PRD-500, ADR-004).
 * Checks user.role against required tier before allowing feature access.
 */
function requireEntitlement(requiredRole: 'PRO' | 'COUNSELOR') {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = await fetchSession(req);
    if (!session?.email) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.email.toLowerCase() },
      select: { role: true, disabled: true },
    });
    if (!user || user.disabled) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
    const tierOrder = ['GUEST', 'FREE', 'PRO', 'COUNSELOR', 'ADMIN'];
    const userIdx = tierOrder.indexOf(user.role);
    const requiredIdx = tierOrder.indexOf(requiredRole);
    if (userIdx < requiredIdx) {
      return res.status(403).json({
        error: 'UPGRADE_REQUIRED',
        currentTier: user.role,
        requiredTier: requiredRole,
      });
    }
    next();
  };
}

// ============================================
// Existing Routes
// ============================================

// Create a map of the 16 static premium universities to preserve their rich hand-crafted metadata
const staticUniMap = new Map(staticUnis.map((u) => [u.id, u]));

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const gradientColors = [
  { bg: 'from-[#1e3a8a] to-[#0f172a]', primary: '#1d4ed8' }, // Classic Deep Blue
  { bg: 'from-[#115e59] to-[#0f172a]', primary: '#0f766e' }, // Dark Teal
  { bg: 'from-[#881337] to-[#0f172a]', primary: '#be123c' }, // Crimson Rose
  { bg: 'from-[#581c87] to-[#0f172a]', primary: '#6d28d9' }, // Indigo Purple
  { bg: 'from-[#78350f] to-[#0f172a]', primary: '#b45309' }, // Warm Amber
  { bg: 'from-[#334155] to-[#0f172a]', primary: '#475569' }, // Modern Slate
];

// Universities dynamic endpoint
app.get('/api/universities', async (req, res) => {
  try {
    const dbUnis = await prisma.university.findMany({
      include: {
        schools: {
          include: {
            customMajors: {
              include: {
                standardMajor: true,
              },
            },
          },
        },
        majorRankings: true,
      },
      orderBy: {
        nameEn: 'asc',
      },
    });

    // Fetch structured IPEDS metrics and program fields in bulk
    const universityIds = dbUnis.map(u => u.id);
    let ipedsMetrics: unknown[] = [];
    let ipedsProgramFields: unknown[] = [];
    if (universityIds.length > 0) {
      ipedsMetrics = await prisma.$queryRawUnsafe(
        `SELECT im."id", im."metricKey", im."universityId", im."valueNumeric", im."valueText",
                im."valueStatus", im."missingReason", im."academicYear",
                md."labelEn", md."labelZh", md."displayFormat", md."unit", md."higherIsBetter"
         FROM "InstitutionMetric" im
         JOIN "MetricDefinition" md ON md."metricKey" = im."metricKey"
         WHERE im."universityId" = ANY($1) AND im."sourceSystem" = 'IPEDS'`,
        universityIds,
      );
      ipedsProgramFields = await prisma.institutionProgramField.findMany({
        where: {
          universityId: { in: universityIds },
          sourceType: 'IPEDS_PROGRAM_FIELD',
          degreeLevel: 'BACHELOR',
        },
        include: {
          cip: { select: { code: true, title: true } },
          standardMajor: { select: { id: true, nameEn: true, nameZh: true } },
        },
        orderBy: [{ displayTitle: 'asc' }],
      });
    }
    // Group by universityId
    const metricsByUni = new Map<string, unknown[]>();
    for (const m of ipedsMetrics as Record<string, unknown>[]) {
      if (m.universityId) {
        if (!metricsByUni.has(m.universityId as string)) metricsByUni.set(m.universityId as string, []);
        metricsByUni.get(m.universityId as string)!.push(m);
      }
    }
    const programsByUni = new Map<string, unknown[]>();
    for (const pf of ipedsProgramFields as Record<string, unknown>[]) {
      if (pf.universityId) {
        if (!programsByUni.has(pf.universityId as string)) programsByUni.set(pf.universityId as string, []);
        programsByUni.get(pf.universityId as string)!.push(pf);
      }
    }

    const formatMetric = (m: Record<string, unknown>) => ({
      key: m.metricKey,
      label: m.labelEn,
      labelZh: m.labelZh,
      value: m.valueNumeric !== null ? m.valueNumeric : m.valueText,
      status: m.valueStatus,
      missingReason: m.missingReason,
      academicYear: m.academicYear,
      displayFormat: m.displayFormat,
      unit: m.unit,
      higherIsBetter: m.higherIsBetter,
    });
    const formatProgram = (pf: Record<string, unknown>) => ({
      id: pf.id,
      displayTitle: pf.displayTitle,
      degreeLevel: pf.degreeLevel,
      standardMajorId: pf.standardMajorId,
      standardMajorName: (pf.standardMajor as Record<string, unknown> | null)?.nameEn || null,
      standardMajorNameZh: (pf.standardMajor as Record<string, unknown> | null)?.nameZh || null,
    });

    const data = dbUnis.map((dbUni) => {
      // 1. If it's one of our 16 static premium universities, preserve all its curated rich styling & schools
      const staticUni = staticUniMap.get(dbUni.id);
      if (staticUni) {
        let countryEn = 'United States';
        let countryZh = '美国';
        if (staticUni.id === 'tsinghua' || staticUni.id === 'peking') {
          countryEn = 'China';
          countryZh = '中国';
        } else if (staticUni.id === 'oxford') {
          countryEn = 'United Kingdom';
          countryZh = '英国';
        } else if (staticUni.id === 'nus') {
          countryEn = 'Singapore';
          countryZh = '新加坡';
        }

        // Map schools and associated custom majors from DB
        const mappedDbSchools = dbUni.schools.map((s) => {
          const majorsList = s.customMajors.map((cm) => {
            const rankings = cm.standardMajorId
              ? dbUni.majorRankings
                  .filter((r) => r.standardMajorId === cm.standardMajorId)
                  .map((r) => ({
                    source: r.source,
                    rankInteger: r.rankInteger,
                    year: r.year,
                    verificationId: r.verificationId
                  }))
              : [];
            return {
              id: cm.customCode || cm.id,
              nameEn: cm.customName,
              nameZh: cm.standardMajor?.nameZh || cm.customName,
              nameZht: cm.standardMajor?.nameZht || cm.standardMajor?.nameZh || cm.customName,
              nationalMajorId: cm.standardMajorId,
              broadFieldId: cm.standardMajor?.broadFieldId || undefined,
              degreeLevel: cm.degreeLevel,
              rankings: rankings.length > 0 ? rankings : undefined,
              sourceUrl: cm.sourceUrl || undefined
            };
          });

          return {
            id: s.id,
            code: s.nameEn.split(' ').map(w => w[0]).join('').toUpperCase() || 'COLL',
            nameEn: s.nameEn,
            nameZh: s.nameZh || s.nameEn,
            subtitleEn: `Undergraduate division of ${dbUni.nameEn}`,
            subtitleZh: `属于 ${dbUni.nameZh || dbUni.nameEn} 的本科生院`,
            descriptionEn: `Offering comprehensive paths and standard major linkages.`,
            descriptionZh: `提供全面的本科专业学习路径与行业对接。`,
            majors: majorsList,
          };
        });

        // Merge DB schools with static curated school details (descriptions, codes, custom categories)
        const mergedSchools = mappedDbSchools.map((dbSchool) => {
          const staticSchool = staticUni.schools.find((ss) => ss.id === dbSchool.id);
          if (staticSchool) {
            // If static school has categories, merge DB majors into categories
            if (staticSchool.categories && staticSchool.categories.length > 0) {
              // Deep clone categories
              const clonedCategories = staticSchool.categories.map(cat => ({
                ...cat,
                majors: [...cat.majors]
              }));

              // Group static majors to check duplicates
              const staticMajorIds = new Set<string>();
              clonedCategories.forEach(cat => {
                cat.majors.forEach(m => {
                  if (m.nationalMajorId) staticMajorIds.add(m.nationalMajorId);
                  staticMajorIds.add(m.id);
                });
              });

              for (const dbMajor of dbSchool.majors) {
                if (staticMajorIds.has(dbMajor.id) || (dbMajor.nationalMajorId && staticMajorIds.has(dbMajor.nationalMajorId))) {
                  continue; // Skip duplicates
                }

                // Determine the best category for dbMajor
                let targetCategory = clonedCategories[0];
                const bId = dbMajor.broadFieldId ? dbMajor.broadFieldId.toLowerCase() : '';

                // Match based on standard broad fields
                if (bId.includes('science') || bId.includes('math') || bId.includes('biology')) {
                  const match = clonedCategories.find(c => c.nameEn.toLowerCase().includes('science') || c.nameEn.toLowerCase().includes('natural'));
                  if (match) targetCategory = match;
                } else if (bId.includes('humanities')) {
                  const match = clonedCategories.find(c => c.nameEn.toLowerCase().includes('human') || c.nameEn.toLowerCase().includes('arts') || c.nameEn.toLowerCase().includes('creative'));
                  if (match) targetCategory = match;
                } else if (bId.includes('social') || bId.includes('economic')) {
                  const match = clonedCategories.find(c => c.nameEn.toLowerCase().includes('social') || c.nameEn.toLowerCase().includes('econ') || c.nameEn.toLowerCase().includes('pol'));
                  if (match) targetCategory = match;
                }

                targetCategory.majors.push({
                  id: dbMajor.id,
                  nameEn: dbMajor.nameEn,
                  nameZh: dbMajor.nameZh,
                  nationalMajorId: dbMajor.nationalMajorId,
                  degreeLevel: dbMajor.degreeLevel || 'BACHELOR',
                  rankings: dbMajor.rankings,
                  sourceUrl: dbMajor.sourceUrl,
                });
              }

              return {
                id: staticSchool.id,
                code: staticSchool.code,
                nameEn: staticSchool.nameEn,
                nameZh: staticSchool.nameZh || dbSchool.nameZh,
                subtitleEn: staticSchool.subtitleEn || dbSchool.subtitleEn,
                subtitleZh: staticSchool.subtitleZh || dbSchool.subtitleZh,
                tagEn: staticSchool.tagEn,
                tagZh: staticSchool.tagZh,
                descriptionEn: staticSchool.descriptionEn || dbSchool.descriptionEn,
                descriptionZh: staticSchool.descriptionZh || dbSchool.descriptionZh,
                categories: clonedCategories,
              };
            }

            // Simple school: merge majors list directly
            const staticMajorIds = new Set<string>();
            const mergedMajors = [...(staticSchool.majors || [])];
            mergedMajors.forEach(m => {
              if (m.nationalMajorId) staticMajorIds.add(m.nationalMajorId);
              staticMajorIds.add(m.id);
            });

            for (const dbMajor of dbSchool.majors) {
              if (staticMajorIds.has(dbMajor.id) || (dbMajor.nationalMajorId && staticMajorIds.has(dbMajor.nationalMajorId))) {
                continue; // Skip duplicates
              }
              mergedMajors.push({
                id: dbMajor.id,
                nameEn: dbMajor.nameEn,
                nameZh: dbMajor.nameZh,
                nationalMajorId: dbMajor.nationalMajorId,
                degreeLevel: dbMajor.degreeLevel || 'BACHELOR',
                rankings: dbMajor.rankings,
                sourceUrl: dbMajor.sourceUrl,
              });
            }

            return {
              id: staticSchool.id,
              code: staticSchool.code,
              nameEn: staticSchool.nameEn,
              nameZh: staticSchool.nameZh || dbSchool.nameZh,
              subtitleEn: staticSchool.subtitleEn || dbSchool.subtitleEn,
              subtitleZh: staticSchool.subtitleZh || dbSchool.subtitleZh,
              tagEn: staticSchool.tagEn,
              tagZh: staticSchool.tagZh,
              descriptionEn: staticSchool.descriptionEn || dbSchool.descriptionEn,
              descriptionZh: staticSchool.descriptionZh || dbSchool.descriptionZh,
              majors: mergedMajors,
            };
          }

          // If school is only in DB, clean broadFieldId and return as is
          const cleanedMajors = dbSchool.majors.map((m) => {
            const { broadFieldId: _, ...rest } = m;
            return rest;
          });
          return {
            ...dbSchool,
            majors: cleanedMajors,
          };
        });

        // Add any schools present statically but missing in DB (if any)
        staticUni.schools.forEach((ss) => {
          if (!mergedSchools.some((ms) => ms.id === ss.id)) {
            mergedSchools.push(ss);
          }
        });

        return {
          ...staticUni,
          nameZh: dbUni.nameZh || staticUni.nameZh,
          nameZht: dbUni.nameZht || dbUni.nameZh || staticUni.nameZh,
          countryEn,
          countryZh,
          schools: mergedSchools,
          // Supplement with any real-time rankings or metrics from DB
          usNewsRank: dbUni.rankingUsNews || staticUni.usNewsRank,
          qsRank: dbUni.rankingQs || staticUni.qsRank,
          averageCost: dbUni.averageCost || undefined,
          gradRate: dbUni.gradRate || undefined,
          medianSalary: dbUni.medianSalary || undefined,
          wikidataId: dbUni.wikidataId || undefined,
          scorecardUnitId: dbUni.scorecardUnitId || undefined,
          majorRankings: dbUni.majorRankings.map((r) => ({
            standardMajorId: r.standardMajorId,
            rankInteger: r.rankInteger,
            year: r.year,
            source: r.source,
            verificationId: r.verificationId
          })),
          ipedsMetrics: (metricsByUni.get(dbUni.id) || []).map(formatMetric),
          ipedsProgramFields: (programsByUni.get(dbUni.id) || []).map(formatProgram),
        };
      }

      // 2. Otherwise, synthesize beautiful fallback styles and properties for DB-only universities
      const hash = hashCode(dbUni.nameEn);
      const colorIndex = Math.abs(hash) % gradientColors.length;
      const colorTheme = gradientColors[colorIndex];

      const isStem = /tech|polytechnic|institute of technology|science|engineering|理工|科技/i.test(dbUni.nameEn);
      const badgeEn = isStem ? 'STEM & Technology Elite' : 'Public Research Flagship';
      const badgeZh = isStem ? '理工科技学府' : '公立研究型旗舰';

      const rankingVal = dbUni.rankingQs || dbUni.rankingUsNews || null;
      const prestigeNumber = rankingVal ? `#${rankingVal}` : 'Unranked';
      const prestigeLabelEn = dbUni.rankingQs ? 'QS World Rank' : 'US News Rank';
      const prestigeLabelZh = dbUni.rankingQs ? 'QS 世界排名' : 'US News 排名';

      // Map schools and associated custom majors from DB
      const mappedSchools = dbUni.schools.map((s) => {
        const majorsList = s.customMajors.map((cm) => {
          const rankings = cm.standardMajorId
            ? dbUni.majorRankings
                .filter((r) => r.standardMajorId === cm.standardMajorId)
                .map((r) => ({
                  source: r.source,
                  rankInteger: r.rankInteger,
                  year: r.year,
                  verificationId: r.verificationId
                }))
            : [];
          return {
            id: cm.customCode || cm.id,
            nameEn: cm.customName,
            nameZh: cm.standardMajor?.nameZh || cm.customName,
            nameZht: cm.standardMajor?.nameZht || cm.standardMajor?.nameZh || cm.customName,
            nationalMajorId: cm.standardMajorId,
            degreeLevel: cm.degreeLevel,
            rankings: rankings.length > 0 ? rankings : undefined,
            sourceUrl: cm.sourceUrl || undefined
          };
        });

        return {
          id: s.id,
          code: s.nameEn.split(' ').map(w => w[0]).join('').toUpperCase() || 'COLL',
          nameEn: s.nameEn,
          nameZh: s.nameZh || s.nameEn,
          subtitleEn: `Undergraduate division of ${dbUni.nameEn}`,
          subtitleZh: `属于 ${dbUni.nameZh || dbUni.nameEn} 的本科生院`,
          descriptionEn: `Offering comprehensive paths and standard major linkages.`,
          descriptionZh: `提供全面的本科专业学习路径与行业对接。`,
          majors: majorsList,
        };
      });

      return {
        id: dbUni.id,
        nameEn: dbUni.nameEn,
        nameZh: dbUni.nameZh || dbUni.nameEn,
        nameZht: dbUni.nameZht || dbUni.nameZh || dbUni.nameEn,
        shortNameEn: dbUni.nameEn.replace(/university/i, '').trim(),
        shortNameZh: (dbUni.nameZh || dbUni.nameEn).replace(/大学/g, '').trim(),
        shortNameZht: (dbUni.nameZht || dbUni.nameZh || dbUni.nameEn).replace(/大學|大学/g, '').trim(),
        locationEn: dbUni.countryEn === 'United States' ? 'United States' : dbUni.countryEn,
        locationZh: dbUni.countryZh || dbUni.countryEn,
        countryEn: dbUni.countryEn,
        countryZh: dbUni.countryZh || dbUni.countryEn,
        badgeEn,
        badgeZh,
        prestigeNumber,
        prestigeLabelEn,
        prestigeLabelZh,
        descriptionEn: `${dbUni.nameEn} is a high-profile research institution offering comprehensive undergraduate academic paths.`,
        descriptionZh: `${dbUni.nameZh || dbUni.nameEn} 是一所享誉全球的高水平学术与科研机构，致力于提供卓越的本科生博雅教育。`,
        keyFactEn: 'Fosters global collaborative pipelines and state-of-the-art career development hubs.',
        keyFactZh: '致力于培养具有全球化视野与卓越专业技能的行业领袖。',
        taglineEn: 'Pioneering educational exploration and academic excellence.',
        taglineZh: '探索卓越教育，启迪未来前沿。',
        bgColor: colorTheme.bg,
        primaryColor: colorTheme.primary,
        schools: mappedSchools,
        usNewsRank: dbUni.rankingUsNews || 999,
        usNewsYear: 2025,
        qsRank: dbUni.rankingQs || 999,
        qsYear: 2025,
        averageCost: dbUni.averageCost || undefined,
        gradRate: dbUni.gradRate || undefined,
        medianSalary: dbUni.medianSalary || undefined,
        wikidataId: dbUni.wikidataId || undefined,
        scorecardUnitId: dbUni.scorecardUnitId || undefined,
        majorRankings: dbUni.majorRankings.map((r) => ({
          standardMajorId: r.standardMajorId,
          rankInteger: r.rankInteger,
          year: r.year,
          source: r.source,
          verificationId: r.verificationId
        })),
        ipedsMetrics: (metricsByUni.get(dbUni.id) || []).map(formatMetric),
        ipedsProgramFields: (programsByUni.get(dbUni.id) || []).map(formatProgram),
      };
    });

    res.json(data);
  } catch (e: unknown) {
    console.error('[BFF] Error fetching universities:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET user profile by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (e: unknown) {
    console.error('[BFF] Error fetching user:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================
// User Settings Endpoints (Session-based)
// ============================================

// GET /api/users/me - get current user profile
app.get('/api/users/me', async (req, res) => {
  try {
    const sessionRes = await fetchSession(req);
    if (!sessionRes) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({
      where: { email: sessionRes.email?.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json(user);
  } catch (e: unknown) {
    console.error('[BFF] Error fetching current user profile:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/users/me - update profile fields
app.patch('/api/users/me', async (req, res) => {
  try {
    const sessionRes = await fetchSession(req);
    if (!sessionRes) return res.status(401).json({ error: 'Not authenticated' });

    const { name, userType, schoolName, gradYear, counselorSpecialty, teacherSubject, customNote } = req.body;

    const parsedGradYear = gradYear !== undefined && gradYear !== null ? parseInt(gradYear, 10) : undefined;
    if (gradYear !== undefined && gradYear !== null && isNaN(parsedGradYear!)) {
      return res.status(400).json({ error: 'gradYear must be a valid number.' });
    }

    const validUserTypes = ['STUDENT', 'TEACHER', 'COUNSELOR', 'PARENT', 'OTHER'];
    if (userType && !validUserTypes.includes(userType)) {
      return res.status(400).json({ error: `Invalid userType. Must be one of: ${validUserTypes.join(', ')}` });
    }

    const user = await prisma.user.update({
      where: { email: sessionRes.email?.toLowerCase() },
      data: {
        ...(name !== undefined && { name }),
        ...(userType !== undefined && { userType }),
        ...(schoolName !== undefined && { schoolName: schoolName || null }),
        ...(parsedGradYear !== undefined && { gradYear: parsedGradYear }),
        ...(counselorSpecialty !== undefined && { counselorSpecialty: counselorSpecialty || null }),
        ...(teacherSubject !== undefined && { teacherSubject: teacherSubject || null }),
        ...(customNote !== undefined && { customNote: customNote || null }),
      },
    });

    res.json(user);
  } catch (e: unknown) {
    console.error('[BFF] Error updating user profile:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/users/me/password - change password
app.patch('/api/users/me/password', async (req, res) => {
  try {
    const sessionRes = await fetchSession(req);
    if (!sessionRes) return res.status(401).json({ error: 'Not authenticated' });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    // Use Better Auth's change-password endpoint via handler
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:38090';
    const requestHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key !== 'content-length' && key !== 'host') {
        requestHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    }
    if (!requestHeaders['origin']) requestHeaders['origin'] = baseUrl;
    if (!requestHeaders['content-type']) requestHeaders['content-type'] = 'application/json';

    const changePwReq = new Request(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const changePwRes = await auth.handler(changePwReq);

    if (!changePwRes.ok) {
      const errorText = await changePwRes.text();
      let errorBody: Record<string, unknown> = {};
      try { errorBody = JSON.parse(errorText); } catch { /* ignore */ }
      return res.status(changePwRes.status).json({
        error: (errorBody.message || errorBody.error || 'Failed to change password.') as string,
      });
    }

    res.json({ message: 'Password changed successfully.' });
  } catch (e: unknown) {
    console.error('[BFF] Error changing password:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/users/me - delete account
app.delete('/api/users/me', async (req, res) => {
  try {
    const sessionRes = await fetchSession(req);
    if (!sessionRes) return res.status(401).json({ error: 'Not authenticated' });

    const email = sessionRes.email?.toLowerCase();

    // Delete Better Auth user (clears session)
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:38090';
    const requestHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key !== 'content-length' && key !== 'host') {
        requestHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    }
    if (!requestHeaders['origin']) requestHeaders['origin'] = baseUrl;

    // Delete the Better Auth user - this invalidates the session
    const deleteUserReq = new Request(`${baseUrl}/api/auth/user/delete`, {
      method: 'DELETE',
      headers: requestHeaders,
    });
    // Try Better Auth deletion, but don't fail if endpoint doesn't exist
    try {
      await auth.handler(deleteUserReq);
    } catch {
      // Better Auth may not have delete-user endpoint; continue with Prisma deletion
    }

    // Delete from Prisma (cascade deletes SavedItems)
    await prisma.user.delete({ where: { email } });

    res.json({ message: 'Account deleted successfully.' });
  } catch (e: unknown) {
    console.error('[BFF] Error deleting account:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/users/me/saved-items - list saved items with joined data
app.get('/api/users/me/saved-items', async (req, res) => {
  try {
    const sessionRes = await fetchSession(req);
    if (!sessionRes) return res.status(401).json({ error: 'Not authenticated' });

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionRes.email?.toLowerCase() },
      select: { id: true },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const savedItems = await prisma.savedItem.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with major/university names
    const enriched = await Promise.all(
      savedItems.map(async (item) => {
        let majorNameEn: string | undefined;
        let majorNameZh: string | undefined;
        let universityNameEn: string | undefined;
        let universityNameZh: string | undefined;

        if (item.itemType === 'MAJOR') {
          const major = await prisma.major.findUnique({
            where: { id: item.itemId },
            select: { nameEn: true, nameZh: true },
          });
          majorNameEn = major?.nameEn;
          majorNameZh = major?.nameZh;
        } else if (item.itemType === 'UNIVERSITY') {
          const uni = await prisma.university.findUnique({
            where: { id: item.itemId },
            select: { nameEn: true, nameZh: true },
          });
          universityNameEn = uni?.nameEn;
          universityNameZh = uni?.nameZh;
        }

        return {
          id: item.id,
          itemType: item.itemType,
          itemId: item.itemId,
          createdAt: item.createdAt.toISOString(),
          majorNameEn,
          majorNameZh,
          universityNameEn,
          universityNameZh,
        };
      }),
    );

    res.json(enriched);
  } catch (e: unknown) {
    console.error('[BFF] Error fetching saved items:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/users/me/saved-items/:id - delete a saved item
app.delete('/api/users/me/saved-items/:id', async (req, res) => {
  try {
    const sessionRes = await fetchSession(req);
    if (!sessionRes) return res.status(401).json({ error: 'Not authenticated' });

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionRes.email?.toLowerCase() },
      select: { id: true },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { id } = req.params;

    const savedItem = await prisma.savedItem.findUnique({ where: { id } });
    if (!savedItem) {
      return res.status(404).json({ error: 'Saved item not found.' });
    }
    if (savedItem.userId !== dbUser.id) {
      return res.status(403).json({ error: 'Not authorized to delete this item.' });
    }

    await prisma.savedItem.delete({ where: { id } });
    res.json({ message: 'Saved item deleted.' });
  } catch (e: unknown) {
    console.error('[BFF] Error deleting saved item:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================
// Deprecated User Endpoints
// ============================================

// POST register/update user profile
// @deprecated - Use /api/auth/sign-up/email for registration with authentication.
// This endpoint is retained for backward compatibility during the transition period.
app.post('/api/users', async (req, res) => {
  try {
    const {
      email,
      name,
      userType,
      schoolName,
      gradYear,
      counselorSpecialty,
      teacherSubject,
      customNote,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const parsedGradYear = gradYear ? parseInt(gradYear, 10) : null;

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name: name || undefined,
        userType: userType || undefined,
        schoolName: schoolName || null,
        gradYear: parsedGradYear || null,
        counselorSpecialty: counselorSpecialty || null,
        teacherSubject: teacherSubject || null,
        customNote: customNote || null,
      },
      create: {
        email: email.toLowerCase(),
        name: name || 'Anonymous',
        userType: userType || 'STUDENT',
        schoolName: schoolName || null,
        gradYear: parsedGradYear || null,
        counselorSpecialty: counselorSpecialty || null,
        teacherSubject: teacherSubject || null,
        customNote: customNote || null,
        role: 'FREE',
        subscriptionStatus: 'none',
      },
    });

    res.json(user);
  } catch (e: unknown) {
    console.error('[BFF] Error creating/updating user:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mount secure API Proxy to FastAPI Python services
app.use('/api/proxy', expressProxyMiddleware);

// ============================================
// IPEDS Public Endpoints (student-facing, no technical provenance)
// ============================================

// GET /api/ipeds/university/:universityId - public metrics and programs for a university
app.get('/api/ipeds/university/:universityId', async (req, res) => {
  try {
    const { universityId } = req.params;
    const metrics = await prisma.institutionMetric.findMany({
      where: { universityId, sourceSystem: 'IPEDS' },
      include: { metricDefinition: true },
      orderBy: [{ metricKey: 'asc' }],
    });
    const programFields = await prisma.institutionProgramField.findMany({
      where: { universityId, sourceType: 'IPEDS_PROGRAM_FIELD', degreeLevel: 'BACHELOR' },
      include: { cip: { select: { code: true, title: true } }, standardMajor: { select: { id: true, nameEn: true, nameZh: true } } },
      orderBy: [{ displayTitle: 'asc' }],
    });
    // Public shape - no sourceTable, sourceVariable, releaseKey, verificationId
    const publicMetrics = metrics.map(m => ({
      key: m.metricKey,
      label: m.metricDefinition?.labelEn || m.metricKey,
      labelZh: m.metricDefinition?.labelZh,
      value: m.valueNumeric !== null ? m.valueNumeric : m.valueText,
      status: m.valueStatus,
      missingReason: m.missingReason,
      academicYear: m.academicYear,
      displayFormat: m.metricDefinition?.displayFormat,
      unit: m.metricDefinition?.unit,
    }));
    const publicPrograms = programFields.map(pf => ({
      id: pf.id,
      displayTitle: pf.displayTitle,
      degreeLevel: pf.degreeLevel,
      standardMajorId: pf.standardMajorId,
      standardMajorName: pf.standardMajor?.nameEn || null,
      standardMajorNameZh: pf.standardMajor?.nameZh || null,
    }));
    res.json({ universityId, metrics: publicMetrics, programFields: publicPrograms });
  } catch (e: unknown) {
    console.error('[BFF] Error fetching public IPEDS data:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================
// IPEDS Admin Endpoints (internal audit surface)
// ============================================

app.use('/api/admin/ipeds', requireAdmin);

// GET /api/admin/ipeds/candidates - list institution candidates with optional filter
app.get('/api/admin/ipeds/candidates', async (req, res) => {
  try {
    const { recommendation, state, limit } = req.query;
    const where: Record<string, unknown> = {};
    if (recommendation) where.recommendation = recommendation;
    if (state) where.state = state;
    const limitNum = Math.min(Number(limit) || 100, 500);
    const candidates = await prisma.$queryRawUnsafe(
      `SELECT id, "unitId", "universityId", "nameEn", "state", "control", "sector", "level",
              "eligibilityScore", "recommendation", "reasons", "warnings", "blockingReasons",
              "policyVersion", "releaseKey", "createdAt", "updatedAt"
       FROM "InstitutionCandidate"
       ORDER BY "eligibilityScore" DESC NULLS LAST
       LIMIT ${limitNum}`
    );
    res.json({ total: candidates.length, candidates });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching candidates:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/ipeds/institution/:unitId - full audit view for one institution
app.get('/api/admin/ipeds/institution/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    // Candidate info
    const candidate = await prisma.institutionCandidate.findUnique({ where: { unitId } });
    if (!candidate) {
      return res.status(404).json({ error: `No candidate found for UNITID ${unitId}` });
    }
    // Metrics
    const metrics = await prisma.institutionMetric.findMany({
      where: { unitId },
      include: { metricDefinition: true },
      orderBy: [{ metricKey: 'asc' }],
    });
    // Program fields
    const programFields = await prisma.institutionProgramField.findMany({
      where: { unitId },
      include: { cip: true, standardMajor: true },
      orderBy: [{ cipCode: 'asc' }],
    });
    // Publish decisions
    const decisions = await prisma.institutionPublishDecision.findMany({
      where: { candidateId: candidate.id },
      include: { university: { select: { id: true, nameEn: true } } },
    });
    // Linked university
    const university = candidate.universityId
      ? await prisma.university.findUnique({ where: { id: candidate.universityId } })
      : null;
    res.json({ candidate, university, metrics, programFields, decisions });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching institution:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/ipeds/metrics/:unitId - metrics for a unit
app.get('/api/admin/ipeds/metrics/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const metrics = await prisma.institutionMetric.findMany({
      where: { unitId },
      include: { metricDefinition: true },
      orderBy: [{ metricKey: 'asc' }],
    });
    res.json({ unitId, metrics });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching metrics:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/ipeds/program-fields/:unitId - program fields for a unit
app.get('/api/admin/ipeds/program-fields/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const programFields = await prisma.institutionProgramField.findMany({
      where: { unitId },
      include: { cip: true, standardMajor: true },
      orderBy: [{ cipCode: 'asc' }],
    });
    res.json({ unitId, programFields });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching program fields:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/ipeds/dictionary - IPEDS metadata dictionary
app.get('/api/admin/ipeds/dictionary', async (req, res) => {
  try {
    const { table, variable } = req.query;
    const whereConditions = ['1=1'];
    const params: string[] = [];
    if (table) {
      whereConditions.push(`table_name = $${params.length + 1}`);
      params.push(table as string);
    }
    if (variable) {
      whereConditions.push(`var_name = $${params.length + 1}`);
      params.push(variable as string);
    }
    const query = `
      SELECT table_name, var_name, code_value, value_label, release_key
      FROM ipeds_meta.value_sets24
      WHERE ${whereConditions.join(' AND ')}
      LIMIT 1000
    `;
    const result = await prisma.$queryRawUnsafe(query, ...params);
    res.json({ dictionary: result });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching dictionary:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/ipeds/release-status - release and import status summary
app.get('/api/admin/ipeds/release-status', async (req, res) => {
  try {
    const rawTableCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::integer FROM information_schema.tables WHERE table_schema = 'ipeds_raw'`
    );
    const metricDefCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::integer FROM "MetricDefinition" WHERE "sourceSystem" = 'IPEDS'`
    );
    const candidateCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::integer FROM "InstitutionCandidate"`
    );
    const metricCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::integer FROM "InstitutionMetric" WHERE "sourceSystem" = 'IPEDS'`
    );
    const programFieldCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::integer FROM "InstitutionProgramField" WHERE "sourceSystem" = 'IPEDS'`
    );
    const cipCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::integer FROM "CipCode"`
    );
    res.json({
      rawTables: rawTableCount,
      metricDefinitions: metricDefCount,
      institutionCandidates: candidateCount,
      institutionMetrics: metricCount,
      programFields: programFieldCount,
      cipCodes: cipCount,
    });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching release status:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================
// Admin User Management Endpoints
// ============================================

// GET /api/admin/users - paginated list with search/filter
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(Math.max(1, parseInt(req.query.pageSize as string, 10) || 20), 100);
    const search = (req.query.search as string)?.trim();
    const role = req.query.role as string | undefined;
    const userType = req.query.userType as string | undefined;
    const emailVerifiedStr = req.query.emailVerified as string | undefined;
    const emailVerified = emailVerifiedStr !== undefined ? emailVerifiedStr === 'true' : undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (userType) where.userType = userType;
    if (emailVerified !== undefined) where.emailVerified = emailVerified;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          userType: true,
          emailVerified: true,
          emailVerifiedAt: true,
          disabled: true,
          lastLoginAt: true,
          createdAt: true,
          subscriptionStatus: true,
          subscriptionEndsAt: true,
          schoolName: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, pageSize });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching users:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/users/:id - single user details
app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching user:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/admin/users/:id/role - change role
app.patch('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const validRoles = ['GUEST', 'FREE', 'PRO', 'ADMIN'];
    const { role } = req.body as { role?: string };
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
    res.json(user);
  } catch (e: unknown) {
    console.error('[BFF Admin] Error updating role:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/admin/users/:id/disable - toggle disabled
app.patch('/api/admin/users/:id/disable', requireAdmin, async (req, res) => {
  try {
    const { disabled } = req.body as { disabled?: boolean };
    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ error: 'disabled must be a boolean' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { disabled },
      select: { id: true, email: true, disabled: true },
    });

    // If disabling, revoke all Better Auth sessions for this user
    if (disabled) {
      await prisma.$queryRawUnsafe(
        `DELETE FROM "session" WHERE "userId" IN (SELECT "id" FROM "user" WHERE "email" = $1)`,
        user.email.toLowerCase(),
      );
    }

    res.json(user);
  } catch (e: unknown) {
    console.error('[BFF Admin] Error toggling disabled:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/admin/users/:id/reset-password - admin password reset
app.post('/api/admin/users/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body as { newPassword?: string };
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get the Prisma user to find their email
    const prismaUser = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { email: true },
    });
    if (!prismaUser) return res.status(404).json({ error: 'User not found' });

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the Better Auth credential account password directly.
    await prisma.$queryRawUnsafe(
      `UPDATE "account"
       SET "password" = $1, "updatedAt" = NOW()
       WHERE "providerId" = 'credential'
         AND "userId" = (SELECT "id" FROM "user" WHERE "email" = $2)`,
      passwordHash,
      prismaUser.email.toLowerCase(),
    );

    // Revoke all sessions for this user
    await prisma.$queryRawUnsafe(
      `DELETE FROM "session" WHERE "userId" IN (SELECT "id" FROM "user" WHERE "email" = $1)`,
      prismaUser.email.toLowerCase(),
    );

    res.json({ message: 'Password reset successfully', email: prismaUser.email });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error resetting password:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================
// Admin Subscription Management Endpoints
// ============================================

// PATCH /api/admin/users/:id/subscription - update subscription status and/or endsAt
app.patch('/api/admin/users/:id/subscription', requireAdmin, async (req, res) => {
  try {
    const session = await fetchSession(req);
    const adminEmail = session?.email || 'unknown';

    const { subscriptionStatus, subscriptionEndsAt, reason } = req.body as {
      subscriptionStatus?: string;
      subscriptionEndsAt?: string;
      reason?: string;
    };

    const validStatuses = ['active', 'trialing', 'canceled', 'none'];
    if (subscriptionStatus !== undefined && !validStatuses.includes(subscriptionStatus)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    if (subscriptionEndsAt !== undefined) {
      const date = new Date(subscriptionEndsAt);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid subscriptionEndsAt date' });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, subscriptionStatus: true, subscriptionEndsAt: true, email: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData: Record<string, unknown> = {};
    const historyEntries: { field: string; oldValue: string | null; newValue: string | null }[] = [];

    if (subscriptionStatus !== undefined && subscriptionStatus !== user.subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
      historyEntries.push({
        field: 'subscriptionStatus',
        oldValue: user.subscriptionStatus,
        newValue: subscriptionStatus,
      });
    }

    if (subscriptionEndsAt !== undefined) {
      const newEndsAt = subscriptionEndsAt ? new Date(subscriptionEndsAt) : null;
      const oldEndsAt = user.subscriptionEndsAt ? user.subscriptionEndsAt.toISOString() : null;
      const newEndsAtStr = newEndsAt ? newEndsAt.toISOString() : null;
      if (oldEndsAt !== newEndsAtStr) {
        updateData.subscriptionEndsAt = newEndsAt;
        historyEntries.push({
          field: 'subscriptionEndsAt',
          oldValue: oldEndsAt,
          newValue: newEndsAtStr,
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ user, message: 'No changes detected' });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: req.params.id },
        data: updateData,
      });
      await tx.subscriptionHistory.createMany({
        data: historyEntries.map((h) => ({
          userId: req.params.id,
          changedBy: adminEmail,
          field: h.field,
          oldValue: h.oldValue,
          newValue: h.newValue,
          reason: reason || null,
        })),
      });
      return updated;
    });

    res.json({ user: updatedUser });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error updating subscription:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/admin/users/:id/trial - grant 14-day trial
app.post('/api/admin/users/:id/trial', requireAdmin, async (req, res) => {
  try {
    const session = await fetchSession(req);
    const adminEmail = session?.email || 'unknown';
    const { reason } = req.body as { reason?: string };

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, subscriptionStatus: true, subscriptionEndsAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const historyEntries: { field: string; oldValue: string | null; newValue: string | null }[] = [];

    if (user.subscriptionStatus !== 'trialing') {
      historyEntries.push({
        field: 'subscriptionStatus',
        oldValue: user.subscriptionStatus,
        newValue: 'trialing',
      });
    }

    const oldEndsAt = user.subscriptionEndsAt ? user.subscriptionEndsAt.toISOString() : null;
    const newEndsAtStr = trialEndsAt.toISOString();
    if (oldEndsAt !== newEndsAtStr) {
      historyEntries.push({
        field: 'subscriptionEndsAt',
        oldValue: oldEndsAt,
        newValue: newEndsAtStr,
      });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: req.params.id },
        data: {
          subscriptionStatus: 'trialing',
          subscriptionEndsAt: trialEndsAt,
        },
      });
      if (historyEntries.length > 0) {
        await tx.subscriptionHistory.createMany({
          data: historyEntries.map((h) => ({
            userId: req.params.id,
            changedBy: adminEmail,
            field: h.field,
            oldValue: h.oldValue,
            newValue: h.newValue,
            reason: reason || 'Admin granted 14-day trial',
          })),
        });
      }
      return updated;
    });

    res.json({ user: updatedUser, message: '14-day trial granted' });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error granting trial:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/users/:id/subscription-history - list subscription changes
app.get('/api/admin/users/:id/subscription-history', requireAdmin, async (req, res) => {
  try {
    const history = await prisma.subscriptionHistory.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ history });
  } catch (e: unknown) {
    console.error('[BFF Admin] Error fetching subscription history:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

import crypto from 'crypto';
import { z } from 'zod';

// ============================================
// MVP: Counselor Workspace Routes
// ============================================

/** Middleware: require authenticated session */
async function requireSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = await fetchSession(req);
  if (!session?.email) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.email.toLowerCase() },
    select: { id: true, email: true, name: true, role: true, userType: true, subscriptionStatus: true },
  });
  if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });
  (req as express.Request & { user: typeof user }).user = user;
  next();
}

/** Middleware: require counselor role */
function requireCounselor(req: express.Request, res: express.Response, next: express.NextFunction) {
  const r = req as express.Request & { user?: { userType: string } };
  if (r.user?.userType !== 'COUNSELOR') {
    return res.status(403).json({ error: 'COUNSELOR_ACCESS_REQUIRED' });
  }
  next();
}

/** Middleware: require student role */
function requireStudent(req: express.Request, res: express.Response, next: express.NextFunction) {
  const r = req as express.Request & { user?: { userType: string } };
  if (r.user?.userType !== 'STUDENT') {
    return res.status(403).json({ error: 'STUDENT_ACCESS_REQUIRED' });
  }
  next();
}

// ─── Counselor: Invite Student ───

const inviteStudentSchema = z.object({
  email: z.string().email(),
});

app.post('/api/counselor/invite', requireSession, requireCounselor, async (req, res) => {
  try {
    const parse = inviteStudentSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.errors });
    }

    const { user } = req as express.Request & { user: { id: string } };
    const { email } = parse.data;

    // Ensure counselor has an invite code
    let counselor = await prisma.user.findUnique({ where: { id: user.id }, select: { counselorInviteCode: true } });
    if (!counselor?.counselorInviteCode) {
      const code = crypto.randomBytes(6).toString('hex');
      await prisma.user.update({ where: { id: user.id }, data: { counselorInviteCode: code } });
      counselor = { counselorInviteCode: code };
    }

    // Create StudentWorkspace + invite token
    const inviteToken = crypto.randomBytes(16).toString('hex');
    const workspace = await prisma.studentWorkspace.create({
      data: {
        counselorId: user.id,
        inviteEmail: email.toLowerCase(),
        inviteToken,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:38030';
    const inviteLink = `${frontendUrl}/join?token=${inviteToken}`;

    // Send invite email
    const counselorUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
<tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 24px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">CollegeFlow</h1>
<p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Counselor-Invited Student Workspace</p>
</td></tr>
<tr><td style="padding:40px 32px;">
<h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:700;">You've been invited!</h2>
<p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
Your counselor${counselorUser?.name ? ` (${counselorUser.name})` : ''} has invited you to CollegeFlow. Click below to accept the invite and set up your student workspace.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
<tr><td style="border-radius:12px;background:linear-gradient(135deg,#2563eb,#1d4ed8);">
<a href="${inviteLink}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:12px;">Accept Invite</a>
</td></tr></table>
<p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">Or copy this link: ${inviteLink}</p>
</td></tr>
<tr><td style="padding:24px 32px;background-color:#f1f5f9;text-align:center;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:11px;">CollegeFlow &copy; 2026. All rights reserved.</p>
</td></tr>
</table></td></tr></table></body></html>`.trim();

    if (!emailIsDevMode) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@collegeflow.edu',
        to: email.toLowerCase(),
        subject: 'You have been invited to CollegeFlow',
        html,
        text: `Your counselor has invited you to CollegeFlow. Accept here: ${inviteLink}`,
      });
    } else {
      console.log(`[Email] ===== DEV MODE: Counselor invite email for ${email} =====`);
      console.log(`[Email] Invite link: ${inviteLink}`);
      console.log(`[Email] =====================================================`);
    }

    res.json({
      workspaceId: workspace.id,
      inviteToken,
      inviteLink,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error inviting student:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Counselor: List Students ───

app.get('/api/counselor/students', requireSession, requireCounselor, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };

    const workspaces = await prisma.studentWorkspace.findMany({
      where: { counselorId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        inviteEmail: true,
        inviteAccepted: true,
        createdAt: true,
        student: { select: { name: true, email: true } },
        decisionProfile: { select: { updatedAt: true, gpa: true, satScore: true, actScore: true } },
        comparisonSessions: { select: { id: true, name: true, createdAt: true } },
      },
    });

    const students = workspaces.map((w) => ({
      workspaceId: w.id,
      email: w.inviteEmail,
      inviteAccepted: w.inviteAccepted,
      profileComplete: w.decisionProfile !== null && w.decisionProfile.gpa !== null,
      lastComparisonAt: w.comparisonSessions.length > 0
        ? w.comparisonSessions[w.comparisonSessions.length - 1].createdAt
        : null,
    }));

    res.json({ students });
  } catch (e: unknown) {
    console.error('[BFF] Error listing students:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Student: Accept Invite ───

app.get('/api/student/invite/:token', async (req, res) => {
  try {
    const workspace = await prisma.studentWorkspace.findUnique({
      where: { inviteToken: req.params.token },
      include: { counselor: { select: { name: true, email: true, counselorSpecialty: true } } },
    });

    if (!workspace) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    res.json({
      workspaceId: workspace.id,
      inviteAccepted: workspace.inviteAccepted,
      counselorName: workspace.counselor.name,
      counselorEmail: workspace.counselor.email,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error checking invite:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/student/invite/:token/accept', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string; userType: string } };

    const workspace = await prisma.studentWorkspace.findUnique({
      where: { inviteToken: req.params.token },
    });

    if (!workspace) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (workspace.inviteAccepted) {
      return res.status(400).json({ error: 'INVITE_ALREADY_ACCEPTED' });
    }

    await prisma.studentWorkspace.update({
      where: { id: workspace.id },
      data: {
        studentId: user.id,
        inviteAccepted: true,
      },
    });

    // Update user type to student if not already
    if (user.userType !== 'STUDENT') {
      await prisma.user.update({ where: { id: user.id }, data: { userType: 'STUDENT' } });
    }

    res.json({ workspaceId: workspace.id, accepted: true });
  } catch (e: unknown) {
    console.error('[BFF] Error accepting invite:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Student: Decision Profile ───

const profileWeightSchema = z.object({
  salary: z.number().min(0).max(1).optional(),
  prestige: z.number().min(0).max(1).optional(),
  cost: z.number().min(0).max(1).optional(),
  fit: z.number().min(0).max(1).optional(),
});

const updateProfileSchema = z.object({
  gpa: z.number().min(0).max(4.0).optional(),
  satScore: z.number().min(400).max(1600).optional(),
  actScore: z.number().min(1).max(36).optional(),
  annualBudgetMin: z.number().int().positive().optional(),
  annualBudgetMax: z.number().int().positive().optional(),
  interestAreas: z.array(z.string()).optional(),
  weights: profileWeightSchema.optional(),
});

app.get('/api/student/profile', requireSession, requireStudent, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };

    // Find workspace for this student
    const workspace = await prisma.studentWorkspace.findFirst({
      where: { studentId: user.id },
      select: { id: true },
    });

    if (!workspace) {
      return res.json({ profile: null, completeness: 0 });
    }

    const profile = await prisma.decisionProfile.findUnique({
      where: { workspaceId: workspace.id },
      include: { weights: true },
    });

    if (!profile) {
      return res.json({ profile: null, completeness: 0 });
    }

    let completeness = 0;
    if (profile.gpa) completeness += 25;
    if (profile.annualBudgetMin != null) completeness += 25;
    if (profile.interestAreas) completeness += 25;
    if (profile.weights) completeness += 25;

    const weights = profile.weights
      ? {
          salary: profile.weights.salaryWeight,
          prestige: profile.weights.prestigeWeight,
          cost: profile.weights.costWeight,
          fit: profile.weights.fitWeight,
        }
      : undefined;

    res.json({
      profile: {
        gpa: profile.gpa,
        satScore: profile.satScore,
        actScore: profile.actScore,
        annualBudgetMin: profile.annualBudgetMin,
        annualBudgetMax: profile.annualBudgetMax,
        interestAreas: profile.interestAreas,
        weights,
      },
      completeness,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error fetching profile:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/student/profile', requireSession, requireStudent, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };
    const parse = updateProfileSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.errors });
    }

    const data = parse.data;

    // Validate weights sum if provided
    if (data.weights) {
      const sum = (data.weights.salary ?? 0) + (data.weights.prestige ?? 0) + (data.weights.cost ?? 0) + (data.weights.fit ?? 0);
      if (Math.abs(sum - 1.0) > 0.01 && sum > 0) {
        // Normalize weights
        data.weights.salary = (data.weights.salary ?? 0) / sum;
        data.weights.prestige = (data.weights.prestige ?? 0) / sum;
        data.weights.cost = (data.weights.cost ?? 0) / sum;
        data.weights.fit = (data.weights.fit ?? 0) / sum;
      }
    }

    const workspace = await prisma.studentWorkspace.findFirst({
      where: { studentId: user.id },
      select: { id: true },
    });

    if (!workspace) {
      return res.status(404).json({ error: 'NO_WORKSPACE' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.decisionProfile.upsert({
        where: { workspaceId: workspace.id },
        create: {
          workspaceId: workspace.id,
          gpa: data.gpa,
          satScore: data.satScore,
          actScore: data.actScore,
          annualBudgetMin: data.annualBudgetMin,
          annualBudgetMax: data.annualBudgetMax,
          interestAreas: data.interestAreas ? JSON.parse(JSON.stringify(data.interestAreas)) : undefined,
        },
        update: {
          ...(data.gpa !== undefined && { gpa: data.gpa }),
          ...(data.satScore !== undefined && { satScore: data.satScore }),
          ...(data.actScore !== undefined && { actScore: data.actScore }),
          ...(data.annualBudgetMin !== undefined && { annualBudgetMin: data.annualBudgetMin }),
          ...(data.annualBudgetMax !== undefined && { annualBudgetMax: data.annualBudgetMax }),
          ...(data.interestAreas !== undefined && { interestAreas: JSON.parse(JSON.stringify(data.interestAreas)) }),
        },
      });

      if (data.weights) {
        await tx.profileWeight.upsert({
          where: { profileId: profile.id },
          create: {
            profileId: profile.id,
            salaryWeight: data.weights.salary ?? 0.25,
            prestigeWeight: data.weights.prestige ?? 0.25,
            costWeight: data.weights.cost ?? 0.25,
            fitWeight: data.weights.fit ?? 0.25,
          },
          update: {
            ...(data.weights.salary !== undefined && { salaryWeight: data.weights.salary }),
            ...(data.weights.prestige !== undefined && { prestigeWeight: data.weights.prestige }),
            ...(data.weights.cost !== undefined && { costWeight: data.weights.cost }),
            ...(data.weights.fit !== undefined && { fitWeight: data.weights.fit }),
          },
        });
      }

      return profile;
    });

    res.json({ profile: result, updated: true });
  } catch (e: unknown) {
    console.error('[BFF] Error updating profile:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Comparison Engine ───

const createComparisonSchema = z.object({
  name: z.string().min(1).max(100),
  options: z.array(z.object({
    universityId: z.string(),
    majorId: z.string().optional(),
  })).min(2).max(4),
});

function getTierLimits(role: string) {
  const limits: Record<string, { maxComparisonOptions: number }> = {
    FREE: { maxComparisonOptions: 1 },
    PRO: { maxComparisonOptions: 4 },
    COUNSELOR: { maxComparisonOptions: 4 },
  };
  return limits[role] ?? limits.FREE;
}

app.post('/api/comparison', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string; role: string; userType: string } };
    const parse = createComparisonSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.errors });
    }

    const { name, options } = parse.data;
    const limits = getTierLimits(user.role);

    // Find workspace
    let workspaceId: string;
    if (user.userType === 'COUNSELOR') {
      // Counselors don't have workspaces; comparisons are per-student
      return res.status(400).json({ error: 'COMPARISON_NOT_FOR_COUNSELOR' });
    }

    const workspace = await prisma.studentWorkspace.findFirst({
      where: { studentId: user.id },
      select: { id: true },
    });

    if (!workspace) {
      return res.status(404).json({ error: 'NO_WORKSPACE' });
    }
    workspaceId = workspace.id;

    // Check entitlement: free tier can only have 1 active comparison
    if (user.role === 'FREE') {
      const existingCount = await prisma.comparisonSession.count({
        where: { workspaceId },
      });
      if (existingCount >= limits.maxComparisonOptions) {
        return res.status(422).json({
          error: 'COMPARISON_LIMIT',
          max: limits.maxComparisonOptions,
          current: existingCount,
        });
      }
    }

    // Verify all university IDs exist
    const unis = await prisma.university.findMany({
      where: { id: { in: options.map(o => o.universityId) } },
      select: { id: true },
    });
    if (unis.length !== options.length) {
      return res.status(400).json({ error: 'INVALID_UNIVERSITY_ID' });
    }

    const session = await prisma.comparisonSession.create({
      data: {
        workspaceId,
        name,
        options: {
          create: options.map((o, i) => ({
            universityId: o.universityId,
            majorId: o.majorId || null,
            sortOrder: i,
          })),
        },
      },
      include: { options: true },
    });

    res.json({ sessionId: session.id, created: true });
  } catch (e: unknown) {
    console.error('[BFF] Error creating comparison:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/comparison/:sessionId', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };

    const session = await prisma.comparisonSession.findUnique({
      where: { id: req.params.sessionId },
      include: {
        options: {
          include: {
            university: { select: { id: true, nameEn: true, nameZh: true } },
          },
        },
        workspace: { select: { studentId: true } },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    // Verify workspace ownership
    if (session.workspace.studentId !== user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Fetch profile for fit scoring
    const profile = await prisma.decisionProfile.findUnique({
      where: { workspaceId: session.workspaceId },
      include: { weights: true },
    });

    // Build comparison result with 4 lenses
    const optionResults = await Promise.all(
      session.options.map(async (opt) => {
        // Fetch institution metrics
        const metrics = await prisma.institutionMetric.findMany({
          where: { universityId: opt.universityId },
          include: { metricDefinition: true },
        });

        const metricMap = new Map<string, { valueNumeric: number | null; valueStatus: string }>();
        for (const m of metrics) {
          metricMap.set(m.metricKey, { valueNumeric: m.valueNumeric, valueStatus: m.valueStatus });
        }

        const getVal = (key: string) => {
          const m = metricMap.get(key);
          return m ? m.valueNumeric : null;
        };
        const getStatus = (key: string) => {
          const m = metricMap.get(key);
          return m ? m.valueStatus : 'NOT_IN_UNIVERSE';
        };

        const hasValue = (val: number | null) => val !== null && val > 0;
        const confidence = (keys: string[]) => {
          const filled = keys.filter(k => hasValue(getVal(k))).length;
          if (filled === keys.length) return 'verified';
          if (filled > 0) return 'stale';
          return 'missing';
        };

        // Admissions lens
        const admissions = {
          acceptanceRate: getVal('ACCEPT_RATE'),
          medianGpa: getVal('MEDIAN_GPA_X100') ? getVal('MEDIAN_GPA_X100')! / 100 : null,
          sat25th: getVal('SAT_25TH'),
          sat75th: getVal('SAT_75TH'),
          act25th: getVal('ACT_25TH'),
          act75th: getVal('ACT_75TH'),
          confidence: confidence(['ACCEPT_RATE', 'SAT_25TH', 'SAT_75TH']),
        };

        // Outcomes lens
        const outcomes = {
          medianSalary2yr: getVal('MEDIAN_EARNINGS_2YR'),
          medianDebt: getVal('MEDIAN_DEBT'),
          gradRate: getVal('GRAD_RATE'),
          confidence: confidence(['MEDIAN_EARNINGS_2YR', 'MEDIAN_DEBT', 'GRAD_RATE']),
        };

        // Cost lens
        const tuitionInState = getVal('TUITION_IN_STATE');
        const tuitionOutState = getVal('TUITION_OUT_STATE');
        const roomBoard = getVal('ROOM_BOARD');
        const totalCost = hasValue(tuitionOutState) && hasValue(roomBoard)
          ? (tuitionOutState ?? 0) + (roomBoard ?? 0)
          : (hasValue(tuitionOutState) ? tuitionOutState : (hasValue(roomBoard) ? roomBoard : null));

        const cost = {
          tuitionInState,
          tuitionOutState,
          roomBoard,
          totalCost,
          confidence: confidence(['TUITION_OUT_STATE', 'ROOM_BOARD']),
        };

        // Fit lens (rule-based scoring)
        let fitScore = 0;
        let academicScore = 0;
        let financialScore = 0;
        let interestScore = 0;
        const explanation: string[] = [];

        if (profile) {
          // Academic fit: GPA distance from median
          if (profile.gpa && hasValue(getVal('MEDIAN_GPA_X100'))) {
            const medianGpa = getVal('MEDIAN_GPA_X100')! / 100;
            const diff = Math.abs(profile.gpa - medianGpa);
            academicScore = diff < 0.2 ? 100 : diff < 0.5 ? 70 : diff < 1.0 ? 40 : 20;
            if (profile.gpa >= medianGpa) {
              explanation.push('GPA above school median');
            } else {
              explanation.push('GPA below school median');
            }
          }

          // Financial fit: budget match
          if (profile.annualBudgetMin != null && profile.annualBudgetMax != null && totalCost) {
            if (totalCost >= profile.annualBudgetMin && totalCost <= profile.annualBudgetMax) {
              financialScore = 100;
              explanation.push('Total cost within budget');
            } else if (totalCost < profile.annualBudgetMin) {
              financialScore = 80;
              explanation.push('Total cost below budget range');
            } else {
              financialScore = 30;
              explanation.push('Total cost exceeds budget');
            }
          }

          // Interest fit
          if (profile.interestAreas && Array.isArray(profile.interestAreas)) {
            const areas = profile.interestAreas as string[];
            // Check if the university offers programs in the interest areas
            const programs = await prisma.institutionProgramField.findMany({
              where: { universityId: opt.universityId, degreeLevel: 'BACHELOR' },
              include: { standardMajor: { select: { id: true, broadFieldId: true } } },
            });
            const broadFields = new Set(programs.map(p => p.standardMajor?.broadFieldId).filter(Boolean));
            const overlap = areas.filter(a => broadFields.has(a)).length;
            interestScore = areas.length > 0 ? Math.round((overlap / areas.length) * 100) : 0;
            if (overlap > 0) {
              explanation.push(`${overlap} interest area(s) matched`);
            }
          }

          const w = profile.weights;
          const salaryW = w?.salaryWeight ?? 0.25;
          const prestigeW = w?.prestigeWeight ?? 0.25;
          const costW = w?.costWeight ?? 0.25;
          const fitW = w?.fitWeight ?? 0.25;

          fitScore = Math.round(
            academicScore * 0.3 + financialScore * 0.3 + interestScore * 0.2 +
            (hasValue(getVal('GRAD_RATE')) ? getVal('GRAD_RATE')! : 50) * 0.2
          );
        }

        const fit = {
          overallScore: fitScore,
          breakdown: { academic: academicScore, financial: financialScore, interest: interestScore },
          explanation: explanation.join('. ') || 'Insufficient profile data for fit scoring',
        };

        return {
          universityId: opt.universityId,
          universityName: opt.university.nameEn,
          majorName: null,
          lenses: { admissions, outcomes, cost, fit },
        };
      })
    );

    // Detect trade-offs
    const tradeoffs: Array<{ description: string; options: string[] }> = [];
    if (optionResults.length >= 2) {
      const costs = optionResults.map(o => o.lenses.cost.totalCost).filter((v): v is number => v !== null);
      const salaries = optionResults.map(o => o.lenses.outcomes.medianSalary2yr).filter((v): v is number => v !== null);

      if (costs.length >= 2 && Math.max(...costs) - Math.min(...costs) > 10000) {
        tradeoffs.push({
          description: 'Significant cost difference between options ($10K+)',
          options: optionResults.filter(o => o.lenses.cost.totalCost !== null).map(o => o.universityName),
        });
      }
      if (salaries.length >= 2 && Math.max(...salaries) - Math.min(...salaries) > 10000) {
        tradeoffs.push({
          description: 'Significant salary outcome difference ($10K+)',
          options: optionResults.filter(o => o.lenses.outcomes.medianSalary2yr !== null).map(o => o.universityName),
        });
      }
    }

    res.json({
      sessionId: session.id,
      name: session.name,
      options: optionResults,
      tradeoffs,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error fetching comparison:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/comparison/list', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };

    const workspace = await prisma.studentWorkspace.findFirst({
      where: { studentId: user.id },
      select: { id: true },
    });

    if (!workspace) {
      return res.json({ sessions: [] });
    }

    const sessions = await prisma.comparisonSession.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ sessions });
  } catch (e: unknown) {
    console.error('[BFF] Error listing comparisons:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Report Generation ───

app.get('/api/report/list', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };

    const reports = await prisma.reportGeneration.findMany({
      where: { generatedBy: user.id },
      include: {
        session: { select: { name: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    res.json({
      reports: reports.map(r => ({
        id: r.id,
        sessionName: r.session.name,
        pdfUrl: r.pdfUrl,
        generatedAt: r.generatedAt,
      })),
    });
  } catch (e: unknown) {
    console.error('[BFF] Error listing reports:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Counselor Notes ───

const createNoteSchema = z.object({
  workspaceId: z.string(),
  noteType: z.enum(['essay', 'interview', 'financial', 'strategy', 'other']).optional(),
  content: z.string().min(1),
  isShared: z.boolean().optional(),
});

app.post('/api/counselor/note', requireSession, requireCounselor, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };
    const parse = createNoteSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.errors });
    }

    const { workspaceId, noteType, content, isShared } = parse.data;

    // Verify workspace belongs to counselor
    const workspace = await prisma.studentWorkspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.counselorId !== user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const note = await prisma.counselorNote.create({
      data: {
        workspaceId,
        counselorId: user.id,
        noteType: noteType || 'other',
        content,
        isShared: isShared ?? false,
      },
    });

    res.json({ note, created: true });
  } catch (e: unknown) {
    console.error('[BFF] Error creating note:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/counselor/notes/:workspaceId', requireSession, requireCounselor, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };

    const workspace = await prisma.studentWorkspace.findUnique({
      where: { id: req.params.workspaceId },
    });

    if (!workspace || workspace.counselorId !== user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const notes = await prisma.counselorNote.findMany({
      where: { workspaceId: req.params.workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ notes });
  } catch (e: unknown) {
    console.error('[BFF] Error listing notes:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Student: Get Workspace Info ───

app.get('/api/student/workspace', requireSession, requireStudent, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };

    const workspace = await prisma.studentWorkspace.findFirst({
      where: { studentId: user.id },
      include: {
        counselor: { select: { name: true, email: true, counselorSpecialty: true } },
      },
    });

    if (!workspace) {
      return res.json({ workspace: null });
    }

    res.json({
      workspace: {
        id: workspace.id,
        counselorName: workspace.counselor.name,
        counselorEmail: workspace.counselor.email,
        counselorSpecialty: workspace.counselor.counselorSpecialty,
        inviteAccepted: workspace.inviteAccepted,
        createdAt: workspace.createdAt,
      },
    });
  } catch (e: unknown) {
    console.error('[BFF] Error fetching workspace:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Student: Create Personal Workspace ───

app.post('/api/student/workspace/create', requireSession, requireStudent, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string; email: string } };

    const existing = await prisma.studentWorkspace.findFirst({ where: { studentId: user.id } });
    if (existing) {
      return res.json({ workspaceId: existing.id, alreadyExists: true });
    }

    const workspace = await prisma.studentWorkspace.create({
      data: {
        counselorId: user.id,
        studentId: user.id,
        inviteEmail: user.email.toLowerCase(),
        inviteToken: crypto.randomBytes(16).toString('hex'),
        inviteAccepted: true,
      },
    });

    res.json({ workspaceId: workspace.id, created: true });
  } catch (e: unknown) {
    console.error('[BFF] Error creating personal workspace:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Stripe: Webhook ───

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  try {
    await handleWebhookEvent(req.body, sig);
    res.json({ received: true });
  } catch (err: unknown) {
    console.error('[BFF] Stripe webhook error:', err);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

// ─── Stripe: Checkout Session ───

app.post('/api/subscription/checkout', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string; email: string } };
    const { planType } = req.body;
    if (!['pro', 'counselor'].includes(planType)) {
      return res.status(400).json({ error: 'INVALID_PLAN' });
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:38030';
    const checkoutUrl = await createCheckoutSession(
      user.id,
      user.email,
      planType as 'pro' | 'counselor',
      `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${frontendUrl}/subscription/cancel`,
    );
    res.json({ checkoutUrl });
  } catch (e: unknown) {
    console.error('[BFF] Error creating checkout session:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Stripe: Billing Portal ───

app.post('/api/subscription/manage', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };
    const sub = await prisma.stripeSubscription.findUnique({ where: { userId: user.id } });
    if (!sub?.stripeCustomerId) {
      return res.status(404).json({ error: 'NO_SUBSCRIPTION' });
    }
    const manageUrl = await createBillingPortalSession(sub.stripeCustomerId);
    res.json({ manageUrl });
  } catch (e: unknown) {
    console.error('[BFF] Error creating billing portal session:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Stripe: Subscription Status ───

app.get('/api/subscription/status', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };
    const sub = await prisma.stripeSubscription.findUnique({ where: { userId: user.id } });
    res.json({
      status: sub?.status || 'none',
      planType: sub?.planType || null,
      currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() || null,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error fetching subscription status:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Report: Generate PDF ───

app.post('/api/report/generate', requireSession, requireEntitlement('PRO'), async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string; role: string } };
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'SESSION_ID_REQUIRED' });
    }

    const session = await prisma.comparisonSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    const pdfBuffer = await generateComparisonPdf(sessionId, prisma);
    const reportsDir = path.join(__dirname, '../reports');
    await fs.mkdir(reportsDir, { recursive: true });
    const pdfPath = path.join(reportsDir, `${sessionId}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);

    const report = await prisma.reportGeneration.upsert({
      where: { sessionId_generatedBy: { sessionId, generatedBy: user.id } },
      create: { sessionId, generatedBy: user.id, pdfUrl: `/api/report/${sessionId}/download` },
      update: { pdfUrl: `/api/report/${sessionId}/download`, generatedAt: new Date() },
    });

    res.json({
      reportId: report.id,
      pdfUrl: report.pdfUrl,
      generatedAt: report.generatedAt,
    });
  } catch (e: unknown) {
    console.error('[BFF] Error generating report:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── Report: Download PDF ───

app.get('/api/report/:reportId/download', requireSession, async (req, res) => {
  try {
    const { user } = req as express.Request & { user: { id: string } };
    const report = await prisma.reportGeneration.findUnique({
      where: { id: req.params.reportId },
      include: { session: { include: { workspace: true } } },
    });
    if (!report) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    if (report.generatedBy !== user.id && report.session.workspace.studentId !== user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    if (!/^[0-9a-f-]{36}$/.test(report.sessionId)) {
      return res.status(400).json({ error: 'INVALID_SESSION_ID' });
    }
    const pdfPath = path.join(__dirname, '../reports', `${report.sessionId}.pdf`);
    try {
      await fs.access(pdfPath);
    } catch {
      return res.status(404).json({ error: 'PDF_NOT_FOUND' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CollegeFlow-${report.sessionId}.pdf"`);
    res.sendFile(pdfPath);
  } catch (e: unknown) {
    console.error('[BFF] Error downloading report:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static assets in production mode
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Route all other GET requests to client's index.html to support SPA routing
app.get('*', (req, res, next) => {
  // Bypasses static API requests if they aren't matching
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Run server
app.listen(PORT, () => {
  console.log(`BFF Standalone Express Server running at http://localhost:${PORT}`);
  console.log(`Production Mode: ${process.env.NODE_ENV === 'production' ? 'ON' : 'OFF'}`);
  console.log(`Static Assets Serving Path: ${distPath}`);
});
