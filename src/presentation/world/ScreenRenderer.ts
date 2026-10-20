import * as THREE from 'three';
import { OS_NAME, OS_VERSION, OS_BRANDING, HOSTNAMES, KERNEL_STRING } from '../desktop/osBranding';
import { OS_TOKENS } from '../desktop/osTokens';

export interface ScreenDesktopState {
  wallpaperTheme?: 'slate' | 'marina' | 'obsidian';
  workstationName?: string;
  simulationTime?: string;
  simulationDate?: string;
  activeWindowId?: string | null;
  activeAppTitle?: string;
  openWindows?: Array<{
    id: string;
    title: string;
    icon?: string;
    isActive?: boolean;
    isMinimized?: boolean;
    isMaximized?: boolean;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }>;
  terminalLines?: string[];
  cpuPercent?: number;
  ramUsage?: string;
  ipAddress?: string;
}

export interface ScreenRendererOptions {
  width?: number; // default 1280
  height?: number; // default 800
  fps?: number; // default 12 (10-15 fps requirement)
  emissiveIntensity?: number; // default 1.4 (1.2-1.6 requirement)
  accentColor?: number;
}

/**
 * ScreenRenderer renders a high-fidelity 1280x800 representation of Orion OS
 * onto a dynamic Three.js canvas texture with SRGBColorSpace, mipmaps,
 * 8x anisotropy, and emissive lighting.
 *
 * Visually identical to the DOM DesktopShell:
 * - Top panel with Applications, Places, System menus, launchers, running windows strip, tray clock
 * - Left vertical desktop icons (Home, Trash, Terminal, Tools)
 * - Restyled dark GTK window frame with centered title and controls
 * - Signature two-line colored terminal prompt:
 *   ┌─[tade@Orion-ws04]─[~]
 *   └──╼ $
 * - Procedural circuit & node background
 */
export class ScreenRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private texture: THREE.CanvasTexture;
  private material: THREE.MeshStandardMaterial;

  private width: number;
  private height: number;
  private targetFps: number;
  private frameInterval: number;
  private timeSinceLastDraw = 0;
  private isVisible = true;
  private isDirty = true;
  private blinkTimer = 0;
  private wallpaperImage: HTMLImageElement | null = null;
  private isWallpaperLoaded = false;

  private state: ScreenDesktopState = {
    wallpaperTheme: 'slate',
    workstationName: 'Cedarline Marina Tower // SOC Staging',
    simulationTime: '08:00 AM',
    openWindows: [{ id: 'terminal', title: `${OS_NAME} Terminal`, icon: 'terminal' }],
    terminalLines: [
      `${OS_BRANDING.bannerHeader}`,
      `Kernel: Linux ${KERNEL_STRING} // Node: 10.0.4.15`,
      'Safety Boundary: 100% simulated sandbox. Zero host execution.',
      '',
      "Type 'help' to view available simulated commands.",
    ],
    cpuPercent: 12,
    ramUsage: '2.4 / 16 GB',
    ipAddress: '10.0.4.15',
  };

  constructor(options: ScreenRendererOptions = {}) {
    this.width = options.width ?? 1280;
    this.height = options.height ?? 800;
    this.targetFps = options.fps ?? 12;
    this.frameInterval = 1 / this.targetFps;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');

    // High fidelity texture configuration
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    // Load custom high-resolution Orion OS security wallpaper
    if (typeof Image !== 'undefined') {
      const img = new Image();
      img.onload = () => {
        this.wallpaperImage = img;
        this.isWallpaperLoaded = true;
        this.isDirty = true;
      };
      img.src = '/assets/os/Orion_security_wallpaper.jpg';
    }

    // Emissive screen material
    const emissiveIntensity = options.emissiveIntensity ?? 1.4;
    this.material = new THREE.MeshStandardMaterial({
      map: this.texture,
      emissiveMap: this.texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity,
      roughness: 0.25,
      metalness: 0.1,
      toneMapped: false,
      side: THREE.DoubleSide,
    });

    this.render();
  }

  public getMaterial(): THREE.MeshStandardMaterial {
    return this.material;
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public setVisible(visible: boolean): void {
    if (this.isVisible !== visible) {
      this.isVisible = visible;
      if (visible) {
        this.isDirty = true;
      }
    }
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public updateDesktopState(newState: Partial<ScreenDesktopState>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.isDirty = true;
  }

  public setTerminalLines(lines: string[]): void {
    // Keep last 15 lines as required
    this.state.terminalLines = lines.slice(-15);
    this.isDirty = true;
  }

  public update(deltaTime: number): void {
    this.timeSinceLastDraw += deltaTime;
    this.blinkTimer += deltaTime;

    // Redraw if visible and interval elapsed or state is dirty
    if (this.isVisible && (this.timeSinceLastDraw >= this.frameInterval || this.isDirty)) {
      this.timeSinceLastDraw = 0;
      this.isDirty = false;
      this.render();
    }
  }

  private render(): void {
    if (this.ctx) {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // 1. Procedural wallpaper (obsidian to teal gradient with circuit traces)
      this.drawWallpaper(ctx, w, h);

      // 2. Left vertical desktop icons
      this.drawDesktopIcons(ctx);

      // 3. Central Terminal Window with Orion OS chrome & two-line prompt
      this.drawTerminalWindow(ctx, w, h);

      // 4. Orion OS Top Panel (Applications / Places / System / Launchers / Windows / Tray Clock)
      this.drawTopPanel(ctx, w);

      // 5. Thin bottom workspace pager strip
      this.drawBottomStrip(ctx, w, h);
    }

    this.texture.needsUpdate = true;
  }

  private drawWallpaper(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // If high-resolution wallpaper is loaded, draw it directly
    if (this.isWallpaperLoaded && this.wallpaperImage) {
      ctx.drawImage(this.wallpaperImage, 0, 0, w, h);
      return;
    }

    // Fallback: Procedural cybernetic background
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 100, w * 0.5, h * 0.5, w * 0.75);
    grad.addColorStop(0, '#122b3b');
    grad.addColorStop(0.45, '#0a1824');
    grad.addColorStop(0.85, '#040810');
    grad.addColorStop(1, '#020408');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Fine grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Stylized geometric circuit traces
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 140);
    ctx.lineTo(200, 140);
    ctx.lineTo(260, 200);
    ctx.lineTo(380, 200);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w - 100, h - 160);
    ctx.lineTo(w - 220, h - 160);
    ctx.lineTo(w - 280, h - 220);
    ctx.lineTo(w - 400, h - 220);
    ctx.stroke();

    // Central watermark emblem
    ctx.save();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.06)';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${OS_NAME.toUpperCase()} ${OS_VERSION}`, w * 0.5, h * 0.52);
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.fillText(`${KERNEL_STRING} // SYNTHETIC CYBER WORKSTATION`, w * 0.5, h * 0.56);
    ctx.restore();
  }

  private drawTopPanel(ctx: CanvasRenderingContext2D, w: number): void {
    const panelH = OS_TOKENS.panel.height;

    // Panel background
    ctx.fillStyle = 'rgba(12, 19, 31, 0.96)';
    ctx.fillRect(0, 0, w, panelH);

    // 1px bottom border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, panelH);
    ctx.lineTo(w, panelH);
    ctx.stroke();

    // OS Logo Icon
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(16, panelH / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Menus: Applications, Places, System
    ctx.font = '600 12px sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('Applications', 28, 19);

    ctx.font = '500 12px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Places', 116, 19);
    ctx.fillText('System', 166, 19);

    // Separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(222, 6);
    ctx.lineTo(222, 24);
    ctx.stroke();

    // Quick Launchers
    const launchers = [
      { label: '>_', col: '#00e5ff' },
      { label: '📝', col: '#cbd5e1' },
      { label: '📖', col: '#00e676' },
      { label: '⚙️', col: '#f59e0b' },
    ];
    launchers.forEach((l, idx) => {
      ctx.fillStyle = l.col;
      ctx.font = '11px monospace';
      ctx.fillText(l.label, 234 + idx * 26, 19);
    });

    // Separator
    ctx.beginPath();
    ctx.moveTo(344, 6);
    ctx.lineTo(344, 24);
    ctx.stroke();

    // Running Window Tab in panel
    ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(352, 4, 180, 22, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00e5ff';
    ctx.font = '11px monospace';
    ctx.fillText(`>_ ${OS_NAME} Terminal`, 362, 18);

    // Right Tray
    const timeStr = this.state.simulationTime ?? '08:00 AM';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(timeStr, w - 85, 19);

    // Network & Battery indicators
    ctx.fillStyle = '#00e676';
    ctx.font = '10px monospace';
    ctx.fillText('● 10.0.4.15', w - 160, 19);

    // Exit Button
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.beginPath();
    ctx.roundRect(w - 74, 4, 68, 22, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fca5a5';
    ctx.font = '600 11px sans-serif';
    ctx.fillText('Exit [Esc]', w - 14, 18);
    ctx.textAlign = 'left';
  }

  private drawDesktopIcons(ctx: CanvasRenderingContext2D): void {
    const icons = [
      { label: 'Home', color: '#00e5ff' },
      { label: 'Trash', color: '#94a3b8' },
      { label: 'Terminal', color: '#00e5ff' },
      { label: 'Packet Lens', color: '#38bdf8' },
      { label: 'Rev Lens', color: '#a855f7' },
      { label: 'Rule Tuner', color: '#f59e0b' },
      { label: 'Incident Desk', color: '#ef4444' },
      { label: 'Field Guide', color: '#00e676' },
    ];

    let startY = 44;
    icons.forEach(icon => {
      // Rounded icon container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, startY, 40, 40, 6);
      ctx.fill();
      ctx.stroke();

      // Stylized icon mark
      ctx.fillStyle = icon.color;
      ctx.beginPath();
      ctx.arc(36, startY + 20, 6, 0, Math.PI * 2);
      ctx.fill();

      // Text label with dark shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#f8fafc';
      ctx.font = '500 11px sans-serif';
      ctx.fillText(icon.label, 64, startY + 24);
      ctx.restore();

      startY += 52;
    });
  }

  private drawTerminalWindow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Window bounds
    const winX = 180;
    const winY = 46;
    const winW = w - 200;
    const winH = h - 76;

    // Window shadow & main body (hacker pure black)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 6);
    ctx.fill();
    ctx.restore();

    // 1px Window border (hacker green)
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 6);
    ctx.stroke();

    // Title bar
    const titleH = 32;
    const titleGrad = ctx.createLinearGradient(winX, winY, winX, winY + titleH);
    titleGrad.addColorStop(0, '#0c180c');
    titleGrad.addColorStop(1, '#040804');
    ctx.fillStyle = titleGrad;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, titleH, [6, 6, 0, 0]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 102, 0.15)';
    ctx.beginPath();
    ctx.moveTo(winX, winY + titleH);
    ctx.lineTo(winX + winW, winY + titleH);
    ctx.stroke();

    // Left titlebar icon
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('>_', winX + 12, winY + 20);

    // Centered Title Text
    ctx.save();
    ctx.fillStyle = '#00ff66';
    ctx.font = '600 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${OS_NAME} Terminal`, winX + winW / 2, winY + 20);
    ctx.restore();

    // Window Controls (right side GTK buttons: _, □, ✕)
    const ctrlX = winX + winW - 68;
    const ctrlY = winY + 7;
    ['_', '□', '✕'].forEach((symbol, idx) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(ctrlX + idx * 20, ctrlY, 18, 18, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = symbol === '✕' ? '#f87171' : '#00aa44';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(symbol, ctrlX + idx * 20 + 9, ctrlY + 13);
      ctx.textAlign = 'left';
    });

    // Sub-tab header strip
    const subTabY = winY + titleH;
    ctx.fillStyle = '#050a05';
    ctx.fillRect(winX + 1, subTabY, winW - 2, 24);
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.12)';
    ctx.beginPath();
    ctx.moveTo(winX + 1, subTabY + 24);
    ctx.lineTo(winX + winW - 1, subTabY + 24);
    ctx.stroke();

    // Active tab
    ctx.fillStyle = '#000000';
    ctx.fillRect(winX + 6, subTabY + 2, 120, 22);
    ctx.fillStyle = '#00ff66';
    ctx.font = '11px monospace';
    ctx.fillText('bash: ~', winX + 16, subTabY + 16);

    // Terminal Buffer Content
    let lineY = subTabY + 44;
    const lineHeight = 22;
    ctx.font = '13px monospace';

    const lines = this.state.terminalLines ?? [];
    lines.slice(-10).forEach(line => {
      if (line.startsWith(OS_NAME.toUpperCase()) || line.includes('Orion OS')) {
        ctx.fillStyle = '#00ff66';
      } else if (line.startsWith('[OK]') || line.startsWith('[SUCCESS]')) {
        ctx.fillStyle = '#00ff66';
      } else if (line.startsWith('[WARN]')) {
        ctx.fillStyle = '#facc15';
      } else if (line.startsWith('[ERROR]')) {
        ctx.fillStyle = '#ef4444';
      } else {
        ctx.fillStyle = '#00ff66';
      }
      ctx.fillText(line, winX + 16, lineY);
      lineY += lineHeight;
    });

    // Signature Two-Line Terminal Prompt (Green on Black)
    const host = HOSTNAMES.office;
    // Line 1: ┌─[tade@Orion-ws04]─[~]
    ctx.fillStyle = '#00aa44';
    ctx.fillText('┌─[', winX + 16, lineY);
    ctx.fillStyle = '#00ff66';
    ctx.fillText('tade', winX + 40, lineY);
    ctx.fillStyle = '#39ff14';
    ctx.fillText(`@${host}`, winX + 70, lineY);
    ctx.fillStyle = '#00aa44';
    const hostOffset = 70 + host.length * 8;
    ctx.fillText(']─[', winX + hostOffset, lineY);
    ctx.fillStyle = '#00e575';
    ctx.fillText('~', winX + hostOffset + 24, lineY);
    ctx.fillStyle = '#00aa44';
    ctx.fillText(']', winX + hostOffset + 32, lineY);
    lineY += lineHeight;

    // Line 2: └──╼ $
    ctx.fillStyle = '#00aa44';
    ctx.fillText('└──╼ ', winX + 16, lineY);
    ctx.fillStyle = '#00ff66';
    ctx.fillText('$ ', winX + 54, lineY);

    // Blinking Block Cursor
    const isBlinkOn = Math.floor(this.blinkTimer * 2) % 2 === 0;
    if (isBlinkOn) {
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(winX + 70, lineY - 11, 8, 14);
    }
  }

  private drawBottomStrip(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const stripH = 22;
    const stripY = h - stripH;

    ctx.fillStyle = 'rgba(8, 12, 20, 0.94)';
    ctx.fillRect(0, stripY, w, stripH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, stripY);
    ctx.lineTo(w, stripY);
    ctx.stroke();

    // Workspace indicators
    ctx.font = '10px monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('[1]', 12, stripY + 15);
    ctx.fillStyle = '#64748b';
    ctx.fillText(' 2   3   4', 32, stripY + 15);

    // Right status
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('Orion OS Sandbox // Lagos Station 04', w - 12, stripY + 15);
    ctx.textAlign = 'left';
  }

  public dispose(): void {
    if (this.texture) {
      this.texture.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    this.ctx = null;
  }
}
