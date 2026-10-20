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

const laptopBuf = fs.readFileSync('assets_incoming/workstation/classic_laptop.glb');
const arr = laptopBuf.buffer.slice(
  laptopBuf.byteOffset,
  laptopBuf.byteOffset + laptopBuf.byteLength
);

const loader = new GLTFLoader();
loader.parse(arr, '', gltf => {
  const root = new THREE.Group();
  root.name = 'PhysicalComputerRig';

  // Add the Poly Haven classic laptop
  const laptopScene = gltf.scene;
  laptopScene.name = 'LaptopUnit';
  laptopScene.position.set(0, 0, 0); // At desk surface
  root.add(laptopScene);

  // Identify screen mesh and attach SCREEN_QUAD anchor
  let screenFound = false;
  laptopScene.traverse(obj => {
    if (
      obj.isMesh &&
      (obj.name.includes('screen') || obj.material?.name === 'classic_laptop_screen')
    ) {
      obj.name = 'SCREEN_QUAD';
      obj.userData = { width: 0.448, height: 0.366 };
      screenFound = true;
    }
  });

  if (!screenFound) {
    // Fallback: add explicit Screen Quad Plane
    const screenGeo = new THREE.PlaneGeometry(0.448, 0.366);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.name = 'SCREEN_QUAD';
    screenMesh.userData = { width: 0.448, height: 0.366 };
    screenMesh.position.set(0, 0.33, -0.207);
    root.add(screenMesh);
  }

  // Large Stitched Desk Mat
  const matGeo = new THREE.BoxGeometry(0.85, 0.003, 0.4);
  const matMaterial = new THREE.MeshStandardMaterial({
    name: 'DeskMat_Neoprene',
    color: 0x0b0f17,
    roughness: 0.9,
    metalness: 0.05,
  });
  const deskMat = new THREE.Mesh(matGeo, matMaterial);
  deskMat.position.set(0.04, 0.0015, 0.08);
  deskMat.receiveShadow = true;
  root.add(deskMat);

  // Mechanical Keyboard (TKL) positioned in front of laptop
  const kbGroup = new THREE.Group();
  kbGroup.name = 'KEYBOARD_ANCHOR';
  kbGroup.position.set(-0.06, 0.003, 0.12);
  root.add(kbGroup);

  const kbBodyGeo = new THREE.BoxGeometry(0.34, 0.016, 0.13);
  const kbBodyMat = new THREE.MeshStandardMaterial({
    name: 'Keyboard_AluminumAnodized',
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.8,
  });
  const kbBody = new THREE.Mesh(kbBodyGeo, kbBodyMat);
  kbBody.position.y = 0.008;
  kbBody.castShadow = true;
  kbGroup.add(kbBody);

  // Keycaps well
  const keycapMat = new THREE.MeshStandardMaterial({
    name: 'Keycaps_PBT',
    color: 0x0f172a,
    roughness: 0.6,
    metalness: 0.2,
  });
  const accentKeyMat = new THREE.MeshStandardMaterial({
    name: 'Keycaps_Accent',
    color: 0x00e5ff,
    roughness: 0.4,
    metalness: 0.3,
  });

  const rowZ = [-0.045, -0.025, -0.005, 0.015, 0.035];
  rowZ.forEach((rz, rowIdx) => {
    const keyCols = rowIdx === 4 ? 7 : 12;
    const kw = (0.31 - (keyCols - 1) * 0.003) / keyCols;
    for (let c = 0; c < keyCols; c++) {
      const kx = -0.155 + kw / 2 + c * (kw + 0.003);
      const isAccent = (rowIdx === 0 && c === 0) || (rowIdx === 4 && c === keyCols - 1);
      const keyMesh = new THREE.Mesh(
        new THREE.BoxGeometry(kw, 0.006, 0.016),
        isAccent ? accentKeyMat : keycapMat
      );
      keyMesh.position.set(kx, 0.019, rz);
      kbGroup.add(keyMesh);
    }
  });

  // Optical Gaming / Hacker Mouse
  const mouseGroup = new THREE.Group();
  mouseGroup.name = 'MOUSE_ANCHOR';
  mouseGroup.position.set(0.26, 0.003, 0.12);
  root.add(mouseGroup);

  const mouseBodyGeo = new THREE.BoxGeometry(0.065, 0.026, 0.11);
  const mouseBody = new THREE.Mesh(mouseBodyGeo, kbBodyMat);
  mouseBody.position.y = 0.013;
  mouseBody.castShadow = true;
  mouseGroup.add(mouseBody);

  // Scroll wheel
  const wheelMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.008, 12),
    accentKeyMat
  );
  wheelMesh.rotation.z = Math.PI / 2;
  wheelMesh.position.set(0, 0.027, -0.022);
  mouseGroup.add(wheelMesh);

  // Export as GLB
  const exporter = new GLTFExporter();
  const outPath = path.resolve('assets_incoming/workstation/computer.glb');

  exporter.parse(
    root,
    glb => {
      fs.writeFileSync(outPath, Buffer.from(glb));
      console.log(`Exported computer.glb (${(glb.byteLength / 1024).toFixed(1)} KB) to ${outPath}`);
    },
    err => {
      console.error('Failed to export computer:', err);
      process.exit(1);
    },
    { binary: true }
  );
});
