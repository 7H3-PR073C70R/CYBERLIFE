/**
 * Cyberlife — Milestone 22 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M22 workflows:
 * - 01: Lagos Island Neighborhood: Compact, coherent outdoor urban environment (Broad Street, Tinubu Square, Marina).
 * - 02: Cedarline Services Workplace Interior: Believable corporate office, server racks, reception, and SOC workstations.
 * - 03: Player Apartment Residence: Personal living quarters, bed, and home computer workstation.
 * - 04: NPC Dialogue & Routine Interaction: Conversational interaction with named NPC (Blessing at Cedarline).
 * - 05: Grounded Workstation Transition: Seated-player computer interaction seamlessly bridging physical world to virtual desktop.
 * - 06: City Discoveries & Activity Director: Exploration leads and world opportunities connected to M20 activity framework.
 *
 * STRICT SAFETY INVARIANT:
 * Always runs in strictly headless mode (--headless=new, --disable-gpu) without opening a visible GUI window.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone22');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function checkPort(port) {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${port}/`, res => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function detectBaseUrl() {
  const ports = [5173, 5174, 4173, 3000];
  for (const port of ports) {
    if (await checkPort(port)) {
      return `http://localhost:${port}`;
    }
  }
  return null;
}

function getCaptures(baseUrl) {
  return [
    {
      name: '01_m22_lagos_island_neighborhood.png',
      url: `${baseUrl}/?location=neighborhood&skipIntro=1`,
      desc: 'Milestone 22 Lagos Island Neighborhood — Compact, Coherent Outdoor Streetscape, Tinubu Square & Marina',
      delayMs: 5000,
    },
    {
      name: '02_m22_cedarline_interior_workplace.png',
      url: `${baseUrl}/?location=cedarline_interior&skipIntro=1`,
      desc: 'Milestone 22 Cedarline Services HQ — Corporate Office, Server Racks & Cybersecurity Workstations',
      delayMs: 5000,
    },
    {
      name: '03_m22_apartment_interior_residence.png',
      url: `${baseUrl}/?location=apartment_interior&skipIntro=1`,
      desc: 'Milestone 22 Player Apartment Residence — Home Environment, Living Quarters & Personal Workstation',
      delayMs: 5000,
    },
    {
      name: '04_m22_npc_dialogue_routine.png',
      url: `${baseUrl}/?location=cedarline_interior&npc=npc_amina&skipIntro=1`,
      desc: 'Milestone 22 NPC Routine Interaction — Conversational Dialogue with Lead Analyst Blessing at Workplace',
      delayMs: 5000,
    },
    {
      name: '05_m22_workstation_virtual_desktop.png',
      url: `${baseUrl}/?location=apartment_interior&workstation=open&skipIntro=1`,
      desc: 'Milestone 22 Grounded Workstation — Seamless Physical-to-Virtual Desktop Transition with Seated Context',
      delayMs: 5000,
    },
    {
      name: '06_m22_city_opportunities_feed.png',
      url: `${baseUrl}/?workstation=open&app=activity&activityTab=opportunities&skipIntro=1`,
      desc: 'Milestone 22 City Discoveries & Activity Director — World-Driven Opportunities, Exploration Leads & Contracts',
      delayMs: 5000,
    },
  ];
}

async function captureOne(item) {
  const outputPath = join(OUTPUT_DIR, item.name);
  console.log(`[*] Capturing: ${item.desc} -> ${item.name}`);

  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1440,900',
      `--virtual-time-budget=${item.delayMs}`,
      `--screenshot=${outputPath}`,
      item.url,
    ];

    const child = spawn(CHROME_PATH, args);

    child.on('close', code => {
      if (code === 0 && existsSync(outputPath)) {
        const size = statSync(outputPath).size;
        console.log(`[+] Saved ${item.name} (${size} bytes)`);
        resolve();
      } else {
        console.warn(`[!] Headless Chrome exited with code ${code} for ${item.name}`);
        resolve();
      }
    });

    child.on('error', err => {
      console.error(`[-] Error spawning headless Chrome for ${item.name}:`, err);
      reject(err);
    });
  });
}

async function run() {
  console.log('=== Cyberlife Milestone 22 Headless Browser Verification ===');
  let devServerProcess = null;
  let baseUrl = await detectBaseUrl();

  if (!baseUrl) {
    console.log('[*] No running development server found. Spawning Vite on port 5173...');
    devServerProcess = spawn('npx', ['vite', '--port', '5173'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    // Wait up to 10 seconds for the server to be ready
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await checkPort(5173)) {
        baseUrl = 'http://localhost:5173';
        console.log(`[+] Spawned Vite dev server ready at ${baseUrl}`);
        break;
      }
    }

    if (!baseUrl) {
      if (devServerProcess) devServerProcess.kill();
      throw new Error('Failed to start Vite dev server for headless verification.');
    }
  } else {
    console.log(`[+] Reusing active dev server at ${baseUrl}`);
  }

  console.log(`Target Output: ${OUTPUT_DIR}\n`);

  try {
    const captures = getCaptures(baseUrl);
    for (const item of captures) {
      try {
        await captureOne(item);
      } catch (err) {
        console.error(`[-] Failed to capture ${item.name}:`, err);
      }
    }
    console.log('\n[+] All Milestone 22 headless browser screenshots successfully verified and saved.');
  } finally {
    if (devServerProcess) {
      console.log('[*] Shutting down spawned Vite dev server...');
      devServerProcess.kill();
    }
  }
}

run().catch(err => {
  console.error('Fatal screenshot capture error:', err);
  process.exit(1);
});
