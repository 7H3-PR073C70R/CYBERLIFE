# Your game's photorealistic graphics upgrade plan

For your existing Three.js + React + Vite game, I recommend a cinematic rendering pipeline built around high-quality assets, physically based materials, realistic lighting, atmospheric effects, and carefully controlled post-processing.

The key is to upgrade the world you already have rather than asking Antigravity to rebuild the entire game. Your existing gameplay, story, controls, camera behavior, and interactions should remain intact while the visual quality improves.

The target is a world that feels filmed rather than computer-generated: believable surfaces, natural light, detailed environments, atmospheric depth, and cinematic transitions between story moments.

## 1. The visual target

The Last of Us Part I im Nachtest: Wie läuft der VRAM- und CPU-Fresser nach 11 Updates?

Realistic environments

Detailed architecture, terrain, roads, vegetation, debris, and believable wear.

Building a Desert Scene with Modular Kit & Trim Sheets

Natural lighting

Sunlight, soft shadow transitions, bounce-light approximation, and atmospheric depth.

Flux 1.1 Pro Ultra vs ImagineArt 1.5: 4MP Raw Mode vs Lifelike Realism - ImageGPT Learn

Environmental storytelling

Scattered objects, weathering, damage, and visual clues that support the narrative.

Next Gen - Hero Shots - Canopy - Procedural Worlds

Cinematic atmosphere

Fog, dust, restrained color grading, and lighting that changes with the story.

These are visual references for the intended quality, not a guarantee that any single rendering technique will reproduce them. The final result depends heavily on the actual assets, scene composition, and hardware.

## 2. Recommended rendering pipeline

Build this in layers, testing each stage before adding the next.

1. Environment and asset quality

Detailed GLB/glTF models, terrain, vegetation, props and PBR textures

2. Physically based lighting

HDR environment lighting, directional sunlight, ambient fill and selective shadows

3. Atmospheric depth

Fog, distance haze, particles, weather and subtle environmental motion

4. Cinematic finishing

Tone mapping, color grading, restrained bloom and carefully chosen camera effects

5. Performance and quality scaling

Adaptive resolution, optimized shadows, compressed assets and stable frame rates

### Layer 1 — Environment assets

Use high-quality models in `.glb` or `.gltf` format, with realistic scale and properly authored materials.

My preferred starting points:

Textures: Asphalt • Poly Haven

Poly Haven

Best starting point for free PBR materials, HDRIs, and selected 3D models. Its assets are released under CC0, including for commercial use.

Poly Haven

+1

[Browse assets](<https://polyhaven.com/?utm_source=chatgpt.com>)

Old Running Bond Brick Wall Texture, Beige - Poliigon

ambientCG

Useful for filling a scene with consistent materials such as brick, concrete, wood, soil and metal. Verify the license on the downloaded assets.

[Browse materials](<https://ambientcg.com/?utm_source=chatgpt.com>)

Hotel ruin - Buy Royalty Free 3D model by axonite \[b941d3d\] - Sketchfab Store

Sketchfab

Useful for finding specific props, vehicles, architecture, and scanned objects. Downloadable formats and licenses vary by model.

[Browse models](<https://sketchfab.com/3d-models?utm_source=chatgpt.com>)

A critical rule: don't fill the entire game with random detailed assets. Choose assets that belong to the same visual world, and use a consistent texture resolution, scale, and material quality.

For each important surface, prioritize:

- Base color / albedo.
- Normal maps for surface detail.
- Roughness maps for realistic reflections.
- Ambient occlusion maps where available.
- Appropriate geometry for silhouettes and close-up objects.

These maps serve different purposes in the glTF physically based material workflow.

Khronos Registry

+1

### Layer 2 — Lighting and shadows

For the first lighting pass, use a simple, intentional setup rather than dozens of lights.

Directional light

Represents the sun. Set the angle to establish the scene's mood and create the principal shadows.

HDR environment map

Adds convincing environmental illumination and reflections to metallic and glossy surfaces. Use an environment map suited to the scene, not an unrelated studio image.

Local lights

Reserve point and spot lights for meaningful sources: lamps, headlights, windows, fires, and other visible light sources.

Shadows and contact

Start with a shadow-casting directional light and selected shadow receivers. Use baked ambient occlusion or contact-shadow techniques where suitable, without stacking multiple expensive effects everywhere.

Use Three.js's official [color management guide](<https://threejs.org/manual/pages/color-management.html?utm_source=chatgpt.com>) to avoid washed-out textures, incorrect brightness, and inconsistent color when adding post-processing.

Three.js

One important limitation: HDR environment lighting is not a substitute for full real-time global illumination. Three.js generally needs approximations, baked lighting, or more advanced techniques to produce convincing indirect light in real time.

## 3. The rendering techniques I would prioritize

Not every graphics effect delivers equal value. For your game, I would prioritize them in this order.

Wet asphalt material 05 4k seamless PBR 3D Model - 3DSKY Decor Helper

Priority 1: PBR materials and surface detail

Highest impactReplace flat materials with realistic textures. Concrete needs pores and stains, metal needs varied roughness, and roads need wear, patches, and subtle imperfections. This often improves realism more than adding extra lights.

The Last Of Us Part II : Toutes les entrées de journal d'Ellie

Priority 2: Lighting, exposure, and shadows

Establish one consistent time of day, choose a natural key-light direction, and tune shadow quality. Ensure bright surfaces retain detail and dark areas aren't crushed into black.

Horizon Forbidden West, screen shot, PC gaming, post apocalypse, sunlight, Guerrilla Games, clouds, video game art, trees, video games, landscape, mountains, sky, CGI, nature, path, grass | 1920x1080 Wallpaper - wallhaven.cc

Priority 3: Atmospheric depth

Use distance fog, subtle haze, and environmental particles only where appropriate. Fog should help distant objects blend naturally into the world, not obscure the entire scene.

ASUS ROG Strix Scar 17 - Review - Early Axes

Priority 4: Post-processing

Add a restrained filmic tone-mapping approach, subtle bloom for genuinely bright sources, and carefully controlled color grading. Depth of field should be reserved for deliberate cinematic moments rather than constantly blurring gameplay.

Pine Forest Pack | Fab

Priority 5: Environmental density

Populate the world with carefully placed rocks, plants, debris, furniture, and small story-relevant objects. Use instancing for repeated objects and level-of-detail strategies for distant geometry.

## 4. Choose a practical browser graphics stack

This is the stack I would ask Antigravity to evaluate first.

| Area | Recommendation |
| --- | --- |
| Renderer | Keep your existing Three.js renderer |
| Scene integration | Keep React Three Fiber if already installed; don't migrate solely for graphics |
| Models | GLB/glTF with `GLTFLoader` |
| Materials | `MeshStandardMaterial` and `MeshPhysicalMaterial` where appropriate |
| Environment lighting | HDR environment maps using the appropriate Three.js environment pipeline |
| Shadows | Selective real-time shadows with optimized shadow cameras and map resolution |
| Post-processing | Three.js `EffectComposer` pipeline, with correct output color handling |
| Atmospheric effects | Distance fog first; custom volumetric effects only if the performance budget allows |
| Asset loading | Compressed glTF, KTX2 textures where suitable, and lazy loading for distant or future areas |
| Performance | Adaptive rendering quality, instancing, geometry reuse, and draw-call reduction |

For official technical references, start with the [Three.js color management guide](<https://threejs.org/manual/pages/color-management.html?utm_source=chatgpt.com>), the [React Three Fiber documentation](<https://r3f.docs.pmnd.rs/?utm_source=chatgpt.com>), and the [Khronos glTF specification](<https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html?utm_source=chatgpt.com>).

Three.js

+2

### Suggested quality profiles

Because you want the game to run in PC and laptop browsers, don't force every device to render the same expensive scene.

High quality

Higher render resolution, better shadow maps, more visible detail, and optional cinematic effects.

Balanced — default

Moderate resolution scaling, selective shadows, controlled post-processing, and sensible texture budgets.

Performance

Lower render scale, reduced shadow resolution, fewer particles, and simplified distant details.

As an initial target, aim for 60 FPS on capable gaming hardware and a stable 30–60 FPS on less powerful laptops. These are goals to measure, not guarantees. Adaptive resolution and reduced effects can help, but they cannot compensate for an overloaded scene or poor asset optimization.

## 5. Ready-to-paste Antigravity implementation prompt

The following prompt is designed to make Antigravity inspect your actual project before changing it. This is important because blindly adding another renderer, lighting system, or post-processing library can break a working game.

Writing

# TASK: Upgrade My Existing Three.js + React + Vite Game to Cinematic Photorealistic Quality

## Your role

Act as a senior real-time graphics engineer, Three.js specialist, technical artist, and game performance engineer.

I am the creator and idea owner of this game. I rely on you to implement the technical work, explain important decisions in plain English, and preserve the existing game while improving its visuals.

## Project context

- Framework: React + Vite
- 3D engine: Three.js
- Game type: Story-driven cinematic adventure
- Target visual quality: Photorealistic, natural, cinematic environments
- Target platforms: PC and laptop browsers
- Current state: The game already has a playable 3D world.
- Main objective: Significantly improve environmental realism, lighting, materials, atmosphere, and cinematic presentation.

## PHASE 1 — Inspect before changing anything

First inspect the existing project, including:

- package.json and installed dependencies
- Vite configuration and application entry points
- The existing Three.js scene and renderer initialization
- Whether the game uses plain Three.js or React Three Fiber
- Camera setup and player controls
- Existing lighting, materials, shadows, and post-processing
- Model loading, texture loading, and asset directories
- Existing game state, story progression, interaction logic, and UI
- Current rendering performance and any obvious bottlenecks

Do not assume the project structure or invent file paths before inspecting the repository.

Create a concise implementation plan based on the real code.

Preserve the existing architecture. Do not migrate to React Three Fiber, replace the renderer, or introduce a new engine unless there is a demonstrated technical reason.

## PHASE 2 — Protect the existing game

Before implementation:

1. Record the current state of the project and use version control or another safe rollback method if available.
2. Identify all files that will need modification.
3. Keep the existing story, missions, dialogue, player movement, collision behavior, camera controls, interactions, audio, and UI working.
4. Avoid unrelated refactoring.
5. Do not replace working gameplay with a graphics demo or a disconnected sample scene.
6. Preserve existing assets and reuse them where possible.

If a requested visual improvement conflicts with existing gameplay, explain the conflict and choose the least disruptive solution.

## PHASE 3 — Implement a realistic environment pipeline

Improve the existing scene using these priorities.

### A. Materials and textures

- Prefer properly authored GLB/glTF assets with physically based materials.
- Use MeshStandardMaterial or MeshPhysicalMaterial where appropriate.
- Improve important surfaces such as terrain, roads, concrete, walls, wood, metal, glass, and vegetation.
- Use base color, normal, roughness, ambient occlusion, and other supported maps when available.
- Use physically plausible roughness and metalness values.
- Ensure materials have realistic scale and texture repetition is not conspicuous.
- Avoid flat, overly saturated, uniformly glossy, or plastic-looking surfaces.
- Correct texture color-space handling.
- Do not invent paths to assets or reference nonexistent texture files.
- If assets are missing, create a prioritized asset manifest and use sensible existing fallbacks.

### B. Lighting and shadows

- Establish a coherent natural lighting direction and time-of-day mood.
- Improve directional sunlight, environment lighting, exposure, and shadow softness.
- Use HDR environment maps where appropriate for image-based lighting and reflections.
- Use local lights only when they have a purpose in the environment.
- Optimize shadow cameras, shadow map resolution, shadow distance, and shadow-casting objects.
- Avoid enabling expensive shadows on every object indiscriminately.
- Avoid excessive ambient illumination that flattens the scene.
- Avoid overexposed highlights, crushed blacks, and artificial-looking contrast.
- Do not claim to have implemented full global illumination if the solution uses approximations.

### C. Atmospheric depth

- Introduce restrained distance fog where it fits the environment.
- Ensure fog color blends naturally with the background and lighting.
- Add subtle dust, mist, rain, or other particles only when appropriate to the game's setting and story.
- Use lightweight techniques first.
- Do not introduce expensive volumetric effects unless profiling demonstrates that the target hardware can support them.
- Preserve visibility for gameplay-critical objects and navigation.

### D. Cinematic post-processing

Evaluate the existing rendering pipeline before adding effects.

If needed, introduce a compatible post-processing pipeline with:

- Filmic tone mapping
- Correct output color-space conversion
- Subtle bloom for bright light sources
- Carefully tuned contrast and color grading
- Optional depth of field for explicit cinematic sequences

Keep post-processing restrained. Avoid excessive bloom, chromatic aberration, sharpening, motion blur, or permanently blurred gameplay.

If using EffectComposer, ensure the final output is color-correct and does not apply output conversion twice or omit it entirely.

Avoid adding duplicate rendering passes or multiple competing post-processing systems.

### E. Environment detail

Increase environmental believability with appropriately placed details such as:

- Surface wear, stains, cracks, dirt, and imperfections
- Rocks, plants, foliage, and terrain variation
- Relevant furniture, debris, signs, vehicles, and props
- Subtle environmental motion when suitable
- Background geometry and visual landmarks
- Small visual clues that support the story

Do not scatter random props without considering the game's narrative, location, and composition.

Use instancing, shared geometry, texture reuse, level of detail, and visibility management where appropriate.

Do not replace the existing level or change its layout without approval.

## PHASE 4 — Asset acquisition and management

Use existing assets first, then identify gaps.

Preferred starting sources:

- Poly Haven: https://polyhaven.com/
- ambientCG: https://ambientcg.com/
- Sketchfab: https://sketchfab.com/3d-models

Check the license of every downloaded asset. Do not assume every third-party model is free for commercial use.

For external assets:

- Download only assets that genuinely improve the existing world.
- Prefer glTF/GLB for browser delivery.
- Use KTX2/Basis texture compression where appropriate and configure its decoder correctly.
- Use geometry compression only with the required compatible decoder.
- Keep high-resolution assets focused on visible, important areas.
- Use appropriate texture resolutions, mipmaps, and level-of-detail strategies.
- Avoid loading a large collection of unused assets.
- Do not hotlink third-party asset URLs as a permanent production solution.
- Keep a simple asset manifest with filenames, intended uses, sources, and license notes.

If you cannot download or create an asset in your environment, clearly identify what is missing and how I can obtain it. Do not pretend an asset has been installed.

## PHASE 5 — Browser performance

The game must remain playable in desktop browsers on both gaming PCs and ordinary laptops.

Implement or improve a graphics-quality configuration with:

- High, Balanced, and Performance presets
- Configurable render resolution or pixel ratio
- Adaptive resolution if practical and stable
- Configurable shadow quality
- Optional expensive post-processing
- Controlled particle density
- Efficient model and texture loading
- Resource cleanup when objects or scenes are removed
- Proper disposal of GPU resources
- Efficient draw-call and geometry management
- Graceful handling of WebGL initialization failures where feasible

Do not use a permanent maximum device pixel ratio on every machine.

Do not create a new WebGL renderer every time a React component rerenders.

Avoid unnecessary React state updates on every animation frame.

If using React Three Fiber, follow its frame-loop and resource-management conventions. If using plain Three.js, preserve the current render loop and its lifecycle.

Do not enable WebGPU or migrate the application to a different renderer as part of this task.

Aim for approximately 60 FPS on capable gaming hardware and a stable 30–60 FPS on less powerful supported laptops. Treat these as measured performance goals rather than guaranteed outcomes.

## PHASE 6 — Cinematic storytelling

Support the existing story without rewriting it.

Where appropriate:

- Improve lighting and atmosphere at important narrative locations.
- Use composition and visible landmarks to guide the player.
- Create distinct moods for different environments.
- Support cinematic lighting changes during existing scripted sequences.
- Keep gameplay visibility, player controls, and interactive objects clear.
- Ensure transitions do not cause abrupt exposure changes or visual glitches.

Do not add new plot points, missions, characters, or story events without approval.

## PHASE 7 — Implementation and validation

Implement the upgrade incrementally.

After each major stage:

1. Run the existing build or type checks.
2. Fix errors caused by your changes.
3. Inspect for missing assets and failed imports.
4. Check that the game still starts and the existing world renders.
5. Verify that the player, camera, interactions, story progression, and UI remain functional.
6. Check browser console errors and WebGL warnings.
7. Measure rendering performance before and after where possible.
8. Compare screenshots of the same scene under the original and upgraded settings, if browser preview tools are available.

Do not claim to have visually verified a scene if you could not run or inspect it.

Do not fix unrelated problems by deleting functionality.

If a dependency is necessary, verify compatibility with the project's current versions before installing it.

## PHASE 8 — Final deliverables

When finished, provide:

1. A plain-English summary of the most important visual improvements.
2. A list of files created or modified.
3. A list of new dependencies and why each was needed.
4. Any assets I still need to download or license.
5. The available graphics-quality settings and how to adjust them.
6. Build and validation results.
7. Before-and-after performance measurements, if obtainable.
8. Any remaining limitations or recommended next steps.

## Acceptance criteria

The task is complete only when:

- The existing game still runs.
- The original story and gameplay remain intact.
- Materials and lighting look more natural than before.
- The environment has greater visual depth and surface detail.
- Post-processing is correctly configured and not excessive.
- The game has sensible quality settings for different PC and laptop hardware.
- No nonexistent assets or unverified dependencies are referenced.
- The final implementation is documented and maintainable.

Begin by inspecting the actual project. Then explain the plan briefly and implement the highest-impact improvements first. Do not merely give me a tutorial or generate a separate demonstration scene. Upgrade the game I already have.

## 6. How to get the best results from Antigravity

Don't ask it to perform every visual upgrade in one giant pass and assume the result is finished. Have it work in stages and inspect the result after each one.

1. First pass: Fix materials, texture color spaces, lighting, and shadows. Run the game and compare the result.
2. Second pass: Replace the most noticeable low-quality assets and improve the environment's details.
3. Third pass: Add atmospheric effects and cinematic post-processing, one effect at a time.
4. Fourth pass: Optimize performance and add quality presets. Test a representative outdoor scene and an interior scene if your game has both.

A useful follow-up instruction after the first pass is:

> Do not add more visual effects yet. Inspect the current rendered result and identify the five biggest reasons it still looks like a computer-generated scene rather than real life. Rank them by visual impact, explain each in plain English, and fix the biggest two without changing gameplay.

That encourages Antigravity to solve the actual visual problems instead of endlessly layering effects on top of them.

## 7. One thing I need from you to make this more precise

What does your game world currently look like?

If possible, upload one screenshot of the actual game — ideally one that shows the player and the surrounding environment. A screenshot will help determine whether the biggest limitation is the geometry, textures, lighting, scene composition, or something else.

I can then help you develop a second, much more targeted Antigravity prompt for your specific scene rather than relying on generic graphics upgrades.

What you need is more than a Python downloader. You need an intelligent asset discovery and staging system that works alongside Antigravity, understands your existing game, finds the assets it lacks, downloads multiple candidates, and gives you a clean folder where you can review and delete anything you don't want.

I'd design it so that Antigravity can run it whenever you improve a scene, but the system can also audit the entire game when you ask it to.

The most important principle: the script should automatically discover and organize assets, but it should never automatically inject every downloaded asset into your playable game. You review the candidates first, then Antigravity integrates the approved ones.

## 1. How the intelligent asset manager should work

1. Audit the entire game

Inspect source code, scenes, models, textures, materials, story locations and missing assets.

2. Build an asset requirements list

Determine asset types, quantities, visual style, quality, formats and priorities.

3. Select suitable asset sources

Search different providers according to the asset type, availability, licensing and quality.

4. Download multiple candidates

Collect multiple models, textures, HDRIs and other needed assets in a separate staging folder.

5. Review and curate

Preview, compare, keep, delete, and approve assets without damaging the game.

6. Integrate approved assets

Antigravity imports only the assets you approve and updates the relevant scenes.

## 2. It should know which websites to use

Don't hard-code one website for every asset. Use a provider registry that tells the system which sources are best suited to each category.

| Asset category | Preferred source | Why |
| --- | --- | --- |
| PBR textures | [Poly Haven](<https://polyhaven.com/?utm_source=chatgpt.com>) and [ambientCG](<https://ambientcg.com/?utm_source=chatgpt.com>) | Realistic surface materials and texture maps |
| HDRI environments | [Poly Haven](<https://polyhaven.com/?utm_source=chatgpt.com>) | Environment lighting and sky imagery |
| 3D props and models | [Poly Haven](<https://polyhaven.com/?utm_source=chatgpt.com>) and [Sketchfab](<https://sketchfab.com/3d-models?utm_source=chatgpt.com>) | Buildings, furniture, objects, vegetation and props |
| Reference photographs | [Openverse](<https://openverse.org/?utm_source=chatgpt.com>) | Research and visual reference, with license checks |
| Custom or missing hero assets | A separately configured model provider or manual asset request | Unique story-critical assets that existing libraries don't provide |

Poly Haven provides a public API for searching and retrieving models, textures and HDRIs.

GitHub

+1

 Sketchfab offers model and download APIs, but downloads depend on the model's availability, permissions and API requirements.

Sketchfab

The script should maintain provider adapters so additional websites can be added later without rewriting the entire tool.

## 3. The folder structure I recommend

Keep the review area separate from the production assets.

your-game/

tools/asset\_manager/

asset\_manager.py · provider adapters · configuration · manifests

asset\_review/

audit reports and candidate assets awaiting your decision

models/

textures/

hdris/

audio/

references/

Each asset should have metadata, its source URL, license details and validation status.

public/assets/

Approved production assets only

You should be able to change the review folder in a configuration file or through a command-line option, so the tool doesn't assume a particular computer or drive.

## 4. The review and deletion workflow

I would give you both a command-line interface and, eventually, a simple local review page.

A review page could show asset thumbnails, file sizes, source links, license information and preview models where supported. You could mark multiple candidates as keep, reject, or needs review.

For deletion, use a reversible quarantine by default: rejected assets move into a separate folder, and permanent deletion is a distinct action. That protects you from accidentally deleting a useful model or an entire set of material maps.

It must also understand asset groups. For example, a single downloaded material may contain:

- `asphalt_basecolor.png`
- `asphalt_normal.png`
- `asphalt_roughness.png`
- `asphalt_ambient_occlusion.png`

Those files represent one material candidate, not four independent assets. If you reject the material, the system should handle the complete group together.

The same grouping principle applies to multi-file models, including their textures and dependencies.

## 5. The master prompt for Antigravity

This is the instruction I'd use to have Antigravity build the actual system in your repository.

Writing

# Build an Intelligent Python Asset Discovery, Download, Audit and Review System

## Mission

Build a reusable, intelligent asset management system for my existing React + Three.js + Vite story-driven game.

I am the idea owner and depend on Antigravity to perform the technical work.

Create a Python tool that audits the entire application, determines which visual assets are missing or inadequate, selects suitable asset websites, discovers multiple candidates for each requirement, downloads them into a configurable review folder, validates and organizes the downloads, and allows me to keep or reject assets before they are integrated into the game.

This must be a real, working implementation in my existing repository, not just a design document, pseudocode, or demonstration.

## 1\. Inspect the existing project

Before implementing anything:

- Inspect the project structure, package.json, Vite configuration and installed dependencies.
- Identify the actual Three.js renderer and scene initialization.
- Determine whether the project uses plain Three.js or React Three Fiber.
- Locate scene definitions, model loaders, material definitions, textures, environment maps, asset references, story locations and any existing asset manifest.
- Identify missing files, placeholder models, primitive geometry used in place of realistic objects, low-quality materials and repeated assets.
- Search the entire project while excluding node\_modules, build output, caches, version-control internals and other irrelevant directories.
- Do not assume that every primitive geometry or simple material is a problem. Some may be intentional gameplay elements.

Create a baseline audit report before changing the project.

## 2\. Create a modular Python application

Use Python 3 with a maintainable, modular architecture.

Create a structure similar to:

tools/asset\_manager/ asset\_manager.py config.json requirements.txt README.md core/ auditor.py requirements\_builder.py asset\_matcher.py downloader.py validator.py manifest.py file\_manager.py licensing.py reports.py providers/ base.py polyhaven.py ambientcg.py sketchfab.py review/ review\_server.py tests/

Adapt the layout if the existing repository has better conventions.

The system must remain easy for Antigravity to extend. Each asset provider should implement a common interface so additional sources can be added without changing the audit, review and download logic.

Use reliable libraries, explicit error handling, sensible timeouts, bounded retries, download size limits, and clear logs.

Do not introduce unnecessary dependencies.

## 3\. Whole-project audit

Build a real audit engine that inspects the existing game and produces structured findings.

Detect:

- Existing models and their file formats.
- Existing textures and material maps.
- Environment maps and HDRIs.
- Models referenced in source code but missing from disk.
- Placeholder geometry and obvious placeholder textures.
- Materials that lack appropriate maps when those maps would improve realism.
- Repeated asset requirements across scenes.
- Story locations and environments that need additional assets.
- Assets that are present but potentially unsuitable for the intended visual style.
- Large assets and obvious loading or performance risks.
- Existing assets that can be reused rather than downloaded again.

Use static source-code inspection first. Where feasible, support an explicit asset manifest or scene registry for information that cannot be inferred reliably from source code.

Do not claim to understand runtime scene contents that static inspection cannot establish.

Do not overwrite or modify the original gameplay code as part of the audit.

## 4\. Intelligent requirements builder

Convert audit findings into explicit asset requirements.

Each requirement should include:

- A stable requirement ID.
- Scene or location.
- Asset category.
- Natural-language description.
- Intended role in the game.
- Required format.
- Number of candidates requested.
- Desired quality and resolution.
- Style, setting and material characteristics.
- Licensing constraints.
- Maximum download size.
- Priority.
- Existing alternatives.
- Current status.

Support multiple assets of the same type and structured groups of related assets.

Examples:

- Six distinct realistic urban props.
- Ten compatible foliage models.
- Five asphalt material candidates, each with its associated texture maps.
- Three suitable HDRI lighting candidates.
- Multiple building models suitable for an abandoned industrial environment.

Do not create duplicate requirements for the same underlying need unless variations are intentional.

Allow configuration of the candidate count and overall download budget.

## 5\. Intelligent provider selection

Implement provider adapters rather than relying on a single website.

Start with:

### Poly Haven

API: [https://api.polyhaven.com/](<https://api.polyhaven.com/>)

Use for HDRIs, PBR materials and supported 3D models.

Read the live API documentation. Search assets, inspect their metadata and file trees, select appropriate download formats and resolutions, and download only valid files.

### ambientCG

Website: https://ambientcg.com/

Use for compatible PBR materials and texture sets.

Investigate its current available discovery and download mechanisms before implementing the adapter. Do not invent endpoints.

### Sketchfab

Website: https://sketchfab.com/3d-models

Use for relevant downloadable 3D models when the model's license and download permissions allow the intended use.

Respect authentication, API access restrictions, rate limits and provider terms. Do not bypass access controls or scrape restricted content.

### Extensible provider registry

Implement provider selection based on:

- Asset category.
- Visual relevance.
- Required file format.
- Availability of complete material maps.
- License compatibility.
- File size.
- Quality and resolution.
- Provider reliability.
- Existing local assets.

Record why a provider was selected.

If a source does not provide a suitable candidate, continue to the next compatible provider.

Never invent a source, model, download URL, license or successful download.

If a provider requires credentials, document the setup and keep secrets outside the repository and outside Vite's public assets.

## 6\. Candidate discovery and intelligent ranking

For every requirement, discover multiple candidate assets when available.

Use a deterministic scoring system with explainable criteria:

- Semantic relevance.
- Asset category and file-format match.
- Visual style and environment compatibility.
- Texture completeness.
- Resolution and detail.
- License suitability.
- Download size and expected runtime cost.

Use provider search APIs and metadata first. If an optional AI ranking service is configured, use it to improve semantic matching, but do not make the core pipeline dependent on a paid AI API.

Never claim visual similarity has been verified unless the asset's visual content was actually inspected.

Deduplicate candidates using provider IDs, source URLs, file hashes and suitable metadata.

Retain useful alternatives instead of downloading many near-identical assets.

## 7\. Download and staging system

Download all selected candidates into a configurable review directory, completely separate from the production asset directory.

The default may be `asset_review/`, but allow a custom destination through configuration and a command-line argument.

Organize by category, scene, requirement and candidate where appropriate.

For example:

asset\_review/ reports/ manifests/ models/ textures/ hdris/ audio/ references/ quarantine/

Adapt categories to the assets the game actually requires.

Support:

- Multiple downloads per requirement.
- Bounded parallel downloads.
- Progress reporting.
- Retry and resume where technically possible.
- Skipping verified existing downloads.
- Temporary files for incomplete downloads.
- Download size limits.
- Duplicate detection.
- Safe filenames.
- Path traversal protection.
- Atomic finalization of completed downloads.

Do not execute downloaded content.

Do not overwrite existing files silently.

Do not integrate unapproved downloads into the playable game.

## 8\. Preserve structured asset groups

A model or material may depend on multiple related files.

Treat these as one logical asset group when appropriate.

Examples include:

- GLB model plus external texture dependencies.
- Base color, normal, roughness and ambient occlusion maps.
- Model files with associated license information.
- Other multi-file formats discovered through a provider.

Keep group metadata in the manifest so review and deletion operate on the entire group.

Never delete one material map while leaving a supposedly complete material group marked as valid.

## 9\. Validation and licensing

Validate each download before marking it ready for review.

Check:

- File integrity and non-zero size.
- Expected extension and content type.
- Valid JSON structure for glTF JSON files.
- GLB header and structural validity where applicable.
- Texture readability and dimensions.
- Whether referenced local dependencies exist.
- Whether an asset group contains its expected maps.
- Duplicate hashes.
- Reasonable size and dimension limits.
- Source metadata and license information.

Use suitable parsing libraries or compatible validators where necessary. A valid file extension alone is not sufficient.

For every candidate, record:

- Asset name and ID.
- Provider.
- Original page URL.
- Actual download URL when permitted to retain it.
- Author or creator where available.
- License identifier and license URL.
- Attribution requirements.
- Retrieval date.
- Downloaded filenames.
- File hashes.
- Validation results.
- Candidate score and scoring explanation.

Do not treat unknown licensing as automatically acceptable for commercial use. Mark uncertain candidates for review.

## 10\. Review interface and deletion

Implement a straightforward local review interface if practical, with a CLI fallback.

The interface should display:

- Asset thumbnails where available.
- Downloaded model previews where feasible.
- Asset category and group membership.
- Scene and requirement.
- File sizes.
- Source and license.
- Validation status.
- Candidate ranking.
- Keep, reject and needs-review actions.

Support batch decisions for multiple candidates.

Rejected assets should be moved into quarantine by default rather than permanently deleted.

Provide a separate explicit command for permanent deletion, with a confirmation step and safeguards against deleting files outside the configured review root.

Deleting a candidate must update the manifest and handle its complete asset group.

Keep a record of decisions so future audits do not repeatedly download rejected candidates.

Provide a way to restore quarantined files.

Do not build an unauthenticated network-facing deletion service. Keep any review server local to the user's machine.

## 11\. Manifest and audit history

Maintain machine-readable manifests, preferably JSON initially.

Track statuses such as:

- needed
- discovered
- selected
- downloaded
- validated
- review\_required
- approved
- rejected
- quarantined
- integrated
- failed

Keep audit runs separate and record which files and requirements changed.

Make repeated runs idempotent: running the same audit twice should not download the same assets repeatedly or overwrite the user's review decisions.

Detect when an approved asset already satisfies a requirement.

Allow manual corrections and asset additions without requiring an AI service.

## 12\. Antigravity integration

Create a project instruction file, such as AGENTS.md if supported by this environment, explaining when and how to run the asset manager.

Document these proposed commands and implement them consistently:

python tools/asset\_manager/asset\_manager.py audit python tools/asset\_manager/asset\_manager.py discover python tools/asset\_manager/asset\_manager.py download --approved python tools/asset\_manager/asset\_manager.py review python tools/asset\_manager/asset\_manager.py report

Use `--help` to expose the actual supported options.

Support a dry-run mode that performs discovery and planning without downloading or modifying files.

The intended workflow is:

1. Antigravity audits the project.
2. The system creates an asset requirements report.
3. Candidate assets are discovered and ranked.
4. Approved downloads are staged in the review folder.
5. I review the candidates and remove unwanted assets.
6. Antigravity integrates only assets I have explicitly approved.
7. The audit is rerun to verify the remaining requirements.

Do not automatically change scene files, gameplay code, or production assets merely because a download succeeded.

## 13\. Security and operational safeguards

- Never run downloaded executables, scripts or installer files.
- Do not follow arbitrary URLs found inside untrusted asset metadata without validation.
- Restrict downloads to approved HTTPS sources and validate redirects.
- Protect against path traversal, archive extraction attacks, oversized files and malformed metadata.
- Keep credentials out of source code and browser-visible directories.
- Use timeouts, rate limits and concurrency limits.
- Keep logs free of credentials and private information.
- Respect each provider's terms, licensing and download permissions.
- Require explicit approval for irreversible deletion and production integration.

## 14\. Tests and completion criteria

Write tests for:

- Manifest handling.
- Provider selection.
- Candidate ranking.
- Duplicate detection.
- Asset group management.
- Safe downloads.
- File validation.
- Quarantine and restoration.
- Permanent deletion safeguards.
- Idempotent reruns.
- Missing provider credentials.
- Network errors and invalid files.

Mock external network services in automated tests.

Run the tests and validate the CLI.

Do not claim a provider adapter works until its behavior has been tested against its documented API or verified using a safe real request.

At completion, tell me:

1. Which files you created.
2. Which commands actually work.
3. Which provider adapters are implemented and tested.
4. How to configure the review folder.
5. How to run an audit and download candidates.
6. How to review, reject, restore and delete assets.
7. What requires credentials or manual action.
8. Any limitations and outstanding tests.

Begin by inspecting the actual repository. Then implement a working minimum version, validate it, and extend it incrementally. Prioritize a reliable audit, Poly Haven integration, grouped downloads, manifest management, review-folder staging and safe deletion before adding optional AI ranking or a sophisticated web interface.

## 6. The commands I would expect you to have

Once Antigravity implements the tool, the workflow should look something like this:

bash
```
# Scan the entire application
python tools/asset_manager/asset_manager.py audit

# Find multiple candidates for missing assets
python tools/asset_manager/asset_manager.py discover

# Preview the download plan without downloading
python tools/asset_manager/asset_manager.py download --dry-run

# Download candidates approved by the configured policy
python tools/asset_manager/asset_manager.py download --approved

# Open the local review interface
python tools/asset_manager/asset_manager.py review

# Produce an audit and download summary
python tools/asset_manager/asset_manager.py report
```

These are the target commands for Antigravity to implement, not an existing script that is already installed.

## 7. What I would build first

To keep this manageable, build the system in three stages.

- Stage 1 — Working asset engine: whole-project audit, asset requirements, Poly Haven discovery, multiple downloads, grouped texture maps, manifest, license records, and configurable staging folder.
- Stage 2 — Review and management: previews, batch keep/reject, quarantine, restoration, duplicate detection, and safe deletion.
- Stage 3 — Smarter discovery: additional providers, better scene understanding, semantic ranking, automatic identification of placeholder geometry, and optional AI-assisted candidate evaluation.

The most important thing is that this becomes a reusable tool for your entire game, not a one-off script that only knows about one scene.

One limitation to keep in mind: a Python script can inspect source code and asset files, but it cannot always determine from code alone whether a building, character, or texture looks right. For that, the review interface and, later, visual inspection of actual rendered scenes are essential.

Websites:

https://polyhaven.com/textures
https://polyhaven.com/models
https://polyhaven.com/hdr

https://sketchfab.com
