import * as THREE from 'three';

export interface ScreenDesktopState {
  wallpaperTheme?: 'slate' | 'marina' | 'obsidian';
  workstationName?: string;
  simulationTime?: string;
  simulationDate?: string;
  activeAppTitle?: string;
  openWindows?: Array<{ id: string; title: string; isActive: boolean }>;
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
 * ScreenRenderer renders a high-fidelity 1280x800 representation of the EkoSec OS
 * desktop onto a dynamic Three.js canvas texture with SRGBColorSpace, mipmaps,
 * 8x anisotropy, and emissive lighting.
 *
 * Throttles redraws to 10-15 fps and pauses when off-screen.
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

  private state: ScreenDesktopState = {
    wallpaperTheme: 'slate',
    workstationName: 'Cedarline Marina Tower // SOC Staging',
    simulationTime: '08:00 AM',
    openWindows: [{ id: 'terminal', title: 'bash - sandboxed', isActive: true }],
    terminalLines: [
      'tade@ekosec-ws04:~$ uname -a',
      'Linux cyberlife 6.8.0-parrot-enterprise x86_64',
      'tade@ekosec-ws04:~$ status',
      '[OK] 10.0.4.15/24 SYNTHETIC NODE READY',
      'tade@ekosec-ws04:~$ _',
    ],
    cpuPercent: 14,
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

    // Only redraw if visible and frame interval has elapsed
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

      // 1. Wallpaper background
      this.drawWallpaper(ctx, w, h);

      // 2. Top System Status Bar
      this.drawTopBar(ctx, w);

      // 3. Desktop Shortcuts on Left
      this.drawDesktopIcons(ctx);

      // 4. Central Terminal Window with last ~15 lines
      this.drawTerminalWindow(ctx, w, h);

      // 5. Bottom Taskbar
      this.drawTaskbar(ctx, w, h);
    }

    this.texture.needsUpdate = true;
  }

  private drawWallpaper(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const theme = this.state.wallpaperTheme ?? 'slate';
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 80, w * 0.5, h * 0.5, w * 0.8);

    if (theme === 'marina') {
      grad.addColorStop(0, '#0c2236');
      grad.addColorStop(0.6, '#061320');
      grad.addColorStop(1, '#02060b');
    } else if (theme === 'obsidian') {
      grad.addColorStop(0, '#1a1f26');
      grad.addColorStop(0.6, '#0d1117');
      grad.addColorStop(1, '#05070a');
    } else {
      // Slate default
      grad.addColorStop(0, '#1c2838');
      grad.addColorStop(0.6, '#0f1724');
      grad.addColorStop(1, '#060a10');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle technical grid
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

    // Watermark branding
    ctx.save();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.06)';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EKOSEC LINUX 2026', w * 0.5, h * 0.52);
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.fillText('ISOLATED SANDBOX // LIVE PHYSICAL SCREEN', w * 0.5, h * 0.57);
    ctx.restore();
  }

  private drawTopBar(ctx: CanvasRenderingContext2D, w: number): void {
    const barHeight = 40;
    ctx.fillStyle = 'rgba(4, 7, 12, 0.94)';
    ctx.fillRect(0, 0, w, barHeight);

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barHeight);
    ctx.lineTo(w, barHeight);
    ctx.stroke();

    // OS Badge
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('🦅 EKOSEC OS 2026', 16, 25);

    // Workstation Tag
    ctx.fillStyle = '#64748b';
    ctx.font = '13px monospace';
    ctx.fillText(this.state.workstationName ?? 'Workstation', 210, 25);

    // Middle stats
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    const cpu = this.state.cpuPercent ?? 14;
    const ram = this.state.ramUsage ?? '2.4 / 16 GB';
    const ip = this.state.ipAddress ?? '10.0.4.15';
    ctx.fillText(`CPU: ${cpu}%   RAM: ${ram}   NET: ${ip}`, 540, 25);

    // Time Clock
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(this.state.simulationTime ?? '08:00 AM', w - 24, 25);
    ctx.textAlign = 'left';
  }

  private drawDesktopIcons(ctx: CanvasRenderingContext2D): void {
    const icons = [
      { label: 'Terminal', color: '#00e5ff' },
      { label: 'Packet Lens', color: '#38bdf8' },
      { label: 'Rev Lens', color: '#a855f7' },
      { label: 'Rule Tuner', color: '#f59e0b' },
      { label: 'Incident Desk', color: '#ef4444' },
      { label: 'Field Guide', color: '#10b981' },
    ];

    let startY = 64;
    icons.forEach(icon => {
      // Icon square
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(24, startY, 44, 44, 8);
      ctx.fill();
      ctx.stroke();

      // Dot accent
      ctx.fillStyle = icon.color;
      ctx.beginPath();
      ctx.arc(46, startY + 22, 7, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px sans-serif';
      ctx.fillText(icon.label, 80, startY + 26);

      startY += 62;
    });
  }

  private drawTerminalWindow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Window bounds
    const winX = 220;
    const winY = 60;
    const winW = w - 260;
    const winH = h - 130;

    // Window shadow & body
    ctx.fillStyle = 'rgba(5, 9, 15, 0.96)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 10);
    ctx.fill();
    ctx.stroke();

    // Title bar
    const titleH = 34;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, titleH, [10, 10, 0, 0]);
    ctx.fill();

    // Window control buttons (red, yellow, green)
    const dotY = winY + titleH / 2;
    const colors = ['#ef4444', '#f59e0b', '#10b981'];
    colors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(winX + 18 + idx * 16, dotY, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Window title
    ctx.fillStyle = '#38bdf8';
    ctx.font = '13px monospace';
    ctx.fillText('bash - cyberlife@parrot-sec-ws04: ~ (sandboxed)', winX + 75, dotY + 4);

    // Terminal Lines (last ~15 lines)
    const lines = this.state.terminalLines ?? [];
    const displayLines = lines.slice(-15);
    const lineHeight = 28;
    let lineY = winY + titleH + 28;

    ctx.font = '16px "Fira Code", monospace';

    displayLines.forEach(line => {
      if (line.startsWith('tade@') || line.includes('~$')) {
        ctx.fillStyle = '#00e5ff';
      } else if (line.startsWith('[OK]') || line.startsWith('[SUCCESS]')) {
        ctx.fillStyle = '#00e676';
      } else if (line.startsWith('[WARN]') || line.startsWith('[ERROR]')) {
        ctx.fillStyle = '#f87171';
      } else {
        ctx.fillStyle = '#94a3b8';
      }
      ctx.fillText(line, winX + 20, lineY);
      lineY += lineHeight;
    });

    // Blinking cursor if last line didn't end with cursor
    const isBlinkOn = Math.floor(this.blinkTimer * 2) % 2 === 0;
    if (isBlinkOn && lineY < winY + winH - 10) {
      ctx.fillStyle = '#00e676';
      ctx.fillRect(winX + 20, lineY - 14, 10, 18);
    }
  }

  private drawTaskbar(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const taskbarH = 44;
    const taskbarY = h - taskbarH;

    ctx.fillStyle = 'rgba(6, 10, 16, 0.96)';
    ctx.fillRect(0, taskbarY, w, taskbarH);

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, taskbarY);
    ctx.lineTo(w, taskbarY);
    ctx.stroke();

    // Start Button
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(12, taskbarY + 6, 110, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('⚡ EkoSec', 26, taskbarY + 26);

    // Active Tab Item
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.beginPath();
    ctx.roundRect(132, taskbarY + 6, 170, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px monospace';
    ctx.fillText('💻 Terminal (Active)', 146, taskbarY + 26);

    // Tray Clock
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(this.state.simulationTime ?? '08:00 AM', w - 16, taskbarY + 26);
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
