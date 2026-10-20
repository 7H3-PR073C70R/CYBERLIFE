import { JSDOM } from 'jsdom';
const dom = new JSDOM();
globalThis.window = dom.window;
globalThis.self = globalThis;
globalThis.document = dom.window.document;
globalThis.Blob = dom.window.Blob;
globalThis.FileReader = dom.window.FileReader;

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

function createErgonomicChair() {
  const root = new THREE.Group();
  root.name = 'ErgonomicOfficeChair';

  // Materials
  const chromeMat = new THREE.MeshStandardMaterial({
    name: 'Chair_PolishedChrome',
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.9,
  });

  const blackPlasticMat = new THREE.MeshStandardMaterial({
    name: 'Chair_StructuralNylon',
    color: 0x0f172a,
    roughness: 0.65,
    metalness: 0.2,
  });

  const meshFabricMat = new THREE.MeshStandardMaterial({
    name: 'Chair_BreathableMesh',
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.1,
  });

  // 1. 5-Star Base Hub
  const hubGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.07, 16);
  const hub = new THREE.Mesh(hubGeo, chromeMat);
  hub.position.y = 0.11;
  root.add(hub);

  // 5 Star Legs with Casters
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    const legSpoke = new THREE.Group();
    legSpoke.rotation.y = angle;

    // Arched spoke
    const spokeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.3), chromeMat);
    spokeMesh.position.set(0, 0.08, 0.15);
    spokeMesh.rotation.x = -0.16;
    legSpoke.add(spokeMesh);

    // Caster mount pin
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8), blackPlasticMat);
    pin.position.set(0, 0.04, 0.3);
    legSpoke.add(pin);

    // Twin-wheel caster assembly
    const wheelL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12),
      blackPlasticMat
    );
    wheelL.rotation.z = Math.PI / 2;
    wheelL.position.set(-0.012, 0.025, 0.3);
    legSpoke.add(wheelL);

    const wheelR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12),
      blackPlasticMat
    );
    wheelR.rotation.z = Math.PI / 2;
    wheelR.position.set(0.012, 0.025, 0.3);
    legSpoke.add(wheelR);

    root.add(legSpoke);
  }

  // 2. Gas Lift Cylinder Column
  const outerPiston = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.035, 0.22, 16),
    blackPlasticMat
  );
  outerPiston.position.y = 0.22;
  root.add(outerPiston);

  const innerPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 16), chromeMat);
  innerPiston.position.y = 0.36;
  root.add(innerPiston);

  // Under-seat tilt control mechanism box
  const mechBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.26), blackPlasticMat);
  mechBox.position.set(0, 0.44, -0.02);
  root.add(mechBox);

  // Tilt tension cylinder knob
  const tensionKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.08, 12),
    blackPlasticMat
  );
  tensionKnob.position.set(0, 0.39, 0.05);
  root.add(tensionKnob);

  // 3. Ergonomic Contoured Seat Cushion (Height = 0.48m)
  const seatPan = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.065, 0.48), meshFabricMat);
  seatPan.position.set(0, 0.48, 0);
  root.add(seatPan);

  // Seat border trim
  const seatTrim = new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.02, 0.49), blackPlasticMat);
  seatTrim.position.set(0, 0.455, 0);
  root.add(seatTrim);

  // 4. Backrest & Lumbar Frame
  const backGroup = new THREE.Group();
  backGroup.position.set(0, 0.52, 0.22);
  root.add(backGroup);

  // Heavy spine support
  const spineMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.52, 0.035), chromeMat);
  spineMesh.position.set(0, 0.26, 0.035);
  backGroup.add(spineMesh);

  // Lumbar support horizontal brace
  const lumbarMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.03), blackPlasticMat);
  lumbarMesh.position.set(0, 0.16, -0.015);
  backGroup.add(lumbarMesh);

  // Contoured breathable mesh backrest
  const backFrame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.52, 0.03), blackPlasticMat);
  backFrame.position.set(0, 0.28, 0);
  backFrame.rotation.x = -0.08;
  backGroup.add(backFrame);

  const backMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.015), meshFabricMat);
  backMesh.position.set(0, 0.28, -0.01);
  backMesh.rotation.x = -0.08;
  backGroup.add(backMesh);

  // Ergonomic Headrest
  const headrestStrut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.025), chromeMat);
  headrestStrut.position.set(0, 0.58, 0.02);
  backGroup.add(headrestStrut);

  const headrestPad = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.13, 0.05), meshFabricMat);
  headrestPad.position.set(0, 0.64, -0.02);
  backGroup.add(headrestPad);

  // 5. 3D Adjustable Armrests
  [-0.26, 0.26].forEach(ax => {
    // Chrome support arm
    const armStrut = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 0.04), chromeMat);
    armStrut.position.set(ax, 0.54, 0.0);
    root.add(armStrut);

    // Contoured soft PU arm pad (Height: 0.66m)
    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.03, 0.24), blackPlasticMat);
    armPad.position.set(ax, 0.66, -0.03);
    root.add(armPad);
  });

  // 6. Named Anchor: SEAT_ANCHOR
  const seatAnchor = new THREE.Object3D();
  seatAnchor.name = 'SEAT_ANCHOR';
  seatAnchor.position.set(0, 0.48, 0);
  seatAnchor.rotation.y = 0; // facing -Z
  root.add(seatAnchor);

  return root;
}

const chair = createErgonomicChair();
const exporter = new GLTFExporter();
const outPath = path.resolve('assets_incoming/workstation/chair.glb');

exporter.parse(
  chair,
  glb => {
    fs.writeFileSync(outPath, Buffer.from(glb));
    console.log(`Exported chair.glb (${(glb.byteLength / 1024).toFixed(1)} KB) to ${outPath}`);
  },
  err => {
    console.error('Failed to export chair:', err);
    process.exit(1);
  },
  { binary: true }
);
