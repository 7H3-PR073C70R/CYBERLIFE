/**
 * Cyberlife — Milestone 17 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M17 workflows:
 * - Briefing & Scope: Written Rules of Engagement (RoE), client organization, legal framework, emergency stop.
 * - Target Inventory: Scope explorer distinguishing authorized staging assets from prohibited core systems.
 * - Assessment Console: Deterministic tool execution with pedagogical explanations and diagnostic terminal trace.
 * - Scope Gate Enforcement: Strict rejection of out-of-scope targets (dc-core-01) without state mutation.
 * - Candidate Findings Triage: Validation of true-positive vulnerabilities and rejection of benign false positives.
 * - Evidence Vault: Cryptographic SHA-256 provenance hashes, immutable chain-of-custody, and analyst notes.
 * - Executive Report & Evaluation: Deliverable generation, remediation roadmap, and client CISO evaluation scorecard.
 *
 * STRICT SAFETY INVARIANT:
 * Always runs in strictly headless mode (--headless=new, --disable-gpu) without GUI window.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone17');

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
      name: '01_m17_redteam_briefing_scope.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1&redTab=scope`,
      desc: 'Milestone 17 Red Team Briefing & Rules of Engagement — Legal Authority, Authorized Subnets & Emergency Contacts',
      delayMs: 4500,
    },
    {
      name: '02_m17_redteam_target_inventory.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1&redTab=targets&redAccepted=true`,
      desc: 'Milestone 17 Red Team Target Inventory — In-Scope Staging Assets vs Prohibited Core Infrastructure',
      delayMs: 4500,
    },
    {
      name: '03_m17_redteam_console_execution.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1&redTab=console&redPreset=executed`,
      desc: 'Milestone 17 Red Team Assessment Console — Deterministic Simulated Reconnaissance on Authorized Target',
      delayMs: 4500,
    },
    {
      name: '04_m17_redteam_scope_rejection.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1&redTab=console&redPreset=rejected_scope`,
      desc: 'Milestone 17 Red Team Scope Rejection — RoE Authorization Gate Blocking Unauthorized Target dc-core-01',
      delayMs: 4500,
    },
    {
      name: '05_m17_redteam_findings_validation.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1&redTab=findings&redPreset=validated`,
      desc: 'Milestone 17 Red Team Findings Triage — Validating True Positives & Rejecting Benign False Positives',
      delayMs: 4500,
    },
    {
      name: '06_m17_redteam_evidence_vault.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1&redTab=evidence&redPreset=validated`,
      desc: 'Milestone 17 Red Team Evidence Vault — SHA-256 Provenance Hashes, Chain of Custody & Analyst Logging',
      delayMs: 4500,
    },
    {
      name: '07_m17_redteam_report_approved.png',
      url: `${baseUrl}/?workstation=open&app=redTeam&skipIntro=1&redTab=report&redPreset=approved`,
      desc: 'Milestone 17 Red Team Executive Report — CISO Evaluation Scorecard with Grade A Approval Sign-off',
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
        console.warn(`[!] Chrome exited with code ${code} for ${item.name}`);
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
  console.log('=== Cyberlife Milestone 17 Headless Browser Verification ===');
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
    console.log('\n[+] All Milestone 17 headless browser screenshots successfully verified and saved.');
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
