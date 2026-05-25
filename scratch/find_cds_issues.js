import fs from 'fs';
import { execSync } from 'child_process';

try {
    const output = execSync('node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js list-issues sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5', { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
    const parsed = JSON.parse(output);
    if (parsed.success && parsed.data && parsed.data.results) {
        console.log("=== Matching Issues ===");
        parsed.data.results.forEach(issue => {
            if (issue.name.toLowerCase().includes('cds') || issue.name.toLowerCase().includes('schema') || issue.name.toLowerCase().includes('database')) {
                console.log(`- [${issue.state}] ${issue.name} (${issue.id})`);
            }
        });
    }
} catch (e) {
    console.error(e);
}
