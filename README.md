# Zafarali Tolibov — Portfolio

A personal portfolio featuring Venfour first, followed by Imposter: All Languages.
Built with React, TypeScript, Vite, and GSAP, with self-hosted typography.

## Development

```bash
npm install
npm run dev
```

Local preview: http://localhost:3000.

## Validation

```bash
npm run build
npm test
npm run test:e2e
```

Browser checks cover phone, tablet, and desktop layouts, keyboard navigation,
project details, native scrolling, motion controls, and reduced-motion preferences.

## Content and visuals

Project descriptions, technology lists, destinations, and public contact links are
in `src/content/portfolio.ts`. Both project repositories are public. The Venfour
showcase uses a capture of its public homepage; Imposter uses the project's App
Store artwork. Public links and source material were checked on October 24, 2026.

The opening uses GSAP ScrollTrigger: a sticky hero carries the 3D monogram
through an orbital particle field into a second, dark composition. The monogram
then fades out as the page returns to the project showcases. The hero sequence
uses 270svh on desktop and 240svh on smaller screens.

The rest of the portfolio scrolls naturally. Each project pairs its artwork and
explanation on desktop and stacks them on phones, with a brief entrance and a
subtle pointer tilt. About presents the introduction and all three principles
together, followed directly by the contact section. There are no pinned project
stages or additional transformation interludes.

The monogram uses CSS 3D geometry; the orbital field uses a lightweight,
resolution-capped canvas. Decorative motion pauses outside the viewport and while
the page is hidden. The fixed motion control preserves the current reading
position when animation is disabled, and the initial presentation respects the
system's reduced-motion preference. Geometry refreshes on resize and when project
details expand.

Browser tests cover opening continuity, native scrolling, compact project flow,
local artwork, readable About and contact content, keyboard navigation, project
details, and motion controls across phone, tablet, and desktop layouts.

`npm run build` generates the static site in `dist/` for hosting.
