const { execSync } = require('child_process');

try {
  const output = execSync('node /Users/ggdayup/.agent/skills/plane-api/scripts/plane-api.js list-issues sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5', { encoding: 'utf-8' });
  const data = JSON.parse(output);
  const openIssues = data.results.filter(issue => {
    // aa17c124-ecbb-4e70-bfde-7c607685f9f3 is Done
    // 08e8c222-091a-4597-9fd0-9969ceb12e5a is Cancelled
    return issue.state !== 'aa17c124-ecbb-4e70-bfde-7c607685f9f3' && issue.state !== '08e8c222-091a-4597-9fd0-9969ceb12e5a';
  });

  console.log(`Found ${openIssues.length} open issues:`);
  openIssues.forEach(issue => {
    console.log(`- [${issue.id}] Name: "${issue.name}" | State: ${issue.state} | Priority: ${issue.priority}`);
  });
} catch (error) {
  console.error('Error fetching/parsing issues:', error);
}
