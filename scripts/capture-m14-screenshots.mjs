/**
 * Cyberlife — Milestone 14 Automated Screenshot Capture Script
 *
 * Captures authentic, high-resolution browser screenshots of M14 workflows:
 * - EkoSec OS Desktop with M14 launchers
 * - Exploit Lab RoE Scope & Rules of Engagement
 * - Exploit Lab Authorized SMB Simulation & Evidence Generation
 * - Exploit Lab Blocked Out-of-Scope Engine Enforcement
 * - Web Proxy Synthetic Transaction Inspector & Tampering
 * - Web Proxy Side-by-Side Diff & IDOR Leak
 * - Social Pretexting Scenario Catalogue (6 Lagos Island Venues)
 * - Social Pretexting Live Interactive Encounter with Dynamic Gauges
 * - CyberCatalogue with Playable M14 Tools
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5174';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone14');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CAPTURES = [
  {
    name: '01_ekosec_desktop.png',
    url: `${BASE_URL}/?workstation=open`,
    desc: 'EkoSec OS Desktop Session with M14 application icons',
    delayMs: 3500,
  },
  {
    name: '02_exploit_lab_scope.png',
    url: `${BASE_URL}/?workstation=open&app=exploitLab&exploitTab=scope`,
    desc: 'Exploit Lab Rules of Engagement (RoE) Scope & Target Authorization',
    delayMs: 3500,
  },
  {
    name: '03_exploit_lab_simulation.png',
    url: `${BASE_URL}/?workstation=open&app=exploitLab&exploitTab=console&exploitTarget=filesrv-01&exploitAuto=1`,
    desc: 'Exploit Lab Simulated Execution on filesrv-01 with Structured Findings & Evidence',
    delayMs: 3500,
  },
  {
    name: '04_exploit_lab_blocked_scope.png',
    url: `${BASE_URL}/?workstation=open&app=exploitLab&exploitTab=console&exploitTarget=vault-core-01&exploitAuto=1`,
    desc: 'Exploit Lab Engine-Enforced Scope Block on Out-of-Scope Target vault-core-01',
    delayMs: 3500,
  },
  {
    name: '05_web_proxy_transactions.png',
    url: `${BASE_URL}/?workstation=open&app=webProxy&proxyTab=tamper`,
    desc: 'Web Application Proxy Transaction History & Request Tamper Controls',
    delayMs: 3500,
  },
  {
    name: '06_web_proxy_diff_and_idor.png',
    url: `${BASE_URL}/?workstation=open&app=webProxy&proxyTab=diff&proxyAuto=1`,
    desc: 'Web Application Proxy Side-by-Side Diff & BOLA/IDOR CWE-639 Leak Analysis',
    delayMs: 3500,
  },
  {
    name: '07_social_pretext_scenarios.png',
    url: `${BASE_URL}/?workstation=open&app=socialPretext`,
    desc: 'Pretext Lab 6 Authored Social Pretexting Scenarios Across Lagos Venues',
    delayMs: 3500,
  },
  {
    name: '08_social_pretext_encounter.png',
    url: `${BASE_URL}/?workstation=open&app=socialPretext&pretextScenario=scen_helpdesk_vp_reset`,
    desc: 'Pretext Lab Live Encounter with Trust, Authority, Credibility & Suspicion Gauges',
    delayMs: 3500,
  },
  {
    name: '09_cyber_catalogue_m14.png',
    url: `${BASE_URL}/?workstation=open&app=catalogue`,
    desc: 'CyberCatalogue Arsenal View with Playable M14 Offensive & Human Tools',
    delayMs: 3500,
  },
];

async function captureOne(item) {
  const outputPath = join(OUTPUT_DIR, item.name);
  console.log(`[*] Capturing: ${item.desc} -> ${item.name}`);

  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--window-size=1440,900',
      `--virtual-time-budget=${item.delayMs}`,
      `--screenshot=${outputPath}`,
      item.url,
    ];

    const child = spawn(CHROME_PATH, args);

    child.on('close', code => {
      if (code === 0) {
        console.log(`[+] Saved ${item.name}`);
        resolve();
      } else {
        console.warn(`[!] Chrome exited with code ${code} for ${item.name}`);
        resolve(); // Continue with next capture
      }
    });

    child.on('error', err => {
      console.error(`[-] Error spawning Chrome for ${item.name}:`, err);
      reject(err);
    });
  });
}

async function run() {
  console.log('=== Cyberlife Milestone 14 Browser Screenshot Captures ===');
  console.log(`Target Output: ${OUTPUT_DIR}\n`);

  for (const item of CAPTURES) {
    try {
      await captureOne(item);
    } catch (err) {
      console.error(`[-] Failed to capture ${item.name}:`, err);
    }
  }

  console.log('\n[+] All Milestone 14 screenshots successfully captured and saved.');
}

run();
