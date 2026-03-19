# Current Status: Phase 18 PLANNED — Social Media Videos

**Phase 17.5 COMPLETE (2026-03-19):** Gender colours updated (Boys = purple `#BA90FF`, Girls = yellow `#FFF73E`, Māori = red `#E53E3E`), GenderNote component wired into 8 charts.
**Phase 17 COMPLETE (2026-03-19):** Beta banner + corner badge live, page navs at `top-10`.
**Phase 16 COMPLETE (2026-03-19):** SQLite → Supabase Postgres migration. 175/175 unit, all e2e green, build clean.

## Phase 18 — Social Media Videos (READY TO START)

**Goal:** Create short Instagram Reels-style `.webm` videos of the site's best interactive charts at mobile size (390×844), using Playwright's built-in video recording. No ffmpeg required.

**Approach:** `scripts/record-social-videos.ts` — Playwright chromium with `recordVideo`, 5 scripted interaction sequences.

**Run with:**
```
/ralph-loop --max-iterations 8 --completion-promise "SOCIAL_VIDEOS_COMPLETE"
```

**Output:** `e2e/social-videos/` (5 `.webm` files) + `socialpost.md` (Instagram copy for each video).
**Full spec:** `prompt.md`

## Phase 17.5 — Gender Colours + GenderNote ✅ COMPLETE

- `src/lib/palette.ts`: Boys/Male = `#BA90FF`, Girls/Female = `#FFF73E`, Māori = `#E53E3E`; added Boys/Girls aliases
- 3 hardcoded chart files updated: NMSSATrendChart, NMSSAEquityGaps, TIMSSTrendChart
- `src/components/charts/GenderNote.tsx`: 4-arc rainbow SVG icon + "Mazmatics acknowledges the infinite gender spectrum — this data records boys and girls only."
- GenderNote shown conditionally on gender view in: TimelineExplorer, DeltaChart, ScholarshipTrendChart, LiteracyNumeracyTrendChart, EndorsementTrendChart, NMSSATrendChart, NMSSAEquityGaps, TIMSSTrendChart

## Phase 17 — Beta Banner + Corner Badge ✅ COMPLETE

- `src/components/layout/BetaBanner.tsx` — amber strip, `#FFF73E` left accent, sticky top-0, NZ English copy
- `src/components/layout/BetaBadge.tsx` — fixed top-right corner ribbon, Mazmatics gradient
- All 9 page navs adjusted from `sticky top-0 z-50` to `sticky top-10 z-50` so they stack below the banner
- `e2e/beta-banner.spec.ts` — 2/2 smoke tests passing

## Phase 16 — Supabase Migration ✅ COMPLETE

**Goal:** Replace SQLite + better-sqlite3 with Supabase Postgres. Same data, same SQL queries, new driver (`postgres` npm package). Unblocks Vercel deployment.

**Key decisions:**
- Using `postgres` npm package (raw SQL, `sql.unsafe(queryStr, params)`) — minimal query rewrite
- All 10 API routes updated (7 NZQA + 3 primary), positional params `$1`/`$2`
- `schema.sql` + `seed-supabase.ts` written for one-time data migration
- Tests mocked at `src/lib/db/index.ts` level with `mockUnsafe`
- `MZMS__POSTGRES_URL_NON_POOLING` (port 5432 direct) preferred over pooled URL (port 6543 hangs locally)

**Manual steps (already done):**
1. Run `src/data/schema.sql` in Supabase SQL editor ✅
2. Run `npm run seed:supabase` ✅
3. Verify deployed charts load on Vercel (pending deploy)

---

## What was just built (Phase 15)

- `src/app/about/page.tsx` — Server Component, 6 sections, full Mazmatics brand treatment
- Graph-paper grid hero background, animated diagonal stripe SVG decoration
- Offset colour-block shadow on book card, gradient headings, `#BA90FF` stat card accents
- "About Mazmatics" nav card added to home page
- `e2e/about.spec.ts` — 14 e2e tests, all passing
- Pre-existing TS error in `nmssa.test.ts` fixed (double-cast via `unknown`)

## What was just built (Phase 14)

- `src/app/data-sources/page.tsx` — Server Component, 4 source cards with anchors
- "About this data ↗" footer links on `/nzqa-maths`, `/nzqa-scholarship`, `/primary-maths`
- "Data sources & methodology →" footer link on all three pages
- "View data sources →" link on home page
- `e2e/data-sources.spec.ts` — 9 e2e tests, all passing

## Dev server note (important)
Pages `/nzqa-maths`, `/nzqa-scholarship`, `/primary-maths` need pre-warming on first dev-server access. If they return 500:
```bash
pkill -f "next dev"
npm run dev &
sleep 8
curl -s http://localhost:3000/nzqa-maths > /dev/null
curl -s http://localhost:3000/primary-maths > /dev/null
curl -s http://localhost:3000/nzqa-scholarship > /dev/null
```

---

## Future Work

### Track A — Phase 18 (next up)
Social media videos — see prompt.md

### Track B — Remaining NZQA untapped tables (lower priority)

| Page/Section | Data Source | Charts | Status |
|---|---|---|---|
| `/nzqa-endorsement` | `qualification_endorsement` table — already seeded | Merit/Excellence rates by group + trend | ❌ todo |
| `/nzqa-literacy` | `literacy_numeracy` table — already seeded | Co-attainment rate by group + year-on-year | ❌ todo |

## Before starting any new NZQA page — inspect the DB table first:
```bash
npx tsx -e "
import Database from 'better-sqlite3';
const db = new Database('src/data/nzqa.db');
console.log(JSON.stringify(db.prepare('SELECT * FROM qualification_endorsement LIMIT 3').all(), null, 2));
console.log(JSON.stringify(db.prepare('PRAGMA table_info(qualification_endorsement)').all(), null, 2));
console.log(JSON.stringify(db.prepare('SELECT DISTINCT year FROM qualification_endorsement ORDER BY year').all(), null, 2));
"
```

---

# Future Work: Security Hardening (pre-launch, no urgency yet)

## Context
The API routes (`/api/nzqa/`, `/api/primary/`) are internal Next.js route handlers — not a standalone public API. All data served is publicly sourced (NZQA, TIMSS, NMSSA). All routes are read-only GET requests, no write operations. No user accounts or private data yet.

## Items to address before production launch

### 1. SQL Injection audit (most important)
All routes now use `sql.unsafe(queryStr, params)` with positional `$1`/`$2` params — parameterised. Audit that no string interpolation slipped through.

### 2. Rate limiting
Add rate limiting to API routes before going public. Options: Upstash Redis + `@upstash/ratelimit`, or Vercel's built-in.

### 3. Auth / login (revisit later)
No user accounts exist yet. Note to check back when auth work begins.

---

# Previous Work: Phase 9 — Diagnostic E2E Testing & Fixes ✅ COMPLETE (2026-03-18)

**All 91 e2e tests passing.** Bug found and fixed (TIMSSTrendChart invalid D3 CSS selector). `e2e/primary-maths.spec.ts` written (26 tests). All `nzqa-maths.spec.ts` timeouts fixed. See `test-todo.md` for full findings.

---

# Previous Work: Phase 8 — Primary School Maths Feature ✅ COMPLETE (2026-03-17)

**Built.** `/primary-maths` page live with 4 charts, 3 API routes, primary.db seeded.
See `summary.md` for full details of what was built.
Read `nz-primary-school-research` skill before any primary school feature work.

---

# Previous Work: Phase 7 Complete

All Phase 7 (NZQA secondary data explorer) work is complete. See `summary.md` for full context.

---

## P6 — Correlation ideas (all feasible with single-dimension data)

1. **Gender gap by level** — Female vs Male across L1/L2/L3
2. **Level progression** — National pass rates at L1 vs L2 vs L3 over time
3. **Regional variance** — Which regions are most volatile post-2024 reform?
4. **Equity × level** — Does the equity gap widen or narrow at L2/L3 vs L1?
5. **Scholarship by ethnicity** — Who attempts vs who succeeds

---

## Data Constraints (NZQA secondary — always remember)

- No cross-tabulation — single-dimension breakdowns only
- Equity data 2019–2024 only
- `achieved_rate` ≠ pass rate (it's Achieved-grade-only band)
- Pass rate = `1 - not_achieved_rate`
- Merit+Excellence = `merit_rate + excellence_rate`
- Regional data: use timeline API `groupBy=region`, NOT subjects API with `region=null`
