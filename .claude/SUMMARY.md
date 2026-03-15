# Project Session Log

## Session 1 — 2026-03-15: Project Scaffolding

### Goal
Set up "Mazmatics math stats playground" as a Next.js project with interactive data visualisation using D3, Three.js, and related technologies.

### What Was Done
- Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + D3.js v7 + Three.js/R3F scaffolded
- 7 Claude skills created in `.claude/skills/`
- `CLAUDE.md` created at project root
- npm registry was blocked in sandbox — Maz ran `npm install` locally

---

## Session 2 — 2026-03-15: NZ Maths Achievement Data Explorer

### Goal
Build the complete NZQA Data Explorer feature at `/nzqa-maths`.

### Data Pipeline
- `src/data/raw/nzqa/` — 38 CSV files (30 × 2024 + 8 × 2018)
- `src/data/nzqa.db` — SQLite: 834 subject rows (Maths, 2015–2024), 4536 qual, 2268 lit/num, 7678 scholarship, 3216 endorsement
- `src/scripts/seed-nzqa.ts` — run with `npx tsx src/scripts/seed-nzqa.ts`
- 6 API routes at `/api/nzqa/` (subjects, qualifications, literacy-numeracy, scholarship, endorsements, timeline)
- `next.config.ts` — `serverExternalPackages: ["better-sqlite3"]`

### Visualisations
1. `TimelineExplorer` — D3 animated line/area, NCEA level toggle, audio on hover
2. `EquityGapVisualizer` — D3 multi-line by ethnicity/equity, highlight on click
3. `RegionalMap` — D3 choropleth TopoJSON, drilldown by region
4. `AchievementLandscape` — Three.js/R3F 3D bar landscape (year × ethnicity × height)
5. `ComparisonDashboard` — D3 heatmap, any 2 dimensions, year + level selectable

### Audio
- `src/lib/audio/index.ts` — Web Audio API, pentatonic scale tones mapped to achievement values
- `playHoverTone()`, `playSelectChord()`, `playTransitionSweep()`

### Key Data Facts
- Subject label in DB: `Mathematics - Statistics`
- Equity groups: `Fewer`, `Moderate`, `More` (2019+); `Decile 1-3/4-7/8-10` (pre-2019)
- Ethnicity labels: `Māori`, `Pacific Peoples`, `Asian`, `European`, `Middle Eastern/Latin American/African`, `Other`
- TopoJSON at `public/geo/nz-regions.topojson`, property `REGC_name` includes " Region" suffix

### Important Fixes
- Tailwind updated 4.0.0 → 4.2.1 (ScannerOptions negated error)
- `jest.config.ts`: `setupFilesAfterSetup` → `setupFilesAfterEnv`
- `tsconfig.json`: disabled `noUncheckedIndexedAccess` and `noPropertyAccessFromIndexSignature`
- R3F JSX types: `src/types/r3f.d.ts` with `declare module 'react' { namespace JSX { interface IntrinsicElements extends ThreeElements {} } }`
- `ssr: false` dynamic imports must live in Client Components (not Server Components) — see `NzqaMathsClient.tsx`

### Current State
- Dev server at `http://localhost:3000`
- `/nzqa-maths` live, build passes clean
- Landing page links to `/nzqa-maths`
