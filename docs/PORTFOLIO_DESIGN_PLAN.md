# Portfolio Design Plan

Status: active living plan
Direction: locked
Content phase: neutral structural prototype

## Creative concept

### The Editorial Aperture

A single precise incision divides a warm paper-like surface. Scrolling opens that incision into an aperture through which each abstract project is viewed. The aperture changes scale, position, and orientation, but it never becomes a disconnected effect: it is the page's navigation, crop, transition device, project frame, system spine, and final closing mechanism.

The absence of identity is treated as deliberate reserve. `PORT` and `FOLIO` begin on opposite sides of the incision. The first scroll separates them to reveal the first project beneath. At the end, the aperture closes and the title returns with the index marked complete.

The emotional arc is **stillness → rupture → investigation → system → closure**.

## Research synthesis

The research pass reviewed current scroll-focused award galleries, recent portfolio winners, editorial studio work, and typography-led interaction examples. Sources include [Dropbox Brand](https://brand.dropbox.com/), [Exat Typeface](https://exat.hottype.co/), [Immersive Garden](https://immersive-g.com/), [Bézier](https://www.bezier.com/), [Software Is Culture](https://www.figma.com/blog/software-is-culture/), [The Age of Incarceration](https://longlead.com/article/age-of-incarceration), [The Monolith Project case study](https://www.commarts.com/webpicks/the-monolith-project-1), and the [CSS Design Awards 2025 winners](https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/).

Principles to synthesize:

- Establish the interaction contract in the first three seconds: readable composition first, immediate scroll response second.
- Use one memorable spatial transformation instead of several unrelated reveals.
- Let typography and negative space carry identity before adding media or effects.
- Pin only when a fixed reference materially helps the visitor understand a transformation.
- Give every active transition a still state before or after it so motion retains contrast.
- Preserve continuity by passing a line, crop edge, color field, or aligned glyph between scenes.
- Keep the native scroll model; animation follows input and never delays it.
- Re-author the composition for touch screens instead of compressing desktop choreography.
- Keep hierarchy and the strongest crop intact when motion is reduced or unavailable.
- Prefer deterministic geometry over continuous decorative rendering.

Patterns explicitly rejected:

- full-page smooth-scroll replacement;
- generic centered introduction copy;
- sequential fade-up sections;
- ornamental microtext and crop marks without informational purpose;
- showpiece WebGL without a structural role;
- novelty cursors, particles, marquees, glass surfaces, soft glow, or startup gradients;
- long pinned sequences that require repeated scrolling before meaning changes.

No source layout, identity, signature transition, typography treatment, copy, or code will be reproduced.

## Emotional target

### Initial arrival

Quiet confidence. The page should feel complete before it moves: warm, nearly empty, sharply typeset, and intentionally asymmetric. The incision suggests latent depth without behaving like a loading state.

### First scroll

A controlled rupture. The paper panels separate and reveal a carbon-black field already carrying the first project composition. This is the loudest and most surprising movement on the page, while remaining directly proportional to native scroll.

### Middle exploration

Measured investigation. Each project uses the same aperture differently, with long moments in which the visitor can simply look. Range comes from crop logic and typographic material, not from a new animation trick per section.

### Project transitions

Inevitable rather than decorative. An oxide rail, glyph edge, or route segment survives each boundary and becomes the next scene's organizing line.

### Final section

Resolution. The system spine becomes the closing handle; the aperture compresses, the opening geometry returns, and the completed index replaces the opening prompt.

## Visual system

### Typography

- Primary family: self-hosted Archivo Variable, licensed through the Fontsource package.
- Display treatment: width and weight axes used sparingly for spatial tension; no animated character scrambling.
- Information treatment: Archivo at compact sizes with expanded tracking and tabular numerals.
- Only the opening and Project 02 use monumental type. Other scenes rely on medium-scale headings and disciplined labels.

### Scale

- Display: `clamp(4.6rem, 14vw, 15rem)` with breakpoint-specific line-height.
- Scene title: `clamp(2.8rem, 7vw, 8rem)`.
- Ledger rows: `clamp(1.8rem, 4vw, 4.8rem)`.
- Information: `0.68rem–0.82rem`, never below accessible practical reading size.

### Grid

- Desktop: 12 columns; incision at approximately column seven rather than centered.
- Tablet: 8 columns; incision moves nearer the optical center.
- Mobile: 4 columns; the incision changes from vertical to horizontal.
- Outer edge: responsive `clamp(1rem, 2.2vw, 2.5rem)`.

### Spacing

- Base spacing unit: `0.5rem`.
- Major spacing follows a restrained modular sequence: `1, 2, 3, 5, 8, 13` units.
- Scene padding is held at the edges so large forms can crop against the viewport without accidental gutters.

### Color and contrast

- Paper: `#e8e2d7`.
- Carbon: `#11120f`.
- Oxide: `#c63f28`.
- Quiet ink: `#747168`.
- Project variation comes from changing the proportion of these three primary colors, not introducing new palettes.
- Body copy and controls meet WCAG AA contrast; oxide is used for carriers and accents, not small text on paper.

### Lines, shapes, and surfaces

- One-pixel rules, square corners, hard crops, and solid fields.
- No gradients, shadows, blur, glow, simulated glass, or rounded card containers.
- Abstract media consists of slabs, bands, aligned type, route segments, and nodes built with semantic HTML and CSS.
- Depth comes from occlusion, cropping, and layer order rather than faux lighting.
- The persistent motif is the incision/aperture with one oxide carrier attached to an edge.

## Motion language

The vocabulary is intentionally limited:

1. **Open / close** — paired panels expose or conceal the aperture.
2. **Edge-parallel translation** — content moves along an existing rail, never in arbitrary directions.
3. **Hard crop** — apertures reveal different readings of a static composition.
4. **Contrast inversion** — identical typography changes material as a dark aperture crosses it.
5. **Carrier travel** — one small oxide marker indicates progress along the current structural line.

Timing philosophy:

- Scroll-bound transformations use scrubbed progress with no artificial overshoot.
- Interface feedback uses `160–240ms`; entry accents use `320–480ms` with a restrained cubic ease.
- Scene timelines reserve roughly the first or last 20% as stillness.
- No element animates continuously while idle.
- Pointer response is omitted; it would not improve the concept.

## Storyboard

### Scene 00 — Reserved opening

- **Visitor sees:** A warm viewport split by a one-pixel vertical incision. `PORT` and `FOLIO` sit on opposite panels. Small edge labels read `INDEX / 00—05`, `SELECTED STRUCTURES`, and `SCROLL / OPEN`.
- **Changes while scrolling:** After a short dwell, the incision widens asymmetrically.
- **Remains fixed:** Edge labels and the carbon field beneath establish position.
- **Enters:** A cropped `01` and Project 01 geometry appear under the separating panels.
- **Exits:** Title halves leave with their physical panels; they do not fade.
- **Connection:** The hero underlayer exactly matches Project 01's opening crop.
- **Mobile:** `PORT` sits above and `FOLIO` below a horizontal incision; panels move vertically.
- **Reduced motion:** The incision is statically widened enough to reveal a carbon strip and signal the concept.

### Scene 01 — Plane

- **Visitor sees:** A carbon field holding one oversized paper slab, an oxide band, and `01 / PLANE`.
- **Changes while scrolling:** The aperture and slab travel laterally to expose three deliberate crops of one static composition.
- **Remains fixed:** The project label and large field.
- **Enters:** A slim oxide band from the lower edge.
- **Exits:** Most geometry clears the viewport, leaving the oxide band aligned with the next scene's sweep edge.
- **Connection:** The surviving band becomes Project 02's moving material boundary.
- **Mobile:** Crops move vertically in a shorter sticky stage.
- **Reduced motion:** The strongest middle crop appears as a static editorial spread.

### Scene 02 — Type

- **Visitor sees:** Monumental `PROJECT / 02` typography on paper with the inherited oxide edge.
- **Changes while scrolling:** A carbon aperture sweeps across an exactly aligned duplicate, changing filled carbon type to paper outline without scrambling or cross-fading.
- **Remains fixed:** Letterforms and baseline.
- **Enters:** Carbon field from the inherited edge.
- **Exits:** The field completes its pass; one terminal glyph stroke remains as a line.
- **Connection:** The terminal stroke becomes the first segment in Project 03's route.
- **Mobile:** The material boundary travels top to bottom across stacked words.
- **Reduced motion:** Both material states are shown side by side in a static split composition.

### Scene 03 — Route

- **Visitor sees:** A centered paper aperture within carbon, containing a deterministic orthogonal route with three numbered junctions.
- **Changes while scrolling:** The aperture widens to reveal the route; one junction shifts by one grid cell to demonstrate controlled system change.
- **Remains fixed:** The route origin and project label.
- **Enters:** Route segments by crop reveal, not by constant line drawing.
- **Exits:** The final endpoint settles on the global incision coordinate.
- **Connection:** The endpoint extends into the system scene as its spine.
- **Mobile:** A simplified route uses fewer turns and a tall aperture.
- **Reduced motion:** The completed route and aligned endpoint are shown statically.

### Scene 04 — Operations

- **Visitor sees:** A typographic ledger crossing a two-pixel spine: `FRAME`, `SEQUENCE`, `TYPE`, `MOTION`, `SYSTEM`, `REFINE`.
- **Changes while scrolling:** One oxide carrier descends the spine. Each crossed row briefly increases weight and switches its visual relationship to the spine.
- **Remains fixed:** All ledger rows stay legible throughout.
- **Enters:** Rows appear as part of the initial composition, avoiding sequential badges.
- **Exits:** The carrier reaches the final row; the spine remains.
- **Connection:** The carrier becomes the handle that closes the final aperture.
- **Mobile:** Ledger returns to normal flow with a short sticky rule and generous row spacing.
- **Reduced motion:** Full ledger is static with the final row emphasized by position, not animation.

### Scene 05 — Closure

- **Visitor sees:** Carbon space compressing between returning warm panels.
- **Changes while scrolling:** Panels converge in one concise movement; `PORT` and `FOLIO` return with them.
- **Remains fixed:** The spine coordinate and oxide handle.
- **Enters:** `INDEX / 05—05`, `STRUCTURE COMPLETE`, and a functional `RETURN / TOP` anchor.
- **Exits:** Abstract project material disappears behind the panels.
- **Connection:** The final viewport echoes the opening geometry and resolves the same motif.
- **Mobile:** Panels close vertically around the horizontal incision.
- **Reduced motion:** A static echo of the opening follows the final ledger in normal document flow.

## Technical architecture

### Stack

- React 19 with strict TypeScript.
- Vite 8 as a lean single-page build; server rendering is unnecessary for this local one-page visual prototype.
- GSAP with ScrollTrigger as the sole motion library.
- Modern authored CSS for layout, sticky positioning, tokens, responsive typography, and static fallback states.
- CSS/DOM abstract project media; no canvas, WebGL, raster project imagery, or authored illustration assets.
- Vitest for component/content tests and Playwright for end-to-end behavior.

### File boundaries

```text
src/
  components/
    chrome/
    scenes/
    artwork/
  content/
    portfolio.ts
  motion/
    choreography.ts
    tokens.ts
  styles/
    tokens.css
    base.css
    scenes.css
  App.tsx
  main.tsx
tests/
  unit/
  e2e/
public/
  screenshots/
```

Content labels, scene order, capability rows, and future project slots live in the centralized content module. Layout components consume typed data. Motion uses component-owned references and centralized durations/eases rather than paragraph-dependent measurements or global selectors.

## Performance strategy

- Keep the initial experience to React, one variable font package, GSAP core, and ScrollTrigger.
- Import only the required Latin width-axis variable font; verify font swap produces negligible layout shift.
- Use transforms plus bounded, typed CSS custom properties in scrubbed animation.
- Avoid filter animation, layout-thrashing measurements, large shadows, and permanent `will-change`.
- Add `will-change` only while motion enhancement is active and release it after each relevant trigger.
- Use native sticky positioning for the fixed spatial reference; do not pin through JavaScript.
- Use `gsap.context()` and `gsap.matchMedia()` cleanup on unmount and media-query changes.
- No requestAnimationFrame loop, pointer tracker, smooth-scroll engine, WebGL context, or video.
- Mobile timelines use fewer animated properties and shorter stage lengths.
- The complete static document renders before motion enhancement initializes.

## Accessibility strategy

- Semantic landmarks, one `h1`, ordered scene headings, real lists for the system ledger, and a final real anchor.
- A skip link moves directly to the project index.
- Persistent index anchors are keyboard reachable and use clear `:focus-visible` treatment.
- Visual duplicate title layers and decorative geometry are hidden from assistive technology.
- Project media receives concise neutral accessible labels without fictitious claims.
- Native scrolling is preserved; no scroll hijacking or forced snapping.
- Touch does not depend on hover or pointer position.
- Color pairings meet WCAG AA for meaningful text and controls.
- `prefers-reduced-motion: reduce` uses explicit static compositions; scroll timelines are never registered.
- Anchor scrolling uses instant behavior under reduced motion.
- Automated checks cover headings, labels, focus order, overflow, and reduced-motion state; browser inspection verifies practical behavior.

## Responsive choreography

### Desktop (`>= 1024px`)

- Vertical aperture at an asymmetric 58% coordinate.
- Hero around `180svh`; project stages around `135–150svh`.
- Long lateral crops and typographic sweep.
- Twelve-column alignment and edge-fixed metadata.

### Tablet (`769–1023px`)

- Vertical aperture remains but shifts toward center.
- Eight-column layout, reduced crop travel, and slightly shorter sticky intervals.
- System ledger labels wrap only at controlled breakpoints.

### Mobile (`<= 768px`)

- Aperture axis becomes horizontal.
- Hero title stacks above and below the incision.
- Project crops move vertically; each sticky scene is shorter and has an early stable reading state.
- Route loses nonessential turns; system ledger moves into natural flow with a short sticky spine.
- `svh`/`dvh` units account for mobile browser chrome.
- Pointer-only behavior is absent and all controls retain at least a 44px touch target.

### Reduced motion

- Hero, project, system, and ending scenes return to normal document flow.
- Each scene displays its strongest final composition without parallax, large translation, scale travel, or scroll-bound clipping.
- The aperture remains as a static sectional rule, preserving identity and continuity.

## Implementation milestones

- [x] Inspect repository and identify an empty-workspace baseline.
- [x] Complete current design research and define synthesis principles.
- [x] Lock the concept, visual system, motion vocabulary, responsive direction, and storyboard.
- [x] Replace the temporary scaffold with the lean Vite application foundation.
- [x] Create typed centralized content, design tokens, semantic chrome, and static scene compositions.
- [x] Implement desktop scroll choreography and cleanup-safe motion utilities.
- [x] Implement tablet and mobile re-compositions.
- [x] Implement the explicit reduced-motion presentation and keyboard/focus behavior.
- [x] Add unit and end-to-end coverage plus validation scripts.
- [x] Run the full application and inspect all required viewport sizes and intermediate scroll states.
- [x] Perform the creative-director critique, identify five weak moments, and improve all five.
- [x] Perform the restraint-only second pass and remove anything unnecessary or too loud.
- [x] Re-run browser inspection, accessibility/runtime checks, lint, typecheck, tests, end-to-end tests, build, and whitespace validation.
- [x] Capture final screenshots and record exact handoff details.

## Review log

This section will be updated after each inspection pass with concrete findings and completed changes.

### Initial review

The complete first pass was inspected from top to bottom at 390×844, 430×932, 768×1024, 1440×900, and 1920×1080. The opening, first-scroll transition, all three project scenes, the system ledger, and the final closure remained free of horizontal overflow. Two clipped reveals initially interpolated asymmetrically; both were rebuilt with typed CSS properties. Mobile retained a distinct horizontal aperture and vertical panel movement rather than shrinking the desktop layout.

### Five-moment critique

The weakest five moments and completed revisions:

1. **Plane repeated the hero crop too long.** Its stage was shortened and its black cut gained a carried oxide edge so later crops read as a new state rather than a replay.
2. **Operations became visually noisy.** Inactive rows now remain single and still; only the carrier-crossed word changes weight and receives an oxide text reveal.
3. **Closure began with dead air.** Its stage and dwell were compressed, and `CLOSE / 05` now orients the initial carbon frame before the panels arrive.
4. **Route looked like a generic boxed flowchart.** Node boxes were removed; numbers now sit directly at route turns, oxide is reserved for the endpoint, and an inherited `02` origin connects it to the previous scene.
5. **Microtype and navigation were too timid.** The minimum information size rose to 12px, quiet ink was darkened to AA contrast, context-specific oxide text colors were added, and desktop navigation exposes scene labels on hover or focus.

### Restraint pass

The second pass removed unnecessary duplication in Operations, reduced Plane and Closure scroll lengths, kept pointer effects out, limited font output to one Latin variable file, removed unused full-stack/auth/database scaffolding, and retained only one motion library. No new decoration, ambient animation, smooth-scroll engine, image asset, or framework was added.

### Final verification

Completed on August 13, 2026.

- Production browser coverage: 390×844, 430×932, 768×1024, 1440×900, and 1920×1080.
- Intermediate-state inspection: opening rupture, all project pins, Operations carrier travel, closing midpoint, final rest, mobile Type, and tablet transitions.
- Runtime result: no application warnings, errors, exceptions, or horizontal overflow in the final pass.
- Accessibility result: one main landmark, a single H1, five H2 headings, labelled regions, artwork alternatives, working skip/return links, visible focus, 44px navigation targets, explicit current-location state, AA text tokens, and a purpose-built reduced-motion composition.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 3/3 passed.
- `npm run test:e2e`: 30/30 passed across all five viewport projects, including reduced motion, keyboard flow, anchors, overflow, native scroll transforms, and console monitoring.
- `npm run build`: passed; output is 107.95 kB gzip JavaScript, 4.39 kB gzip CSS, and one 90.10 kB variable-font file.
- `npm audit`: zero vulnerabilities.
- `git diff --check` and direct trailing-whitespace scan: passed.
- Repository scans found no personal content, fabricated claims, prohibited attribution language, or prohibited filenames.
- Final captures are stored in `public/screenshots/`.
- Known test limitation: the automated end-to-end matrix uses Chromium; Firefox and WebKit were not included.
- Local review command: `npm install && npm run dev`, then open `http://localhost:3000`.
