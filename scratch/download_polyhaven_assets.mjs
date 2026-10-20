import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.resolve('assets_incoming/workstation');
fs.mkdirSync(TARGET_DIR, { recursive: true });

const POLYHAVEN_MODELS = [
  'metal_office_desk',
  'classic_laptop',
  'desk_lamp_arm_01',
  'stationery_supplies',
  'office_notepads',
  'circuit_board',
  'power_box_01',
  'ceiling_fan',
  'exterior_aircon_unit',
  'hanging_picture_frame_01',
  'drawer_cabinet',
  'vintage_day_bed',
  'wooden_bookshelf_worn',
  'modular_electric_cables',
  'calculator',
  'coffee',
  'gym',
  'bed',
  'tv',
  'sofa',
  'laptop',
  'telephone',
  'books',
  'posters',
];

const POLYHAVEN_TEXTURES = ['floor_tiles_06', 'painted_plaster_wall', 'white_plaster_02'];

async function downloadPolyHavenModel(id) {
  const glbTarget = path.join(TARGET_DIR, `${id}.glb`);
  if (fs.existsSync(glbTarget)) {
    console.log(`[PolyHaven Model] ${id}.glb already exists, skipping.`);
    return;
  }

  console.log(`[PolyHaven Model] Fetching metadata for ${id}...`);
  const meta = await fetch(`https://api.polyhaven.com/files/${id}`).then(r => r.json());
  const gltfInfo = meta.gltf?.['1k']?.gltf || meta.gltf?.['2k']?.gltf;
  if (!gltfInfo) {
    console.warn(`[PolyHaven Model] No gltf found for ${id}`);
    return;
  }

  const tempDir = path.join(TARGET_DIR, `temp_${id}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const gltfName = path.basename(gltfInfo.url);
  const gltfPath = path.join(tempDir, gltfName);
  const gltfBuf = await fetch(gltfInfo.url).then(r => r.arrayBuffer());
  fs.writeFileSync(gltfPath, Buffer.from(gltfBuf));

  for (const [relPath, fileObj] of Object.entries(gltfInfo.include || {})) {
    const fullPath = path.join(tempDir, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const buf = await fetch(fileObj.url).then(r => r.arrayBuffer());
    fs.writeFileSync(fullPath, Buffer.from(buf));
  }

  console.log(`[PolyHaven Model] Packaging ${id} into self-contained GLB...`);
  try {
    execSync(`npx --yes @gltf-transform/cli copy "${gltfPath}" "${glbTarget}"`, { stdio: 'pipe' });
    console.log(
      `[PolyHaven Model] Successfully created ${id}.glb (${(fs.statSync(glbTarget).size / (1024 * 1024)).toFixed(2)} MB)`
    );
  } catch (err) {
    console.error(`[PolyHaven Model] Failed to package ${id}:`, err.message);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function downloadPolyHavenTexture(id) {
  const texDir = path.join(TARGET_DIR, 'textures', id);
  if (fs.existsSync(texDir) && fs.readdirSync(texDir).length >= 3) {
    console.log(`[PolyHaven Texture] ${id} already exists, skipping.`);
    return;
  }
  fs.mkdirSync(texDir, { recursive: true });

  console.log(`[PolyHaven Texture] Fetching metadata for ${id}...`);
  const meta = await fetch(`https://api.polyhaven.com/files/${id}`).then(r => r.json());

  // Download diffuse, normal, and ARM/rough/metal
  const downloads = [];
  if (meta.Diffuse?.['1k']?.jpg)
    downloads.push({ slot: 'diffuse', url: meta.Diffuse['1k'].jpg.url });
  if (meta.nor_gl?.['1k']?.jpg) downloads.push({ slot: 'normal', url: meta.nor_gl['1k'].jpg.url });
  if (meta.arm?.['1k']?.jpg) downloads.push({ slot: 'arm', url: meta.arm['1k'].jpg.url });
  else {
    if (meta.Rough?.['1k']?.jpg)
      downloads.push({ slot: 'roughness', url: meta.Rough['1k'].jpg.url });
    if (meta.Metal?.['1k']?.jpg)
      downloads.push({ slot: 'metallic', url: meta.Metal['1k'].jpg.url });
    if (meta.AO?.['1k']?.jpg) downloads.push({ slot: 'ao', url: meta.AO['1k'].jpg.url });
  }

  for (const item of downloads) {
    const filename = `${id}_${item.slot}_1k.jpg`;
    const outPath = path.join(texDir, filename);
    console.log(`[PolyHaven Texture] Downloading ${filename}...`);
    const buf = await fetch(item.url).then(r => r.arrayBuffer());
    fs.writeFileSync(outPath, Buffer.from(buf));
  }
  console.log(`[PolyHaven Texture] Successfully saved ${id} textures to ${texDir}`);
}

async function main() {
  console.log('=== Cyberlife Automated CC0 Asset Downloader ===');
  console.log('Output directory:', TARGET_DIR);

  for (const modelId of POLYHAVEN_MODELS) {
    await downloadPolyHavenModel(modelId);
  }

  for (const texId of POLYHAVEN_TEXTURES) {
    await downloadPolyHavenTexture(texId);
  }

  console.log('=== All Automated Downloads Finished ===');
}

main().catch(err => {
  console.error('Fatal error in downloader:', err);
  process.exit(1);
});
