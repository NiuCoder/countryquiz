# Country Quiz

English | [简体中文](README.zh-CN.md)

Version 0.3.0 · Live site: https://countryquiz.app

A Duolingo-style geography quiz with several game modes (outlines, flags, names and capitals), in English, Chinese and French. Built with Astro as a static site: the game is a JS module wrapped in pre-rendered HTML pages, so search engines can index every page.

## How to play

- Shape to name, name to shape, flag to name, name to flag, name to capital, capital to name, or a mixed challenge
- Explore mode: a draggable, zoomable world map. Tap a country to see its flag, outline, capital, continent and local-script name, and hear it read aloud
- 165 countries across three difficulty levels, filterable by continent
- Missed questions come back before the lesson ends. Progress is saved in the browser's localStorage; no sign-up needed

## Page structure

| URL | Content |
|---|---|
| `/en/`, `/zh/`, `/fr/` | Home page, start a quiz right away |
| `/{lang}/{mode}/{region}/` | Quiz × region landing page, e.g. `/en/flag-quiz/europe/`, which opens with that mode and region preset |
| `/{lang}/explore/` | Explore mode (world map) |
| `/{lang}/country/{slug}/` | Country page: flag, outline, capital, neighbouring countries |
| `/` | Redirects to `/en/` (via `public/_redirects`) |
| `/sitemap.xml` | Single sitemap with every page, generated at build time |

- Mode slugs: `shape-quiz`, `find-the-shape-quiz`, `flag-quiz`, `find-the-flag-quiz`, `capital-quiz`, `guess-country-by-capital`, `mixed-quiz`
- Region slugs: `world`, `asia`, `europe`, `africa`, `north-america`, `south-america`, `oceania`
- Roughly 215 pages per language: 49 landing pages and 165 country pages, plus the home and explore pages

## Project layout

- `src/game/game.js`: game logic, started with `initGame(cfg)`; `src/game/i18n.js`: UI strings
- `src/data/`: map outlines (Natural Earth / world-atlas), country metadata, capitals
- `public/flags/`: flag SVGs (flag-icons, MIT licence)
- `src/lib/site.js`: site constants, slugs, country list; `src/lib/copy.js`: SEO titles and descriptions per page
- `src/pages/`: routes (including `sitemap.xml.ts`); `src/layouts/Base.astro`: canonical, hreflang, Open Graph, JSON-LD
- `scripts/make-og.mjs`: regenerates the share images `public/og-en.png`, `public/og-zh.png` and `public/og-fr.png`

## Adding a language

Add the locale to `LANGS` (`src/lib/site.js`), the strings to `I18N` (`src/game/i18n.js`), and the copy to `copy.js`. Routes are generated automatically.

## Local development

Requires Node.js 22.22 or later. The repo's `.node-version` pins Node 24.

```sh
npm install
npm run dev      # http://localhost:4321/ (note: / redirects only on Cloudflare; open /en/ directly)
npm run build    # outputs to dist/
npm run preview  # preview the build
```

## Deployment (Cloudflare Pages)

- Production branch: `main`
- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`

When you change the domain, update `site` in `astro.config.mjs`, `SITE` in `src/lib/site.js`, and the Sitemap URL in `public/robots.txt`.
