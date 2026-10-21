import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9333;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
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

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = evt => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return result.result?.value;
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('=== Cyberlife Voice Diagnosis ===\n');

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ]);

  try {
    let connected = false;
    let attempts = 0;
    while (!connected && attempts < 20) {
      try {
        await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        connected = true;
      } catch {
        await sleep(200);
        attempts++;
      }
    }

    const pages = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
    const page = pages.find(p => p.type === 'page');
    if (!page) throw new Error('No target page found');

    const client = new CdpClient(page.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // 1. Diagnose voices available in Chrome
    const voiceData = await client.evaluate(`
      new Promise(resolve => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices.map(v => ({ name: v.name, lang: v.lang, default: v.default, localService: v.localService })));
          return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices.map(v => ({ name: v.name, lang: v.lang, default: v.default, localService: v.localService })));
        };
        // fallback timeout
        setTimeout(() => {
          resolve(window.speechSynthesis.getVoices().map(v => ({ name: v.name, lang: v.lang, default: v.default, localService: v.localService })));
        }, 1500);
      })
    `);

    console.log(`[+] Total voices found in Chrome: ${voiceData.length}`);
    const enNgVoices = voiceData.filter(v => v.lang.toLowerCase().includes('ng') || v.name.toLowerCase().includes('nigeri'));
    console.log(`[+] en-NG voices:`, enNgVoices);
    console.log(`[+] Sample voices (first 15):`);
    console.table(voiceData.slice(0, 15));

    // 2. Test current selectVoice logic against all characters
    const characterSelection = await client.evaluate(`
      (() => {
        const voices = window.speechSynthesis.getVoices();
        
        function selectVoiceOld(profile) {
          if (voices.length === 0) return null;

          // 1. Direct Nigerian English voice match
          const nigerianVoice = voices.find(v => {
            const lang = v.lang.toLowerCase();
            const name = v.name.toLowerCase();
            return (
              lang === 'en-ng' ||
              lang.startsWith('en-ng') ||
              lang.includes('ng') ||
              name.includes('nigeria') ||
              name.includes('nigerian')
            );
          });
          if (nigerianVoice) return { voice: nigerianVoice.name, lang: nigerianVoice.lang, step: 'nigerianVoice (lang.includes("ng") or name)' };

          // 2. West African or African Commonwealth English voice (en-GH, en-ZA)
          const africanVoice = voices.find(v => {
            const lang = v.lang.toLowerCase();
            return lang.startsWith('en-gh') || lang.startsWith('en-za');
          });
          if (africanVoice) return { voice: africanVoice.name, lang: africanVoice.lang, step: 'africanVoice (en-gh/en-za)' };

          // 3. Match character gender preference with British / Commonwealth English
          const genderMatches = voices.filter(v => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            const isEnglish = lang.startsWith('en');
            if (!isEnglish) return false;

            if (profile.preferredGender === 'female') {
              return (
                name.includes('female') ||
                name.includes('serena') ||
                name.includes('victoria') ||
                name.includes('samantha') ||
                name.includes('karen') ||
                name.includes('moira') ||
                name.includes('fiona')
              );
            } else {
              return (
                name.includes('male') ||
                name.includes('daniel') ||
                name.includes('oliver') ||
                name.includes('george') ||
                name.includes('rishi') ||
                name.includes('alex')
              );
            }
          });

          if (genderMatches.length > 0) {
            const gbMatch = genderMatches.find(v => v.lang.toLowerCase().startsWith('en-gb'));
            const chosen = gbMatch ?? genderMatches[0];
            return { voice: chosen.name, lang: chosen.lang, step: 'genderMatches' };
          }

          const gbVoice = voices.find(v => v.lang.toLowerCase().startsWith('en-gb'));
          if (gbVoice) return { voice: gbVoice.name, lang: gbVoice.lang, step: 'gbVoice' };

          const anyEnglish = voices.find(v => v.lang.toLowerCase().startsWith('en'));
          const fallback = anyEnglish ?? voices[0];
          return { voice: fallback?.name, lang: fallback?.lang, step: 'anyEnglish/first' };
        }

        const characters = [
          { name: 'Temitope Blessing', preferredGender: 'female' },
          { name: 'Marcus Adebayo', preferredGender: 'male' },
          { name: 'Dr. Elena Chen', preferredGender: 'female' },
          { name: 'Femi Martins', preferredGender: 'male' },
          { name: 'Mama Nkechi', preferredGender: 'female' },
          { name: 'Uncle Segun', preferredGender: 'male' },
          { name: 'Folake Davies', preferredGender: 'female' },
          { name: 'Tunde Bakare', preferredGender: 'male' },
          { name: 'Cipher', preferredGender: 'male' },
          { name: 'Aster SIEM Bot', preferredGender: 'male' },
        ];

        return characters.map(c => ({
          character: c.name,
          requestedGender: c.preferredGender,
          ...selectVoiceOld(c)
        }));
      })()
    `);

    console.log('\n[+] Old Voice Selection Per Character:');
    console.table(characterSelection);

    // 2b. Test new selectVoice logic against all characters
    const newCharacterSelection = await client.evaluate(`
      (() => {
        const voices = window.speechSynthesis.getVoices();

        const KNOWN_FEMALE_NAMES = new Set([
          'victoria', 'serena', 'samantha', 'karen', 'moira', 'fiona',
          'tessa', 'hazel', 'susan', 'heera', 'zira', 'jenny', 'aria',
          'sonia', 'natasha', 'libby', 'clara', 'neerja', 'ava', 'emma',
          'mia', 'ana', 'stephanie', 'amelia', 'alice', 'anna', 'alva',
          'amira', 'ezinne', 'carmit', 'damayanti'
        ]);

        const KNOWN_MALE_NAMES = new Set([
          'daniel', 'oliver', 'george', 'rishi', 'alex', 'david', 'mark',
          'guy', 'ryan', 'tom', 'james', 'richard', 'brian', 'arthur',
          'prabhat', 'ravi', 'albert', 'fred', 'abeo'
        ]);

        function isVoiceFemale(v) {
          const name = v.name.toLowerCase();
          const tokens = name.split(/[\\s\\-()_,.]+/);
          if (tokens.includes('female') || tokens.includes('woman') || tokens.includes('girl')) return true;
          return tokens.some(t => KNOWN_FEMALE_NAMES.has(t));
        }

        function isVoiceMale(v) {
          const name = v.name.toLowerCase();
          const tokens = name.split(/[\\s\\-()_,.]+/);
          if (tokens.includes('male') || tokens.includes('man') || tokens.includes('boy')) return true;
          return tokens.some(t => KNOWN_MALE_NAMES.has(t));
        }

        function isNigerianVoice(v) {
          const lang = v.lang.trim().toLowerCase();
          const name = v.name.toLowerCase();
          const isEnNg = lang === 'en-ng' || lang === 'en_ng' || lang.startsWith('en-ng-') || lang.startsWith('en_ng-');
          const hasNigeriaName = name.includes('nigeria') || name.includes('nigerian');
          return isEnNg || hasNigeriaName;
        }

        function isNaturalVoice(v) {
          return v.name.includes('Natural') || v.name.includes('Online');
        }

        function selectVoiceNew(profile) {
          if (voices.length === 0) return null;
          let bestVoice = null;
          let highestScore = -Infinity;

          for (const v of voices) {
            const female = isVoiceFemale(v);
            const male = isVoiceMale(v);

            if (profile.preferredGender === 'male' && female) continue;
            if (profile.preferredGender === 'female' && male) continue;

            let score = 0;
            const lang = v.lang.toLowerCase();

            if (isNigerianVoice(v)) score += 1000;
            else if (lang.startsWith('en-gh') || lang.startsWith('en-za')) score += 500;
            else if (lang.startsWith('en-gb')) score += 300;
            else if (lang.startsWith('en')) score += 100;
            else score -= 200;

            if (isNaturalVoice(v)) score += 250;
            if (profile.preferredGender === 'male' && male) score += 100;
            else if (profile.preferredGender === 'female' && female) score += 100;

            const lowerName = v.name.toLowerCase();
            for (const hint of profile.voiceHints) {
              if (lowerName.includes(hint.toLowerCase())) score += 60;
            }

            if (score > highestScore && score > 0) {
              highestScore = score;
              bestVoice = v;
            }
          }

          if (!bestVoice) {
            bestVoice = voices.find(v => {
              if (profile.preferredGender === 'male' && isVoiceFemale(v)) return false;
              if (profile.preferredGender === 'female' && isVoiceMale(v)) return false;
              return v.lang.toLowerCase().startsWith('en');
            }) || null;
          }

          return { voice: bestVoice?.name, lang: bestVoice?.lang, isFemale: bestVoice ? isVoiceFemale(bestVoice) : false, isMale: bestVoice ? isVoiceMale(bestVoice) : false };
        }

        const characters = [
          { name: 'Temitope Blessing', preferredGender: 'female', voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena', 'samantha'] },
          { name: 'Marcus Adebayo', preferredGender: 'male', voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'oliver', 'george'] },
          { name: 'Dr. Elena Chen', preferredGender: 'female', voiceHints: ['female', 'en-gb', 'en-us', 'karen', 'serena'] },
          { name: 'Femi Martins', preferredGender: 'male', voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'george'] },
          { name: 'Mama Nkechi', preferredGender: 'female', voiceHints: ['en-ng', 'nigeria', 'female', 'serena'] },
          { name: 'Uncle Segun', preferredGender: 'male', voiceHints: ['en-ng', 'nigeria', 'male', 'george', 'daniel'] },
          { name: 'Folake Davies', preferredGender: 'female', voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena'] },
          { name: 'Tunde Bakare', preferredGender: 'male', voiceHints: ['en-ng', 'nigeria', 'male', 'oliver', 'alex'] },
          { name: 'Cipher', preferredGender: 'male', voiceHints: ['en-ng', 'nigeria', 'male', 'daniel'] },
          { name: 'Aster SIEM Bot', preferredGender: 'male', voiceHints: ['synth', 'robot', 'bad news', 'cellos', 'whisper', 'albert', 'fred'] },
        ];

        return characters.map(c => ({
          character: c.name,
          requestedGender: c.preferredGender,
          ...selectVoiceNew(c)
        }));
      })()
    `);

    console.log('\n[+] New Voice Selection Per Character:');
    console.table(newCharacterSelection);

    // 3. Test (a) and (b): StrictMode double-run behavior & cancelled utterance clobbering
    const strictModeAndClobberTest = await client.evaluate(`
      new Promise(resolve => {
        const logs = [];
        let currentState = { currentUtteranceId: null, isSpeaking: false };

        // Emulate speak 1 (effect 1)
        logs.push('--- Step 1: Effect run 1 calls speak("Utterance 1") ---');
        const utt1 = new SpeechSynthesisUtterance('Test sentence one from effect one');
        currentState.currentUtteranceId = 'utt1';
        currentState.isSpeaking = true;

        utt1.onstart = () => logs.push('[EVENT utt1] onstart fired');
        utt1.onend = () => {
          logs.push('[EVENT utt1] onend fired! currentState.isSpeaking was ' + currentState.isSpeaking);
          currentState.isSpeaking = false;
          currentState.currentUtteranceId = null;
        };
        utt1.onerror = (e) => {
          logs.push('[EVENT utt1] onerror fired! error=' + e.error + '; currentState.isSpeaking was ' + currentState.isSpeaking);
          currentState.isSpeaking = false;
          currentState.currentUtteranceId = null;
        };

        window.speechSynthesis.speak(utt1);
        logs.push('window.speechSynthesis.speak(utt1) executed. speaking=' + window.speechSynthesis.speaking + ', pending=' + window.speechSynthesis.pending);

        // StrictMode immediately unmounts / calls cleanup
        logs.push('--- Step 2: StrictMode cleanup immediately calls cancel() ---');
        window.speechSynthesis.cancel();
        logs.push('window.speechSynthesis.cancel() executed. speaking=' + window.speechSynthesis.speaking + ', pending=' + window.speechSynthesis.pending);

        // StrictMode immediately runs effect 2
        logs.push('--- Step 3: Effect run 2 immediately calls speak("Utterance 2") ---');
        const utt2 = new SpeechSynthesisUtterance('Test sentence two from effect two');
        currentState.currentUtteranceId = 'utt2';
        currentState.isSpeaking = true;

        utt2.onstart = () => logs.push('[EVENT utt2] onstart fired! currentState.currentUtteranceId=' + currentState.currentUtteranceId);
        utt2.onend = () => {
          logs.push('[EVENT utt2] onend fired! currentState.currentUtteranceId=' + currentState.currentUtteranceId);
          currentState.isSpeaking = false;
          currentState.currentUtteranceId = null;
        };
        utt2.onerror = (e) => {
          logs.push('[EVENT utt2] onerror fired! error=' + e.error + '; currentState.currentUtteranceId=' + currentState.currentUtteranceId);
          currentState.isSpeaking = false;
          currentState.currentUtteranceId = null;
        };

        window.speechSynthesis.speak(utt2);
        logs.push('window.speechSynthesis.speak(utt2) executed. speaking=' + window.speechSynthesis.speaking + ', pending=' + window.speechSynthesis.pending);

        // Wait to observe asynchronous events from browser
        setTimeout(() => {
          logs.push('--- State after 600ms ---');
          logs.push('currentState: ' + JSON.stringify(currentState));
          logs.push('speechSynthesis.speaking: ' + window.speechSynthesis.speaking);
          logs.push('speechSynthesis.pending: ' + window.speechSynthesis.pending);

          // Now test with 75ms delay after cancel
          logs.push('--- Step 4: Test with 75ms delay after cancel ---');
          window.speechSynthesis.cancel();
          setTimeout(() => {
            const utt3 = new SpeechSynthesisUtterance('Test sentence three after delay');
            currentState.currentUtteranceId = 'utt3';
            currentState.isSpeaking = true;
            utt3.onstart = () => logs.push('[EVENT utt3] onstart fired!');
            utt3.onend = () => {
              logs.push('[EVENT utt3] onend fired!');
              currentState.isSpeaking = false;
            };
            utt3.onerror = (e) => {
              logs.push('[EVENT utt3] onerror fired! error=' + e.error);
              currentState.isSpeaking = false;
            };
            window.speechSynthesis.speak(utt3);
            setTimeout(() => {
              logs.push('--- State after utt3 500ms ---');
              logs.push('speechSynthesis.speaking: ' + window.speechSynthesis.speaking);
              resolve(logs);
            }, 500);
          }, 75);
        }, 600);
      })
    `);

    console.log('\n[+] StrictMode & Clobbering Diagnostic Log:');
    strictModeAndClobberTest.forEach(l => console.log('   ', l));

    await client.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
