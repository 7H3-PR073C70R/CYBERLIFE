# Desktop OS Visual Reference & Redesign Specification

## 1. Design Vision & Architectural Inspiration
The in-game virtual workstation is being upgraded from an ad-hoc desktop mockup into an authentic, highly usable Linux cybersecurity workstation desktop environment. 

The aesthetic is inspired by classical security distributions (specifically Parrot Security OS and Debian/MATE desktop environments), but with **100% original identity, zero copied artwork, no bird logos, and no trademarked assets**.

---

## 2. Desktop Environment Breakdown (MATE/GTK Classical Paradigm)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Applications ▾] [Places ▾] [System ▾]  [💻] [📁] [📖] | [Terminal (Active)] [Notes] | 🌐 🔊 12:00 PM [Protector ⏻] │ Top Panel (30px)
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│ [📁 Home]                                                                                        │
│                                      ┌────────────────────────────────────────────────────┐      │
│ [💻 Terminal]                         │ ── □ ✕  bash - protector@Orion-ws04: ~ (sandboxed)  │      │ Window Frame
│                                      ├────────────────────────────────────────────────────┤      │ (Dark GTK Style)
│ [🛡️ Field Guide]                     │ ┌─[protector@Orion-ws04]─[~]                       │      │
│                                      │ └──╼ $ uname -a                                    │      │
│ [⚙️ SysInfo]                         │ Linux cyberlife 6.8.0-Orion x86_64                 │      │
│                                      │ ┌─[protector@Orion-ws04]─[~]                       │      │
│ [🗑️ Trash]                           │ └──╼ $ █                                           │      │
│                                      └────────────────────────────────────────────────────┘      │
│                                                                                                  │
│                                                                                                  │
│  [Deep Obsidian/Teal Procedural Geometric Circuit Wallpaper]                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### A. Top System Panel (30px height, fixed top)
- **Left Control Menus:**
  - **Applications Menu (`Applications ▾`):** Organized hierarchical dropdown categories:
    - *Cybersecurity / Arsenal*: Terminal, Network Map / Packet Lens, Binary Analyzer / Rev Lens, Snort / Rule Tuner, Incident Desk.
    - *Accessories*: Notes, Text Editor, Calculator.
    - *Documentation*: Field Guide, System Info.
  - **Places Menu (`Places ▾`):** Quick filesystem shortcuts:
    - `Home Folder` (`/home/protector`)
    - `Desktop` (`/home/protector/Desktop`)
    - `Documents` (`/home/protector/Documents`)
    - `Downloads` (`/home/protector/Downloads`)
    - `Network Shares` (`smb://cedarline.internal`)
  - **System Menu (`System ▾`):**
    - `System Information`
    - `Lock Screen` (cosmetic lock overlay)
    - `Exit Workstation` (stands player up, returning to 3D world)
- **Quick Launchers:**
  - One-click launcher icons for Terminal, Notes, Field Guide, System Info.
- **Window List Strip:**
  - Displays currently open window tabs in the panel (with icon, active highlight, click to focus/minimize).
- **Right Status Tray:**
  - Network Indicator (IP status: `10.0.4.15`), Audio / Volume slider popup, Battery / AC status, Simulation Clock (read-only live sync from `CalendarAndTime`), and User Profile with Power menu (`Stand Up / Exit`).

### B. Window Chrome (`WindowFrame.tsx`)
- **Header:** Dark slate titlebar (`#0f172a`), centered crisp title typography, 1px border (`#1e293b`).
- **Controls:** Classical 3-button window controls on top right (`─`, `□`, `✕` for minimize, maximize/restore, close).
- **State Styling:** Clear visual distinction between focused and unfocused windows (reduced opacity & shadow when inactive).
- **Interactions:** Draggable by titlebar, double-click title to maximize, snap to left/right halves and top full-screen.

### C. Signature Two-Line Terminal Prompt (`TerminalApp.tsx`)
- Signature cybersecurity two-line prompt:
  ```text
  ┌─[protector@Orion-ws04]─[~]
  └──╼ $ whoami
  protector
  ┌─[protector@Orion-ws04]─[~]
  └──╼ $ █
  ```
- **Line 1 (`┌─[...]─[...]`):** Bracketed user@host in teal/cyan (`#00e5ff`), path in slate/cyan (`#38bdf8`).
- **Line 2 (`└──╼ $ `):** Input prompt with immediate inline command input and blinking block cursor.
- **Features:** Command history (Up/Down arrows), tab completion, clear shortcut (`Ctrl+L`), cancel current command (`Ctrl+C`), syntax-highlighted tool output.

### D. Original Vector Wallpaper
- 100% original procedural SVG/Canvas wallpaper.
- Gradient: Deep obsidian `#050811` into cybernetic slate `#0d1824`.
- Grid: Subtle isometric circuit grid with cyan trace nodes (`rgba(0, 229, 255, 0.05)`).
- Watermark: Subtle branded technical watermark (`Orion OS 4.5 // CYBERLIFE ENTERPRISE`).

---

## 3. Reference Visual Links
For review and inspiration on the MATE / classical security distro layout:
- [Parrot OS MATE Desktop Interface (Wikimedia Commons)](https://commons.wikimedia.org/wiki/File:Parrot_OS_Home_5.0_Desktop.png)
- [MATE Desktop Environment Standard Panel Layout](https://mate-desktop.org/)
- [Classical Two-Line Bash Prompt in Security Terminals](https://github.com/cyfrost/parrot-bash-prompt)

*Note: All graphics, SVGs, icons, and themes in Cyberlife are original implementations and do not use copyrighted assets from Parrot Security or any commercial distribution.*
