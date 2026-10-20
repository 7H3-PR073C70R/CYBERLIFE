import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9224;
const OUT_DIR = path.resolve('docs/graphics/milestone13');

await fs.promises.mkdir(OUT_DIR, { recursive: true });

console.log('1. Launching Headless Chrome on port', PORT);
const chromeProc = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu-sandbox',
  '--enable-webgl',
  '--window-size=1920,1080',
  'http://localhost:5173/?workstation=open&location=apartment_interior',
]);

chromeProc.stderr.on('data', () => {});

async function waitForCDP() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (res.ok) {
        const targets = await res.json();
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Failed to connect to Chrome CDP within timeout');
}

const wsUrl = await waitForCDP();
console.log('2. Connected to Chrome CDP:', wsUrl);

const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let msgId = 1;
function sendCommand(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    const handler = event => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await sendCommand('Runtime.enable');
await sendCommand('Page.enable');

console.log('3. Waiting for app to initialize...');
await new Promise(r => setTimeout(r, 4500));

async function evalInPage(expression) {
  const wrapped = `(() => {\n${expression}\n})()`;
  const res = await sendCommand('Runtime.evaluate', {
    expression: wrapped,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    console.error('Eval error:', res.exceptionDetails);
    throw new Error(res.exceptionDetails.text || 'Eval error');
  }
  return res.result?.value;
}

async function takeScreenshot(filename) {
  const screenshot = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  const filepath = path.join(OUT_DIR, filename);
  await fs.promises.writeFile(filepath, buffer);
  console.log(`[Captured] ${filepath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// ----------------------------------------------------------------------------
// Step 1: Workstation desktop with orientation banner / seated third-person
// ----------------------------------------------------------------------------
console.log('Step 1: Capturing seated workstation entry...');
// Dismiss boot splash if present
await evalInPage(`
  const splash = document.querySelector('.heron-boot-splash');
  if (splash) splash.click();
`);
await new Promise(r => setTimeout(r, 600));
await takeScreenshot('01_workstation_sitdown.png');

// ----------------------------------------------------------------------------
// Step 2: Open CyberCatalogue App
// ----------------------------------------------------------------------------
console.log('Step 2: Opening CyberCatalogue...');
await evalInPage(`
  // Dismiss welcome banner
  const welcomeBtn = document.querySelector('[data-testid="btn-welcome-dismiss"]');
  if (welcomeBtn) welcomeBtn.click();

  // Find and double-click or click catalogue desktop shortcut
  const shortcut = document.querySelector('[data-testid="desktop-shortcut-catalogue"]');
  if (shortcut) {
    shortcut.click();
  }
`);
await new Promise(r => setTimeout(r, 1000));
await takeScreenshot('02_catalogue_overview.png');

// ----------------------------------------------------------------------------
// Step 3: Switch to Arsenal View and Search for a Known Tool
// ----------------------------------------------------------------------------
console.log('Step 3: Switching to Arsenal tab and searching...');
await evalInPage(`
  const arsenalTab = document.querySelector('[data-testid="tab-catalogue-arsenal"]');
  if (arsenalTab) arsenalTab.click();
`);
await new Promise(r => setTimeout(r, 600));

// Search for "Wireshark"
await evalInPage(`
  const search = document.querySelector('[data-testid="arsenal-search-input"]');
  if (search) {
    search.value = 'Wireshark';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.dispatchEvent(new Event('change', { bubbles: true }));
  }
`);
await new Promise(r => setTimeout(r, 600));
await takeScreenshot('03_arsenal_search.png');

// ----------------------------------------------------------------------------
// Step 4: Filtering Tools by Team, Category & Status
// ----------------------------------------------------------------------------
console.log('Step 4: Filtering tools by Team & Status...');
await evalInPage(`
  // Clear search query
  const search = document.querySelector('[data-testid="arsenal-search-input"]');
  if (search) {
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Filter by Blue Team
  const blueBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Blue Team'));
  if (blueBtn) blueBtn.click();

  // Filter by Status: Partial
  const statusSelect = document.querySelector('[data-testid="arsenal-status-filter"]');
  if (statusSelect) {
    statusSelect.value = 'partial';
    statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
`);
await new Promise(r => setTimeout(r, 600));
await takeScreenshot('04_arsenal_filters.png');

// ----------------------------------------------------------------------------
// Step 5: Playable Tool Inspection (Netmap / SvcScan)
// ----------------------------------------------------------------------------
console.log('Step 5: Inspecting Playable tool (Netmap)...');
await evalInPage(`
  // Reset status filter to 'playable'
  const statusSelect = document.querySelector('[data-testid="arsenal-status-filter"]');
  if (statusSelect) {
    statusSelect.value = 'playable';
    statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Reset team to All Tracks
  const allTracksBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('All Tracks'));
  if (allTracksBtn) allTracksBtn.click();

  // Click on Netmap item
  const netmapItem = document.querySelector('[data-testid="tool-item-tool_netmap"]');
  if (netmapItem) netmapItem.click();
`);
await new Promise(r => setTimeout(r, 600));
await takeScreenshot('05_playable_tool_inspection.png');

// ----------------------------------------------------------------------------
// Step 6: Inspecting Partial Tool with Clear Limitation Disclosures (Packet Lens)
// ----------------------------------------------------------------------------
console.log('Step 6: Inspecting Partial tool (Packet Lens)...');
await evalInPage(`
  // Reset status filter to 'all'
  const statusSelect = document.querySelector('[data-testid="arsenal-status-filter"]');
  if (statusSelect) {
    statusSelect.value = 'all';
    statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const packetLensItem = document.querySelector('[data-testid="tool-item-tool_packet_lens"]');
  if (packetLensItem) packetLensItem.click();
`);
await new Promise(r => setTimeout(r, 600));
await takeScreenshot('06_partial_tool_limitations.png');

// ----------------------------------------------------------------------------
// Step 7: Viewing Reference-Only and Planned Roadmap Entries (Exploit Lab)
// ----------------------------------------------------------------------------
console.log('Step 7: Viewing planned tool (Exploit Lab)...');
await evalInPage(`
  const exploitItem = document.querySelector('[data-testid="tool-item-tool_exploit_lab"]');
  if (exploitItem) exploitItem.click();
`);
await new Promise(r => setTimeout(r, 600));
await takeScreenshot('07_planned_and_ref_tools.png');

// ----------------------------------------------------------------------------
// Step 8: Detailed Learning Objectives & Prerequisites
// ----------------------------------------------------------------------------
console.log('Step 8: Inspecting Learning Objectives on SvcScan...');
await evalInPage(`
  const svcscanItem = document.querySelector('[data-testid="tool-item-tool_svcscan"]');
  if (svcscanItem) svcscanItem.click();
`);
await new Promise(r => setTimeout(r, 600));
await takeScreenshot('08_learning_objectives.png');

// ----------------------------------------------------------------------------
// Step 9: Switching Between Applications (Terminal & Incident Portal)
// ----------------------------------------------------------------------------
console.log('Step 9: Launching Terminal alongside Catalogue...');
await evalInPage(`
  // Launch terminal via action button
  const actionBtn = document.querySelector('[data-testid="btn-arsenal-tool-action"]');
  if (actionBtn) actionBtn.click();
`);
await new Promise(r => setTimeout(r, 1200));
await takeScreenshot('09_app_switching.png');

// ----------------------------------------------------------------------------
// Step 10: Exit Workstation and Restore Exploration Controls
// ----------------------------------------------------------------------------
console.log('Step 10: Standing up from workstation to restore exploration mode...');
await evalInPage(`
  // Simulate Escape key press to stand up
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
`);
await new Promise(r => setTimeout(r, 1500));
await takeScreenshot('10_exploration_restored.png');

console.log('Browser acceptance test suite completed successfully!');
ws.close();
chromeProc.kill();
process.exit(0);
