const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = '/Users/protector/.gemini/antigravity-ide/brain/96d1a3b9-ae85-4f82-bb34-9f6a64fa7e1a';
const CHROME_PORT = 9333;
const USER_DATA_DIR = '/tmp/chrome-m7-verify';

async function sleep(ms) {
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
    'http://localhost:5174/'
  ];
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', chromeArgs);
  return chrome;
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
    return res.result?.value;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filepath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`Saved screenshot: ${filepath} (${buffer.length} bytes)`);
    return filepath;
  }

  async key(type, key, code, keyCode) {
    await this.send('Input.dispatchKeyEvent', {
      type,
      key,
      code,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode
    });
  }

  async press(key, code, keyCode) {
    await this.key('rawKeyDown', key, code, keyCode);
    await sleep(50);
    await this.key('keyUp', key, code, keyCode);
    await sleep(50);
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log('Launching headless Chrome on port', CHROME_PORT);
  const chrome = startChrome();

  let targets = null;
  for (let i = 0; i < 20; i++) {
    try {
      targets = await fetchJson(`http://127.0.0.1:${CHROME_PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch {
      await sleep(500);
    }
  }

  if (!targets || targets.length === 0) {
    console.error('Failed to get CDP targets');
    chrome.kill();
    process.exit(1);
  }

  const page = targets.find(t => t.type === 'page');
  console.log('Connecting to page:', page.title, page.url, page.webSocketDebuggerUrl);

  const cdp = new CDPClient(page.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('CDP connected!');

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // Wait for 3D world to render
  console.log('Waiting for world to render...');
  await sleep(4000);

  // 1. Initial Lagos scene
  await cdp.screenshot('m7_01_lagos_outdoor_scene.png');

  // Check state via Runtime.evaluate
  const locationInfo = await cdp.eval(`
    (() => {
      const loc = document.querySelector('[class*="Location"]')?.textContent || document.body.innerText;
      return { text: document.title, url: window.location.href };
    })()
  `);
  console.log('Page info:', locationInfo);

  // Check interactables in world
  const interactables = await cdp.eval(`
    (() => {
      // Find interaction prompt if any
      const prompt = document.querySelector('[data-testid="interaction-prompt"]')?.textContent;
      return { prompt };
    })()
  `);
  console.log('Prompt at start:', interactables);

  // Let's inspect the React state or dispatch directly or simulate walking to Amina
  // Amina is at (14, 0, -8). Spawn is at (0, 0, 10).
  // In window context, let's see if we can trigger interaction or inspect the scene
  const sceneDebug = await cdp.eval(`
    (() => {
      return {
        hasWebGL: !!document.querySelector('canvas'),
        hudButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean)
      };
    })()
  `);
  console.log('Scene debug:', sceneDebug);

  cdp.close();
  chrome.kill();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
