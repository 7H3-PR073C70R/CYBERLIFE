#!/usr/bin/env node
/**
 * scripts/generate-contact-sheets.mjs
 *
 * Automated multi-angle contact sheet generator for candidate assets in Stage A.
 * Boots the Vite dev server, launches headless Chrome via puppeteer-core,
 * loads each candidate model in the dev-only DevAssetViewer, captures a 4-angle
 * composite contact sheet (Perspective 3/4, Front, Side, Wireframe), and saves
 * compressed WebP images to docs/world/contact-sheets/.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer-core';

const ROOT_DIR = process.cwd();
const CONTACT_SHEETS_DIR = path.join(ROOT_DIR, 'docs/world/contact-sheets');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 5173;
const DEV_URL = `http://127.0.0.1:${PORT}/asset-viewer`;

fs.mkdirSync(CONTACT_SHEETS_DIR, { recursive: true });

// Read asset configuration to know all candidates
const assetConfigPath = path.join(ROOT_DIR, 'docs/world/asset-config.json');
const assetConfig = JSON.parse(fs.readFileSync(assetConfigPath, 'utf8'));
const allAssets = Object.keys(assetConfig.assets).filter(k => k.endsWith('.glb'));

console.log(`Preparing to generate contact sheets for ${allAssets.length} GLB assets...`);

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function isServerRunning() {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  let viteProcess = null;
  const alreadyRunning = await isServerRunning();

  if (!alreadyRunning) {
    console.log(`Starting Vite dev server on port ${PORT}...`);
    viteProcess = spawn('npx', ['vite', '--port', String(PORT)], {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      shell: true,
    });

    // Wait for server to come up
    let up = false;
    for (let i = 0; i < 30; i++) {
      await wait(500);
      if (await isServerRunning()) {
        up = true;
        break;
      }
    }
    if (!up) {
      console.error('Failed to start Vite dev server.');
      if (viteProcess) viteProcess.kill('SIGKILL');
      process.exit(1);
    }
    console.log('Vite dev server is ready.');
  } else {
    console.log(`Vite dev server already running on port ${PORT}.`);
  }

  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu-watchdog',
      '--window-size=1280,960',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Browser error]') || text.includes('THREE.GLTFLoader')) {
      console.log(`[Browser Console]: ${text}`);
    }
  });

  console.log(`Navigating to ${DEV_URL}...`);
  await page.goto(DEV_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(1500);

  // Group candidate assets into priorities:
  // 1. All USE assets (11)
  // 2. All USE AFTER WORK assets (7)
  // 3. HOLD asset (1)
  // 4. Sample PARKED character scans (4 distinct ones)
  // 5. Key REJECT assets (5 notable comparisons)
  const priorityAssets = [
    // USE (11)
    'lagos_danfo_bus.glb',
    'generator_lp.glb',
    'free__atlanta_corperate_office_building.glb',
    'high_rise_office_building.glb',
    'ccity_building_set_1.glb',
    'low_rise_wall_to_wall_office_building.glb',
    'road__avenue__street.glb',
    'office_pc.glb',
    'office_computer.glb',
    'office_monitor__workstation_monitor.glb',
    'sofa.glb',
    // USE AFTER WORK (7)
    '2021_ford_mondeo_hybrid_estate.glb',
    'new_york_buildings.glb',
    'casio_fx100au_plus_2nd_edition_calculator.glb',
    'building_hallway.glb',
    'free_loft_17_interior_floors_view_of_the_city..glb',
    'mersus_office.glb',
    'basement_home_office_badeskchallenge.glb',
    // HOLD (1)
    'yellow_taxicab_-_ps1_car.glb',
    // PARKED Character Scans (Representative)
    'azure_confidence.glb',
    'casual_chic_in_pink.glb',
    'casual_confidence.glb',
    'floral_print_high-waisted_shorts_look.glb',
    'man_in_a_yellow_tank_top_and_navy_cargo_shorts.glb',
    // Key REJECTs (for visual review in audit)
    '2012_ford_mustang_boss_302.glb',
    '2019_ford_mustang_cobra_jet.glb',
    'ford_mondeo_taxi.glb',
    'cyberpunk_city.glb',
    'city.glb',
    'low-poly_city_buildings.glb',
  ];

  console.log(`Generating contact sheets for ${priorityAssets.length} candidate & review assets...`);

  let count = 0;
  for (const assetKey of priorityAssets) {
    count++;
    console.log(`[${count}/${priorityAssets.length}] Processing ${assetKey}...`);

    try {
      // Trigger asset selection in DevAssetViewer
      await page.evaluate((key) => {
        window.__CONTACT_SHEET_DONE__ = false;
        const viewer = window.__DEV_VIEWER__;
        if (viewer && viewer.selectAsset) {
          viewer.selectAsset(key);
        }
      }, assetKey);

      // Wait for 3D model to load
      await wait(1200);

      // Trigger contact sheet generation
      await page.evaluate(async () => {
        const viewer = window.__DEV_VIEWER__;
        if (viewer && viewer.captureContactSheet) {
          await viewer.captureContactSheet();
        }
      });

      // Wait for save completion
      let saved = false;
      for (let s = 0; s < 25; s++) {
        await wait(200);
        saved = await page.evaluate(() => !!window.__CONTACT_SHEET_DONE__);
        if (saved) break;
      }

      const outName = `${assetKey.replace('.glb', '')}.webp`;
      const outPath = path.join(CONTACT_SHEETS_DIR, outName);
      if (fs.existsSync(outPath)) {
        const stat = fs.statSync(outPath);
        console.log(`  ✓ Generated ${outName} (${(stat.size / 1024).toFixed(1)} KB)`);
      } else {
        console.warn(`  ⚠️ File not found at expected path: ${outPath}`);
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${assetKey}:`, err.message);
    }
  }

  console.log('\nClosing browser and cleaning up...');
  await browser.close();

  if (viteProcess) {
    viteProcess.kill('SIGKILL');
  }

  const generatedFiles = fs.readdirSync(CONTACT_SHEETS_DIR).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
  console.log(`\nContact sheet generation complete! ${generatedFiles.length} images saved in docs/world/contact-sheets/`);
}

main().catch(err => {
  console.error('Contact sheet generation script failed:', err);
  process.exit(1);
});
