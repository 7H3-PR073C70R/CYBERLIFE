/**
 * Cyberlife — Milestone 14 End-to-End Browser Automation & Screenshot Capture
 *
 * Uses headless Google Chrome via Chrome DevTools Protocol (CDP) WebSocket to:
 * 1. Launch Cyberlife in headless Chrome with viewport 1440x900.
 * 2. Exercise the real player-facing narrative entry point (Amina dialogue).
 * 3. Select Choice 0 (procedural protocol) and capture relationship + faction standing toast.
 * 4. Open ContactsApp on the Virtual Desktop, switch to Factions & Corporate Influence tab,
 *    and capture real-time standings and audit history.
 * 5. Branch 1: Marcus Adebayo empathy path (trust increase + whistleblower memo evidence).
 * 6. Branch 2: Marcus Adebayo accusation path (distrust + defensive clamming up).
 * 7. Evidence-dependent dilemma: preserving EVD-2026-001 unlocks high-stakes dilemma branch.
 * 8. In-game Save/Load manager interface verifying narrative state persistence.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = join(process.cwd(), 'docs', 'graphics', 'milestone14', 'narrative-validation');
const DEBUG_PORT = 9224;

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to wait
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Helper to query CDP JSON endpoint
async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = evt => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return result.result?.value;
  }

  async waitForSelector(selector, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const exists = await this.evaluate(`Boolean(document.querySelector('${selector}'))`);
      if (exists) return true;
      await sleep(200);
    }
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }

  async click(selector) {
    await this.waitForSelector(selector);
    const clicked = await this.evaluate(`
      (() => {
        const el = document.querySelector('${selector}');
        if (!el) return false;
        el.scrollIntoView({ block: 'center' });
        el.click();
        return true;
      })()
    `);
    if (!clicked) throw new Error(`Could not click selector: ${selector}`);
    await sleep(400);
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = join(OUTPUT_DIR, filename);
    writeFileSync(outPath, buffer);
    console.log(`[+] Captured: ${filename}`);
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function main() {
  console.log('=== Cyberlife Milestone 14 Playable Narrative E2E Capture ===\n');

  // Launch headless Chrome with remote debugging
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank',
  ]);

  // Clean shutdown handler
  const cleanup = () => {
    try {
      chromeProcess.kill('SIGKILL');
    } catch {
      // ignore
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  // Wait for debug port to be ready
  let versionInfo = null;
  for (let i = 0; i < 20; i++) {
    try {
      versionInfo = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (versionInfo?.webSocketDebuggerUrl) break;
    } catch {
      await sleep(300);
    }
  }

  if (!versionInfo?.webSocketDebuggerUrl) {
    throw new Error('Failed to connect to headless Chrome remote debugging port.');
  }

  // Get available target page
  const targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  const BASE_URL = 'http://localhost:5173';

  try {
    // ------------------------------------------------------------------------
    // Screenshot 1: Real Narrative Entry Point (Amina Greeting & Choices)
    // ------------------------------------------------------------------------
    console.log('[*] Step 1: Navigating to narrative entry point (Lead Analyst Amina)...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/?skipIntro=1&npc=npc_amina` });
    await cdp.waitForSelector('[data-testid="dialogue-overlay"]');
    await cdp.waitForSelector('[data-testid="dialogue-choice-0"]');
    await sleep(800);
    await cdp.captureScreenshot('01_entry_point_dialogue.png');

    // ------------------------------------------------------------------------
    // Screenshot 2: Real Choice Selection & Consequence Toast
    // ------------------------------------------------------------------------
    console.log('[*] Step 2: Selecting procedural priority choice...');
    await cdp.click('[data-testid="dialogue-choice-0"]');
    await sleep(600);
    await cdp.captureScreenshot('02_branch1_procedural_selected.png');

    // ------------------------------------------------------------------------
    // Screenshot 3: Factions & Standing Tab in Desktop ContactsApp
    // ------------------------------------------------------------------------
    console.log('[*] Step 3: Navigating to Virtual Desktop ContactsApp...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/?skipIntro=1&workstation=open&app=contacts` });
    await cdp.waitForSelector('[data-testid="contacts-app"]');
    await cdp.waitForSelector('[data-testid="tab-btn-factions"]');
    await cdp.click('[data-testid="tab-btn-factions"]');
    await cdp.waitForSelector('[data-testid="narrative-active-arc"]');
    await sleep(800);
    await cdp.captureScreenshot('03_contacts_factions_tab.png');

    // ------------------------------------------------------------------------
    // Screenshot 4: Marcus Adebayo Branch 1 (Empathy & Whistleblower Memo)
    // ------------------------------------------------------------------------
    console.log('[*] Step 4: Testing Marcus Adebayo Branch 1 (Empathy / Protection)...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/?skipIntro=1&npc=npc_marcus` });
    await cdp.waitForSelector('[data-testid="dialogue-choice-0"]');
    await sleep(500);
    // Click Empathy choice
    await cdp.click('[data-testid="dialogue-choice-0"]');
    await sleep(500);
    // Click Request Memo choice
    await cdp.waitForSelector('[data-testid="dialogue-choice-0"]');
    await cdp.click('[data-testid="dialogue-choice-0"]');
    await sleep(600);
    await cdp.captureScreenshot('04_marcus_branch1_empathy.png');

    // ------------------------------------------------------------------------
    // Screenshot 5: Marcus Adebayo Branch 2 (Accusation & Defensive Clamming Up)
    // ------------------------------------------------------------------------
    console.log('[*] Step 5: Testing Marcus Adebayo Branch 2 (Accusation / Scapegoating)...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/?skipIntro=1&npc=npc_marcus` });
    await cdp.waitForSelector('[data-testid="dialogue-choice-1"]');
    await sleep(500);
    // Click Accusation choice (Choice 1)
    await cdp.click('[data-testid="dialogue-choice-1"]');
    await sleep(600);
    await cdp.captureScreenshot('05_marcus_branch2_accusation.png');

    // ------------------------------------------------------------------------
    // Screenshot 6: Evidence-Dependent Investigation Dilemma
    // ------------------------------------------------------------------------
    console.log('[*] Step 6: Testing evidence-dependent dilemma branch...');
    // Open terminal, run evidence preserve command through real terminal
    await cdp.send('Page.navigate', { url: `${BASE_URL}/?skipIntro=1&workstation=open&app=terminal` });
    await cdp.waitForSelector('[data-testid="terminal-input"]');
    await cdp.evaluate(`
      (() => {
        const input = document.querySelector('[data-testid="terminal-input"]');
        if (input) {
          input.value = 'evidence preserve EVD-2026-001';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
        }
      })()
    `);
    await sleep(1000);

    // Now visit Amina in returning state; evidence is now preserved in vault
    await cdp.send('Page.navigate', { url: `${BASE_URL}/?skipIntro=1&npc=npc_amina` });
    await cdp.waitForSelector('[data-testid="dialogue-choice-0"]');
    // Progress through greet to returning
    await cdp.click('[data-testid="dialogue-choice-0"]');
    await sleep(600);
    await cdp.captureScreenshot('06_evidence_dependent_branch.png');

    // ------------------------------------------------------------------------
    // Screenshot 7: Save / Load Manager Interface & Persistence Verification
    // ------------------------------------------------------------------------
    console.log('[*] Step 7: Testing Save/Load Manager interface...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/?skipIntro=1` });
    await cdp.waitForSelector('[data-testid="btn-hud-menu"]');
    // Open menu drawer
    await cdp.click('[data-testid="btn-hud-menu"]');
    await sleep(400);
    // Click Save / Load Game in drawer
    await cdp.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveBtn = buttons.find(b => b.textContent.includes('Save / Load Game'));
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(600);
    await cdp.waitForSelector('[data-testid="save-manager-modal"]');
    await sleep(500);
    await cdp.captureScreenshot('07_save_load_verification.png');

    console.log('\n[SUCCESS] All 7 Milestone 14 narrative screenshots captured successfully!');
  } finally {
    await cdp.close();
    cleanup();
  }
}

main().catch(err => {
  console.error('[-] Error during capture:', err);
  process.exit(1);
});
