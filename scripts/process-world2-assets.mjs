import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import {
  prune,
  weld,
  simplify,
  flatten,
  join,
  resample,
  dedup,
  meshopt,
  textureCompress,
} from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import puppeteer from 'puppeteer-core';

globalThis.self = globalThis;

await MeshoptSimplifier.ready;
await MeshoptDecoder.ready;

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const IN_DIR = path.resolve('assets_incoming/world2');
const SCRATCH_DIR = path.resolve('scratch');
const VEHICLES_DIR = path.resolve('public/assets/vehicles');
const ENV_DIR = path.resolve('public/assets/environment');

fs.mkdirSync(SCRATCH_DIR, { recursive: true });
fs.mkdirSync(VEHICLES_DIR, { recursive: true });
fs.mkdirSync(ENV_DIR, { recursive: true });

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);

function countTriangles(buffer) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.register(() => ({ name: 'Mock', loadTexture: async () => new THREE.Texture() }));
    loader.parse(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      '',
      (gltf) => {
        let tris = 0;
        gltf.scene.traverse((n) => {
          if (n.isMesh && n.geometry) {
            tris += n.geometry.index
              ? n.geometry.index.count / 3
              : n.geometry.attributes.position.count / 3;
          }
        });
        resolve(Math.round(tris));
      }
    );
  });
}

// ============================================================================
// 1. Keke (Autorickshaw -> recolour with believable Lagos transit livery)
// ============================================================================
async function processKeke() {
  console.log('\n--- 1. Processing Keke (autorikshaw_-_indian_tuk_tuk.glb) ---');
  const inPath = path.join(IN_DIR, 'autorikshaw_-_indian_tuk_tuk.glb');
  const outPath = path.join(VEHICLES_DIR, 'keke_realistic.glb');

  const doc = await io.read(inPath);
  const root = doc.getRoot();

  const texPath = path.join(SCRATCH_DIR, 'keke_recoloured_v2.png');
  const texBuf = fs.readFileSync(texPath);

  const mat = root.listMaterials().find((m) => m.getName() === 'Autorickshaw') || root.listMaterials()[0];
  const oldTex = mat.getBaseColorTexture();
  if (oldTex) {
    oldTex.setImage(texBuf).setMimeType('image/png');
  }

  mat.setRoughnessFactor(0.4);
  mat.setMetallicFactor(0.2);

  await doc.transform(flatten(), prune());

  const tmpPath = path.join(SCRATCH_DIR, 'keke_staged.glb');
  await io.write(tmpPath, doc);

  execSync(
    `npx --yes @gltf-transform/cli optimize "${tmpPath}" "${outPath}" --texture-compress webp`,
    { stdio: 'pipe' }
  );

  const tris = await countTriangles(fs.readFileSync(outPath));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged keke_realistic.glb: ${tris} tris, ${sizeKB} KB`);
}

// ============================================================================
// 2. Coconut Palm (textures to 1024, LOD + instancing plan)
// ============================================================================
async function processCoconutPalm() {
  console.log('\n--- 2. Processing Coconut Palm (coconut_palm.glb) ---');
  const inPath = path.join(IN_DIR, 'coconut_palm.glb');
  const lod0Path = path.join(ENV_DIR, 'coconut_palm.glb');
  const lod1Path = path.join(ENV_DIR, 'coconut_palm_lod.glb');

  // LOD 0
  const tmpResized = path.join(SCRATCH_DIR, 'palm_1024.glb');
  execSync(
    `npx --yes @gltf-transform/cli resize "${inPath}" "${tmpResized}" --width 1024 --height 1024`,
    { stdio: 'pipe' }
  );
  execSync(
    `npx --yes @gltf-transform/cli optimize "${tmpResized}" "${lod0Path}" --texture-compress webp`,
    { stdio: 'pipe' }
  );

  const lod0Tris = await countTriangles(fs.readFileSync(lod0Path));
  const lod0SizeKB = (fs.statSync(lod0Path).size / 1024).toFixed(1);
  console.log(`✓ Staged coconut_palm.glb (LOD 0): ${lod0Tris} tris, ${lod0SizeKB} KB`);

  // LOD 1
  const tmpWeld = path.join(SCRATCH_DIR, 'palm_welded.glb');
  const tmpLod1Simpl = path.join(SCRATCH_DIR, 'palm_lod1_simpl.glb');
  execSync(`npx --yes @gltf-transform/cli weld "${inPath}" "${tmpWeld}"`, { stdio: 'pipe' });
  execSync(`npx --yes @gltf-transform/cli simplify "${tmpWeld}" "${tmpLod1Simpl}" --ratio 0.20 --error 0.05`, { stdio: 'pipe' });
  execSync(`npx --yes @gltf-transform/cli resize "${tmpLod1Simpl}" "${path.join(SCRATCH_DIR, 'palm_lod1_512.glb')}" --width 512 --height 512`, { stdio: 'pipe' });
  execSync(`npx --yes @gltf-transform/cli optimize "${path.join(SCRATCH_DIR, 'palm_lod1_512.glb')}" "${lod1Path}" --texture-compress webp`, { stdio: 'pipe' });

  const lod1Tris = await countTriangles(fs.readFileSync(lod1Path));
  const lod1SizeKB = (fs.statSync(lod1Path).size / 1024).toFixed(1);
  console.log(`✓ Staged coconut_palm_lod.glb (LOD 1): ${lod1Tris} tris, ${lod1SizeKB} KB`);
}

// ============================================================================
// 3. Electricity Pole (decimate to ~8k tris, upright, textures to 1024)
// ============================================================================
async function processElectricityPole() {
  console.log('\n--- 3. Processing Electricity Pole (electricity_pole.glb) ---');
  const inPath = path.join(IN_DIR, 'electricity_pole.glb');
  const outPath = path.join(ENV_DIR, 'electricity_pole.glb');

  // Weld and simplify
  const tmpWeld = path.join(SCRATCH_DIR, 'pole_weld.glb');
  const tmpSimpl = path.join(SCRATCH_DIR, 'pole_simpl.glb');
  execSync(`npx --yes @gltf-transform/cli weld "${inPath}" "${tmpWeld}"`, { stdio: 'pipe' });
  execSync(`npx --yes @gltf-transform/cli simplify "${tmpWeld}" "${tmpSimpl}" --ratio 0.19 --error 0.05`, { stdio: 'pipe' });

  // Rotate upright (+90 deg around Z so it stands along +Y) and ground at Y=0
  const doc = await io.read(tmpSimpl);
  const root = doc.getRoot();
  const scene = root.listScenes()[0];
  const wrapper = doc.createNode('ElectricityPole_Root');
  wrapper.setRotation([0, 0, 0.7071068, 0.7071068]);
  wrapper.setTranslation([0, 10.108, 0]); // Ground base at Y = 0
  for (const c of scene.listChildren()) {
    wrapper.addChild(c);
  }
  scene.addChild(wrapper);
  await doc.transform(flatten(), prune());

  const tmpOriented = path.join(SCRATCH_DIR, 'pole_oriented.glb');
  await io.write(tmpOriented, doc);

  const tmpResized = path.join(SCRATCH_DIR, 'pole_1024.glb');
  execSync(`npx --yes @gltf-transform/cli resize "${tmpOriented}" "${tmpResized}" --width 1024 --height 1024`, { stdio: 'pipe' });
  execSync(`npx --yes @gltf-transform/cli optimize "${tmpResized}" "${outPath}" --texture-compress webp`, { stdio: 'pipe' });

  const tris = await countTriangles(fs.readFileSync(outPath));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged electricity_pole.glb: ${tris} tris (target ~8k), ${sizeKB} KB (upright along +Y)`);
}

// ============================================================================
// 4. Ferry Concept (decimate to ~20k tris, realistic scale, PBR livery & name)
// ============================================================================
async function processFerry() {
  console.log('\n--- 4. Processing Ferry Concept (ferry_concept.glb) ---');
  const inPath = path.join(IN_DIR, 'ferry_concept.glb');
  const outPath = path.join(VEHICLES_DIR, 'ferry_concept_realistic.glb');

  const doc = await io.read(inPath);
  const root = doc.getRoot();

  // 1. Remove non-triangle (mode 1) line primitives
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) prim.dispose();
    }
  }
  await doc.transform(prune());

  // 2. Simplify dense meshes in place with SimplifyModifier
  const mod = new SimplifyModifier();
  let totalTris = 0;

  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue;
      const indAcc = prim.getIndices();
      const posAcc = prim.getAttribute('POSITION');
      const indArr = indAcc.getArray();
      const posArr = posAcc.getArray();

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArr), 3));
      geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indArr), 1));

      const merged = BufferGeometryUtils.mergeVertices(geo, 0.25);
      const triCount = merged.index.count / 3;

      if (triCount > 500) {
        const vCount = merged.attributes.position.count;
        const toRemove = Math.floor(vCount * 0.88);
        try {
          const simplified = mod.modify(merged, toRemove);
          const newPos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(simplified.attributes.position.array));
          const newInd = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(simplified.index.array));
          prim.setAttribute('POSITION', newPos);
          prim.setIndices(newInd);
          totalTris += simplified.index.count / 3;
        } catch (err) {
          const newPos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(merged.attributes.position.array));
          const newInd = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(merged.index.array));
          prim.setAttribute('POSITION', newPos);
          prim.setIndices(newInd);
          totalTris += merged.index.count / 3;
        }
      } else {
        const newPos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(merged.attributes.position.array));
        const newInd = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(merged.index.array));
        prim.setAttribute('POSITION', newPos);
        prim.setIndices(newInd);
        totalTris += triCount;
      }
    }
  }

  // 3. Configure authentic PBR materials for LAGFERRY (MV EKO STAR)
  for (const mat of root.listMaterials()) {
    const matName = mat.getName() || '';
    if (matName.includes('Maroon') || matName.includes('Charcoal')) {
      // Deep Maritime Navy Blue Hull
      mat.setBaseColorFactor([0.05, 0.14, 0.28, 1.0]);
      mat.setRoughnessFactor(0.28);
      mat.setMetallicFactor(0.15);
    } else if (matName.includes('White') || matName.includes('LightGoldenrod') || matName.includes('MintCream')) {
      // Crisp Marine White Superstructure
      mat.setBaseColorFactor([0.97, 0.98, 0.99, 1.0]);
      mat.setRoughnessFactor(0.22);
      mat.setMetallicFactor(0.05);
    } else if (matName.includes('Gold') || matName.includes('DarkGoldenrod')) {
      // Lagos Gold Waterline Stripe
      mat.setBaseColorFactor([0.96, 0.62, 0.05, 1.0]);
      mat.setRoughnessFactor(0.35);
      mat.setMetallicFactor(0.20);
    } else if (matName.includes('Wood') || matName.includes('Carpet') || matName.includes('Tile') || matName.includes('Concrete')) {
      // Teak composite deck
      mat.setBaseColorFactor([0.47, 0.28, 0.11, 1.0]);
      mat.setRoughnessFactor(0.70);
      mat.setMetallicFactor(0.0);
    } else if (matName.includes('Glass') || matName.includes('Cyan') || matName.includes('CadetBlue')) {
      // Tinted marine glass
      mat.setBaseColorFactor([0.06, 0.09, 0.16, 0.75]);
      mat.setRoughnessFactor(0.05);
      mat.setMetallicFactor(0.85);
      mat.setAlphaMode('BLEND');
    } else if (matName.includes('Silver') || matName.includes('Aluminum') || matName.includes('Steel')) {
      // Stainless steel rails and fittings
      mat.setBaseColorFactor([0.88, 0.91, 0.94, 1.0]);
      mat.setRoughnessFactor(0.18);
      mat.setMetallicFactor(0.92);
    } else {
      mat.setBaseColorFactor([0.97, 0.98, 0.99, 1.0]);
      mat.setRoughnessFactor(0.25);
      mat.setMetallicFactor(0.1);
    }
  }

  // 4. Scale down by 0.025 (length ~29.5m, width ~7.5m, height ~10.2m)
  const scene = root.listScenes()[0];
  const wrapper = doc.createNode('Ferry_MVEkoStar_Root');
  const SCALE = 0.025;
  wrapper.setScale([SCALE, SCALE, SCALE]);
  wrapper.setTranslation([0, 0.32, 0]); // Keel at Y = 0 (waterline)
  for (const c of scene.listChildren()) {
    wrapper.addChild(c);
  }
  scene.addChild(wrapper);
  await doc.transform(flatten(), prune());

  const tmpExport = path.join(SCRATCH_DIR, 'ferry_processed.glb');
  await io.write(tmpExport, doc);

  execSync(`npx --yes @gltf-transform/cli optimize "${tmpExport}" "${outPath}"`, { stdio: 'pipe' });

  const finalTris = await countTriangles(fs.readFileSync(outPath));
  const finalSizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged ferry_concept_realistic.glb: ${finalTris} tris (target ~20k), ${finalSizeKB} KB (MV EKO STAR)`);
}

// ============================================================================
// 5. Old Wooden Boat (USE, normalize scale to ~5.9m length)
// ============================================================================
async function processOldWoodenBoat() {
  console.log('\n--- 5. Processing Old Wooden Boat (old_wooden_boat.glb) ---');
  const inPath = path.join(IN_DIR, 'old_wooden_boat.glb');
  const outPath = path.join(VEHICLES_DIR, 'boat_wooden_realistic.glb');

  const doc = await io.read(inPath);
  const root = doc.getRoot();
  const scene = root.listScenes()[0];
  const wrapper = doc.createNode('WoodenBoat_Root');
  const SCALE = 7.5;
  wrapper.setScale([SCALE, SCALE, SCALE]);
  for (const c of scene.listChildren()) {
    wrapper.addChild(c);
  }
  scene.addChild(wrapper);
  await doc.transform(flatten(), prune());

  const tmpPath = path.join(SCRATCH_DIR, 'boat_scaled.glb');
  await io.write(tmpPath, doc);

  execSync(
    `npx --yes @gltf-transform/cli optimize "${tmpPath}" "${outPath}" --texture-compress webp`,
    { stdio: 'pipe' }
  );

  const tris = await countTriangles(fs.readFileSync(outPath));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged boat_wooden_realistic.glb: ${tris} tris, ${sizeKB} KB (length 5.9m)`);
}

// ============================================================================
// 6. Vespa (USE, normalize scale to ~1.8m length)
// ============================================================================
async function processVespa() {
  console.log('\n--- 6. Processing Vespa Scooter (vespa.glb) ---');
  const inPath = path.join(IN_DIR, 'vespa.glb');
  const outPath = path.join(VEHICLES_DIR, 'vespa_scooter_realistic.glb');

  const doc = await io.read(inPath);
  const root = doc.getRoot();
  const scene = root.listScenes()[0];
  const wrapper = doc.createNode('VespaScooter_Root');
  const SCALE = 0.000085;
  wrapper.setScale([SCALE, SCALE, SCALE]);
  for (const c of scene.listChildren()) {
    wrapper.addChild(c);
  }
  scene.addChild(wrapper);
  await doc.transform(flatten(), prune());

  const tmpPath = path.join(SCRATCH_DIR, 'vespa_scaled.glb');
  await io.write(tmpPath, doc);

  execSync(
    `npx --yes @gltf-transform/cli optimize "${tmpPath}" "${outPath}" --texture-compress webp`,
    { stdio: 'pipe' }
  );

  const tris = await countTriangles(fs.readFileSync(outPath));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged vespa_scooter_realistic.glb: ${tris} tris, ${sizeKB} KB (length 1.8m)`);
}

// ============================================================================
// 7. Billboard Lowpoly (USE, fictional EkoSec SIEM ad texture in code)
// ============================================================================
async function processBillboardLowpoly() {
  console.log('\n--- 7. Processing Billboard Lowpoly (billboard_-_lowpoly.glb) ---');
  const inPath = path.join(IN_DIR, 'billboard_-_lowpoly.glb');
  const outPath = path.join(ENV_DIR, 'billboard_lowpoly.glb');

  const doc = await io.read(inPath);
  const root = doc.getRoot();

  const adBuf = fs.readFileSync(path.join(SCRATCH_DIR, 'ad_ekosec_billboard.png'));
  const mat = root.listMaterials().find((m) => m.getName() === 'Material.009') || root.listMaterials()[1];
  const tex = mat.getBaseColorTexture();
  if (tex) {
    tex.setImage(adBuf).setMimeType('image/png');
  }

  const tmpPath = path.join(SCRATCH_DIR, 'billboard_lowpoly_staged.glb');
  await io.write(tmpPath, doc);

  execSync(
    `npx --yes @gltf-transform/cli optimize "${tmpPath}" "${outPath}" --texture-compress webp`,
    { stdio: 'pipe' }
  );

  const tris = await countTriangles(fs.readFileSync(outPath));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged billboard_lowpoly.glb: ${tris} tris, ${sizeKB} KB (EkoSec SIEM ad)`);
}

// ============================================================================
// 8. Metal Billboard Advertising Single Sided (USE, fictional Krest Maritime ad)
// ============================================================================
async function processMetalBillboardSingleSided() {
  console.log('\n--- 8. Processing Metal Billboard Single Sided ---');
  const inPath = path.join(IN_DIR, 'metal_billboard_advertising_single_sided_free.glb');
  const outPath = path.join(ENV_DIR, 'billboard_single_sided.glb');

  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024 });

  const baseTexBase64 = fs.readFileSync(path.join(SCRATCH_DIR, 'metal_billboard_advertising_single_sided_free_tex0.png')).toString('base64');
  const adBase64 = fs.readFileSync(path.join(SCRATCH_DIR, 'ad_krest_billboard.png')).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:black;">
    <canvas id="c" width="1024" height="1024"></canvas>
    <script>
      const baseImg = new Image();
      const adImg = new Image();
      let loaded = 0;
      function check() {
        loaded++;
        if (loaded === 2) {
          const c = document.getElementById("c");
          const ctx = c.getContext("2d");
          ctx.drawImage(baseImg, 0, 0);
          ctx.drawImage(adImg, 0, 705, 920, 319);
        }
      }
      baseImg.onload = check;
      adImg.onload = check;
      baseImg.src = "data:image/png;base64,${baseTexBase64}";
      adImg.src = "data:image/png;base64,${adBase64}";
    </script>
    </body>
    </html>
  `);

  await new Promise((r) => setTimeout(r, 600));
  const compBuf = await page.screenshot({ type: 'png' });
  await browser.close();

  const doc = await io.read(inPath);
  const root = doc.getRoot();
  const mat = root.listMaterials().find((m) => m.getName() === 'billboard_large_01') || root.listMaterials()[0];
  const tex = mat.getBaseColorTexture();
  if (tex) {
    tex.setImage(compBuf).setMimeType('image/png');
  }

  const tmpPath = path.join(SCRATCH_DIR, 'billboard_single_sided_staged.glb');
  await io.write(tmpPath, doc);

  execSync(
    `npx --yes @gltf-transform/cli optimize "${tmpPath}" "${outPath}" --texture-compress webp`,
    { stdio: 'pipe' }
  );

  const tris = await countTriangles(fs.readFileSync(outPath));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged billboard_single_sided.glb: ${tris} tris, ${sizeKB} KB (Krest Maritime ad)`);
}

// ============================================================================
// 9. Metal Road Billboard Single Sided (USE, fictional Lagos overhead road signs)
// ============================================================================
async function processMetalRoadBillboard() {
  console.log('\n--- 9. Processing Metal Road Billboard Single Sided ---');
  const inPath = path.join(IN_DIR, 'metal_road_billboard_single_sided.glb');
  const outPath = path.join(ENV_DIR, 'billboard_road_single_sided.glb');

  const p1Buf = fs.readFileSync(path.join(SCRATCH_DIR, 'ad_road_panel1.png'));
  const p2Buf = fs.readFileSync(path.join(SCRATCH_DIR, 'ad_road_panel2.png'));
  const p3Buf = fs.readFileSync(path.join(SCRATCH_DIR, 'ad_road_panel3.png'));

  const doc = await io.read(inPath);
  const root = doc.getRoot();

  const m1 = root.listMaterials().find((m) => m.getName() === 'MI_Bilboard_01');
  const m2 = root.listMaterials().find((m) => m.getName() === 'MI_Bilboard_02');
  const m3 = root.listMaterials().find((m) => m.getName() === 'MI_Bilboard_03');

  if (m1?.getBaseColorTexture()) m1.getBaseColorTexture().setImage(p1Buf).setMimeType('image/png');
  if (m2?.getBaseColorTexture()) m2.getBaseColorTexture().setImage(p2Buf).setMimeType('image/png');
  if (m3?.getBaseColorTexture()) m3.getBaseColorTexture().setImage(p3Buf).setMimeType('image/png');

  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const matName = prim.getMaterial()?.getName() || '';
      if (matName.startsWith('MI_Bilboard')) {
        const uv = prim.getAttribute('TEXCOORD_0');
        if (uv) {
          const arr = uv.getArray();
          for (let i = 0; i < arr.length; i += 2) {
            arr[i] = 1.0 - arr[i]; // Flip U so sign reads left-to-right
          }
          uv.setArray(arr);
        }
      }
    }
  }

  const tmpPath = path.join(SCRATCH_DIR, 'billboard_road_staged.glb');
  await io.write(tmpPath, doc);

  execSync(
    `npx --yes @gltf-transform/cli optimize "${tmpPath}" "${outPath}" --texture-compress webp`,
    { stdio: 'pipe' }
  );

  const tris = await countTriangles(fs.readFileSync(outPath));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✓ Staged billboard_road_single_sided.glb: ${tris} tris, ${sizeKB} KB (Lagos road signs)`);
}

// ============================================================================
// Master Orchestrator
// ============================================================================
async function run() {
  console.log('================================================================');
  console.log('CYBERLIFE — WORLD 2 ASSET PIPELINE & STAGING');
  console.log('================================================================');

  await processKeke();
  await processCoconutPalm();
  await processElectricityPole();
  await processFerry();
  await processOldWoodenBoat();
  await processVespa();
  await processBillboardLowpoly();
  await processMetalBillboardSingleSided();
  await processMetalRoadBillboard();

  console.log('\n================================================================');
  console.log('ALL WORLD 2 ASSETS STAGED & OPTIMIZED SUCCESSFULLY');
  console.log('================================================================\n');
}

run().catch((err) => {
  console.error('Fatal error during asset staging:', err);
  process.exit(1);
});
