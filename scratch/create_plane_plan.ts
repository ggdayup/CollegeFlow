import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Metadata and IDs
const CLI_PATH = '/Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js';
const WORKSPACE_SLUG = 'sheenvita';
const PROJECT_ID = '15c381fa-d6ad-4f10-8c47-2b04a3a342b5';

// States from AGENTS.md
const STATE_IN_PROGRESS = 'c7701ec6-17bc-4b40-a72f-2970f96cdc9e';
const STATE_TODO = '16406b06-6ecc-4701-b8fc-0e807f5b9e4c';

// Helpers
const scratchDir = path.join(process.cwd(), 'scratch');

function createTempPayloadFile(name: string, payload: object): string {
  const filePath = path.join(scratchDir, `temp_payload_${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  return filePath;
}

function runPlaneCli(command: string, arg: string): any {
  const fullCmd = `node "${CLI_PATH}" ${command} ${WORKSPACE_SLUG} ${PROJECT_ID} "${arg}"`;
  console.log(`Running CLI: ${fullCmd}`);
  try {
    const stdout = execSync(fullCmd, { encoding: 'utf-8' });
    // Find JSON block if there's any prefix
    const jsonMatch = stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(stdout.trim());
  } catch (error: any) {
    console.error(`CLI execution failed: ${error.message}`);
    if (error.stdout) console.error(`stdout: ${error.stdout}`);
    if (error.stderr) console.error(`stderr: ${error.stderr}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 Initiating Programmatic Plane Issue Sync for Majors Completeness Project...\n');

  // --- Step 1: Create EPIC Issue (In Progress) ---
  const epicDescription = `
<h3>📊 College Majors Database Integrity & Completeness Epic</h3>
<p>Based on our comprehensive programmatic database audit, the following severe gaps have been identified:</p>
<ul>
  <li><strong>Core Subject Demands:</strong> 100% Gaps (152/152 majors set to NULL).</li>
  <li><strong>Career Peak Earnings:</strong> 96.1% Gaps (146/152 majors set to NULL).</li>
  <li><strong>University Mappings:</strong> 86.8% Gaps (132/152 majors have ZERO college associations).</li>
</ul>
<p>This Epic oversees the E2E replenishment project to enrich our standard majors' metrics, generate cross-university semantic mappings, and design visual spotlighting on the bilingual dashboard.</p>
  `.trim();

  const epicPayload = {
    name: '[EPIC] College Majors Data Completeness & Integrity Restoration',
    priority: 'high',
    state: STATE_IN_PROGRESS,
    description_html: epicDescription
  };

  const epicTempFile = createTempPayloadFile('epic', epicPayload);
  let epicResult: any;
  try {
    epicResult = runPlaneCli('create-issue', epicTempFile);
    console.log(`✅ Success: Epic Issue Created! ID: ${epicResult.data.id}\n`);
  } finally {
    if (fs.existsSync(epicTempFile)) fs.unlinkSync(epicTempFile);
  }

  const epicId = epicResult.data.id;

  // --- Step 2: Create the 5 Child Tasks (Todo) ---
  const subTasks = [
    {
      name: 'Task 1: Subject Demands Enrichment (math, physics, chemistry, humanities)',
      priority: 'high',
      state: STATE_TODO,
      parent: epicId,
      description_html: `
<h3>🎯 Goal</h3>
<p>Populate core academic subject demand columns (<code>mathDemand</code>, <code>physicsDemand</code>, <code>chemistryDemand</code>, <code>humanitiesDemand</code>) for all 152 standard majors using expert rule lookups or high-fidelity LLM translation scripts.</p>
<h3>📋 Key Deliverables</h3>
<ul>
  <li>Assign 'H' (High), 'M' (Medium), or 'L' (Low) demand levels to each major.</li>
  <li>Validate that no majors remain NULL on demands.</li>
</ul>
      `.trim()
    },
    {
      name: 'Task 2: Career Peak Earnings Estimation & NCES Ingestion',
      priority: 'high',
      state: STATE_TODO,
      parent: epicId,
      description_html: `
<h3>🎯 Goal</h3>
<p>Hydrate career peak earnings (<code>earningsValue</code>) for the remaining 146 standard majors by using statistical regression matrices derived from Broad/Detailed Field averages, or direct NCES / College Scorecard API ingestions.</p>
<h3>📋 Key Deliverables</h3>
<ul>
  <li>Formulate a clean regression calculator fallback for peak earnings.</li>
  <li>Update major table rows in the database.</li>
</ul>
      `.trim()
    },
    {
      name: 'Task 3: University Mappings Expansion (Wikidata & Dept Scraping)',
      priority: 'high',
      state: STATE_TODO,
      parent: epicId,
      description_html: `
<h3>🎯 Goal</h3>
<p>Eradicate the 86.8% coverage gap. Ingest brand new university-major associations (<code>UniversityMajorAssociation</code>) by writing automated queries targeting NCES IPEDS databases or Wikidata SPARQL endpoints.</p>
<h3>📋 Key Deliverables</h3>
<ul>
  <li>Bridge the association gap to ensure &gt;= 80% of standard majors link to at least one valid university.</li>
  <li>Establish robust error handling and exponential retries for public endpoint ingestion.</li>
</ul>
      `.trim()
    },
    {
      name: 'Task 4: Automated Matching Pipeline & Quality Control (mappingScore)',
      priority: 'medium',
      state: STATE_TODO,
      parent: epicId,
      description_html: `
<h3>🎯 Goal</h3>
<p>Implement a clean semantic matching engine. For all newly generated mappings, calculate the <code>mappingScore</code> using lexical similarity (e.g. Jaro-Winkler) or embeddings. Mark mappings below a similarity threshold (e.g. &lt; 0.7) as unvalidated for manual audit.</p>
<h3>📋 Key Deliverables</h3>
<ul>
  <li>Write scoring utility in <code>src/utils/</code>.</li>
  <li>Ensure newly created mappings automatically populate <code>mappingScore</code>.</li>
</ul>
      `.trim()
    },
    {
      name: 'Task 5: Bilingual Frontend Spotlight & Dynamic Analytics UI',
      priority: 'high',
      state: STATE_TODO,
      parent: epicId,
      description_html: `
<h3>🎯 Goal</h3>
<p>Create a stunning glassmorphic UI dashboard in React to highlight the newly enriched majors data. Display demands visually via interactive charts, present earning curves, and list offering universities dynamically.</p>
<h3>📋 Key Deliverables</h3>
<ul>
  <li>Bilingual localization translation support for all new widgets.</li>
  <li>Draggable canvas overlays or responsive CSS layouts that feel extremely premium.</li>
</ul>
      `.trim()
    }
  ];

  console.log(`📦 Seeding 5 child tasks associated to parent Epic: ${epicId}...\n`);

  for (let i = 0; i < subTasks.length; i++) {
    const task = subTasks[i];
    const taskTempFile = createTempPayloadFile(`task_${i + 1}`, task);
    try {
      const taskResult = runPlaneCli('create-issue', taskTempFile);
      console.log(`   └─ ✅ Created Subtask ${i + 1}: "${taskResult.data.name}" -> ID: ${taskResult.data.id}`);
    } finally {
      if (fs.existsSync(taskTempFile)) fs.unlinkSync(taskTempFile);
    }
  }

  console.log('\n🌟 Plane project issues synchronization completed perfectly!');
}

main().catch((err) => {
  console.error('❌ Sync failed unexpectedly:', err);
  process.exit(1);
});
