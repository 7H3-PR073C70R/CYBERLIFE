import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9224;
const OUT_DIR = path.resolve('docs/graphics/os_redesign');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #020408;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  .header h1 {
    font-size: 26px;
    margin: 0 0 6px 0;
    color: #00e5ff;
    letter-spacing: 0.05em;
  }
  .header p {
    font-size: 14px;
    color: #94a3b8;
    margin: 0;
  }
  .grid {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
  .card {
    flex: 1;
    background: #0c131f;
    border: 1px solid #1e293b;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 12px 32px rgba(0,0,0,0.7);
  }
  .card-title {
    padding: 10px 16px;
    font-weight: 600;
    font-size: 14px;
    background: #111a28;
    border-bottom: 1px solid #1e293b;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tag {
    font-size: 11px;
    font-family: monospace;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .tag-overlay { background: rgba(0, 229, 255, 0.15); color: #00e5ff; border: 1px solid rgba(0, 229, 255, 0.3); }
  .tag-screen { background: rgba(0, 230, 118, 0.15); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3); }
  .card img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>HERON OS 4.5 // DUAL-LAYER VISUAL SYNCHRONIZATION</h1>
    <p>Direct Side-by-Side Parity Check: Full-Screen Workstation Overlay vs. In-World Physical 3D Monitor</p>
  </div>
  <div class="grid">
    <div class="card">
      <div class="card-title">
        <span>Workstation Fullscreen Overlay</span>
        <span class="tag tag-overlay">REACT DOM LAYER</span>
      </div>
      <img src="file://${path.resolve(OUT_DIR, '02_terminal_open.png')}" alt="Fullscreen Overlay" />
    </div>
    <div class="card">
      <div class="card-title">
        <span>In-World 3D Monitor Closeup</span>
        <span class="tag tag-screen">THREE.JS CANVAS TEXTURE</span>
      </div>
      <img src="file://${path.resolve(OUT_DIR, '07_desk_screen_closeup_day.png')}" alt="3D Monitor Screen" />
    </div>
  </div>
</body>
</html>
`;

const htmlPath = path.resolve('scratch/comparison.html');
await fs.promises.writeFile(htmlPath, htmlContent);

const chromeProc = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu-sandbox',
  '--window-size=2400,1400',
  `file://${htmlPath}`,
]);

async function waitForCDP() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (res.ok) {
        const targets = await res.json();
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Failed to connect to Chrome CDP within timeout');
}

const wsUrl = await waitForCDP();
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
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
await new Promise(r => setTimeout(r, 1200));

const screenshot = await sendCommand('Page.captureScreenshot', { format: 'png' });
const outPath = path.join(OUT_DIR, '09_overlay_vs_3d_screen_comparison.png');
await fs.promises.writeFile(outPath, Buffer.from(screenshot.data, 'base64'));
console.log('Saved 09_overlay_vs_3d_screen_comparison.png');

ws.close();
chromeProc.kill();
process.exit(0);
