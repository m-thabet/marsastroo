# Mars Mission Commander — asset production checklist

Updated 13 November 2026. This is the authoritative asset brief for the full-screen 3D Mars experience described in [solution.md](solution.md) and [tech plan.md](tech%20plan.md). Application development remains paused for review. All dimensions, polygon counts, and durations below are project production targets, not scientific measurements.

Step-by-step Egyptian Arabic instructions, AI prompts, Blender/MCP setup, and audio preparation: [How to Do Assets.md](How%20to%20Do%20Assets.md).

Preparation status and the user's next actions: [Assets Progress.md](Assets%20Progress.md). Some source files, draft sounds, prompt cards, and a Blender script are prepared; this does not mean the final artwork or 3D models have been created or approved.

## 1. Where to deliver

Put source assets in the existing project-root [Assets folder](../Assets). Suggested organization:

```text
Assets/
  references/       visual examples and preferences
  world/            globe texture, terrain, ground materials
  buildings/        eight separately selectable facilities
  vehicles/         rover
  props/            rocks, samples, connectors
  characters/       NOVA, Alex, and Maya portraits
  branding/         optional original logo
  audio/            optional effects, ambience, and approved voice recordings
  source/           editable Blender projects and original artwork
  previews/         model turntables or screenshots
  asset-manifest.md source, license, credit, scale, and animation notes
```

These are delivery folders, not folders you need to create before starting. Use lowercase filenames with hyphens. Keep original `.blend`/art/audio sources alongside browser-ready exports. Do not overwrite the application's existing `public/assets`; optimized runtime copies will be prepared during implementation.

For every delivered item, add a manifest entry containing filename, author/source, source URL if applicable, permission/license, required credit, creation/retrieval date, and whether it is original art or scientific data. For models also list dimensions, triangle count, texture sizes, named parts, and animation clips. For generated assets, identify the creation tool and any relevant usage restrictions.

## 2. Shared visual direction

**Recommended style: stylized realism.** Natural Mars terrain, believable engineering, readable shapes, restrained detail, and a consistent material palette. The world should feel like an explorable landscape viewed through a strategy-game camera.

- Terrain: dusty rust, ochre, brown stone, visible relief, modest color variation. Keep important objects legible against it.
- Facilities: warm off-white/gray surfaces, charcoal structural parts, muted blue solar cells, restrained green accents for plant systems. Different silhouettes identify different functions.
- Rover: matches the facilities' engineering style; visible wheels, mast, and scientific equipment.
- Characters: friendly, capable, age-appropriate, and visually consistent with one another. Avoid a mixture of photorealistic faces and cartoon portraits unless intentionally approved.
- Keep warning colors, selection highlights, route lines, labels, and buttons out of textures. Those will be drawn by the game.
- Do not bake a fixed camera angle, a rectangular UI frame, text, directional sunlight, or long ground shadows into ordinary assets. The camera and lighting move.
- Ground and objects need to look good from a tilted overhead view and a closer inspection view. Tiny details that disappear overhead are lower priority than silhouette and material consistency.

Google Earth and Red Alert are interaction/camera references. Their screenshots can be reference material, but their art, logos, interface graphics, and map tiles are not deliverable game assets.

## 3. Produce these in batches

| Batch | Purpose | Deliver first |
| --- | --- | --- |
| A — opening experience | Approve globe → terrain → building selection → one story action | References/preferences, globe texture, terrain and ground base color, habitat, solar array, life-support plant, NOVA and Alex neutral portraits |
| B — complete mission | Support food, radiation, research, rover exploration, and Earth advice | Remaining facilities, rover, rocks, sample object, crop stages, Maya neutral portrait |
| C — polish | Improve atmosphere without delaying the playable story | Optional expressions, decorative models, effects/audio, branding, approved voice recordings |

Start with batch A and one representative building before investing in the entire model set. It establishes the camera, object scale, visual quality, and materials that the rest should match. You can supply all batches, but they should use the same approved style.

## 4. Reference and preference checklist

- [ ] `references/globe-reference.png` — desired Mars/space presentation; 1920×1080 or larger is useful.
- [ ] `references/surface-reference.png` — terrain detail, strategy-camera angle, and facility style.
- [ ] `references/context-ui-reference.png` — small floating controls or object commands; annotate what you like.
- [ ] `references/character-reference.png` — portrait style, if you have a preference; optional if the portraits already establish it.
- [ ] `references/preferences.md` — note preferred realism, lighting, palette, camera distance, target devices (including the weakest known device), launch language, whether sound/voice is wanted, delivery deadline, and availability for an educator/guardian-supported learner playtest. State which reference takes priority if they differ.

References guide original work and are not shipped directly as backgrounds or interface screenshots.

## 5. World assets

### Required for the opening

| Check | Filename | Exact requirement |
| --- | --- | --- |
| [ ] | `world/mars-global-color-4k.jpg` | Full Mars surface color map in equirectangular projection, 2:1 ratio, ideally 4096×2048. No background, planet silhouette, labels, compass, baked terminator, or lighting. Left/right edges should wrap cleanly. Preserve the map's orientation and record the source's longitude convention if known |
| [ ] | `world/mars-region.glb` | One connected terrain patch, approximately 512×512 m for the initial illustrative scene; detailed relief toward its edges and a roughly 120×120 m buildable area near the center. Target 30–60K triangles. Center the patch at the origin, Y-up, meters. No buildings or interface elements merged into the terrain |
| [ ] | `world/mars-ground-basecolor.jpg` | Seamless 2048×2048 ground color texture, natural dusty red/brown, no shadows/labels. A single shared terrain material is sufficient initially |

The region should contain an outpost area, a readable route corridor, and a small rocky sampling area roughly 100–180 m from the base. Avoid cliffs across the only route. Do not include artificial miniature/diorama side walls; the playable patch should visually continue into surrounding terrain. Its outer edge can be hidden by lower-detail surroundings/haze during integration.

One terrain patch is sufficient for both regional orientation and surface play; a separate whole-planet high-detail model is unnecessary. A preview layout may show where structures go, but export the terrain and buildings separately so the game can select and move them.

If the terrain is derived from actual Mars data, include the product ID, geographic extent, projection, elevation/vertical units, any exaggeration, and processing notes. The approximate layout above is for an **illustrative** patch; do not deform measured terrain and still label it unmodified scientific data. If a measured site cannot fit the layout, supply its metadata and let us adapt the layout.

### Optional world enhancements

- [ ] `world/mars-ground-normal.png` — matching tangent-space normal map, same UV layout as the ground color; identify it as OpenGL/+Y or DirectX/−Y.
- [ ] `world/mars-ground-roughness.png` — matching grayscale roughness map; generally matte ground, not polished rock.
- [ ] `world/mars-region-low.glb` — a lower-detail version of the same patch, approximately 5–15K triangles; matching origin, extent, and material alignment.
- [ ] `world/mars-global-height.png` — only if based on a known elevation product; retain original depth and scale/offset/no-data metadata. It is not necessary for the first globe and must not be fabricated as measured elevation.

A photograph or a rendered Mars globe cannot replace the equirectangular surface map. An ordinary 8-bit painted height texture is not a scientific elevation product. The developer can acquire credited NASA planetary data if you prefer to focus on the artistic assets.

## 6. Facility models — eight required

Dimensions are approximate design guides. Keep door/person scale consistent across every asset; an ordinary doorway around 2 m high is a useful visual reference. No interior rooms are required.

| Check | Filename / root name | Appearance and purpose | Approximate size; useful separate parts |
| --- | --- | --- | --- |
| [ ] | `buildings/habitat.glb` / `Habitat` | Main crew home; pressurized modular living space, visible entrance, several small windows; a clear visual landmark | 12×8×5 m; `Door`, `Windows`, `StatusLight` |
| [ ] | `buildings/solar-array.glb` / `SolarArray` | Modular panel assembly on supports; visibly an electricity source | 10×6×3 m; `PanelLeft`, `PanelRight`, `Frame`, `StatusLight`; panel pivots centered on their hinges |
| [ ] | `buildings/life-support.glb` / `LifeSupport` | Equipment module with tanks, pipes, atmospheric intake, and distinct service area; oxygen machinery rather than a water-electrolysis claim | 8×6×5 m; `OxygenTanks`, `IntakeFan`, `StatusLight` |
| [ ] | `buildings/greenhouse.glb` / `Greenhouse` | Recognizable crop-growing structure with visible planting beds and grow lights; use restrained glazing so plants are readable | 12×8×5 m; `Shell`, `PlantBeds`, `GrowLights`, `StatusLight`; crops supplied separately |
| [ ] | `buildings/laboratory.glb` / `Laboratory` | Research module, observation window, instrument/service bay; distinct from the habitat | 9×7×5 m; `Door`, `InstrumentBay`, `StatusLight` |
| [ ] | `buildings/shelter.glb` / `Shelter` | Low, heavily shielded/refuge structure with regolith-like cover and a clear entrance; visible passive protection | 10×8×4 m; `Door`, `ShieldCover`, `StatusLight`; do not attach a glowing force-field sphere |
| [ ] | `buildings/antenna.glb` / `Antenna` | Communications dish on a mast with an equipment cabinet | 6×6×8 m; `Dish`, `Mast`, `Cabinet`, `StatusLight`; dish pivot aligned for rotation |
| [ ] | `buildings/storage.glb` / `Storage` | Compact supply module or container cluster; food/water/supply storage is recognizable without written labels | 8×6×4 m; `Door`, `Crates`, `StatusLight` |

Aim for **5–10K triangles per facility**, up to roughly 15K for a hero structure. Use approximately 1–3 materials per building and share the same metal/panel palette. Do not spend each object's maximum independently: the visible scene has a shared performance budget.

For power/status feedback, supply named emissive surfaces such as `StatusLight` and `GrowLights`; their default emission should be neutral/off. The game changes their brightness/color. One model is sufficient per building; separate “selected,” “powered,” and “unpowered” exports are unnecessary.

Full glass/refraction, dense interior furniture, sculpted bolts, text decals, animated cables, and complex mechanical rigs are not required. Favor simple tinted windows and geometry that holds up from the strategy camera.

## 7. Rover and exploration props

| Check | Filename / root name | Requirement |
| --- | --- | --- |
| [ ] | `vehicles/rover.glb` / `Rover` | A fictional crew-support/sample rover that matches the outpost style; approximately 4×2.5×2.5 m; 10–20K triangles. Body, mast, and wheels remain separate. Keep its forward direction documented; preferred forward is +Z in the exported GLB |
| [ ] | `props/rock-a.glb` / `RockA` | Small irregular rock, approximately 0.5–1 m across; 300–1,000 triangles |
| [ ] | `props/rock-b.glb` / `RockB` | Medium rock, approximately 1–2 m across; distinct silhouette; 500–1,500 triangles |
| [ ] | `props/rock-c.glb` / `RockC` | Larger boulder/rocky outcrop, approximately 3–5 m across; 1–3K triangles |
| [ ] | `props/sample-rock.glb` / `SampleRock` | One visually distinctive rock at the sampling stop, approximately 0.3–0.6 m across; 500–2K triangles; no artificial glow baked into it |
| [ ] | `props/sample-case.glb` / `SampleCase` | Small sample container/case, approximately 0.4 m across, reusable for collection feedback; 500–2K triangles |
| [ ] | `props/crop-stages.glb` / `CropStages` | Three groups: `Seedling`, `Growing`, `Ready`; each is a small crop-bed insert using the same origin and footprint, approximately 1×1 m. Approximately 0.5–1.5K triangles per stage. These visualize fictional accelerated growth, not measured crop timing |

Name rover wheels individually, for example `WheelFrontLeft`, `WheelFrontRight`, `WheelRearLeft`, and `WheelRearRight`; six wheels are also acceptable if consistently named. Put wheel origins at axle centers. A rotating mast or sample arm is optional. The developer can animate waypoint travel and wheel rotation; a driving animation is not required.

For `CropStages`, export all three named stage groups, not three stages permanently overlapping as one fused object. Only one stage will be visible per planting bed.

### Optional props

- [ ] `props/walkway.glb` — short modular connector/path segment, approximately 4×2 m, easy to repeat.
- [ ] `props/landing-pad.glb` — simple landing/arrival landmark, approximately 20 m across; no landing simulation required.
- [ ] `props/lander.glb` — stationary decorative lander; only after the main base style is approved.
- [ ] `props/astronaut.glb` — small stylized crew member for scale/shelter activity. A static pose is sufficient; no face or full character rig is required.
- [ ] `props/supply-crate.glb` — one reusable small crate if it is not already part of Storage.

Do not model every rock in the scene separately. The game can reuse and rotate these variants. Collision meshes, a navigation mesh, rover tire marks, dust clouds, and selection outlines can be generated during integration.

## 8. Character portraits

Required base portraits:

- [ ] `characters/nova-neutral.png` — friendly mission assistant; a distinctive robot/AI visual identity rather than a fourth human scientist.
- [ ] `characters/alex-neutral.png` — approachable adult engineer, practical outfit, visually distinct equipment accent.
- [ ] `characters/maya-neutral.png` — approachable adult scientist, visually distinct from Alex, composed and curious.

Use transparent PNG or lossless WebP, approximately 1024×1024. Frame head and upper torso consistently, face approximately centered, with enough margin for square or circular crops. Use the same lighting, rendering style, scale, and background transparency for all three. Keep faces readable at approximately 64–96 px on screen. Do not place names, speech bubbles, text, or a UI frame inside the artwork.

Optional expressions for each character: `*-happy.png`, `*-thinking.png`, and `*-concerned.png`. Keep the framing and design identical across expressions. Concerned should be supportive and calm, not frightening. No speaking/lip-sync frames or full-body character models are needed for the first release.

## 9. Optional audio and branding

These do not block the first interaction prototype.

| Check | Filename | Content and target duration |
| --- | --- | --- |
| [ ] | `audio/space-ambience.wav` | Quiet, non-distracting 30–60 second seamless loop for planet view; artistic ambience, not “recorded sound in vacuum” |
| [ ] | `audio/base-ambience.wav` | Subtle 30–60 second mechanical/habitat loop; no speech or dominant melody |
| [ ] | `audio/ui-select.wav` | Soft selection cue, approximately 0.1–0.3 s |
| [ ] | `audio/ui-confirm.wav` | Distinct confirmation cue, approximately 0.2–0.5 s |
| [ ] | `audio/mission-warning.wav` | Gentle alert, approximately 0.5–1 s; avoid harsh or continuous sirens |
| [ ] | `audio/radio-message.wav` | Short incoming-message cue, approximately 0.5–1.5 s |
| [ ] | `audio/rover-loop.wav` | Quiet reusable motor/drive loop, approximately 2–5 s; no Doppler effect baked in |
| [ ] | `audio/discovery.wav` | Short sample/research success cue, approximately 1–2 s |
| [ ] | `branding/logo.svg` and `branding/logo.png` | Original Mars Mission Commander logo; simple SVG plus transparent PNG preview. Keep it readable at small sizes; no NASA or reference-game logo |

Audio masters: WAV, ideally 48 kHz, 16- or 24-bit, no clipping. Mono is suitable for effects; stereo is suitable for ambience. Supply clean loops with no clicks and record loop boundaries if the file includes an intro/outro. Browser formats and final mixing are handled during integration.

**Voice recordings: wait for the approved script.** If wanted, record one approved story line per file named by its story node, for example `audio/voice/alex-power-01.wav`. Supply the exact spoken transcript, language, speaker permissions, and pronunciation notes. Do not record a long continuous narration: the player controls when the next line becomes available. Captions remain part of the game.

## 10. Shared 3D export requirements

1. **Provide real 3D assets.** Preferred delivery is GLB using glTF 2.0, with textures embedded, plus the editable Blender source. PNG/JPG renders and videos are useful previews but cannot replace interactive 3D meshes. FBX/OBJ sources can be considered, but GLB is the integration target.
2. **Scale and coordinates:** export in meters, Y-up; preferred forward +Z. Apply object rotation/scale where appropriate, while preserving intended animation transforms. In Blender, verify the exported GLB orientation rather than manually rotating a correctly exported file to compensate for Blender's authoring axes.
3. **Origins:** buildings at ground-center; terrain centered on its region; rover at ground-center, with documented forward direction; moving pieces at their mechanical pivots. No geometry should unexpectedly sit hundreds of units from its origin.
4. **Structure:** one named root per asset. Preserve separately controllable parts. Use stable descriptive names; avoid a single fused base containing all facilities. Remove unused cameras, lights, hidden test geometry, and duplicate objects from the export.
5. **Mesh quality:** UVs present, outward normals, no missing faces, no accidental duplicate surfaces/z-fighting. Use geometry appropriate for a browser scene and avoid unapplied subdivision producing unexpectedly dense exports.
6. **Materials:** glTF metallic/roughness PBR with a small material count; use standard base-color, roughness, metallic, normal, and optional emissive maps. Bake procedural Blender materials to textures when needed. Include any unbaked editable source separately. Do not rely on renderer-specific nodes surviving export.
7. **Textures:** usually 1024 or 2048 square per ordinary model/material; shared palettes/atlases are encouraged. JPG for opaque color; PNG for transparency, normal, or precise data maps. Declare normal-map convention and packed texture channels. Keep UV padding to avoid texture-edge bleeding.
8. **Transparency:** use it sparingly, especially on greenhouse/window layers. Dense overlapping transparent surfaces increase rendering cost. Simple tinted/opaque windows are acceptable.
9. **Animations:** optional named clips such as `Idle`, `DishScan`, or `FanSpin`. Identify loopable clips. Do not bake rover movement across the whole terrain into the vehicle GLB; the game controls its path. Static parts with correct pivots are sufficient.
10. **No world/game state baked in:** do not embed floating labels, camera transitions, hover cards, selection rings, route arrows, victory screens, or game resource text in a model.
11. **Previews:** include one perspective image and one overhead image per main asset, plus a brief note on dimensions/polygon count. A turntable video is optional. For one master scene, show the intended scale relationships between buildings and rover.
12. **Keep source masters:** the developer will make optimized runtime copies after review. Optional mesh/texture compression and level-of-detail generation can be handled during integration; you do not need to install a particular compression tool.

Reference format: [Khronos glTF overview and tools](https://www.khronos.org/gltf/), including the glTF Validator and sample viewer linked there. The [Three.js loader documentation](https://threejs.org/docs/) is the runtime reference. Project-specific budgets above are our choices, not requirements of glTF itself.

Aim for the complete visible scene to stay within approximately 200K triangles and 150 draw calls, with staged loading. The current planning targets are globe assets <= 3 MB transfer and surface assets <= 8 MB transfer before optional audio. These are runtime targets after optimization; a larger original master is acceptable. Shared textures and restrained material counts matter as much as individual model file size.

## 11. What the developer will create in code

No separate art assets are required for the following:

- Globe sphere geometry, mission markers, camera motion, zoom/pan controls, and world-to-surface transitions.
- Context buttons, accessible labels, hover/focus tooltips, resource indicators, story cards, journal, source panels, and responsive layout.
- Selection outlines/rings, highlighted interaction targets, rover routes, destination markers, and small power-flow/status effects.
- Subtle generated stars, terrain haze/dust effects, loading states, and reduced-motion equivalents.
- Rover movement along authored waypoints, turn outcomes, story gates, and save/resume logic.
- Common UI icons using the existing icon system. Custom icons are optional only if an approved brand style requires them.

Existing scientific evidence and the credited Jezero image are already in the project. You do not need to recreate NASA observations, draw fake charts, or generate radiation measurements. The developer can acquire a suitable credited globe texture/terrain source if those are not part of your asset production.

## 12. Blender MCP option

A connection to your Blender session is a useful alternative to producing every model manually. A local Blender MCP is not currently connected. If you provide one with the capabilities below, I can use it after you authorize the execution phase to build and refine the assets with you.

### Useful capabilities for the MCP

- Read Blender version and current `.blend` path; list objects, collections, materials, dimensions, and transforms.
- Create/edit meshes and modifiers; rename objects; assign materials; set origins and pivots; organize collections.
- Import supplied models/textures; create UVs or bake materials where supported; save the editable `.blend` project.
- Set a preview camera/light rig and render PNG previews, or return viewport images for visual inspection.
- Export selected objects as GLB with embedded textures and the intended transforms; report output paths.
- Report triangle counts, material counts, texture resolutions, bounding dimensions, and available animation clips.
- Run Blender Python for operations without dedicated tools, if your MCP supports it; return clear results/errors so exports can be checked.

These are capability requirements, not assumed tool names or a request to implement a specific third-party server. If your MCP exposes only some operations, record which ones; the workflow can combine its tools with manually supplied assets.

### Workflow with Blender connected

1. You provide the visual references and approve the style/direction.
2. We create a dedicated project under `Assets/source/`, keeping your unrelated Blender work separate.
3. Build one representative facility and a small terrain preview; render the intended strategy camera and inspect it together.
4. Match the remaining asset family to that approved scale/material style.
5. Save editable sources; export GLB assets and preview renders; validate naming, scale, appearance, and budgets.
6. Integrate only after the user authorizes application work. Camera/story/UI remain application code, not Blender screenshots.

With Blender MCP, your main contribution can be references, art direction, and review instead of manually modeling every object. Blender does not remove the need for a real source/projection for scientific planetary maps, or for checking export compatibility and runtime performance.

## 13. Handoff checklist

For each batch:

- [ ] The required filenames are present, or the manifest explains an intentional alternative.
- [ ] Source/credit/license information is included for every reused item.
- [ ] Model scale, orientation, origin, and named parts are documented.
- [ ] Textures resolve; previews show the same materials as the exported model.
- [ ] Original sources remain available; no unnecessary lights/cameras/test objects are exported.
- [ ] All assets match the shared visual direction and read well from the intended overhead camera.
- [ ] Scientific maps/terrain are identified as measured, processed, or illustrative.
- [ ] Missing/unfinished items are explicitly listed instead of replaced with misleading files.

Next handoff: supply **batch A**, or connect a Blender MCP and supply the visual references. Application development remains paused until you approve continuation.
