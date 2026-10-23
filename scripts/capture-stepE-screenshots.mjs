/**
 * Cyberlife — Step E Episode 01 Automated Headless Screenshot Capture Script
 *
 * Captures all 10 authentic vertical slice screenshots into docs/graphics/stepE/:
 * 1. 01_cold_open_title.png: Cold open title card with SHA-256 hash
 * 2. 02_apartment_morning.png: Apartment morning at 07:00
 * 3. 03_packetlens_smb2_filter.png: Packet Lens with smb2.cmd == 5 && ip.addr == 10.0.4.15
 * 4. 04_cef_siem_alerts.png: CEF alerts from mon-siem-01 via logview filter --source=siem
 * 5. 05_barry_dialogue.png: Barry's nervous dialogue encounter
 * 6. 06_incident_choice.png: Choice screen (Choice A vs Choice B escalation)
 * 7. 07_defender_view.png: Defender View purple-team forensic timeline
 * 8. 08_day_debrief.png: SecOps Incident Debrief scorecard with NIST SP 800-61r2 & ATT&CK
 * 9. 09_journal_second_entry.png: Encrypted journal with second entry and claims
 * 10. 10_cliffhanger_blackout.png: Cliffhanger municipal blackout & /tmp/nexus_handshake_dump.pcap
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'stepE');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function checkPort(port) {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${port}/`, res => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function detectBaseUrl() {
  const ports = [4173, 5173, 5174, 3000];
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
      name: '01_cold_open_title.png',
      url: `${baseUrl}/?skipIntro=1&skipMenu=true&episode=ep01_triage_init`,
      desc: 'Beat 1 — Cold open title card with SHA-256 hash and kernel banner',
    },
    {
      name: '02_apartment_morning.png',
      url: `${baseUrl}/?skipIntro=1&skipMenu=true&location=apartment_interior&hour=7`,
      desc: 'Beat 2 — Player apartment morning at 07:00',
    },
    {
      name: '03_packetlens_smb2_filter.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&skipBoot=1&episode=ep01_triage_init&app=packetLens&packetTab=traffic&filter=smb2.cmd%20%3D%3D%205%20%26%26%20ip.addr%20%3D%3D%2010.0.4.15`,
      desc: 'Beat 4 — Packet Lens with SMB2 Tree Connect display filter and payroll read',
    },
    {
      name: '04_cef_siem_alerts.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&skipBoot=1&app=terminal&cmd=logview%20filter%20--source=siem`,
      desc: 'Beat 5 — CEF format alerts from mon-siem-01 via logview terminal command',
    },
    {
      name: '05_barry_dialogue.png',
      url: `${baseUrl}/?skipIntro=1&skipMenu=true&npc=barry`,
      desc: 'Beat 3 — Barry dialogue encounter showing nervous behavior and alibi',
    },
    {
      name: '06_incident_choice.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&skipBoot=1&episode=ep01_triage_init&choice=1`,
      desc: 'Beat 8 — Incident escalation dilemma (Choice A vs Choice B)',
    },
    {
      name: '07_defender_view.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&skipBoot=1&episode=ep01_triage_init&defenderDebrief=1`,
      desc: 'Beat 10 — Defender View purple-team timeline and log correlation',
    },
    {
      name: '08_day_debrief.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&skipBoot=1&episode=ep01_triage_init&dayDebrief=1`,
      desc: 'Beat 9 — Enterprise SOC Day Debrief scorecard (NIST SP 800-61r2 & ATT&CK)',
    },
    {
      name: '09_journal_second_entry.png',
      url: `${baseUrl}/?workstation=open&skipIntro=1&skipMenu=true&skipBoot=1&episode=ep01_triage_init&app=journal&entry=ep01_journal_02`,
      desc: 'Beat 11 — Encrypted Journal (~/.vault/journal.enc) second entry with contradiction claims',
    },
    {
      name: '10_cliffhanger_blackout.png',
      url: `${baseUrl}/?skipIntro=1&skipMenu=true&episode=ep01_triage_init&blackout=cliffhanger`,
      desc: 'Beat 12 — Cliffhanger municipal blackout, inverter alarm and dropped nexus PCAP',
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
      '--run-all-compositor-stages-before-draw',
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
  console.log('=== Cyberlife Step E Episode 01 Screenshot Capture ===');
  let devServerProcess = null;
  let baseUrl = await detectBaseUrl();

  if (!baseUrl) {
    console.log('[*] Spawning Vite preview on port 4173...');
    devServerProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await checkPort(4173)) {
        baseUrl = 'http://localhost:4173';
        console.log('[+] Server is ready on http://localhost:4173');
        break;
      }
    }
  } else {
    console.log(`[+] Using active server at ${baseUrl}`);
  }

  if (!baseUrl) {
    console.error('[-] Could not connect to server.');
    process.exit(1);
  }

  const items = getCaptures(baseUrl);
  for (const item of items) {
    await captureOne(item);
  }

  if (devServerProcess) {
    console.log('[*] Terminating spawned server...');
    devServerProcess.kill();
  }

  console.log('=== Step E Screenshot Capture Complete ===');
}

run().catch(err => {
  console.error('[-] Fatal error running Step E capture script:', err);
  process.exit(1);
});
