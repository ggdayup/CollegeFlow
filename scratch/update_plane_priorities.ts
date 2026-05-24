import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = '/Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js';
const WORKSPACE_SLUG = 'sheenvita';
const PROJECT_ID = '15c381fa-d6ad-4f10-8c47-2b04a3a342b5';

const scratchDir = path.join(process.cwd(), 'scratch');

function createTempPayloadFile(name: string, payload: object): string {
  const filePath = path.join(scratchDir, `temp_update_${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  return filePath;
}

function runPlaneCli(issueId: string, payloadPath: string) {
  const fullCmd = `node "${CLI_PATH}" update-issue ${WORKSPACE_SLUG} ${PROJECT_ID} ${issueId} "${payloadPath}"`;
  console.log(`Running: ${fullCmd}`);
  try {
    const stdout = execSync(fullCmd, { encoding: 'utf-8' });
    console.log(`✅ Success for issue ${issueId}`);
  } catch (error: any) {
    console.error(`Failed to update ${issueId}: ${error.message}`);
  }
}

async function main() {
  console.log('🔄 Re-aligning Plane Issue Priorities based on Urgent Focus Shift...\n');

  // Task 3: University Mappings - Elevate to URGENT
  const task3Id = '4b831cd4-5999-430c-96f3-b864440ed770';
  const payloadUrgent = createTempPayloadFile('urgent', { priority: 'urgent' });
  try {
    runPlaneCli(task3Id, payloadUrgent);
  } finally {
    if (fs.existsSync(payloadUrgent)) fs.unlinkSync(payloadUrgent);
  }

  // Task 1, 2, 5 - Deprioritize to MEDIUM
  const otherTasks = [
    { id: '7013b7cd-5237-48ed-b1fd-50d0439fb065', name: 'Task 1' },
    { id: '07bfdb88-b417-4557-921b-07968093d0dd', name: 'Task 2' },
    { id: '2d8aeeb0-b8c3-40ee-88f9-428fefb22cff', name: 'Task 5' }
  ];

  const payloadMedium = createTempPayloadFile('medium', { priority: 'medium' });
  try {
    for (const task of otherTasks) {
      runPlaneCli(task.id, payloadMedium);
    }
  } finally {
    if (fs.existsSync(payloadMedium)) fs.unlinkSync(payloadMedium);
  }

  console.log('\n🌟 Plane board task priorities re-aligned perfectly!');
}

main().catch(console.error);
