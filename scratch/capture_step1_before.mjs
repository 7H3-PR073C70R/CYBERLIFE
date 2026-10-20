import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9224;
const OUT_DIR = path.resolve('docs/graphics/step1/before');

await fs.promises.mkdir(OUT_DIR, { recursive: true });

console.log('1. Launching Headless Chrome on port', PORT);
const chromeProc = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu-sandbox',
  '--enable-webgl',
  '--window-size=1600,900',
  'about:blank',
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
console.log('2. Connected to Chrome CDP target:', wsUrl);

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

// Track console messages and network requests
const consoleLogs = [];
const networkRequests = [];

ws.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.method === 'Console.messageAdded') {
    consoleLogs.push(data.params.message);
  }
  if (data.method === 'Runtime.consoleAPICalled') {
    consoleLogs.push({
      type: data.params.type,
      args: data.params.args?.map(a => a.value ?? a.description),
    });
  }
  if (data.method === 'Network.requestWillBeSent') {
    networkRequests.push(data.params.request.url);
  }
});

await sendCommand('Console.enable');
await sendCommand('Runtime.enable');
await sendCommand('Page.enable');
await sendCommand('Network.enable');

async function evalInPage(expression) {
  const res = await sendCommand('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return res.result?.value;
}

async function capture(filename) {
  const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(res.data, 'base64');
  const filePath = path.join(OUT_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  console.log(`Saved screenshot: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function dismissModals() {
  await evalInPage(`
    (() => {
      const skipBtn = document.querySelector('[data-testid="onboarding-skip-tour-btn"]');
      if (skipBtn) skipBtn.click();
      const closeIntro = document.querySelector('[data-testid="onboarding-close-btn"]');
      if (closeIntro) closeIntro.click();
      const closeHelp = document.querySelector('.movement-help-close');
      if (closeHelp) closeHelp.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
}

// 1. Street from spawn
console.log('Navigating to street spawn...');
await sendCommand('Page.navigate', { url: 'http://localhost:5173/?location=neighborhood' });
await new Promise(r => setTimeout(r, 4000));
await dismissModals();
await capture('street_from_spawn.png');

// 2. Cedarline office
console.log('Navigating to Cedarline office...');
await sendCommand('Page.navigate', { url: 'http://localhost:5173/?location=cedarline_interior' });
await new Promise(r => setTimeout(r, 4000));
await dismissModals();
await capture('cedarline_office.png');

// 3. Player seated at desk
console.log('Navigating to apartment interior (seated at desk)...');
await sendCommand('Page.navigate', { url: 'http://localhost:5173/?location=apartment_interior' });
await new Promise(r => setTimeout(r, 3500));
await dismissModals();
await evalInPage(`
  (() => {
    const mgr = window.__CYBERLIFE_WORLD_MANAGER__;
    if (mgr) {
      mgr.setCameraBookmark('desk_seated_third_person');
    }
  })()
`);
await new Promise(r => setTimeout(r, 1500));
await capture('player_seated_at_desk.png');

console.log('\n--- NETWORK REQUESTS TO ASSETS ---');
const assetReqs = networkRequests.filter(url => url.includes('/assets/'));
console.log(assetReqs.length ? assetReqs.join('\n') : 'None');

console.log('\n--- CHARACTER RELATED REQUESTS ---');
const charReqs = networkRequests.filter(url => url.includes('character') || url.includes('.glb'));
console.log(charReqs.length ? charReqs.join('\n') : 'No character requests');

console.log('\n--- CONSOLE LOGS (ERRORS/WARNINGS) ---');
const errors = consoleLogs.filter(
  l => l.level === 'error' || l.type === 'error' || l.level === 'warning'
);
console.log(errors.length ? JSON.stringify(errors, null, 2) : 'No console errors/warnings');

ws.close();
chromeProc.kill();
console.log('\nStep 1 "before" screenshots captured successfully.');
process.exit(0);
