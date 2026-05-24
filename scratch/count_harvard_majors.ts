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
  const harvard = await prisma.university.findUnique({
    where: { id: 'harvard' },
    include: {
      schools: {
        include: {
          customMajors: true
        }
      },
      customMajors: {
        include: {
          standardMajor: true
        }
      }
    }
  });

  if (!harvard) {
    console.log('Harvard not found in database');
    return;
  }

  console.log(`University: ${harvard.nameEn} (ID: ${harvard.id})`);
  console.log(`Number of Schools/Colleges: ${harvard.schools.length}`);
  harvard.schools.forEach(s => {
    console.log(`  - School: ${s.nameEn} (ID: ${s.id})`);
    console.log(`    * Custom Majors Count: ${s.customMajors.length}`);
  });

  console.log(`Total Custom Majors associated with Harvard: ${harvard.customMajors.length}`);
  const hasSchool = harvard.customMajors.filter(m => m.schoolId !== null).length;
  const noSchool = harvard.customMajors.filter(m => m.schoolId === null).length;
  console.log(`  * Associated with a School: ${hasSchool}`);
  console.log(`  * Associated with general University (no school): ${noSchool}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
