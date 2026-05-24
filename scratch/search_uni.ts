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
  const searchTerms = ['Brown', 'Dartmouth', 'Vanderbilt', 'Virginia', 'British Columbia', 'Michigan'];
  
  for (const term of searchTerms) {
    const matches = await prisma.university.findMany({
      where: { nameEn: { contains: term, mode: 'insensitive' } }
    });
    
    console.log(`Search for "${term}": Found ${matches.length} matches:`);
    matches.forEach(m => {
      console.log(`  - ID: "${m.id}" | NameEn: "${m.nameEn}" | Country: "${m.countryEn}" | QS: ${m.rankingQs} | USNews: ${m.rankingUsNews}`);
    });
    console.log();
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
