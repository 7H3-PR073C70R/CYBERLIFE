# Asset Licenses & Attribution Log

This log documents all 3D models, textures, audio, and visual assets shipped with Cyberlife, ensuring strict adherence to open-source and Creative Commons licensing.

> **Policy**: No asset enters `public/` without an entry verified in `docs/world/ATTRIBUTION.md` and registered in this log.

---

## Shipped World 2 Expansion Assets (`public/assets/vehicles/` & `public/assets/environment/`)

The following assets were staged from `assets_incoming/world2`, optimized, and integrated into the District 1 world:

| Asset Name | Local File Path | Author / Source | Source URL | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lagos Keke NAPEP (Commercial Tricycle)** | `public/assets/vehicles/keke_realistic.glb` | [bhagathartworks](https://sketchfab.com/bhagathartworks) | https://sketchfab.com/3d-models/autorikshaw-indian-tuk-tuk-5775d012693741008acff9dad410e92d | **CC-BY-4.0** | 2026-10-23 | Recoloured to authentic Lagos commercial transit Yellow (`#FACC15`) with black trim, fictional "EKO TRANSIT" livery, Marina-CMS route markings, and registration `LAG-748-KK`. 8,126 triangles, WebP textures, meshopt compressed (233 KB). |
| **Lagos Ferry (MV Eko Star)** | `public/assets/vehicles/ferry_concept_realistic.glb` | [Gman The Cruise Dude](https://sketchfab.com/gmanisdabossatbeastmode) | https://sketchfab.com/3d-models/ferry-concept-73b9556133704e73af6637a428bcb8f4 | **CC-BY-4.0** | 2026-10-23 | Stripped 81k line segments. Decimated from 205k down to 15,542 triangles (target ~20k). Scaled down by 0.025 to commercial ferry proportions (29.5m length). Full PBR materials: Lagos navy hull, white superstructure, gold waterline stripe, tinted glass, teak decking. Fictional "LAGFERRY - MV EKO STAR" livery (78 KB). |
| **Artisanal Wooden Lagoon Boat** | `public/assets/vehicles/boat_wooden_realistic.glb` | [pnhtuan](https://sketchfab.com/pnhtuan7) | https://sketchfab.com/3d-models/old-wooden-boat-c62fa438ea0e464dbb23e0ca5ff03727 | **CC-BY-4.0** | 2026-10-23 | Normalized scale by factor 7.5 to realistic lagoon canoe dimensions (5.92m length, 3.46m width, 1.59m height). Grounded at waterline $Y=0$. WebP textures, meshopt (11,210 tris, 498 KB). |
| **Vespa Civilian Scooter** | `public/assets/vehicles/vespa_scooter_realistic.glb` | [victorberdugo1](https://sketchfab.com/victorberdugo1) | https://sketchfab.com/3d-models/vespa-cc57eaef930e4de897ded51e7b87c3eb | **CC-BY-4.0** | 2026-10-23 | Normalized scale by factor 0.000085 to realistic scooter proportions (1.80m length, 1.01m height, 0.55m width). Grounded at $Y=0$. WebP textures, meshopt (3,672 tris, 198 KB). |
| **Coconut Palm (Detailed LOD 0)** | `public/assets/environment/coconut_palm.glb` | [evolveduk](https://sketchfab.com/evolveduk) | https://sketchfab.com/3d-models/coconut-palm-26e787f2ff2e4c0fb004c3b0210805a3 | **CC-BY-4.0** | 2026-10-23 | 15 uncompressed PNG textures capped to 1024 max and converted to WebP. 6,626 triangles, 1,196 KB. Primary shoreline vegetation along Marina Promenade. |
| **Coconut Palm (Proxy LOD 1)** | `public/assets/environment/coconut_palm_lod.glb` | [evolveduk](https://sketchfab.com/evolveduk) | https://sketchfab.com/3d-models/coconut-palm-26e787f2ff2e4c0fb004c3b0210805a3 | **CC-BY-4.0** | 2026-10-23 | Welded and simplified to 1,307 triangles with 512 WebP textures (458 KB). Managed via `CoconutPalmManager` with `THREE.InstancedMesh` for distances > 45m. |
| **Concrete Utility & Electricity Pole** | `public/assets/environment/electricity_pole.glb` | [Helindu](https://sketchfab.com/Helindu) | https://sketchfab.com/3d-models/electricity-pole-7cb81ca1f1f045889cf5917b9ead7817 | **CC-BY-4.0** | 2026-10-23 | Welded and decimated from 42,132 down to 3,918 triangles (budget < 8k). Reoriented +90° around Z so the 10.3m pole stands vertically along +Y with base at $Y=0$. Textures to 1024 WebP, meshopt (1,288 KB). |
| **Highway Unipole Billboard (EkoSec)** | `public/assets/environment/billboard_lowpoly.glb` | [rkmorello](https://sketchfab.com/rkmorello) | https://sketchfab.com/3d-models/billboard-lowpoly-baadeaf2bab344a4a909f6d3a19375b7 | **CC-BY-4.0** | 2026-10-23 | Highway unipole billboard (19.6m height). Replaced original image with high-resolution fictional ad generated in code: "EkoSec Cloud SIEM - Zero-Day Defense for Nigeria's Financial Hub | Marina Tower, Level 14". 2,669 tris, WebP, meshopt (59 KB). |
| **Single Sided Billboard (Krest)** | `public/assets/environment/billboard_single_sided.glb` | [Jotrain Models](https://sketchfab.com/Jotrain) | https://sketchfab.com/3d-models/metal-billboard-advertising-single-sided-free-33c164cf9e4346d1b48eb0c49cb2643f | **CC-BY-4.0** | 2026-10-23 | Single-sided roadside billboard (12.2m height). Blank poster replaced with code-rendered fictional ad: "Krest Global Logistics & Maritime: Securing West Africa's Supply Chains | Port of Lagos • Apapa". 1,664 tris, WebP, meshopt (127 KB). |
| **Overhead Highway Gantry Sign** | `public/assets/environment/billboard_road_single_sided.glb` | [Frice](https://sketchfab.com/Frice) | https://sketchfab.com/3d-models/metal-road-billboard-single-sided-6534d76c592d4a0da374d3861e2d506a | **CC-BY-4.0** | 2026-10-23 | Overhead 3-panel highway gantry spanning 11m. Replaced mirrored textures with authentic Lagos road signs: "↑ BROAD ST / MARINA", "↑ CMS BUS TERMINAL / LAGFERRY", "↑ EKO TECH DISTRICT". Flipped U coords. 860 tris, WebP, meshopt (316 KB). |

---

## Rejected Candidate Assets (Not Shipped)

| Asset Title | Raw Incoming File | Author & Profile | Source URL | License | Status | Rejection Reason |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Aldi supermarket [full interior]** | `assets_incoming/world2/aldi_supermarket_full_interior.glb` | [Katydid](https://sketchfab.com/Katydid.) | https://sketchfab.com/3d-models/aldi-supermarket-full-interior-d543173cbeba44c8b1d3ae9e1d63cf02 | **CC-BY-NC-4.0** | **REJECTED** | **Non-Commercial Restriction & Real Brand Trademark**: Excluded from `public/` due to non-commercial license clause (CC-BY-NC 4.0) and German grocery trademark ("Aldi") which poses legal risk and narrative world clash. |

---

## Shipped Vehicles (`public/assets/vehicles/`)

| Asset Name | Local File Path | Author / Source | Source URL | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lagos Danfo Minibus** | `public/assets/vehicles/danfo_realistic.glb` | [Iam_thearchitect](https://sketchfab.com/arcoma330) | https://sketchfab.com/3d-models/lagos-danfo-bus-41b71827dcc94339b627fb79d9a7adb7 | **CC-BY-4.0** | 2026-10-21 | Quintessential Lagos commercial commuter minibus; yellow body with twin black stripes |
| **Lagos Danfo Van** | `public/assets/vehicles/danfo_van_realistic.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-20 | Commuter passenger van |
| **Lagos Danfo Van (No Draco)** | `public/assets/vehicles/danfo_van_realistic_nodraco.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-20 | Uncompressed fallback van |
| **Estate Hybrid Mondeo** | `public/assets/vehicles/estate_hybrid_realistic.glb` | [tonielpro520](https://sketchfab.com/tonielpro520) | https://sketchfab.com/3d-models/2021-ford-mondeo-hybrid-estate-cb5a3dc0adff4bde9c2b897c892f8663 | **CC-BY-4.0** | 2026-10-21 | Corporate estate station wagon |
| **Lagos Taxi (Mondeo)** | `public/assets/vehicles/taxi_mondeo_realistic.glb` | [tonielpro520](https://sketchfab.com/tonielpro520) | https://sketchfab.com/3d-models/2021-ford-mondeo-hybrid-estate-cb5a3dc0adff4bde9c2b897c892f8663 | **CC-BY-4.0** | 2026-10-21 | Official yellow & black Lagos corporate cab |
| **Motorcycle Okada** | `public/assets/vehicles/motorcycle_okada.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-20 | Commercial motorcycle courier |
| **Mustang Coupe** | `public/assets/vehicles/mustang_coupe_realistic.glb` | Poly Haven | https://polyhaven.com | **CC0 (Public Domain)** | 2026-10-20 | Sports coupe for corporate traffic |
| **SUV Realistic** | `public/assets/vehicles/suv_realistic.glb` | Poly Haven | https://polyhaven.com | **CC0 (Public Domain)** | 2026-10-20 | High-clearance luxury executive SUV |
| **Delivery Van** | `public/assets/vehicles/delivery.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Logistics courier van |
| **Sedan** | `public/assets/vehicles/sedan.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Civilian sedan |
| **Sedan Sports** | `public/assets/vehicles/sedan-sports.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Sports civilian sedan |
| **SUV** | `public/assets/vehicles/suv.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Mid-size civilian SUV |
| **Taxi** | `public/assets/vehicles/taxi.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Commercial city taxi |
| **Van** | `public/assets/vehicles/van.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Multi-purpose utility van |
| **Vehicle Wheel (Default)** | `public/assets/vehicles/wheel-default.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Modular wheel component |
| **Vehicle Wheel (Dark)** | `public/assets/vehicles/wheel-dark.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Modular wheel component |
| **Vehicle Colormap Palette** | `public/assets/vehicles/Textures/colormap.png` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Universal shared vehicle color palette texture |

---

## Shipped Urban Architecture & Environment (`public/assets/environment/`)

| Asset Name | Local File Path | Author / Source | Source URL | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Balogun Commercial Blocks** | `public/assets/environment/buildings/blocks_inquirer_balogun.glb` | [Neberkenezer](https://sketchfab.com/neberkenezer) | https://sketchfab.com/3d-models/ccity-building-set-1-a2d5c7bfcc2148fb8994864c43dfcc97 | **CC-BY-4.0** | 2026-10-21 | Balogun commercial district street facade |
| **Krest Commercial Tower** | `public/assets/environment/buildings/blocks_krest_commercial.glb` | [aitortilla01](https://sketchfab.com/aitortilla01) | https://sketchfab.com/3d-models/low-rise-wall-to-wall-office-building-2dd3bdd5e0724eb1b1025a922fa754cf | **CC-BY-4.0** | 2026-10-21 | Krest commercial logistics headquarters |
| **NDSRC Civic Plaza Block** | `public/assets/environment/buildings/blocks_ndsrc_civic.glb` | [sumitmangela](https://sketchfab.com/sumitmangela) | https://sketchfab.com/3d-models/new-york-buildings-e7922fe0f7b14ed786f84529f9217dac | **CC-BY-4.0** | 2026-10-21 | NDSRC regulatory and civic office facade |
| **Cedarline Marina Tower** | `public/assets/environment/buildings/tower_cedarline_marina.glb` | [Arsen Ismailov](https://sketchfab.com/fdgasd7) | https://sketchfab.com/3d-models/high-rise-office-building-3db1659ca3984bdbb18d9d3838095bea | **CC-BY-4.0** | 2026-10-21 | Cedarline Solutions primary SOC headquarters |
| **Eko Bank Financial Tower** | `public/assets/environment/buildings/tower_eko_bank.glb` | [99.Miles](https://sketchfab.com/99.Miles) | https://sketchfab.com/3d-models/free-atlanta-corperate-office-building-d96380fb001345cca9a9be121f3e43d5) | **CC-BY-4.0** | 2026-10-21 | Eko Bank corporate high-rise anchor |
| **Commercial Store 01** | `public/assets/environment/building_store_01.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Retail streetfront building |
| **Commercial Store 02** | `public/assets/environment/building_store_02.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Corner retail streetfront |
| **Commercial Store 03** | `public/assets/environment/building_store_03.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Two-storey commercial shop |
| **Diesel Generator (Industrial PBR)** | `public/assets/environment/generator_diesel_realistic.glb` | [YoeriBervoets](https://sketchfab.com/YoeriBervoets) | https://sketchfab.com/3d-models/generator-lp-9127ac84a3c84d56be6e3993ed350eff | **CC-BY-4.0** | 2026-10-21 | Backup private diesel generator ("Up NEPA!") |
| **Island Tree 01** | `public/assets/environment/island_tree_01.glb` | Poly Haven | https://polyhaven.com | **CC0 (Public Domain)** | 2026-10-19 | Broadleaf urban shade tree |
| **Quiver Tree 01** | `public/assets/environment/quiver_tree_01.glb` | Poly Haven | https://polyhaven.com/a/quiver_tree | **CC0 (Public Domain)** | 2026-10-19 | Coastal succulent tree |
| **Market Canopy 01** | `public/assets/environment/market_canopy_01.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Balogun street market vendor stall |
| **Plaza Fountain 01** | `public/assets/environment/plaza_fountain_01.glb` | Kenney / Cyberlife | https://kenney.nl | **CC0 (Public Domain)** | 2026-10-19 | Civic plaza central water feature |
| **Street Lamp 01** | `public/assets/environment/street_lamp_01.glb` | Poly Haven | https://polyhaven.com/a/street_lamp_01 | **CC0 (Public Domain)** | 2026-10-19 | Marina promenade street luminaire |
| **Road Avenue PBR** | `public/assets/environment/road_avenue_pbr.glb` | [ahmagh2e](https://sketchfab.com/ahmagh2e) | https://sketchfab.com/3d-models/road--avenue--street-7f657c3eceb343ceaf5e542c50dab27a | **CC-BY-4.0** | 2026-10-21 | PBR modular asphalt road segment |
| **Street Network PBR** | `public/assets/environment/street_network_pbr.glb` | [ahmagh2e](https://sketchfab.com/ahmagh2e) | https://sketchfab.com/3d-models/road--avenue--street-7f657c3eceb343ceaf5e542c50dab27a | **CC-BY-4.0** | 2026-10-21 | Broad Street road intersection grid |

---

## Shipped Interior Environments (`public/assets/environment/interiors/`)

| Asset Name | Local File Path | Author / Source | Source URL | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cedarline SOC Interior** | `public/assets/environment/interiors/office_cedarline_soc.glb` | [Mersus Technologies](https://sketchfab.com/3MsImagineering) | https://sketchfab.com/3d-models/mersus-office-8714be387bcd406898b2615f7dae3a47 | **CC-BY-4.0** | 2026-10-21 | Security Operations Center corporate suite |
| **Eko Bank Loft Interior** | `public/assets/environment/interiors/office_eko_bank_loft.glb` | [dasy444](https://sketchfab.com/dasy444) | https://sketchfab.com/3d-models/free-loft-17-interior-floors-view-of-the-city-1bc27584241b4078975b31dd4610d6e0 | **CC-BY-4.0** | 2026-10-21 | Financial executive banking suite |
| **Inquirer Newsroom Interior** | `public/assets/environment/interiors/office_inquirer_newsroom.glb` | [jimbogies](https://sketchfab.com/jimbogies) | https://sketchfab.com/3d-models/building-hallway-b407c0f316b94b1cbcf0bf254c3c2442 | **CC-BY-4.0** | 2026-10-21 | Investigative journalist newsroom interior |
| **Krest War Room Interior** | `public/assets/environment/interiors/office_krest_war_room.glb` | [sebodeweb](https://sketchfab.com/sebodeweb) | https://sketchfab.com/3d-models/office-computer-9403093258264563a89d708b906f1b47 | **CC-BY-4.0** | 2026-10-21 | Maritime logistics operations war room |
| **Player Apartment Interior** | `public/assets/environment/interiors/office_player_apartment.glb` | [Fatih174](https://sketchfab.com/Fatih174) | https://sketchfab.com/3d-models/basement-home-office-badeskchallenge-324ceb119c754bed973ab7a603750742 | **CC-BY-4.0** | 2026-10-21 | Protagonist bedroom & cyber workstation studio |

---

## Shipped 3D Workstation & Bedroom Props (`public/assets/props/`)

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
| **Player Male Character** | `public/assets/characters/player_male.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, MeshStandardMaterial PBR, 2048 WebP textures, under 40k tris |
| **Player Female Character** | `public/assets/characters/player_female.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, MeshStandardMaterial PBR, 2048 WebP textures, under 40k tris |
| **Pedestrian Male 2** | `public/assets/characters/ped_male_2.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, 1024 WebP textures, under 25k tris |
| **Pedestrian Female 2** | `public/assets/characters/ped_female_2.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Normalized bone hierarchy to `mixamorig:`, 1024 WebP textures, under 25k tris |
| **Barry Tech Male** | `public/assets/characters/barry_tech_male.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Rigged NPC analyst character |
| **Blessing Exec Female** | `public/assets/characters/blessing_exec_female.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Rigged corporate security lead character |
| **Conductor Trader Male** | `public/assets/characters/conductor_trader_male.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Danfo conductor / Balogun street trader |
| **Amina Chic Female** | `public/assets/characters/amina_chic_female.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Stylized modern Lagosian pedestrian |
| **Corporate Director Male** | `public/assets/characters/corporate_director_male.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Corporate bank executive NPC |
| **Expat Consultant Male** | `public/assets/characters/expat_consultant_male.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | International cyber auditor NPC |
| **Syndicate Hacker Male** | `public/assets/characters/syndicate_hacker_male.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Underground adversary NPC |
| **Rigged Character Animations** | `public/assets/characters/animations.glb` | Adobe Mixamo | https://www.mixamo.com | Adobe Mixamo, royalty-free for project use | 2026-10-20 | Merged 7 clips (Idle, Walk, Run, SitIdle, Typing, StandToSit, SitToStand); root motion stripped |
| **Quaternius Base Male (Superhero)** | `public/assets/characters/quaternius_male.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Universal Base Character Male, 65-joint rig, 14,318 tris, PBR material |
| **Quaternius Base Female (Superhero)** | `public/assets/characters/quaternius_female.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Universal Base Character Female, 65-joint rig, 15,060 tris, PBR material |
| **Quaternius Retargeted Animation Suite** | `public/assets/characters/animations_q.glb` | Quaternius & Adobe Mixamo | https://quaternius.com | **CC0 / Project Royalty-Free** | 2026-10-23 | Retargeted 7 clips (Idle, Walk, Run, SitIdle, Typing, StandToSit, SitToStand) to 65-joint skeleton |
| **Modular Eyebrows Female** | `public/assets/characters/modular/eyebrows_female.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged eyebrow accessory (1,480 tris) |
| **Modular Eyebrows Regular** | `public/assets/characters/modular/eyebrows_regular.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged eyebrow accessory (984 tris) |
| **Modular Facial Hair Beard** | `public/assets/characters/modular/hair_beard.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged beard accessory (1,034 tris) |
| **Modular Hairstyle Buns** | `public/assets/characters/modular/hair_buns.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged hair accessory (3,284 tris) |
| **Modular Hairstyle Buzzed (Male)** | `public/assets/characters/modular/hair_buzzed.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged hair accessory (830 tris) |
| **Modular Hairstyle Buzzed (Female)** | `public/assets/characters/modular/hair_buzzedfemale.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged hair accessory (830 tris) |
| **Modular Hairstyle Long** | `public/assets/characters/modular/hair_long.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged hair accessory (2,906 tris) |
| **Modular Hairstyle Simple Parted** | `public/assets/characters/modular/hair_simpleparted.glb` | [Quaternius](https://quaternius.com) | https://quaternius.com | **CC0 (Public Domain)** | 2026-10-23 | Head bone rigged hair accessory (1,301 tris) |

---

## Shipped PBR Textures (`public/assets/environment/textures/`)

| Texture Name | Local Directory | Source | Source URL | License | Resolution | Maps Included |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Ceramic Floor Tiles** | `public/assets/environment/textures/floor_tiles_06/` | Poly Haven | https://polyhaven.com/a/floor_tiles_06 | **CC0** | 1024×1024 | Diffuse, Normal, ARM (`floor_tiles_06_diffuse_1k.jpg`, `floor_tiles_06_normal_1k.jpg`, `floor_tiles_06_arm_1k.jpg`) |
| **Painted Plaster Wall** | `public/assets/environment/textures/painted_plaster_wall/` | Poly Haven | https://polyhaven.com/a/painted_plaster_wall | **CC0** | 1024×1024 | Diffuse, Normal, ARM (`painted_plaster_wall_diffuse_1k.jpg`, `painted_plaster_wall_normal_1k.jpg`, `painted_plaster_wall_arm_1k.jpg`) |
| **Ceiling Plaster** | `public/assets/environment/textures/white_plaster_02/` | Poly Haven | https://polyhaven.com/a/white_plaster_02 | **CC0** | 1024×1024 | Diffuse, Normal, ARM (`white_plaster_02_diffuse_1k.jpg`, `white_plaster_02_normal_1k.jpg`, `white_plaster_02_arm_1k.jpg`) |

---

## Shipped OS Graphic Wallpapers (`public/assets/os/`)

| Asset Name | Local File Path | Author / Source | License | Acquisition Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Orion Security OS Wallpaper** | `public/assets/os/Orion_security_wallpaper.jpg` | Cyberlife Design Team | **CC0 (Public Domain)** | 2026-10-21 | High-resolution security workstation OS desktop wallpaper |
| **Heron Security OS Wallpaper** | `public/assets/os/heron_security_wallpaper.jpg` | Cyberlife Design Team | **CC0 (Public Domain)** | 2026-10-21 | Fictional enterprise SOC wallpaper |

---

## Ambient Audio Soundscapes (`public/assets/audio/ambience/`)

| Audio Asset | Local File Path | Source / Author | License | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Apartment Ambient Loop** | `public/assets/audio/ambience/ambience_apartment.mp3` (.opus, .wav) | Cyberlife Sound Lab | **CC0 (Public Domain)** | Interior bedroom computer hum & ceiling fan ambience |
| **Cedarline Lobby Ambience** | `public/assets/audio/ambience/ambience_cedarline_lobby.mp3` (.opus, .wav) | Cyberlife Sound Lab | **CC0 (Public Domain)** | Corporate SOC air conditioning & keyboard acoustic field |
| **Lagos Street Life Ambience** | `public/assets/audio/ambience/ambience_lagos_streets.mp3` (.opus, .wav) | Cyberlife Sound Lab | **CC0 (Public Domain)** | Broad Street coastal lagoon breeze, distant Danfo horns |
| **Workstation Focus Ambience** | `public/assets/audio/ambience/ambience_workstation.mp3` (.opus, .wav) | Cyberlife Sound Lab | **CC0 (Public Domain)** | High-focus cyber defense low-frequency hum |

---

## Pre-rendered Spoken Dialogue Audio (`public/assets/audio/voice/`)

All NPC spoken dialogue, phone calls, and barks are pre-rendered into static mono MP3 audio files via build tooling (`scripts/generate-voice.mjs`) and indexed via `public/assets/audio/voice/manifest.json`. Audio clips are post-processed via PCM silence compression and normalized to EBU R128 -16.0 LUFS (-1.5 dBFS true-peak limit). No dynamic external network requests are made during runtime.

| Voice Model Name | Language / Locale | Accent / Persona | Provider / Engine | License / Terms | Generation Date | Notes / Modifications |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **en-NG-EzinneNeural** | English (Nigeria, `en-NG`) | Female Nigerian (Blessing, Mercy, Goodness, Mama Esther, Mary) | Microsoft Azure Cognitive Services Speech | Microsoft Cognitive Services Speech Terms | 2026-10-23 | Pre-rendered static MP3 dialogue clips; Variant B prosody (+3% rate boost, delivery modifiers) |
| **en-NG-AbeoNeural** | English (Nigeria, `en-NG`) | Male Nigerian (Barry, Michael, Tsharp, Segun, Choker, Daniel, Cipher) | Microsoft Azure Cognitive Services Speech | Microsoft Cognitive Services Speech Terms | 2026-10-23 | Pre-rendered static MP3 dialogue clips; Variant B prosody (+3% rate boost, delivery modifiers) |
| **en-US-ChristopherNeural** | English (United States, `en-US`) | Synthetic / Flat Robotic (Aster SIEM Bot) | Microsoft Azure Cognitive Services Speech | Microsoft Cognitive Services Speech Terms | 2026-10-23 | Pre-rendered static MP3 clips; flat 0% rate and pitch for autonomous SIEM watchdog bot |

---

## License Texts & Declarations

### Creative Commons Attribution 4.0 International (CC-BY 4.0)
You are free to:
- **Share** — copy and redistribute the material in any medium or format.
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially.

Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
- **No additional restrictions** — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

### Creative Commons Zero 1.0 Universal (CC0 1.0)
The persons who associated work with this deed have dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law. You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.
