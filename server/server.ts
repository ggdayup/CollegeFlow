import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { createTransporter, sendVerificationEmail, sendResetPasswordEmail } from './email';
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
      await syncAppUserFromAuthUser(user, true);
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

async function syncAppUserFromAuthUser(
  user: { email: string; name?: string | null },
  emailVerified: boolean,
) {
  await prisma.user.upsert({
    where: { email: user.email.toLowerCase() },
    create: {
      email: user.email.toLowerCase(),
      name: user.name || null,
      role: 'FREE',
      userType: 'STUDENT',
      subscriptionStatus: 'none',
      passwordHash: '',
      emailVerified,
      emailVerifiedAt: emailVerified ? new Date() : null,
    },
    update: {
      ...(user.name !== undefined && { name: user.name || null }),
      emailVerified,
      emailVerifiedAt: emailVerified ? new Date() : null,
      disabled: false,
    },
  });
}

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

    if (!dbUser || (baUser.emailVerified && !dbUser.emailVerified)) {
      await syncAppUserFromAuthUser(
        { email: baUser.email, name: baUser.name || null },
        !!baUser.emailVerified,
      );
    }

    if (dbUser) {
      return res.json({
        ...dbUser,
        emailVerified: baUser.emailVerified || dbUser.emailVerified,
        emailVerifiedAt: baUser.emailVerified && !dbUser.emailVerifiedAt
          ? new Date()
          : dbUser.emailVerifiedAt,
      });
    }

    // Fallback: return Better Auth user data directly
    res.json({
      id: baUser.id,
      email: baUser.email,
      name: baUser.name,
      emailVerified: baUser.emailVerified || false,
      role: 'FREE',
      userType: 'STUDENT',
      schoolName: null,
      gradYear: null,
      counselorSpecialty: null,
      teacherSubject: null,
      customNote: null,
      subscriptionStatus: 'none',
      subscriptionEndsAt: null,
      disabled: false,
      lastLoginAt: null,
      createdAt: (baUser as Record<string, unknown>).createdAt || new Date().toISOString(),
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

  if (isSignUp && response.ok && responseJson && typeof responseJson === 'object') {
    const authUser = (responseJson as { user?: { email?: string; name?: string | null; emailVerified?: boolean } }).user;
    if (authUser?.email) {
      await syncAppUserFromAuthUser(authUser as { email: string; name?: string | null }, !!authUser.emailVerified);
    }
  }

  // After successful sign-in, update lastLoginAt
  if (isSignIn && response.ok && req.body?.email) {
    const email = req.body.email as string;
    await syncAppUserFromAuthUser({ email }, true);
    prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { lastLoginAt: new Date() },
    }).catch(() => { /* ignore - user may not exist in Prisma table */ });
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
    if (session.emailVerified && !dbUser?.emailVerified) {
      await syncAppUserFromAuthUser(session, true);
    }

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
