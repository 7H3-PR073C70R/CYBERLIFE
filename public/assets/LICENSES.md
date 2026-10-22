# Asset Licenses & Attribution Log

This log documents all 3D models, textures, audio, and visual assets shipped with Cyberlife, ensuring strict adherence to open-source and Creative Commons licensing.

---

## Shipped 3D Models (`public/assets/props/`)

| Asset Name | Local File Path | Author / Source | Source URL | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Desk** | `public/assets/props/desk.glb` | Poly Haven | https://polyhaven.com/a/metal_office_desk | **CC0 (Public Domain)** | 2026-10-19 | Converted to WebP textures, meshopt compressed |
| **Ergonomic Chair** | `public/assets/props/chair.glb` | Cyberlife Team | https://github.com/7H3-PR073C70R/CYBERLIFE | **CC0 (Public Domain)** | 2026-10-19 | Ergonomic mesh chair with `SEAT_ANCHOR`, PBR chrome/mesh |
| **Computer Rig** | `public/assets/props/computer.glb` | Poly Haven & Cyberlife | https://polyhaven.com/a/classic_laptop | **CC0 (Public Domain)** | 2026-10-19 | Injected `SCREEN_QUAD`, `KEYBOARD_ANCHOR`, `MOUSE_ANCHOR` |
| **Desk Accessories** | `public/assets/props/props_desk.glb` | Poly Haven | https://polyhaven.com/models | **CC0 (Public Domain)** | 2026-10-19 | Combined lamp, stationery, notepads, circuit board, mug |
| **Platform Bed** | `public/assets/props/room_bed.glb` | Poly Haven | https://polyhaven.com/a/vintage_day_bed | **CC0 (Public Domain)** | 2026-10-19 | Daybed with mattress, WebP & meshopt optimized |
| **Drawer Cabinet** | `public/assets/props/room_cabinet.glb` | Poly Haven | https://polyhaven.com/a/drawer_cabinet | **CC0 (Public Domain)** | 2026-10-19 | Wooden drawer cabinet for bedroom dressing |
| **Bookshelf** | `public/assets/props/room_bookshelf.glb` | Poly Haven | https://polyhaven.com/a/wooden_bookshelf_worn | **CC0 (Public Domain)** | 2026-10-19 | Worn wooden shelf with technical books |
| **Inverter / UPS** | `public/assets/props/room_inverter.glb` | Poly Haven | https://polyhaven.com/a/power_box_01 | **CC0 (Public Domain)** | 2026-10-19 | Industrial electrical power box as Lagos inverter |
| **Ceiling Fan** | `public/assets/props/room_fan.glb` | Poly Haven | https://polyhaven.com/a/ceiling_fan | **CC0 (Public Domain)** | 2026-10-19 | 4-blade ceiling fan for room cooling |
| **Air Conditioner** | `public/assets/props/room_ac.glb` | Poly Haven | https://polyhaven.com/a/exterior_aircon_unit | **CC0 (Public Domain)** | 2026-10-19 | Wall-mounted split AC unit |
| **Framed Art** | `public/assets/props/room_art.glb` | Poly Haven | https://polyhaven.com/a/hanging_picture_frame_01 | **CC0 (Public Domain)** | 2026-10-19 | Framed wall photograph |
| **Electric Cables** | `public/assets/props/room_cables.glb` | Poly Haven | https://polyhaven.com/a/modular_electric_cables | **CC0 (Public Domain)** | 2026-10-19 | Baseboard power cable runs & wall socket clutter |

---

## Shipped Rigged Character Models & Animations (`public/assets/characters/`)

| Asset Name | Local File Path | Author / Source | Source URL | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Player Male Character** | `public/assets/characters/player_male.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, free for use in projects; raw assets not redistributed | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, MeshStandardMaterial PBR, 2048 WebP textures, simplified under 40k triangles, meshopt compressed |
| **Player Female Character** | `public/assets/characters/player_female.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, free for use in projects; raw assets not redistributed | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, MeshStandardMaterial PBR, 2048 WebP textures, hair/eyelash MASK depth-tested, simplified under 40k triangles, meshopt compressed |
| **Pedestrian Male 2** | `public/assets/characters/ped_male_2.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, free for use in projects; raw assets not redistributed | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, MeshStandardMaterial PBR, 1024 WebP textures, simplified under 25k triangles (24,694), meshopt compressed |
| **Pedestrian Female 2** | `public/assets/characters/ped_female_2.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, free for use in projects; raw assets not redistributed | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, MeshStandardMaterial PBR, 1024 WebP textures, hair/eyelash MASK depth-tested, simplified under 25k triangles (24,429), meshopt compressed |
| **Rigged Character Animations** | `public/assets/characters/animations.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, free for use in projects; raw assets not redistributed | 2026-10-20 | Merged 7 clips (Idle, Walk, Run, SitIdle, Typing, StandToSit, SitToStand); root motion stripped from Walk and Run; hip height/offsets preserved for seated clips; resampled and meshopt compressed |

---

## Shipped PBR Textures (`public/assets/environment/textures/`)

| Texture Name | Local Directory | Source | Source URL | License | Resolution | Maps Included |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Ceramic Floor Tiles** | `public/assets/environment/textures/floor_tiles_06/` | Poly Haven | https://polyhaven.com/a/floor_tiles_06 | **CC0** | 1024×1024 | Diffuse, Normal, ARM |
| **Painted Plaster Wall** | `public/assets/environment/textures/painted_plaster_wall/` | Poly Haven | https://polyhaven.com/a/painted_plaster_wall | **CC0** | 1024×1024 | Diffuse, Normal, ARM |
| **Ceiling Plaster** | `public/assets/environment/textures/white_plaster_02/` | Poly Haven | https://polyhaven.com/a/white_plaster_02 | **CC0** | 1024×1024 | Diffuse, Normal, ARM |

---

## UI Icons, Fonts & Graphics (`src/presentation/desktop/`)

| Asset Name | Local File Path | Author / Source | Source URL | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lucide Icon SVGs** | `src/presentation/desktop/icons/OsIcons.tsx` | Lucide Project Authors | https://lucide.dev | **ISC License** | 2026-10-20 | Clean bundled inline vector components; zero external network requests |
| **Inter UI Font** | Bundled / System fallback | Rasmus Andersson | https://rsms.me/inter/ | **SIL Open Font License 1.1** | 2026-10-20 | Bundled sans-serif typography |
| **JetBrains Mono** | Bundled / System fallback | JetBrains | https://www.jetbrains.com/lp/mono/ | **SIL Open Font License 1.1** | 2026-10-20 | Terminal monospace typography |
| **Orion OS Wallpaper** | `src/presentation/desktop/wallpaper.ts` | Cyberlife Team | Original procedural vector code | **CC0 (Public Domain)** | 2026-10-20 | Procedural SVG radial gradient with circuit trace geometry |

---

## License Texts & Declarations

### Creative Commons Zero 1.0 Universal (CC0 1.0)
The persons who associated work with this deed have dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law. You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

### ISC License (Lucide Icons)
Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

### SIL Open Font License 1.1 (Inter, JetBrains Mono)
This Font Software is licensed under the SIL Open Font License, Version 1.1. The fonts, accompanying code, and documentation may be bundled, redistributed, and/or sold with any software, provided that no individual font may be sold by itself.

---

## Pre-rendered Voice Audio & Neural Voice Synthesis (`public/assets/audio/voice/`)

All NPC spoken dialogue and VoIP call audio lines are pre-rendered into static `.mp3` audio files via build script (`scripts/generate-voice.mjs`) and indexed via `manifest.json`. No dynamic external API calls or network requests are performed during runtime gameplay.

| Voice Model Name | Language / Locale | Accent / Persona | Provider / Engine | License / Terms | Generation Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **en-NG-EzinneNeural** | English (Nigeria, `en-NG`) | Female Nigerian (Blessing, Goodness, Mama Esther) | Microsoft Azure Cognitive Services Speech | Microsoft Azure Cognitive Services Terms of Service / Neural Voice Usage Terms | 2026-10-21 | Pre-rendered static MP3 dialogue clips; custom prosody (+0% to +3% rate, pitch shifts) |
| **en-NG-AbeoNeural** | English (Nigeria, `en-NG`) | Male Nigerian (Barry, Michael, Uncle Segun, Tsharp, Cipher) | Microsoft Azure Cognitive Services Speech | Microsoft Azure Cognitive Services Terms of Service / Neural Voice Usage Terms | 2026-10-21 | Pre-rendered static MP3 dialogue clips; custom prosody (-7% to +5% rate, pitch shifts) |
| **en-US-JennyNeural** | English (United States, `en-US`) | Female (Mercy, External Auditor) | Microsoft Azure Cognitive Services Speech | Microsoft Azure Cognitive Services Terms of Service / Neural Voice Usage Terms | 2026-10-21 | Pre-rendered static MP3 dialogue clips |
| **en-US-ChristopherNeural** | English (United States, `en-US`) | Synthetic / Flat Neutral (Aster SIEM Bot) | Microsoft Azure Cognitive Services Speech | Microsoft Azure Cognitive Services Terms of Service / Neural Voice Usage Terms | 2026-10-21 | Pre-rendered static MP3 dialogue clips; flat rate/pitch for autonomous IDS telemetry engine |

### Microsoft Azure Cognitive Services Speech / Neural Voice Terms Note
Audio files in `public/assets/audio/voice/` are pre-generated using Microsoft Cognitive Services Speech neural voice models (`en-NG-EzinneNeural`, `en-NG-AbeoNeural`, `en-US-JennyNeural`, `en-US-ChristopherNeural`) under Microsoft Cognitive Services terms. In development environments without Azure API keys, `edge-tts` provides an offline fallback for testing. All output is strictly pre-rendered and distributed as static assets within the game bundle.

