/**
 * Cyberlife — Milestone 24 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M24 full-game integration:
 * - 01: Lagos Living World: Broad Street & Tinubu Square with pedestrians, traffic, and dynamic lighting.
 * - 02: Orion OS Virtual Workstation: Full desktop suite with dock, system tray, and active workstation monitor.
 * - 03: Human Intelligence & Social Investigation Portal: Witness interviews, testimony contradiction analysis, and physical security audit.
 * - 04: Playable Cybersecurity Toolchain: Terminal executing digital forensics and SOC triage command suites.
 * - 05: Post-Story Career Progression & Activity Director: Continuing sandbox career loop, contracts, and long-term goals.
 * - 06: Red Team & Authorized Offensive Assessment: Rules of Engagement scope verification and vulnerability triage.
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
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone24');

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
      name: '01_m24_full_game_lagos_world.png',
      url: `${baseUrl}/?location=neighborhood&skipIntro=1`,
      desc: 'Milestone 24 Lagos Island World — Living City World Simulation, Broad Street & Tinubu Square',
      delayMs: 6000,
    },
    {
      name: '02_m24_workstation_desktop_suite.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1`,
      desc: 'Milestone 24 Orion OS Desktop — Full Operating System Environment with Integrated Cyber Applications',
      delayMs: 6000,
    },
    {
      name: '03_m24_human_intel_investigation.png',
      url: `${baseUrl}/?workstation=open&app=humanIntel&tab=interviews&skipIntro=1`,
      desc: 'Milestone 24 Human Intelligence & Physical Security Portal — Witness Questioning & Contradiction Evaluation',
      delayMs: 6000,
    },
    {
      name: '04_m24_digital_forensics_soc_terminal.png',
      url: `${baseUrl}/?workstation=open&app=terminal&cmd=forensics%20status&skipIntro=1`,
      desc: 'Milestone 24 Simulated Cyber Terminal — Digital Forensics & SOC Triage Workflow Execution',
      delayMs: 6000,
    },
    {
      name: '05_m24_post_story_career_progression.png',
      url: `${baseUrl}/?workstation=open&app=activity&skipIntro=1`,
      desc: 'Milestone 24 Post-Story Career Loop — Shared Activity Director, Contracts, and Infinite Progression',
      delayMs: 6000,
    },
    {
      name: '06_m24_red_team_offensive_assessment.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1`,
      desc: 'Milestone 24 Red Team Assessment Portal — Cryptographic RoE Authorization Gate & Finding Submission',
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
  console.log('=== Cyberlife Milestone 24 Headless Browser Verification ===');
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

  console.log('=== Milestone 24 Screenshot Capture Complete ===');
}

run().catch(err => {
  console.error('[-] Fatal error running M24 capture script:', err);
  process.exit(1);
});
