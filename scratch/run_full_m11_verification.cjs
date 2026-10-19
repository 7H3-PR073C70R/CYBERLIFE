const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR =
  '/Users/protector/.gemini/antigravity-ide/brain/96d1a3b9-ae85-4f82-bb34-9f6a64fa7e1a';
const CHROME_PORT = 9345;
const USER_DATA_DIR = '/tmp/chrome-m11-verify';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startChrome() {
  if (fs.existsSync(USER_DATA_DIR)) {
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch {}
  }

  const chromeArgs = [
    '--headless',
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/',
  ];
  return spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', chromeArgs);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', data => {
        const msg = JSON.parse(data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      console.error('Eval error:', res.exceptionDetails);
    }
    return res.result?.value;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filepath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`[Screenshot Saved] ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return filepath;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await sleep(400);
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('=== Starting Cyberlife Milestone 11 Comprehensive Browser Verification ===');
  const chrome = startChrome();

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      targets = await fetchJson(`http://127.0.0.1:${CHROME_PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch {}
  }

  if (!targets || targets.length === 0) {
    console.error('Failed to connect to headless Chrome debugging port.');
    chrome.kill();
    process.exit(1);
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  console.log('Connected to target:', pageTarget.title, pageTarget.url);

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('CDP WebSocket connected.');

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  // Wait for React to render
  console.log('Waiting for initial application mount...');
  for (let i = 0; i < 40; i++) {
    const ready = await cdp.eval(
      'Boolean(document.querySelector("#root") && document.querySelector(".desktop-shell, .world-viewport, .first-launch-modal"))'
    );
    if (ready) break;
    await sleep(300);
  }

  // Dismiss any onboarding modal if present to reach workstation desktop
  await cdp.eval(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Enter Cyberlife') || b.textContent.includes('Close') || b.textContent.includes('Skip') || b.textContent.includes('Continue'));
    if (btn) btn.click();
  })()`);
  await sleep(600);

  // Switch to workstation desktop camera/mode
  await cdp.eval(`(() => {
    // If Dev drawer or workstation toggle exists, ensure workstation is active
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Desktop') || b.textContent.includes('Workstation') || b.textContent.includes('Terminal'));
    if (btn) btn.click();
  })()`);
  await sleep(600);

  // Make sure Desktop Shell is visible or open Cyber Catalogue
  console.log('Ensuring desktop view is accessible...');
  await cdp.eval(`(() => {
    // Dispatch custom event or open window via window manager
    const win = window;
    if (win.__CYBERLIFE_DEV__) {
      win.__CYBERLIFE_DEV__.openApp('catalogue');
    }
  })()`);
  await sleep(500);

  // If shortcut exists on desktop, double-click it
  await cdp.eval(`(() => {
    const icons = Array.from(document.querySelectorAll('.desktop-shortcut, .desktop-icon, .app-icon'));
    const catIcon = icons.find(i => i.textContent.includes('Catalogue') || i.textContent.includes('Cyber Catalogue'));
    if (catIcon) {
      catIcon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      catIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    // Also try taskbar or start menu
    const taskbarBtn = Array.from(document.querySelectorAll('button, .taskbar-item')).find(b => b.textContent.includes('Catalogue'));
    if (taskbarBtn) taskbarBtn.click();
  })()`);
  await sleep(600);

  // --------------------------------------------------------------------------
  // 1. Catalogue Overview: All 3 teams + Shared foundations
  // --------------------------------------------------------------------------
  console.log('1. Capturing m11_01_catalogue_overview.png...');
  await cdp.eval(`(() => {
    // Ensure "All Tracks" is selected
    const allTab = Array.from(document.querySelectorAll('.track-tab, button')).find(b => b.textContent.includes('All Tracks'));
    if (allTab) allTab.click();
  })()`);
  await sleep(400);
  await cdp.screenshot('m11_01_catalogue_overview.png');

  // --------------------------------------------------------------------------
  // 2. Search and Filtering
  // --------------------------------------------------------------------------
  console.log('2. Capturing m11_02_search_and_filtering.png...');
  await cdp.eval(`(() => {
    const search = document.querySelector('input[placeholder*="Search by topic"]');
    if (search) {
      search.value = 'Identity';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      search.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await sleep(400);
  await cdp.screenshot('m11_02_search_and_filtering.png');

  // Clear search filter
  await cdp.eval(`(() => {
    const search = document.querySelector('input[placeholder*="Search by topic"]');
    if (search) {
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      search.dispatchEvent(new Event('change', { bubbles: true }));
    }
  })()`);
  await sleep(300);

  // --------------------------------------------------------------------------
  // 3. Playable Blue Team Investigation
  // --------------------------------------------------------------------------
  console.log('3. Capturing m11_03_blue_team_investigation.png...');
  await cdp.eval(`(() => {
    // Select Blue Team tab
    const blueTab = Array.from(document.querySelectorAll('.track-tab, button')).find(b => b.textContent.includes('Blue Team'));
    if (blueTab) blueTab.click();

    // Select SOC Triage entry
    const entry = Array.from(document.querySelectorAll('.catalogue-card, [data-entry-id], button, h4')).find(e => e.textContent.includes('Security Operations & Alert Triage'));
    if (entry) entry.click();

    // Click "Launch Interactive Exercise" if button present
    const launchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Launch Interactive Exercise') || b.textContent.includes('Start Exercise'));
    if (launchBtn) launchBtn.click();
  })()`);
  await sleep(500);
  await cdp.screenshot('m11_03_blue_team_investigation.png');

  // --------------------------------------------------------------------------
  // 4. Playable Red Team Authorized Simulation
  // --------------------------------------------------------------------------
  console.log('4. Capturing m11_04_red_team_authorized_simulation.png...');
  await cdp.eval(`(() => {
    // Select Red Team tab
    const redTab = Array.from(document.querySelectorAll('.track-tab, button')).find(b => b.textContent.includes('Red Team'));
    if (redTab) redTab.click();

    // Select Recon entry
    const entry = Array.from(document.querySelectorAll('.catalogue-card, [data-entry-id], button, h4')).find(e => e.textContent.includes('Authorized Reconnaissance'));
    if (entry) entry.click();

    // Click Start/Launch Exercise
    const launchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Launch Interactive Exercise') || b.textContent.includes('Start Exercise'));
    if (launchBtn) launchBtn.click();
  })()`);
  await sleep(500);
  // Accept RoE to show finding editor
  await cdp.eval(`(() => {
    const roeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Accept Rules of Engagement'));
    if (roeBtn) roeBtn.click();
  })()`);
  await sleep(400);
  await cdp.screenshot('m11_04_red_team_authorized_simulation.png');

  // --------------------------------------------------------------------------
  // 5. Purple Team Initial Detection Gap
  // --------------------------------------------------------------------------
  console.log('5. Capturing m11_05_purple_team_initial_gap.png...');
  await cdp.eval(`(() => {
    // Select Purple Team tab
    const purpleTab = Array.from(document.querySelectorAll('.track-tab, button')).find(b => b.textContent.includes('Purple Team'));
    if (purpleTab) purpleTab.click();

    // Select Detection Validation entry
    const entry = Array.from(document.querySelectorAll('.catalogue-card, [data-entry-id], button, h4')).find(e => e.textContent.includes('Detection Validation'));
    if (entry) entry.click();

    // Click Launch Exercise
    const launchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Launch Interactive Exercise') || b.textContent.includes('Start Exercise'));
    if (launchBtn) launchBtn.click();
  })()`);
  await sleep(500);
  // Click "Run Baseline Scenario"
  await cdp.eval(`(() => {
    const baseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Run Baseline Scenario'));
    if (baseBtn) baseBtn.click();
  })()`);
  await sleep(500);
  await cdp.screenshot('m11_05_purple_team_initial_gap.png');

  // --------------------------------------------------------------------------
  // 6. Detection Rule Tuning Editor
  // --------------------------------------------------------------------------
  console.log('6. Capturing m11_06_detection_rule_tuning_editor.png...');
  await cdp.eval(`(() => {
    // Ensure rule editor inputs are populated with tuned values
    const fieldSelect = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === 'source'));
    if (fieldSelect) {
      fieldSelect.value = 'source';
      fieldSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const valInput = document.querySelector('input[placeholder*="Match value"]');
    if (valInput) {
      valInput.value = 'file-server';
      valInput.dispatchEvent(new Event('input', { bubbles: true }));
      valInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // Click "Deploy Tuned Rule Logic"
    const deployBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Deploy Tuned Rule Logic') || b.textContent.includes('Save'));
    if (deployBtn) deployBtn.click();
  })()`);
  await sleep(500);
  await cdp.screenshot('m11_06_detection_rule_tuning_editor.png');

  // --------------------------------------------------------------------------
  // 7. Purple Scenario Replay & Before/After Metrics
  // --------------------------------------------------------------------------
  console.log('7. Capturing m11_07_purple_scenario_replay_metrics.png...');
  await cdp.eval(`(() => {
    const replayBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Replay Scenario with Tuned Rules'));
    if (replayBtn) replayBtn.click();
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_07_purple_scenario_replay_metrics.png');

  // --------------------------------------------------------------------------
  // 8. Career Pathway Connected
  // --------------------------------------------------------------------------
  console.log('8. Capturing m11_08_career_pathway_connected.png...');
  await cdp.eval(`(() => {
    // Open Career app from taskbar or desktop
    const careerIcon = Array.from(document.querySelectorAll('.desktop-shortcut, .desktop-icon, .taskbar-item, button')).find(e => e.textContent.includes('Career') || e.textContent.includes('Job Board'));
    if (careerIcon) {
      careerIcon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      careerIcon.click();
    }
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_08_career_pathway_connected.png');

  // --------------------------------------------------------------------------
  // 9. Completion and Mastery Feedback
  // --------------------------------------------------------------------------
  console.log('9. Capturing m11_09_completion_mastery_feedback.png...');
  await cdp.eval(`(() => {
    // Bring Cyber Catalogue to front and click Complete on Purple or Blue exercise
    const catTab = Array.from(document.querySelectorAll('.taskbar-item, button')).find(b => b.textContent.includes('Catalogue'));
    if (catTab) catTab.click();

    const compBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit Assessment & Complete Exercise'));
    if (compBtn) compBtn.click();
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_09_completion_mastery_feedback.png');

  // --------------------------------------------------------------------------
  // 10. Save / Reload Catalogue Progress
  // --------------------------------------------------------------------------
  console.log('10. Capturing m11_10_save_reload_catalogue_progress.png...');
  await cdp.eval(`(() => {
    // Open Save Manager
    const saveIcon = Array.from(document.querySelectorAll('.desktop-shortcut, .desktop-icon, .taskbar-item, button')).find(e => e.textContent.includes('Save') || e.textContent.includes('Saves'));
    if (saveIcon) {
      saveIcon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      saveIcon.click();
    }
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_10_save_reload_catalogue_progress.png');

  // --------------------------------------------------------------------------
  // 11. Field Guide Catalogue Integration
  // --------------------------------------------------------------------------
  console.log('11. Capturing m11_11_field_guide_catalogue_integration.png...');
  await cdp.eval(`(() => {
    // Open Field Guide
    const fgIcon = Array.from(document.querySelectorAll('.desktop-shortcut, .desktop-icon, .taskbar-item, button')).find(e => e.textContent.includes('Field Guide') || e.textContent.includes('Guide'));
    if (fgIcon) {
      fgIcon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fgIcon.click();
    }
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_11_field_guide_catalogue_integration.png');

  // --------------------------------------------------------------------------
  // 12. Workstation Terminal Integration (catalogue commands)
  // --------------------------------------------------------------------------
  console.log('12. Capturing m11_12_workstation_terminal_integration.png...');
  await cdp.eval(`(() => {
    // Open Terminal
    const termIcon = Array.from(document.querySelectorAll('.desktop-shortcut, .desktop-icon, .taskbar-item, button')).find(e => e.textContent.includes('Terminal'));
    if (termIcon) {
      termIcon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      termIcon.click();
    }
  })()`);
  await sleep(500);
  // Type catalogue command in terminal
  await cdp.eval(`(() => {
    const input = document.querySelector('.terminal-input, input[type="text"]');
    if (input) {
      input.value = 'catalogue';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const form = input.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      } else {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
      }
    }
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_12_workstation_terminal_integration.png');

  // --------------------------------------------------------------------------
  // 13. Aster Incident Regression Check
  // --------------------------------------------------------------------------
  console.log('13. Capturing m11_13_aster_incident_regression.png...');
  await cdp.eval(`(() => {
    // Open Incident App
    const incIcon = Array.from(document.querySelectorAll('.desktop-shortcut, .desktop-icon, .taskbar-item, button')).find(e => e.textContent.includes('Incident') || e.textContent.includes('Aster'));
    if (incIcon) {
      incIcon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      incIcon.click();
    }
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_13_aster_incident_regression.png');

  // --------------------------------------------------------------------------
  // 14. Narrow Viewport Usability (Mobile / Tablet 480x800)
  // --------------------------------------------------------------------------
  console.log('14. Capturing m11_14_narrow_viewport_usability.png...');
  await cdp.setViewport(480, 800);
  await cdp.eval(`(() => {
    // Focus Catalogue app in narrow view
    const catTab = Array.from(document.querySelectorAll('.taskbar-item, button')).find(b => b.textContent.includes('Catalogue'));
    if (catTab) catTab.click();
  })()`);
  await sleep(600);
  await cdp.screenshot('m11_14_narrow_viewport_usability.png');

  // Restore viewport
  await cdp.setViewport(1280, 800);

  console.log('=== All 14 Browser Verification Screenshots Captured Successfully! ===');
  cdp.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
