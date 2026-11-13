# Mars Mission Commander — solution

Status: revised direction awaiting user review, 13 November 2026. This plan supersedes the dashboard layout in prototype 0.1.0. Application implementation is paused until the user reviews this revision. Technical reference: [tech plan.md](tech%20plan.md).

## 1. Product direction

An interactive 3D Mars mission for children aged 7–12. The world fills the screen: the player rotates Mars, chooses a mission marker, descends to the surface, selects facilities, and directs a rover. Short character-led story moments introduce one concept, require a meaningful action, and then reveal the next concept.

Use Google Earth as a reference for exploring a planet and moving between scales. Use Red Alert as a reference for selecting structures and units, issuing contextual commands, and seeing their effects in the world. The result is an original educational mission about outpost survival. Combat, enemy factions, and replication of either product's branding or interface are outside scope.

The player should feel present on Mars and responsible for the crew. A successful screen is primarily terrain, buildings, and units, with a small amount of contextual interface.

## 2. What changes from prototype 0.1.0

| Existing prototype | Revised experience |
| --- | --- |
| Sidebar, meters, cards, and a scene embedded in a page | Full-viewport world with small floating controls |
| All resources and tasks presented together | Concepts and commands introduced through story actions |
| Inspect a building, then use a separate global form | Select an object and act through its contextual commands |
| Stationary base viewed from one scale | Mars globe, regional orientation, and interactive surface view |
| Rover represented by a static object | Selectable rover with a visible destination, route, and travel |
| Large briefing/library outside the action | One short story card and optional contextual science details |

Keep the tested simulation, save validation, and reviewed evidence as reusable foundations. The current dashboard is not the visual reference for the next implementation.

## 3. World and camera

### Planet view

Start with a rotatable 3D Mars globe, a mission marker, and one short invitation from NOVA: “Your crew is waiting on Mars. Find their landing site.” The player selects the marker to continue. Hover or keyboard focus reveals its name; tapping selects it on touch devices.

### Region view

Move toward the selected area and show one landing zone, the outpost marker, and nearby terrain. The player selects the outpost to descend. Region labels and routes appear only when relevant. The initial mission has one playable region; the rest of the globe provides orientation rather than an implied fully playable planet.

### Surface view

A terrain-led 3D scene contains a recognizable habitat, solar array, life-support plant, greenhouse, shelter, laboratory, communications antenna, storage, rover, and sample stop. Terrain has relief, slopes, scattered rocks, and a readable route. Facilities look different enough to identify without a permanent label over every object.

The player pans, zooms, rotates, selects objects, and follows the rover. A **Return to base** control prevents becoming lost. **Planet view** returns to the globe without resetting the mission. Inspection and camera movement do not consume resources or advance time.

The first release uses a prepared globe and one bounded surface region. Camera transitions connect their presentation; this does not promise Google Earth's global terrain resolution or unlimited seamless zoom. The fictional outpost and rover route must be distinguished from measured Mars geography.

## 4. Interface on top of the world

```text
┌─────────────────────────────────────────────────────────────┐
│ Mission title / current chapter        Planet · Help · Menu │
│                                                             │
│                 INTERACTIVE 3D MARS WORLD                    │
│                                                             │
│           [selected structure / rover / destination]         │
│                    [context commands]                       │
│                                                             │
│ [current objective]       [small learned-resource indicators]│
│ [character + ONE short prompt + ONE immediate action]        │
└─────────────────────────────────────────────────────────────┘
```

- Canvas fills the viewport; normal play does not require scrolling a webpage.
- Aim to leave at least 80% of the desktop viewport and 70% of the mobile viewport unobscured when panels are closed. Check smaller devices during the visual prototype.
- Show one story card and one immediate objective. Only the selected object exposes its actions. A card can contain a decision between two meaningful alternatives.
- Hover shows a brief name/status, not a paragraph. Selection pins a small panel; clicking empty terrain or Close dismisses it. Tap and keyboard selection provide the same functionality.
- Display energy first. Reveal oxygen, food/water, and exposure when the story teaches them. Later, keep compact indicators accessible; detailed values open on demand.
- Before a paid action or turn commitment, reveal all affected resources, costs, warnings, and opportunity costs. Progressive disclosure must not conceal a consequence needed to make a fair decision.
- On mobile, use one compact bottom sheet at a time. Opening a sheet replaces another sheet; it does not stack several panels over the world.
- Keep sources, settings, replay, and the learning journal behind buttons. Reading them never spends a turn.

## 5. Story progression through action

The repeatable story pattern is:

**Notice something in the world → hear one useful fact → act → see the consequence → unlock the next story moment.**

Characters have distinct jobs: NOVA navigates and summarizes, Alex explains equipment, and Dr. Maya connects exploration and plant science to evidence. Use authored dialogue, approximately 15–30 words per prompt, with optional voice later. Do not deliver a lecture before allowing interaction.

A story advances when the required state change occurs. Clicking an unrelated object, closing a prompt, or waiting does not satisfy the action. A short “Continue” button may dismiss a consequence after a real action, but cannot replace the action itself. At genuine decision points, different valid choices converge on the next story moment with different resources and feedback.

### First mission sequence

| Beat | One concept introduced | Required player action | World response and next reveal |
| --- | --- | --- | --- |
| 1. Find the crew | Mars is the mission destination | Select the landing marker on the globe | Camera moves to the region; outpost becomes selectable |
| 2. Approach the outpost | The crew lives in this habitat | Select the habitat marker | Camera descends; NOVA introduces Alex |
| 3. Bring the base to life | Electricity is limited | Select the solar array and inspect available generation | Power flow/selection feedback; energy indicator appears |
| 4. Help the crew breathe | Making oxygen uses electricity | Select life support and change its planned power setting | Preview changes; oxygen and energy relationship becomes visible |
| 5. Plan tomorrow's meals | Food takes time, electricity, and water | Select the greenhouse and make a lighting choice | Crop progress, food reserve, and water cost are explained in separate short prompts |
| 6. Choose the crew's first job | Research competes with other work | Select the lab and choose research or conserving power | One-task limit and exact costs appear; first plan is ready for review |
| 7. Commit the first plan | Decisions have consequences | Review affected resources and confirm **Advance mission** | Turn 1 resolves once; the selected world effects play; NOVA explains one consequence |
| 8. Protect the crew | Radiation protection competes with mission work | On turn 2, inspect the warning and choose shelter or an available alternative | Shelter/crew activity changes; exposure becomes a learned indicator |
| 9. Reach the sampling area | Exploration uses reserves and accepts risk | From turn 3, select the rover, choose the marked stop, review and confirm a plan | Rover follows a visible route; a completed field task produces a sample and a short discovery |
| 10. Act without instant Earth help | Advice cannot solve the current decision immediately | From turn 4, inspect the antenna and choose whether to request advice or use another crew task | Request queues a hint for the next turn; local mission choices remain available |
| 11. Finish and reflect | Safety, reserves, and science must be balanced | Complete the remaining turns | World stays visible; a short debrief links a decision to its result and offers replay |

Beats 1–6 prepare turn 1; they are not six resource-consuming turns. Turn 2 introduces radiation, turn 3 unlocks sampling, and turn 4 introduces Earth advice and permanent shielding. After a system is introduced, its controls remain available. The later mission allows independent planning rather than forcing a single winning sequence.

The first guided mission requires the introduction actions, not a particular winning resource configuration. An optional replay mode can skip already-completed teaching prompts after the guided experience, while retaining warnings and forecasts.

## 6. Time, choices, and consequences

Keep the existing six-turn resource model for the redesign's first iteration. Each turn is an abstract planning interval, not a literal sol. The canonical numbers and resolution order live in `tech plan.md`.

Object commands modify a pending plan. They do not silently charge resources each time a button is clicked. The player can inspect and revise the plan, then use the contextual **Advance mission** control to commit it once. Camera movement, opening a source, and dialogue never advance the simulation.

The rover destination is a planned field task. Show its route and costs before commitment. Travel after commitment visualizes that resolved task; skipping animation or changing the camera cannot duplicate rewards or alter resource calculations. Show completion feedback after arrival, or immediately in reduced-motion mode.

Keep research, field sampling, shelter, shield upgrades, Earth advice, and conserving power as the six task types. One crew task is available per turn. System power allocation remains independent of that crew task.

Success remains: finish turn six with oxygen, water, and food above zero, exposure at or below 12 game points, three research objectives, and at least one field sample. Safe-return and mission-abort outcomes provide supportive feedback and a same-scenario retry. Reassess the balance only if the story gates make a previously valid strategy impossible.

## 7. NASA science in the story

Introduce a source when it explains the action the player is taking. A short **Why is this real?** button opens details; reading the entire source is never a requirement to progress. A learning journal records encountered concepts and can replay their explanations. Full attribution remains accessible from the menu.

| Context | Evidence and boundary |
| --- | --- |
| Powering life support | MOXIE demonstrated oxygen production from atmospheric carbon dioxide; the game's crew-scale plant and output are fictional |
| Greenhouse lighting | OSD-314 and publication DOI `10.3390/ijms22020899`; Arabidopsis seedling experiments inform a narrow lighting lesson, not the game's crop yield |
| Solar warning | Archived DONKI event `2024-05-10T06:27:00-FLR-001`, X3.9; flare class does not establish Mars dose or arrival |
| Radiation explanation | Four ISS DosTel1 readings from 1 April 2022; retain μGy/hour and ISS context; never convert them into game exposure points |
| Exploring Mars | Jezero image PIA24485 provides real observational context. A separate credited globe texture and terrain-region assets must still be acquired |
| Delayed Earth advice | NASA Mars communications research supports crew autonomy; next-turn delivery is a teaching abstraction |
| Food planning | CSA food-production and youth resources support explanations and classroom follow-up |

Label observed data, research findings, fictional placement, and game rules separately. Credit NASA/partners and do not imply endorsement. Portal links, rover photographs, and an illustrated globe must not be presented as a measured elevation model.

Challenge reference: the user-supplied Junior Astronaut Mission Trainer brief. The official [details](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=details) and [resources](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=resources) pages should be checked before submission; official 2026 judging criteria have not been verified.

## 8. Art direction and assets needed from the user

The authoritative inventory and production specifications are in [assets.md](assets.md). Supply source material in the root [Assets folder](../Assets); approved runtime derivatives will later go in `public/assets`.

The brief covers the Mars globe and terrain, eight facilities, rover, exploration props, crop stages, character portraits, optional audio/branding, export rules, and source/credit metadata. Produce batch A first to approve the opening experience before creating the whole asset family. All models should share the recommended stylized-realistic direction.

A Blender MCP connection is an alternative to manually delivering every model. The desired capabilities and collaborative authoring workflow are in `assets.md` section 12. The user can provide references and art direction while the agent helps build and export assets after execution is authorized. No local Blender connection is currently established.

Visual references, preferred style, target devices, launch language, audio/voice preference, deadline, and learner-testing availability should be recorded with the assets. Scientific globe/terrain sources can be acquired by the developer if the user prefers to focus on original art. Application development remains paused for review.

## 9. Acceptance criteria

- Opening the game reveals the interactive Mars world and one story invitation, with no persistent dashboard/sidebar.
- The player can rotate the globe, select the mission marker, descend, pan/zoom/rotate terrain, select a building, and inspect its contextual action.
- The first introduction reveals one new concept at a time. The next story beat waits for its required action; dismissing text cannot bypass it.
- Actions visibly change the world or the pending plan. A rover task shows a route, movement, arrival, and an earned discovery after a single valid commitment.
- All five challenge themes affect playable decisions: life support, power, shielding, food, and delayed communications.
- Every affected resource and meaningful risk is disclosed before commitment; no child loses because the tutorial concealed a necessary system.
- Equivalent touch/keyboard controls exist; hover is optional; controls use readable text, at least 44 px touch targets, reduced-motion support, and captions for speech.
- A lightweight mode preserves the same story and decisions. Normal 3D mode remains the primary experience.
- At least two valid strategies remain possible; the first chapter's story gates do not invalidate the existing winning fixtures.
- A child can complete the opening interaction and explain its one trade-off without an adult reading a full briefing aloud.

## 10. Next step and review boundary

The immediate next step is user review of this direction, the story sequence, and the batch-A reference/style requests in `assets.md`. Do not change application code until the user authorizes continuation.

After that review, build only the opening experience for visual approval: full-screen Mars globe → mission marker → terrain/outpost descent → select solar array → reveal one fact → select life support → change power allocation → see the preview and unlock the next prompt. Use provisional assets where necessary. Review the camera, world dominance, contextual controls, and action-gated pacing before rebuilding the rest of the mission.
