import fs from 'fs';
import { execSync } from 'child_process';

const issuePayload = {
    state: "aa17c124-ecbb-4e70-bfde-7c607685f9f3", // Done
    description_html: `
        <h3>CDS PostgreSQL Ingestion and Verification Summary</h3>
        <p>Successfully implemented the 100% zero-data-loss flat fact schema for the Common Data Set (CDS) in PostgreSQL, fully conforming to the specs in <code>cds_schema_design.md</code> and <code>cds_schema.sql</code>.</p>
        <h4>Key Accomplishments:</h4>
        <ul>
            <li><strong>PostgreSQL DB Setup:</strong> Created <code>database/init_pg_db.py</code> and dynamically discovered section codes from the canonical schema key layout, dynamically seeding metadata definitions cleanly.</li>
            <li><strong>Robust Ingestion Engine:</strong> Built <code>database/import_to_pg.py</code> leveraging recursive deep traversal of JSON trees to flatten all structures (including objects, lists, empty structures, and explicit nulls) into <code>cds_values</code> facts. Reverse mapped all key configurations.</li>
            <li><strong>Audit & Verification:</strong> Authored <code>database/verify_pg_integrity.py</code>, ensuring that <code>stored_value_count = canonical_leaf_count</code>, <code>missing_value_count = 0</code>, and doc SHA256 checksums matched perfectly.</li>
        </ul>
        <h4>Audit Execution Output:</h4>
        <pre>
Total target institutions verified: 16
Total stored facts (values): 10,119
INTEGRITY AUDIT PASSED: Zero data loss verified across all loaded CDS documents.
        </pre>
        <h4>Modified/New Files:</h4>
        <ul>
            <li><code>database/cds_schema_design.md</code> (optimized)</li>
            <li><code>database/cds_schema.sql</code> (optimized)</li>
            <li><code>database/init_pg_db.py</code> (NEW)</li>
            <li><code>database/import_to_pg.py</code> (NEW)</li>
            <li><code>database/verify_pg_integrity.py</code> (NEW)</li>
        </ul>
    `
};

try {
    const tempFile = 'scratch/temp_complete.json';
    fs.writeFileSync(tempFile, JSON.stringify(issuePayload, null, 2));
    
    console.log("Completing Plane issue...");
    const cmd = `node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js update-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 3269b25a-ef40-45f0-9804-ad7c30882113 ${tempFile}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log("CLI Output:", output);
    
    fs.unlinkSync(tempFile);
} catch (e) {
    console.error("Error completing issue:", e);
}
