import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9222;
const OUT_DIR = path.resolve('docs/graphics/workstation_assets');

await fs.promises.mkdir(OUT_DIR, { recursive: true });

console.log('1. Launching Headless Chrome...');
const chromeProc = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu-sandbox',
  '--enable-webgl',
  '--window-size=1600,1000',
  'http://localhost:5173/?location=apartment_interior',
]);

chromeProc.stderr.on('data', d => {
  // console.log('[Chrome]', d.toString());
});

// Wait for Chrome CDP to be available
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
    } catch {
      // retry
    }
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

// Enable Runtime and Page
await sendCommand('Runtime.enable');
await sendCommand('Page.enable');

console.log('3. Waiting for 3D scene & PBR assets to load...');
await new Promise(r => setTimeout(r, 4500));

async function evalInPage(expression) {
  const res = await sendCommand('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return res.result?.value;
}

const targets = [
  // Day (12:00 PM)
  { time: '12:00 PM', bookmark: 'apartment_wide', file: 'apartment_wide_day.png' },
  {
    time: '12:00 PM',
    bookmark: 'desk_seated_third_person',
    file: 'desk_seated_third_person_day.png',
  },
  { time: '12:00 PM', bookmark: 'desk_screen_closeup', file: 'desk_screen_closeup_day.png' },

  // Night (10:00 PM)
  { time: '10:00 PM', bookmark: 'desk_screen_closeup', file: 'desk_screen_closeup_night.png' },
  {
    time: '10:00 PM',
    bookmark: 'desk_seated_third_person',
    file: 'desk_seated_third_person_night.png',
  },
  { time: '10:00 PM', bookmark: 'apartment_wide', file: 'apartment_wide_night.png' },
];

console.log('4. Capturing viewpoints...');
for (const t of targets) {
  console.log(` -> Capturing ${t.file} (time: ${t.time}, bookmark: ${t.bookmark})...`);
  const captureExpr = `
    (async () => {
      const manager = window.__CYBERLIFE_WORLD_MANAGER__;
      if (!manager) return { error: 'No manager' };
      manager.setSimulationTime('${t.time}');
      manager.updateWorkstationTerminal([
        'tade@ekosec-ws04:~$ uname -a',
        'Linux cyberlife 6.8.0-heron x86_64',
        'tade@ekosec-ws04:~$ status --node-all',
        '[OK] 10.0.4.15/24 CEDARLINE APARTMENT NODE READY',
        'tade@ekosec-ws04:~$ ping -c 1 10.0.4.1',
        '64 bytes from 10.0.4.1: icmp_seq=1 ttl=64 time=0.82 ms',
        'tade@ekosec-ws04:~$ _',
      ]);
      manager.setCameraBookmark('${t.bookmark}');
      await new Promise(r => setTimeout(r, 600));
      const ok = await manager.captureBookmarkScreenshot('${t.file}');
      return { ok, file: '${t.file}' };
    })()
  `;

  const result = await evalInPage(captureExpr);
  console.log(`    Result:`, result);
  await new Promise(r => setTimeout(r, 500));
}

console.log('5. Capturing completed! Closing browser.');
ws.close();
chromeProc.kill();
process.exit(0);
