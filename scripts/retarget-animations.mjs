#!/usr/bin/env node
/**
 * scripts/retarget-animations.mjs
 * 
 * Maps existing Mixamo animation clips from public/assets/characters/animations.glb
 * onto the Quaternius 65-joint Universal Base Character skeleton.
 * 
 * Target output: public/assets/characters/animations_q.glb
 */

import fs from 'fs';
import path from 'path';
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as THREE from 'three';

/**
 * 1. Documented Bone Map: Mixamo -> Quaternius 65-joint Skeleton
 */
export const BONE_MAP = [
  // Pelvis / Hips (Root of humanoid motion)
  { src: 'mixamorig:Hips', tgt: 'pelvis', hasPos: true },

  // Spine & Head
  { src: 'mixamorig:Spine', tgt: 'spine_01', hasPos: false },
  { src: 'mixamorig:Spine1', tgt: 'spine_02', hasPos: false },
  { src: 'mixamorig:Spine2', tgt: 'spine_03', hasPos: false },
  { src: 'mixamorig:Neck', tgt: 'neck_01', hasPos: false },
  { src: 'mixamorig:Head', tgt: 'Head', hasPos: false },

  // Left Arm Chain
  { src: 'mixamorig:LeftShoulder', tgt: 'clavicle_l', hasPos: false },
  { src: 'mixamorig:LeftArm', tgt: 'upperarm_l', hasPos: false },
  { src: 'mixamorig:LeftForeArm', tgt: 'lowerarm_l', hasPos: false },
  { src: 'mixamorig:LeftHand', tgt: 'hand_l', hasPos: false },

  // Left Fingers
  { src: 'mixamorig:LeftHandThumb1', tgt: 'thumb_01_l', hasPos: false },
  { src: 'mixamorig:LeftHandThumb2', tgt: 'thumb_02_l', hasPos: false },
  { src: 'mixamorig:LeftHandThumb3', tgt: 'thumb_03_l', hasPos: false },
  { src: 'mixamorig:LeftHandIndex1', tgt: 'index_01_l', hasPos: false },
  { src: 'mixamorig:LeftHandIndex2', tgt: 'index_02_l', hasPos: false },
  { src: 'mixamorig:LeftHandIndex3', tgt: 'index_03_l', hasPos: false },
  { src: 'mixamorig:LeftHandMiddle1', tgt: 'middle_01_l', hasPos: false },
  { src: 'mixamorig:LeftHandMiddle2', tgt: 'middle_02_l', hasPos: false },
  { src: 'mixamorig:LeftHandMiddle3', tgt: 'middle_03_l', hasPos: false },
  { src: 'mixamorig:LeftHandRing1', tgt: 'ring_01_l', hasPos: false },
  { src: 'mixamorig:LeftHandRing2', tgt: 'ring_02_l', hasPos: false },
  { src: 'mixamorig:LeftHandRing3', tgt: 'ring_03_l', hasPos: false },
  { src: 'mixamorig:LeftHandPinky1', tgt: 'pinky_01_l', hasPos: false },
  { src: 'mixamorig:LeftHandPinky2', tgt: 'pinky_02_l', hasPos: false },
  { src: 'mixamorig:LeftHandPinky3', tgt: 'pinky_03_l', hasPos: false },

  // Right Arm Chain
  { src: 'mixamorig:RightShoulder', tgt: 'clavicle_r', hasPos: false },
  { src: 'mixamorig:RightArm', tgt: 'upperarm_r', hasPos: false },
  { src: 'mixamorig:RightForeArm', tgt: 'lowerarm_r', hasPos: false },
  { src: 'mixamorig:RightHand', tgt: 'hand_r', hasPos: false },

  // Right Fingers
  { src: 'mixamorig:RightHandThumb1', tgt: 'thumb_01_r', hasPos: false },
  { src: 'mixamorig:RightHandThumb2', tgt: 'thumb_02_r', hasPos: false },
  { src: 'mixamorig:RightHandThumb3', tgt: 'thumb_03_r', hasPos: false },
  { src: 'mixamorig:RightHandIndex1', tgt: 'index_01_r', hasPos: false },
  { src: 'mixamorig:RightHandIndex2', tgt: 'index_02_r', hasPos: false },
  { src: 'mixamorig:RightHandIndex3', tgt: 'index_03_r', hasPos: false },
  { src: 'mixamorig:RightHandMiddle1', tgt: 'middle_01_r', hasPos: false },
  { src: 'mixamorig:RightHandMiddle2', tgt: 'middle_02_r', hasPos: false },
  { src: 'mixamorig:RightHandMiddle3', tgt: 'middle_03_r', hasPos: false },
  { src: 'mixamorig:RightHandRing1', tgt: 'ring_01_r', hasPos: false },
  { src: 'mixamorig:RightHandRing2', tgt: 'ring_02_r', hasPos: false },
  { src: 'mixamorig:RightHandRing3', tgt: 'ring_03_r', hasPos: false },
  { src: 'mixamorig:RightHandPinky1', tgt: 'pinky_01_r', hasPos: false },
  { src: 'mixamorig:RightHandPinky2', tgt: 'pinky_02_r', hasPos: false },
  { src: 'mixamorig:RightHandPinky3', tgt: 'pinky_03_r', hasPos: false },

  // Left Leg Chain
  { src: 'mixamorig:LeftUpLeg', tgt: 'thigh_l', hasPos: false },
  { src: 'mixamorig:LeftLeg', tgt: 'calf_l', hasPos: false },
  { src: 'mixamorig:LeftFoot', tgt: 'foot_l', hasPos: false },
  { src: 'mixamorig:LeftToeBase', tgt: 'ball_l', hasPos: false },

  // Right Leg Chain
  { src: 'mixamorig:RightUpLeg', tgt: 'thigh_r', hasPos: false },
  { src: 'mixamorig:RightLeg', tgt: 'calf_r', hasPos: false },
  { src: 'mixamorig:RightFoot', tgt: 'foot_r', hasPos: false },
  { src: 'mixamorig:RightToeBase', tgt: 'ball_r', hasPos: false },
];

/**
 * Robust channel sampler with slerp for quaternions and lerp for vectors
 */
function sampleChannel(times, values, elemSize, isQuat, t) {
  const n = times.length;
  if (n === 0) return isQuat ? [0, 0, 0, 1] : [0, 0, 0];
  if (t <= times[0]) {
    return isQuat
      ? [values[0], values[1], values[2], values[3]]
      : [values[0], values[1], values[2]];
  }
  if (t >= times[n - 1]) {
    const lastIdx = (n - 1) * elemSize;
    return isQuat
      ? [values[lastIdx], values[lastIdx + 1], values[lastIdx + 2], values[lastIdx + 3]]
      : [values[lastIdx], values[lastIdx + 1], values[lastIdx + 2]];
  }
  // Binary search for interval [i, i+1]
  let low = 0, high = n - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (times[mid] <= t) low = mid + 1;
    else high = mid - 1;
  }
  const i0 = Math.max(0, high);
  const i1 = Math.min(n - 1, i0 + 1);
  const t0 = times[i0], t1 = times[i1];
  const alpha = (t1 === t0) ? 0 : (t - t0) / (t1 - t0);

  if (isQuat) {
    const q0 = new THREE.Quaternion(values[i0 * 4], values[i0 * 4 + 1], values[i0 * 4 + 2], values[i0 * 4 + 3]);
    const q1 = new THREE.Quaternion(values[i1 * 4], values[i1 * 4 + 1], values[i1 * 4 + 2], values[i1 * 4 + 3]);
    q0.slerp(q1, alpha);
    return [q0.x, q0.y, q0.z, q0.w];
  } else {
    return [
      values[i0 * elemSize] * (1 - alpha) + values[i1 * elemSize] * alpha,
      values[i0 * elemSize + 1] * (1 - alpha) + values[i1 * elemSize + 1] * alpha,
      values[i0 * elemSize + 2] * (1 - alpha) + values[i1 * elemSize + 2] * alpha,
    ];
  }
}

async function main() {
  console.log('=== STARTING ANIMATION RETARGETING ===');
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

  // 1. Read source animations and source Mixamo rest skeleton
  console.log('Reading public/assets/characters/animations.glb...');
  const animDoc = await io.read('public/assets/characters/animations.glb');
  
  console.log('Reading public/assets/characters/player_male.glb...');
  const mixDoc = await io.read('public/assets/characters/player_male.glb');

  // Build Three.js representation of Mixamo Rest Skeleton
  const mixNodes = new Map();
  for (const n of mixDoc.getRoot().listNodes()) {
    const o = new THREE.Object3D();
    o.name = n.getName();
    o.position.fromArray(n.getTranslation());
    o.quaternion.fromArray(n.getRotation());
    o.scale.fromArray(n.getScale());
    mixNodes.set(n.getName(), o);
  }
  for (const n of mixDoc.getRoot().listNodes()) {
    const o = mixNodes.get(n.getName());
    for (const c of n.listChildren()) {
      const childObj = mixNodes.get(c.getName());
      if (childObj) o.add(childObj);
    }
  }
  const mixScene = new THREE.Scene();
  for (const c of mixDoc.getRoot().listScenes()[0].listChildren()) {
    const rootChild = mixNodes.get(c.getName());
    if (rootChild) mixScene.add(rootChild);
  }
  mixScene.updateMatrixWorld(true);

  // Store rest world quaternions for Mixamo
  const srcRestWorldQ = new Map();
  for (const item of BONE_MAP) {
    const o = mixNodes.get(item.src);
    if (!o) {
      console.warn(`Source bone ${item.src} not found in player_male.glb`);
      continue;
    }
    const q = new THREE.Quaternion();
    o.getWorldQuaternion(q);
    srcRestWorldQ.set(item.src, q);
  }
  const srcHipsRestPos = new THREE.Vector3();
  mixNodes.get('mixamorig:Hips').getWorldPosition(srcHipsRestPos);

  // 2. Read Quaternius target gltf
  console.log('Reading Quaternius base skeleton from Superhero_Male_FullBody.gltf...');
  const qData = JSON.parse(fs.readFileSync('assets_incoming/world2/Universal Base Characters[Standard]/Base Characters/Godot - UE/Superhero_Male_FullBody.gltf', 'utf8'));
  
  // Build Three.js representation of Quaternius Rest Skeleton
  const qNodes = new Map();
  qData.nodes.forEach(n => {
    const o = new THREE.Object3D();
    o.name = n.name;
    if (n.translation) o.position.fromArray(n.translation);
    if (n.rotation) o.quaternion.fromArray(n.rotation);
    if (n.scale) o.scale.fromArray(n.scale);
    qNodes.set(n.name, o);
  });
  qData.nodes.forEach(n => {
    if (n.children) {
      const o = qNodes.get(n.name);
      for (const c of n.children) {
        o.add(qNodes.get(qData.nodes[c].name));
      }
    }
  });
  const qScene = new THREE.Scene();
  for (const rootIdx of qData.scenes[0].nodes) {
    qScene.add(qNodes.get(qData.nodes[rootIdx].name));
  }
  qScene.updateMatrixWorld(true);

  // Store rest world quaternions for Quaternius
  const tgtRestWorldQ = new Map();
  for (const item of BONE_MAP) {
    const o = qNodes.get(item.tgt);
    if (!o) {
      console.warn(`Target bone ${item.tgt} not found in Quaternius skeleton`);
      continue;
    }
    const q = new THREE.Quaternion();
    o.getWorldQuaternion(q);
    tgtRestWorldQ.set(item.tgt, q);
  }
  const tgtPelvisRestPos = new THREE.Vector3();
  qNodes.get('pelvis').getWorldPosition(tgtPelvisRestPos);

  console.log('Rest Hips height (Mixamo):', srcHipsRestPos.y.toFixed(3), 'm');
  console.log('Rest Pelvis height (Quaternius):', tgtPelvisRestPos.y.toFixed(3), 'm');
  const heightScale = tgtPelvisRestPos.y / srcHipsRestPos.y;
  console.log('Height scale factor:', heightScale.toFixed(4));

  // 3. Prepare target glTF Document for animations_q.glb
  const outDoc = new Document();
  const outRoot = outDoc.getRoot();
  const outScene = outDoc.createScene('Scene');
  outRoot.setDefaultScene(outScene);
  const outBuffer = outDoc.createBuffer('buffer');

  // Clone Quaternius 65 joints into output document
  const outNodeMap = new Map();
  for (const n of qData.nodes) {
    const outNode = outDoc.createNode(n.name);
    if (n.translation) outNode.setTranslation(n.translation);
    if (n.rotation) outNode.setRotation(n.rotation);
    if (n.scale) outNode.setScale(n.scale);
    outNodeMap.set(n.name, outNode);
  }
  qData.nodes.forEach(n => {
    if (n.children) {
      const parentOutNode = outNodeMap.get(n.name);
      for (const c of n.children) {
        parentOutNode.addChild(outNodeMap.get(qData.nodes[c].name));
      }
    }
  });
  for (const rootIdx of qData.scenes[0].nodes) {
    outScene.addChild(outNodeMap.get(qData.nodes[rootIdx].name));
  }

  // 4. Retarget each animation clip
  const sourceAnims = animDoc.getRoot().listAnimations();
  console.log(`Processing ${sourceAnims.length} animation clips:`, sourceAnims.map(a => a.getName()));

  for (const srcAnim of sourceAnims) {
    const clipName = srcAnim.getName();
    console.log(`\n--- Retargeting clip: ${clipName} ---`);

    // Parse channel data from source animation
    const channelData = new Map();
    let maxDuration = 0;

    for (const ch of srcAnim.listChannels()) {
      const nodeName = ch.getTargetNode()?.getName();
      const path = ch.getTargetPath();
      const sampler = ch.getSampler();
      const inputAcc = sampler.getInput();
      const outputAcc = sampler.getOutput();

      const times = inputAcc.getArray();
      if (times.length > 0 && times[times.length - 1] > maxDuration) {
        maxDuration = times[times.length - 1];
      }

      const rawValues = outputAcc.getArray();
      const isNormalized = outputAcc.getNormalized();
      const elemSize = outputAcc.getElementSize();

      let floatValues;
      if (isNormalized) {
        floatValues = new Float32Array(rawValues.length);
        for (let i = 0; i < rawValues.length; i++) {
          floatValues[i] = Math.max(rawValues[i] / 32767.0, -1.0);
        }
      } else {
        floatValues = Float32Array.from(rawValues);
      }

      if (!channelData.has(nodeName)) {
        channelData.set(nodeName, {});
      }
      channelData.get(nodeName)[path] = {
        times,
        values: floatValues,
        elemSize,
      };
    }

    // Fixed 30 fps time steps for clean, artifact-free playback
    const fps = 30;
    const dt = 1.0 / fps;
    const numFrames = Math.max(2, Math.ceil(maxDuration * fps) + 1);
    const keyframeTimes = new Float32Array(numFrames);
    for (let f = 0; f < numFrames; f++) {
      keyframeTimes[f] = Math.min(f * dt, maxDuration);
    }
    keyframeTimes[numFrames - 1] = maxDuration; // Ensure exact end time match

    console.log(`  Frames: ${numFrames}, Duration: ${maxDuration.toFixed(2)}s (at ${fps} fps)`);

    // Retargeted output tracks:
    const retargetedRotations = new Map();
    for (const item of BONE_MAP) {
      retargetedRotations.set(item.tgt, new Float32Array(numFrames * 4));
    }
    const retargetedPelvisTranslations = new Float32Array(numFrames * 3);

    // Identify if clip is locomotion where root motion should be stripped
    const isLocomotion = clipName.toLowerCase().includes('walk') || clipName.toLowerCase().includes('run');

    // Retarget frame by frame
    for (let f = 0; f < numFrames; f++) {
      const t = keyframeTimes[f];

      // A. Pose Mixamo skeleton at time t with robust interpolation
      for (const [nodeName, tracks] of channelData.entries()) {
        const o = mixNodes.get(nodeName);
        if (!o) continue;

        if (tracks.rotation) {
          const qVal = sampleChannel(tracks.rotation.times, tracks.rotation.values, 4, true, t);
          o.quaternion.set(qVal[0], qVal[1], qVal[2], qVal[3]).normalize();
        }
        if (tracks.translation) {
          const pVal = sampleChannel(tracks.translation.times, tracks.translation.values, 3, false, t);
          o.position.set(pVal[0], pVal[1], pVal[2]);
        }
      }
      mixScene.updateMatrixWorld(true);

      // B. Retarget Pelvis position
      const srcHipsAnimPos = new THREE.Vector3();
      mixNodes.get('mixamorig:Hips').getWorldPosition(srcHipsAnimPos);
      const deltaHips = new THREE.Vector3().subVectors(srcHipsAnimPos, srcHipsRestPos);

      // Strip root motion for in-place locomotion (keep vertical bounce and natural sway)
      if (isLocomotion) {
        deltaHips.x = 0;
        deltaHips.z = 0;
      }

      // Height and displacement scaling
      const tgtPelvisWorldPos = tgtPelvisRestPos.clone().add(
        new THREE.Vector3(
          deltaHips.x * heightScale,
          deltaHips.y * heightScale,
          deltaHips.z * heightScale
        )
      );

      // Convert world position into pelvis's local parent (root) space
      const rootObj = qNodes.get('root');
      const localPelvisPos = tgtPelvisWorldPos.clone();
      rootObj.worldToLocal(localPelvisPos);

      retargetedPelvisTranslations[f * 3] = localPelvisPos.x;
      retargetedPelvisTranslations[f * 3 + 1] = localPelvisPos.y;
      retargetedPelvisTranslations[f * 3 + 2] = localPelvisPos.z;

      // Set pelvis local position on qNodes hierarchy for rotation calculations
      qNodes.get('pelvis').position.copy(localPelvisPos);

      // C. Retarget Rotations hierarchically (top-down from root to fingers and feet)
      for (const item of BONE_MAP) {
        const srcObj = mixNodes.get(item.src);
        const tgtObj = qNodes.get(item.tgt);
        if (!srcObj || !tgtObj) continue;

        // Source animated world quaternion
        const srcAnimWorldQ = new THREE.Quaternion();
        srcObj.getWorldQuaternion(srcAnimWorldQ);

        // deltaQ = srcAnimWorldQ * srcRestWorldQ^-1
        const deltaQ = srcAnimWorldQ.clone().multiply(srcRestWorldQ.get(item.src).clone().invert());

        // Target animated world quaternion = deltaQ * tgtRestWorldQ
        const tgtAnimWorldQ = deltaQ.clone().multiply(tgtRestWorldQ.get(item.tgt));

        // Convert to local rotation relative to animated target parent
        const parent = tgtObj.parent;
        const parentWorldQ = new THREE.Quaternion();
        if (parent) {
          parent.getWorldQuaternion(parentWorldQ);
        }
        const localQ = parentWorldQ.clone().invert().multiply(tgtAnimWorldQ).normalize();

        tgtObj.quaternion.copy(localQ);
        tgtObj.updateMatrixWorld(true);

        // Store into output array
        const outArr = retargetedRotations.get(item.tgt);
        outArr[f * 4] = localQ.x;
        outArr[f * 4 + 1] = localQ.y;
        outArr[f * 4 + 2] = localQ.z;
        outArr[f * 4 + 3] = localQ.w;
      }
    }

    // 5. Build glTF Animation object
    const outAnim = outDoc.createAnimation(clipName);

    // Shared time input accessor
    const timeAccessor = outDoc.createAccessor()
      .setBuffer(outBuffer)
      .setType('SCALAR')
      .setArray(new Float32Array(keyframeTimes));

    // Add translation channel for pelvis
    const pelvisTransAccessor = outDoc.createAccessor()
      .setBuffer(outBuffer)
      .setType('VEC3')
      .setArray(retargetedPelvisTranslations);
    const pelvisTransSampler = outDoc.createAnimationSampler()
      .setInput(timeAccessor)
      .setOutput(pelvisTransAccessor)
      .setInterpolation('LINEAR');
    const pelvisTransChannel = outDoc.createAnimationChannel()
      .setTargetPath('translation')
      .setTargetNode(outNodeMap.get('pelvis'))
      .setSampler(pelvisTransSampler);
    outAnim.addSampler(pelvisTransSampler).addChannel(pelvisTransChannel);

    // Add rotation channel for every bone in BONE_MAP
    for (const item of BONE_MAP) {
      const rotData = retargetedRotations.get(item.tgt);
      const rotAccessor = outDoc.createAccessor()
        .setBuffer(outBuffer)
        .setType('VEC4')
        .setArray(rotData);
      const rotSampler = outDoc.createAnimationSampler()
        .setInput(timeAccessor)
        .setOutput(rotAccessor)
        .setInterpolation('LINEAR');
      const rotChannel = outDoc.createAnimationChannel()
        .setTargetPath('rotation')
        .setTargetNode(outNodeMap.get(item.tgt))
        .setSampler(rotSampler);
      outAnim.addSampler(rotSampler).addChannel(rotChannel);
    }

    console.log(`  Added ${outAnim.listChannels().length} channels to clip ${clipName}`);
  }

  // 6. Write animations_q.glb
  const outPath = 'public/assets/characters/animations_q.glb';
  console.log(`\nWriting retargeted animations to ${outPath}...`);
  await io.write(outPath, outDoc);
  const outStat = fs.statSync(outPath);
  console.log(`Saved ${outPath} (${(outStat.size / 1024).toFixed(1)} KB)`);
  console.log('=== RETARGETING COMPLETE ===');
}

main().catch(err => {
  console.error('Fatal error during retargeting:', err);
  process.exit(1);
});
