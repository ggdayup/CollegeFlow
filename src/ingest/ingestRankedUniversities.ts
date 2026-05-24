import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { officialQSRanks, officialUSNewsRanks } from './officialRankingsDataset.js';

dotenv.config();
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: localEnvPath });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'CollegeMajorWikidataIngestionEngine/1.0 (contact: ggdayup@example.com) Antigravity/1.0';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/i, '')
    .replace(/\b(university|college|institute|school|of|and|technology|sciences)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      // Use AbortSignal for strict 5-second fetch timeout to prevent hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 429) {
        console.warn(`      ⚠️ Rate limited by Wikidata. Waiting before retry...`);
        await new Promise(r => setTimeout(r, delay * 2));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function queryWikidataForUni(name: string): Promise<any> {
  // Ultra-fast indexed label lookup (strictly matches English label, no heavy skos:altLabel scans)
  const query = `
    SELECT DISTINCT ?item ?nameEn ?nameZh ?countryEn ?countryZh ?coords ?logo ?ipeds
    WHERE {
      ?item wdt:P31/wdt:P279* wd:Q3918 .
      ?item rdfs:label ?nameEn .
      FILTER(LANG(?nameEn) = "en" && LCASE(?nameEn) = "${name.toLowerCase().trim()}")

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
      OPTIONAL { ?item wdt:P625 ?coords . }
      OPTIONAL { ?item wdt:P154 ?logo . }
    }
    LIMIT 1
  `;

  const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`;
  try {
    const data = await fetchWithRetry(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' }
    });
    const bindings = data?.results?.bindings || [];
    if (bindings.length > 0) {
      const binding = bindings[0];
      const wikidataId = binding.item?.value?.split('/').pop() || null;
      const nameEn = binding.nameEn?.value || name;
      const nameZh = binding.nameZh?.value || nameEn;
      const countryEn = binding.countryEn?.value || 'United States';
      const countryZh = binding.countryZh?.value || '美国';
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
      
      return { wikidataId, nameEn, nameZh, countryEn, countryZh, latitude, longitude, logoUrl, scorecardUnitId };
    }
  } catch (err) {
    console.warn(`      ⚠️ Wikidata fetch failed for "${name}": ${(err as Error).message}`);
  }
  return null;
}

async function main() {
  console.log('================================================================');
  console.log('🏛️  INGESTING MISSING TOP RANKED UNIVERSITIES (ULTRA-FAST)');
  console.log('================================================================\n');

  // 1. Fetch existing universities
  const dbUnis = await prisma.university.findMany({ select: { nameEn: true } });
  const dbNormalizedNames = new Set(dbUnis.map(u => normalizeName(u.nameEn)));

  // 2. Identify missing schools
  const missingNames = new Set<string>();

  for (const name of Object.keys(officialQSRanks)) {
    if (!dbNormalizedNames.has(normalizeName(name))) {
      missingNames.add(name);
    }
  }

  for (const name of Object.keys(officialUSNewsRanks)) {
    if (!dbNormalizedNames.has(normalizeName(name))) {
      missingNames.add(name);
    }
  }

  console.log(`🔍 Identified ${missingNames.size} missing top universities in database.`);
  if (missingNames.size === 0) {
    console.log('✅ All top ranked universities are already present in the database!');
    return;
  }

  console.log('📡 Starting targeted Wikidata queries for missing universities...\n');
  let addedCount = 0;
  let skippedCount = 0;

  for (const name of missingNames) {
    // Skip short acronyms (e.g. lse, ubc, hkust, kaist, uts, unam, iit bombay, iisc)
    // as their full name equivalents exist and are processed
    if (name.length <= 5) {
      console.log(`⏭️  Skipping duplicate acronym: "${name}"`);
      skippedCount++;
      continue;
    }

    console.log(`👉 Ingesting: "${name}"...`);
    const details = await queryWikidataForUni(name);
    
    // Add brief polite delay (300ms) between queries
    await new Promise(r => setTimeout(r, 300));

    const id = normalizeName(name).substring(0, 30);
    const isUS = !name.toLowerCase().includes('london') && !name.toLowerCase().includes('oxford') && !name.toLowerCase().includes('cambridge') && !name.toLowerCase().includes('toronto') && !name.toLowerCase().includes('mcgill') && !name.toLowerCase().includes('sydney') && !name.toLowerCase().includes('melbourne');

    // Default Fallback details if Wikidata failed or returned null
    const finalDetails = details || {
      wikidataId: `local-fallback-${id}`,
      nameEn: name,
      nameZh: name,
      countryEn: isUS ? 'United States' : 'United Kingdom',
      countryZh: isUS ? '美国' : '英国',
      latitude: isUS ? 37.0902 : 55.3781,
      longitude: isUS ? -95.7129 : -3.4360,
      logoUrl: null,
      scorecardUnitId: null
    };

    try {
      // Upsert university
      await prisma.university.upsert({
        where: { id },
        update: {
          wikidataId: finalDetails.wikidataId,
          nameZh: finalDetails.nameZh,
          countryEn: finalDetails.countryEn,
          countryZh: finalDetails.countryZh,
          latitude: finalDetails.latitude,
          longitude: finalDetails.longitude,
          logoUrl: finalDetails.logoUrl,
          scorecardUnitId: finalDetails.scorecardUnitId
        },
        create: {
          id,
          nameEn: finalDetails.nameEn,
          nameZh: finalDetails.nameZh,
          countryEn: finalDetails.countryEn,
          countryZh: finalDetails.countryZh,
          latitude: finalDetails.latitude,
          longitude: finalDetails.longitude,
          logoUrl: finalDetails.logoUrl,
          scorecardUnitId: finalDetails.scorecardUnitId
        }
      });
      addedCount++;
      console.log(`   ✅ Successfully upserted "${finalDetails.nameEn}" (${finalDetails.countryEn})`);
    } catch (err) {
      console.error(`   ❌ Failed to upsert "${name}":`, (err as Error).message);
    }
  }

  console.log(`\n🎉 Ingestion Finished!`);
  console.log(`- Upserted: ${addedCount} universities`);
  console.log(`- Skipped Acronyms: ${skippedCount} items`);
  console.log('\n================================================================');
}

main()
  .catch((e) => {
    console.error('🔴 Ingestion runner failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
