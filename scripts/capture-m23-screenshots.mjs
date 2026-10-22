/**
 * Cyberlife — Milestone 23 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M23 workflows:
 * - 01: Lagos Broad Street: Polished urban streetscape, Lagos Cyber Defense Alliance gantry billboard, vehicles with accurate taillights, pedestrians, market stalls.
 * - 02: Cedarline Corporate SOC: Illuminated wall signage, 4-panel video wall, dual 42U server cabinets with status LEDs, Blessing & Tobi seated at workstations, concentric floor markers.
 * - 03: Player Apartment Residence: Warm natural morning light, domestic power inverter system ("NEPA GRID: ACTIVE [230V] // BATTERY: 98%"), Orion OS tech poster, bookshelf, rotating ceiling fan, and area rug.
 * - 04: Grounded Seated Workstation: Convincing seated player computer interaction, monitor/desk spatial alignment, and virtual desktop integration.
 * - 05: Digital Forensics Analyst Workflow: Terminal workstation session displaying Master File Table ($MFT) timeline analysis and anti-forensic timestomping detection.
 * - 06: Career & Professions Hub: Desktop career app displaying playable paths, progression tiers, and job tickets for Forensics, SOC, and Compliance Consulting.
 *
 * STRICT SAFETY INVARIANT:
 * Always runs in strictly headless mode (--headless=new, --enable-webgl, --ignore-gpu-blocklist)
 * without opening any visible GUI window.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone23');

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
      name: '01_m23_lagos_streetscape_polished.png',
      url: `${baseUrl}/?location=neighborhood&skipIntro=1`,
      desc: 'Milestone 23 Lagos Broad Street — Polished Lagos Island Streetscape, Cyber Defense Gantry Billboard & Traffic Taillights',
      delayMs: 6000,
    },
    {
      name: '02_m23_cedarline_soc_corporate.png',
      url: `${baseUrl}/?location=cedarline_interior&skipIntro=1`,
      desc: 'Milestone 23 Cedarline Corporate SOC — Illuminated Wall Sign, 4-Panel Video Wall, Server Racks with Blinking LEDs & Seated Workstations',
      delayMs: 6000,
    },
    {
      name: '03_m23_apartment_residence_warm.png',
      url: `${baseUrl}/?location=apartment_interior&skipIntro=1`,
      desc: 'Milestone 23 Player Apartment Residence — Morning Window Light, Domestic Inverter Backup Readout, Bookshelf & Area Rug',
      delayMs: 6000,
    },
    {
      name: '04_m23_seated_workstation_aligned.png',
      url: `${baseUrl}/?location=apartment_interior&workstation=open&skipIntro=1`,
      desc: 'Milestone 23 Grounded Workstation — Seated Player Computer Interaction Aligned with Desktop Transition',
      delayMs: 6000,
    },
    {
      name: '05_m23_digital_forensics_workflow.png',
      url: `${baseUrl}/?location=cedarline_interior&workstation=open&app=terminal&cmd=forensics%20hash&skipIntro=1`,
      desc: 'Milestone 23 Digital Forensics Analyst Workflow — Terminal Interface with Forensics Toolchain',
      delayMs: 6000,
    },
    {
      name: '06_m23_career_professions_hub.png',
      url: `${baseUrl}/?workstation=open&app=career&skipIntro=1`,
      desc: 'Milestone 23 Career & Professions Hub — Playable Career Paths & Job Listings for Forensics, SOC, and Compliance',
      delayMs: 6000,
    },
  ];
}

async function captureOne(item) {
  const outputPath = join(OUTPUT_DIR, item.name);
  console.log(`[*] Capturing: ${item.desc} -> ${item.name}`);

  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
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
  console.log('=== Cyberlife Milestone 23 Headless Browser Verification ===');
  let devServerProcess = null;
  let baseUrl = await detectBaseUrl();

  if (!baseUrl) {
    console.log('[*] No running development server found. Spawning Vite on port 5173...');
    devServerProcess = spawn('npx', ['vite', '--port', '5173'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await checkPort(5173)) {
        baseUrl = 'http://localhost:5173';
        console.log('[+] Vite server is ready on http://localhost:5173');
        break;
      }
    }
  } else {
    console.log(`[+] Reusing active dev server at ${baseUrl}`);
  }

  if (!baseUrl) {
    console.error('[-] Could not connect to dev server.');
    process.exit(1);
  }

  const items = getCaptures(baseUrl);
  for (const item of items) {
    await captureOne(item);
  }

  if (devServerProcess) {
    console.log('[*] Terminating spawned dev server...');
    devServerProcess.kill();
  }

  console.log('=== Milestone 23 Screenshot Capture Complete ===');
}

run().catch(err => {
  console.error('[-] Fatal error running M23 capture script:', err);
  process.exit(1);
});
