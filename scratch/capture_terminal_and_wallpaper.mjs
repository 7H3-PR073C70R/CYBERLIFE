import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9225;
const OUT_DIR = path.resolve('docs/graphics');

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

await sendCommand('Page.enable');
await sendCommand('Runtime.enable');
await sendCommand('Emulation.setDeviceMetricsOverride', {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false,
});

async function captureScreenshot(filename) {
  const result = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(result.data, 'base64');
  const filepath = path.join(OUT_DIR, filename);
  await fs.promises.writeFile(filepath, buf);
  console.log(`Saved screenshot: ${filepath} (${Math.round(buf.length / 1024)} KB)`);
}

async function evalScript(expression) {
  const res = await sendCommand('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    console.error('Script error:', res.exceptionDetails);
    throw new Error(res.exceptionDetails.text || 'CDP eval error');
  }
  return res.result.value;
}

// Wait for app load
await new Promise(r => setTimeout(r, 3500));

// Dismiss boot splash if present
await evalScript(`
  (() => {
    const splash = document.querySelector('.heron-boot-splash');
    if (splash) splash.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 500));

// Dismiss onboarding / workstation modal if present
await evalScript(`
  (() => {
    const gotItBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Got It'));
    if (gotItBtn) gotItBtn.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 500));

// Capture custom wallpaper desktop view
await captureScreenshot('desktop_custom_wallpaper.png');

// Focus terminal and type commands
await evalScript(`
  (() => {
    const termInput = document.querySelector('[data-testid="terminal-command-input"]');
    if (termInput) {
      termInput.focus();
      return true;
    }
    return false;
  })()
`);

// Type a command: 'whoami'
await evalScript(`
  (() => {
    const input = document.querySelector('[data-testid="terminal-command-input"]');
    if (input) {
      // Set input value
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, 'netmap hosts');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
      return true;
    }
    return false;
  })()
`);

await new Promise(r => setTimeout(r, 600));

// Capture terminal green on black
await captureScreenshot('terminal_green_on_black.png');

ws.close();
chromeProc.kill();
console.log('Capture completed successfully.');
