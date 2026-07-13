import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.join(process.cwd(), 'data/ipeds/2024-25/provisional');
const RELEASE_KEY = 'ipeds-2024-25-provisional';

// ============================================================
// CSV Parser
// ============================================================
function parseCSV(content: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; current += ch; }
    } else if (ch === '\n' && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = '';
    } else if (ch !== '\r') { current += ch; }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  const results: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = values[j] || '';
    results.push(row);
  }
  return results;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function readCsv(filename: string): Record<string, string>[] {
  return parseCSV(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
}

function parseNum(val: string | undefined): number | null {
  if (!val || val === '-2' || val === '') return null;
  const n = parseFloat(val.replace(/"/g, '').trim());
  return isNaN(n) ? null : n;
}

async function main() {
  const start = Date.now();

  // Fix UIUC
  console.log('=== Fixing UIUC unitId ===');
  const uiucUni = await prisma.university.findFirst({ where: { nameEn: { contains: 'Illinois' } }, include: { institutionCandidates: true } });
  if (uiucUni) {
    if (uiucUni.institutionCandidates.length > 0) {
      await prisma.institutionCandidate.deleteMany({ where: { universityId: uiucUni.id } });
    }
    const hd = readCsv('hd2024.csv');
    const uiucRow = hd.find(r => r.INSTNM.includes('Illinois') && r.INSTNM.includes('Urbana'))!;
    if (uiucRow) {
      await prisma.institutionCandidate.create({
        data: {
          unitId: uiucRow.UNITID,
          universityId: uiucUni.id,
          nameEn: uiucRow.INSTNM,
          state: uiucRow.STABBR,
          control: uiucRow.CONTROL !== '-2' ? uiucRow.CONTROL : null,
          sector: uiucRow.SECTOR !== '-2' ? uiucRow.SECTOR : null,
          level: uiucRow.ICLEVEL !== '-2' ? uiucRow.ICLEVEL : null,
          eligibilityScore: 1,
          recommendation: 'PUBLISH',
          releaseKey: RELEASE_KEY,
        }
      });
      console.log(`  UIUC -> ${uiucRow.UNITID} (${uiucRow.INSTNM})`);
    }
  }

  // Update remaining candidates from hd2024
  console.log('\n=== Updating all candidates from hd2024 ===');
  const hd = readCsv('hd2024.csv');
  const candidates = await prisma.institutionCandidate.findMany();
  const byUnitId = new Map<string, typeof candidates[0]>();
  for (const c of candidates) byUnitId.set(c.unitId, c);

  let updated = 0;
  for (const row of hd) {
    const candidate = byUnitId.get(row.UNITID);
    if (!candidate) continue;
    await prisma.institutionCandidate.update({
      where: { id: candidate.id },
      data: {
        nameEn: row.INSTNM || candidate.nameEn,
        state: row.STABBR || candidate.state,
        control: row.CONTROL !== '-2' ? row.CONTROL : null,
        sector: row.SECTOR !== '-2' ? row.SECTOR : null,
        level: row.ICLEVEL !== '-2' ? row.ICLEVEL : null,
      }
    });
    updated++;
  }
  console.log(`  Updated ${updated} candidates`);

  // Build unitId -> universityId map
  const allCandidates = await prisma.institutionCandidate.findMany();
  const unitIdToUniId = new Map<string, string>();
  for (const c of allCandidates) {
    if (c.universityId) unitIdToUniId.set(c.unitId, c.universityId);
  }
  console.log(`  Mapped ${unitIdToUniId.size} unitIds`);

  // Delete old metrics for clean re-ingest
  console.log('\n=== Clearing old InstitutionMetrics ===');
  const oldCount = await prisma.institutionMetric.count();
  await prisma.institutionMetric.deleteMany({});
  console.log(`  Deleted ${oldCount} old metrics`);

  // Delete old program fields
  const oldProgCount = await prisma.institutionProgramField.count();
  await prisma.institutionProgramField.deleteMany({});
  console.log(`  Deleted ${oldProgCount} old program fields`);

  // Build metricKey map
  const allDefs = await prisma.metricDefinition.findMany({ select: { metricKey: true, sourceVariable: true } });
  const varToKey = new Map<string, string>();
  for (const d of allDefs) {
    if (d.sourceVariable) varToKey.set(d.sourceVariable.toLowerCase(), d.metricKey);
  }

  // Ingest metrics
  console.log('\n=== Ingesting InstitutionMetrics ===');
  const tableConfigs = [
    { file: 'hd2024.csv', unitCol: 'UNITID', cols: ['SECTOR', 'CONTROL', 'ICLEVEL', 'INSTSIZE', 'LATITUDE', 'LONGITUD', 'LOCALE'], table: 'hd2024' },
    { file: 'ic2024.csv', unitCol: 'UNITID', cols: ['FT_UG', 'PT_UG', 'FT_FTUG', 'PT_FTUG', 'CREDITS2', 'CREDITS3'], table: 'ic2024' },
    { file: 'ef2024.csv', unitCol: 'UNITID', cols: ['EFTOTAL', 'EFMEN', 'EFWOM', 'EFFT', 'EFPT'], table: 'ef2024' },
    { file: 'gr2024.csv', unitCol: 'UNITID', cols: ['GRTOTLT', 'GRTOTLM', 'GRTOTLW'], table: 'gr2024' },
    { file: 'cost1_2024.csv', unitCol: 'UNITID', cols: ['TUITION1', 'FEE1', 'TUITION5', 'FEE5', 'ROOMAMT', 'BOARDAMT', 'RMBRDAMT'], table: 'cost1_2024' },
    { file: 'adm2024.csv', unitCol: 'UNITID', cols: ['APPLFT', 'ADMFT', 'ENRFT'], table: 'adm2024' },
    { file: 'om2024.csv', unitCol: 'UNITID', cols: ['OM_COUNT', 'OM_AWARD'], table: 'om2024' },
  ];

  let totalInserted = 0;
  for (const cfg of tableConfigs) {
    const records = readCsv(cfg.file);
    const filtered = records.filter(r => unitIdToUniId.has(r[cfg.unitCol]));
    console.log(`  ${cfg.file}: ${filtered.length} rows for our universities`);

    // For tables with multiple rows per unitId, add distinguishing column(s) to verificationId
    const rowKeyCols: Record<string, string[]> = {
      ef2024: ['EFLEVEL'],
      gr2024: ['GRTYPE', 'CHRTSTAT'],
      om2024: ['OM_COHORT', 'OM_DEFN'],
    };

    for (const row of filtered) {
      const unitId = row[cfg.unitCol];
      const universityId = unitIdToUniId.get(unitId)!;

      // Build row suffix for verificationId uniqueness
      const rowKeyParts = (rowKeyCols[cfg.table] || []).map(k => row[k] || '');
      const rowSuffix = rowKeyParts.join('_');

      for (const col of cfg.cols) {
        const rawVal = row[col];
        const numVal = parseNum(rawVal);
        if (numVal === null && (!rawVal || rawVal === '-2')) continue;
        const metricKey = varToKey.get(col.toLowerCase());
        if (!metricKey) continue;

        const verificationId = `${cfg.table}_${unitId}_${col}${rowSuffix ? '_' + rowSuffix : ''}_${RELEASE_KEY}`;
        await prisma.institutionMetric.upsert({
          where: { verificationId },
          create: {
            metricKey,
            universityId,
            unitId,
            valueNumeric: numVal,
            valueText: rawVal || null,
            valueStatus: numVal !== null ? 'NUMERIC' : 'TEXT',
            missingReason: rawVal === '-2' ? 'SUPPRESSED' : null,
            rawValue: rawVal,
            academicYear: '2024',
            sourceSystem: 'IPEDS',
            sourceTable: cfg.table,
            sourceVariable: col,
            releaseKey: RELEASE_KEY,
            verificationId,
          },
          update: {
            valueNumeric: numVal,
            valueText: rawVal || null,
            valueStatus: numVal !== null ? 'NUMERIC' : 'TEXT',
            releaseKey: RELEASE_KEY,
          }
        });
        totalInserted++;
      }
    }
  }
  console.log(`  Total InstitutionMetrics: ${totalInserted}`);

  // Ingest program fields
  console.log('\n=== Ingesting InstitutionProgramFields ===');
  const cipRecords = readCsv('c2024_a.csv');
  const validUnitIds = new Set(allCandidates.map(c => c.unitId));
  const unitCol = cipRecords[0]?.['unitid'] !== undefined ? 'unitid' : 'UNITID';
  const filtered = cipRecords.filter(r => validUnitIds.has(r[unitCol]));
  console.log(`  ${filtered.length}/${cipRecords.length} program records match our universities`);

  let progInserted = 0;
  for (const row of filtered) {
    const unitId = row[unitCol];
    const candidate = allCandidates.find(c => c.unitId === unitId);
    if (!candidate?.universityId) continue;

    const cipCode = row.CIPCODE;
    const awLevel = row.AWLEVEL;
    const cTotalT = parseNum(row.CTOTALT);
    const verificationId = `c2024_${unitId}_${cipCode}_${awLevel}_${RELEASE_KEY}`;

    const degreeLevel = awLevel === '5' ? 'BACHELOR' : awLevel === '7' ? 'MASTER' : awLevel === '17' ? 'DOCTORAL' : awLevel === '8' ? 'ASSOCIATE' : 'OTHER';

    await prisma.institutionProgramField.upsert({
      where: {
        unitId_cipCode_degreeLevel_releaseKey_sourceType: {
          unitId, cipCode, degreeLevel, releaseKey: RELEASE_KEY, sourceType: 'COMPLETIONS',
        }
      },
      create: {
        universityId: candidate.universityId,
        unitId,
        cipCode,
        displayTitle: `CIP ${cipCode} / Level ${awLevel}`,
        degreeLevel,
        sourceType: 'COMPLETIONS',
        completionsTotal: cTotalT,
        activityStatus: 'ACTIVE',
        valueStatus: cTotalT !== null ? 'NUMERIC' : 'MISSING',
        sourceSystem: 'IPEDS',
        sourceTable: 'c2024_a',
        sourceVariable: 'CTOTALT',
        releaseKey: RELEASE_KEY,
        verificationId,
      },
      update: {
        completionsTotal: cTotalT,
        valueStatus: cTotalT !== null ? 'NUMERIC' : 'MISSING',
      }
    });
    progInserted++;
    if (progInserted % 1000 === 0) console.log(`    ${progInserted}...`);
  }
  console.log(`  Total InstitutionProgramFields: ${progInserted}`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n=== IPEDS Ingestion Complete (${elapsed}s) ===`);
  console.log(`  InstitutionCandidates: ${await prisma.institutionCandidate.count()}`);
  console.log(`  InstitutionMetrics: ${await prisma.institutionMetric.count()}`);
  console.log(`  InstitutionProgramFields: ${await prisma.institutionProgramField.count()}`);
}

main().then(() => { prisma.$disconnect(); pool.end(); }).catch(console.error);
