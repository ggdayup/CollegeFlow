import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { officialQSRanks, officialUSNewsRanks } from '../src/ingest/officialRankingsDataset.js';

dotenv.config();
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: localEnvPath });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/i, '')
    .replace(/\b(university|college|institute|school|of|and|technology|sciences)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function main() {
  console.log('================================================================');
  console.log('🔍 UNIVERSITY RANKINGS AUDIT & DIAGNOSTIC');
  console.log('================================================================\n');

  const allUnis = await prisma.university.findMany();
  console.log(`Total universities in database: ${allUnis.length}\n`);

  // Dictionaries
  const normalizedQSPredefined = new Set<string>();
  for (const name of Object.keys(officialQSRanks)) {
    normalizedQSPredefined.add(normalizeName(name));
  }

  const normalizedUSNewsPredefined = new Set<string>();
  for (const name of Object.keys(officialUSNewsRanks)) {
    normalizedUSNewsPredefined.add(normalizeName(name));
  }

  // 1. Audit non-US schools with US News National rankings
  const foreignWithUSNews = allUnis.filter(u => {
    const isForeign = !u.countryEn.toLowerCase().includes('united states') && !u.countryEn.toLowerCase().includes('usa');
    return isForeign && u.rankingUsNews !== null;
  });

  console.log(`❌ FOREIGN UNIVERSITIES WITH US NEWS RANKINGS: ${foreignWithUSNews.length}`);
  foreignWithUSNews.forEach(u => {
    console.log(`   - "${u.nameEn}" (${u.countryEn}) is ranked US News #${u.rankingUsNews}`);
  });
  console.log();

  // 2. Audit schools with suspicious top US News rankings (under #30)
  const suspiciousUSNews = allUnis.filter(u => {
    const key = normalizeName(u.nameEn);
    const isUS = u.countryEn.toLowerCase().includes('united states') || u.countryEn.toLowerCase().includes('usa');
    const hasUSNews = u.rankingUsNews !== null && u.rankingUsNews <= 30;
    // Check if it is NOT in the authentic top list (or if it is one of the known fake entries like Allen College, St. Bonaventure, Oklahoma Baptist, Schiller)
    const isFakePredefined = ['allen college', 'st. bonaventure university', 'oklahoma baptist university', 'schiller international university'].includes(u.nameEn.toLowerCase());
    return hasUSNews && (!normalizedUSNewsPredefined.has(key) || isFakePredefined);
  });

  console.log(`❌ SUSPICIOUS TOP 30 US NEWS RANKINGS: ${suspiciousUSNews.length}`);
  suspiciousUSNews.forEach(u => {
    console.log(`   - "${u.nameEn}" is ranked US News #${u.rankingUsNews} (Authenticity Check: FAILED/SUSPICIOUS)`);
  });
  console.log();

  // 3. Audit universities that got alphabetical fallback ranks
  const alphabeticalQS = allUnis.filter(u => {
    const key = normalizeName(u.nameEn);
    return u.rankingQs !== null && !normalizedQSPredefined.has(key);
  });

  const alphabeticalUSNews = allUnis.filter(u => {
    const key = normalizeName(u.nameEn);
    return u.rankingUsNews !== null && !normalizedUSNewsPredefined.has(key);
  });

  console.log(`ℹ️ UNIVERSITIES ASSIGNED HEURISTIC/ALPHABETICAL FALLBACK RANKS:`);
  console.log(`   - QS Alphabetical Fallback count: ${alphabeticalQS.length}`);
  console.log(`   - US News Alphabetical Fallback count: ${alphabeticalUSNews.length}`);
  
  if (alphabeticalQS.length > 0) {
    console.log('\n   Sample QS alphabetical fallback entries (first 10 sorted by rank):');
    alphabeticalQS.sort((a,b) => (a.rankingQs || 0) - (b.rankingQs || 0)).slice(0, 10).forEach(u => {
      console.log(`     * QS #${u.rankingQs}: "${u.nameEn}"`);
    });
  }

  if (alphabeticalUSNews.length > 0) {
    console.log('\n   Sample US News alphabetical fallback entries (first 10 sorted by rank):');
    alphabeticalUSNews.sort((a,b) => (a.rankingUsNews || 0) - (b.rankingUsNews || 0)).slice(0, 10).forEach(u => {
      console.log(`     * US News #${u.rankingUsNews}: "${u.nameEn}"`);
    });
  }

  console.log('\n================================================================');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
