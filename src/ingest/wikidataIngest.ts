import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { universities } from '../data/universitiesData.js'; // Use relative import with .js extension for ES modules compatibility in Node

// Initialize pg connection pool and Prisma Pg adapter for Prisma 7
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Configuration
const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'CollegeMajorWikidataIngestionEngine/1.0 (contact: ggdayup@example.com) Antigravity/1.0';

const ELITE_UNIVERSITY_NAMES = [
  "Harvard University",
  "Yale University",
  "Princeton University",
  "Stanford University",
  "Massachusetts Institute of Technology",
  "California Institute of Technology",
  "Columbia University",
  "University of Pennsylvania",
  "Johns Hopkins University",
  "Dartmouth College",
  "Brown University",
  "Cornell University",
  "Northwestern University",
  "Duke University",
  "University of Chicago",
  "University of California, Berkeley",
  "University of California, Los Angeles",
  "University of Michigan, Ann Arbor",
  "Carnegie Mellon University",
  "New York University",
  "Rice University",
  "Vanderbilt University",
  "Emory University",
  "Washington University in St. Louis",
  "Georgetown University",
  "University of Southern California",
  "University of Virginia",
  "University of North Carolina at Chapel Hill",
  "Wake Forest University",
  "Tufts University",
  "Boston University",
  "Boston College",
  "University of Rochester",
  "Georgia Institute of Technology",
  "University of Texas at Austin",
  "University of Washington",
  "University of Wisconsin-Madison",
  "University of Illinois Urbana-Champaign",
  "Purdue University",
  "University of California, San Diego"
];

function buildTargetedSparqlQuery(names: string[]): string {
  const formattedNames = names.map(name => `    "${name}"@en`).join('\n');
  return `
SELECT DISTINCT ?item ?nameEn ?nameZh ?countryEn ?countryZh ?coords ?logo ?ipeds ?qsId
WHERE {
  ?item wdt:P31 ?type .
  VALUES ?type { wd:Q3918 wd:Q902104 }
  
  ?item rdfs:label ?nameEn .
  VALUES ?nameEn {
${formattedNames}
  }
  
  OPTIONAL {
    ?item rdfs:label ?nameZh .
    FILTER(LANG(?nameZh) = "zh")
  }
  
  OPTIONAL {
    ?item wdt:P17 ?countryItem .
    ?countryItem rdfs:label ?countryEn .
    FILTER(LANG(?countryEn) = "en")
  }
  OPTIONAL {
    ?item wdt:P17 ?countryItem .
    ?countryItem rdfs:label ?countryZh .
    FILTER(LANG(?countryZh) = "zh")
  }
  OPTIONAL { ?item wdt:P1771 ?ipeds . }
  OPTIONAL { ?item wdt:P5584 ?qsId . }
  OPTIONAL { ?item wdt:P625 ?coords . }
  OPTIONAL { ?item wdt:P154 ?logo . }
}
  `.trim();
}


interface UniversityData {
  wikidataId: string;
  nameEn: string;
  nameZh: string | null;
  countryEn: string;
  countryZh: string | null;
  rankingQs: number | null;
  rankingUsNews: number | null;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string | null;
  scorecardUnitId: string | null;
}

/**
 * Utility function to perform fetch with exponential backoff retry.
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, initialDelay = 1000): Promise<any> {
  let delay = initialDelay;
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        console.warn(`[WARN] Rate limited (429) by Wikidata. Retrying...`);
        const rateLimitDelay = delay * 2 + 2000;
        await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
        delay = rateLimitDelay;
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      if (i === retries) {
        throw err;
      }
      console.warn(`[WARN] Attempt ${i + 1} failed: ${(err as Error).message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

/**
 * Formulates the SPARQL query string for a specific batch.
 */
function buildSparqlQuery(limit: number, offset: number): string {
  return `
SELECT DISTINCT ?item ?nameEn ?nameZh ?countryEn ?countryZh ?coords ?logo ?ipeds ?qsId
WHERE {
  # Instance of university (Q3918) or higher education institution (Q902104)
  ?item wdt:P31 ?type .
  VALUES ?type { wd:Q3918 wd:Q902104 }
  
  # Must have an IPEDS ID or QS World University ID to filter for real universities
  { ?item wdt:P1771 ?ipedsFilter . }
  UNION
  { ?item wdt:P5584 ?qsIdFilter . }
  
  # English name is required
  ?item rdfs:label ?nameEn .
  FILTER(LANG(?nameEn) = "en")
  
  # Chinese name (optional)
  OPTIONAL {
    ?item rdfs:label ?nameZh .
    FILTER(LANG(?nameZh) = "zh")
  }
  
  # Country (optional)
  OPTIONAL {
    ?item wdt:P17 ?countryItem .
    ?countryItem rdfs:label ?countryEn .
    FILTER(LANG(?countryEn) = "en")
  }
  OPTIONAL {
    ?item wdt:P17 ?countryItem .
    ?countryItem rdfs:label ?countryZh .
    FILTER(LANG(?countryZh) = "zh")
  }

  # IPEDS Unit ID (P1771) (optional)
  OPTIONAL { ?item wdt:P1771 ?ipeds . }

  # QS World University ID (P5584) (optional)
  OPTIONAL { ?item wdt:P5584 ?qsId . }

  # Coordinate Location (P625) (optional)
  OPTIONAL { ?item wdt:P625 ?coords . }

  # Logo image (P154) (optional)
  OPTIONAL { ?item wdt:P154 ?logo . }
}
ORDER BY ?item
LIMIT ${limit}
OFFSET ${offset}
  `.trim();
}

/**
 * Parses a Wikidata SPARQL binding into our standard UniversityData structure.
 */
function parseBinding(binding: any): UniversityData | null {
  try {
    if (!binding.item?.value || !binding.nameEn?.value) {
      return null;
    }

    const wikidataId = binding.item.value.split('/').pop() || '';
    if (!wikidataId) return null;

    const nameEn = binding.nameEn.value;
    const nameZh = binding.nameZh?.value || null;
    const countryEn = binding.countryEn?.value || 'Unknown Country';
    const countryZh = binding.countryZh?.value || null;
    
    const rankingQs = null; // Dynamic ranks not stored directly in Wikidata properties
    const rankingUsNews = null;
    const logoUrl = binding.logo?.value || null;

    let latitude: number | null = null;
    let longitude: number | null = null;
    if (binding.coords?.value) {
      const match = binding.coords.value.match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
      if (match) {
        longitude = parseFloat(match[1]);
        latitude = parseFloat(match[2]);
      }
    }
    const scorecardUnitId = binding.ipeds?.value || null;

    return {
      wikidataId,
      nameEn,
      nameZh,
      countryEn,
      countryZh,
      rankingQs: rankingQs,
      rankingUsNews: rankingUsNews,
      latitude,
      longitude,
      logoUrl,
      scorecardUnitId,
    };
  } catch (err) {
    console.error(`[ERROR] Parsing binding failed:`, err);
    return null;
  }
}

/**
 * Safely upsert a university record to PostgreSQL database, handling unique constraints gracefully.
 */
async function upsertUniversity(data: UniversityData): Promise<void> {
  const existingById = await prisma.university.findUnique({
    where: { wikidataId: data.wikidataId },
  });

  if (existingById) {
    await prisma.university.update({
      where: { wikidataId: data.wikidataId },
      data: {
        nameEn: data.nameEn,
        nameZh: data.nameZh || existingById.nameZh,
        countryEn: data.countryEn,
        countryZh: data.countryZh || existingById.countryZh,
        rankingQs: data.rankingQs || existingById.rankingQs,
        rankingUsNews: data.rankingUsNews || existingById.rankingUsNews,
        latitude: data.latitude || existingById.latitude,
        longitude: data.longitude || existingById.longitude,
        logoUrl: data.logoUrl || existingById.logoUrl,
        scorecardUnitId: data.scorecardUnitId || existingById.scorecardUnitId,
      },
    });
    return;
  }

  const existingByName = await prisma.university.findUnique({
    where: { nameEn: data.nameEn },
  });

  if (existingByName) {
    if (!existingByName.wikidataId) {
      await prisma.university.update({
        where: { id: existingByName.id },
        data: {
          wikidataId: data.wikidataId,
          nameZh: data.nameZh || existingByName.nameZh,
          countryEn: data.countryEn,
          countryZh: data.countryZh || existingByName.countryZh,
          rankingQs: data.rankingQs || existingByName.rankingQs,
          rankingUsNews: data.rankingUsNews || existingByName.rankingUsNews,
          latitude: data.latitude || existingByName.latitude,
          longitude: data.longitude || existingByName.longitude,
          logoUrl: data.logoUrl || existingByName.logoUrl,
          scorecardUnitId: data.scorecardUnitId || existingByName.scorecardUnitId,
        },
      });
    } else {
      const uniqueNameEn = `${data.nameEn} (${data.wikidataId})`;
      await prisma.university.create({
        data: {
          ...data,
          nameEn: uniqueNameEn,
        },
      });
    }
    return;
  }

  await prisma.university.create({
    data,
  });
}

/**
 * Hydrates the database from the local top 200 elite schools seed fallback.
 */
async function hydrateLocalFallback(isDryRun: boolean): Promise<void> {
  console.log(`\n--- 🚰 Starting Local Fallback Hydration ---`);
  console.log(`Loaded ${universities.length} elite universities from local static cache.`);

  const mappedUniversities: UniversityData[] = universities.map((uni) => {
    let countryEn = 'United States of America';
    if (uni.locationEn.toLowerCase().includes('china') || uni.nameZh.includes('大学')) {
      countryEn = 'China';
    } else if (uni.locationEn.toLowerCase().includes('london') || uni.locationEn.toLowerCase().includes('uk')) {
      countryEn = 'United Kingdom';
    } else if (uni.locationEn.toLowerCase().includes('canada')) {
      countryEn = 'Canada';
    } else if (uni.locationEn.toLowerCase().includes('singapore')) {
      countryEn = 'Singapore';
    }

    return {
      wikidataId: `local-fallback-${uni.id}`,
      nameEn: uni.nameEn,
      nameZh: uni.nameZh,
      countryEn,
      countryZh: countryEn === 'China' ? '中国' : countryEn === 'United States of America' ? '美国' : null,
      rankingQs: uni.qsRank || null,
      rankingUsNews: uni.usNewsRank || null,
      latitude: null,
      longitude: null,
      logoUrl: null,
      scorecardUnitId: null,
    };
  });

  if (isDryRun) {
    console.log(`[DRY-RUN] Displaying first 10 universities from the fallback seed:`);
    console.table(mappedUniversities.slice(0, 10));
    return;
  }

  let successCount = 0;
  for (const uni of mappedUniversities) {
    try {
      await upsertUniversity(uni);
      successCount++;
    } catch (err) {
      console.error(`[ERROR] Failed to upsert fallback university "${uni.nameEn}":`, (err as Error).message);
    }
  }

  console.log(`[✓] Local fallback hydration complete. Successfully upserted ${successCount}/${mappedUniversities.length} universities.`);
}

/**
 * Main Ingestion execution logic.
 */
async function runIngestion(): Promise<void> {
  const isDryRun = process.argv.includes('--dry-run');
  const maxPagesArg = process.argv.find((arg) => arg.startsWith('--pages='));
  const maxPages = maxPagesArg ? parseInt(maxPagesArg.split('=')[1], 10) : 5; // Default to 5 pages

  console.log(`🚀 Starting Wikidata SPARQL Ingestion Engine`);
  console.log(`Mode: ${isDryRun ? '🧪 DRY-RUN (No writes)' : '💾 PRODUCTION (Upserting to DB)'}`);
  console.log(`Max Batches: ${maxPages} (50 records per batch)\n`);

  const batchSize = 50;
  let offset = 0;
  let pageCount = 0;
  let totalProcessed = 0;

  try {
    // Phase A: Fetch and Upsert Elite Target Universities first to ensure completeness
    console.log(`🎯 Phase A: Aligning ${ELITE_UNIVERSITY_NAMES.length} Core Elite Universities...`);
    const targetedQuery = buildTargetedSparqlQuery(ELITE_UNIVERSITY_NAMES);
    const targetedUrl = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(targetedQuery)}&format=json`;
    
    try {
      const targetedResponse = await fetchWithRetry(
        targetedUrl,
        {
          headers: {
            'User-Agent': USER_AGENT,
            Accept: 'application/sparql-results+json',
          },
        },
        3,
        1500
      );
      const targetedBindings = targetedResponse?.results?.bindings || [];
      console.log(`⚡ Found ${targetedBindings.length} matching elite universities on Wikidata.`);
      
      const eliteUniversities: UniversityData[] = [];
      for (const binding of targetedBindings) {
        const parsed = parseBinding(binding);
        if (parsed) {
          eliteUniversities.push(parsed);
        }
      }
      
      if (isDryRun) {
        console.log(`\n[DRY-RUN] Targeted elite universities sample:`);
        console.table(eliteUniversities.slice(0, 10));
      } else {
        console.log(`💾 Upserting ${eliteUniversities.length} elite universities...`);
        for (const uni of eliteUniversities) {
          try {
            await upsertUniversity(uni);
            totalProcessed++;
          } catch (err) {
            console.error(`[ERROR] Failed to upsert elite "${uni.nameEn}":`, (err as Error).message);
          }
        }
        console.log(`[✓] Core Elite Alignment completed. Cumulative total upserted: ${totalProcessed}\n`);
      }
    } catch (targetedError: any) {
      console.warn(`[WARN] Targeted elite university alignment failed, proceeding to paginated crawl:`, targetedError.message);
    }

    // Phase B: General Paginated Ingestion
    console.log(`🎯 Phase B: Commencing general paginated ingestion...`);
    while (pageCount < maxPages) {
      console.log(`📡 Fetching batch ${pageCount + 1}/${maxPages} (OFFSET ${offset})...`);
      const query = buildSparqlQuery(batchSize, offset);
      const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`;

      const startTime = Date.now();
      const response = await fetchWithRetry(
        url,
        {
          headers: {
            'User-Agent': USER_AGENT,
            Accept: 'application/sparql-results+json',
          },
        },
        3,
        1500
      );
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      const bindings = response?.results?.bindings || [];
      console.log(`⚡ Received ${bindings.length} records in ${duration}s.`);

      if (bindings.length === 0) {
        console.log(`[✓] No more records returned. Ingestion finished.`);
        break;
      }

      const universitiesBatch: UniversityData[] = [];
      for (const binding of bindings) {
        const parsed = parseBinding(binding);
        if (parsed) {
          universitiesBatch.push(parsed);
        }
      }

      if (isDryRun) {
        console.log(`\n[DRY-RUN] First batch of parsed universities:`);
        console.table(universitiesBatch.slice(0, 10));
        console.log(`\n[DRY-RUN] Skipping database upsert as requested.`);
        break;
      }

      console.log(`💾 Upserting ${universitiesBatch.length} records into the database...`);
      for (const uni of universitiesBatch) {
        try {
          await upsertUniversity(uni);
          totalProcessed++;
        } catch (err) {
          console.error(`[ERROR] Failed to upsert "${uni.nameEn}":`, (err as Error).message);
        }
      }

      console.log(`[✓] Batch ${pageCount + 1} processed successfully. Cumulative total upserted: ${totalProcessed}\n`);

      offset += batchSize;
      pageCount++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!isDryRun) {
      console.log(`🎉 Wikidata Ingestion Inbound Pipeline completed successfully! Total universities upserted: ${totalProcessed}`);
    }
  } catch (error) {
    console.error(`\n❌ Wikidata API connection failed or rate limit exceeded:`, (error as Error).message);
    console.log(`⚠️ Triggering Local Fallback Hydration Seed mechanism...`);
    await hydrateLocalFallback(isDryRun);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runIngestion().catch((err) => {
  console.error(`🔴 Critical system failure:`, err);
  process.exit(1);
});
