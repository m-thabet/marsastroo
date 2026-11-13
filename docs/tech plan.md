# Mars Mission Commander — technical plan

Status: proposed world-first/story-driven redesign, awaiting user review, 13 November 2026. Product reference: [solution.md](solution.md). This revision supersedes the dashboard architecture and earlier delivery sequence. No application code, packages, tests, runtime assets, or deployment configuration is changed in this planning pass. The user separately requested an empty root `Assets` folder for incoming source assets.

## 1. Existing foundation and scope of change

Prototype 0.1.0 contains a deterministic six-turn simulation, source evidence, save validation, an embedded procedural 3D base, a dashboard, and tests. The user has rejected that presentation and its simultaneous information display. Treat it as reusable technical work, not approval of the current game experience.

| Retain and adapt | Replace or introduce |
| --- | --- |
| Pure resource resolver and three winning fixtures | Full-viewport world shell instead of sidebar/cards/page scrolling |
| Preview/commit and stale-command protection | Globe, region, and surface camera modes |
| Evidence manifest, RadLab series, OSDR metadata, local Jezero image | Globe texture, terrain region, distinct facilities, rover route |
| Build tooling, pinned dependencies, Vercel static configuration | Context commands and small anchored HTML overlays |
| History replay and data validation concepts | Action-gated story state, unlocks, journal, and atomic story/mission saves |
| Existing rule/data tests | Replace dashboard-specific browser selectors and add story/camera tests |

Prior verification applies only to prototype 0.1.0: 18 domain/data tests, eight desktop/mobile-viewport Chromium checks, TypeScript, lint, production build, and a production smoke check passed. The previous dependency audit reported zero known vulnerabilities. These results do not verify the proposed redesign. Firefox/WebKit, real-device performance, manual screen-reader testing, and child testing remain unverified.

## 2. Stack and rendering decision

| Layer | Decision |
| --- | --- |
| Application | Keep React, strict TypeScript, Vite, npm lockfile, and Node 24 |
| 3D world | Keep Three.js through React Three Fiber; use selected Drei helpers |
| Camera | One camera controller with mode-specific constraints and authored transitions; Drei CameraControls is the candidate to test |
| Interface | Semantic HTML overlays with CSS positioning; SVG for icons/diagrams; no essential text drawn into the canvas |
| Simulation | Keep pure TypeScript preview/commit rules; no backend or real-time simulation clock |
| Narrative | Add a typed story graph and pure reducer/guards; no chatbot or narrative service |
| State | Central session reducer separates simulation, pending plan, story progress, and transient camera/selection |
| Validation/save | Zod; versioned localStorage envelope with deterministic action replay |
| Asset tools | Blender/glTF 2.0 pipeline; optimized local textures/models derived from user source assets and credited NASA material |
| Verification | Vitest and Playwright/axe; retain the existing tools and add tests for the new interaction contracts |
| Hosting | Keep Vercel static hosting; no accounts, authentication, serverless functions, runtime API keys, or application database |

Stay with the existing 3D stack for a globe plus one bounded playable terrain region. A globe mesh, local terrain, object picking, and scripted camera transitions do not require a second rendering engine. This is a scoped interaction design inspired by Google Earth, not a global geospatial viewer.

Do not add Google Maps/Earth SDKs, scrape their tiles, or reuse their branding. Reevaluate a geospatial engine such as Cesium only if later requirements demand globally streamed terrain, extensive georeferenced datasets, or continuous high-detail planetary navigation. That would be a separate scope/data decision; it is not proposed for the first mission.

References: [React Three Fiber performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Three.js documentation](https://threejs.org/docs/), [Drei controls](https://drei.docs.pmnd.rs/controls/introduction). Confirm the specific installed camera-control API during implementation; no package migration is authorized by this document.

## 3. Full-screen world and spatial model

### Scene modes

Use one shared canvas and a `WorldMode` of `planet | region | surface`. Only the active scene and assets needed for an imminent transition remain resident. Keep resource and story state independent of whichever scene is visible.

- **Planet:** sphere with a credited equirectangular Mars texture, restrained lighting, mission marker, and optional location tooltip. A sphere is sufficient for visual orientation; it is not a precision Mars ellipsoid model.
- **Region:** bounded overview of the mission area, outpost marker, and sample destination. Use a simple authored or preprocessed terrain mesh; distinguish illustration from measured elevation.
- **Surface:** terrain in local meters, selectable buildings, route, rover, sample stop, and environmental feedback. Use a perspective camera with constrained tilt for the strategy-game view.
- **Transition:** an authored fly-to/crossfade connects the modes. The globe and local terrain can use different coordinate spaces and scales; do not push the camera through a single enormous model and imply precision that the assets do not support.

Add a stable `siteId` and asset metadata with coordinate convention, bounding box, unit scale, source/product ID, and illustration/measured-data status. If a real geographic anchor is used, derive it from the selected source and document it. Do not invent exact coordinates for the fictional base.

For a measured terrain region, download a bounded permitted imagery/elevation subset during development, record its projection and vertical units, and preprocess it into local meshes/textures. [Mars Trek WMTS documentation](https://trek.nasa.gov/tiles/apidoc/trekAPI.html) describes imagery tiles; imagery alone is not elevation. A reviewed globe map and elevation product are still acquisition tasks. No runtime tile service is required in the first release.

### Camera and input contract

| Input | Planet | Region/surface |
| --- | --- | --- |
| Primary pointer drag | Rotate globe | Pan over terrain |
| Click/tap without a drag | Select a visible marker | Select building, rover, or destination |
| Wheel/pinch | Bounded zoom | Bounded zoom toward terrain |
| Secondary drag / rotate control | Optional globe rotation | Rotate/tilt within limits |
| Touch | One-finger rotation, pinch zoom | One-finger pan; two-finger zoom/rotation; tap selection |
| Keyboard/visible controls | Select markers, zoom, rotate | Select objects, pan, zoom, rotate, recenter |

A movement threshold distinguishes selection from camera drag. Ignore terrain input when the pointer is interacting with an HTML control. Do not register competing orbit/pan controllers. Restrict camera height, tilt, and bounds so it cannot clip underground or lose the playable area. Provide **Return to base**, **Planet view**, and a keyboard-accessible object chooser.

Camera transitions are interruptible or skippable and honor reduced motion. An animation callback may release a visual transition lock, but cannot resolve a turn, award a sample, or become the only way to satisfy a story gate.

### Object commands and overlays

Each selectable object has an ID, type, interaction proxy, focus anchor, camera focus target, and permitted command IDs. Use simple invisible hit meshes where detailed geometry is hard to select. Hover/focus exposes a short label; selection pins a context panel.

Use a small anchored command strip or compact side/bottom sheet for the selected object. Clamp overlays to viewport safe areas and avoid placing them over the objective or main story card. Hide labels behind terrain when appropriate; the object chooser remains an equivalent access path. One panel is open at a time.

The shell uses `100dvh` with safe-area handling. Normal play has no document scroll. Narrative text may scroll inside its constrained card when accessibility zoom makes that necessary. The default scene must satisfy the world-visibility targets in `solution.md`; browser screenshots are part of acceptance.

## 4. Action-gated narrative and progressive disclosure

### Story content model

```ts
type StoryNode = {
  id: string;
  chapterId: string;
  speaker: 'NOVA' | 'Alex' | 'Maya';
  promptId: string;
  focusTargetId?: string;
  teaches?: string;                 // one primary concept
  allowedCommandIds: string[];
  completion: StoryCondition;
  onCompleteUnlocks: string[];
  nextNodeIds: string[];            // branches converge through guards
  sourceIds: string[];
};
```

`StoryCondition` is a typed discriminated union, not arbitrary executable content: `objectSelected`, `planFieldChanged`, `commandAccepted`, `turnResolved`, `sampleCollected`, or a small `allOf` combination. Conditions compare the target object, expected node, expected turn, and the authoritative action result. A hover, elapsed timer, skipped camera animation, or dismissed dialog cannot satisfy an unrelated action gate.

A short prompt is displayed only after prerequisites are satisfied. The event that completes a node reveals at most one subsequent teaching node. Persist the completed node and entered next node together so reload cannot repeat a reward or skip an introduction. Optional dialogue replay changes neither progress nor resources.

Author the story sequence in `solution.md` as data, not a chain of component-specific effects. First implement the narrow opening sequence; do not wire the full campaign until its pacing and visuals are approved.

### System unlock schedule

| Stage | Unlocks and guarantees |
| --- | --- |
| Arrival | Globe marker, region marker, camera basics, object selection |
| Turn 1 preparation | Power, oxygen planning, greenhouse/food/water, lab research/conserve, then plan review; each taught in its own node |
| Turn 2 preparation | Exposure warning and shelter; previously learned systems remain usable |
| Turn 3 preparation | Rover destination and field sampling; all costs/risk taught before confirmation |
| Turn 4 preparation | Antenna/advice and permanent shielding; choice can be declined without blocking the story |
| Turns 5–6 | Independent planning with previously unlocked controls; no new unannounced survival system |

A safety-critical feature must be introduced before the first commitment where ignorance of it could cause failure. Food production and water costs therefore appear before turn 1 resolves. The current event and all consequences of the proposed plan remain inspectable before every commitment.

For voluntary choices, the completion predicate accepts either a valid chosen action or an explicit informed decline. Do not require requesting Earth advice or buying shielding if the player chooses another valid strategy. Narrative hints may guide attention but cannot silently overwrite the player's plan.

The global reducer enforces unlocks as well as the interface; hiding a button is insufficient. Keep simulation legality separate: `storyAllows(command, session)` checks narrative availability, while `previewTurn` checks resource/rule validity. Existing direct engine tests stay useful; add integration tests proving each winning plan is reachable through the story.

## 5. Session state, commands, and persistence

```text
World selection / accessible HTML action
                  ↓ typed command
Session reducer → story guards → pending plan / mission resolver
                  ↓ accepted action event
Story transition + journal + scene feedback + atomic save
                  ↓
Camera/animation layer visualizes the result
```

Keep four concerns distinct:

1. `mission`: existing resources, turn, objectives, history, and terminal status.
2. `story`: story/content version, current node, completed nodes, unlocked command/system IDs, learned concept IDs, and journal entries.
3. `pendingPlan`: oxygen/greenhouse toggles, crew task, and selected expedition destination. Editing it is free.
4. `view`: world mode, selected object, camera pose/transition, open panel, quality level, and motion/audio preference. High-frequency camera data lives in refs, not React updates every frame.

Actions carry `expectedNodeId`, `expectedTurn`, and an action ID where needed to reject stale/repeated commands. World and HTML controls dispatch the same commands; neither writes mission resources directly.

`COMMIT_PLAN` verifies node/turn/unlocks, calls the resolver once, records the accepted command, advances story as allowed, and creates feedback cues. Paid world commands are plan edits until this explicit commitment. During result presentation, prevent another commit; permit **Skip animation**, which reveals the already-resolved result immediately. Route movement never owns the outcome.

Persist story progress and the pending plan alongside validated mission history at meaningful action checkpoints, not on every camera frame. Introduce a new session/save schema and content version for this campaign. Keep the old prototype save key untouched; offer an explicit explanation and a fresh story when that older save cannot map to the new sequence. Do not silently grant all introductions or replay already-spent resources to migrate it.

Reload during movement restores the committed result and the appropriate story node; it does not re-commit the task. Invalid/corrupt saves and denied storage leave a playable in-memory session with a clear message. Store no personal identifiers.

## 6. Canonical simulation specification — retained baseline

Keep constants in one typed balance configuration. Retain these tested prototype values during the presentation redesign; any balance change must update product outcomes, story instructions, and regression fixtures together.

Initial state: turn 1; energy 12/20; oxygen 48/60; water 12; food 5; exposure 0; shield level 0; growth progress 0; research 0; samples 0; no pending hint. Fixed event sequence: ordinary, storm, dust, ordinary, storm, ordinary. These are authored conditions, not a chronological reconstruction of a real NASA event series. Label solar storms distinctly from dust storms.

### Resolution order

1. At the start of a turn, reveal and clear any hint due now. Reveal the current event. These steps occur once, not on each preview.
2. Compute `availableEnergy = min(20, energy + generation)`, where generation is 6 for dust and 10 otherwise. Display spilled generation when the battery caps.
3. Compute cost: mandatory 4 + oxygen toggle 4 + greenhouse toggle 3 + task cost. Task costs: research 4, field sample 4, shelter 2, upgrade 5, ask Earth 2, rest 0. Only one crew task is allowed. Reject upgrades above level 2, repeat requests while a hint is pending, and advice requests on turn 6 because they cannot arrive during the mission. Field sampling unlocks on turn 3 after the tutorial and uses the same single nearby stop; subsequent samples are repeats, not new regions.
4. If cost exceeds available energy, return an invalid projection and disable commitment. Never silently drop a selected action. Zero battery after payment is allowed because mandatory support was already funded.
5. Pay energy; apply shielding upgrade immediately, if selected. Compute `oxygenNext = min(60, oxygen + (oxygenOn ? 12 : 0)) - 12`. Production happens before crew consumption; show overflow in the preview.
6. Compute `waterNext = water - 1 - (greenhouseOn ? 1 : 0) - (task === 'fieldSample' ? 2 : 0)`. Crew water use includes simplified habitat needs; field use represents sample handling and expedition supplies. No water regeneration or water extraction exists in this release. If greenhouse is powered, increment progress. On reaching 2, add 2 food and reset progress to 0. If unpowered, reset progress to 0. Then consume 1 food. Harvest precedes consumption. Explain compressed crop timing and progress reset in the greenhouse panel.
7. Compute `exposureAdded = (baseExposure + fieldExposure) * shieldMultiplier * shelterMultiplier`. Base is 8 during solar warnings and 1 otherwise; field exposure is 2 for field sampling and 0 otherwise; shield multiplier is `[1, 0.75, 0.5][shieldLevel]`; shelter multiplier is 0.25 for shelter and 1 otherwise. Shield level represents base and expedition protective equipment together in this simplified model; acknowledge that real habitat shielding does not protect someone outdoors. Field sampling and shelter are mutually exclusive crew tasks. Keep exact internal values; round only the display.
8. Research adds 1 objective; field sampling adds 1 objective and 1 sample. Asking Earth queues an authored hint for the next turn; the request gives no resources. Hints advise on upcoming events and cannot change their resolution. There is no chatbot or external message sent.
9. Rescue takes precedence if oxygen <= 0, water <= 0, food <= 0, or cumulative exposure > 12. Otherwise after turn 6, research >= 3 and samples >= 1 give success; incomplete objectives give safe return. Otherwise continue. Increment the turn and append a record.

Every numerical coefficient in this section is a fictional balance parameter. Radiation exposure is labeled **game exposure points**, never Gy, Sv, or a human cancer-risk percentage. Physical dose observations appear only in the separate science context panel with their original units. Solar weather and dust are independent scenario dimensions; do not suggest flares cause dust storms.

### Feasibility fixture

This path passed the existing prototype simulation tests. The redesign must also prove it is reachable through story guards before claiming integrated solvability. Essential support runs each turn. `O` and `G` are the oxygen and greenhouse toggles. Exposure is cumulative.

| Turn/event | O | G | Task | End energy | End oxygen | End water | End food | Exposure | Research/samples |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 ordinary | on | on | research | 5 | 48 | 10 | 4 | 1 | 1/0 |
| 2 storm | on | on | shelter | 2 | 48 | 8 | 5 | 3 | 1/0 |
| 3 dust | off | off | field sample | 0 | 36 | 5 | 4 | 6 | 2/1 |
| 4 ordinary | on | off | rest | 2 | 36 | 4 | 3 | 7 | 2/1 |
| 5 storm | off | off | shelter | 6 | 24 | 3 | 2 | 9 | 2/1 |
| 6 ordinary | off | off | research | 8 | 12 | 2 | 1 | 10 | 3/1 |

A second feasibility path changes oxygen to off/on/off/on on turns 2/3/4/5 and replaces turn 4's rest with an upgrade. Keep all other choices above. It finishes with energy 3, oxygen 12, water 2, food 1, exposure 9, research 3, and samples 1. A third path replaces turn 4's rest with ask Earth, retains its oxygen toggle, and finishes with energy 6 and the same other results as the first path; the hint arrives at turn 5. Retain all three as regression fixtures so requesting advice is demonstrably affordable.

## 7. Scene feedback and asset pipeline

### Feedback tied to accepted actions

- Selecting the solar array highlights its object/connection and reveals a small generation indicator.
- Changing oxygen allocation updates a power-flow cue and the contextual forecast; visible feedback represents the pending plan until confirmation.
- Greenhouse lighting, shelter activity, and antenna status reflect the resolved plan. Show one consequence sentence after each commitment.
- Field sampling uses authored waypoints over the terrain: select rover → mark destination → preview route/cost → commit → travel → arrival/sample feedback. No physics engine or free-driving system is required.
- Use terrain haze/lighting for dusty conditions and a restrained warning for a solar event. Do not depict a solar flare as a dust storm or imply an Earth-observed event has a measured arrival at the fictional base.

Use React Three Fiber frame callbacks and the shared camera/animation controller. Render on demand while idle and request frames while movement is active; [on-demand rendering requires invalidation for imperative animation](https://r3f.docs.pmnd.rs/advanced/scaling-performance). Do not create another permanent animation loop. Reduced-motion mode moves instantly to the same logical outcome.

### Incoming user assets

The root `Assets` folder is the user's drop-off location. The authoritative file list, reference requests, licenses/credits, formats, and optional Blender MCP workflow are in [assets.md](assets.md). It may remain empty until the user supplies assets. Do not reference it as a public runtime directory.

After implementation is authorized, inspect source assets, record their provenance, optimize copies, and place only approved derivatives in `public/assets`. Keep originals intact. Validate glTF/GLB units, object origins, material maps, animation names, texture dimensions, polygon counts, and license compatibility. Assets must be selectable by stable IDs independently of their visual mesh hierarchy.

Target a consistent visual style rather than mixing unrelated store packs. Before final models, approve the scene composition and silhouettes with placeholders. Do not treat temporary geometry as approval of the final art direction.

### Asset loading and performance targets

Load in stages: small shell → globe and marker → bounded region/surface on demand. Show meaningful progress/error recovery without revealing all mission systems while loading. Start preparing the next scene after an intentional navigation action; keep the current scene usable until the next is ready.

Initial targets, to be measured on an agreed weakest device:

- Shell JavaScript <= 250 KB gzip; lazy 3D code <= 500 KB gzip.
- Globe assets <= 3 MB transfer; surface scene assets <= 8 MB transfer before optional audio. These replace the earlier 6 MB whole-application target because the globe and richer terrain are separate staged downloads.
- <= 150 visible draw calls and <= 200K visible triangles in the initial surface scene; use instanced props, shared materials, baked/simple lighting, and optional shadow quality.
- At least 30 fps during camera/rover movement on the agreed baseline device; cap pixel ratio at 1.5 initially. No expensive post-processing by default.
- Use lower-resolution textures, reduced shadows/props, and a bounded 2D map fallback if needed. Fallback retains the same story gates and contextual actions; it does not restore the rejected dashboard as the standard experience.

These are development budgets, not measured claims about the redesign. Do not increase them before profiling the opening experience.

## 8. Science content and attribution

Retain the acquired evidence; connect it to story nodes and contextual **Why is this real?** controls. A learned-concept journal grows during play, while full credits/source attribution remain reachable through the menu. Reading a source never resolves a turn or substitutes for a world action.

| Existing source | Current reference | Revised placement |
| --- | --- | --- |
| DONKI | `2024-05-10T06:27:00-FLR-001`, version 2; X3.9; peak 06:54 UTC | Solar-warning explanation, clearly archived |
| OSDR | OSD-314 version 7; publication DOI `10.3390/ijms22020899`; metadata in `src/data/osdr-candidate.json` | Greenhouse lighting explanation, with organism and experiment context |
| RadLab | Four ISS DosTel1 absorbed-dose-rate readings, 1 April 2022 23:00–23:05; `src/data/radlab.json` | Optional radiation chart/table with original μGy/hour units |
| Mars image | PIA24485; acquired 22 February 2021; NASA/JPL-Caltech/ASU/MSSS; `public/assets/jezero-delta.jpg` | Sampling discovery/journal, not a globe texture or terrain elevation source |
| MOXIE / CSA | Source summaries and links in `src/data/evidence.ts` | Oxygen and food-production story moments |

Existing evidence was retrieved on 13 November 2026. The OSDR publication was reviewed for the narrow explanation; retain its experiment limits. Acquire a separate appropriately licensed equirectangular globe texture and chosen region's terrain source before claiming geographic realism. NASA/partner data terms and individual asset credits must be checked; no NASA endorsement is implied.

Each source preserves provider, record/product ID, source URL, observation/publication date, retrieval/review date, units, context, original selected fields, child summary, game use, limitations, credit, and usage terms. Source schemas must match actual content rather than inferring missing dates or instrument context. No browser API key or live data dependency is introduced.

## 9. Verification for the redesigned experience

| Area | Acceptance evidence |
| --- | --- |
| World dominates | Desktop/mobile screenshots show full-viewport world, restrained overlays, and no dashboard/sidebar or page scroll during normal play |
| Navigation | Globe rotate/zoom, marker selection, region descent, terrain pan/zoom/rotate, return to base/planet, and camera bounds work |
| Pointer/touch | Drag does not trigger selection; overlay clicks do not move the camera; tap has parity with hover/click; small objects have usable hit proxies |
| Narrative | Next node waits for a valid required action; unrelated clicks, closing text, waiting, and skipping camera movement cannot bypass the gate |
| Choices | Optional advice/upgrade decisions accept an informed alternative; no scripted action silently forces a specific winning plan |
| Timing | Plan edits/inspection are free; commit resolves once; motion, camera changes, reload, or animation skip cannot spend twice or award twice |
| Safety/learning | A needed resource/system is taught before its first consequential commitment; affected costs, reserves, and exposure are inspectable |
| Balance | Retain all three winning fixtures and prove their commands remain reachable through story guards |
| Persistence | Reload restores the current node, unlocks, pending plan, committed history, and journal without resetting or duplicating actions |
| Resilience | Model/texture loading failure, WebGL loss, unavailable storage, reduced motion, and lightweight mode preserve the playable story |
| Accessibility | Keyboard object selection, hover parity, focus restoration, 44 px targets, captions, contrast, 200% zoom; axe plus manual screen-reader review |
| Science | Encountered story facts resolve to source IDs; actual data units/context are retained; fictional geography/rules are identified |
| Performance | Profile the opening on the agreed baseline hardware; record transfer sizes, fps, triangle/draw-call counts, and fallback behavior |

Keep rule tests and update narrative/browser tests after the new interaction contract is implemented. Old tests that click the global task grid must be replaced with object-command interactions; do not keep the old dashboard solely to preserve test selectors. Include an end-to-end opening test and then a full mission through the world-based commands. Release testing must expand beyond Chromium emulation.

## 10. Execution sequence and approval gates

### Current boundary: planning only

Only `docs/solution.md` and `docs/tech plan.md` are edited. The separately requested empty root `Assets` folder is created. Stop for user review; do not implement, install packages, change the existing app, or deploy it until the user authorizes continuation.

### Next implementation, after user review

| Stage | Deliverable | Review/exit condition |
| --- | --- | --- |
| A. Opening experience | Full-screen globe, mission marker, region/surface descent, solar/life-support selection, contextual power command, one fact at a time | User confirms the world scale, camera, art direction, overlay size, and action-gated pacing before expanding |
| B. Story/mission integration | First committed turn with greenhouse/water/lab introductions and atomic story save | No concealed survival cost; plan changes and commitment match canonical rules |
| C. Mission journey | Radiation shelter, rover route/sample, delayed Earth advice, shielding, six-turn outcome | Full mission reachable with multiple valid strategies and contextual commands |
| D. Art and learner validation | Approved asset derivatives, better terrain/facilities/portraits, source journal, devices/accessibility/child pilot | Consistent visual quality, understandable pacing, measured performance |
| E. Delivery | Production verification, Vercel deployment, public-link smoke check | Public game needs no sign-in and matches the approved interaction direction |

Do not reuse the earlier 10–15 day estimate as a commitment: this changes the camera system, narrative flow, scene composition, and asset needs. Estimate the remaining work after stage A approval and inspection of available assets. If time is constrained, reduce region count and art variety; preserve the world-first presentation and progressive story as core requirements.

The next concrete code task, once authorized, is stage A only. Placeholder assets are acceptable for interaction testing, with their limitations made explicit. Do not rebuild the entire mission before the user has seen the revised opening experience.

## 11. Vercel deployment — retained

Keep the existing static setup: framework Vite, repository root, `npm ci`, `npm run build`, output `dist`, Node 24, and Vite base `/`. Use Vercel Git previews for review and production from the protected `main` branch after checks pass. No runtime environment variables or backend are required.

The application uses the root URL; world modes/story nodes are session state, not server routes. If path-based URLs are later introduced, configure and test SPA fallback routing. Keep public runtime assets under `public/assets`; the root `Assets` folder contains authoring input and must not be deployed wholesale.

A future production smoke check covers globe/terrain/model/font loading, scene transitions, a committed turn, source links, resume, and unauthenticated public access. Preview and production origins have separate local saves. No hosting action is included in the current planning request.

## 12. User inputs for execution

Use [assets.md](assets.md) as the authoritative asset checklist and production brief. A local Blender MCP connection is an optional authoring route described there; connecting it does not authorize application implementation. First request visual references/style preferences and target devices. Final models, portraits, and audio can follow the opening-scene review. If the user has no Mars data assets, source credited NASA material during the authorized asset stage rather than requiring the user to find scientific products.

Unresolved asset choices must stay explicit: globe texture source, illustrated versus measured terrain, terrain region/extent, model style, voice/audio, launch language, baseline device, and delivery deadline. None require changing code during this review.
