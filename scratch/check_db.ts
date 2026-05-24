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
  const count = await prisma.university.count();
  console.log(`Total universities in database: ${count}`);

  const qsRanked = await prisma.university.count({
    where: { rankingQs: { not: null } }
  });
  console.log(`Universities with QS rankings: ${qsRanked}`);

  const usNewsRanked = await prisma.university.count({
    where: { rankingUsNews: { not: null } }
  });
  console.log(`Universities with US News rankings: ${usNewsRanked}`);

  const topQS200 = await prisma.university.findMany({
    where: { rankingQs: { lte: 200 } },
    select: { nameEn: true, rankingQs: true }
  });
  console.log(`Top QS 200 universities in DB: ${topQS200.length}`);

  const topQS500 = await prisma.university.findMany({
    where: { rankingQs: { lte: 500 } },
    select: { nameEn: true, rankingQs: true }
  });
  console.log(`Top QS 500 universities in DB: ${topQS500.length}`);

  const topUSNews200 = await prisma.university.findMany({
    where: { rankingUsNews: { lte: 200 } },
    select: { nameEn: true, rankingUsNews: true }
  });
  console.log(`Top US News 200 universities in DB: ${topUSNews200.length}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
