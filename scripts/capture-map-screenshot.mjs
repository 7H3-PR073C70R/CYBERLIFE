import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = '/Users/protector/.gemini/antigravity-ide/brain/73070090-5781-4f2f-bd5b-f404cee51b5f/scratch';

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const outputPath = join(OUTPUT_DIR, 'map_live_tracking_verification.png');
console.log(`[*] Capturing screenshot to: ${outputPath}`);

const args = [
  '--headless=new',
  '--disable-gpu',
  '--window-size=1440,900',
  '--virtual-time-budget=3500',
  `--screenshot=${outputPath}`,
  'http://localhost:5173/?map=open&skipIntro=true',
];

const child = spawn(CHROME_PATH, args);

child.on('close', code => {
  console.log(`[+] Chrome finished with code: ${code}`);
  process.exit(code);
});

child.on('error', err => {
  console.error(`[-] Chrome spawn error:`, err);
  process.exit(1);
});
