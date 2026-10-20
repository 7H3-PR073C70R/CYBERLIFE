/**
 * Cyberlife — Capture Full OS Demonstration Screenshots via Native Chrome CDP
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9226;
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

// Dismiss onboarding / workstation welcome modal if present
await evalScript(`
  (() => {
    const gotItBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Got It'));
    if (gotItBtn) gotItBtn.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 600));

// 1. Capture Desktop with Top & Bottom Panels (Taskbar + Pager + CPU/RAM graph)
console.log('Capturing Desktop layout with MATE top and bottom panels...');
await captureScreenshot('desktop_parrot_mate_layout.png');

// 2. Open Applications -> Heron Security menu to show cascading menu
console.log('Opening cascading Heron Security menu...');
await evalScript(`
  (() => {
    const appBtn = document.querySelector('[data-testid="btn-start-launcher"]');
    if (appBtn) appBtn.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 400));
await evalScript(`
  (() => {
    const secItem = Array.from(document.querySelectorAll('div')).find(d => d.textContent && d.textContent.includes('Heron Security'));
    if (secItem) {
      secItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 500));
await captureScreenshot('desktop_cascading_security_menu.png');

// Close menu
await evalScript(`
  (() => {
    document.body.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 300));

// 3. Launch Tor Browser
console.log('Launching Tor Browser...');
await evalScript(`
  (() => {
    const torShortcut = document.querySelector('[data-testid="desktop-shortcut-torBrowser"]');
    if (torShortcut) {
      torShortcut.click();
      torShortcut.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    }
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 1000));

// Open Circuit inspector in Tor Browser
await evalScript(`
  (() => {
    const circuitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Circuit'));
    if (circuitBtn) circuitBtn.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 600));
await captureScreenshot('tor_browser_circuit_and_market.png');

// 4. Launch OnionChat
console.log('Launching OnionChat...');
await evalScript(`
  (() => {
    const chatShortcut = document.querySelector('[data-testid="desktop-shortcut-onionChat"]');
    if (chatShortcut) {
      chatShortcut.click();
      chatShortcut.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    }
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 1000));

// Click Call Secure Line
console.log('Triggering VoIP audio call...');
await evalScript(`
  (() => {
    const callBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Call Secure Line'));
    if (callBtn) callBtn.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 1400));
await captureScreenshot('onion_chat_and_active_call.png');

// 5. Focus Terminal and show GTK menubar with File dropdown
console.log('Focusing Terminal with GTK menubar...');
await evalScript(`
  (() => {
    // Click outside to close any open start menus
    document.querySelector('.desktop-work-area')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const termBtn = Array.from(document.querySelectorAll('.heron-window-strip button')).find(b => b.textContent && b.textContent.includes('Terminal'));
    if (termBtn) termBtn.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 600));

await evalScript(`
  (() => {
    // Click File in GTK menubar to open dropdown
    const fileMenuBtn = Array.from(document.querySelectorAll('.terminal-gtk-menubar button')).find(b => b.textContent && b.textContent.trim() === 'File');
    if (fileMenuBtn) fileMenuBtn.click();
    return true;
  })()
`);
await new Promise(r => setTimeout(r, 600));
await captureScreenshot('terminal_gtk_menubar.png');

ws.close();
chromeProc.kill();
console.log('All screenshots captured successfully.');
