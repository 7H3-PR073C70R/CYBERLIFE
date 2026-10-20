import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9223;
const OUT_DIR = path.resolve('docs/graphics/os_redesign');

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

await sendCommand('Runtime.enable');
await sendCommand('Page.enable');

console.log('3. Waiting for app to load...');
await new Promise(r => setTimeout(r, 4000));

async function evalInPage(expression) {
  const res = await sendCommand('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return res.result?.value;
}

async function captureScreenshot(filename) {
  const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(res.data, 'base64');
  const filePath = path.join(OUT_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  console.log(`Saved screenshot: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// Dismiss boot moment and welcome banner if present
await evalInPage(`
  (() => {
    const splash = document.querySelector('.heron-boot-splash');
    if (splash) splash.click();
    const welcomeClose = document.querySelector('[data-testid="btn-welcome-dismiss"]');
    if (welcomeClose) welcomeClose.click();
  })()
`);
await new Promise(r => setTimeout(r, 600));

// 1. Capture Terminal Open (default open window)
console.log('Capturing: 02_terminal_open.png');
await evalInPage(`
  (() => {
    const input = document.querySelector('[data-testid="terminal-command-input"]');
    if (input) {
      input.value = 'whoami';
      input.focus();
    }
  })()
`);
await new Promise(r => setTimeout(r, 400));
await captureScreenshot('02_terminal_open.png');

// 2. Capture Two Windows Open (Terminal and System Info)
console.log('Capturing: 03_two_windows_focused.png');
await evalInPage(`
  (() => {
    const sysShortcut = document.querySelector('[data-testid="desktop-shortcut-systemInfo"]');
    if (sysShortcut) sysShortcut.click();
  })()
`);
await new Promise(r => setTimeout(r, 800));
await captureScreenshot('03_two_windows_focused.png');

// 3. Capture Applications Menu Open
console.log('Capturing: 04_applications_menu_open.png');
await evalInPage(`
  (() => {
    const menuBtn = document.querySelector('[data-testid="btn-start-launcher"]');
    if (menuBtn) menuBtn.click();
  })()
`);
await new Promise(r => setTimeout(r, 500));
await captureScreenshot('04_applications_menu_open.png');

// Close menu
await evalInPage(`
  (() => {
    const menuBtn = document.querySelector('[data-testid="btn-start-launcher"]');
    if (menuBtn) menuBtn.click();
  })()
`);

// 4. Capture Desktop with No Windows
console.log('Capturing: 01_desktop_no_windows.png');
await evalInPage(`
  (() => {
    const closeBtns = document.querySelectorAll('.window-control-btn.btn-close');
    closeBtns.forEach(b => b.click());
  })()
`);
await new Promise(r => setTimeout(r, 600));
await captureScreenshot('01_desktop_no_windows.png');

// 5. Restore Terminal for layout checks
await evalInPage(`
  (() => {
    const termBtn = document.querySelector('[data-testid="btn-empty-open-terminal"]');
    if (termBtn) termBtn.click();
  })()
`);
await new Promise(r => setTimeout(r, 600));

// 6. Capture Fullscreen layout
console.log('Capturing: 05_fullscreen_layout.png');
await captureScreenshot('05_fullscreen_layout.png');

// 7. Capture Bounded layout (peek out view where workstation is viewed over shoulder)
console.log('Capturing: 06_bounded_layout.png');
await evalInPage(`
  (() => {
    const mgr = window.__CYBERLIFE_WORLD_MANAGER__;
    if (mgr) {
      mgr.peekOutWorkstation();
    }
  })()
`);
await new Promise(r => setTimeout(r, 1000));
await captureScreenshot('06_bounded_layout.png');

// 8. 3D screen closeup day
console.log('Capturing: 07_desk_screen_closeup_day.png');
await evalInPage(`
  (() => {
    const mgr = window.__CYBERLIFE_WORLD_MANAGER__;
    if (mgr) {
      mgr.setSimulationTime('12:00 PM');
      mgr.setCameraBookmark('desk_screen_closeup');
    }
  })()
`);
await new Promise(r => setTimeout(r, 1000));
await captureScreenshot('07_desk_screen_closeup_day.png');

// 9. 3D screen closeup night
console.log('Capturing: 08_desk_screen_closeup_night.png');
await evalInPage(`
  (() => {
    const mgr = window.__CYBERLIFE_WORLD_MANAGER__;
    if (mgr) {
      mgr.setSimulationTime('10:00 PM');
      mgr.setCameraBookmark('desk_screen_closeup');
    }
  })()
`);
await new Promise(r => setTimeout(r, 1000));
await captureScreenshot('08_desk_screen_closeup_night.png');

// 10. Side by Side comparison (Overlay vs 3D Screen)
console.log('Capturing side-by-side comparison visual...');
await evalInPage(`
  (() => {
    const mgr = window.__CYBERLIFE_WORLD_MANAGER__;
    if (mgr) {
      mgr.focusWorkstationScreen();
    }
  })()
`);
await new Promise(r => setTimeout(r, 1000));
await captureScreenshot('09_overlay_view.png');

ws.close();
chromeProc.kill();
console.log('All screenshots successfully generated in docs/graphics/os_redesign/');
process.exit(0);
