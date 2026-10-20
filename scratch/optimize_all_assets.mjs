import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const INCOMING_DIR = path.resolve('assets_incoming/workstation');
const OUTPUT_DIR = path.resolve('public/assets/props');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const ASSET_MAPPING = [
  { in: 'chair.glb', out: 'chair.glb' },
  { in: 'metal_office_desk.glb', out: 'desk.glb' },
  { in: 'computer.glb', out: 'computer.glb' },
  { in: 'props_desk.glb', out: 'props_desk.glb' },
  { in: 'vintage_day_bed.glb', out: 'room_bed.glb' },
  { in: 'drawer_cabinet.glb', out: 'room_cabinet.glb' },
  { in: 'wooden_bookshelf_worn.glb', out: 'room_bookshelf.glb' },
  { in: 'power_box_01.glb', out: 'room_inverter.glb' },
  { in: 'ceiling_fan.glb', out: 'room_fan.glb' },
  { in: 'exterior_aircon_unit.glb', out: 'room_ac.glb' },
  { in: 'hanging_picture_frame_01.glb', out: 'room_art.glb' },
  { in: 'modular_electric_cables.glb', out: 'room_cables.glb' },
];

console.log('=== Optimizing & Packaging 3D Props to public/assets/props/ ===');
let totalBytes = 0;

for (const item of ASSET_MAPPING) {
  const inPath = path.join(INCOMING_DIR, item.in);
  const outPath = path.join(OUTPUT_DIR, item.out);
  if (!fs.existsSync(inPath)) {
    console.warn(`[Missing] ${inPath} does not exist, skipping.`);
    continue;
  }

  const inSize = (fs.statSync(inPath).size / 1024).toFixed(1);
  console.log(`[Optimizing] ${item.in} (${inSize} KB) -> ${item.out}...`);

  try {
    // Run gltf-transform optimize with webp texture compression and meshopt
    const extraFlags = item.out === 'computer.glb' ? ' --palette false' : '';
    execSync(
      `npx --yes @gltf-transform/cli optimize "${inPath}" "${outPath}" --texture-compress webp${extraFlags}`,
      {
        stdio: 'pipe',
      }
    );
    const outSize = (fs.statSync(outPath).size / 1024).toFixed(1);
    totalBytes += fs.statSync(outPath).size;
    console.log(`  -> Finished ${item.out}: ${outSize} KB`);
  } catch (err) {
    console.error(`  -> Failed to optimize ${item.in}:`, err.message);
    // Fallback: simple copy
    fs.copyFileSync(inPath, outPath);
    totalBytes += fs.statSync(outPath).size;
  }
}

console.log(
  `=== Done! Total Shipped Assets Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB ===`
);
