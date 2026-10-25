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

Scroll motion uses GSAP ScrollTrigger, with staggered character entrances, a moving
typography ribbon, unfolding project panels, pointer-responsive depth, and animated
section graphics. The monogram uses CSS 3D geometry. Continuous decorative motion
pauses outside the viewport and while the page is hidden. Scrolling remains native,
and all links and project details work with motion disabled.
The header's motion control can disable animation for the current page, and the
initial presentation respects the system's reduced-motion preference.

`npm run build` generates the static site in `dist/` for hosting.
