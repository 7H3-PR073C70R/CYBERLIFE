const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR =
  '/Users/protector/.gemini/antigravity-ide/brain/96d1a3b9-ae85-4f82-bb34-9f6a64fa7e1a';
const CHROME_PORT = 9340;
const USER_DATA_DIR = '/tmp/chrome-m10-pristine-verify-2';

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

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(800);
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
  console.log('=== Starting Cyberlife Milestone 10 Comprehensive Browser Verification ===');
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
    await sleep(400);
    const ready = await cdp.eval(
      `Boolean(window.__CYBERLIFE_SIM__ && document.querySelector('.hud-layer'))`
    );
    if (ready) {
      console.log('Simulation engine and HUD mounted.');
      break;
    }
  }

  // --------------------------------------------------------------------------
  // Scenario 1: First-Launch Introduction Modal (Step 1: Welcome to Lagos Island)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 1: First-Launch Introduction Modal ---');
  await sleep(600);
  const introModalVisible = await cdp.eval(
    `Boolean(document.querySelector('[data-testid="first-launch-intro-modal"]'))`
  );
  const introStepTitle = await cdp.eval(
    `document.querySelector('[data-testid="onboarding-step-title"]')?.textContent`
  );
  const introStepCounter = await cdp.eval(
    `document.querySelector('[data-testid="onboarding-step-counter"]')?.textContent`
  );
  console.log('Intro Modal state:', { introModalVisible, introStepTitle, introStepCounter });
  await cdp.screenshot('m10_01_first_launch_intro.png');

  // --------------------------------------------------------------------------
  // Scenario 2: Movement & Camera Guidance in the 3D World
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 2: Movement & Camera Guidance in 3D World ---');
  // Advance to Step 2 (Movement & Camera)
  await cdp.eval(`(() => {
    const nextBtn = document.querySelector('[data-testid="onboarding-next-btn"]');
    if (nextBtn) nextBtn.click();
  })()`);
  await sleep(400);

  // Close intro modal so the 3D world and HUD contextual guidance are prominent
  await cdp.eval(`(() => {
    const skipBtn = document.querySelector('[data-testid="onboarding-skip-btn"]');
    if (skipBtn) skipBtn.click();
  })()`);
  await sleep(500);

  const cameraModeText = await cdp.eval(
    `document.querySelector('[data-testid="hud-camera-toggle-btn"]')?.textContent`
  );
  const guidanceTitle = await cdp.eval(`document.querySelector('.guidance-title')?.textContent`);
  console.log('World Guidance status:', { cameraModeText, guidanceTitle });
  await cdp.screenshot('m10_02_movement_camera_guidance.png');

  // --------------------------------------------------------------------------
  // Scenario 3: NPC Interaction Hint
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 3: NPC Interaction Hint ---');
  // Approach Lead Investigator Amina Adebayo
  await cdp.eval(`(() => {
    const sim = window.__CYBERLIFE_SIM__;
    if (sim) {
      sim.dispatch({
        type: 'SetPlayerLocation',
        locationId: 'street_amina',
      });
    }
  })()`);
  await sleep(600);
  await cdp.screenshot('m10_03_npc_interaction_hint.png');

  // --------------------------------------------------------------------------
  // Scenario 4: Controls & Game Literacy Reference Modal
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 4: Controls Reference Modal ---');
  // Open controls reference via top HUD button
  await cdp.eval(`(() => {
    const btn = document.querySelector('[data-testid="hud-controls-modal-btn"]');
    if (btn) btn.click();
  })()`);
  await sleep(600);

  const controlsModalTitle = await cdp.eval(
    `document.querySelector('#controls-modal-title')?.textContent`
  );
  console.log('Controls Reference Modal:', { controlsModalTitle });
  await cdp.screenshot('m10_04_controls_reference_modal.png');

  // Close controls reference modal
  await cdp.eval(`(() => {
    const dismissBtn = document.querySelector('[data-testid="controls-dismiss-btn"]');
    if (dismissBtn) dismissBtn.click();
  })()`);
  await sleep(400);

  // --------------------------------------------------------------------------
  // Scenario 5: Physical Workstation Interaction
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Physical Workstation Interaction ---');
  // Transition inside Cedarline Solutions near workstation
  await cdp.eval(`(() => {
    const sim = window.__CYBERLIFE_SIM__;
    if (sim) {
      sim.dispatch({
        type: 'SetPlayerLocation',
        locationId: 'cedarline_office',
      });
    }
  })()`);
  await sleep(600);
  await cdp.screenshot('m10_05_workstation_interaction.png');

  // --------------------------------------------------------------------------
  // Scenario 6: Field Guide with Supported Command Breakdown
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 6: Field Guide with Supported Command Breakdown ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=fieldGuide');
  await sleep(1000);

  // Maximize Field Guide window
  await cdp.eval(`(() => {
    const maxBtn = document.querySelector('[data-testid="btn-maximize-fieldGuide"]');
    if (maxBtn) maxBtn.click();
    const toolsTab = document.querySelector('[data-testid="guide-tab-tools"]');
    if (toolsTab) toolsTab.click();
  })()`);
  await sleep(600);

  await cdp.screenshot('m10_06_field_guide_command_manual.png');

  // --------------------------------------------------------------------------
  // Scenario 7: Manually Typed Terminal Command & Output
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 7: Manually Typed Terminal Command & Output ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=terminal');
  await sleep(1000);

  // Maximize Terminal window and execute 'netmap hosts'
  await cdp.eval(`(() => {
    const maxBtn = document.querySelector('[data-testid="btn-maximize-terminal"]');
    if (maxBtn) maxBtn.click();

    const input = document.querySelector('[data-testid="terminal-command-input"]');
    const runBtn = document.querySelector('.btn-terminal-submit');
    if (input && runBtn) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'netmap hosts');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      runBtn.click();
    }
  })()`);
  await sleep(800);

  await cdp.screenshot('m10_07_manually_typed_command_output.png');

  // --------------------------------------------------------------------------
  // Scenario 8: Terminal Error with Contextual Did-You-Mean Feedback
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 8: Terminal Error with Contextual Did-You-Mean Feedback ---');
  // Type a misspelled command: 'netmp hosts' and run
  await cdp.eval(`(() => {
    const input = document.querySelector('[data-testid="terminal-command-input"]');
    const runBtn = document.querySelector('.btn-terminal-submit');
    if (input && runBtn) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'netmp hosts');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      runBtn.click();
    }
  })()`);
  await sleep(800);

  await cdp.screenshot('m10_08_terminal_error_did_you_mean.png');

  // --------------------------------------------------------------------------
  // Scenario 9: Mission Objective Guidance
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 9: Mission Objective Guidance ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=incident');
  await sleep(1000);

  // Maximize Incident App window
  await cdp.eval(`(() => {
    const maxBtn = document.querySelector('[data-testid="btn-maximize-incident"]');
    if (maxBtn) maxBtn.click();
  })()`);
  await sleep(600);

  await cdp.screenshot('m10_09_mission_objective_guidance.png');

  // --------------------------------------------------------------------------
  // Scenario 10: Career & Job Board Explanation
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 10: Career & Job Board Explanation ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=career');
  await sleep(1000);

  // Maximize Career window and click Job Board tab
  await cdp.eval(`(() => {
    const maxBtn = document.querySelector('[data-testid="btn-maximize-career"]');
    if (maxBtn) maxBtn.click();

    const jobsTab = document.querySelector('[data-testid="tab-jobs"]');
    if (jobsTab) jobsTab.click();
  })()`);
  await sleep(600);

  await cdp.screenshot('m10_10_career_job_board_explanation.png');

  // --------------------------------------------------------------------------
  // Scenario 11: Searchable Help Center App
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 11: Searchable Help Center App ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=helpCenter');
  await sleep(1000);

  // Maximize Help Center window and search for 'terminal'
  await cdp.eval(`(() => {
    const maxBtn = document.querySelector('[data-testid="btn-maximize-helpCenter"]');
    if (maxBtn) maxBtn.click();

    const searchInput = document.querySelector('[data-testid="help-search-input"]');
    if (searchInput) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(searchInput, 'terminal');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`);
  await sleep(600);

  await cdp.screenshot('m10_11_searchable_help_center.png');

  // --------------------------------------------------------------------------
  // Scenario 12: Save/Reload Preserves Onboarding Progress
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 12: Save/Reload Preserves Onboarding Progress ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=saveManager');
  await sleep(1000);

  // Maximize Save Manager window and click Save Slot 1
  await cdp.eval(`(() => {
    const maxBtn = document.querySelector('[data-testid="btn-maximize-saveManager"]');
    if (maxBtn) maxBtn.click();

    const saveBtn = document.querySelector('[data-testid="btn-save-slot-1"]');
    if (saveBtn) saveBtn.click();
  })()`);
  await sleep(800);

  // Verify onboarding status is recorded
  const onboardingState = await cdp.eval(`(() => {
    return window.__CYBERLIFE_SIM__?.getState().onboarding;
  })()`);
  console.log('Saved Onboarding State:', onboardingState);

  await cdp.screenshot('m10_12_save_reload_preserves_onboarding.png');

  // --------------------------------------------------------------------------
  // Scenario 13: Narrow Viewport Responsive Verification
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 13: Narrow Viewport Responsive Layout ---');
  await cdp.navigate('http://localhost:5173/');
  await sleep(800);

  // Dismiss intro modal if open
  await cdp.eval(`(() => {
    const skipBtn = document.querySelector('[data-testid="onboarding-skip-btn"]');
    if (skipBtn) skipBtn.click();
  })()`);
  await sleep(400);

  // Set narrow mobile viewport 480x800
  await cdp.setViewport(480, 800);
  await sleep(600);

  await cdp.screenshot('m10_13_narrow_viewport_responsive.png');

  // Reset viewport
  await cdp.setViewport(1280, 800);
  await sleep(400);

  console.log('\n=== All 13 M10 Browser Verification Scenarios Completed Successfully ===');
  cdp.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal Browser Verification Error:', err);
  process.exit(1);
});
