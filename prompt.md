# Data Sources Filtering System — Build Prompt

## Goal
Upgrade `/data-sources` with interactive filtering and add "View sources" links to every chart page. This system builds trust — users can trace any chart back to its raw data origin.

## Skills to Read First
Read these skills before writing any code:
- `ui-ux-pro-max`
- `frontend-design`
- `nextjs-ssr`

---

## What Exists Already

`src/app/data-sources/page.tsx` — static Server Component page with 4 source entries:
- NZQA Secondary School Statistics (subject attainment, scholarship)
- TIMSS International Maths Study
- NMSSA Maths Achievement Reports
- Curriculum Insights Dashboard

The NZQA entry currently only lists `/nzqa-maths` and `/nzqa-scholarship` as "Used on" — this is incomplete. The page uses anchor IDs `#source-nzqa`, `#source-timss`, `#source-nmssa`, `#source-curriculum-insights`.

---

## Step 1 — Create the Data Model

Create `src/lib/data-sources.ts` with all source and chart-page metadata.

### Source IDs (7 total — granular NZQA breakdown)

```ts
export type SourceId =
  | 'nzqa-secondary'         // NZQA Subject Attainment (NCEA L1/L2/L3 maths)
  | 'nzqa-scholarship'       // NZQA Scholarship Statistics (Calculus & Statistics)
  | 'nzqa-endorsement'       // NZQA Endorsement Statistics (Excellence/Merit)
  | 'nzqa-literacy-numeracy' // NZQA Literacy & Numeracy Co-requisite Statistics
  | 'timss'                  // TIMSS International Maths Study
  | 'nmssa'                  // NMSSA Maths Achievement Reports
  | 'curriculum-insights';   // Curriculum Insights Dashboard

export type ChartPageId =
  | 'primary-maths'
  | 'nzqa-maths'
  | 'nzqa-scholarship'
  | 'nzqa-endorsement'
  | 'nzqa-literacy-numeracy'
  | 'nzqa-creative'
  | 'nzqa-stories'
  | 'nzqa-patterns';
```

### Chart-to-source mappings

```ts
export const CHART_PAGE_SOURCES: Record<ChartPageId, SourceId[]> = {
  'primary-maths':           ['timss', 'nmssa', 'curriculum-insights'],
  'nzqa-maths':              ['nzqa-secondary'],
  'nzqa-scholarship':        ['nzqa-scholarship'],
  'nzqa-endorsement':        ['nzqa-endorsement'],
  'nzqa-literacy-numeracy':  ['nzqa-literacy-numeracy'],
  'nzqa-creative':           ['nzqa-secondary'],
  'nzqa-stories':            ['nzqa-secondary'],
  'nzqa-patterns':           ['nzqa-secondary'],
};
```

### Chart page display metadata

```ts
export const CHART_PAGE_META: Record<ChartPageId, { label: string; href: string }> = {
  'primary-maths':           { label: 'NZ Primary Maths Explorer',       href: '/primary-maths' },
  'nzqa-maths':              { label: 'NZ Secondary Maths Explorer',      href: '/nzqa-maths' },
  'nzqa-scholarship':        { label: 'NZ Scholarship Explorer',          href: '/nzqa-scholarship' },
  'nzqa-endorsement':        { label: 'NZ Endorsement Explorer',          href: '/nzqa-endorsement' },
  'nzqa-literacy-numeracy':  { label: 'NZ Literacy & Numeracy Explorer',  href: '/nzqa-literacy-numeracy' },
  'nzqa-creative':           { label: 'Creative Views',                   href: '/nzqa-creative' },
  'nzqa-stories':            { label: 'Data Stories',                     href: '/nzqa-stories' },
  'nzqa-patterns':           { label: 'Patterns & Trends',                href: '/nzqa-patterns' },
};
```

### Source metadata array

Define `DATA_SOURCES: Source[]` carrying over ALL content from the existing static page, plus adding the 3 missing NZQA sources. Each source object:

```ts
interface DataSource {
  id: SourceId;
  name: string;
  publisher: string;
  years: string;
  urls: Array<{ label: string; url: string }>;
  description: string;
  caveats: Array<{ type: 'warning' | 'info'; text: string }>;
}
```

**Existing 4 sources to migrate (content already in page.tsx):**
1. `nzqa-secondary` — NZQA Secondary School Statistics (subject attainment + the scholarship content currently in there)
2. `timss` — TIMSS International Maths Study
3. `nmssa` — NMSSA Maths Achievement Reports
4. `curriculum-insights` — Curriculum Insights Dashboard

**3 new sources to add:**

`nzqa-scholarship`:
- name: "NZQA Scholarship Statistics"
- publisher: "New Zealand Qualifications Authority (NZQA)"
- years: "2015–2024"
- urls: [{ label: "nzqa.govt.nz/statistics ↗", url: "https://www.nzqa.govt.nz/about-us/publications/statistics/" }]
- description: "Outstanding / Scholarship / No Award rates for NZ Scholarship Calculus and Statistics, broken down by ethnicity, equity group, gender, and region."
- caveats: [{ type: 'info', text: "Small cohort sizes in some ethnicity/region breakdowns — treat with caution." }, { type: 'info', text: "Scholarship is awarded to the top ~3% of candidates nationally." }]

`nzqa-endorsement`:
- name: "NZQA Endorsement Statistics"
- publisher: "New Zealand Qualifications Authority (NZQA)"
- years: "2015–2024"
- urls: [{ label: "nzqa.govt.nz/statistics ↗", url: "https://www.nzqa.govt.nz/about-us/publications/statistics/" }]
- description: "Excellence and Merit endorsement rates for NCEA L1, L2, L3 and University Entrance qualifications, broken down by ethnicity, equity, gender, and region."
- caveats: [{ type: 'info', text: "Endorsement is a qualification-level award (not subject-level) — reflects the full year's achievement across all subjects." }, { type: 'warning', text: "Equity group format changed in 2019: decile bands replaced with equity index groups (Fewer/Moderate/More resources)." }]

`nzqa-literacy-numeracy`:
- name: "NZQA Literacy & Numeracy Co-requisite Statistics"
- publisher: "New Zealand Qualifications Authority (NZQA)"
- years: "2009–2024"
- urls: [{ label: "nzqa.govt.nz/statistics ↗", url: "https://www.nzqa.govt.nz/about-us/publications/statistics/" }]
- description: "Current-year and cumulative pass rates for NCEA literacy and numeracy co-requisite standards at Year 11, 12, and 13. Broken down by ethnicity, equity group, gender, and region."
- caveats: [{ type: 'warning', text: "New co-requisite standards (CAAs) replaced old Unit Standards from 2020 — causes a sharp drop in current-year pass rates visible from 2020." }, { type: 'warning', text: "Equity group format changed in 2019: decile bands replaced by equity index groups." }, { type: 'info', text: "Current-year rate = first-time passers. Cumulative rate = ever passed by that year level (includes re-sits)." }]

Also derive a reverse mapping (source → chart pages):
```ts
export function getChartsForSource(sourceId: SourceId): ChartPageId[] {
  return (Object.entries(CHART_PAGE_SOURCES) as [ChartPageId, SourceId[]][])
    .filter(([, sources]) => sources.includes(sourceId))
    .map(([pageId]) => pageId);
}
```

---

## Step 2 — Create ViewSourcesLink Component

Create `src/components/ViewSourcesLink.tsx` — renders a plain `<a>` tag (works in server and client components).

```tsx
import { CHART_PAGE_META, ChartPageId } from '@/lib/data-sources';

interface ViewSourcesLinkProps {
  chartPageId: ChartPageId;
  variant?: 'chart' | 'page';
}
```

- `variant="chart"` (default): `text-xs font-mono text-slate-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1`
  - Text: "View data sources →"
- `variant="page"`: `text-xs font-mono px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-300 transition-all inline-flex items-center gap-1.5`
  - Text: "View all data sources for this page →"

Both link to `/data-sources?chart={chartPageId}`.

---

## Step 3 — Create PageSourcesFooter Component

Create `src/components/PageSourcesFooter.tsx` — server-safe, no 'use client' needed.

```tsx
import { CHART_PAGE_SOURCES, CHART_PAGE_META, DATA_SOURCES, ChartPageId } from '@/lib/data-sources';
import { ViewSourcesLink } from './ViewSourcesLink';

interface PageSourcesFooterProps {
  chartPageId: ChartPageId;
}
```

Renders:
1. A thin divider (`<div className="h-px bg-slate-800" />`)
2. Label: `"Data sources used on this page:"` (text-xs text-slate-600 font-mono)
3. Source name chips for each source used by this page (looked up from CHART_PAGE_SOURCES + DATA_SOURCES)
   - Style: `bg-slate-800/60 text-slate-500 rounded-full px-2 py-0.5 text-xs font-mono`
4. `<ViewSourcesLink chartPageId={chartPageId} variant="page" />`

---

## Step 4 — Upgrade data-sources/page.tsx

### Server Component (thin wrapper)

Replace `src/app/data-sources/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { DataSourcesClient } from './DataSourcesClient';

export const metadata: Metadata = { ... }; // keep existing

export default async function DataSourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ chart?: string; source?: string }>;
}) {
  const params = await searchParams;
  return (
    <DataSourcesClient
      initialChart={params.chart as ChartPageId | undefined}
      initialSource={params.source as SourceId | undefined}
    />
  );
}
```

### Client Component (DataSourcesClient.tsx)

Create `src/app/data-sources/DataSourcesClient.tsx` with `'use client'`.

**State:**
- `activeChart: ChartPageId | null` — which explorer is filtered
- `activeSource: SourceId | null` — which source is filtered
- Synced with URL via `useSearchParams()` and `router.push()`

**Layout structure (keep all existing nav/header/footer):**

```
[Nav bar — unchanged]
[Main]
  [Header — h1, tagline — unchanged]
  [Jump links nav — keep, but derive from DATA_SOURCES array]
  [Filter UI — NEW]
    [Panel A: Find sources for an explorer]
    [Panel B: Find explorers that use a dataset]
  [Filter banner — shown when either filter is active]
  [Source cards list — rendered from DATA_SOURCES array]
[Footer — unchanged]
```

### Filter UI — Panel A ("Find sources for an explorer")

```tsx
<div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
    Find sources for a specific explorer
  </p>
  <select
    value={activeChart ?? ''}
    onChange={e => setActiveChart(e.target.value as ChartPageId || null)}
    className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50"
  >
    <option value="">All explorers</option>
    {Object.entries(CHART_PAGE_META).map(([id, meta]) => (
      <option key={id} value={id}>{meta.label}</option>
    ))}
  </select>
</div>
```

### Filter UI — Panel B ("Find explorers by dataset")

```tsx
<div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
    Find explorers that use a specific dataset
  </p>
  <select
    value={activeSource ?? ''}
    onChange={e => setActiveSource(e.target.value as SourceId || null)}
    className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50"
  >
    <option value="">All datasets</option>
    {DATA_SOURCES.map(s => (
      <option key={s.id} value={s.id}>{s.name}</option>
    ))}
  </select>
  {/* When source filter is active, show which explorers use it */}
  {activeSource && (
    <div className="flex flex-wrap gap-2 pt-1">
      {getChartsForSource(activeSource).map(chartId => (
        <a key={chartId} href={CHART_PAGE_META[chartId].href}
           className="bg-teal-900/30 border border-teal-500/30 text-teal-300 rounded-full px-2.5 py-0.5 text-xs font-mono hover:bg-teal-900/50 transition-colors">
          {CHART_PAGE_META[chartId].label}
        </a>
      ))}
    </div>
  )}
</div>
```

### Filter Active Banner

When `activeChart` or `activeSource` is set, show below the filter panels:

```tsx
<div className="border border-teal-500/30 bg-teal-950/20 rounded-xl p-4 flex items-center justify-between gap-4">
  <p className="text-sm text-teal-300 font-mono">
    {activeChart
      ? `Showing sources for: ${CHART_PAGE_META[activeChart].label}`
      : `Showing explorers that use: ${DATA_SOURCES.find(s => s.id === activeSource)?.name}`}
  </p>
  <button
    onClick={clearFilters}
    className="text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 rounded-full px-3 py-1 transition-all"
  >
    × Clear filters
  </button>
</div>
```

### Source Cards Under Filtering

**Chart filter active (`activeChart` set):**
- Cards whose source ID is in `CHART_PAGE_SOURCES[activeChart]`: full opacity, `border-teal-500/40 bg-teal-950/10`
- All other cards: `opacity-40`
- On mount/filter change, scroll to first matching card

**Source filter active (`activeSource` set):**
- That source's card: `border-teal-500/40 bg-teal-950/10` (highlighted)
- Other cards: normal (not dimmed — source filter is additive, not exclusionary)
- Scroll to matched card on mount

**No filter:** all cards normal

### Updated "Used on" chips
Each source card derives its "Used on" chips from `getChartsForSource(source.id)` — no more hardcoded chip arrays.

### URL sync
On filter change, call:
```ts
const params = new URLSearchParams();
if (newChart) params.set('chart', newChart);
if (newSource) params.set('source', newSource);
router.push(`/data-sources${params.size ? '?' + params.toString() : ''}`, { scroll: false });
```

On mount, initialise state from `initialChart` and `initialSource` props.

---

## Step 5 — Add ViewSourcesLink to All Explorer Pages

### `/primary-maths/page.tsx`
This page has 3 distinct data sections. Read the current page content first, then add ViewSourcesLinks in appropriate spots:
- In the TIMSS section (near TIMSSWorldRanking / TIMSSTrendChart): add `<ViewSourcesLink chartPageId="primary-maths" />` with surrounding text `"(TIMSS data — IEA 1995–2023)"`
- In the NMSSA section: add `<ViewSourcesLink chartPageId="primary-maths" />` with `"(NMSSA data — 2013/2018/2022)"`
- In the Curriculum Insights section: add `<ViewSourcesLink chartPageId="primary-maths" />` with `"(Curriculum Insights 2023–2024)"`
- At the page footer: `<PageSourcesFooter chartPageId="primary-maths" />`

### All other explorer pages (add PageSourcesFooter only)
Read each page's existing footer section and insert `<PageSourcesFooter chartPageId="..." />` before the existing footer nav links:
- `/nzqa-maths/page.tsx` → `chartPageId="nzqa-maths"`
- `/nzqa-scholarship/page.tsx` → `chartPageId="nzqa-scholarship"`
- `/nzqa-endorsement/page.tsx` → `chartPageId="nzqa-endorsement"`
- `/nzqa-literacy-numeracy/page.tsx` → `chartPageId="nzqa-literacy-numeracy"`
- `/nzqa-creative/page.tsx` → `chartPageId="nzqa-creative"`
- `/nzqa-stories/page.tsx` → `chartPageId="nzqa-stories"`
- `/nzqa-patterns/page.tsx` → `chartPageId="nzqa-patterns"`

**Important:** Read each page.tsx before editing it. These are large files.

---

## Step 6 — TypeScript & Build Checks

After all files are written:
1. Run `npx tsc --noEmit` — fix all type errors
2. Run `npm run build` — fix any build errors

---

## Acceptance Criteria

- [ ] `src/lib/data-sources.ts` has all 7 sources and 8 chart page mappings with full metadata
- [ ] `src/components/ViewSourcesLink.tsx` renders `<a href="/data-sources?chart=...">`
- [ ] `src/components/PageSourcesFooter.tsx` renders source chips + ViewSourcesLink
- [ ] `/data-sources?chart=primary-maths` highlights TIMSS, NMSSA, Curriculum Insights cards; dims others
- [ ] `/data-sources?source=nzqa-secondary` highlights that source card; shows its chart pages as teal chips
- [ ] Filter banner appears with correct label and × Clear button
- [ ] Clearing filters resets URL and removes all visual filter state
- [ ] All 8 explorer pages have a PageSourcesFooter
- [ ] `npx tsc --noEmit` passes clean
- [ ] `npm run build` passes clean

## Completion Promise

Output `<promise>DATA_SOURCES_SYSTEM_COMPLETE</promise>` when all acceptance criteria are met.

## ## Completion Promise section (for ralph-loop stop hook detection)

DATA_SOURCES_SYSTEM_COMPLETE
