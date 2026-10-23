import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import assetConfigData from '../../../docs/world/asset-config.json';
import { DevCharacterLineup } from './DevCharacterLineup';

interface AssetConfigEntry {
  filename: string;
  title: string;
  verdict: string;
  tags: string[];
  nativeDimensions: { x: number; y: number; z: number };
  targetDimensions: { length: number; width: number; height: number };
  scaleFactor: number;
  upAxis: string;
  forwardAxis: string;
  rotationOffset: [number, number, number];
  pivot: string;
  groundOffset: number;
  triangles: number;
  fileSizeMB: number;
  author: string;
  license: string;
  sourceUrl: string;
  hash: string;
}

const ASSET_CONFIGS = assetConfigData.assets as unknown as Record<string, AssetConfigEntry>;

export const DevAssetViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Read initial asset from URL query param if present
  const initialAsset =
    new URLSearchParams(window.location.search).get('asset') || 'lagos_danfo_bus.glb';

  const defaultKey = ASSET_CONFIGS[initialAsset] ? initialAsset : Object.keys(ASSET_CONFIGS)[0] || '';

  const [activeTab, setActiveTab] = useState<'assets' | 'characters'>(() => {
    return new URLSearchParams(window.location.search).get('mode') === 'characters'
      ? 'characters'
      : 'assets';
  });

  const [selectedAssetKey, setSelectedAssetKey] = useState<string>(defaultKey);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showHumanRef, setShowHumanRef] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [cameraAngle, setCameraAngle] = useState<'perspective' | 'front' | 'side' | 'top'>('perspective');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const loadedModelRootRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const humanRefGroupRef = useRef<THREE.Group | null>(null);

  // Mouse interaction state for camera orbiting
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 7.5,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  const currentConfig: AssetConfigEntry | undefined = ASSET_CONFIGS[selectedAssetKey];

  // Helper to safely apply wireframe to any material
  const applyWireframeToMesh = (mesh: THREE.Mesh, enabled: boolean) => {
    if (!mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (m && 'wireframe' in m) {
        (m as THREE.MeshStandardMaterial).wireframe = enabled;
      }
    }
  };

  // Helper to construct 1.75m human reference mannequin
  const createHumanReference = useCallback((): THREE.Group => {
    const group = new THREE.Group();
    group.name = 'HumanReference_1_75m';

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan neon reference tone
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x0891b2,
      emissiveIntensity: 0.25,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
    });
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
    });

    // Torso / Body Capsule
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.75, 16);
    const torso = new THREE.Mesh(torsoGeo, skinMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    group.add(torso);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.65, 12);
    const leftLeg = new THREE.Mesh(legGeo, jointMat);
    leftLeg.position.set(-0.10, 0.35, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, jointMat);
    rightLeg.position.set(0.10, 0.35, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Head
    const headGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.62;
    head.castShadow = true;
    group.add(head);

    // Height measurement vertical ruler pole at side
    const rulerPoleGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.75, 8);
    const rulerPole = new THREE.Mesh(rulerPoleGeo, poleMat);
    rulerPole.position.set(-0.45, 0.875, 0);
    group.add(rulerPole);

    // Ruler base disc
    const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16), poleMat);
    baseDisc.position.set(-0.45, 0.01, 0);
    group.add(baseDisc);

    // 1.75m marker banner at the top
    const markerGeo = new THREE.BoxGeometry(0.24, 0.05, 0.01);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const topMarker = new THREE.Mesh(markerGeo, markerMat);
    topMarker.position.set(-0.45, 1.75, 0);
    group.add(topMarker);

    // Minor tick marks every 0.25m
    for (let h = 0.25; h < 1.75; h += 0.25) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.01), poleMat);
      tick.position.set(-0.45, h, 0);
      group.add(tick);
    }

    return group;
  }, []);

  // Update Camera View according to spherical coordinates or preset
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const { radius, theta, phi } = cameraSphericalRef.current;

    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);

    // Look at center of focus slightly above ground
    const targetY = currentConfig ? Math.min(2.0, (currentConfig.targetDimensions.height || 1.5) / 2) : 1.0;
    camera.lookAt(0, targetY, 0);
  }, [currentConfig]);

  // Set preset camera angles
  const applyCameraAngle = useCallback((angle: 'perspective' | 'front' | 'side' | 'top') => {
    setCameraAngle(angle);
    const maxDim = currentConfig
      ? Math.max(
          currentConfig.targetDimensions.length,
          currentConfig.targetDimensions.width,
          currentConfig.targetDimensions.height
        )
      : 3.0;

    const baseDist = Math.max(4.0, maxDim * 1.8);

    if (angle === 'perspective') {
      cameraSphericalRef.current = { radius: baseDist, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    } else if (angle === 'front') {
      cameraSphericalRef.current = { radius: baseDist, theta: 0, phi: Math.PI / 2.2 };
    } else if (angle === 'side') {
      cameraSphericalRef.current = { radius: baseDist, theta: Math.PI / 2, phi: Math.PI / 2.2 };
    } else if (angle === 'top') {
      cameraSphericalRef.current = { radius: baseDist * 1.2, theta: 0, phi: 0.05 };
    }
    updateCameraPosition();
  }, [currentConfig, updateCameraPosition]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1024;
    const height = containerRef.current.clientHeight || 768;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900 neutral studio background
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(8, 14, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    fillLight.position.set(-10, 6, -8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.6);
    rimLight.position.set(0, 10, -12);
    scene.add(rimLight);

    // 1 m Floor Grid (30m x 30m, 1m intervals)
    const gridHelper = new THREE.GridHelper(30, 30, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Neutral Studio Pedestal Floor
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.15,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 1.75m Human Reference
    const humanRef = createHumanReference();
    humanRef.position.set(-2.0, 0, 0);
    scene.add(humanRef);
    humanRefGroupRef.current = humanRef;

    // Initial camera positioning
    updateCameraPosition();

    // Render loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [createHumanReference, updateCameraPosition]);

  // Load selected asset model
  useEffect(() => {
    if (!sceneRef.current || !selectedAssetKey) return;
    const scene = sceneRef.current;
    const config = ASSET_CONFIGS[selectedAssetKey];

    // Remove existing model
    if (loadedModelRootRef.current) {
      scene.remove(loadedModelRootRef.current);
      loadedModelRootRef.current = null;
    }

    if (!config || (config.verdict === 'REJECT' && selectedAssetKey.endsWith('.zip'))) {
      setLoadError('Non-GLB asset: cannot load in 3D viewer.');
      return;
    }

    setLoading(true);
    setLoadError(null);

    const loader = new GLTFLoader();
    const assetUrl = `/api/assets-incoming/new/${selectedAssetKey}`;

    loader.load(
      assetUrl,
      (gltf) => {
        const root = new THREE.Group();
        root.name = `ViewerModel_${selectedAssetKey}`;
        root.add(gltf.scene);

        // Apply scale factor
        const scale = config.scaleFactor || 1.0;
        gltf.scene.scale.setScalar(scale);

        // Apply rotation offset
        if (config.rotationOffset) {
          gltf.scene.rotation.x = config.rotationOffset[0];
          gltf.scene.rotation.y = config.rotationOffset[1];
          gltf.scene.rotation.z = config.rotationOffset[2];
        }

        // Align bounding box to floor center (Y=0, X=0, Z=0)
        gltf.scene.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Shift so bottom is at Y=0 and X/Z centered
        gltf.scene.position.x -= center.x;
        gltf.scene.position.z -= center.z;
        gltf.scene.position.y -= bbox.min.y;

        // Shadow configuration and wireframe
        gltf.scene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            applyWireframeToMesh(mesh, wireframe);
          }
        });

        // Position Human Reference adjacent to the model
        if (humanRefGroupRef.current) {
          const modelWidth = Math.max(1.5, config.targetDimensions.width || 2.0);
          humanRefGroupRef.current.position.set(-modelWidth / 2 - 1.2, 0, 0);
        }

        scene.add(root);
        loadedModelRootRef.current = root;
        setLoading(false);

        // Auto-reframe camera
        applyCameraAngle(cameraAngle);

        // Notify automated contact-sheet capturer if requested via query param
        const params = new URLSearchParams(window.location.search);
        if (params.get('autoCapture') === '1') {
          setTimeout(() => {
            captureContactSheet();
          }, 800);
        }
      },
      undefined,
      (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Failed to load asset in DevViewer:', err);
        setLoadError(`Failed to load ${selectedAssetKey}: ${msg || 'Network/Parse Error'}`);
        setLoading(false);
      }
    );
  }, [selectedAssetKey, wireframe, cameraAngle, applyCameraAngle]);

  // Wireframe toggle effect
  useEffect(() => {
    if (!loadedModelRootRef.current) return;
    loadedModelRootRef.current.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        applyWireframeToMesh(node as THREE.Mesh, wireframe);
      }
    });
  }, [wireframe]);

  // Grid and Human Ref visibility
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
    if (humanRefGroupRef.current) humanRefGroupRef.current.visible = showHumanRef;
  }, [showGrid, showHumanRef]);

  // Mouse drag Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraSphericalRef.current.theta -= deltaX * 0.008;
    cameraSphericalRef.current.phi = Math.max(
      0.08,
      Math.min(Math.PI / 2.05, cameraSphericalRef.current.phi - deltaY * 0.008)
    );
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraSphericalRef.current.radius = Math.max(
      1.5,
      Math.min(100, cameraSphericalRef.current.radius + e.deltaY * 0.015)
    );
    updateCameraPosition();
  };

  useEffect(() => {
    (window as unknown as { __DEV_VIEWER__: unknown }).__DEV_VIEWER__ = {
      selectAsset: (key: string) => setSelectedAssetKey(key),
      captureContactSheet: () => captureContactSheet(),
      getCurrentAsset: () => selectedAssetKey,
      isLoaded: () => !loading && loadedModelRootRef.current !== null,
    };
  }, [selectedAssetKey, loading]);

  // Capture Multi-Angle Contact Sheet
  const captureContactSheet = async () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !currentConfig) return;
    setCaptureStatus('Rendering 4-angle contact sheet...');

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    const angleViews: Array<{ angle: 'perspective' | 'front' | 'side' | 'top'; label: string; wireframe?: boolean }> = [
      { angle: 'perspective', label: 'Perspective (3/4 View)' },
      { angle: 'front', label: 'Front Elevation' },
      { angle: 'side', label: 'Side / Profile View' },
      { angle: 'perspective', label: 'Topology Wireframe', wireframe: true },
    ];

    // Single sub-image resolution
    const tileW = 640;
    const tileH = 480;
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = tileW * 2;
    compositeCanvas.height = tileH * 2 + 100; // Extra banner height
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    // Dark background banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

    // Header banner text
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`CYBERLIFE ASSET REVIEW: ${currentConfig.title || currentConfig.filename}`, 24, 40);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(
      `File: ${currentConfig.filename} | Author: ${currentConfig.author} | License: ${currentConfig.license} | Tris: ${currentConfig.triangles.toLocaleString()} | Scale: ${currentConfig.scaleFactor}x | Target: ${currentConfig.targetDimensions.length}m x ${currentConfig.targetDimensions.width}m x ${currentConfig.targetDimensions.height}m | Verdict: ${currentConfig.verdict}`,
      24,
      70
    );

    // Save previous renderer state
    const originalAspect = camera.aspect;
    camera.aspect = tileW / tileH;
    camera.updateProjectionMatrix();
    renderer.setSize(tileW, tileH);

    for (let i = 0; i < angleViews.length; i++) {
      const v = angleViews[i];
      if (!v) continue;
      applyCameraAngle(v.angle);

      // Temporarily toggle wireframe if needed
      if (loadedModelRootRef.current) {
        loadedModelRootRef.current.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            applyWireframeToMesh(node as THREE.Mesh, !!v.wireframe);
          }
        });
      }

      renderer.render(scene, camera);

      const col = i % 2;
      const row = Math.floor(i / 2);
      const destX = col * tileW;
      const destY = 100 + row * tileH;

      ctx.drawImage(renderer.domElement, destX, destY, tileW, tileH);

      // Sub-label overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(destX + 12, destY + 12, 220, 28);
      ctx.fillStyle = v.wireframe ? '#38bdf8' : '#e2e8f0';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(v.label, destX + 22, destY + 31);
    }

    // Restore original aspect and size
    camera.aspect = originalAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(containerRef.current?.clientWidth || 1024, containerRef.current?.clientHeight || 768);

    // Reset wireframe to UI state
    if (loadedModelRootRef.current) {
      loadedModelRootRef.current.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          applyWireframeToMesh(node as THREE.Mesh, wireframe);
        }
      });
    }

    // Export as compressed WebP
    const dataUrl = compositeCanvas.toDataURL('image/webp', 0.85);
    const filename = `${selectedAssetKey.replace('.glb', '')}.webp`;

    try {
      const res = await fetch('/api/save-contact-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, dataUrl }),
      });
      const data = await res.json();
      if (data.ok) {
        setCaptureStatus(`Saved docs/world/contact-sheets/${filename}`);
        (window as unknown as { __CONTACT_SHEET_DONE__: boolean }).__CONTACT_SHEET_DONE__ = true;
      } else {
        setCaptureStatus(`Error saving: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCaptureStatus(`Upload error: ${msg}`);
    }
  };

  if (activeTab === 'characters') {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <div
          style={{
            position: 'fixed',
            top: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            gap: 6,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 4,
            borderRadius: 6,
            border: '1px solid #334155',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={() => setActiveTab('assets')}
            style={{
              padding: '6px 14px',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            📁 3D Asset Inspector
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            style={{
              padding: '6px 14px',
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            👥 Character Lineup & Retargeting
          </button>
        </div>
        <DevCharacterLineup />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#f8fafc',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Top Header / Control Toolbar */}
      <header
        style={{
          position: 'absolute',
          top: 16,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 8,
          padding: '10px 18px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#00f0ff', fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
            CYBERLIFE // DEV ASSET VIEWER
          </span>
          <span
            style={{
              padding: '2px 8px',
              backgroundColor: '#0284c7',
              color: '#fff',
              fontSize: 11,
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            STAGE A REVIEW
          </span>
          <div style={{ display: 'flex', gap: 4, backgroundColor: '#0f172a', padding: 3, borderRadius: 6, border: '1px solid #334155' }}>
            <button
              onClick={() => setActiveTab('assets')}
              style={{
                padding: '4px 10px',
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              📁 Assets
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              style={{
                padding: '4px 10px',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              👥 Characters Lineup
            </button>
          </div>
        </div>

        {/* Asset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, color: '#94a3b8' }}>Select Asset:</label>
          <select
            value={selectedAssetKey}
            onChange={(e) => setSelectedAssetKey(e.target.value)}
            style={{
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 13,
              maxWidth: 320,
              cursor: 'pointer',
            }}
          >
            {Object.keys(ASSET_CONFIGS).map((k) => {
              const cfg = ASSET_CONFIGS[k];
              const tag =
                cfg && cfg.verdict === 'USE'
                  ? '🟢 USE'
                  : cfg && cfg.verdict === 'USE AFTER WORK'
                  ? '🟡 WORK'
                  : cfg && cfg.verdict === 'PARKED'
                  ? '🅿️ PARK'
                  : '🔴 REJ';
              return (
                <option key={k} value={k}>
                  {tag} - {k}
                </option>
              );
            })}
          </select>
        </div>

        {/* View / Toggle Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setWireframe(!wireframe)}
            style={{
              padding: '6px 12px',
              backgroundColor: wireframe ? '#0ea5e9' : '#1e293b',
              color: '#fff',
              border: '1px solid #38bdf8',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {wireframe ? 'Solid' : 'Wireframe'}
          </button>

          <button
            onClick={() => setShowHumanRef(!showHumanRef)}
            style={{
              padding: '6px 12px',
              backgroundColor: showHumanRef ? '#0f766e' : '#1e293b',
              color: '#fff',
              border: '1px solid #14b8a6',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            1.75m Ref
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            style={{
              padding: '6px 12px',
              backgroundColor: showGrid ? '#3b82f6' : '#1e293b',
              color: '#fff',
              border: '1px solid #60a5fa',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            1m Grid
          </button>

          <button
            onClick={captureContactSheet}
            style={{
              padding: '6px 14px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            📸 Export Contact Sheet
          </button>
        </div>
      </header>

      {/* Floating Camera Preset Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid rgba(56, 189, 248, 0.3)',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'center', paddingRight: 6 }}>Camera:</span>
        {(['perspective', 'front', 'side', 'top'] as const).map((ang) => (
          <button
            key={ang}
            onClick={() => applyCameraAngle(ang)}
            style={{
              padding: '5px 12px',
              backgroundColor: cameraAngle === ang ? '#0ea5e9' : '#1e293b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {ang}
          </button>
        ))}
      </div>

      {/* Side Stats & Curation Panel */}
      {currentConfig && (
        <aside
          style={{
            position: 'absolute',
            bottom: 24,
            left: 20,
            width: 340,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 8,
            padding: 16,
            zIndex: 10,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#00f0ff', fontWeight: 700, fontSize: 14 }}>
              {currentConfig.title || currentConfig.filename}
            </span>
            <span
              style={{
                padding: '2px 6px',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: 11,
                backgroundColor:
                  currentConfig.verdict === 'USE'
                    ? '#059669'
                    : currentConfig.verdict === 'USE AFTER WORK'
                    ? '#d97706'
                    : currentConfig.verdict === 'PARKED'
                    ? '#475569'
                    : currentConfig.verdict === 'HOLD'
                    ? '#6366f1'
                    : '#dc2626',
              }}
            >
              {currentConfig.verdict}
            </span>
          </div>

          <div style={{ color: '#94a3b8', marginBottom: 8 }}>
            <strong>Author:</strong> {currentConfig.author} <br />
            <strong>License:</strong> {currentConfig.license} <br />
            <strong>Triangles:</strong> {currentConfig.triangles.toLocaleString()} <br />
            <strong>File Size:</strong> {currentConfig.fileSizeMB} MB
          </div>

          <div style={{ borderTop: '1px solid #334155', paddingTop: 8, marginBottom: 8 }}>
            <strong style={{ color: '#38bdf8' }}>Scale Normalisation:</strong>
            <br />
            Applied Scale: <code>{currentConfig.scaleFactor}x</code> <br />
            Target Dimensions: {currentConfig.targetDimensions.length}m (L) × {currentConfig.targetDimensions.width}m (W) ×{' '}
            {currentConfig.targetDimensions.height}m (H) <br />
            Pivot: {currentConfig.pivot} | Ground Offset: {currentConfig.groundOffset}m
          </div>

          <div style={{ borderTop: '1px solid #334155', paddingTop: 8 }}>
            <strong style={{ color: '#f59e0b' }}>Audit Notes:</strong>
            <br />
            <span style={{ color: '#cbd5e1' }}>
              {(assetConfigData.assets as Record<string, { reason?: string }>)[selectedAssetKey]?.reason || 'Inspected in Stage A.'}
            </span>
          </div>

          {captureStatus && (
            <div
              style={{
                marginTop: 10,
                padding: '6px 8px',
                backgroundColor: '#064e3b',
                color: '#34d399',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {captureStatus}
            </div>
          )}
        </aside>
      )}

      {/* Loading & Error Overlays */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #00f0ff',
            borderRadius: 8,
            padding: '16px 28px',
            color: '#00f0ff',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: 1,
            zIndex: 20,
          }}
        >
          LOADING ASSET...
        </div>
      )}

      {loadError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #ef4444',
            borderRadius: 8,
            padding: '16px 28px',
            color: '#f87171',
            fontWeight: 600,
            fontSize: 14,
            maxWidth: 420,
            textAlign: 'center',
            zIndex: 20,
          }}
        >
          {loadError}
        </div>
      )}
    </div>
  );
};
