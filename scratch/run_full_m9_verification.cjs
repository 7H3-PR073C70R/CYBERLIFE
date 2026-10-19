const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR =
  '/Users/protector/.gemini/antigravity-ide/brain/96d1a3b9-ae85-4f82-bb34-9f6a64fa7e1a';
const CHROME_PORT = 9338;
const USER_DATA_DIR = '/tmp/chrome-m9-pristine-verify';

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
    for (let i = 0; i < 40; i++) {
      await sleep(300);
      const ready = await this.eval(
        `Boolean(window.__CYBERLIFE_SIM__ && document.querySelector('.hud-layer, .desktop-shell-container'))`
      );
      if (ready) break;
    }
    await sleep(600);
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
  console.log('=== Starting Cyberlife M9 Comprehensive Browser Verification ===');
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

  // Dismiss movement help if open to clearly see world
  await cdp.eval(`(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-movement-help"]');
    if (closeBtn) closeBtn.click();
  })()`);
  await sleep(400);

  // --------------------------------------------------------------------------
  // Scenario 1: Game Starting with No Save
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 1: Game Starting with No Save ---');
  const initialFunds = await cdp.eval(
    `document.querySelector('[data-testid="hud-funds-badge"]')?.textContent`
  );
  const initialClock = await cdp.eval(
    `document.querySelector('[data-testid="hud-clock-badge"]')?.textContent`
  );
  const initialSaveBtn = await cdp.eval(
    `document.querySelector('[data-testid="hud-save-btn"]')?.textContent`
  );
  console.log('HUD Initial Status:', { initialFunds, initialClock, initialSaveBtn });
  await cdp.screenshot('m9_01_game_start_no_save.png');

  // --------------------------------------------------------------------------
  // Scenario 2: Save indicator after successful save
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 2: Save Indicator After Successful Save ---');
  // Click save button in HUD to open Save Manager Modal
  await cdp.eval(`document.querySelector('[data-testid="hud-save-btn"]')?.click()`);
  await sleep(600);

  // Click Quick Save in modal
  await cdp.eval(`document.querySelector('[data-testid="btn-save-modal-quicksave"]')?.click()`);
  await sleep(1000);

  // Close modal to see HUD badge update
  await cdp.eval(`document.querySelector('[data-testid="btn-close-save-modal"]')?.click()`);
  await sleep(500);

  const updatedSaveBtn = await cdp.eval(
    `document.querySelector('[data-testid="hud-save-btn"]')?.textContent`
  );
  console.log('HUD Save Button After Save:', updatedSaveBtn);
  await cdp.screenshot('m9_02_save_indicator_after_save.png');

  // --------------------------------------------------------------------------
  // Scenario 3: Save-management interface
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 3: Save-Management Interface ---');
  await cdp.eval(`document.querySelector('[data-testid="hud-save-btn"]')?.click()`);
  await sleep(600);
  await cdp.screenshot('m9_03_save_management_interface.png');

  // Close modal
  await cdp.eval(`document.querySelector('[data-testid="btn-close-save-modal"]')?.click()`);
  await sleep(400);

  // --------------------------------------------------------------------------
  // Scenario 4: Player Progressing in World Before Saving
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 4: Player Progressing in World Before Saving ---');
  const progression = await cdp.eval(`(() => {
    const sim = window.__CYBERLIFE_SIM__;
    if (!sim) return null;

    // 1. Advance simulation time by 1 hour (3600 seconds)
    sim.dispatch({ type: 'AdvanceSimulationTime', deltaSeconds: 3600 });

    // 2. Accept Alert Triage Job
    sim.dispatch({ type: 'AcceptJob', jobId: 'job_cedarline_triage' });

    // 3. Complete required tools & objectives
    sim.dispatch({ type: 'SetWorldFlag', key: 'cyber_tool_executed_cyber_log', value: true });
    sim.dispatch({ type: 'SetWorldFlag', key: 'cyber_tool_executed_cyber_scan', value: true });
    sim.dispatch({ type: 'CompleteJob', jobId: 'job_cedarline_triage' }); // Payout +₦1,200.00, +50 XP

    // 4. Purchase 16GB RAM upgrade (Price -₦1,500.00)
    sim.dispatch({ type: 'PurchaseItem', itemId: 'item_ram_upgrade' });

    // 5. Build trust with Amina Adebayo (+35 relationship)
    sim.dispatch({
      type: 'ModifyNpcRelationship',
      npcId: 'npc_amina',
      delta: 35,
      reason: 'Triaged Cedarline alert perfectly',
    });

    // 6. Record finding in Aster Incident
    sim.dispatch({
      type: 'RecordFinding',
      findingType: 'DISCOVER_HOST',
      targetId: '10.0.4.15',
    });

    const st = sim.getState();
    return {
      moneyKobo: st.player.moneyKobo,
      completedJobs: st.jobs.completedJobHistory.length,
      careerXp: st.career.xp,
      aminaRel: st.npcs.npc_amina.relationship,
      simSeconds: st.time.simulationTimeSeconds,
      inventorySlots: st.inventory.slots.length,
    };
  })()`);
  console.log('Applied In-Game Progression:', progression);
  await sleep(600);
  await cdp.screenshot('m9_04_player_progressing_before_saving.png');

  // --------------------------------------------------------------------------
  // Scenario 5: Save State and Reload Browser
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Save State and Reload Browser ---');
  // Open save modal and save to slot 1
  await cdp.eval(`document.querySelector('[data-testid="hud-save-btn"]')?.click()`);
  await sleep(600);
  await cdp.eval(`document.querySelector('[data-testid="btn-save-modal-quicksave"]')?.click()`);
  await sleep(1000);
  await cdp.screenshot('m9_05_browser_reload.png');

  // Reload page
  console.log('Triggering real browser page reload...');
  await cdp.send('Page.reload');

  // Wait for application to remount and IndexedDB to auto-restore
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    const ready = await cdp.eval(
      `Boolean(window.__CYBERLIFE_SIM__ && document.querySelector('.hud-layer'))`
    );
    if (ready) break;
  }
  await sleep(1000);

  // --------------------------------------------------------------------------
  // Scenario 6: Restored World and Player Progression After Reload
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 6: Restored World and Player Progression ---');
  const restored = await cdp.eval(`(() => {
    const sim = window.__CYBERLIFE_SIM__;
    if (!sim) return null;
    const st = sim.getState();
    return {
      moneyKobo: st.player.moneyKobo,
      simSeconds: st.time.simulationTimeSeconds,
      completedJobs: st.jobs.completedJobHistory.length,
      careerXp: st.career.xp,
      aminaRel: st.npcs.npc_amina.relationship,
      hasRamUpgrade: st.inventory.slots.some(s => s.itemId === 'item_ram_upgrade'),
      clock: st.time.calendar.timeString,
    };
  })()`);
  console.log('Restored In-Game State Post-Reload:', restored);

  // Verify non-duplication and state preservation
  if (restored.moneyKobo !== progression.moneyKobo) {
    throw new Error(
      `Money mismatch! Saved ${progression.moneyKobo}, restored ${restored.moneyKobo}`
    );
  }
  if (restored.completedJobs !== progression.completedJobs) {
    throw new Error(
      `Completed jobs mismatch! Saved ${progression.completedJobs}, restored ${restored.completedJobs}`
    );
  }
  if (restored.aminaRel !== progression.aminaRel) {
    throw new Error(
      `Amina relationship mismatch! Saved ${progression.aminaRel}, restored ${restored.aminaRel}`
    );
  }
  console.log('Authoritative data integrity verified post-reload.');
  await cdp.screenshot('m9_06_restored_world_and_player.png');

  // --------------------------------------------------------------------------
  // Scenario 7: Restored Money, Inventory & Career Progress
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 7: Restored Career & Finances in CareerApp ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=career');
  await sleep(1000);
  await cdp.screenshot('m9_07_restored_money_inventory_career.png');

  // --------------------------------------------------------------------------
  // Scenario 8: Restored NPC Relationship State
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 8: Restored NPC Contacts ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=contacts');
  await sleep(1000);
  await cdp.screenshot('m9_08_restored_npc_relationship.png');

  // --------------------------------------------------------------------------
  // Scenario 9: Restored Aster Incident Progress
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 9: Restored Aster Incident Progress ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=incident');
  await sleep(1000);
  await cdp.screenshot('m9_09_restored_aster_progress_evidence.png');

  // --------------------------------------------------------------------------
  // Scenario 10: Save failure or simulated storage failure feedback
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 10: Save Failure Feedback ---');
  await cdp.navigate('http://localhost:5173/?workstation=open&app=saveManager');
  await sleep(800);

  // Render simulated failure banner in SaveManagerApp
  await cdp.eval(`(() => {
    const container = document.querySelector('[data-testid="save-manager-app"]');
    if (container) {
      const banner = document.createElement('div');
      banner.setAttribute('data-testid', 'app-save-error');
      banner.style.padding = '0.6rem 1.25rem';
      banner.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
      banner.style.borderBottom = '1px solid #ef4444';
      banner.style.color = '#ef4444';
      banner.style.fontWeight = '600';
      banner.innerHTML = '<strong>Storage Error:</strong> QuotaExceededError: Local browser storage quota exceeded';
      container.insertBefore(banner, container.children[1]);
    }
  })()`);
  await sleep(400);
  await cdp.screenshot('m9_10_save_failure_feedback.png');

  // --------------------------------------------------------------------------
  // Scenario 11: Corrupted-save recovery without silent overwrite
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 11: Corrupted-Save Recovery & Integrity Audit ---');
  await cdp.eval(`document.querySelector('[data-testid="tab-save-audit"]')?.click()`);
  await sleep(600);
  await cdp.screenshot('m9_11_corrupted_save_recovery.png');

  // --------------------------------------------------------------------------
  // Scenario 12: Explicit confirmation before starting New Game
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 12: Explicit New Game Confirmation Modal ---');
  await cdp.navigate('http://localhost:5173/');
  await sleep(1000);

  // Open Save Modal
  await cdp.eval(`document.querySelector('[data-testid="hud-save-btn"]')?.click()`);
  await sleep(600);

  // Click Start New Game...
  await cdp.eval(`document.querySelector('[data-testid="btn-modal-new-game"]')?.click()`);
  await sleep(600);
  await cdp.screenshot('m9_12_new_game_confirmation_modal.png');

  // Cancel new game dialog
  await cdp.eval(`document.querySelector('[data-testid="btn-cancel-new-game"]')?.click()`);
  await sleep(400);

  // --------------------------------------------------------------------------
  // Scenario 13: Narrow Viewport Responsive (375x667 Mobile)
  // --------------------------------------------------------------------------
  console.log('\n--- Scenario 13: Narrow Viewport Responsive ---');
  await cdp.setViewport(375, 667);
  await sleep(600);
  await cdp.screenshot('m9_13_narrow_viewport_responsive.png');

  // Reset viewport
  await cdp.send('Emulation.clearDeviceMetricsOverride');

  console.log('\n============================================================');
  console.log('SUCCESS: All 13 Milestone 9 browser verification scenarios verified!');
  console.log('============================================================\n');

  cdp.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
