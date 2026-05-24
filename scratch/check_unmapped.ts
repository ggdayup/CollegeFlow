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
  const dbUnis = await prisma.university.findMany();
  const dbNormalizedNames = new Set(dbUnis.map(u => normalizeName(u.nameEn)));

  console.log('================================================================');
  console.log('🔎 UNMAPPED PREDEFINED RANKINGS DIAGNOSTICS');
  console.log('================================================================\n');

  // Check QS Unmapped
  const unmappedQS: string[] = [];
  for (const name of Object.keys(officialQSRanks)) {
    const key = normalizeName(name);
    if (!dbNormalizedNames.has(key)) {
      unmappedQS.push(name);
    }
  }

  console.log(`❌ UNMAPPED QS PREDEFINED RANKINGS: ${unmappedQS.length} / ${Object.keys(officialQSRanks).length}`);
  if (unmappedQS.length > 0) {
    console.log('   Sample unmapped QS schools:');
    unmappedQS.slice(0, 20).forEach(name => {
      console.log(`     - "${name}" (QS #${officialQSRanks[name]})`);
    });
  }
  console.log();

  // Check US News Unmapped
  const unmappedUSNews: string[] = [];
  for (const name of Object.keys(officialUSNewsRanks)) {
    const key = normalizeName(name);
    if (!dbNormalizedNames.has(key)) {
      unmappedUSNews.push(name);
    }
  }

  console.log(`❌ UNMAPPED US NEWS PREDEFINED RANKINGS: ${unmappedUSNews.length} / ${Object.keys(officialUSNewsRanks).length}`);
  if (unmappedUSNews.length > 0) {
    console.log('   Sample unmapped US News schools:');
    unmappedUSNews.slice(0, 20).forEach(name => {
      console.log(`     - "${name}" (US News #${officialUSNewsRanks[name]})`);
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
