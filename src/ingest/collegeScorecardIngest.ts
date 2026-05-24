import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Target API details
const BASE_API_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';
const DEFAULT_API_KEY = 'DEMO_KEY';
const API_KEY = process.env.SCORECARD_API_KEY || DEFAULT_API_KEY;

interface ScorecardSchoolResult {
  id: number;
  'latest.cost.attendance.academic_year'?: number | null;
  'latest.completion.rate_suppressed.overall'?: number | null;
  'latest.earnings.10_yrs_after_entry.median'?: number | null;
}

interface ScorecardApiResponse {
  results?: ScorecardSchoolResult[];
  error?: {
    message: string;
    code: string;
  };
}

async function runIngestion() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('================================================================');
  console.log('🚀 U.S. College Scorecard & IPEDS API Ingestion Runner');
  console.log(`📁 Target File: src/ingest/collegeScorecardIngest.ts`);
  console.log(`🔄 Mode: ${isDryRun ? '🧪 DRY-RUN (Console Output Only)' : '💾 PRODUCTION (Write to PostgreSQL DB)'}`);
  console.log(`🔑 API Key: ${process.env.SCORECARD_API_KEY ? 'Custom Key Detected' : 'DEMO_KEY (Public Limit)'}`);
  console.log('================================================================\n');

  try {
    // 1. Fetch universities from local PostgreSQL that have scorecardUnitId (IPEDS ID)
    console.log('🔍 Querying universities from database...');
    
    // In dry-run mode, we fetch and show data for the first 5 schools
    const universities = await prisma.university.findMany({
      where: {
        scorecardUnitId: {
          not: null,
        },
      },
      select: {
        id: true,
        nameEn: true,
        scorecardUnitId: true,
      },
      orderBy: {
        nameEn: 'asc',
      },
      ...(isDryRun ? { take: 5 } : {}),
    });

    if (universities.length === 0) {
      console.log('⚠️ No universities found with a valid scorecardUnitId (IPEDS ID) in the database.');
      return;
    }

    console.log(`📊 Found ${universities.length} universities to synchronize.`);

    // 2. Batch universities in groups of 20
    const batchSize = 20;
    const universityBatches = [];
    for (let i = 0; i < universities.length; i += batchSize) {
      universityBatches.push(universities.slice(i, i + batchSize));
    }

    console.log(`📦 Grouped universities into ${universityBatches.length} batch(es) of size ${batchSize}.\n`);

    // 3. Process each batch
    for (let batchIndex = 0; batchIndex < universityBatches.length; batchIndex++) {
      const currentBatch = universityBatches[batchIndex];
      const unitIds = currentBatch.map(u => u.scorecardUnitId).filter((id): id is string => !!id);
      
      console.log(`⚡ Processing Batch ${batchIndex + 1}/${universityBatches.length} (${currentBatch.length} universities)...`);
      
      try {
        // Construct API URL with the unit IDs comma-separated
        const idsParam = unitIds.join(',');
        const fields = 'id,latest.cost.attendance.academic_year,latest.completion.rate_suppressed.overall,latest.earnings.10_yrs_after_entry.median';
        const apiUrl = `${BASE_API_URL}?api_key=${API_KEY}&id=${idsParam}&fields=${fields}`;

        console.log(`🌐 Fetching data from College Scorecard API for UNITIDs: ${idsParam}...`);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          if (response.status === 429) {
            console.error('❌ API Error: Rate limited by College Scorecard API (HTTP 429).');
          } else {
            console.error(`❌ API Error: Server responded with status ${response.status}.`);
          }
          continue;
        }

        const data = (await response.json()) as ScorecardApiResponse;
        
        if (!data.results || data.results.length === 0) {
          console.log('⚠️ No outcomes matching the unit IDs were returned by the API in this batch.');
          continue;
        }

        console.log(`✅ Successfully fetched outcomes for ${data.results.length} schools.`);

        // Map results by scorecardUnitId (UNITID) for constant time lookups
        const resultsMap = new Map<string, ScorecardSchoolResult>();
        for (const res of data.results) {
          resultsMap.set(String(res.id), res);
        }

        // 4. Update the database or display logs
        for (const university of currentBatch) {
          const scorecardId = university.scorecardUnitId!;
          const apiMatch = resultsMap.get(scorecardId);

          if (!apiMatch) {
            console.log(`   🔸 ${university.nameEn} (IPEDS: ${scorecardId}) -> Not found in API response.`);
            continue;
          }

          const averageCost = apiMatch['latest.cost.attendance.academic_year'];
          const gradRate = apiMatch['latest.completion.rate_suppressed.overall'];
          const medianSalary = apiMatch['latest.earnings.10_yrs_after_entry.median'];

          // Coerce empty / suppressed values to null safely
          const costValue = typeof averageCost === 'number' ? averageCost : null;
          const gradRateValue = typeof gradRate === 'number' ? gradRate : null;
          const salaryValue = typeof medianSalary === 'number' ? medianSalary : null;

          console.log(`   🔹 ${university.nameEn} (IPEDS: ${scorecardId}):`);
          console.log(`      💵 Avg Cost: ${costValue !== null ? `$${costValue.toLocaleString()}` : 'N/A'}`);
          console.log(`      🎓 Grad Rate: ${gradRateValue !== null ? `${(gradRateValue * 100).toFixed(2)}%` : 'N/A'}`);
          console.log(`      💼 Median Salary: ${salaryValue !== null ? `$${salaryValue.toLocaleString()}` : 'N/A'}`);

          if (!isDryRun) {
            // Production DB write
            await prisma.university.update({
              where: { id: university.id },
              data: {
                averageCost: costValue,
                gradRate: gradRateValue,
                medianSalary: salaryValue,
              },
            });
            console.log(`      💾 Saved successfully to database!`);
          }
        }
      } catch (batchError: any) {
        console.error(`❌ Unexpected error processing Batch ${batchIndex + 1}: ${batchError?.message || batchError}`);
      }
      console.log(''); // newline
    }

    console.log('================================================================');
    console.log(`🎉 Ingestion Runner Finished Successfully!`);
    console.log(`🔄 Total Universities Processed: ${universities.length}`);
    console.log('================================================================');

  } catch (error: any) {
    console.error(`❌ Critical error during ingestion runner execution:`, error);
  }
}

// Run the script
runIngestion()
  .catch((e) => {
    console.error('Fatal runner execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the database pool and prisma client
    await prisma.$disconnect();
    await pool.end();
  });
