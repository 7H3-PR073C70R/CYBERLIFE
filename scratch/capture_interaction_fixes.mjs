import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9226;
const OUT_DIR = path.resolve('docs/graphics/interaction_fixes');

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

async function captureScreenshot(filename) {
  const result = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(result.data, 'base64');
  const filepath = path.join(OUT_DIR, filename);
  await fs.promises.writeFile(filepath, buf);
  console.log(`Saved screenshot: ${filepath}`);
}

async function evaluate(expression) {
  const res = await sendCommand('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return res.result?.value;
}

async function dismissModals() {
  await evaluate(`
    // Dismiss onboarding modal
    const skipBtn = document.querySelector('button[aria-label="Skip onboarding"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip Orientation') || b.textContent.includes('Skip'));
    if (skipBtn) skipBtn.click();

    // Dismiss workstation hint popup if present
    const hintBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Got It'));
    if (hintBtn) hintBtn.click();
  `);
}

try {
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');

  // Shot 1: Apartment Interior Wide (Bookshelf with Books, Conduits, Single AC, Bed)
  console.log('3. Navigating to apartment interior...');
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/?location=apartment_interior' });
  await new Promise(r => setTimeout(r, 3500));
  await dismissModals();
  await new Promise(r => setTimeout(r, 600));

  await evaluate(`
    if (window.__CYBERLIFE_WORLD_MANAGER__) {
      window.__CYBERLIFE_WORLD_MANAGER__.applyBookmarkCamera('apartment_wide');
    }
  `);
  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot('01_apartment_interior_props.png');

  // Shot 2: Workstation Desk Details (Calculator, YubiKey, ALFA Wi-Fi, Notebook & Pen, SSD, Sticky Notes)
  console.log('4. Focusing on desk seated camera...');
  await evaluate(`
    if (window.__CYBERLIFE_WORLD_MANAGER__) {
      window.__CYBERLIFE_WORLD_MANAGER__.applyBookmarkCamera('desk_seated_third_person');
    }
  `);
  await new Promise(r => setTimeout(r, 1200));
  await captureScreenshot('02_cybersecurity_desk_details.png');

  // Shot 3: Standing up from chair - verify clearance
  console.log('5. Exiting workstation to verify standing clearance...');
  await evaluate(`
    if (window.__CYBERLIFE_WORLD_MANAGER__) {
      window.__CYBERLIFE_WORLD_MANAGER__.exitWorkstationSession();
    }
  `);
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot('03_chair_standup_clearance.png');

  // Shot 4: Security News App in Virtual Desktop
  console.log('6. Opening Security News App in Desktop...');
  await sendCommand('Page.navigate', {
    url: 'http://localhost:5173/?location=apartment_interior&workstation=open&app=securityNews',
  });
  await new Promise(r => setTimeout(r, 3000));
  await dismissModals();
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot('04_parrotsec_threat_news_app.png');

  // Shot 5: Mobile Viewport Responsive Objective HUD
  console.log('7. Testing smaller device viewport...');
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 414,
    height: 736,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/?location=neighborhood' });
  await new Promise(r => setTimeout(r, 3000));
  await dismissModals();
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot('05_mobile_responsive_hud.png');

  console.log('All verification captures completed successfully!');
} catch (err) {
  console.error('Capture error:', err);
} finally {
  ws.close();
  chromeProc.kill('SIGTERM');
  process.exit(0);
}
