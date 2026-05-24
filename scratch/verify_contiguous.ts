import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: localEnvPath });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const allUnis = await prisma.university.findMany({
    select: { nameEn: true, rankingQs: true, rankingUsNews: true }
  });

  const qsRanks = new Set(allUnis.map(u => u.rankingQs).filter((r): r is number => r !== null));
  const usNewsRanks = new Set(allUnis.map(u => u.rankingUsNews).filter((r): r is number => r !== null));

  const qsGaps: number[] = [];
  for (let i = 1; i <= 500; i++) {
    if (!qsRanks.has(i)) qsGaps.push(i);
  }

  const usNewsGaps: number[] = [];
  for (let i = 1; i <= 200; i++) {
    if (!usNewsRanks.has(i)) usNewsGaps.push(i);
  }

  console.log(`QS 1-500 gaps count: ${qsGaps.length}`);
  if (qsGaps.length > 0) {
    console.log(`First 10 QS gaps: ${qsGaps.slice(0, 10).join(', ')}`);
  } else {
    console.log('✅ QS World University Rankings 1 to 500 are 100% contiguously covered!');
  }

  console.log(`US News 1-200 gaps count: ${usNewsGaps.length}`);
  if (usNewsGaps.length > 0) {
    console.log(`First 10 US News gaps: ${usNewsGaps.slice(0, 10).join(', ')}`);
  } else {
    console.log('✅ US News Best Universities 1 to 200 are 100% contiguously covered!');
  }

  // Check some top universities
  const ox = await prisma.university.findFirst({ where: { nameEn: { contains: 'Oxford' } } });
  console.log(`\nOxford check: QS = ${ox?.rankingQs}, US News = ${ox?.rankingUsNews}, Country = ${ox?.countryEn}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
