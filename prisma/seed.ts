import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import { broadFields, detailedFields, majors } from '../src/data/majorsData';
import { universities } from '../src/data/universitiesData';
import { toTraditional, getUniversityNameZh, getUniversityNameZht } from '../src/utils/chineseLocalization';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 Clearing existing database records...');
  await prisma.savedItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.universityMajorAssociation.deleteMany();
  await prisma.school.deleteMany();
  await prisma.university.deleteMany();
  await prisma.major.deleteMany();
  await prisma.detailedField.deleteMany();
  await prisma.broadField.deleteMany();

  // 2. Seed BroadFields
  console.log(`🌾 Seeding ${broadFields.length} BroadFields...`);
  for (const bf of broadFields) {
    await prisma.broadField.create({
      data: {
        id: bf.id,
        nameEn: bf.nameEn,
        nameZh: bf.nameZh,
        recentMedianEarningsEn: bf.recentMedianEarningsEn,
        recentMedianEarningsVal: bf.recentMedianEarningsVal,
        primeMedianEarningsEn: bf.primeMedianEarningsEn,
        primeMedianEarningsVal: bf.primeMedianEarningsVal,
        gradPremiumPercent: bf.gradPremiumPercent,
        gradDegreePercent: bf.gradDegreePercent,
      },
    });
  }

  // 3. Seed DetailedFields
  console.log(`🌿 Seeding ${detailedFields.length} DetailedFields...`);
  for (const df of detailedFields) {
    await prisma.detailedField.create({
      data: {
        id: df.id,
        nameEn: df.nameEn,
        nameZh: df.nameZh,
        broadFieldId: df.broadFieldId,
        primeMedianEarningsVal: df.primeMedianEarningsVal,
        unemploymentRecentPercent: df.unemploymentRecentPercent,
        unemploymentPrimePercent: df.unemploymentPrimePercent,
        degreeProductionChangePercent: df.degreeProductionChangePercent,
      },
    });
  }

  // 4. Seed Majors
  console.log(`🎓 Seeding ${majors.length} standard Majors...`);
  const validMajorIds = new Set(majors.map((m) => m.id));
  for (const m of majors) {
    await prisma.major.create({
      data: {
        id: m.id,
        nameEn: m.nameEn,
        nameZh: m.nameZh,
        nameZht: toTraditional(m.nameZh),
        broadFieldId: m.broadFieldId,
        detailedFieldId: m.detailedFieldId,
        specialTag: m.specialTag || null,
        earningsValue: m.earningsValue || null,
        mathDemand: null,
        physicsDemand: null,
        chemistryDemand: null,
        biologyDemand: null,
        humanitiesDemand: null,
      },
    });
  }

  // 5. Seed Universities and their Schools + Custom Majors
  console.log(`🏛️ Seeding ${universities.length} Universities...`);
  for (const u of universities) {
    const createdUniv = await prisma.university.create({
      data: {
        id: u.id,
        nameEn: u.nameEn,
        nameZh: getUniversityNameZh(u.id, u.nameZh || u.nameEn),
        nameZht: getUniversityNameZht(u.id, u.nameZh || u.nameEn),
        countryEn: 'United States', // default standard
        countryZh: '美国',          // default standard
        logoUrl: null,
        rankingQs: u.qsRank || null,
        rankingUsNews: u.usNewsRank || null,
        latitude: null,
        longitude: null,
        wikidataId: null,
        scorecardUnitId: null,
        averageCost: null,
        gradRate: null,
        medianSalary: null,
      },
    });

    for (const s of u.schools) {
      await prisma.school.create({
        data: {
          id: s.id,
          nameEn: s.nameEn,
          nameZh: s.nameZh || null,
          universityId: createdUniv.id,
        },
      });

      // Gather custom majors for this school
      const majorsList: any[] = [];
      if (s.majors) {
        majorsList.push(...s.majors);
      }
      if (s.categories) {
        for (const cat of s.categories) {
          if (cat.majors) {
            majorsList.push(...cat.majors);
          }
        }
      }

      // Seed UniversityMajorAssociation
      for (const mLink of majorsList) {
        if (!mLink.nationalMajorId) {
          continue; // Skip seeding associations that don't have a linked national major
        }

        // Verify nationalMajorId is a valid standard major
        if (!validMajorIds.has(mLink.nationalMajorId)) {
          console.warn(
            `⚠️ Skipping custom major "${mLink.nameEn}" (${mLink.id}) in ${createdUniv.nameEn}: linked nationalMajorId "${mLink.nationalMajorId}" not found in standard majors list.`
          );
          continue;
        }

        await prisma.universityMajorAssociation.create({
          data: {
            universityId: createdUniv.id,
            schoolId: s.id,
            customName: mLink.nameEn,
            customCode: mLink.id,
            standardMajorId: mLink.nationalMajorId,
            mappingScore: 1.0,   // Standard static seeds are 100% manually mapped
            isValidated: true,   // Marked as audited since it comes from verified data
          },
        });
      }
    }
  }

  // 6. Seed a default test PRO user
  console.log('👤 Seeding default demo users...');
  await prisma.user.create({
    data: {
      email: 'demo@college.edu',
      name: 'Demo Student',
      role: 'PRO',
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // active for 1 year
    },
  });

  console.log('✅ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
