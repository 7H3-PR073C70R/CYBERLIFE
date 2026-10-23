/**
 * Cyberlife — Step C Automated Headless Screenshot Capture Script
 *
 * Captures authentic screenshots for Step C Episode Delivery Framework:
 * 1. 01_stepC_title_card.png: Cold-open terminal boot sequence with SHA-256 hash and title card.
 * 2. 02_stepC_incident_ticket_arrival.png: Incident ticket dispatch TKT-2026-1012 from Blessing.
 * 3. 03_stepC_onion_chat_message.png: Encrypted Onion Chat telemetry warning from Tsharp.
 * 4. 04_stepC_journal_app_claims_badges.png: Encrypted Journal app showing forensic claims & truthfulness badges.
 * 5. 05_stepC_blackout_brownout.png: Blackout brownout overlay with inverter audio/telemetry alarm.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'stepC');

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
      name: '01_stepC_title_card.png',
      url: `${baseUrl}/?skipIntro=1&skipMenu=true&episode=ep01_triage_init`,
      desc: 'Step C — Cold-Open Title Card Overlay with SHA-256 Hash and Kernel Banner',
      delayMs: 3500,
    },
    {
      name: '02_stepC_incident_ticket_arrival.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&app=incident&tab=tickets`,
      desc: 'Step C — Priority SOC Triage Ticket TKT-2026-1012 in Incident Portal',
      delayMs: 4000,
    },
    {
      name: '03_stepC_onion_chat_message.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&app=onionChat&contact=tsharp`,
      desc: 'Step C — Onion Chat Encrypted Telemetry Message from Tsharp',
      delayMs: 4000,
    },
    {
      name: '04_stepC_journal_app_claims_badges.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&app=journal`,
      desc: 'Step C — Journal App (~/.vault/journal.enc) with Claims and Status Badges',
      delayMs: 4000,
    },
    {
      name: '05_stepC_blackout_brownout.png',
      url: `${baseUrl}/?skipIntro=1&skipMenu=true&blackout=1`,
      desc: 'Step C — Municipal Blackout / Brownout Flicker & Inverter Alarm Overlay',
      delayMs: 3000,
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
  console.log('=== Cyberlife Step C Headless Browser Verification ===');
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

  console.log('=== Step C Screenshot Capture Complete ===');
}

run().catch(err => {
  console.error('[-] Fatal error running Step C capture script:', err);
  process.exit(1);
});
