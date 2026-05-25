import fs from 'fs';
import { execSync } from 'child_process';

const issuePayload = {
    name: "PRD-112: Common Data Set Data Asset Integration",
    state: "aa17c124-ecbb-4e70-bfde-7c607685f9f3", // Done
    priority: "high",
    description_html: `
        <h3>PRD-112: Common Data Set Requirements & Implementation</h3>
        <p>This record tracks the product requirements and technical implementation of the Common Data Set (CDS) data asset inside CollegeFlow, fully aligned with the requirements in <code>PRD-112-common-data-set-cds.md</code>.</p>
        <h4>Asset Specification & Product Boundaries:</h4>
        <ul>
            <li><strong>Source Provenance:</strong> University-published official Common Data Set reports (2024-2025).</li>
            <li><strong>Value Proposition:</strong> Powers admissions selectivity, class profiles, financial aid, and transfer admissions contexts.</li>
            <li><strong>Zero Data Loss Condition:</strong> All elements (objects, lists, empty arrays, null disclosures) recursively parsed and mapped cleanly with 0 data loss.</li>
        </ul>
        <h4>Technical Deliverables & Verification:</h4>
        <ul>
            <li><strong>DDL Setup:</strong> PostgreSQL-native database schemas with dynamic section seeding from <code>init_pg_db.py</code>.</li>
            <li><strong>Ingestion Engine:</strong> Clean dot-path recursion, dynamic dictionary expansion, and reverse mapping resolution in <code>import_to_pg.py</code>.</li>
            <li><strong>Audit & Verification:</strong> Clean CLI reports verifying <code>stored_value_count = canonical_leaf_count</code> and <code>missing_cnt = 0</code> across all 16 target universities (totaling 10,119 facts).</li>
        </ul>
    `
};

try {
    const tempFile = 'scratch/temp_prd_issue.json';
    fs.writeFileSync(tempFile, JSON.stringify(issuePayload, null, 2));
    
    console.log("Creating Plane issue for PRD-112...");
    const cmd = `node /Users/ggdayup/.agents/skills/plane-api/scripts/plane-api.js create-issue sheenvita 15c381fa-d6ad-4f10-8c47-2b04a3a342b5 ${tempFile}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log("CLI Output:", output);
    
    fs.unlinkSync(tempFile);
} catch (e) {
    console.error("Error creating PRD issue:", e);
}
