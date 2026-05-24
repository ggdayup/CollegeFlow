const fs = require('fs');
const execSync = require('child_process').execSync;

const output = execSync('node /Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js list-issues sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5').toString();
const parsed = JSON.parse(output);

if (parsed.success && parsed.data && parsed.data.results) {
  const issues = parsed.data.results;
  const states = {};
  issues.forEach(issue => {
    states[issue.state] = (states[issue.state] || 0) + 1;
    console.log(`[${issue.state}] #${issue.sequence_id}: ${issue.name}`);
  });
  console.log("State Counts:", states);
} else {
  console.log("Failed to fetch or parse issues");
}
