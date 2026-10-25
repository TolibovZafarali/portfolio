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

Scroll motion uses GSAP ScrollTrigger. A sticky opening carries the 3D monogram
through an orbital particle field into a second, dark composition. Venfour and
Imposter share a persistent visual surface: the monogram becomes a browser frame,
the browser narrows into a card, and the card fans into the game artwork. The shape
travels beside project details, becomes overlapping rings, and resolves into the
contact arrow. One background palette flows beneath the complete sequence.
Geometry is recalculated on resize and when project details expand; reversing the
scroll retraces the same path. The browser-to-card transformation has a dedicated
350svh sequence (300svh on phones and tablets): perspective turn, narrowing frame,
opaque mask reveal, and staggered card unfolding. Longer hero and project holds
slow the animation's pacing without intercepting wheel or touch scrolling.
Short landscape screens use a compact, unpinned presentation.

The monogram uses CSS 3D geometry; the orbital field uses a lightweight, resolution-
capped canvas. Decorative motion pauses outside the viewport and while the page is
hidden. Scrolling remains native, and navigation links can skip directly to the work.

The fixed motion control disables animation and sticky scroll distance while
preserving the section being viewed. All project links and details remain available,
and the initial presentation respects the system's reduced-motion preference.
Pausing inside the decorative transformation lands on the usable Imposter showcase.
Browser tests exercise rapid reversals, mid-sequence resizing, the opening seam,
direct anchors, and repeated motion toggles as well as the static presentation.

`npm run build` generates the static site in `dist/` for hosting.
