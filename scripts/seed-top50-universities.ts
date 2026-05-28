/**
 * Seed top 50 US universities with IPEDS UNITIDs into the main PostgreSQL.
 * Uses pg.Pool + @prisma/adapter-pg per project convention.
 */
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface Top50University {
  unitId: string;
  nameEn: string;
  state: string;
  rankingUsNews?: number;
}

const TOP50: Top50University[] = [
  { unitId: '166629', nameEn: 'Princeton University', state: 'NJ', rankingUsNews: 1 },
  { unitId: '130798', nameEn: 'Harvard University', state: 'MA', rankingUsNews: 3 },
  { unitId: '203386', nameEn: 'University of Pennsylvania', state: 'PA', rankingUsNews: 6 },
  { unitId: '199846', nameEn: 'Yale University', state: 'CT', rankingUsNews: 5 },
  { unitId: '147767', nameEn: 'Northwestern University', state: 'IL', rankingUsNews: 9 },
  { unitId: '126614', nameEn: 'Duke University', state: 'NC', rankingUsNews: 7 },
  { unitId: '217431', nameEn: 'Johns Hopkins University', state: 'MD', rankingUsNews: 9 },
  { unitId: '161074', nameEn: 'Brown University', state: 'RI', rankingUsNews: 12 },
  { unitId: '165818', nameEn: 'Dartmouth College', state: 'NH', rankingUsNews: 12 },
  { unitId: '186380', nameEn: 'University of Chicago', state: 'IL', rankingUsNews: 12 },
  { unitId: '139935', nameEn: 'Massachusetts Institute of Technology', state: 'MA', rankingUsNews: 2 },
  { unitId: '182608', nameEn: 'Stanford University', state: 'CA', rankingUsNews: 4 },
  { unitId: '110581', nameEn: 'California Institute of Technology', state: 'CA', rankingUsNews: 12 },
  { unitId: '213282', nameEn: 'Columbia University in the City of New York', state: 'NY', rankingUsNews: 12 },
  { unitId: '179867', nameEn: 'Rice University', state: 'TX', rankingUsNews: 17 },
  { unitId: '122420', nameEn: 'Washington University in St Louis', state: 'MO', rankingUsNews: 24 },
  { unitId: '164978', nameEn: 'Cornell University', state: 'NY', rankingUsNews: 12 },
  { unitId: '171102', nameEn: 'Emory University', state: 'GA', rankingUsNews: 24 },
  { unitId: '168317', nameEn: 'University of Notre Dame', state: 'IN', rankingUsNews: 24 },
  { unitId: '141771', nameEn: 'University of Michigan-Ann Arbor', state: 'MI', rankingUsNews: 21 },
  { unitId: '100760', nameEn: 'Georgetown University', state: 'DC', rankingUsNews: 24 },
  { unitId: '150506', nameEn: 'University of California-Berkeley', state: 'CA', rankingUsNews: 21 },
  { unitId: '111432', nameEn: 'Carnegie Mellon University', state: 'PA', rankingUsNews: 24 },
  { unitId: '153969', nameEn: 'University of California-Los Angeles', state: 'CA', rankingUsNews: 21 },
  { unitId: '144959', nameEn: 'New York University', state: 'NY', rankingUsNews: 30 },
  { unitId: '163283', nameEn: 'Tufts University', state: 'MA', rankingUsNews: 30 },
  { unitId: '142428', nameEn: 'University of Southern California', state: 'CA', rankingUsNews: 30 },
  { unitId: '230437', nameEn: 'University of Virginia-Main Campus', state: 'VA', rankingUsNews: 24 },
  { unitId: '228724', nameEn: 'Boston University', state: 'MA', rankingUsNews: 30 },
  { unitId: '102631', nameEn: 'Vanderbilt University', state: 'TN', rankingUsNews: 17 },
  { unitId: '139759', nameEn: 'Middlebury College', state: 'VT', rankingUsNews: 6 },
  { unitId: '218971', nameEn: 'Williams College', state: 'MA', rankingUsNews: 6 },
  { unitId: '191866', nameEn: 'Swarthmore College', state: 'PA', rankingUsNews: 6 },
  { unitId: '196271', nameEn: 'Amherst College', state: 'MA', rankingUsNews: 6 },
  { unitId: '214771', nameEn: 'Bowdoin College', state: 'ME', rankingUsNews: 6 },
  { unitId: '184692', nameEn: 'Pomona College', state: 'CA', rankingUsNews: 6 },
  { unitId: '216332', nameEn: 'University of North Carolina at Chapel Hill', state: 'NC', rankingUsNews: 24 },
  { unitId: '164054', nameEn: 'Georgia Institute of Technology-Main Campus', state: 'GA', rankingUsNews: 33 },
  { unitId: '139652', nameEn: 'University of Rochester', state: 'NY', rankingUsNews: 30 },
  { unitId: '211435', nameEn: 'University of Florida', state: 'FL', rankingUsNews: 30 },
  { unitId: '215066', nameEn: 'University of Wisconsin-Madison', state: 'WI', rankingUsNews: 30 },
  { unitId: '166023', nameEn: 'University of Illinois at Urbana-Champaign', state: 'IL', rankingUsNews: 35 },
  { unitId: '204723', nameEn: 'The Ohio State University-Main Campus', state: 'OH', rankingUsNews: 30 },
  { unitId: '233559', nameEn: 'University of Washington-Seattle Campus', state: 'WA', rankingUsNews: 30 },
  { unitId: '151350', nameEn: 'University of California-San Diego', state: 'CA', rankingUsNews: 30 },
  { unitId: '113962', nameEn: 'University of California-Davis', state: 'CA', rankingUsNews: 30 },
  { unitId: '219756', nameEn: 'Yeshiva University', state: 'NY', rankingUsNews: 67 },
  { unitId: '106666', nameEn: 'Case Western Reserve University', state: 'OH', rankingUsNews: 35 },
  { unitId: '143761', nameEn: 'University of Texas at Austin', state: 'TX', rankingUsNews: 30 },
  { unitId: '237710', nameEn: 'University of Georgia', state: 'GA', rankingUsNews: 30 },
];

async function seed() {
  console.log('Seeding top 50 US universities...');
  let created = 0;
  let updated = 0;

  for (const uni of TOP50) {
    const existed = await prisma.university.findUnique({ where: { nameEn: uni.nameEn } });
    const university = await prisma.university.upsert({
      where: { nameEn: uni.nameEn },
      create: {
        nameEn: uni.nameEn,
        countryEn: 'United States',
        rankingUsNews: uni.rankingUsNews,
        scorecardUnitId: uni.unitId,
      },
      update: {
        countryEn: 'United States',
        rankingUsNews: uni.rankingUsNews ?? undefined,
        scorecardUnitId: uni.unitId,
      },
    });

    if (existed) {
      updated++;
    } else {
      created++;
    }

    // External identifier
    await prisma.universityExternalIdentifier.upsert({
      where: { identifierType_identifierValue: { identifierType: 'IPEDS_UNITID', identifierValue: uni.unitId } },
      create: {
        universityId: university.id,
        identifierType: 'IPEDS_UNITID',
        identifierValue: uni.unitId,
        sourceSystem: 'IPEDS',
      },
      update: {
        universityId: university.id,
        sourceSystem: 'IPEDS',
      },
    });

    // Institution candidate
    await prisma.institutionCandidate.upsert({
      where: { unitId: uni.unitId },
      create: {
        unitId: uni.unitId,
        universityId: university.id,
        nameEn: uni.nameEn,
        state: uni.state,
        eligibilityScore: 1.0,
        recommendation: 'PUBLISH',
        releaseKey: 'v1',
      },
      update: {
        universityId: university.id,
        nameEn: uni.nameEn,
        state: uni.state,
        eligibilityScore: 1.0,
        recommendation: 'PUBLISH',
      },
    });

    // Publish decision
    const candidate = await prisma.institutionCandidate.findUnique({ where: { unitId: uni.unitId } });
    if (candidate) {
      const publishId = crypto.randomUUID();
      await prisma.institutionPublishDecision.upsert({
        where: { id: publishId },
        create: {
          id: publishId,
          candidateId: candidate.id,
          universityId: university.id,
          status: 'PUBLISHED',
        },
        update: {
          universityId: university.id,
          status: 'PUBLISHED',
        },
      });
    }
  }

  console.log(`Done: ${created} created, ${updated} updated`);

  // Verification
  const uniCount = await prisma.university.count({ where: { countryEn: 'United States' } });
  const extCount = await prisma.universityExternalIdentifier.count({ where: { identifierType: 'IPEDS_UNITID' } });
  const candCount = await prisma.institutionCandidate.count({ where: { recommendation: 'PUBLISH' } });
  console.log(`Verification: ${uniCount} universities, ${extCount} external IDs, ${candCount} candidates`);

  await prisma.$disconnect();
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
