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
  const oxfords = await prisma.university.findMany({
    where: { nameEn: { contains: 'Oxford' } }
  });
  console.log(`Found ${oxfords.length} universities with 'Oxford':`);
  oxfords.forEach(o => {
    console.log(`- ID: ${o.id} | NameEn: "${o.nameEn}" | QS: ${o.rankingQs} | USNews: ${o.rankingUsNews} | Country: "${o.countryEn}"`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
