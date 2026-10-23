import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AssetManifestRegistry, ASSET_MANIFEST } from '@/presentation/world/assets/AssetManifest';

describe('Asset Manifest & Provenance Registry Validation', () => {
  const projectRoot = process.cwd();

  it('validates that every asset entry contains mandatory tracking fields', () => {
    expect(ASSET_MANIFEST.length).toBeGreaterThanOrEqual(15);

    for (const asset of ASSET_MANIFEST) {
      expect(asset.id).toBeTruthy();
      expect(asset.name).toBeTruthy();
      expect(asset.category).toBeTruthy();
      expect(asset.intendedUse).toBeTruthy();
      expect(asset.associatedSceneOrPlacement).toBeTruthy();
      expect(asset.license).toBeTruthy();
      expect(asset.localPath).toBeTruthy();
      expect(asset.format).toBeTruthy();
      expect(asset.fallbackBehavior).toBeTruthy();
    }
  });

  it('verifies that all downloaded, optimized, and integrated assets exist on the physical filesystem', () => {
    const physicalAssets = ASSET_MANIFEST.filter(
      a =>
        a.acquisitionStatus === 'downloaded' ||
        a.acquisitionStatus === 'validated' ||
        a.acquisitionStatus === 'optimized' ||
        a.acquisitionStatus === 'integrated' ||
        a.acquisitionStatus === 'visually_verified'
    );

    for (const asset of physicalAssets) {
      const fullPath = path.resolve(projectRoot, asset.localPath);
      const fileExists = fs.existsSync(fullPath);
      expect(
        fileExists,
        `Asset "${asset.name}" (${asset.id}) claimed status "${asset.acquisitionStatus}" but file was not found at ${asset.localPath}`
      ).toBe(true);
    }
  });

  it('verifies visual verification evidence files exist for all visually_verified assets', () => {
    const visuallyVerified = ASSET_MANIFEST.filter(a => a.acquisitionStatus === 'visually_verified');
    expect(visuallyVerified.length).toBeGreaterThanOrEqual(10);

    for (const asset of visuallyVerified) {
      if (asset.visualVerificationEvidence) {
        const evidencePath = path.resolve(projectRoot, asset.visualVerificationEvidence);
        const evidenceExists = fs.existsSync(evidencePath);
        expect(
          evidenceExists,
          `Asset "${asset.name}" claimed visual verification at ${asset.visualVerificationEvidence} but evidence file was not found.`
        ).toBe(true);
      }
    }
  });

  it('correctly tracks the known defect backlog and prioritizes heavy unoptimized assets', () => {
    const defects = AssetManifestRegistry.getDefectBacklog();
    expect(defects.length).toBeGreaterThanOrEqual(2);

    const islandTree = defects.find(d => d.id === 'env_island_tree_01');
    expect(islandTree).toBeDefined();
    expect(islandTree?.replacementPriority).toBe('HIGH');
    expect(islandTree?.knownDefects?.join(' ')).toContain('66.3 MB');
  });

  it('produces diagnostic warnings and fallback geometry for unknown or missing assets without silent crashes', () => {
    // Unknown asset
    const unknownResult = AssetManifestRegistry.validateAssetReadiness('unknown_missing_asset_123');
    expect(unknownResult.isProductionReady).toBe(false);
    expect(unknownResult.diagnosticMessage).toContain('WARNING: Unknown asset ID');
    expect(unknownResult.diagnosticMessage).toContain('fallback primitive geometry');

    // High defect asset
    const defectResult = AssetManifestRegistry.validateAssetReadiness('env_island_tree_01');
    expect(defectResult.isProductionReady).toBe(false);
    expect(defectResult.diagnosticMessage).toContain('PERFORMANCE DEFECT');

    // Production ready asset
    const readyResult = AssetManifestRegistry.validateAssetReadiness('char_player_male');
    expect(readyResult.isProductionReady).toBe(true);
    expect(readyResult.diagnosticMessage).toContain('verified ready');
  });

  it('validates that public/assets/asset_manifest.json exists and parses cleanly as valid JSON', () => {
    const jsonPath = path.resolve(projectRoot, 'public/assets/asset_manifest.json');
    expect(fs.existsSync(jsonPath)).toBe(true);

    const rawJson = fs.readFileSync(jsonPath, 'utf8');
    const parsed = JSON.parse(rawJson);
    expect(parsed.schemaVersion).toBe('1.0.0');
    expect(Array.isArray(parsed.assets)).toBe(true);
    expect(parsed.assets.length).toBeGreaterThanOrEqual(15);
  });

  it('verifies that no unlisted 3D model exists in public/assets without being tracked in LICENSES.md and ASSET_MANIFEST', () => {
    const walkSync = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results = results.concat(walkSync(full));
        } else {
          results.push(full);
        }
      }
      return results;
    };

    const assetsDir = path.resolve(projectRoot, 'public/assets');
    const allFiles = walkSync(assetsDir);
    const glbFiles = allFiles.filter(f => f.endsWith('.glb') || f.endsWith('.gltf'));
    const licensesPath = path.resolve(projectRoot, 'public/assets/LICENSES.md');
    const licensesContent = fs.readFileSync(licensesPath, 'utf8');

    const manifestLocalPaths = new Set(ASSET_MANIFEST.map(a => path.resolve(projectRoot, a.localPath)));

    for (const glb of glbFiles) {
      const filename = path.basename(glb);
      const relativePath = path.relative(projectRoot, glb).replace(/\\/g, '/');

      // 1. Must be listed in LICENSES.md
      const isListedInLicenses = licensesContent.includes(filename) || licensesContent.includes(relativePath);
      expect(
        isListedInLicenses,
        `Unlisted 3D asset detected in public/: "${relativePath}" is missing from public/assets/LICENSES.md`
      ).toBe(true);

      // 2. Must be tracked in ASSET_MANIFEST
      const isTrackedInManifest = manifestLocalPaths.has(glb);
      expect(
        isTrackedInManifest,
        `Untracked 3D asset detected in public/: "${relativePath}" is missing from ASSET_MANIFEST registry`
      ).toBe(true);
    }
  });

  it('strictly enforces that rejected assets and unhandled folders never enter public/assets', () => {
    const walkSync = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results = results.concat(walkSync(full));
        } else {
          results.push(full);
        }
      }
      return results;
    };

    const assetsDir = path.resolve(projectRoot, 'public/assets');
    const allFiles = walkSync(assetsDir);

    // Assert that aldi_supermarket (CC-BY-NC / real brand) never enters public/
    const forbiddenPatterns = [
      'aldi',
      'aldi_supermarket',
      'Universal Base Characters',
      'Universal_Base_Characters',
    ];

    for (const file of allFiles) {
      const lower = file.toLowerCase();
      for (const pattern of forbiddenPatterns) {
        expect(
          lower.includes(pattern.toLowerCase()),
          `Security / License Violation: Forbidden or unhandled asset "${file}" was detected in public/assets!`
        ).toBe(false);
      }
    }
  });

  it('verifies that every asset path referenced in public/assets/LICENSES.md physically exists on disk', () => {
    const licensesPath = path.resolve(projectRoot, 'public/assets/LICENSES.md');
    const licensesContent = fs.readFileSync(licensesPath, 'utf8');
    const fileRegex = /`public\/assets\/[^`\s]+`/g;
    const matches = licensesContent.match(fileRegex) || [];

    expect(matches.length).toBeGreaterThanOrEqual(20);

    for (const match of matches) {
      const cleanPath = match.replace(/`/g, '');
      const fullPath = path.resolve(projectRoot, cleanPath);
      const exists = fs.existsSync(fullPath);
      expect(
        exists,
        `File referenced in public/assets/LICENSES.md does not exist at "${cleanPath}"`
      ).toBe(true);
    }
  });
});

