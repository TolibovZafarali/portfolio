# Zafarali Tolibov — Portfolio

A personal portfolio built with React, TypeScript, Vite, and GSAP.

## Featured projects

| Project | Visit | Source |
| --- | --- | --- |
| Venfour — vehicle valuation | [Website](https://venfour.com) | [Repository](https://github.com/TolibovZafarali/venfour) |
| Imposter: All Languages — party game | [App Store](https://apps.apple.com/us/app/imposter-all-languages/id6771144493) | [Repository](https://github.com/TolibovZafarali/imposter) |

## Run locally

Requires Node.js **22.13 or newer** and npm.

```bash
git clone https://github.com/TolibovZafarali/portfolio.git
cd portfolio
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Find your way around

| To change or inspect | Start here |
| --- | --- |
| Project descriptions, links, and contact information | [src/content/portfolio.ts](src/content/portfolio.ts) |
| Page structure and section order | [src/App.tsx](src/App.tsx) |
| Navigation, sections, and artwork | [src/components/](src/components/) |
| Colors, typography, and layout | [src/styles/](src/styles/) |
| Scroll animation and motion controls | [src/motion/](src/motion/) |
| Project images and logos | [public/projects/](public/projects/) |
| Unit and browser tests | [tests/](tests/) |

The [original design plan](docs/PORTFOLIO_DESIGN_PLAN.md) is retained for historical reference.

## Check and build

```bash
npm run lint
npm test
npm run build
```

The build checks TypeScript and writes the static site to `dist/`. Run
`npm run preview` to view it at [localhost:4173](http://localhost:4173).

For browser checks, install Chromium once, then run the suite:

```bash
npx playwright install chromium
npm run test:e2e
```

Browser tests build and serve the site automatically, covering responsive layouts,
keyboard navigation, project details, and reduced motion.
