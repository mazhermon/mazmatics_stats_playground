---
name: nz-primary-school-research
description: Research context for NZ primary and intermediate school data. Contains data source findings, CSV locations, API endpoints, and schema notes for building a primary school data feature. Read this skill before any work on primary/intermediate school visualisations.
version: 1.0.0 (research complete — 2026-03-17)
stacks:
  - Next.js 15
  - SQLite / better-sqlite3
  - D3.js v7
  - Three.js / React Three Fiber
---

# NZ Primary & Intermediate School Data Research

> **Status:** Research in progress. Run `/ralph-loop` from the project root to begin web research.
> **Context files to read alongside this skill:**
> - `CLAUDE.md` — project conventions, architecture, code patterns
> - `brand.md` — Mazmatics brand colours, fonts, tone of voice
> - `research-findings.md` — live findings document (filled by ralph loop)
> - `summary.md` — existing NZQA feature state

---

## Research Goal

Identify trustworthy, downloadable NZ government data about primary school and intermediate school
maths achievement that can be:
- Pulled into the Mazmatics Stats app as a new feature page
- Visualised with D3.js / Three.js in a way that complements the existing NZQA secondary data
- Cross-referenced with the secondary school NZQA data to tell a "pipeline" story (Years 4 → 8 → NCEA)

The audience is the same as the existing site: NZ parents and educators.

---

## Source Checklist (Research Complete)

| # | Source | Status |
|---|--------|--------|
| 1 | Education Counts — NMSSA | ⚠️ 403, data found via S3 PDFs |
| 2 | Curriculum Insights (successor to NMSSA) | ✅ data found |
| 3 | NMSSA S3 PDFs (direct downloads) | ✅ data extracted |
| 4 | Education Counts — maths statistics | ⚠️ 403 |
| 5 | Education Counts — National Standards (2010–2017) | ⚠️ 403, lower priority |
| 6 | Education Counts — school rolls | ⚠️ 403, not needed for v1 |
| 7 | Education Counts — attendance | ⚠️ 403, not relevant |
| 8 | Education Counts — school directory | ⚠️ 403, not relevant |
| 9 | TIMSS (timss2023.org Excel files) | ✅ full data extracted |
| 10 | MoE TIMSS 2023 page | ⚠️ 403, data found via timss2023.org |
| 11 | Stats NZ education | ⚠️ analytics-only, not relevant |
| 12 | data.govt.nz | ❌ bot-blocked |
| 13 | Education Counts — PaCT | ⚠️ 403, lower priority |

---

## Known Background (Pre-Research)

### What NZ uses for primary school assessment

NZ primary schools (Years 1–8, ages 5–13) and intermediate schools (Years 7–8, ages 11–13) do NOT
have a national exam equivalent to NCEA. Instead:

- **NMSSA** (National Monitoring Study of Student Achievement) — annual sampling study of Years 4
  and 8. Covers maths, reading, science, etc. Run by University of Otago / NZCER on behalf of MoE.
  Sample-based (not census), so no individual school data — only national and demographic breakdowns.

- **National Standards** (2010–2017) — schools self-reported Year 1–8 achievement against national
  standards in reading, writing, and maths. Published as aggregated data by MoE. Discontinued after
  2017 due to reliability concerns.

- **Progress and Consistency Tool (PaCT)** — teacher OTJ tool that replaced National Standards.
  Aggregate data may be available from MoE but less published than National Standards.

- **TIMSS** (Trends in International Mathematics and Science Study) — NZ participates at Year 5
  (age 9–10). Provides international benchmark comparisons. Run every 4 years by IEA.

- **e-asTTle** — widely used adaptive assessment tool in NZ primary schools. Results are NOT
  published publicly — school/teacher facing only.

- **NAPLAN equivalent** — NZ does NOT have an equivalent; no census-style national test at primary level.

### Implications for the app

- NMSSA will likely provide the best longitudinal maths data (2013–present, Years 4 and 8)
- National Standards gives historical data 2010–2017 but with reliability caveats
- TIMSS gives international context for Year 5
- School roll / demographic data from Education Counts can support equity analysis
- No per-school maths achievement data exists publicly for primary (unlike secondary where NZQA data is school-level)

---

## Findings (filled by ralph loop)

> The ralph loop will add structured findings here after each source is investigated.
> See `research-findings.md` for the full detailed notes.

_Research not yet started — run `/ralph-loop` to begin._

---

## Data Schema Ideas (to be confirmed by research)

Once data is confirmed available, the new DB tables might look like:

```sql
-- NMSSA maths achievement by year and group
CREATE TABLE nmssa_maths (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,          -- e.g. 2023
  school_year INTEGER NOT NULL,   -- 4 or 8
  group_type TEXT NOT NULL,       -- 'national', 'gender', 'ethnicity', 'school_type', 'region'
  group_value TEXT,               -- e.g. 'Female', 'Māori', 'Auckland'
  mean_score REAL,                -- national curriculum level or scaled score
  pct_below REAL,                 -- % below expectation
  pct_at_or_above REAL,           -- % at or above expectation
  sample_size INTEGER,
  notes TEXT
);

-- National Standards historical data (2010–2017)
CREATE TABLE national_standards (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  year_level INTEGER,             -- 1–8
  subject TEXT NOT NULL,          -- 'mathematics'
  group_type TEXT NOT NULL,
  group_value TEXT,
  pct_well_below REAL,
  pct_below REAL,
  pct_at REAL,
  pct_above REAL,
  student_count INTEGER
);
```

_These schemas are speculative — confirm against actual data formats after research._
