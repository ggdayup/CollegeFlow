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
  console.log('🚀 Hydrating authoritative metadata for JHU and Dartmouth...');

  // Update JHU
  await prisma.university.update({
    where: { id: 'jhu' },
    data: {
      wikidataId: 'Q193727',
      scorecardUnitId: '162928',
      averageCost: 29000,
      gradRate: 0.93,
      medianSalary: 85000,
      latitude: 39.3288,
      longitude: -76.6205,
      logoUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Hopkinslogo2.jpeg',
      countryEn: 'United States',
      countryZh: '美国'
    }
  });
  console.log('✓ Successfully updated Johns Hopkins University metadata.');

  // Update Dartmouth
  await prisma.university.update({
    where: { id: 'dartmouth' },
    data: {
      wikidataId: 'Q49116',
      scorecardUnitId: '182670',
      averageCost: 25500,
      gradRate: 0.95,
      medianSalary: 91000,
      latitude: 43.7044,
      longitude: -72.2886,
      logoUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Dartmouth_College_shield.svg',
      countryEn: 'United States',
      countryZh: '美国'
    }
  });
  console.log('✓ Successfully updated Dartmouth College metadata.');
  console.log('\n🎉 Direct metadata hydration complete!');
}

main()
  .catch((e) => console.error('Error during hydration:', e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
