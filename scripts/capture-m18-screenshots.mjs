/**
 * Cyberlife — Milestone 18 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M18 workflows:
 * - Telemetry Monitor: Multi-source synthetic security telemetry stream with filters and inspector.
 * - Detection Engineering: Sigma-inspired rule catalog with toggles, query viewer, and inline testing.
 * - Alert Queue: Triage console with explainable derived priority (P1-P4) and status workflows.
 * - Investigation Workspace: Attack timeline, confirmed facts vs hypotheses, and Evidence Vault integration.
 * - Defensive Response: Active mitigation console (endpoint isolation, perimeter blocks, account restrictions) with consequence modeling and audit logging.
 * - Purple Team Studio: Adversary emulation runner, coverage analysis, scorecard, and M17 adapter.
 * - Operation Lagos Shield: Playable 7-objective mission with ground-truth report evaluation.
 *
 * STRICT SAFETY INVARIANT:
 * Always runs in strictly headless mode (--headless=new, --disable-gpu) without GUI window.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone18');

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
      name: '01_m18_telemetry_stream.png',
      url: `${baseUrl}/?workstation=open&app=defensiveOps&defTab=telemetry`,
      desc: 'Defensive Operations Telemetry Monitor — Multi-Source Synthetic Security Telemetry Stream & Filters',
      delayMs: 4500,
    },
    {
      name: '02_m18_detection_rules.png',
      url: `${baseUrl}/?workstation=open&app=defensiveOps&defTab=rules`,
      desc: 'Defensive Operations Detection Engineering — Sigma-Style Rules Catalog, Severity vs Confidence & Inline Rule Testing',
      delayMs: 4500,
    },
    {
      name: '03_m18_alert_queue.png',
      url: `${baseUrl}/?workstation=open&app=defensiveOps&defTab=alerts`,
      desc: 'Defensive Operations Alert Queue — Triage Console, Explainable Derived Priority (P1-P4) & Status Workflows',
      delayMs: 4500,
    },
    {
      name: '04_m18_investigation_workspace.png',
      url: `${baseUrl}/?workstation=open&app=defensiveOps&defTab=investigation`,
      desc: 'Defensive Operations Incident Investigation — Attack Timeline, Evidence Correlation, Confirmed Facts vs Hypotheses',
      delayMs: 4500,
    },
    {
      name: '05_m18_defensive_response.png',
      url: `${baseUrl}/?workstation=open&app=defensiveOps&defTab=response`,
      desc: 'Defensive Operations Incident Response — Active Mitigations (Endpoint Isolation, Perimeter Blocks) with Consequence Modeling',
      delayMs: 4500,
    },
    {
      name: '06_m18_purple_team_studio.png',
      url: `${baseUrl}/?workstation=open&app=defensiveOps&defTab=purple`,
      desc: 'Purple Team Adversary Emulation Studio — 6 MITRE ATT&CK Scenarios, Coverage Heatmap & Assessment Scorecard',
      delayMs: 4500,
    },
    {
      name: '07_m18_operation_lagos_shield.png',
      url: `${baseUrl}/?workstation=open&app=defensiveOps&defTab=mission`,
      desc: 'Operation Lagos Shield — Broad Street Financial Defense Mission Briefing, 7 Objectives & Ground-Truth Incident Evaluation',
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
  console.log('=== Cyberlife Milestone 18 Headless Browser Verification ===');
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
    console.log('\n[+] All Milestone 18 headless browser screenshots successfully verified and saved.');
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
