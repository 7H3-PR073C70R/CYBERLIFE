# Cyberlife — Asset Audit & Curation Report: Incoming Pack (Stage A)

> **Document Type**: Production Asset Audit, Licensing Verification & Scale Normalisation  
> **Status**: **CURATED, VERIFIED & BOUNDED** (Strict Policy Enforcement)  
> **Target Folder**: `docs/world/asset-audit.md` & `docs/world/asset-audit.csv`  
> **Target Asset Directory**: `assets_incoming/new` (Git-Ignored: 49 Files, ~877 MB)  
> **Author**: Antigravity Production Asset Pipeline  
> **Date**: October 23, 2026  

---

## 1. Executive Summary & Verdict Counts

Every incoming 3D asset file has been parsed for embedded Sketchfab author and license metadata, verified against the project Creative Commons licensing policy, measured for native bounding dimensions and polygon density, and evaluated for regional Lagos architectural authenticity.

| Verdict Category | Count | Policy Interpretation | Next Action |
| :--- | :---: | :--- | :--- |
| **USE** | **11** | Clean CC-BY / CC0 license; fits Lagos setting; polygon and texture budgets verified. | Stage for normalization and inclusion in District 1. |
| **USE AFTER WORK** | **7** | Clean CC-BY license; requires polygon decimation, texture packing, or mesh trimming. | Run decimation / WebP pipeline prior to staging. |
| **PARKED** | **11** | Unrigged photogrammetry scans (200k+ tris, 0 bones). Retain in cold storage. | Parked until character retopology / rigging pass. |
| **HOLD** | **1** | CC-BY-SA-4.0 license; requires explicit user sign-off. | On hold pending license approval; PS1 visual style clashes. |
| **REJECT** | **19** | Prohibited license (NC, SKETCHFAB Standard), ripped game asset, spamware, or severe aesthetic clash. | Do not import into project; delete or archive. |
| **TOTAL AUDITED** | **49** | **100% of incoming asset pack accounted for** | **Zero unverified assets** |

---

## 2. Comprehensive Asset Inventory Table

| File | Title | Author | License | Tris | Size (MB) | Native Bounds (m) | Scale | Style Class | Verdict | Reason |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :---: | :--- |
| `2012_ford_mustang_boss_302.glb` | 2012 Ford Mustang Boss 302 | Ddiaz Design | `CC-BY-NC-SA-4.0` | 40,698 | 5.03 | `0.02 × 0.01 × 0.05` | `175` | 3D Model | *REJECT* | License violation: CC-BY-NC-SA-4.0 (Non-Commercial / ShareAlike prohibited by policy). |
| `2019_ford_mustang_cobra_jet.glb` | 2019 Ford Mustang Cobra Jet | OUTPISTON | `CC-BY-NC-SA-4.0` | 235,210 | 14.33 | `8.33 × 5.5 × 20.34` | `0.3182` | 3D Model | *REJECT* | License violation: CC-BY-NC-SA-4.0 (Non-Commercial / ShareAlike prohibited by policy). |
| `2021_ford_mondeo_hybrid_estate.glb` | 2021 Ford Mondeo Hybrid Estate | tonielpro520 | `CC-BY-4.0` | 396,450 | 38.14 | `215.34 × 151.15 × 493.36` | `0.01` | Realistic Automotive PBR | **USE AFTER WORK** | Realistic corporate fleet vehicle, but currently 396k triangles. Requires decimation to ~20k tris and WebP texture conversion before deployment. |
| `azure_confidence.glb` | Azure Confidence | restore50 | `CC-BY-4.0` | 257,516 | 17.45 | `0.69 × 1.9 × 0.36` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `basement_home_office_badeskchallenge.glb` | Basement Home Office #BADeskChallenge | Fatih174 | `CC-BY-4.0` | 745,410 | 25.78 | `4.39 × 3.05 × 4.09` | `1` | Realistic ArchViz Interior | **USE AFTER WORK** | Cozy private research room, but 745k tris severely exceeds 60k interior budget. Requires 90% decimation before use. |
| `building_hallway.glb` | Building Hallway | jimbogies | `CC-BY-4.0` | 52,198 | 16.39 | `2319.66 × 638.65 × 2170.19` | `0.005` | Realistic Commercial Interior Corridor | **USE AFTER WORK** | Realistic corporate corridor (52k tris) for inter-floor office transitions. Needs meshopt compression and texture channel packing. |
| `casio_fx100au_plus_2nd_edition_calculator.glb` | Casio fx100au Plus 2nd Edition Calculator | The_Elz_Art | `CC-BY-4.0` | 30,833 | 2.91 | `2.39 × 0.25 × 4.97` | `0.033` | Realistic Stationery Prop | **USE AFTER WORK** | Authentic student and accounting desk prop in Nigeria. Polycount (30.8k tris) must be decimated to < 1.5k tris for a minor desk prop. |
| `casual_chic_in_pink.glb` | Casual Chic In Pink | restore50 | `CC-BY-4.0` | 272,008 | 18.43 | `0.6 × 1.9 × 0.48` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `casual_confidence (1).glb` | Casual Confidence | restore50 | `CC-BY-4.0` | 227,590 | 15.89 | `0.61 × 1.9 × 0.47` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `casual_confidence (2).glb` | Casual Confidence | restore50 | `CC-BY-4.0` | 236,656 | 16.41 | `0.71 × 1.9 × 0.39` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `casual_confidence (3).glb` | Casual Confidence | restore50 | `CC-BY-4.0` | 198,662 | 14.59 | `0.7 × 1.9 × 0.39` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `casual_confidence copy.glb` | Casual Confidence | restore50 | `CC-BY-4.0` | 340,644 | 22.41 | `0.61 × 1.9 × 0.35` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `casual_confidence.glb` | Casual Confidence | restore50 | `CC-BY-4.0` | 236,656 | 16.41 | `0.71 × 1.9 × 0.39` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `casual_portrait_of_a_man_in_a_beige_t-shirt.glb` | Casual Portrait Of A Man In A Beige T-Shirt | restore50 | `CC-BY-4.0` | 269,392 | 17.73 | `0.69 × 1.9 × 0.48` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `ccity_building_set_1.glb` | CCity Building Set 1 | Neberkenezer | `CC-BY-4.0` | 31,050 | 13.72 | `55800 × 3185.66 × 23400` | `0.01` | Realistic Modular Architecture Kit | **USE** | Modular commercial building kit for populating perimeter street blocks with instanced draw-call savings. |
| `city.glb` | City | Voxelatio | `CC-BY-4.0` | 263,001 | 26.13 | `52.98 × 14.23 × 55.98` | `0.123` | 3D Model | *REJECT* | Aesthetic clash: Voxel / cartoon blocky aesthetic clashes with realistic Lagos Island art direction; 263k tris. |
| `cyberpunk_city.glb` | Cyberpunk City | mortalityrexotable | `CC-BY-4.0` | 1,257,909 | 90.59 | `29.84 × 20.54 × 15.74` | `0.0852` | 3D Model | *REJECT* | Severe aesthetic clash: Futuristic sci-fi neon cyberpunk setting directly clashes with grounded 2026 Lagos Island; 1.26M tris. |
| `download_crown_of_hispania_for_pc.glb` | Download Crown Of Hispania For PC | HiddenBonobo621 | `CC-BY-4.0` | 5,265 | 0.51 | `0.01 × 0.02 × 0` | `1` | 3D Model | *REJECT* | Spam upload: Fake SEO / warez bait upload with zero usable geometry (bounds 0.01 x 0.02 x 0.00). |
| `download_loot_and_ledger-tenoke_for_pc.glb` | Download Loot And Ledger-TENOKE For PC | OvertWildcat3133 | `CC-BY-4.0` | 141,330 | 6.47 | `0.85 × 1 × 0.69` | `1` | 3D Model | *REJECT* | Spam upload: Suspected warez release mirror (TENOKE release group naming), dubious provenance. |
| `edsr_2002_-_alexandra_roivas.glb` | EDSR (2002) - Alexandra Roivas | Ziggertron | `CC-BY-4.0` | 4,374 | 48.85 | `2.83 × 3.18 × 0.63` | `0.5503` | 3D Model | *REJECT* | Ripped game asset: Alexandra Roivas from "Eternal Darkness: Sanity's Requiem" (Nintendo GameCube, 2002). Copyright Nintendo / Silicon Knights. |
| `elegant_office_muse.glb` | Elegant Office Muse | Grauwolf | `CC-BY-4.0` | 1,934,595 | 107.79 | `0.52 × 1.9 × 0.45` | `1` | 3D Model | *REJECT* | Extreme geometry & unrigged: 1,934,595 triangles (108 MB), static human scan violating character budgets by 50x. |
| `floral_print_high-waisted_shorts_look copy.glb` | Floral Print High-Waisted Shorts Look | restore50 | `CC-BY-4.0` | 253,839 | 17.7 | `0.72 × 1.9 × 0.38` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `floral_print_high-waisted_shorts_look.glb` | Floral Print High-Waisted Shorts Look | restore50 | `CC-BY-4.0` | 253,839 | 17.7 | `0.72 × 1.9 × 0.38` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `ford_mondeo_taxi.glb` | Ford Mondeo TAXI | TSB3DMODELS | `CC-BY-NC-4.0` | 2,326 | 1.94 | `85.68 × 65.17 × 193.69` | `0.0269` | 3D Model | *REJECT* | License violation: CC-BY-NC-4.0 (Non-Commercial license prohibited by policy). |
| `free__atlanta_corperate_office_building.glb` | [FREE]  Atlanta, Corperate Office Building | 99.Miles | `CC-BY-4.0` | 37,290 | 10.32 | `60.83 × 212 × 96.85` | `0.35` | Realistic Commercial High-Rise | **USE** | Modern commercial tower ideal as a prominent skyline anchor along the Marina waterfront boulevard. |
| `free_loft_17_interior_floors_view_of_the_city..glb` | free Loft 17 interior floors, view of the city. | dasy444 | `CC-BY-4.0` | 45,420 | 12.28 | `37.19 × 19.26 × 33.93` | `0.2` | Realistic Commercial Loft | **USE AFTER WORK** | Stylish corporate penthouse interior (45k tris). Needs backdrop texture replacement to show Marina Lagoon vista. |
| `free_loft_18_mini_office_v.optimization.glb` | free Loft 18 mini office v.optimization | dasy444 | `SKETCHFAB` | 39,882 | 15.61 | `15.43 × 6.13 × 11.7` | `0.2855` | 3D Model | *REJECT* | License violation: SKETCHFAB Standard license (prohibited by policy; CC0 / CC-BY required). |
| `generator_lp.glb` | Generator LP | YoeriBervoets | `CC-BY-4.0` | 10,902 | 4.35 | `110.47 × 71.6 × 74.92` | `0.013` | Realistic Industrial PBR | **USE** | Essential Lagos urban infrastructure prop representing private backup diesel generation during grid outages ("Up NEPA!"). |
| `high_rise_office_building.glb` | High Rise Office Building | Arsen Ismailov | `CC-BY-4.0` | 16,963 | 10.49 | `37.09 × 33.19 × 18.36` | `1` | Realistic Commercial Mid-Rise | **USE** | Mid-century commercial building with excellent low polycount (17k tris), perfect for Broad Street corridor streetscape. |
| `lagos_danfo_bus.glb` | Lagos Danfo Bus | Iam_thearchitect | `CC-BY-4.0` | 40,922 | 6.88 | `2 × 0.89 × 0.95` | `2.45` | Realistic Photorealistic PBR | **USE** | Authentic quintessential Lagos commuter minibus. Core hero vehicle for Broad Street and Marina traffic. |
| `low-poly_city_buildings.glb` | Low-poly City Buildings | smooth998 | `CC-BY-4.0` | 7,150 | 4.09 | `5.74 × 2.81 × 4.56` | `1` | 3D Model | *REJECT* | Aesthetic clash: Flat-shaded low-poly mobile game style clashes with realistic PBR architecture. |
| `low_rise_wall_to_wall_office_building.glb` | Low rise wall to wall office building | aitortilla01 | `CC-BY-4.0` | 2,616 | 0.79 | `3280 × 3272.57 × 3299.67` | `0.0045` | Realistic Wall-to-Wall Architecture | **USE** | Extremely lightweight (2.6k tris) dense street-wall building fitting Lagos Island zero-setback urban fabric. |
| `man_in_a_yellow_tank_top_and_navy_cargo_shorts.glb` | Man In A Yellow Tank Top And Navy Cargo Shorts | restore50 | `CC-BY-4.0` | 226,310 | 15.8 | `0.63 × 1.9 × 0.45` | `1` | Photogrammetry 3D Scan | `PARKED` | Static unrigged photogrammetry scan (200k+ tris, 0 bones/animations). Parked for retopology/rigging pass. |
| `mersus_office.glb` | Mersus Office | Mersus Technologies | `CC-BY-4.0` | 60,593 | 24.14 | `17.01 × 2.91 × 16.1` | `1` | Realistic Corporate Tech Office Suite | **USE AFTER WORK** | Comprehensive modern office interior (60k tris). Needs 44 individual texture maps consolidated and compressed to WebP. |
| `new_york_buildings.glb` | New York Buildings | sumitmangela | `CC-BY-4.0` | 5,142 | 11.48 | `10.34 × 5.3 × 22.06` | `2.8` | Realistic Urban Row Architecture | **USE AFTER WORK** | Street row architecture is usable, but American-style fire escapes clash with Nigerian vernacular. Requires mesh detachment of fire escapes and tropical weathering texture tweak. |
| `office.glb` | Office | VertexForge | `CC-BY-4.0` | 1,372 | 4.02 | `57.29 × 27.92 × 69.02` | `0.0627` | 3D Model | *REJECT* | Outdated visual quality: Baked flat unlit texture (no PBR normal/roughness channels); clashes with real-time lighting. |
| `office_computer.glb` | Office Computer | sebodeweb | `CC-BY-4.0` | 2,244 | 1.45 | `140.25 × 123.96 × 184.83` | `0.01` | Realistic Office Workstation Suite | **USE** | Complete workstation rig (2.2k tris) for office desks and research terminal setups. |
| `office_desk.glb` | Office Desk | saeed khalili | `CC-BY-4.0` | 311,440 | 9.47 | `90.15 × 48.09 × 75.16` | `0.0364` | 3D Model | *REJECT* | Grossly unoptimized: 311k triangles for a simple desk with 0 textures; redundant with existing CC0 Poly Haven desk. |
| `office_floor.glb` | Office floor | dasy444 | `SKETCHFAB` | 158,388 | 31.03 | `27.12 × 18.48 × 15.58` | `0.0947` | 3D Model | *REJECT* | License violation: SKETCHFAB Standard license (prohibited by policy; CC0 / CC-BY required). |
| `office_monitor__workstation_monitor.glb` | Office Monitor / Workstation Monitor | DatSketch | `CC-BY-4.0` | 177 | 0.02 | `252.75 × 549.27 × 831.1` | `0.001` | Minimalist Modern Monitor | **USE** | Ultra-lightweight (177 tris) monitor prop for SOC multi-monitor consoles and video walls. |
| `office_pc.glb` | Office PC | fluffyw0lf | `CC-BY-4.0` | 1,700 | 1.8 | `0.35 × 0.59 × 0.63` | `0.75` | Realistic Hardware Prop | **USE** | Clean low-poly (1.7k tris) desktop PC tower for corporate desks, SOC rooms, and cyber lounges. |
| `office_room.glb` | office room | 78652552anans | `CC-BY-4.0` | 647,810 | 29.31 | `8.37 × 6.26 × 9.64` | `0.2796` | 3D Model | *REJECT* | Untextured raw CAD geometry: 648k triangles, 0 textures, unoptimized solid primitives. |
| `road__avenue__street.glb` | Road_ Avenue_ street | ahmagh2e | `CC-BY-4.0` | 620 | 3.43 | `1000 × 20 × 1500` | `0.01` | Realistic PBR Road Kit | **USE** | Lightweight (620 tris) modular multi-lane road segment with curbs for extending Broad Street and Marina Boulevard. |
| `sofa.glb` | Sofa | Mike Polyakovich | `CC-BY-4.0` | 5,290 | 9.6 | `8.11 × 3.2 × 4.95` | `0.26` | Realistic Modern Furniture | **USE** | Corporate executive sofa (5.3k tris) for Cedarline lobby and Eko Bank lounge. |
| `sofa_03_4k.blend.zip` | sofa_03_4k.blend.zip | Unknown | `Missing / Unusable Archive` | 0 | 8.9 | `0 × 0 × 0` | `1` | Unusable Archive | *REJECT* | Unusable format: Raw Blender .blend archive, missing runtime GLTF/GLB asset. |
| `sporting_village.glb` | SPORTING VILLAGE | SA3D | `CC-BY-4.0` | 435,252 | 58.48 | `108.46 × 3.81 × 108.51` | `0.4593` | 3D Model | *REJECT* | Contextually irrelevant: Suburban sports park / athletics track does not belong in dense financial district; 435k tris. |
| `street.glb` | Street | Pasha | `CC-BY-4.0` | 444,938 | 22.23 | `1678.1 × 463.16 × 738.47` | `0.0038` | 3D Model | *REJECT* | Aesthetic clash & unoptimized: Post-Soviet / Eastern European street layout, trolley wires, 445k tris. |
| `street_city_buildings_8.glb` | street city buildings (8) | dasy444 | `SKETCHFAB` | 77,066 | 6.72 | `18.08 × 7.78 × 23.71` | `0.2249` | 3D Model | *REJECT* | License violation: SKETCHFAB Standard license (prohibited by policy; CC0 / CC-BY required). |
| `yellow_taxicab_-_ps1_car.glb` | Yellow Taxi/Cab - PS1 Car | MoiDev | `CC-BY-SA-4.0` | 664 | 0.06 | `0.98 × 0.79 × 2.7` | `1.67` | Retro PS1 Low-Poly Stylized | `HOLD` | Licensed under CC-BY-SA-4.0 (requires user approval). Also exhibits 1990s PS1 retro low-poly aesthetic that clashes with realistic PBR vehicles. |

---

## 3. Parked Character Scans & Duplicate Analysis

The 11 unrigged photogrammetry character scans created by `restore50` on Sketchfab feature high-resolution surface textures but possess **zero bone skeletons, zero vertex skinning weights, and zero animations**. Each mesh contains between 198,000 and 340,000 triangles, which is **5x to 8x higher than the entire budget for animated hero characters (< 40,000 tris)**.

### Hash & Duplicate Tracking
| File Name | SHA-256 Hash Prefix | Triangles | Size (MB) | Duplicate Status |
| :--- | :--- | :---: | :---: | :--- |
| `azure_confidence.glb` | `11e571889af3fe17...` | 257,516 | 17.45 | Unique scan file |
| `casual_chic_in_pink.glb` | `046ef745fc72a27c...` | 272,008 | 18.43 | Unique scan file |
| `casual_confidence (1).glb` | `3cef9aa11d034210...` | 227,590 | 15.89 | Unique scan file |
| `casual_confidence (2).glb` | `8c768a4879fcc802...` | 236,656 | 16.41 | ⚠️ **Exact Duplicate of `casual_confidence.glb`** |
| `casual_confidence (3).glb` | `b990053053884bf6...` | 198,662 | 14.59 | Unique scan file |
| `casual_confidence copy.glb` | `fc7f676f873a98a9...` | 340,644 | 22.41 | Unique scan file |
| `casual_confidence.glb` | `8c768a4879fcc802...` | 236,656 | 16.41 | ⚠️ **Exact Duplicate of `casual_confidence (2).glb`** |
| `casual_portrait_of_a_man_in_a_beige_t-shirt.glb` | `831f23e6787c3c4d...` | 269,392 | 17.73 | Unique scan file |
| `floral_print_high-waisted_shorts_look copy.glb` | `114e165c3015b3ec...` | 253,839 | 17.7 | ⚠️ **Exact Duplicate of `floral_print_high-waisted_shorts_look.glb`** |
| `floral_print_high-waisted_shorts_look.glb` | `114e165c3015b3ec...` | 253,839 | 17.7 | ⚠️ **Exact Duplicate of `floral_print_high-waisted_shorts_look copy.glb`** |
| `man_in_a_yellow_tank_top_and_navy_cargo_shorts.glb` | `98f6f95db85dbdea...` | 226,310 | 15.8 | Unique scan file |

> [!NOTE]
> **Parked Decision**: These models must remain in cold storage in `assets_incoming/parked/`. They cannot be added to `public/assets/characters/` until they undergo automated retopology (down to 18k–25k tris), normal map baking, and skeleton binding to the standard Cyberlife `mixamorig:` bone hierarchy.

---

## 4. Full Rejection Log & Legal Rationale

| File Name | License / Origin | Triangles | Size (MB) | Specific Rejection Reason |
| :--- | :--- | :---: | :---: | :--- |
| `2012_ford_mustang_boss_302.glb` | `CC-BY-NC-SA-4.0` | 40,698 | 5.03 | License violation: CC-BY-NC-SA-4.0 (Non-Commercial / ShareAlike prohibited by policy). |
| `2019_ford_mustang_cobra_jet.glb` | `CC-BY-NC-SA-4.0` | 235,210 | 14.33 | License violation: CC-BY-NC-SA-4.0 (Non-Commercial / ShareAlike prohibited by policy). |
| `city.glb` | `CC-BY-4.0` | 263,001 | 26.13 | Aesthetic clash: Voxel / cartoon blocky aesthetic clashes with realistic Lagos Island art direction; 263k tris. |
| `cyberpunk_city.glb` | `CC-BY-4.0` | 1,257,909 | 90.59 | Severe aesthetic clash: Futuristic sci-fi neon cyberpunk setting directly clashes with grounded 2026 Lagos Island; 1.26M tris. |
| `download_crown_of_hispania_for_pc.glb` | `CC-BY-4.0` | 5,265 | 0.51 | Spam upload: Fake SEO / warez bait upload with zero usable geometry (bounds 0.01 x 0.02 x 0.00). |
| `download_loot_and_ledger-tenoke_for_pc.glb` | `CC-BY-4.0` | 141,330 | 6.47 | Spam upload: Suspected warez release mirror (TENOKE release group naming), dubious provenance. |
| `edsr_2002_-_alexandra_roivas.glb` | `CC-BY-4.0` | 4,374 | 48.85 | Ripped game asset: Alexandra Roivas from "Eternal Darkness: Sanity's Requiem" (Nintendo GameCube, 2002). Copyright Nintendo / Silicon Knights. |
| `elegant_office_muse.glb` | `CC-BY-4.0` | 1,934,595 | 107.79 | Extreme geometry & unrigged: 1,934,595 triangles (108 MB), static human scan violating character budgets by 50x. |
| `ford_mondeo_taxi.glb` | `CC-BY-NC-4.0` | 2,326 | 1.94 | License violation: CC-BY-NC-4.0 (Non-Commercial license prohibited by policy). |
| `free_loft_18_mini_office_v.optimization.glb` | `SKETCHFAB` | 39,882 | 15.61 | License violation: SKETCHFAB Standard license (prohibited by policy; CC0 / CC-BY required). |
| `low-poly_city_buildings.glb` | `CC-BY-4.0` | 7,150 | 4.09 | Aesthetic clash: Flat-shaded low-poly mobile game style clashes with realistic PBR architecture. |
| `office.glb` | `CC-BY-4.0` | 1,372 | 4.02 | Outdated visual quality: Baked flat unlit texture (no PBR normal/roughness channels); clashes with real-time lighting. |
| `office_desk.glb` | `CC-BY-4.0` | 311,440 | 9.47 | Grossly unoptimized: 311k triangles for a simple desk with 0 textures; redundant with existing CC0 Poly Haven desk. |
| `office_floor.glb` | `SKETCHFAB` | 158,388 | 31.03 | License violation: SKETCHFAB Standard license (prohibited by policy; CC0 / CC-BY required). |
| `office_room.glb` | `CC-BY-4.0` | 647,810 | 29.31 | Untextured raw CAD geometry: 648k triangles, 0 textures, unoptimized solid primitives. |
| `sofa_03_4k.blend.zip` | `Missing / Unusable Archive` | 0 | 8.9 | Unusable format: Raw Blender .blend archive, missing runtime GLTF/GLB asset. |
| `sporting_village.glb` | `CC-BY-4.0` | 435,252 | 58.48 | Contextually irrelevant: Suburban sports park / athletics track does not belong in dense financial district; 435k tris. |
| `street.glb` | `CC-BY-4.0` | 444,938 | 22.23 | Aesthetic clash & unoptimized: Post-Soviet / Eastern European street layout, trolley wires, 445k tris. |
| `street_city_buildings_8.glb` | `SKETCHFAB` | 77,066 | 6.72 | License violation: SKETCHFAB Standard license (prohibited by policy; CC0 / CC-BY required). |

---

## 5. Visual Review, Regional Authenticity & Art Direction Fit

Every approved and candidate asset was evaluated against the artistic guidelines of **grounded, psychological techno-realism** in Lagos Island:

| File Name | Visual Style | Color Palette | Lagos Appropriate? | Matches Existing? | Art Direction Assessment |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `2021_ford_mondeo_hybrid_estate.glb` | Realistic Automotive PBR | Metallic dark navy/charcoal, smoked windows, silver alloy wheels | ✅ YES | ✅ YES | Realistic corporate fleet vehicle, but currently 396k triangles. Requires decimation to ~20k tris and WebP texture conversion before deployment. |
| `basement_home_office_badeskchallenge.glb` | Realistic ArchViz Interior | Dark oak paneling, warm ambient lamps, RGB workstation accent glows | ✅ YES | ✅ YES | Cozy private research room, but 745k tris severely exceeds 60k interior budget. Requires 90% decimation before use. |
| `building_hallway.glb` | Realistic Commercial Interior Corridor | Polished white terrazzo tiles, cream plaster walls, fluorescent troffer lighting | ✅ YES | ✅ YES | Realistic corporate corridor (52k tris) for inter-floor office transitions. Needs meshopt compression and texture channel packing. |
| `casio_fx100au_plus_2nd_edition_calculator.glb` | Realistic Stationery Prop | Dark grey casing, blue function buttons, reflective LCD segment screen | ✅ YES | ✅ YES | Authentic student and accounting desk prop in Nigeria. Polycount (30.8k tris) must be decimated to < 1.5k tris for a minor desk prop. |
| `ccity_building_set_1.glb` | Realistic Modular Architecture Kit | Terracotta masonry, plaster panels, grey concrete, commercial storefront glass | ✅ YES | ✅ YES | Modular commercial building kit for populating perimeter street blocks with instanced draw-call savings. |
| `free__atlanta_corperate_office_building.glb` | Realistic Commercial High-Rise | Reflective blue curtain glass, granite lobby base, dark steel mullions | ✅ YES | ✅ YES | Modern commercial tower ideal as a prominent skyline anchor along the Marina waterfront boulevard. |
| `free_loft_17_interior_floors_view_of_the_city..glb` | Realistic Commercial Loft | Warm brick, black metal structural columns, timber floorboards, glass curtain windows | ✅ YES | ✅ YES | Stylish corporate penthouse interior (45k tris). Needs backdrop texture replacement to show Marina Lagoon vista. |
| `generator_lp.glb` | Realistic Industrial PBR | Weathered industrial green/grey steel, black exhaust manifold, yellow hazard warnings | ✅ YES | ✅ YES | Essential Lagos urban infrastructure prop representing private backup diesel generation during grid outages ("Up NEPA!"). |
| `high_rise_office_building.glb` | Realistic Commercial Mid-Rise | Warm beige concrete, tinted corporate glass, rooftop HVAC units | ✅ YES | ✅ YES | Mid-century commercial building with excellent low polycount (17k tris), perfect for Broad Street corridor streetscape. |
| `lagos_danfo_bus.glb` | Realistic Photorealistic PBR | Lagos Yellow (#FACC15 / #EAB308) with dual black side stripes, tinted glass, chrome bumpers | ✅ YES | ✅ YES | Authentic quintessential Lagos commuter minibus. Core hero vehicle for Broad Street and Marina traffic. |
| `low_rise_wall_to_wall_office_building.glb` | Realistic Wall-to-Wall Architecture | Off-white painted stucco, ground floor retail glass, dark stone base | ✅ YES | ✅ YES | Extremely lightweight (2.6k tris) dense street-wall building fitting Lagos Island zero-setback urban fabric. |
| `mersus_office.glb` | Realistic Corporate Tech Office Suite | Corporate navy and white, acoustic ceiling tiles, modular work benches, glass partitions | ✅ YES | ✅ YES | Comprehensive modern office interior (60k tris). Needs 44 individual texture maps consolidated and compressed to WebP. |
| `new_york_buildings.glb` | Realistic Urban Row Architecture | Aged brown/red brick, limestone lintels, dark window frames | ❌ NO | ⚠️ AFTER WORK | Street row architecture is usable, but American-style fire escapes clash with Nigerian vernacular. Requires mesh detachment of fire escapes and tropical weathering texture tweak. |
| `office_computer.glb` | Realistic Office Workstation Suite | Black/grey plastic peripherals, keyboard, mouse, LCD panel | ✅ YES | ✅ YES | Complete workstation rig (2.2k tris) for office desks and research terminal setups. |
| `office_monitor__workstation_monitor.glb` | Minimalist Modern Monitor | Matte black bezel, brushed aluminum stand, dark glass display | ✅ YES | ✅ YES | Ultra-lightweight (177 tris) monitor prop for SOC multi-monitor consoles and video walls. |
| `office_pc.glb` | Realistic Hardware Prop | Matte black plastic/metal chassis, power status LED, front ports | ✅ YES | ✅ YES | Clean low-poly (1.7k tris) desktop PC tower for corporate desks, SOC rooms, and cyber lounges. |
| `road__avenue__street.glb` | Realistic PBR Road Kit | Dark aged asphalt, yellow/white lane stripes, concrete curb and sidewalk paving | ✅ YES | ✅ YES | Lightweight (620 tris) modular multi-lane road segment with curbs for extending Broad Street and Marina Boulevard. |
| `sofa.glb` | Realistic Modern Furniture | Charcoal leather, dark walnut wood trim, matte black base | ✅ YES | ✅ YES | Corporate executive sofa (5.3k tris) for Cedarline lobby and Eko Bank lounge. |
| `yellow_taxicab_-_ps1_car.glb` | Retro PS1 Low-Poly Stylized | Bright yellow with chequered taxi stripe, unshaded pixel texture | ❌ NO | ⚠️ AFTER WORK | Licensed under CC-BY-SA-4.0 (requires user approval). Also exhibits 1990s PS1 retro low-poly aesthetic that clashes with realistic PBR vehicles. |

---

## 6. Top 5 Approved Assets for District 1 Street Life

The following 5 approved assets represent the highest-impact additions to the living streetscape of Broad Street and Marina:

1. **`lagos_danfo_bus.glb` (Lagos Danfo Minibus)**
   - **Why It Matters**: The quintessential yellow commercial bus defines the visual identity and sonic landscape of Lagos Island transit.
   - **Deployment**: Active traffic spline along Broad Street and Marina Boulevard, dedicated curbside boarding bay at `(-4.8, 0, -28)`.
2. **`generator_lp.glb` (Industrial Backup Soundproof Generator)**
   - **Why It Matters**: Physical embodiment of municipal power fragility; central to the narrative theme of blackouts and inverter alarms.
   - **Deployment**: Sidewalk service alleys behind Cedarline Marina Tower and the Player Apartment courtyard.
3. **`free__atlanta_corperate_office_building.glb` (High-Rise Corporate Tower)**
   - **Why It Matters**: Modern reflective blue curtain glass creates an authentic high-density commercial skyline along the Marina waterfront.
   - **Deployment**: Primary backdrop landmark on the northern boundary of Marina Boulevard.
4. **`high_rise_office_building.glb` (Mid-Century Commercial Office)**
   - **Why It Matters**: Low polygon footprint (16.9k tris) with authentic warm concrete and window ribbons matching Broad Street financial architecture.
   - **Deployment**: Mid-block corner anchor at Broad Street and Odunlami Street junction.
5. **`road__avenue__street.glb` (Modular PBR Multi-Lane Avenue Kit)**
   - **Why It Matters**: Standardizes asphalt road surfaces, curbs, and sidewalks across the 300 × 200 m expanded district footprint with minimal draw calls.
   - **Deployment**: Ground grid infrastructure for Broad Street dual carriageway and Marina coastal boulevard.

---
