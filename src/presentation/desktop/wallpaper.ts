/**
 * Generates an original SVG/CSS procedural wallpaper for Orion OS.
 * Features an obsidian-to-teal gradient with geometric circuit traces,
 * hex-grid accent nodes, and soft neon illumination.
 */
export function generateWallpaperSvg(width = 1920, height = 1080): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#122b3b" stop-opacity="0.85" />
      <stop offset="45%" stop-color="#0a1824" stop-opacity="0.95" />
      <stop offset="85%" stop-color="#040810" stop-opacity="1" />
      <stop offset="100%" stop-color="#020408" stop-opacity="1" />
    </radialGradient>
    <pattern id="circuitGrid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(0, 229, 255, 0.035)" stroke-width="1" />
      <circle cx="0" cy="0" r="1.5" fill="rgba(0, 229, 255, 0.08)" />
      <circle cx="64" cy="0" r="1.5" fill="rgba(0, 229, 255, 0.08)" />
      <circle cx="0" cy="64" r="1.5" fill="rgba(0, 229, 255, 0.08)" />
      <circle cx="64" cy="64" r="1.5" fill="rgba(0, 229, 255, 0.08)" />
    </pattern>
    <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.25" />
      <stop offset="50%" stop-color="#00e676" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Base background -->
  <rect width="100%" height="100%" fill="url(#bgGlow)" />

  <!-- Fine grid pattern -->
  <rect width="100%" height="100%" fill="url(#circuitGrid)" />

  <!-- Decorative stylized geometric traces -->
  <g stroke="url(#traceGrad)" fill="none" stroke-width="1.5" opacity="0.65">
    <path d="M 120 180 L 280 180 L 340 240 L 520 240" />
    <path d="M 1400 320 L 1560 320 L 1640 400 L 1800 400" />
    <path d="M 300 820 L 450 820 L 530 740 L 700 740" />
    <path d="M 1250 880 L 1380 880 L 1440 820 L 1620 820" />
  </g>

  <!-- Subtle node pulse dots -->
  <g fill="#00e5ff" opacity="0.4">
    <circle cx="280" cy="180" r="3" />
    <circle cx="520" cy="240" r="3" />
    <circle cx="1560" cy="320" r="3" />
    <circle cx="1800" cy="400" r="3" />
    <circle cx="450" cy="820" r="3" />
    <circle cx="700" cy="740" r="3" />
    <circle cx="1380" cy="880" r="3" />
    <circle cx="1620" cy="820" r="3" />
  </g>

  <!-- Central stylized crest emblem watermark -->
  <g transform="translate(${width / 2}, ${height * 0.44})" opacity="0.06">
    <polygon points="0,-120 100,-60 100,60 0,120 -100,60 -100,-60" fill="none" stroke="#00e5ff" stroke-width="4" />
    <polygon points="0,-80 70,-40 70,40 0,80 -70,40 -70,-40" fill="none" stroke="#00e5ff" stroke-width="2" />
    <line x1="0" y1="-120" x2="0" y2="120" stroke="#00e5ff" stroke-width="2" />
    <line x1="-100" y1="-60" x2="100" y2="60" stroke="#00e5ff" stroke-width="2" />
    <line x1="-100" y1="60" x2="100" y2="-60" stroke="#00e5ff" stroke-width="2" />
    <circle cx="0" cy="0" r="16" fill="#00e5ff" />
  </g>

  <!-- Subtle watermark branding text -->
  <g font-family="Inter, system-ui, sans-serif" text-anchor="middle" opacity="0.08">
    <text x="${width / 2}" y="${height * 0.58}" font-size="36" font-weight="700" letter-spacing="8" fill="#00e5ff">Orion OS 4.5</text>
    <text x="${width / 2}" y="${height * 0.62}" font-size="14" font-weight="500" letter-spacing="4" fill="#94a3b8">SECURITY STAGING // LINUX 6.8.0</text>
  </g>
</svg>`;
}

export const WALLPAPER_IMAGE_URL = '/assets/os/Orion_security_wallpaper.jpg';

export function getWallpaperDataUrl(): string {
  return WALLPAPER_IMAGE_URL;
}
