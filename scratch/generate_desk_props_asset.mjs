import { JSDOM } from 'jsdom';
const dom = new JSDOM();
globalThis.window = dom.window;
globalThis.self = globalThis;
globalThis.document = dom.window.document;
globalThis.Blob = dom.window.Blob;
globalThis.FileReader = dom.window.FileReader;

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

function loadGlbScene(file) {
  const buf = fs.readFileSync(file);
  const arr = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise(resolve => {
    const loader = new GLTFLoader();
    loader.parse(arr, '', gltf => resolve(gltf.scene));
  });
}

async function assembleDeskProps() {
  const root = new THREE.Group();
  root.name = 'DeskPropsCollection';

  // 1. Lamp
  console.log('Loading desk lamp...');
  const lamp = await loadGlbScene('assets_incoming/workstation/desk_lamp_arm_01.glb');
  lamp.position.set(-0.65, 0, -0.22);
  lamp.rotation.y = 0.45;
  lamp.scale.setScalar(0.85);
  root.add(lamp);

  // 2. Stationery
  console.log('Loading stationery...');
  const stationery = await loadGlbScene('assets_incoming/workstation/stationery_supplies.glb');
  stationery.position.set(-0.46, 0, 0.05);
  stationery.rotation.y = -0.2;
  stationery.scale.setScalar(0.9);
  root.add(stationery);

  // 3. Notepads
  console.log('Loading notepads...');
  const notepads = await loadGlbScene('assets_incoming/workstation/office_notepads.glb');
  notepads.position.set(0.55, 0, 0.08);
  notepads.rotation.y = 0.15;
  notepads.scale.setScalar(0.95);
  root.add(notepads);

  // 4. Circuit board
  console.log('Loading circuit board...');
  const circuit = await loadGlbScene('assets_incoming/workstation/circuit_board.glb');
  circuit.position.set(0.55, 0, -0.22);
  circuit.rotation.y = -0.1;
  circuit.scale.setScalar(0.75);
  root.add(circuit);

  // 5. Ceramic Coffee Mug
  const mugGroup = new THREE.Group();
  mugGroup.position.set(0.42, 0, 0.2);
  const mugBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.038, 0.09, 16),
    new THREE.MeshStandardMaterial({
      name: 'Ceramic_Mug',
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.1,
    })
  );
  mugBody.position.y = 0.045;
  mugGroup.add(mugBody);

  const mugLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, 0.01, 16),
    new THREE.MeshStandardMaterial({ name: 'Coffee_Liquid', color: 0x3d2314, roughness: 0.1 })
  );
  mugLiquid.position.y = 0.08;
  mugGroup.add(mugLiquid);
  root.add(mugGroup);

  // 6. Smartphone
  const phoneGroup = new THREE.Group();
  phoneGroup.position.set(0.42, 0, -0.05);
  phoneGroup.rotation.y = 0.12;
  const phoneMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.008, 0.15),
    new THREE.MeshStandardMaterial({
      name: 'Phone_Body',
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8,
    })
  );
  phoneMesh.position.y = 0.004;
  phoneGroup.add(phoneMesh);
  root.add(phoneGroup);

  // Export as GLB
  const exporter = new GLTFExporter();
  const outPath = path.resolve('assets_incoming/workstation/props_desk.glb');

  exporter.parse(
    root,
    glb => {
      fs.writeFileSync(outPath, Buffer.from(glb));
      console.log(
        `Exported props_desk.glb (${(glb.byteLength / 1024).toFixed(1)} KB) to ${outPath}`
      );
    },
    err => {
      console.error('Failed to export props_desk:', err);
      process.exit(1);
    },
    { binary: true }
  );
}

assembleDeskProps().catch(err => {
  console.error('Error assembling desk props:', err);
  process.exit(1);
});
