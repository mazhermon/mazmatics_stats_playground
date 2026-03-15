Read these files first before doing anything else:
- `.claude/skills/nzqa-data-research/SKILL.md` — data source URLs, database schema, API design
- `brand.md` — exact brand colours, fonts, tone of voice, design patterns
- `plan.md` — phased implementation plan
- `CLAUDE.md` — project conventions and architecture
- `.claude/SUMMARY.md` — session history and open questions
- `.claude/skills/d3-visualization/SKILL.md` — D3 best practices
- `.claude/skills/threejs-viz/SKILL.md` — Three.js/R3F patterns
- `.claude/skills/nextjs-ssr/SKILL.md` — Next.js App Router strategies
- `.claude/skills/frontend-design/SKILL.md` — anti-generic design principles
- `.claude/skills/ui-ux-pro-max/SKILL.md` — design intelligence

Now build the NZ Maths Achievement Data Explorer — a feature at `/nzqa-maths` that lets users interactively explore NCEA mathematics achievement data and understand equity in NZ schools.

## Phase 1: Data Pipeline

1. Download all 2024 NZQA CSV files listed in the research skill (Subject, Participation, Enrolment, LitNum, Qualification-endorsement, Scholarship — each with National, Gender, Ethnicity, School-Equity-Index-Group, Region variants). Store in `src/data/raw/nzqa/`. Also download at least the 2023 and 2022 sets to get ~10 years of coverage back to ~2012.

2. Install `better-sqlite3` and `@types/better-sqlite3`. Create the SQLite database at `src/data/nzqa.db` using the schema in the research skill.

3. Write `src/scripts/seed-nzqa.ts` — parse all downloaded CSVs, filter for Mathematics & Statistics in subject data, handle the decile-to-equity-index transition at 2023, deduplicate overlapping years, and populate all tables. Make it runnable via `npx tsx src/scripts/seed-nzqa.ts`.

4. Create Next.js Route Handlers under `src/app/api/nzqa/` with endpoints for subjects, qualifications, literacy-numeracy, scholarship, endorsements, and a timeline endpoint. All support filtering by year range, level, ethnicity, equity group, region, gender. Return JSON.

5. Verify the pipeline works end-to-end: download → seed → query via API.

## Phase 2: Visualisations

Build the page at `src/app/nzqa-maths/page.tsx` as a Server Component that fetches initial data and passes to client visualisation components via dynamic imports with `ssr: false`.

Build these 5 visualisations following the D3 and Three.js patterns in CLAUDE.md and the relevant skills:

1. **TimelineExplorer** (`src/components/charts/TimelineExplorer.tsx`) — D3 animated line/area chart showing maths achievement rates ~2012–2024. Toggle between NCEA levels. Smooth `.join()` transitions. Hover tooltips. `viewBox` for responsiveness. This is the opening chart — it sets the scene by showing the overall trend.

2. **EquityGapVisualizer** (`src/components/charts/EquityGapVisualizer.tsx`) — D3 small-multiples or overlaid chart comparing achievement by ethnicity (Māori, Pacific, Asian, European, MELAA) and by equity index group. Make the gaps visually unmistakable. This is the heart of the story — equity is the main lens.

3. **RegionalMap** (`src/components/charts/RegionalMap.tsx`) — D3 + TopoJSON choropleth of NZ regions coloured by maths achievement. Source a NZ regional boundaries TopoJSON and store in `public/geo/`. Clickable regions drill down to show that region's breakdown by ethnicity and equity group.

4. **AchievementLandscape** (`src/components/three/AchievementLandscape.tsx`) — Three.js/R3F 3D terrain where height = achievement rate, x-axis = year, z-axis = ethnicity or equity group. OrbitControls for exploration. Dynamic import with `ssr: false`. This should feel like a wow moment — the 3D view makes the equity gaps physically tangible.

5. **ComparisonDashboard** (`src/components/charts/ComparisonDashboard.tsx`) — D3 interactive heatmap or bubble chart where users pick any two dimensions (ethnicity × region, equity group × gender, level × year) and see cross-tabulated results. This is the exploration tool — let users find their own insights.

## Phase 3: Narrative and Design

Add guided narrative sections between visualisations — short, warm, conversational text (NZ English, no jargon) that explains what each chart reveals about equity in NZ maths education. The page should read like a data journalism piece, not a dashboard.

Follow brand.md exactly for design:
- Dark mode on `slate-950` background with `slate-100` text
- Mazmatics gradient (`linear-gradient(to left, #BA90FF, #47A5F1)`) on the nav/header and section headings via `background-clip: text`
- Consider a subtle graph-paper grid background (faint lines on dark slate) as a nod to the Mazmatics exercise book
- Offset colour-block shadows (`#BA90FF` + `#47A5F1`) on featured stat cards
- Geist Sans for body, Geist Mono for data labels and numbers
- Loading skeletons: `animate-pulse bg-slate-800 rounded-lg`
- Error boundaries for every visualisation
- Responsive mobile-first
- Colour-blind safe data palette (NOT the brand gradient — that's for branding only)
- All user-facing strings externalisable for future te reo Māori translation
- Macrons on all Māori words (Māori, Pākehā, whānau, Tāmaki Makaurau)

## Priorities
- Get the data pipeline working first — everything depends on it
- Start with TimelineExplorer and EquityGapVisualizer as they tell the core story
- The RegionalMap and AchievementLandscape can come next
- ComparisonDashboard last as it's the open-ended exploration tool
- Narrative polish throughout, not as a final bolt-on

Work through this methodically. Commit after each major milestone. Run `npm run build` to verify no SSR errors after adding client components.
