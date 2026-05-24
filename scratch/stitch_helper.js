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
  return data;
}

// Check arguments
const [,, toolName, ...jsonArgs] = process.argv;

if (!toolName) {
  console.log('Usage: node stitch_helper.js <toolName> [jsonArguments]');
  process.exit(0);
}

let parsedArgs = {};
if (jsonArgs.length > 0) {
  try {
    parsedArgs = JSON.parse(jsonArgs.join(' '));
  } catch (err) {
    console.error('Error parsing JSON arguments:', err.message);
    process.exit(1);
  }
}

callTool(toolName, parsedArgs)
  .then(res => {
    console.log(JSON.stringify(res, null, 2));
  })
  .catch(err => {
    console.error('Execution error:', err.message);
    process.exit(1);
  });
