import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { universities as staticUnis } from '../src/data/universitiesData.ts';
import { expressProxyMiddleware } from '../src/utils/apiProxy.ts';

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
            const rankings = dbUni.majorRankings
              .filter((r) => r.standardMajorId === cm.standardMajorId)
              .map((r) => ({
                source: r.source,
                rankInteger: r.rankInteger,
                year: r.year,
                verificationId: r.verificationId
              }));
            return {
              id: cm.customCode || cm.id,
              nameEn: cm.customName,
              nameZh: cm.standardMajor.nameZh || cm.customName,
              nameZht: cm.standardMajor.nameZht || cm.standardMajor.nameZh || cm.customName,
              nationalMajorId: cm.standardMajorId,
              broadFieldId: cm.standardMajor.broadFieldId,
              degreeLevel: cm.degreeLevel,
              rankings: rankings.length > 0 ? rankings : undefined
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
          const cleanedMajors = dbSchool.majors.map(({ broadFieldId, ...rest }) => rest);
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
          majorRankings: dbUni.majorRankings.map((r) => ({
            standardMajorId: r.standardMajorId,
            rankInteger: r.rankInteger,
            year: r.year,
            source: r.source,
            verificationId: r.verificationId
          }))
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
          const rankings = dbUni.majorRankings
            .filter((r) => r.standardMajorId === cm.standardMajorId)
            .map((r) => ({
              source: r.source,
              rankInteger: r.rankInteger,
              year: r.year,
              verificationId: r.verificationId
            }));
          return {
            id: cm.customCode || cm.id,
            nameEn: cm.customName,
            nameZh: cm.standardMajor.nameZh || cm.customName,
            nameZht: cm.standardMajor.nameZht || cm.standardMajor.nameZh || cm.customName,
            nationalMajorId: cm.standardMajorId,
            degreeLevel: cm.degreeLevel,
            rankings: rankings.length > 0 ? rankings : undefined
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
        majorRankings: dbUni.majorRankings.map((r) => ({
          standardMajorId: r.standardMajorId,
          rankInteger: r.rankInteger,
          year: r.year,
          source: r.source,
          verificationId: r.verificationId
        }))
      };
    });

    res.json(data);
  } catch (e: any) {
    console.error('[BFF] Error fetching universities:', e);
    res.status(500).json({ error: e.message || 'Internal Server Error' });
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
  } catch (e: any) {
    console.error('[BFF] Error fetching user:', e);
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
});

// POST register/update user profile
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
  } catch (e: any) {
    console.error('[BFF] Error creating/updating user:', e);
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
});

// Mount secure API Proxy to FastAPI Python services
app.use('/api/proxy', expressProxyMiddleware);

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
  console.log(`🚀 BFF Standalone Express Server running at http://localhost:${PORT}`);
  console.log(`🌍 Production Mode: ${process.env.NODE_ENV === 'production' ? 'ON' : 'OFF'}`);
  console.log(`📂 Static Assets Serving Path: ${distPath}`);
});
