import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCRATCH_DIR = path.resolve('scratch');
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

async function generateTextures() {
  console.log('=== Generating Fictional Billboard & Signage Textures ===');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });

  try {
    // 1. EkoSec High-Tech Billboard (1024x512)
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1024, height: 512 });
    await page1.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 1024px;
            height: 512px;
            background: linear-gradient(135deg, #030712 0%, #0c1838 50%, #022c22 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #f8fafc;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            padding: 48px 64px;
            position: relative;
            overflow: hidden;
            border: 8px solid #06b6d4;
          }
          .grid {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px);
            background-size: 32px 32px;
            pointer-events: none;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 2;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .logo-box {
            width: 56px;
            height: 56px;
            background: #06b6d4;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 900;
            color: #030712;
            box-shadow: 0 0 24px rgba(6, 182, 212, 0.6);
          }
          .brand-title {
            font-size: 40px;
            font-weight: 900;
            letter-spacing: 2px;
            background: linear-gradient(to right, #38bdf8, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .badge {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #34d399;
            padding: 8px 18px;
            border-radius: 9999px;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .content {
            z-index: 2;
            margin: 24px 0;
          }
          .headline {
            font-size: 52px;
            font-weight: 900;
            line-height: 1.1;
            margin: 0 0 16px 0;
            text-shadow: 0 4px 16px rgba(0,0,0,0.8);
          }
          .subheadline {
            font-size: 24px;
            font-weight: 500;
            color: #94a3b8;
            margin: 0;
          }
          .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid rgba(148, 163, 184, 0.2);
            padding-top: 24px;
            font-size: 18px;
            color: #cbd5e1;
            z-index: 2;
          }
          .loc {
            font-weight: 600;
            color: #38bdf8;
          }
          .tagline {
            font-weight: 700;
            color: #facc15;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <div class="grid"></div>
        <div class="header">
          <div class="brand">
            <div class="logo-box">E</div>
            <div class="brand-title">EKOSEC SIEM</div>
          </div>
          <div class="badge">Enterprise Threat Defense</div>
        </div>
        <div class="content">
          <h1 class="headline">Zero-Day Defense for Nigeria's Financial Hub.</h1>
          <p class="subheadline">Autonomous SIEM • SOC Threat Hunting • End-to-End Resilience</p>
        </div>
        <div class="footer">
          <div class="loc">📍 Marina Corporate Tower, Level 14, Lagos</div>
          <div class="tagline">TRUSTED BY 40+ AFRICAN FINANCIAL INSTITUTIONS</div>
        </div>
      </body>
      </html>
    `);
    const adEkosecBuf = await page1.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(SCRATCH_DIR, 'ad_ekosec_billboard.png'), adEkosecBuf);
    await page1.close();
    console.log('✓ Generated scratch/ad_ekosec_billboard.png (1024x512)');

    // 2. Krest Global Logistics Billboard Poster (920x319)
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 920, height: 319 });
    await page2.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 920px;
            height: 319px;
            background: linear-gradient(135deg, #082f49 0%, #0369a1 60%, #0284c7 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            padding: 32px 48px;
            border: 6px solid #f59e0b;
            position: relative;
          }
          .top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .brand {
            font-size: 38px;
            font-weight: 900;
            letter-spacing: 2px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand span {
            color: #facc15;
          }
          .cert {
            background: #facc15;
            color: #0c4a6e;
            font-weight: 800;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 14px;
            letter-spacing: 1px;
          }
          .mid h2 {
            font-size: 34px;
            font-weight: 800;
            margin: 0 0 8px 0;
            line-height: 1.2;
            text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          }
          .mid p {
            font-size: 18px;
            font-weight: 500;
            color: #e0f2fe;
            margin: 0;
          }
          .bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.25);
            padding-top: 14px;
            font-size: 16px;
            font-weight: 600;
            color: #bae6fd;
          }
        </style>
      </head>
      <body>
        <div class="top">
          <div class="brand">KREST <span>MARITIME</span></div>
          <div class="cert">ISO 27001 LOGISTICS TELEMETRY</div>
        </div>
        <div class="mid">
          <h2>Securing West Africa's Maritime Supply Corridors.</h2>
          <p>Automated Cold-Chain Telemetry • Port of Lagos • Apapa • Lekki Deep Sea</p>
        </div>
        <div class="bottom">
          <div>⚓ Direct Terminal Connection: Apapa Wharf & Marina Jetty</div>
          <div style="color: #facc15;">24/7 SATELLITE FLEET TRACKING</div>
        </div>
      </body>
      </html>
    `);
    const adKrestBuf = await page2.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(SCRATCH_DIR, 'ad_krest_billboard.png'), adKrestBuf);
    await page2.close();
    console.log('✓ Generated scratch/ad_krest_billboard.png (920x319)');

    // 3. Road Overhead Gantry Signs (3 panels, 512x512 each)
    const roadPanels = [
      {
        file: 'ad_road_panel1.png',
        route: 'A1 MARINA',
        exit: 'EXIT 01A',
        dest1: 'BROAD STREET',
        dest2: 'TINUBU SQUARE',
        dist: 'NEXT RIGHT 300m',
        arrow: '↑'
      },
      {
        file: 'ad_road_panel2.png',
        route: 'LAGFERRY',
        exit: 'EXIT 01B',
        dest1: 'CMS WATER TERMINAL',
        dest2: 'MARINA WATERFRONT',
        dist: 'STRAIGHT AHEAD',
        arrow: '↑'
      },
      {
        file: 'ad_road_panel3.png',
        route: 'FINANCIAL CORRIDOR',
        exit: 'EXIT 02',
        dest1: 'EKO SEC & TECH HUB',
        dest2: 'CENTRAL BANK HQ',
        dist: 'KEEP LEFT 500m',
        arrow: '↑'
      }
    ];

    for (const panel of roadPanels) {
      const page = await browser.newPage();
      await page.setViewport({ width: 512, height: 512 });
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              width: 512px;
              height: 512px;
              background: #14532d;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #ffffff;
              box-sizing: border-box;
              border: 14px solid #ffffff;
              border-radius: 28px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 32px 28px;
              position: relative;
            }
            .top-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid rgba(255,255,255,0.4);
              padding-bottom: 16px;
            }
            .route-box {
              background: #facc15;
              color: #000000;
              font-weight: 900;
              font-size: 22px;
              padding: 6px 14px;
              border-radius: 8px;
            }
            .exit-box {
              background: #ffffff;
              color: #14532d;
              font-weight: 900;
              font-size: 22px;
              padding: 6px 14px;
              border-radius: 8px;
            }
            .dest-group {
              margin: 24px 0;
              text-align: center;
            }
            .dest-main {
              font-size: 38px;
              font-weight: 900;
              letter-spacing: 1px;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            .dest-sub {
              font-size: 26px;
              font-weight: 700;
              color: #bbf7d0;
              text-transform: uppercase;
            }
            .bottom-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: rgba(0,0,0,0.25);
              padding: 12px 20px;
              border-radius: 12px;
            }
            .arrow {
              font-size: 48px;
              font-weight: 900;
            }
            .dist {
              font-size: 22px;
              font-weight: 800;
              color: #facc15;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="top-bar">
            <div class="route-box">${panel.route}</div>
            <div class="exit-box">${panel.exit}</div>
          </div>
          <div class="dest-group">
            <div class="dest-main">${panel.dest1}</div>
            <div class="dest-sub">${panel.dest2}</div>
          </div>
          <div class="bottom-bar">
            <div class="arrow">${panel.arrow}</div>
            <div class="dist">${panel.dist}</div>
            <div class="arrow">${panel.arrow}</div>
          </div>
        </body>
        </html>
      `);
      const panelBuf = await page.screenshot({ type: 'png' });
      fs.writeFileSync(path.join(SCRATCH_DIR, panel.file), panelBuf);
      await page.close();
      console.log(`✓ Generated scratch/${panel.file} (512x512)`);
    }

  } finally {
    await browser.close();
  }
}

generateTextures().catch(console.error);
