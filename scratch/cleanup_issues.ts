import { execSync } from 'child_process';

const CLI_PATH = '/Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js';
const WORKSPACE_SLUG = 'sheenvita';
const PROJECT_ID = '15c381fa-d6ad-4f10-8c47-2b04a3a342b5';

function runCliCommand(args: string[]): any {
  const fullCmd = `node "${CLI_PATH}" ${args.join(' ')}`;
  const stdout = execSync(fullCmd, { encoding: 'utf-8' });
  const jsonMatch = stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(stdout.trim());
}

async function main() {
  console.log('🧹 Scanning for mismatched major completeness issues to clean up...');
  
  const issuesResponse = runCliCommand(['list-issues', WORKSPACE_SLUG, PROJECT_ID]);
  if (!issuesResponse.success) {
    console.error('Failed to list issues');
    return;
  }

  const issues = Array.isArray(issuesResponse.data) ? issuesResponse.data : (issuesResponse.data.results || []);
  const toDelete = issues.filter((issue: any) => {
    return issue.name.includes('College Majors') || issue.name.includes('Task 1:') || issue.name.includes('Task 2:') || issue.name.includes('Task 3:') || issue.name.includes('Task 4:') || issue.name.includes('Task 5:');
  });

  console.log(`Found ${toDelete.length} issues to delete.`);
  for (const issue of toDelete) {
    console.log(`Deleting issue: ${issue.name} (${issue.id})`);
    runCliCommand(['delete-issue', WORKSPACE_SLUG, PROJECT_ID, issue.id]);
  }
  console.log('🧹 Clean up complete!');
}

main().catch(console.error);
