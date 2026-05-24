import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import { universities as staticUnis } from '../data/universitiesData.js';

dotenv.config();

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

/**
 * Express-compatible handler for dynamic university queries, mounted directly in Vite.
 */
export async function getDynamicUniversities() {
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
    },
    orderBy: {
      nameEn: 'asc',
    },
  });

  return dbUnis.map((dbUni) => {
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

      return {
        ...staticUni,
        countryEn,
        countryZh,
        // Supplement with any real-time rankings or metrics from DB
        usNewsRank: dbUni.rankingUsNews || staticUni.usNewsRank,
        qsRank: dbUni.rankingQs || staticUni.qsRank,
        averageCost: dbUni.averageCost || undefined,
        gradRate: dbUni.gradRate || undefined,
        medianSalary: dbUni.medianSalary || undefined,
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
      const majorsList = s.customMajors.map((cm) => ({
        id: cm.customCode || cm.id,
        nameEn: cm.customName,
        nameZh: cm.standardMajor.nameZh || cm.customName,
        nationalMajorId: cm.standardMajorId,
      }));

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
      shortNameEn: dbUni.nameEn.replace(/university/i, '').trim(),
      shortNameZh: (dbUni.nameZh || dbUni.nameEn).replace(/大学/g, '').trim(),
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
    };
  });
}
