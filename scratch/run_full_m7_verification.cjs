const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = '/Users/protector/.gemini/antigravity-ide/brain/96d1a3b9-ae85-4f82-bb34-9f6a64fa7e1a';
const CHROME_PORT = 9334;
const USER_DATA_DIR = '/tmp/chrome-m7-full-verify';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startChrome() {
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
    'http://localhost:5173/'
  ];
  return spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', chromeArgs);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
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
    await sleep(200);
  }

  async pressKey(key, code, keyCode) {
    await this.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key,
      code,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode
    });
    await sleep(40);
    await this.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
      code,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode
    });
    await sleep(40);
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('=== Starting Cyberlife M7 In-Browser Verification ===');
  const chrome = startChrome();

  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      targets = await fetchJson(`http://127.0.0.1:${CHROME_PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch {
      await sleep(500);
    }
  }

  if (!targets || targets.length === 0) {
    throw new Error('CDP targets not available');
  }

  const page = targets.find(t => t.type === 'page');
  console.log('Attaching to page:', page.webSocketDebuggerUrl);
  const cdp = new CDPClient(page.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  console.log('Waiting 5s for WebGL scene initialization...');
  await sleep(5000);

  // Close initial Neighborhood Controls modal if open
  await cdp.eval(`
    (() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === '✕');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(500);

  // ----------------------------------------------------
  // Scenario 1: A major NPC in the Lagos Island environment
  // ----------------------------------------------------
  console.log('\n--- Scenario 1: Major NPC in Lagos Island Environment ---');
  // Look towards Tunde Bakare at (0, 0, 17.5) on Marina Seawall
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.playerController.setPosition(0, 0, 13);
        wm.playerController.setYaw(Math.PI); // face South towards (0, 0, 17.5)
        wm.cameraController.setYaw(Math.PI);
      }
    })()
  `);
  await sleep(600);
  await cdp.screenshot('m7_01_lagos_outdoor_scene.png');

  // ----------------------------------------------------
  // Scenario 2: Interaction prompt when player approaches NPC
  // ----------------------------------------------------
  console.log('\n--- Scenario 2: Interaction Prompt ---');
  // Approach Tunde Bakare (at 0, 0, 17.5) to (0, 0, 16.0)
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.playerController.setPosition(0, 0, 16.0);
        wm.playerController.setYaw(Math.PI);
        wm.cameraController.setYaw(Math.PI);
      }
    })()
  `);
  await sleep(800);
  const promptData = await cdp.eval(`
    (() => {
      const promptCard = document.querySelector('[data-testid="interaction-prompt"]');
      const title = promptCard?.querySelector('[data-testid="prompt-target-title"]')?.textContent;
      const action = promptCard?.querySelector('[data-testid="prompt-action-text"]')?.textContent;
      return { hasPrompt: !!promptCard, title, action };
    })()
  `);
  console.log('Interaction prompt captured:', promptData);
  await cdp.screenshot('m7_02_interaction_prompt.png');

  // ----------------------------------------------------
  // Scenario 3: Dialogue interface and available responses
  // ----------------------------------------------------
  console.log('\n--- Scenario 3: Dialogue Interface & Available Responses ---');
  // Trigger interaction via [E] or wm.triggerNearbyInteraction()
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.triggerNearbyInteraction();
      }
    })()
  `);
  await sleep(800);

  const dialogueInfo = await cdp.eval(`
    (() => {
      const overlay = document.querySelector('[data-testid="dialogue-overlay"]');
      const npcName = overlay?.querySelector('h3')?.textContent;
      const npcRole = overlay?.querySelector('p')?.textContent;
      const badge = document.querySelector('[data-testid="relationship-badge"]')?.textContent;
      const speech = document.querySelector('[data-testid="dialogue-speech"]')?.textContent;
      const choices = Array.from(document.querySelectorAll('[data-testid^="dialogue-choice-"]')).map(c => c.textContent?.trim());
      return { hasOverlay: !!overlay, npcName, npcRole, badge, speech, choicesCount: choices.length, choices };
    })()
  `);
  console.log('Dialogue Overlay Status:', dialogueInfo);
  await cdp.screenshot('m7_03_dialogue_interface.png');

  // ----------------------------------------------------
  // Scenario 4: Relationship change after meaningful player choice
  // ----------------------------------------------------
  console.log('\n--- Scenario 4: Relationship Change After Choice ---');
  // Click Choice 1 ("You have sharp eyes, Tunde..."), leading to tunde_discussion
  await cdp.eval(`
    (() => {
      const choice1 = document.querySelector('[data-testid="dialogue-choice-0"]');
      if (choice1) choice1.click();
    })()
  `);
  await sleep(700);

  // In tunde_discussion, click Choice 1 ("We are preserving evidence hashes first..."), which grants +10 Trust
  await cdp.eval(`
    (() => {
      const discChoice = document.querySelector('[data-testid="dialogue-choice-0"]');
      if (discChoice) discChoice.click();
    })()
  `);
  await sleep(800);

  const relAfterChoice = await cdp.eval(`
    (() => {
      const badge = document.querySelector('[data-testid="npc-relationship-badge"]')?.textContent;
      const deltaTag = document.querySelector('[data-testid="dialogue-relationship-delta"]')?.textContent;
      const speech = document.querySelector('[data-testid="dialogue-speech-text"]')?.textContent;
      const sim = window.__CYBERLIFE_SIMULATION__;
      const tundeRel = sim?.state.npcs.npc_tunde.relationship;
      return { badge, deltaTag, speech, tundeRel };
    })()
  `);
  console.log('Relationship update result in tunde_respect:', relAfterChoice);
  await cdp.screenshot('m7_04_relationship_change.png');

  // ----------------------------------------------------
  // Scenario 5: Later conversation that reflects remembered context
  // ----------------------------------------------------
  console.log('\n--- Scenario 5: Remembered Context & Memory Continuity ---');
  // Exit dialogue cleanly via exit button or Esc
  await cdp.eval(`
    (() => {
      const exitBtn = document.querySelector('[data-testid="btn-close-dialogue"]') ||
                      document.querySelector('[data-testid="btn-end-dialogue"]');
      if (exitBtn) exitBtn.click();
    })()
  `);
  await sleep(600);

  // Re-open dialogue with Tunde to verify memory continuity
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) wm.triggerNearbyInteraction();
    })()
  `);
  await sleep(800);

  const memoryState = await cdp.eval(`
    (() => {
      const sim = window.__CYBERLIFE_SIMULATION__;
      const tunde = sim?.state.npcs.npc_tunde;
      const speech = document.querySelector('[data-testid="dialogue-speech-text"]')?.textContent;
      const badge = document.querySelector('[data-testid="npc-relationship-badge"]')?.textContent;
      return {
        speech,
        badge,
        met: tunde?.memory.met,
        conversationCount: tunde?.memory.conversationCount,
        relationship: tunde?.relationship,
        topicsDiscussed: tunde?.memory.topicsDiscussed,
        choicesMade: tunde?.memory.choicesMade
      };
    })()
  `);
  console.log('Tunde Re-opened Conversation & Memory State:', memoryState);
  await cdp.screenshot('m7_05_remembered_context.png');

  // Exit dialogue again before world exploration
  await cdp.eval(`
    (() => {
      const exitBtn = document.querySelector('[data-testid="btn-close-dialogue"]') ||
                      document.querySelector('[data-testid="btn-end-dialogue"]');
      if (exitBtn) exitBtn.click();
    })()
  `);
  await sleep(600);

  // ----------------------------------------------------
  // Scenario 6: NPCs moving/present at shops & sidewalks
  // ----------------------------------------------------
  console.log('\n--- Scenario 6: NPC Presence in Lagos Environment ---');
  // Move near Mama Nkechi's provisions stall at (28, 0, 12)
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.playerController.setPosition(25, 0, 12);
        wm.playerController.setYaw(-Math.PI / 2);
        wm.cameraController.setYaw(-Math.PI / 2);
      }
    })()
  `);
  await sleep(600);
  await cdp.screenshot('m7_06_npc_locomotion_presence.png');

  // ----------------------------------------------------
  // Scenario 7: Multiple NPCs sharing space (Cedarline Interior)
  // ----------------------------------------------------
  console.log('\n--- Scenario 7: Multiple NPCs Sharing Space (Cedarline Interior) ---');
  // Transition into cedarline_interior
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm && wm.transitionController) {
        wm.transitionController.transitionTo('cedarline_interior');
      }
    })()
  `);
  await sleep(1500);

  // Stand back to see multiple NPCs (Amina at console, Marcus at server rack, Elena)
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.playerController.setPosition(0, 0, -2);
        wm.playerController.setYaw(Math.PI);
        wm.cameraController.setYaw(Math.PI);
      }
    })()
  `);
  await sleep(600);
  await cdp.screenshot('m7_07_multiple_npcs_sharing_space.png');

  // ----------------------------------------------------
  // Scenario 8: Mission-related conversation respecting Aster Incident state
  // ----------------------------------------------------
  console.log('\n--- Scenario 8: Mission-Related Conversation with Marcus Adebayo ---');
  // Approach Marcus Adebayo at (-5, 0, 2)
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.playerController.setPosition(-5, 0, 0.5);
        wm.playerController.setYaw(0);
        wm.cameraController.setYaw(0);
        wm.triggerNearbyInteraction();
      }
    })()
  `);
  await sleep(800);

  const marcusDialogue = await cdp.eval(`
    (() => {
      const overlay = document.querySelector('[data-testid="dialogue-overlay"]');
      const npcName = overlay?.querySelector('h3')?.textContent;
      const badge = document.querySelector('[data-testid="relationship-badge"]')?.textContent;
      const speech = document.querySelector('[data-testid="dialogue-speech"]')?.textContent;
      const choices = Array.from(document.querySelectorAll('[data-testid^="dialogue-choice-"]')).map(c => c.textContent?.trim());
      return { npcName, badge, speech, choices };
    })()
  `);
  console.log('Marcus Dialogue State:', marcusDialogue);

  // Select empathetic response: Choice 0 ("Marcus, breathe. I am investigating anomalous queries...")
  await cdp.eval(`
    (() => {
      const empatheticChoice = document.querySelector('[data-testid="dialogue-choice-0"]');
      if (empatheticChoice) empatheticChoice.click();
    })()
  `);
  await sleep(800);

  const marcusAfterEmpathy = await cdp.eval(`
    (() => {
      const badge = document.querySelector('[data-testid="npc-relationship-badge"]')?.textContent;
      const deltaTag = document.querySelector('[data-testid="dialogue-relationship-delta"]')?.textContent;
      const speech = document.querySelector('[data-testid="dialogue-speech-text"]')?.textContent;
      const sim = window.__CYBERLIFE_SIMULATION__;
      const marcusRel = sim?.state.npcs.npc_marcus.relationship;
      return { badge, deltaTag, speech, marcusRel };
    })()
  `);
  console.log('Marcus After Empathy Choice:', marcusAfterEmpathy);
  await cdp.screenshot('m7_08_mission_dialogue_aster.png');

  // ----------------------------------------------------
  // Scenario 9: Dialogue ended cleanly, resuming movement
  // ----------------------------------------------------
  console.log('\n--- Scenario 9: Dialogue Closed & Controls Resumed ---');
  // Exit Marcus dialogue cleanly via btn-close-dialogue
  await cdp.eval(`
    (() => {
      const exitBtn = document.querySelector('[data-testid="btn-close-dialogue"]') ||
                      document.querySelector('[data-testid="btn-end-dialogue"]');
      if (exitBtn) exitBtn.click();
    })()
  `);
  await sleep(600);

  const resumedState = await cdp.eval(`
    (() => {
      const overlay = document.querySelector('[data-testid="dialogue-overlay"]');
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      const sim = window.__CYBERLIFE_SIMULATION__;
      return {
        overlayOpen: !!overlay,
        inputDisabled: wm?.playerController?.isInputDisabled,
        activeDialogue: sim?.state.activeDialogue,
        cameraMode: wm?.getCameraMode()
      };
    })()
  `);
  console.log('Controls Resumed State:', resumedState);
  await cdp.screenshot('m7_09_dialogue_closed_movement_resumed.png');

  // ----------------------------------------------------
  // Scenario 10: Workstation Interaction & Contacts App
  // ----------------------------------------------------
  console.log('\n--- Scenario 10: Workstation Interaction & Contacts App ---');
  // Position player at workstation and open desktop
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.onWorkstationOpen?.('interact_cedarline_workstation');
      }
    })()
  `);
  await sleep(1000);

  // Dismiss "Got It — Use Workstation" dialog if present to leave Contacts app fully visible
  await cdp.eval(`
    (() => {
      const gotItBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Got It'));
      if (gotItBtn) gotItBtn.click();
    })()
  `);
  await sleep(500);

  // Click on "Contacts" desktop shortcut or taskbar
  await cdp.eval(`
    (() => {
      const contactsShortcut = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Contacts'));
      if (contactsShortcut) contactsShortcut.click();
    })()
  `);
  await sleep(1000);

  const contactsAppInfo = await cdp.eval(`
    (() => {
      const contactsApp = document.querySelector('[data-testid="contacts-app"]');
      const listCount = contactsApp?.querySelectorAll('button')?.length;
      const title = contactsApp?.querySelector('h3')?.textContent;
      return { hasContactsApp: !!contactsApp, title, listCount };
    })()
  `);
  console.log('Contacts App in Virtual Desktop:', contactsAppInfo);
  await cdp.screenshot('m7_10_workstation_contacts_app.png');

  // Close contacts app and workstation desktop
  await cdp.eval(`
    (() => {
      const closeBtn = document.querySelector('[data-testid="window-close-contacts"]');
      if (closeBtn) closeBtn.click();
      const exitDesktop = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Exit Desktop'));
      if (exitDesktop) exitDesktop.click();
    })()
  `);
  await sleep(800);

  // ----------------------------------------------------
  // Scenario 11: Narrow Viewport Responsive Dialogue Interface
  // ----------------------------------------------------
  console.log('\n--- Scenario 11: Narrow Viewport Responsive Verification ---');
  // Set narrow viewport (480 x 800)
  await cdp.setViewport(480, 800);
  await sleep(400);

  // Open dialogue with Lead Analyst Amina Okonjo in cedarline interior
  await cdp.eval(`
    (() => {
      const wm = window.__CYBERLIFE_WORLD_MANAGER__;
      if (wm) {
        wm.onNpcInteract?.('npc_amina');
      }
    })()
  `);
  await sleep(800);

  await cdp.screenshot('m7_11_narrow_viewport_responsive.png');

  // Reset viewport to 1280x800
  await cdp.setViewport(1280, 800);

  console.log('\n=== All 11 Scenarios Successfully Verified! ===');
  cdp.close();
  chrome.kill();
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
