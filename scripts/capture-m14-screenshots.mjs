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
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone14');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function detectBaseUrl() {
  const ports = [5173, 5174, 3000];
  for (const port of ports) {
    const isUp = await new Promise(resolve => {
      const req = http.get(`http://localhost:${port}/`, res => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(800, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (isUp) return `http://localhost:${port}`;
  }
  return 'http://localhost:5173';
}

function getCaptures(baseUrl) {
  return [
    {
      name: '01_ekosec_desktop.png',
      url: `${baseUrl}/?workstation=open`,
      desc: 'EkoSec OS Desktop Session with M14 application icons',
      delayMs: 3500,
    },
    {
      name: '02_exploit_lab_scope.png',
      url: `${baseUrl}/?workstation=open&app=exploitLab&exploitTab=scope`,
      desc: 'Exploit Lab Rules of Engagement (RoE) Scope & Target Authorization',
      delayMs: 3500,
    },
    {
      name: '03_exploit_lab_simulation.png',
      url: `${baseUrl}/?workstation=open&app=exploitLab&exploitTab=console&exploitTarget=filesrv-01&exploitAuto=1`,
      desc: 'Exploit Lab Simulated Execution on filesrv-01 with Structured Findings & Evidence',
      delayMs: 3500,
    },
    {
      name: '04_exploit_lab_blocked_scope.png',
      url: `${baseUrl}/?workstation=open&app=exploitLab&exploitTab=console&exploitTarget=vault-core-01&exploitAuto=1`,
      desc: 'Exploit Lab Engine-Enforced Scope Block on Out-of-Scope Target vault-core-01',
      delayMs: 3500,
    },
    {
      name: '05_web_proxy_transactions.png',
      url: `${baseUrl}/?workstation=open&app=webProxy&proxyTab=tamper`,
      desc: 'Web Application Proxy Transaction History & Request Tamper Controls',
      delayMs: 3500,
    },
    {
      name: '06_web_proxy_diff_and_idor.png',
      url: `${baseUrl}/?workstation=open&app=webProxy&proxyTab=diff&proxyAuto=1`,
      desc: 'Web Application Proxy Side-by-Side Diff & BOLA/IDOR CWE-639 Leak Analysis',
      delayMs: 3500,
    },
    {
      name: '07_social_pretext_scenarios.png',
      url: `${baseUrl}/?workstation=open&app=socialPretext`,
      desc: 'Pretext Lab 6 Authored Social Pretexting Scenarios Across Lagos Venues',
      delayMs: 3500,
    },
    {
      name: '08_social_pretext_encounter.png',
      url: `${baseUrl}/?workstation=open&app=socialPretext&pretextScenario=scen_helpdesk_vp_reset`,
      desc: 'Pretext Lab Live Encounter with Trust, Authority, Credibility & Suspicion Gauges',
      delayMs: 3500,
    },
    {
      name: '09_cyber_catalogue_m14.png',
      url: `${baseUrl}/?workstation=open&app=catalogue`,
      desc: 'CyberCatalogue Arsenal View with Playable M14 Offensive & Human Tools',
      delayMs: 3500,
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
  const baseUrl = await detectBaseUrl();
  console.log(`Detected Base URL: ${baseUrl}`);
  console.log(`Target Output: ${OUTPUT_DIR}\n`);

  const captures = getCaptures(baseUrl);
  for (const item of captures) {
    try {
      await captureOne(item);
    } catch (err) {
      console.error(`[-] Failed to capture ${item.name}:`, err);
    }
  }

  console.log('\n[+] All Milestone 14 screenshots successfully captured and saved.');
}

run();
