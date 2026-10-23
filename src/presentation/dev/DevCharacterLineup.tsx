import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  NAMED_NPC_PRESETS,
  PEDESTRIAN_ROLE_PRESETS,
  CROWD_40_PRESETS,
  LagosRolePreset,
} from '../world/entities/ModularCharacterRoles';
import { QuaterniusModularCharacter, WEST_AFRICAN_SKIN_TONES } from '../world/entities/ModularCharacter';

export type SubviewMode = 'named_npcs' | 'pedestrian_roles' | 'crowd_40' | 'comparison';

export const DevCharacterLineup: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialLighting = urlParams.get('lighting') === 'night' ? 'night' : 'day';
  const initialSubview = (urlParams.get('subview') as SubviewMode) || 'named_npcs';

  // UI state
  const [subview, setSubview] = useState<SubviewMode>(initialSubview);
  const [lightingMode, setLightingMode] = useState<'day' | 'night'>(initialLighting);
  const [activeAnimation, setActiveAnimation] = useState<string>('Idle');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'comparison' | 'focus'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>('Initializing 3D Lineup...');
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);

  // Active roster based on current subview
  const activePresets: LagosRolePreset[] = React.useMemo(() => {
    switch (subview) {
      case 'named_npcs':
        return NAMED_NPC_PRESETS;
      case 'pedestrian_roles':
        // Filter to 1 primary variant of each unique role for clean wide lineup
        return PEDESTRIAN_ROLE_PRESETS.filter((_, idx) => idx % 4 === 0);
      case 'crowd_40':
        return CROWD_40_PRESETS;
      case 'comparison':
        // 4 primary story leads for side-by-side comparison
        return NAMED_NPC_PRESETS.slice(0, 4);
      default:
        return NAMED_NPC_PRESETS;
    }
  }, [subview]);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modularCharactersRef = useRef<QuaterniusModularCharacter[]>([]);
  const realisticMixersRef = useRef<THREE.AnimationMixer[]>([]);
  const realisticActionsMapRef = useRef<Map<THREE.AnimationMixer, Map<string, THREE.AnimationAction>>>(new Map());

  // Lighting refs
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Mouse camera orbit state
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 0));
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 28.0,
    theta: 0,
    phi: Math.PI / 2.15,
  });

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const target = cameraTargetRef.current;

    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    cameraRef.current.position.set(
      target.x + radius * sinPhi * sinTheta,
      target.y + radius * cosPhi,
      target.z + radius * sinPhi * cosTheta
    );
    cameraRef.current.lookAt(target);
  }, []);

  const handleCameraPreset = useCallback((preset: 'overview' | 'comparison' | 'focus') => {
    setCameraPreset(preset);
    if (preset === 'overview') {
      if (subview === 'crowd_40') {
        cameraTargetRef.current.set(0, 1.0, 0);
        cameraSphericalRef.current = { radius: 24.0, theta: 0.25, phi: Math.PI / 2.6 };
      } else if (subview === 'comparison') {
        cameraTargetRef.current.set(5.5, 1.0, 0);
        cameraSphericalRef.current = { radius: 10.0, theta: 0, phi: Math.PI / 2.15 };
      } else {
        cameraTargetRef.current.set(2.0, 1.0, 0);
        cameraSphericalRef.current = { radius: 30.0, theta: 0, phi: Math.PI / 2.15 };
      }
    } else if (preset === 'comparison') {
      // Focus directly on the boundary between modular and realistic models
      cameraTargetRef.current.set(16.0, 1.0, 0);
      cameraSphericalRef.current = { radius: 8.5, theta: 0, phi: Math.PI / 2.15 };
    } else if (preset === 'focus') {
      const charX = -14 + selectedRoleIndex * 2.0;
      cameraTargetRef.current.set(charX, 1.0, 0);
      cameraSphericalRef.current = { radius: 4.2, theta: 0, phi: Math.PI / 2.15 };
    }
    updateCameraPosition();
  }, [subview, selectedRoleIndex, updateCameraPosition]);

  // Switch Lighting
  const applyLighting = useCallback((mode: 'day' | 'night') => {
    if (!sceneRef.current || !ambientLightRef.current || !sunLightRef.current || !fillLightRef.current || !rimLightRef.current) return;

    if (mode === 'day') {
      sceneRef.current.background = new THREE.Color(0x0f172a); // Studio slate
      sceneRef.current.fog = new THREE.FogExp2(0x0f172a, 0.010);

      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = 0.95;

      sunLightRef.current.color.setHex(0xfff7ed); // Bright Lagos sun
      sunLightRef.current.intensity = 2.4;
      sunLightRef.current.position.set(10, 18, 12);

      fillLightRef.current.color.setHex(0x38bdf8); // Sky blue fill
      fillLightRef.current.intensity = 0.85;

      rimLightRef.current.color.setHex(0xfef08a);
      rimLightRef.current.intensity = 0.5;
    } else {
      sceneRef.current.background = new THREE.Color(0x030712); // Deep midnight
      sceneRef.current.fog = new THREE.FogExp2(0x030712, 0.018);

      ambientLightRef.current.color.setHex(0x0f172a);
      ambientLightRef.current.intensity = 0.45;

      sunLightRef.current.color.setHex(0xf59e0b); // Sodium street light amber
      sunLightRef.current.intensity = 1.8;
      sunLightRef.current.position.set(6, 12, 6);

      fillLightRef.current.color.setHex(0x00f0ff); // Cyber cyan neon
      fillLightRef.current.intensity = 1.2;

      rimLightRef.current.color.setHex(0xa855f7); // Cyber violet rim
      rimLightRef.current.intensity = 0.9;
    }
  }, []);

  // Three.js Scene Setup & Model Loading
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1024;
    const height = containerRef.current.clientHeight || 768;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
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
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    sunLight.position.set(10, 18, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    fillLight.position.set(-12, 8, -8);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.5);
    rimLight.position.set(0, 10, -12);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    applyLighting(lightingMode);

    // Ground plane (80m x 40m)
    const groundGeo = new THREE.PlaneGeometry(90, 45);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.15,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(90, 90, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    // Divider Marker for Named NPCs & Comparison modes
    if (subview === 'named_npcs' || subview === 'comparison') {
      const dividerGeo = new THREE.BoxGeometry(0.04, 2.2, 0.4);
      const dividerMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85,
      });
      const dividerMesh = new THREE.Mesh(dividerGeo, dividerMat);
      dividerMesh.position.set(16.5, 1.1, 0);
      scene.add(dividerMesh);
    }

    // Initialize Camera Position
    handleCameraPreset('overview');

    // Load Characters
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const modularChars: QuaterniusModularCharacter[] = [];

    const loadAllCharacters = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(`Assembling 3D models for [${subview}]...`);

        // 1. Load active roster
        for (let i = 0; i < activePresets.length; i++) {
          const role = activePresets[i];
          if (!role) continue;
          setLoadingProgress(`Assembling [${i + 1}/${activePresets.length}]: ${role.roleName}...`);

          const char = new QuaterniusModularCharacter(role.appearance);
          await char.load(loader);

          // Position calculation based on subview
          if (subview === 'crowd_40') {
            // 5 rows of 8 pedestrians in a realistic plaza formation
            const col = i % 8;
            const row = Math.floor(i / 8);
            const posX = -14 + col * 4.0 + (row % 2 === 1 ? 2.0 : 0);
            const posZ = -6 + row * 3.2;
            char.group.position.set(posX, 0.01, posZ);
            // Slight natural angular variation
            char.group.rotation.y = ((i * 37) % 30 - 15) * (Math.PI / 180);
          } else if (subview === 'comparison') {
            const posX = 4.0 + i * 2.2;
            char.group.position.set(posX, 0.01, 0);
            char.group.rotation.y = 0;
          } else if (subview === 'pedestrian_roles') {
            // 2 rows of 13 roles
            const col = i % 13;
            const row = Math.floor(i / 13);
            const posX = -13 + col * 2.15;
            const posZ = row === 0 ? 0 : 2.5;
            char.group.position.set(posX, 0.01, posZ);
            char.group.rotation.y = 0;
          } else {
            // Named NPCs line: X from -15 to +13
            const posX = -15 + i * 1.95;
            char.group.position.set(posX, 0.01, 0);
            char.group.rotation.y = 0;
          }

          scene.add(char.group);
          modularChars.push(char);
        }
        modularCharactersRef.current = modularChars;

        // 2. Load the 3 Realistic Reference Characters for named_npcs and comparison modes
        if (subview === 'named_npcs' || subview === 'comparison') {
          setLoadingProgress('Loading realistic reference models (Player, Amina, Corporate Director)...');
          const realisticAnimsGltf = await new Promise<GLTF>((res, rej) =>
            loader.load('/assets/characters/animations.glb', res, undefined, rej)
          );

          const realisticFiles = [
            { url: '/assets/characters/player_male.glb', x: 18.2, label: 'Realistic Player (Operative)' },
            { url: '/assets/characters/amina_chic_female.glb', x: 20.4, label: 'Realistic NPC (Amina)' },
            { url: '/assets/characters/corporate_director_male.glb', x: 22.6, label: 'Realistic NPC (Director)' },
          ];

          const mixers: THREE.AnimationMixer[] = [];
          const actionsMap = new Map<THREE.AnimationMixer, Map<string, THREE.AnimationAction>>();

          for (const rf of realisticFiles) {
            const gltf = await new Promise<GLTF>((res, rej) =>
              loader.load(rf.url, res, undefined, rej)
            );
            const rScene: THREE.Group = gltf.scene;
            rScene.position.set(rf.x, 0.01, 0);
            rScene.rotation.y = 0;
            rScene.scale.set(1.0, 1.0, 1.0);

            rScene.traverse((c) => {
              if (c instanceof THREE.Mesh) {
                c.castShadow = true;
                c.receiveShadow = true;
              }
            });

            scene.add(rScene);

            // Mixer for realistic model
            const mixer = new THREE.AnimationMixer(rScene);
            const clipMap = new Map<string, THREE.AnimationAction>();
            for (const clip of realisticAnimsGltf.animations) {
              const action = mixer.clipAction(clip);
              clipMap.set(clip.name, action);
            }
            const defaultAction = clipMap.get('Idle');
            if (defaultAction) defaultAction.play();

            mixers.push(mixer);
            actionsMap.set(mixer, clipMap);
          }

          realisticMixersRef.current = mixers;
          realisticActionsMapRef.current = actionsMap;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading characters:', err);
        setLoadingProgress(`Error loading: ${String(err)}`);
      }
    };

    loadAllCharacters();

    // Render loop
    let animId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Update modular characters
      for (const mc of modularCharactersRef.current) {
        mc.update(delta);
      }

      // Update realistic characters
      for (const mixer of realisticMixersRef.current) {
        mixer.update(delta);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Window resize
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
  }, [subview, activePresets, applyLighting, lightingMode, handleCameraPreset]);

  // Handle animation switch
  const handleAnimationChange = (animName: string) => {
    setActiveAnimation(animName);

    // Switch for modular characters
    for (const mc of modularCharactersRef.current) {
      mc.playAnimation(animName);
    }

    // Switch for realistic characters
    for (const [, actionMap] of realisticActionsMapRef.current.entries()) {
      const targetAction = actionMap.get(animName);
      if (!targetAction) continue;

      for (const action of actionMap.values()) {
        if (action.isRunning()) {
          action.fadeOut(0.25);
        }
      }
      targetAction.reset().fadeIn(0.25).play();
    }
  };

  // Mouse camera dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.005;
    cameraSphericalRef.current.theta -= dx * sensitivity;
    cameraSphericalRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2.05, cameraSphericalRef.current.phi - dy * sensitivity)
    );
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.02;
    cameraSphericalRef.current.radius = Math.max(
      3.0,
      Math.min(55.0, cameraSphericalRef.current.radius + e.deltaY * zoomSpeed)
    );
    updateCameraPosition();
  };

  const handleCaptureContactSheet = (lighting: 'day' | 'night') => {
    if (!rendererRef.current) return;
    setCaptureStatus(`Capturing ${lighting.toUpperCase()} contact sheet...`);
    applyLighting(lighting);
    setLightingMode(lighting);

    setTimeout(() => {
      if (rendererRef.current) {
        const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `stageB_${subview}_${lighting}.png`;
        link.href = dataUrl;
        link.click();
        setCaptureStatus(`Saved stageB_${subview}_${lighting}.png!`);
        setTimeout(() => setCaptureStatus(null), 3500);
      }
    }, 400);
  };

  const selectedRole = activePresets[selectedRoleIndex] || activePresets[0];

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#0a0f1d',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Header Bar */}
      <header
        style={{
          position: 'absolute',
          top: 14,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 8,
          padding: '10px 18px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#00f0ff', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
            CYBERLIFE // STAGE B CHARACTER UPGRADE
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
            STAGE B1 PREVIEW
          </span>
        </div>

        {/* View Selection Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(['named_npcs', 'pedestrian_roles', 'crowd_40', 'comparison'] as SubviewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSubview(mode);
                setSelectedRoleIndex(0);
                const url = new URL(window.location.href);
                url.searchParams.set('subview', mode);
                window.history.replaceState({}, '', url.toString());
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: subview === mode ? '#0284c7' : '#1e293b',
                color: subview === mode ? '#fff' : '#cbd5e1',
                border: subview === mode ? '1px solid #38bdf8' : '1px solid #334155',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* View Controls: Animation & Lighting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Animation Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>Anim:</label>
            <select
              value={activeAnimation}
              onChange={(e) => handleAnimationChange(e.target.value)}
              style={{
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #0284c7',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <option value="Idle">Idle (Stance)</option>
              <option value="Walk">Walk (Locomotion)</option>
              <option value="Run">Run (Locomotion)</option>
              <option value="SitIdle">Sit Idle (Seated)</option>
              <option value="Typing">Typing (Workstation)</option>
              <option value="StandToSit">Stand to Sit</option>
              <option value="SitToStand">Sit to Stand</option>
            </select>
          </div>

          {/* Lighting Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => {
                setLightingMode('day');
                applyLighting('day');
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: lightingMode === 'day' ? '#f59e0b' : '#1e293b',
                color: lightingMode === 'day' ? '#000' : '#cbd5e1',
                border: '1px solid #475569',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ☀️ Day
            </button>
            <button
              onClick={() => {
                setLightingMode('night');
                applyLighting('night');
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: lightingMode === 'night' ? '#6366f1' : '#1e293b',
                color: '#fff',
                border: '1px solid #475569',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🌙 Night
            </button>
          </div>

          {/* Camera Framing Preset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => handleCameraPreset('overview')}
              style={{
                padding: '4px 8px',
                backgroundColor: cameraPreset === 'overview' ? '#0284c7' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Panorama
            </button>
            <button
              onClick={() => handleCameraPreset('comparison')}
              style={{
                padding: '4px 8px',
                backgroundColor: cameraPreset === 'comparison' ? '#0284c7' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Boundary
            </button>
          </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: '4px solid #334155',
              borderTopColor: '#00f0ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: 18, color: '#38bdf8', fontSize: 14, fontWeight: 600 }}>
            {loadingProgress}
          </p>
        </div>
      )}

      {/* Left Sidebar: Role List */}
      <aside
        style={{
          position: 'absolute',
          top: 80,
          left: 20,
          bottom: 24,
          width: 300,
          backgroundColor: 'rgba(15, 23, 42, 0.90)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 8,
          padding: '14px 16px',
          overflowY: 'auto',
          zIndex: 10,
        }}
      >
        <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: '#00f0ff', letterSpacing: 1, margin: '0 0 10px 0' }}>
          {subview === 'named_npcs'
            ? `Named NPCs (${activePresets.length})`
            : subview === 'pedestrian_roles'
            ? `Pedestrian Roles (${activePresets.length})`
            : subview === 'crowd_40'
            ? `Plaza Crowd (${activePresets.length})`
            : `Side-by-Side Comparison`}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 'calc(100% - 150px)', overflowY: 'auto' }}>
          {activePresets.map((role, idx) => {
            const isSelected = idx === selectedRoleIndex;
            return (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRoleIndex(idx);
                  if (cameraPreset === 'focus') {
                    const charX = -14 + idx * 2.0;
                    cameraTargetRef.current.set(charX, 1.0, 0);
                    updateCameraPosition();
                  }
                }}
                style={{
                  textAlign: 'left',
                  padding: '7px 9px',
                  backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.35)' : 'rgba(30, 41, 59, 0.5)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid transparent',
                  borderRadius: 6,
                  color: isSelected ? '#38bdf8' : '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: 11,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 210 }}>
                  {role.roleName}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                  {role.appearance.body === 'male' ? '♂ M' : '♀ F'}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Capture Contact Sheet:
          </h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleCaptureContactSheet('day')}
              style={{
                flex: 1,
                padding: '6px 10px',
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ☀️ Day PNG
            </button>
            <button
              onClick={() => handleCaptureContactSheet('night')}
              style={{
                flex: 1,
                padding: '6px 10px',
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🌙 Night PNG
            </button>
          </div>
          {captureStatus && (
            <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#10b981', textAlign: 'center' }}>
              {captureStatus}
            </p>
          )}
        </div>
      </aside>

      {/* Right Sidebar: Selected Character Card Details */}
      {selectedRole && (
        <aside
          style={{
            position: 'absolute',
            top: 80,
            right: 20,
            bottom: 24,
            width: 320,
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 8,
            padding: '14px 16px',
            overflowY: 'auto',
            zIndex: 10,
          }}
        >
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, letterSpacing: 1 }}>
              {selectedRole.category || 'Character Look Card'}
            </span>
            <h2 style={{ fontSize: 16, color: '#f8fafc', margin: '4px 0 2px 0', fontWeight: 700 }}>
              {selectedRole.roleName}
            </h2>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
              ID: <code>{selectedRole.id}</code>
            </p>
          </div>

          {selectedRole.signatureItem && (
            <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 6, padding: '8px 10px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#00f0ff', fontWeight: 700 }}>
                Signature Silhouette Item
              </div>
              <div style={{ fontSize: 11, color: '#f1f5f9', marginTop: 2, fontWeight: 500 }}>
                {selectedRole.signatureItem}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 11 }}>Skin Tone:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: '#' + (WEST_AFRICAN_SKIN_TONES[selectedRole.appearance.skinToneIndex]?.hex.toString(16).padStart(6, '0') ?? '000000'),
                    border: '1px solid rgba(255,255,255,0.4)',
                  }}
                />
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {WEST_AFRICAN_SKIN_TONES[selectedRole.appearance.skinToneIndex]?.name ?? 'Standard Tone'}
                </span>
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 11 }}>Height Scale:</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                {selectedRole.appearance.heightScale ? `${(selectedRole.appearance.heightScale * 1.75).toFixed(2)} m (${selectedRole.appearance.heightScale.toFixed(2)}x)` : '1.75 m (1.00x)'}
              </span>
            </div>

            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 11 }}>Hair & Styling:</span>
              <span style={{ color: '#e2e8f0' }}>
                Style: <strong>{selectedRole.appearance.hairstyle}</strong> | Beard: <strong>{selectedRole.appearance.hasBeard ? 'Yes' : 'No'}</strong>
              </span>
            </div>

            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 11 }}>Wardrobe Shells:</span>
              <div style={{ backgroundColor: '#1e293b', borderRadius: 6, padding: '8px 10px', marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8' }}>Top:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                    {selectedRole.appearance.clothing.top} ({selectedRole.appearance.clothing.topPattern})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#94a3b8' }}>Bottom:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                    {selectedRole.appearance.clothing.bottom}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Shoes:</span>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                    {selectedRole.appearance.clothing.shoes}
                  </span>
                </div>
              </div>
            </div>

            {selectedRole.appearance.accessories && (
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: 11 }}>Accessories:</span>
                <span style={{ color: '#e2e8f0', fontSize: 11 }}>
                  Headwear: <strong>{selectedRole.appearance.accessories.headwear ?? 'none'}</strong> | Glasses: <strong>{selectedRole.appearance.accessories.glasses ?? 'none'}</strong> | Lanyard: <strong>{selectedRole.appearance.accessories.lanyard ? 'Yes' : 'No'}</strong>
                </span>
              </div>
            )}

            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 11 }}>Description & Narrative Purpose:</span>
              <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: 11, lineHeight: 1.5 }}>
                {selectedRole.description}
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
