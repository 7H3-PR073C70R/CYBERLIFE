/**
 * Cyberlife — Milestone 14 Narrative & Graphics Verification Script
 *
 * Captures headless screenshots of the 3D world exploration and HUD
 * to verify real rigged humanoid characters (no boxes) and world graphics.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone14');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const captures = [
  {
    name: '10_m14_world_exploration.png',
    url: 'http://localhost:5173/?skipIntro=true',
    delayBudget: 5000,
  },
  {
    name: '11_m14_hud_workstation.png',
    url: 'http://localhost:5173/?skipIntro=true&workstation=open',
    delayBudget: 4000,
  },
];

async function captureNext(index = 0) {
  if (index >= captures.length) {
    console.log('[+] All M14 validation screenshots successfully captured.');
    process.exit(0);
  }

  const { name, url, delayBudget } = captures[index];
  const outPath = join(OUTPUT_DIR, name);
  console.log(`[*] Capturing [${index + 1}/${captures.length}] ${name} from ${url}...`);

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    `--virtual-time-budget=${delayBudget}`,
    `--screenshot=${outPath}`,
    url,
  ];

  const child = spawn(CHROME_PATH, args);

  child.on('close', code => {
    if (code === 0) {
      console.log(`[+] Captured: ${outPath}`);
      captureNext(index + 1);
    } else {
      console.error(`[-] Chrome failed with code ${code} for ${name}`);
      process.exit(code || 1);
    }
  });

  child.on('error', err => {
    console.error(`[-] Chrome spawn error:`, err);
    process.exit(1);
  });
}

captureNext();
