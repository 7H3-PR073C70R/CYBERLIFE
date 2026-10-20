# Workstation & Lagos Apartment 3D Asset Shopping List (Stage A)

## 1. Overview & Room Architecture

This document defines the asset specifications, spatial scales, poly budgets, licensing constraints, and acquisition paths for replacing the procedural placeholder workstation and bare room geometry with realistic, physically based (PBR) 3D assets.

### Cultural & Visual Context: Broad Street, Lagos Island
The scene represents an independent cybersecurity researcher / penetration tester's lived-in apartment on Broad Street, Lagos Island. Key environmental hallmarks include:
- **Hybrid Power Infrastructure:** Frequent grid load-shedding means an essential floor inverter/UPS battery box, cable management, and battery-buffered computing gear.
- **Cooling Realities:** High tropical humidity and heat make an oscillating pedestal fan (the ubiquitous Nigerian "Ox" / standing fan), ceiling fan, and wall AC unit central visual elements.
- **Floor & Wall Finishes:** Glossy/semi-matte ceramic floor tiling with grout lines and painted plaster walls with subtle trowel marks and weathering.
- **Hacker Workspace:** Lived-in desk with hardware breadboards/circuit boards, sticky notes, technical stationery, coffee mug, and cable runs.

---

## 2. Computer Setup Recommendation & Technical Rationale

**Selected Configuration: Laptop on Elevated Stand + 1 External 27-inch Monitor**  
*(Equipped with an external mechanical keyboard, optical mouse, desk mat, and over-ear headphones)*

### Rationale
1. **Lagos Context & Narrative Authenticity:** In Nigerian tech hubs (Yaba, Lagos Island, Victoria Island), power fluctuations make desktop towers without massive battery banks risky. Every cybersecurity analyst and software engineer works on a high-spec laptop (MacBook Pro / ThinkPad / Dell XPS) running on battery buffer, paired with an external 27-inch high-resolution monitor for primary terminal/SIEM analysis.
2. **Seamless Camera & Screen Integration:** Cyberlife's `deriveCameraScreen()` math and `WorkstationCameraStates` are tuned for a 16:10 / 16:9 display. Placing the external 27" monitor directly in front of the seated camera provides a sharp, zero-distortion target for the `SCREEN_FULLSCREEN` camera lock, while the adjacent elevated laptop display continuously runs secondary system logs.
3. **Asset Availability & Licensing:** Poly Haven provides the `classic_laptop` directly via public API under CC0. Pairing this with a standard 27" monitor provides the cleanest visual balance and poly distribution without cluttering the desk frame.

---

## 3. Comprehensive Asset Specification & Shopping Table

### A. Core Furniture (Hero Items)

| Item | Dimensions (W × D × H meters) | Poly Budget (Triangles) | Recommended Source | Exact Search Terms | Status / Acquisition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ergonomic Office Chair** | $0.65 \times 0.65 \times 1.05\,\text{m}$ (Seat: $0.48\text{--}0.52\,\text{m}$) | $15{,}000\text{--}45{,}000$ (Max $60\text{k}$) | **Sketchfab** (CC-BY or CC0) | `"stylish regular office chair"`, `"ergonomic mesh chair"`, `"office chair pbr"` | **User Download Needed** (See Candidate Links below) |
| **Technical Desk** | $1.50 \times 0.75 \times 0.74\,\text{m}$ | $5{,}000\text{--}20{,}000$ | **Poly Haven** (CC0) | `metal_office_desk` | **Downloaded via API** (`metal_office_desk.glb`, $1.53\,\text{MB}$) |

### B. Computer Rig & Peripherals

| Item | Dimensions (W × D × H meters) | Poly Budget (Triangles) | Recommended Source | Exact Search Terms | Status / Acquisition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Laptop** | $0.36 \times 0.25 \times 0.018\,\text{m}$ (Open: $0.22\,\text{m}$) | $8{,}000\text{--}18{,}000$ | **Poly Haven** (CC0) | `classic_laptop` | **Downloaded via API** (`classic_laptop.glb`, $2.08\,\text{MB}$) |
| **External 27" Monitor & Stand** | $0.61 \times 0.18 \times 0.44\,\text{m}$ | $6{,}000\text{--}15{,}000$ | **Sketchfab** (CC-BY / CC0) | `"computer monitor 27 inch"`, `"dell monitor pbr"`, `"pc monitor"` | **User Download Needed** |
| **Mechanical Keyboard** | $0.36 \times 0.14 \times 0.035\,\text{m}$ (TKL) | $5{,}000\text{--}15{,}000$ | **Sketchfab** (CC-BY / CC0) | `"mechanical keyboard pbr"`, `"gaming keyboard"` | **User Download Needed** |
| **Optical Mouse** | $0.065 \times 0.115 \times 0.038\,\text{m}$ | $2{,}000\text{--}6{,}000$ | **Sketchfab** (CC-BY / CC0) | `"optical mouse pbr"`, `"gaming mouse"` | **User Download Needed** |
| **Desk Mat** | $0.85 \times 0.40 \times 0.003\,\text{m}$ | $<500$ | Procedural / AmbientCG | Clean stitched neoprene texture | Generated / Integrated in code |
| **Over-Ear Headphones** | $0.18 \times 0.12 \times 0.22\,\text{m}$ | $8{,}000\text{--}18{,}000$ | **Sketchfab** (CC-BY / CC0) | `"studio headphones"`, `"wireless headphones pbr"` | **User Download Needed** |

### C. Desk Accessories & Hacker Props

| Item | Dimensions (W × D × H meters) | Poly Budget (Triangles) | Recommended Source | Exact Search Terms | Status / Acquisition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Articulated Desk Lamp** | $0.20 \times 0.45 \times 0.50\,\text{m}$ | $10{,}000\text{--}25{,}000$ | **Poly Haven** (CC0) | `desk_lamp_arm_01` | **Downloaded via API** (`desk_lamp_arm_01.glb`, $2.87\,\text{MB}$) |
| **Stationery & Pen Holder** | $0.12 \times 0.12 \times 0.15\,\text{m}$ | $3{,}000\text{--}8{,}000$ | **Poly Haven** (CC0) | `stationery_supplies` | **Downloaded via API** (`stationery_supplies.glb`, $1.89\,\text{MB}$) |
| **Technical Notebooks & Papers** | $0.16 \times 0.22 \times 0.03\,\text{m}$ | $1{,}500\text{--}5{,}000$ | **Poly Haven** (CC0) | `office_notepads` | **Downloaded via API** (`office_notepads.glb`, $1.26\,\text{MB}$) |
| **Hardware Circuit Board (Breadboard)** | $0.10 \times 0.15 \times 0.02\,\text{m}$ | $5{,}000\text{--}12{,}000$ | **Poly Haven** (CC0) | `circuit_board` | **Downloaded via API** (`circuit_board.glb`, $3.95\,\text{MB}$) |
| **Ceramic Coffee Mug** | $0.09 \times 0.12 \times 0.10\,\text{m}$ | $1{,}500\text{--}3{,}500$ | **Sketchfab** (CC0 / CC-BY) | `"coffee mug pbr"`, `"ceramic mug"` | **User Download Needed** |
| **Smartphone** | $0.075 \times 0.15 \times 0.009\,\text{m}$ | $2{,}000\text{--}5{,}000$ | **Sketchfab** (CC0 / CC-BY) | `"smartphone pbr"`, `"android phone"` | **User Download Needed** |
| **Power Strip with Cable Runs** | $0.07 \times 0.32 \times 0.04\,\text{m}$ | $3{,}000\text{--}8{,}000$ | **Sketchfab** / Poly Haven | `"power strip"`, `"extension lead"` | **User Download Needed** |
| **USB Flash Drive & Sticky Notes** | $0.02 \times 0.05 \times 0.01\,\text{m}$ | $<1{,}000$ | Procedural / Sketchfab | `"usb flash drive"`, `"sticky notes"` | Procedural / Integrated in code |

### D. Lagos Apartment Dressing

| Item | Dimensions (W × D × H meters) | Poly Budget (Triangles) | Recommended Source | Exact Search Terms | Status / Acquisition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Platform Bed with Mattress** | $1.20 \times 2.00 \times 0.55\,\text{m}$ | $15{,}000\text{--}30{,}000$ | **Poly Haven** (CC0) | `vintage_day_bed` | **Downloaded via API** (`vintage_day_bed.glb`, $2.31\,\text{MB}$) |
| **Wardrobe / Drawer Unit** | $0.95 \times 0.55 \times 1.25\,\text{m}$ | $4{,}000\text{--}12{,}000$ | **Poly Haven** (CC0) | `drawer_cabinet` | **Downloaded via API** (`drawer_cabinet.glb`, $1.09\,\text{MB}$) |
| **Bookshelf with Technical Volumes** | $0.90 \times 0.32 \times 1.80\,\text{m}$ | $6{,}000\text{--}15{,}000$ | **Poly Haven** (CC0) | `wooden_bookshelf_worn` | **Downloaded via API** (`wooden_bookshelf_worn.glb`, $2.65\,\text{MB}$) |
| **Inverter / Battery Backup Box** | $0.35 \times 0.40 \times 0.30\,\text{m}$ | $3{,}000\text{--}8{,}000$ | **Poly Haven** (CC0) | `power_box_01` | **Downloaded via API** (`power_box_01.glb`, $2.60\,\text{MB}$) |
| **Standing Pedestal Fan ("Ox" fan)** | $0.45 \times 0.45 \times 1.35\,\text{m}$ | $8{,}000\text{--}20{,}000$ | **Sketchfab** (CC-BY) | `"stand fan"`, `"pedestal fan"` | **User Download Needed** |
| **Ceiling Fan** | $1.20 \times 1.20 \times 0.35\,\text{m}$ | $4{,}000\text{--}10{,}000$ | **Poly Haven** (CC0) | `ceiling_fan` | **Downloaded via API** (`ceiling_fan.glb`, $1.78\,\text{MB}$) |
| **Air Conditioning Unit** | $0.85 \times 0.22 \times 0.30\,\text{m}$ | $4{,}000\text{--}10{,}000$ | **Poly Haven** (CC0) | `exterior_aircon_unit` | **Downloaded via API** (`exterior_aircon_unit.glb`, $7.31\,\text{MB}$) |
| **Water Dispenser (20L bottle cooler)**| $0.35 \times 0.35 \times 1.30\,\text{m}$ | $6{,}000\text{--}15{,}000$ | **Sketchfab** (CC-BY / CC0) | `"water dispenser"`, `"water cooler"` | **User Download Needed** |
| **Framed Wall Artwork** | $0.60 \times 0.04 \times 0.80\,\text{m}$ | $1{,}500\text{--}4{,}000$ | **Poly Haven** (CC0) | `hanging_picture_frame_01` | **Downloaded via API** (`hanging_picture_frame_01.glb`, $0.46\,\text{MB}$) |
| **Wall Socket & Cable Clutter** | Runs along baseboards | $5{,}000\text{--}15{,}000$ | **Poly Haven** (CC0) | `modular_electric_cables` | **Downloaded via API** (`modular_electric_cables.glb`, $5.70\,\text{MB}$) |
| **Window Curtains** | $1.60 \times 0.15 \times 2.20\,\text{m}$ | $4{,}000\text{--}10{,}000$ | **Sketchfab** (CC-BY) | `"window curtains"`, `"fabric curtains"`| **User Download Needed** |
| **Small Floor Rug** | $1.20 \times 1.80\,\text{m}$ | $<500$ | AmbientCG / Procedural | Woven fabric / carpet texture | Integrated via PBR material |

### E. Architectural Materials (1K PBR Textures)

| Surface | Resolution | Maps Required | Recommended Source | Asset Name | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Apartment Floor** | $1024 \times 1024$ | Diffuse, Normal, ARM | **Poly Haven** (CC0) | `floor_tiles_06` | **Downloaded via API** (`assets_incoming/workstation/textures/floor_tiles_06`) |
| **Plaster Walls** | $1024 \times 1024$ | Diffuse, Normal, ARM | **Poly Haven** (CC0) | `painted_plaster_wall` | **Downloaded via API** (`assets_incoming/workstation/textures/painted_plaster_wall`) |
| **Ceiling Plaster** | $1024 \times 1024$ | Diffuse, Normal, ARM | **Poly Haven** (CC0) | `white_plaster_02` | **Downloaded via API** (`assets_incoming/workstation/textures/white_plaster_02`) |

---

## 4. Candidate Links for User-Acquired Assets (Sketchfab)

For assets requiring manual download via free Sketchfab accounts (all verified CC-BY or CC0 licenses, downloadable in glTF / GLB format):

### 1. Ergonomic Office Chair
- **Option 1 (Recommended):** [Stylish Regular Office Chair by TheGiwi](https://sketchfab.com/3d-models/stylish-regular-office-chair-978bb53)
  - *License:* CC-BY
  - *Details:* 28k tris, 5-star base with wheels, lumbar support mesh, armrests.
- **Option 2:** [Office Chair by vertexcat](https://sketchfab.com/search?q=ergonomic+office+chair&type=models)
  - *License:* CC-BY / CC0
- *Target Local File:* `assets_incoming/workstation/chair.glb`

### 2. External 27" Monitor & Stand
- **Option 1 (Recommended):** [Computer Monitor by shedmon](https://sketchfab.com/search?q=computer+monitor&type=models)
  - *License:* CC-BY
  - *Details:* 6.5k tris, modern slim bezel, realistic desktop stand.
- *Target Local File:* `assets_incoming/workstation/monitor.glb`

### 3. Mechanical Keyboard & Mouse
- **Keyboard Option 1:** [Blue White Wavy Mechanical Keyboard by Rendy K](https://sketchfab.com/search?q=mechanical+keyboard&type=models)
  - *License:* CC-BY
- **Mouse Option 1:** [Optical Mouse by jimbro](https://sketchfab.com/search?q=optical+mouse+pbr&type=models)
  - *License:* CC-BY
- *Target Local Files:* `assets_incoming/workstation/keyboard.glb`, `assets_incoming/workstation/mouse.glb`

### 4. Over-Ear Headphones
- **Option 1 (Recommended):** [Wireless Headphones by Octaclee](https://sketchfab.com/search?q=wireless+headphones&type=models)
  - *License:* CC-BY
- *Target Local File:* `assets_incoming/workstation/headphones.glb`

### 5. Standing Pedestal Fan (Lagos "Ox" Fan)
- **Option 1 (Recommended):** [Stand Fan by Flighty Dreams](https://sketchfab.com/search?q=stand+fan&type=models)
  - *License:* CC-BY
  - *Details:* 16k tris, classic tall pedestal design, wire cage.
- *Target Local File:* `assets_incoming/workstation/standing_fan.glb`

### 6. Water Dispenser
- **Option 1 (Recommended):** [Water Dispenser by Sibghat Baloch](https://sketchfab.com/3d-models/water-dispenser-2070dba0f1b14fcd819a7783816c77ec)
  - *License:* CC-BY
  - *Details:* 8k tris, classic 20L inverted water bottle cooler.
- *Target Local File:* `assets_incoming/workstation/water_dispenser.glb`

### 7. Window Curtains, Mug, & Phone
- **Curtains:** [Curtains by vertexcat](https://sketchfab.com/search?q=curtains+pbr&type=models) -> `assets_incoming/workstation/curtains.glb`
- **Coffee Mug:** Standard PBR ceramic mug -> `assets_incoming/workstation/mug.glb`
- **Smartphone:** Modern bezel-less smartphone -> `assets_incoming/workstation/phone.glb`

---

## 5. Summary of Automated Downloads Completed

The automated downloader script (`scratch/download_polyhaven_assets.mjs`) has already fetched, validated, and packaged **14 models and 3 PBR texture sets** directly into `assets_incoming/workstation/`:

```
assets_incoming/workstation/
├── ceiling_fan.glb                 (1.78 MB, CC0)
├── circuit_board.glb               (3.95 MB, CC0)
├── classic_laptop.glb              (2.08 MB, CC0)
├── desk_lamp_arm_01.glb            (2.87 MB, CC0)
├── drawer_cabinet.glb              (1.09 MB, CC0)
├── exterior_aircon_unit.glb        (7.31 MB, CC0)
├── hanging_picture_frame_01.glb    (0.46 MB, CC0)
├── metal_office_desk.glb           (1.53 MB, CC0)
├── modular_electric_cables.glb     (5.70 MB, CC0)
├── office_notepads.glb             (1.26 MB, CC0)
├── power_box_01.glb                (2.60 MB, CC0)
├── stationery_supplies.glb         (1.89 MB, CC0)
├── vintage_day_bed.glb             (2.31 MB, CC0)
├── wooden_bookshelf_worn.glb       (2.65 MB, CC0)
└── textures/
    ├── floor_tiles_06/             (diffuse, normal, arm 1K JPGs, CC0)
    ├── painted_plaster_wall/       (diffuse, normal, arm 1K JPGs, CC0)
    └── white_plaster_02/           (diffuse, normal, arm 1K JPGs, CC0)
```

---

## 6. Next Steps & User Confirmation

Per task instructions for **Stage A**, execution is now paused pending user review of this shopping list and confirmation of the remaining manual Sketchfab downloads in `assets_incoming/workstation/`.
