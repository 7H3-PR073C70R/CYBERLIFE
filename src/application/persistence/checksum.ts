/**
 * Cyberlife — Milestone 9: Deterministic Checksum & Data Integrity
 *
 * Implements a fast, deterministic 32-bit FNV-1a checksum algorithm over
 * serialized simulation state to verify save file integrity and detect bit rot.
 */

/**
 * Calculates a deterministic 8-character hex checksum string for any serializable object.
 */
export function calculateStateChecksum(data: unknown): string {
  // Use canonical JSON stringification (with sorted keys if object) to ensure determinism
  const jsonString = canonicalStringify(data);
  let hash = 0x811c9dc5;

  for (let i = 0; i < jsonString.length; i++) {
    hash ^= jsonString.charCodeAt(i);
    // 32-bit FNV-1a prime multiplication: hash * 16777619
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Verifies that the provided checksum matches the calculated checksum of the data.
 */
export function verifyStateChecksum(data: unknown, expectedChecksum: string): boolean {
  if (!expectedChecksum || typeof expectedChecksum !== 'string') {
    return false;
  }
  const calculated = calculateStateChecksum(data);
  return calculated.toLowerCase() === expectedChecksum.toLowerCase();
}

/**
 * Canonical JSON stringifier that sorts object keys recursively.
 * Ensures deterministic checksums regardless of key insertion order.
 */
function canonicalStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalStringify(item)).join(',') + ']';
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const entries: string[] = [];

  for (const key of keys) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== undefined && typeof val !== 'function' && typeof val !== 'symbol') {
      entries.push(JSON.stringify(key) + ':' + canonicalStringify(val));
    }
  }

  return '{' + entries.join(',') + '}';
}
