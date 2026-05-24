import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env helper
function loadEnv(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        env[key] = val;
      }
    });
  }
  return env;
}

const env = loadEnv('/Users/ggdayup/.agent/skills/stitch-mcp/.env.stitch');
const API_KEY = process.env.STITCH_API_KEY || env.STITCH_API_KEY;

if (!API_KEY) {
  console.error('Error: STITCH_API_KEY is not set');
  process.exit(1);
}

const MCP_URL = 'https://stitch.googleapis.com/mcp';

async function callTool(name, args = {}) {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name,
        arguments: args
      },
      id: 1
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
  }
  
  const data = await response.json();
  if (data.isError || (data.result && data.result.isError)) {
    throw new Error(`Tool execution error: ${JSON.stringify(data.result || data)}`);
  }
  return data.result;
}

async function runPipeline() {
  console.log('🚀 [1/4] Creating new Stitch project "College Major Career Analytics"...');
  const projectRes = await callTool('create_project', { title: 'College Major Career Analytics' });
  
  // Extract project ID
  let projectRaw = '';
  if (projectRes.content && projectRes.content[0]) {
    const parsed = JSON.parse(projectRes.content[0].text);
    projectRaw = parsed.name; // projects/XXXXXXXX
  } else {
    throw new Error('Could not parse project details from response: ' + JSON.stringify(projectRes));
  }
  
  const projectId = projectRaw.replace('projects/', '');
  console.log(`✅ Project created successfully! Project ID: ${projectId} (Resource: ${projectRaw})`);
  
  console.log('\n🎨 [2/4] Constructing brand-themed Design System in Stitch...');
  const dsRes = await callTool('create_design_system', {
    projectId,
    designSystem: {
      displayName: 'Royal Blue & Amber Academic Theme',
      theme: {
        colorMode: 'LIGHT',
        headlineFont: 'OUTFIT',
        bodyFont: 'INTER',
        roundness: 'ROUND_TWELVE',
        customColor: '#1E40AF'
      }
    }
  });
  
  // Extract Design System asset ID
  let dsAssetId = '';
  if (dsRes.content && dsRes.content[0]) {
    const text = dsRes.content[0].text;
    console.log('Design System raw output:', text);
    // Parse design system details to get name (assets/XXXXXXXX)
    const match = text.match(/assets\/(\d+)/);
    if (match) {
      dsAssetId = `assets/${match[1]}`;
    }
  }
  
  console.log(`✅ Design System registered successfully! Asset Name: ${dsAssetId || 'default'}`);
  
  console.log('\n✨ [3/4] Requesting Gemini 3.1 Pro via Stitch MCP to render Landing Page Screen...');
  const prompt = `A professional, premium SaaS Landing Page for 'College Major Career Analytics'. Designed with Outfit and Inter fonts, ROUND_TWELVE corners, and high-contrast Royal Blue (#1E40AF) and Academic Amber (#F59E0B) highlights.
The page contains the following sections:
1. Hero Section: Sleek header bar with bilingual Chinese/English toggle. A bold title '高校毕业生薪资与行业人才供求透视' ('Unlock College Major Lifetime ROI & Salaries'). A clean, stylized search bar input. Modern high-level Bento stat summary cards mapping '152 Majors', '200+ Elite US Universities', '+159% CS & STEM Growth', and '$146k Peak Sal'.
2. Product Bento Showcase: A beautifully arranged Bento grid showing visually stunning feature blocks for: '全美专业近况透视 (National Career Outlook)', '标杆院校专业地图 (Benchmark Universities Map)', '专业ROI回报曲线 (Salary Lifecycle ROI)', and '专业主修课程流 (Course Draggable Bento)'.
3. Insights & Analytics Panel: Spotlight summaries of Peak Earners, Income Warnings (Caution Zones), and structural talentRecede shifts (-33% Humanities).
4. SaaS Subscription Pricing plans: Premium-styled pricing cards featuring: '标准免费版 (Standard Free)' and '专业无限版 (Pro Unlimited - $19/mo)' with features checklist (All 152 majors, UMich/Rice map, Course topology, export CSV) and a primary call-to-action button '立即升级 / Upgrade Now' with glowing borders.
5. Smooth scroll anchors and interactive launch buttons leading users into the multi-dimensional analytics dashboard below.
Overall visual style should look extremely polished, editorial, responsive, clean, with premium shadows, fine card borders, and elegant grids.`;

  const screenRes = await callTool('generate_screen_from_text', {
    projectId,
    prompt,
    deviceType: 'DESKTOP',
    modelId: 'GEMINI_3_1_PRO',
    ...(dsAssetId ? { designSystem: dsAssetId } : {})
  });
  
  console.log('Stitch generation response received!');
  let screenDetails = {};
  if (screenRes.content && screenRes.content[0]) {
    const text = screenRes.content[0].text;
    console.log('Raw Screen JSON details:', text);
    screenDetails = JSON.parse(text);
  }
  
  // Wait, let's list screens in the project to fetch the final generated code
  console.log('\n🔍 [4/4] Ingesting screen listing to retrieve final rendered HTML Code...');
  let screenList = [];
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`Polling for screen generation (Attempt ${attempt}/5)...`);
    const listRes = await callTool('list_screens', { projectId });
    if (listRes.content && listRes.content[0]) {
      const parsed = JSON.parse(listRes.content[0].text);
      if (parsed.screens && parsed.screens.length > 0) {
        screenList = parsed.screens;
        break;
      }
    }
    await new Promise(r => setTimeout(r, 10000)); // wait 10s between checks
  }
  
  if (screenList.length === 0) {
    throw new Error('Screen generation did not complete within the timeout, or no screens were listed.');
  }
  
  const landingScreen = screenList[0];
  console.log(`🎉 Screen found! Title: "${landingScreen.title}"`);
  console.log(`HTML Code Resource: ${landingScreen.htmlCode?.name}`);
  console.log(`HTML Download URL: ${landingScreen.htmlCode?.downloadUrl}`);
  
  // Fetch and save raw HTML code
  const htmlRes = await fetch(landingScreen.htmlCode.downloadUrl);
  if (!htmlRes.ok) {
    throw new Error(`Failed to download HTML code: ${htmlRes.statusText}`);
  }
  const htmlContent = await htmlRes.text();
  const htmlPath = path.join(__dirname, 'stitch_landing_raw.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`\n💾 Raw HTML code saved successfully to ${htmlPath}`);
  console.log(`\nAll operations completed successfully!`);
}

runPipeline().catch(err => {
  console.error('Fatal Pipeline Error:', err);
  process.exit(1);
});
