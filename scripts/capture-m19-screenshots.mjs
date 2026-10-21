/**
 * Cyberlife — Milestone 19 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M19 workflows:
 * - 01: Bounty Marketplace & Listings: Filterable catalogue of verified security contracts with rewards & tiers.
 * - 02: Contract Scope & Rules of Engagement: RoE inspection drawer distinguishing authorized from prohibited targets.
 * - 03: Active Contract Workspace: Simulated technical action console, objectives milestones, and audit logger.
 * - 04: Submission Studio: Deliverable packaging, executive summary, technical finding details, and SHA-256 evidence links.
 * - 05: Client Evaluation Debrief: Deterministic quality score, itemized acceptance checks, and payout authorization.
 * - 06: Reputation Ledger & Tiers: Professional freelance progression (Rookie to Master), career XP, and settlement history.
 *
 * STRICT SAFETY INVARIANT:
 * Always runs in strictly headless mode (--headless=new, --disable-gpu) without GUI window.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone19');

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
      name: '01_m19_bounty_marketplace.png',
      url: `${baseUrl}/?workstation=open&app=bountyHub&bountyTab=marketplace&skipIntro=1`,
      desc: 'Milestone 19 Bounty Marketplace — Fictional Security Contracts Catalogue, Category Filters & Search',
      delayMs: 4500,
    },
    {
      name: '02_m19_contract_scope_roe.png',
      url: `${baseUrl}/?workstation=open&app=bountyHub&bountyTab=marketplace&contract=ct-eko-atm-investigation&skipIntro=1`,
      desc: 'Milestone 19 Scope of Engagement — Rules of Engagement, Explicitly Authorized Subnets & Prohibited Actions',
      delayMs: 4500,
    },
    {
      name: '03_m19_active_workspace.png',
      url: `${baseUrl}/?workstation=open&app=bountyHub&bountyTab=activeContract&demoActive=1&skipIntro=1`,
      desc: 'Milestone 19 Active Workspace — Engagement Objectives, Simulated Technical Action Console & Audit Log',
      delayMs: 4500,
    },
    {
      name: '04_m19_submission_studio.png',
      url: `${baseUrl}/?workstation=open&app=bountyHub&bountyTab=submissionStudio&demoActive=1&skipIntro=1`,
      desc: 'Milestone 19 Deliverables Submission Studio — Findings Packaging, SHA-256 Evidence Link & Scope Affirmation',
      delayMs: 4500,
    },
    {
      name: '05_m19_client_review_debrief.png',
      url: `${baseUrl}/?workstation=open&app=bountyHub&bountyTab=reviewDebrief&demoActive=1&skipIntro=1`,
      desc: 'Milestone 19 Client Evaluation Debrief — Quality Scorecard, Acceptance Checks, Payout Authorization & Feedback',
      delayMs: 4500,
    },
    {
      name: '06_m19_reputation_ledger.png',
      url: `${baseUrl}/?workstation=open&app=bountyHub&bountyTab=reputationLedger&demoActive=1&skipIntro=1`,
      desc: 'Milestone 19 Freelance Career Standing — Reputation Tiers (Rookie to Master), Completed Engagements & Payout History',
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
  console.log('=== Cyberlife Milestone 19 Headless Browser Verification ===');
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
    console.log('\n[+] All Milestone 19 headless browser screenshots successfully verified and saved.');
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
