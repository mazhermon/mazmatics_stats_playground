## Task: Build NZ Maths Achievement Data Explorer

Add a new feature to the existing Mazmatics Stats Playground: an interactive exploration of New Zealand secondary school mathematics achievement data sourced from NZQA.

Read the CLAUDE.md and .claude/SUMMARY.md first. Read the relevant .claude/skills/ SKILL.md files (d3-visualization, threejs-viz, nextjs-ssr, frontend-design, ui-ux-pro-max) before writing any code.

### Phase 1: Data Acquisition & Storage

**Download CSVs from NZQA** (https://www2.nzqa.govt.nz). Store raw files in `src/data/raw/nzqa/`. Base URL for all files: `https://www2.nzqa.govt.nz/assets/Qualifications-standards/Secondary-school-statistics/`

For the **2024** dataset, download these (each has National, Gender, Ethnicity, School-Equity-Index-Group, and Region variants):
- `2024/Subject/Subject-Attainment-Statistics-National-{variant}-2024-20250302.csv`
- `2024/Participation/Participation-Qualification-Attainment-Statistics-National-{variant}-2024-20250302.csv`
- `2024/Enrolment/Enrolment-Qualification-Attainment-Statistics-National-{variant}-2024-20250302.csv`
- `2024/LitNum/Level-1-Literacy-and-Numeracy-Attainment-Statistics-National-{variant}-2024-20250302.csv`
- `2024/Scholarship/Scholarship-Attainment-Statistics-National-{variant}-2024-20250302.csv`
- `2024/Qualification-endorsement/Qualification-Endorsement-Attainment-Statistics-National-{variant}-2024-20250302.csv`

Also download the equivalent files for **2023, 2022, 2021, 2020, 2019, 2018** year folders to extend coverage back to ~2009. Each file contains ~10 years of data — deduplicate overlapping years.

**Install `better-sqlite3`** and `@types/better-sqlite3`. Create a SQLite database at `src/data/nzqa.db`. Design normalised tables:
- `subject_attainment` — filter for Mathematics & Statistics subjects
- `qualification_attainment` — NCEA L1/L2/L3, UE pass rates
- `literacy_numeracy` — L1 literacy and numeracy attainment
- `scholarship` — scholarship results
- `qualification_endorsement` — merit/excellence endorsements

All tables should support columns for: year, level, metric, value, count, total, gender, ethnicity, equity_index_group (was "decile_band" pre-2023), region. Handle the 2023 transition from decile bands to equity index groups gracefully.

Write a seed script at `src/scripts/seed-nzqa.ts` that parses all downloaded CSVs and populates the DB. Create Next.js Route Handlers under `src/app/api/nzqa/` to query data with filter params (year range, level, ethnicity, equity group, region, gender).

### Phase 2: Visualizations

Create a feature route at `src/app/nzqa-maths/page.tsx` (Server Component) that fetches data and passes to client visualization components. Follow the project's dynamic import pattern with `ssr: false` for all chart components.

Build these visualizations in `src/components/charts/` and `src/components/three/`:

1. **TimelineExplorer** (D3) — Animated line/area chart of maths achievement rates ~2009–2024. Toggle NCEA levels. Smooth `.join()` transitions. Hover tooltips with detail. Use `viewBox` for responsiveness.

2. **EquityGapVisualizer** (D3) — Overlaid or small-multiples charts comparing achievement by ethnicity and equity index group. Show Māori, Pacific, Asian, European, MELAA. Make disparities visually clear through colour and scale choices.

3. **RegionalMap** (D3 + TopoJSON) — NZ map coloured by regional maths achievement. Source a NZ regional boundaries TopoJSON. Clickable regions for drill-down. Store TopoJSON in `public/geo/`.

4. **AchievementLandscape** (Three.js/R3F) — 3D terrain: height = achievement rate, x-axis = time, z-axis = equity group or ethnicity. OrbitControls for exploration. Use instanced meshes if >1000 data points. Dynamic import with `ssr: false`.

5. **ComparisonDashboard** (D3) — Interactive heatmap or bubble chart. User picks two dimensions (ethnicity × region, equity group × gender, etc.) to cross-tabulate results.

### Phase 3: Narrative & Polish

Add guided narrative sections between visualizations — short contextual text explaining what the data reveals about equity in NZ maths education. This should feel like a data journalism piece, not just a chart dashboard.

### Design Requirements
- Dark mode default, consistent with existing app (`bg-black text-white`, Geist fonts)
- Tailwind CSS v4 utility classes only
- Responsive mobile-first (sm → md → lg → xl → 2xl)
- Animated transitions between views
- Error boundaries for each visualization route
- Loading skeletons matching existing pattern: `<div className="animate-pulse bg-slate-800 rounded-lg h-64" />`

### Conventions (from CLAUDE.md)
- Server Components by default, `'use client'` only where needed
- `interface` for props, `type` for unions
- Path alias `@/` for imports
- PascalCase components, camelCase utils
- No default exports except pages/layouts
- D3: `.join()` pattern, cleanup in useEffect return, `viewBox` not fixed dimensions
- Three.js: `useFrame` not `requestAnimationFrame`, dispose geometries in cleanup
