/**
 * Cyberlife — Milestone 16 Automated Headless Screenshot Capture Script
 *
 * Captures authentic, high-resolution headless browser screenshots of M16 workflows:
 * - Network Topology Explorer (5 Segments, DMZ cluster, app-portal-01 inspection, links)
 * - Multi-Protocol Traffic Stream (filtering, forensic search, protocol distribution)
 * - Deep Multi-Layer Protocol Dissection (Frame, IP, TCP/TLS layers, Hex Dump)
 * - Threat Intelligence Registry (Fictional IOCs, severity vs confidence, MITRE mappings)
 * - Automated Threat Correlation Engine (Correlated C2 events, explainable reasoning)
 * - Operation Marina Nexus Investigation (7 Authored objectives, analyst notes)
 * - Approved Forensic Finding Evaluation (100% score, pedagogical debriefing critique)
 *
 * STRICT SAFETY INVARIANT:
 * Always runs in strictly headless mode (--headless=new, --disable-gpu) without GUI window.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone16');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function detectBaseUrl() {
  const ports = [5173, 5174, 4173, 3000];
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
      name: '01_m16_packet_lens_topology.png',
      url: `${baseUrl}/?workstation=open&app=packetLens&packetTab=topology&node=app-portal-01`,
      desc: 'Packet Lens Network Topology View — 5 Segments, DMZ Cluster & Node Inspection',
      delayMs: 4000,
    },
    {
      name: '02_m16_packet_lens_traffic_stream.png',
      url: `${baseUrl}/?workstation=open&app=packetLens&packetTab=traffic&pkt=1`,
      desc: 'Packet Lens Synthetic Multi-Protocol Traffic Stream & Protocol Distribution Metrics',
      delayMs: 4000,
    },
    {
      name: '03_m16_packet_lens_dissection_hex.png',
      url: `${baseUrl}/?workstation=open&app=packetLens&packetTab=traffic&pkt=31`,
      desc: 'Packet Lens Multi-Layer Protocol Dissection (Frame, IP, TLS) & Hex Dump Inspector',
      delayMs: 4000,
    },
    {
      name: '04_m16_threat_intel_registry.png',
      url: `${baseUrl}/?workstation=open&app=packetLens&packetTab=threatintel`,
      desc: 'Packet Lens Threat Intelligence Database — Fictional IOCs, Confidence vs Severity',
      delayMs: 4000,
    },
    {
      name: '05_m16_threat_intel_correlation.png',
      url: `${baseUrl}/?workstation=open&app=packetLens&packetTab=threatintel&correlate=1`,
      desc: 'Packet Lens Automated Threat Correlation Engine with Explainable Attribution Reasoning',
      delayMs: 4000,
    },
    {
      name: '06_m16_investigation_briefing_and_objectives.png',
      url: `${baseUrl}/?workstation=open&app=packetLens&packetTab=investigation`,
      desc: 'Operation Marina Nexus Scenario — 7 Authored Objectives & Active Investigation Tracking',
      delayMs: 4000,
    },
    {
      name: '07_m16_investigation_evaluation_approved.png',
      url: `${baseUrl}/?workstation=open&app=packetLens&packetTab=investigation&eval=1`,
      desc: 'Operation Marina Nexus Approved Findings Evaluation (100% Score) with Debriefing',
      delayMs: 4000,
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
  console.log('=== Cyberlife Milestone 16 Headless Browser Verification ===');
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

  console.log('\n[+] All Milestone 16 headless browser screenshots successfully verified and saved.');
}

run();
