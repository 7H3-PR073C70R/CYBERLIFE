import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { ScreenRenderer } from '@/presentation/world/ScreenRenderer';

describe('ScreenRenderer', () => {
  it('initializes canvas texture with 1280x800 resolution and required color space settings', () => {
    const renderer = new ScreenRenderer({
      width: 1280,
      height: 800,
      fps: 12,
      emissiveIntensity: 1.4,
    });

    const canvas = renderer.getCanvas();
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(800);

    const texture = renderer.getTexture();
    expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(texture.anisotropy).toBeGreaterThanOrEqual(8);
    expect(texture.generateMipmaps).toBe(true);

    const material = renderer.getMaterial();
    expect(material.emissiveIntensity).toBeCloseTo(1.4, 2);
    expect(material.emissiveMap).toBe(texture);

    renderer.dispose();
  });

  it('updates terminal lines and marks texture needsUpdate', () => {
    const renderer = new ScreenRenderer();
    const texture = renderer.getTexture();
    const initialVersion = texture.version;

    renderer.setTerminalLines([
      'tade@Orion-ws04:~$ nmap -sV 10.0.4.15',
      'PORT 445/tcp open microsoft-ds',
      'Aster AI service running with admin token',
    ]);

    // Force render cycle
    renderer.update(0.1);
    expect(texture.version).toBeGreaterThan(initialVersion);

    renderer.dispose();
  });

  it('updates full desktop state including open window titles and top panel', () => {
    const renderer = new ScreenRenderer();
    const texture = renderer.getTexture();
    const initialVersion = texture.version;

    renderer.updateDesktopState({
      workstationName: 'EkoSec OS 2026.4 [ELEVATED]',
      activeAppTitle: 'Incident Response Portal',
      wallpaperTheme: 'slate',
      openWindows: [
        { id: 'incident', title: 'Incident Response Portal', isActive: true },
        { id: 'terminal', title: 'Terminal', isActive: false },
      ],
    });

    renderer.update(0.1);
    expect(texture.version).toBeGreaterThan(initialVersion);

    renderer.dispose();
  });

  it('throttles rendering to target FPS (~12 fps) to prevent wasteful canvas redraws', () => {
    const renderer = new ScreenRenderer({ fps: 12 }); // ~83.3 ms per frame
    const texture = renderer.getTexture();

    // First frame renders
    renderer.update(0.1);
    const v1 = texture.version;

    // Tiny delta (10ms) does NOT trigger redraw
    renderer.update(0.01);
    expect(texture.version).toBe(v1);

    // Delta exceeding frame interval (90ms) DOES trigger redraw
    renderer.update(0.09);
    expect(texture.version).toBeGreaterThan(v1);

    renderer.dispose();
  });

  it('pauses rendering when screen is not visible', () => {
    const renderer = new ScreenRenderer();
    const texture = renderer.getTexture();

    renderer.setVisible(false);
    const v1 = texture.version;
    renderer.setTerminalLines(['New line']);
    renderer.update(0.2); // Large delta

    // Should not redraw when visible = false
    expect(texture.version).toBe(v1);

    renderer.setVisible(true);
    renderer.update(0.2);
    expect(texture.version).toBeGreaterThan(v1);

    renderer.dispose();
  });

  it('disposes texture and material cleanly', () => {
    const renderer = new ScreenRenderer();
    const texture = renderer.getTexture();
    const material = renderer.getMaterial();

    const texDisposeSpy = vi.spyOn(texture, 'dispose');
    const matDisposeSpy = vi.spyOn(material, 'dispose');

    renderer.dispose();

    expect(texDisposeSpy).toHaveBeenCalledTimes(1);
    expect(matDisposeSpy).toHaveBeenCalledTimes(1);
  });
});
