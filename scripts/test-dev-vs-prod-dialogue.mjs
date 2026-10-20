import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTest(port, modeName) {
  console.log(`\n=== Testing ${modeName} (Port ${port}) ===`);
  const debugPort = port + 5000;
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--disable-gpu',
    '--no-first-run',
    '--autoplay-policy=no-user-gesture-required',
    `http://localhost:${port}/?skipIntro=1&npc=npc_amina`
  ]);

  try {
    await sleep(1500);
    const pages = await new Promise((res, rej) => http.get(`http://127.0.0.1:${debugPort}/json`, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }));
    const page = pages.find(p => p.url.includes(String(port)));
    if (!page) throw new Error(`Page on port ${port} not found`);

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    // Instrument speechSynthesis before or during page load
    const logs = [];
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));

    // Inject interceptor into the page
    const injected = await new Promise(res => {
      const id = 10;
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              window.__speechLog = [];
              const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
              const origCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
              let uttCount = 0;

              window.speechSynthesis.speak = function(utt) {
                const id = ++uttCount;
                window.__speechLog.push({ type: 'speak_called', id, text: utt.text, voice: utt.voice?.name, lang: utt.voice?.lang });
                const origOnStart = utt.onstart;
                const origOnEnd = utt.onend;
                const origOnError = utt.onerror;

                utt.onstart = function(e) {
                  window.__speechLog.push({ type: 'onstart', id });
                  if (origOnStart) origOnStart.call(this, e);
                };
                utt.onend = function(e) {
                  window.__speechLog.push({ type: 'onend', id });
                  if (origOnEnd) origOnEnd.call(this, e);
                };
                utt.onerror = function(e) {
                  window.__speechLog.push({ type: 'onerror', id, error: e.error });
                  if (origOnError) origOnError.call(this, e);
                };

                return origSpeak(utt);
              };

              window.speechSynthesis.cancel = function() {
                window.__speechLog.push({ type: 'cancel_called' });
                return origCancel();
              };

              return true;
            })()
          `,
          returnByValue: true
        }
      }));
      const handler = evt => {
        const d = JSON.parse(evt.data);
        if (d.id === id) {
          ws.removeEventListener('message', handler);
          res(d.result?.result?.value);
        }
      };
      ws.addEventListener('message', handler);
    });

    // Reload page to catch all mount events with instrumentation
    ws.send(JSON.stringify({ id: 20, method: 'Page.reload' }));

    // Re-inject early on navigation
    await sleep(200);
    // Wait for dialogue overlay and speech synthesis
    await sleep(2500);

    const speechLog = await new Promise(res => {
      const id = 30;
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          expression: 'window.__speechLog || []',
          returnByValue: true
        }
      }));
      const handler = evt => {
        const d = JSON.parse(evt.data);
        if (d.id === id) {
          ws.removeEventListener('message', handler);
          res(d.result?.result?.value);
        }
      };
      ws.addEventListener('message', handler);
    });

    console.log(`Speech Log in ${modeName}:`, speechLog);

    ws.close();
  } finally {
    chrome.kill();
  }
}

async function main() {
  await runTest(5173, 'DEV MODE (StrictMode enabled)');
  await runTest(4173, 'PRODUCTION BUILD (No StrictMode)');
}

main().catch(console.error);
