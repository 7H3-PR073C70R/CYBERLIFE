/**
 * Cyberlife — Step D Automated Headless Screenshot Capture Script
 *
 * Captures authentic screenshots for Step D Trace & Legal Exposure + Defender View Subsystem:
 * 1. 01_stepD_trace_meter_low.png: Workstation top panel with Trace meter low (nominal/quiet night recon).
 * 2. 02_stepD_trace_meter_high.png: Workstation top panel with Trace meter elevated/high (60%+ alert).
 * 3. 03_stepD_scope_warning.png: In-world diegetic Scope Warning Dialog ('This host is not in your authorised scope. Proceed?').
 * 4. 04_stepD_defender_response_message.png: Active Defender Response message / capsule in workstation.
 * 5. 05_stepD_defender_view_timeline.png: Purple-team Defender View modal ('What the Blue Team Saw') with timeline, ATT&CK & logs.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'stepD');

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
      name: '01_stepD_trace_meter_low.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&nightJob=1&trace=5`,
      desc: 'Step D — Workstation Top Panel Trace Meter Low (Quiet Recon / Passive OSINT)',
    },
    {
      name: '02_stepD_trace_meter_high.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&nightJob=1&trace=60`,
      desc: 'Step D — Workstation Top Panel Trace Meter High (Elevated Scan / 60% Trace)',
    },
    {
      name: '03_stepD_scope_warning.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&scopeWarning=1`,
      desc: 'Step D — In-World Rules of Engagement Scope Warning Modal',
    },
    {
      name: '04_stepD_defender_response_message.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&nightJob=1&trace=60`,
      desc: 'Step D — Defender Response Alert Pill and Rate Limit Telemetry',
    },
    {
      name: '05_stepD_defender_view_timeline.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&episode=ep01_triage_init&nightJob=1&trace=60&debrief=1`,
      desc: 'Step D — Defender View Purple Team Timeline & Forensic Debrief Modal',
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
  console.log('=== Cyberlife Step D Headless Browser Capture ===');
  let baseUrl = await detectBaseUrl();

  if (!baseUrl) {
    console.error('[-] Could not connect to dev server on 5173 or other ports.');
    process.exit(1);
  }

  console.log(`[+] Using active dev server at ${baseUrl}`);
  const items = getCaptures(baseUrl);
  for (const item of items) {
    await captureOne(item);
  }

  console.log('=== Step D Screenshot Capture Complete ===');
}

run().catch(err => {
  console.error('[-] Fatal error running Step D capture script:', err);
  process.exit(1);
});
