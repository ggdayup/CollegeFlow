import fs from 'fs';
const issuesData = JSON.parse(fs.readFileSync('scratch/plane_issues.json', 'utf8'));
const issues = Array.isArray(issuesData.data) ? issuesData.data : (issuesData.data.results || []);

console.log(`Total issues found: ${issues.length}`);
const activeIssues = issues.filter(issue => {
  return issue.state !== 'aa17c124-ecbb-4e70-bfde-7c607685f9f3' && issue.state !== '08e8c222-091a-4597-9fd0-9969ceb12e5a';
});

console.log('Active Issues:');
activeIssues.forEach(issue => {
  console.log(`- [${issue.id}] State: ${issue.state} | Priority: ${issue.priority} | Name: ${issue.name}`);
});
