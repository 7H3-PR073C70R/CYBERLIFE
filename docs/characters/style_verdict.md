# Stage A Style Verdict & Visual Cohesion Analysis

**Date:** 2026-10-23  
**Scope:** Evaluation of Quaternius Universal Base Characters alongside existing realistic Mixamo characters in the Cyberlife Lagos Island world.

---

## 1. Geometric & Anatomical Comparison

| Trait | Quaternius Modular Kit | Existing Realistic Mixamo Models | Cohesion Analysis |
| :--- | :--- | :--- | :--- |
| **Triangle Count** | ~14,500 – 15,000 tris (unclothed base body) | ~25,000 – 38,000 tris (fully clothed & detailed) | Manageable density gradient; Quaternius geometry is well-optimized for real-time crowd scaling. |
| **Anatomical Proportions** | Stylized heroic / comic-proportioned (broad shoulders, tapered waist, simplified muscle mass, streamlined hands/feet) | Realistic human anatomical proportions (subtle asymmetries, natural limb contours, scanned wrinkle details) | Noticeable contrast when standing directly side-by-side at sub-meter inspection distances. At typical third-person gameplay camera distances (3.5m+), the difference softens significantly. |
| **Facial & Head Structure** | Stylized planes, simplified eye sockets, clean planar brow ridges | Photorealistic features, high-frequency pore and wrinkle normal maps | Close-up face-to-face dialogue highlights the difference if placed directly beside each other without post-processing. |
| **Clothing Topology** | Form-fitting modular procedural/extruded shells conforming to base skin | Baked clothing meshes with natural cloth draping, folds, and seam seams | High-detail realistic clothing looks richer up close; modular shells provide infinite variation and zero draw-call duplication for crowd density. |

---

## 2. Lighting & Shading Harmonization

To eliminate visual jarring between the two asset types under daylight and night lighting, the following color grading and rendering adjustments were established in Stage A:
1. **ACES Filmic Tone-Mapping**: Harmonizes specular highlights and prevents stylized base meshes from appearing like plastic under bright Lagos sun.
2. **Warm Ambient Studio Fill**: Balanced ambient radiance (day: `0xfff4e6` sun with warm ocean bounce; night: deep indigo with cyan streetlamps) ensures consistent shadow depth across both topologies.
3. **Roughness & Specular Alignment**: Standardized PBR roughness values (skin: 0.62–0.68, fabric shells: 0.75–0.85, metal/oxfords: 0.20–0.30) to eliminate surface reflectance mismatch.
4. **Cultural Melanin & Fabric Palette**: Shared 8-tone West African skin palette (`WEST_AFRICAN_SKIN_TONES`) and authentic Ankara wax-print / plain linen textures across both character classes.

---

## 3. Style Direction Options

The project evaluated two potential deployment paths:

### Option 1: Distance-Based Visual Hierarchy (Recommended in Stage A)
- **Player Character & Core Named Story NPCs**: Retain realistic Mixamo-derived models with authentic custom styling (Blessing, Barry, Michael, Mercy, Mama Esther, Uncle Segun, Tsharp, Goodness, Choker, etc.).
- **Ambient Pedestrians & Background Crowds**: Modular Quaternius characters with 20+ distinct Lagos roles, infinite deterministic procedural variations, and low memory footprint.
- **Advantage**: Narrative immersion and close-up emotional dialogue remain cinematic and expressive; street crowds achieve high visual diversity without performance drops.

### Option 2: Quaternius Modular Bodies for Everyone
- **Entire World (Player, Named NPCs, and Pedestrians)**: Migrated completely to the Quaternius modular base.
- **Advantage**: 100% stylistic uniformity across all characters in the game engine; unified clothing shell and modular customization pipeline.
- **Trade-off**: Requires bespoke stylized modular hair/face/accessory assemblies for every named NPC to retain their distinctive narrative profiles.

---

## 4. Visual Evidence & Contact Sheets

Contact sheets rendered under both Lagos Island midday and night conditions:
- **Day Lighting**: `docs/characters/contact-sheets/contact_sheet_day.png`
- **Night Lighting**: `docs/characters/contact-sheets/contact_sheet_night.png`
