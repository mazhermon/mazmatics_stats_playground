# Data Sources Maintenance — Adding New Charts and Sources

Read this skill before adding any new explorer page or data source to the project.
The data sources system links every chart back to its raw data — it must be kept complete and accurate.

---

## System Overview

Three files power the system:

| File | Role |
|---|---|
| `src/lib/data-sources.ts` | Single source of truth — all types, metadata, and mappings |
| `src/components/ViewSourcesLink.tsx` | `<a>` component linking a chart page to its filtered sources view |
| `src/components/PageSourcesFooter.tsx` | Footer component used in every explorer page |

The `/data-sources` page reads from `data-sources.ts` and supports two URL params:
- `?chart=<ChartPageId>` — highlights sources used by that explorer
- `?source=<SourceId>` — highlights that source and shows which explorers use it

---

## Adding a New Explorer Page

When you add a new page like `/nzqa-newfeature`, do ALL of the following:

### 1. Add the ChartPageId type

In `src/lib/data-sources.ts`, extend `ChartPageId`:

```ts
export type ChartPageId =
  | 'primary-maths'
  | 'nzqa-maths'
  // ... existing entries ...
  | 'nzqa-newfeature';   // ← add this
```

### 2. Add to CHART_PAGE_META

```ts
export const CHART_PAGE_META: Record<ChartPageId, { label: string; href: string }> = {
  // ... existing entries ...
  'nzqa-newfeature': { label: 'NZ New Feature Explorer', href: '/nzqa-newfeature' },
};
```

### 3. Add to CHART_PAGE_SOURCES

Map the new page to the source IDs it uses:

```ts
export const CHART_PAGE_SOURCES: Record<ChartPageId, SourceId[]> = {
  // ... existing entries ...
  'nzqa-newfeature': ['nzqa-secondary'],   // ← use correct SourceId(s)
};
```

### 4. Add PageSourcesFooter to the new page

In the new page's `page.tsx`, import and render at the bottom of the content (before footer nav links):

```tsx
import { PageSourcesFooter } from '@/components/PageSourcesFooter';

// Inside the page JSX, in the footer section:
<PageSourcesFooter chartPageId="nzqa-newfeature" />
```

### 5. Update CLAUDE.md source map table

In the "Data Sources System" section of CLAUDE.md, update the SourceId mapping table.

### 6. Verify on the data-sources page

Visit `/data-sources?chart=nzqa-newfeature` in the browser. Confirm:
- Correct source cards are highlighted (teal border)
- Other source cards are dimmed
- The filter banner shows the correct explorer name

---

## Adding a New Data Source

When the project adds a dataset from a new publisher or a distinctly separate dataset:

### 1. Add the SourceId type

In `src/lib/data-sources.ts`:

```ts
export type SourceId =
  | 'nzqa-secondary'
  // ... existing entries ...
  | 'new-source-id';   // ← add this, using kebab-case
```

### 2. Add to DATA_SOURCES array

Add a full `DataSource` object to the `DATA_SOURCES` array:

```ts
{
  id: 'new-source-id',
  name: 'Full Display Name of Dataset',
  publisher: 'Publishing organisation name',
  years: '2020–2024',
  urls: [
    { label: 'Short display label ↗', url: 'https://...' },
  ],
  description: 'What specific data we use from this source and how.',
  caveats: [
    { type: 'warning', text: 'Important thing users should know about data limitations.' },
    { type: 'info',    text: 'Less critical but useful context.' },
  ],
}
```

**Content guidelines for caveats:**
- `warning` = something that could cause misinterpretation (e.g. metric definition, discontinuity, small N)
- `info` = useful context that doesn't affect interpretation (e.g. sample size note, methodology change)
- Write for a parent or educator audience — plain language, no jargon

### 3. Map the source to chart pages

Update `CHART_PAGE_SOURCES` for any pages that use the new source:

```ts
'nzqa-newfeature': ['nzqa-secondary', 'new-source-id'],
```

### 4. Update CLAUDE.md

Add a row to the SourceId mapping table in the "Data Sources System" section.

### 5. Verify

Visit `/data-sources?source=new-source-id`. Confirm:
- The source card is highlighted (teal border)
- The "Used by" chips correctly list the explorer pages

---

## Removing a Source or Explorer

If a page or source is retired:

1. Remove from `ChartPageId` or `SourceId` type
2. Remove from `CHART_PAGE_META`, `CHART_PAGE_SOURCES`, or `DATA_SOURCES` as appropriate
3. Remove `PageSourcesFooter` from the retired page (or delete the page)
4. Run `npx tsc --noEmit` — the type system will catch any references you missed
5. Update CLAUDE.md

---

## Quick Checklist (copy this when adding a new page)

```
[ ] Added ChartPageId to type union in data-sources.ts
[ ] Added entry to CHART_PAGE_META
[ ] Added entry to CHART_PAGE_SOURCES with correct SourceId(s)
[ ] Added PageSourcesFooter to new page's footer
[ ] Updated CLAUDE.md source map table
[ ] Verified /data-sources?chart=<new-id> shows correct highlighted cards
[ ] npx tsc --noEmit passes clean
```

---

## Existing Source IDs (as of last update)

| SourceId | Name | Used by |
|---|---|---|
| `nzqa-secondary` | NZQA Subject Attainment | nzqa-maths, nzqa-creative, nzqa-stories, nzqa-patterns |
| `nzqa-scholarship` | NZQA Scholarship Statistics | nzqa-scholarship |
| `nzqa-endorsement` | NZQA Endorsement Statistics | nzqa-endorsement |
| `nzqa-literacy-numeracy` | NZQA Literacy & Numeracy Co-requisites | nzqa-literacy-numeracy |
| `timss` | TIMSS International Maths Study | primary-maths |
| `nmssa` | NMSSA Maths Achievement Reports | primary-maths |
| `curriculum-insights` | Curriculum Insights Dashboard | primary-maths |
