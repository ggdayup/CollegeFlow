import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure env variables are loaded
dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be defined");
}

// Clean Prisma-specific parameter before passing to native pg pool
const cleanConnectionString = connectionString.includes('?') 
  ? connectionString.split('?')[0] 
  : connectionString;

const pool = new Pool({ connectionString: cleanConnectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncCandidates() {
  console.log('Syncing InstitutionCandidates from ipeds_values...');
  
  // Extract the latest directory (hd) data for candidates
  const query = `
    SELECT unitid, 
           MAX(CASE WHEN variable_name = 'INSTNM' THEN COALESCE(value_text, value_numeric::text) END) as instnm,
           MAX(CASE WHEN variable_name = 'STABBR' THEN COALESCE(value_text, value_numeric::text) END) as stabbr,
           MAX(CASE WHEN variable_name = 'CONTROL' THEN COALESCE(value_text, value_numeric::text) END) as control,
           MAX(CASE WHEN variable_name = 'SECTOR' THEN COALESCE(value_text, value_numeric::text) END) as sector,
           MAX(CASE WHEN variable_name = 'ICLEVEL' THEN COALESCE(value_text, value_numeric::text) END) as iclevel
    FROM ipeds_values
    WHERE source_table IN ('hd2024', 'hd2023')
    GROUP BY unitid
  `;
  
  const { rows } = await pool.query(query);
  console.log(`Found ${rows.length} institutions in the data lake.`);
  
  let count = 0;
  for (const row of rows) {
    if (!row.instnm) continue;
    
    await prisma.institutionCandidate.upsert({
      where: { unitId: row.unitid },
      update: {
        nameEn: row.instnm,
        state: row.stabbr,
        control: row.control,
        sector: row.sector,
        level: row.iclevel,
        releaseKey: 'IPEDS-SYNC-2024',
      },
      create: {
        unitId: row.unitid,
        nameEn: row.instnm,
        state: row.stabbr,
        control: row.control,
        sector: row.sector,
        level: row.iclevel,
        releaseKey: 'IPEDS-SYNC-2024',
      }
    });
    count++;
    if (count % 500 === 0) {
      console.log(`Synced ${count} / ${rows.length} candidates...`);
    }
  }
  console.log(`Finished syncing ${count} InstitutionCandidates to Prisma.`);
}

async function main() {
  try {
    await syncCandidates();
  } catch (err) {
    console.error("Error during sync:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
