import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = '/Users/protector/.gemini/antigravity-ide/brain/73070090-5781-4f2f-bd5b-f404cee51b5f/scratch';

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture(url, outputFile, width, height) {
  const outputPath = join(OUTPUT_DIR, outputFile);
  console.log(`[*] Capturing screenshot to: ${outputPath} (${width}x${height})`);
  
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      `--window-size=${width},${height}`,
      '--virtual-time-budget=4000',
      `--screenshot=${outputPath}`,
      url,
    ];

    const child = spawn(CHROME_PATH, args);
    child.on('close', code => {
      console.log(`[+] Chrome finished ${outputFile} with code: ${code}`);
      resolve(code);
    });
    child.on('error', err => {
      console.error(`[-] Chrome spawn error:`, err);
      reject(err);
    });
  });
}

async function run() {
  // 1. Mobile viewport (375x667 - iPhone SE width)
  await capture('http://localhost:5173/?skipIntro=true', 'hud_mobile_375px.png', 375, 667);

  // 2. Desktop view with incident workstation active (1440x900)
  await capture('http://localhost:5173/?desktop=open&skipIntro=true', 'desktop_soc_incident.png', 1440, 900);

  // 3. Desktop view with Incident App open directly
  await capture('http://localhost:5173/?desktop=open&app=incident&skipIntro=true', 'desktop_incident_app.png', 1440, 900);

  // 4. Desktop view with Tor Browser open directly
  await capture('http://localhost:5173/?desktop=open&app=torBrowser&skipIntro=true', 'tor_browser_official_color.png', 1440, 900);

  // 5. Desktop world view with expanded objective tracker
  await capture('http://localhost:5173/?skipIntro=true', 'hud_objective_guidance.png', 1440, 900);
}

run().catch(console.error);
