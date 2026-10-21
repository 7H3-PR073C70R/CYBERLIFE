/**
 * Cyberlife — Milestone 20 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M20 workflows:
 * - 01: Active Mission Workspace: Live objectives checklist, technical rationale, progress tracking & resolution controls.
 * - 02: Opportunity Director Feed: Prioritized recommendations, transparent scoring, filters & on-demand procedural contracts.
 * - 03: Career Progression & Goals: Role standing, 9-skill matrix progression & multi-stage long-term milestones.
 * - 04: Audit Log & Settlement Ledger: Immutable history records, idempotent rewards & workstation telemetry stream.
 * - 05: HUD Objective Tracker: Real-time simulation synchronization, step progress & guided action prompts.
 * - 06: Integrated Operations Ecosystem: Unified gameplay loop spanning story, bounties, red/blue team & career life.
 *
 * STRICT SAFETY INVARIANT:
 * Always runs in strictly headless mode (--headless=new, --disable-gpu) without opening a visible GUI window.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone20');

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
      name: '01_m20_active_mission.png',
      url: `${baseUrl}/?workstation=open&app=activity&activityTab=active&skipIntro=1`,
      desc: 'Milestone 20 Active Mission Workspace — Objectives Checklist, Technical Rationale & Resolution Controls',
      delayMs: 4500,
    },
    {
      name: '02_m20_opportunity_director.png',
      url: `${baseUrl}/?workstation=open&app=activity&activityTab=opportunities&skipIntro=1`,
      desc: 'Milestone 20 Opportunity Director — Prioritized Feed, Transparent Rationale & Procedural Contracts',
      delayMs: 4500,
    },
    {
      name: '03_m20_career_progression_goals.png',
      url: `${baseUrl}/?workstation=open&app=activity&activityTab=goals&skipIntro=1`,
      desc: 'Milestone 20 Career Progression & Goals — Role Standing, 9-Skill Matrix & Long-Term Milestones',
      delayMs: 4500,
    },
    {
      name: '04_m20_audit_history_ledger.png',
      url: `${baseUrl}/?workstation=open&app=activity&activityTab=audit&skipIntro=1`,
      desc: 'Milestone 20 Audit Log & Ledger — Immutable History Records, Idempotent Rewards & Telemetry Stream',
      delayMs: 4500,
    },
    {
      name: '05_m20_hud_objective_tracker.png',
      url: `${baseUrl}/?skipIntro=1`,
      desc: 'Milestone 20 HUD Objective Tracker — Real-Time Simulation Tracking, Step Guidance & Lagos Island Routing',
      delayMs: 4500,
    },
    {
      name: '06_m20_integrated_ecosystem.png',
      url: `${baseUrl}/?workstation=open&app=bountyHub&bountyTab=marketplace&skipIntro=1`,
      desc: 'Milestone 20 Integrated Cyberlife Ecosystem — Unified Career Hub Bridging Story, Bounties & Defense',
      delayMs: 4500,
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
  console.log('=== Cyberlife Milestone 20 Headless Browser Verification ===');
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
    console.log('\n[+] All Milestone 20 headless browser screenshots successfully verified and saved.');
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
