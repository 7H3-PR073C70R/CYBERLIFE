import { spawn } from 'child_process';
import fs from 'fs';

const url = process.argv[2] || 'http://127.0.0.1:5173/?location=neighborhood&skipIntro=1';
const outPath = process.argv[3] || 'screenshot.png';
const waitMs = parseInt(process.argv[4] || '4000', 10);
const port = 9222 + Math.floor(Math.random() * 500);

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--window-size=1440,900',
  '--disable-gpu-watchdog',
  '--no-sandbox',
  '--disable-setuid-sandbox',
]);

async function run() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
      if (res.ok) {
        const target = await res.json();
        const ws = new WebSocket(target.webSocketDebuggerUrl);

        await new Promise((resolve, reject) => {
          ws.onopen = resolve;
          ws.onerror = reject;
        });

        let id = 1;
        function send(method, params = {}) {
          return new Promise(res => {
            const reqId = id++;
            const handler = evt => {
              const msg = JSON.parse(evt.data);
              if (msg.id === reqId) {
                ws.removeEventListener('message', handler);
                res(msg.result);
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        }

        await send('Page.enable');
        await send('Runtime.enable');

        ws.addEventListener('message', evt => {
          const msg = JSON.parse(evt.data);
          if (msg.method === 'Runtime.consoleAPICalled') {
            const type = msg.params.type;
            if (type === 'error' || type === 'warn') {
              console.log(`[Browser ${type}]:`, ...msg.params.args.map(a => a.value || a.description || ''));
            }
          }
        });

        // Wait for WebGL rendering
        await new Promise(r => setTimeout(r, waitMs));

        const evalCode = process.argv[5];
        if (evalCode) {
          await send('Runtime.evaluate', { expression: evalCode });
          await new Promise(r => setTimeout(r, 800));
        }

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
        console.log(`Saved screenshot (${shot.data.length} b64 bytes) to ${outPath}`);

        ws.close();
        chrome.kill('SIGKILL');
        process.exit(0);
      }
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  chrome.kill('SIGKILL');
  console.error('Failed to connect to Chrome CDP');
  process.exit(1);
}

run();
