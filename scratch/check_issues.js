import fs from 'fs';
import { execSync } from 'child_process';

try {
    const output = execSync('node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js list-issues sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5', { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
    const parsed = JSON.parse(output);
    if (parsed.success && parsed.data && parsed.data.results) {
        const activeIssues = parsed.data.results.filter(issue => {
            // state IDs: Backlog, Todo, In Progress
            return ['e51c56b6-8ef9-4b10-baaf-37b05bc94925', '16406b06-6ecc-4701-b8fc-0e807f5b9e4c', 'c7701ec6-17bc-4b40-a72f-2970f96cdc9e'].includes(issue.state);
        });
        console.log("=== Active Issues ===");
        activeIssues.forEach(issue => {
            let stateLabel = 'Backlog';
            if (issue.state === 'c7701ec6-17bc-4b40-a72f-2970f96cdc9e') stateLabel = 'In Progress';
            if (issue.state === '16406b06-6ecc-4701-b8fc-0e807f5b9e4c') stateLabel = 'Todo';
            console.log(`- [${stateLabel}] ${issue.name} (${issue.id})`);
        });
    } else {
        console.log("Failed to parse issues or no results", parsed);
    }
} catch (e) {
    console.error("Error checking issues:", e);
}
