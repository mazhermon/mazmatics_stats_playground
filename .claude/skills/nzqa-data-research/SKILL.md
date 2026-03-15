---
name: nzqa-data-research
description: NZQA NZ maths achievement data research context. Contains data source URLs, CSV file locations, database schema, and project plan for building the NZ Maths Achievement Data Explorer feature. Read this skill before starting any work on the NZQA data pipeline or visualisations.
version: 1.0.0
stacks:
  - Next.js 15
  - SQLite / better-sqlite3
  - D3.js v7
  - Three.js / React Three Fiber
---

# NZQA NZ Maths Achievement Data Research

> **Context files to read alongside this skill:**
> - `CLAUDE.md` — project conventions, architecture, code patterns
> - `brand.md` — Mazmatics brand colours, fonts, tone of voice, design direction
> - `plan.md` — full implementation plan (Phases 1–3)
> - `.claude/SUMMARY.md` — session history and decisions log

## Project Goal

Build an interactive data journalism feature at `/nzqa-maths` exploring NZ secondary school mathematics achievement data. The audience is parents and educators who want to understand maths achievement trends, equity gaps, and regional comparisons. The site should feel warm and approachable (Mazmatics brand) while being credible and data-driven.

## Data Sources

### Primary: NZQA Secondary Statistics Consolidated Files

**Homepage:** https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/
**Data format:** CSV and XLSX files, freely downloadable
**Coverage:** Each annual file contains ~10 years of historical data
**Years available:** 2018, 2019, 2020, 2021, 2022, 2023, 2024 consolidated sets

**Base URL for all CSV files:**
```
https://www2.nzqa.govt.nz/assets/Qualifications-standards/Secondary-school-statistics/
```

### 2024 Dataset CSV URLs

Each dataset has 5 variants: National, Gender, Ethnicity, School-Equity-Index-Group, Region.
The variant name appears in the filename. The "National" variant has no suffix.

**Subject Attainment** (filter for Mathematics & Statistics):
```
2024/Subject/Subject-Attainment-Statistics-National-2024-20250302.csv
2024/Subject/Subject-Attainment-Statistics-National-Gender-2024-20250302.csv
2024/Subject/Subject-Attainment-Statistics-National-Ethnicity-2024-20250302.csv
2024/Subject/Subject-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv
2024/Subject/Subject-Attainment-Statistics-National-Region-2024-20250302.csv
```

**Participation-based Qualification Attainment** (Year 11 / NCEA Level 1):
```
2024/Participation/Participation-Qualification-Attainment-Statistics-National-2024-20250302.csv
2024/Participation/Participation-Qualification-Attainment-Statistics-National-Gender-2024-20250302.csv
2024/Participation/Participation-Qualification-Attainment-Statistics-National-Ethnicity-2024-20250302.csv
2024/Participation/Participation-Qualification-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv
2024/Participation/Participation-Qualification-Attainment-Statistics-National-Region-2024-20250302.csv
```

**Enrolment-based Qualification Attainment** (Years 12–13 / NCEA Levels 2 & 3, UE):
```
2024/Enrolment/Enrolment-Qualification-Attainment-Statistics-National-2024-20250302.csv
2024/Enrolment/Enrolment-Qualification-Attainment-Statistics-National-Gender-2024-20250302.csv
2024/Enrolment/Enrolment-Qualification-Attainment-Statistics-National-Ethnicity-2024-20250302.csv
2024/Enrolment/Enrolment-Qualification-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv
2024/Enrolment/Enrolment-Qualification-Attainment-Statistics-National-Region-2024-20250302.csv
```

**Level 1 Literacy and Numeracy:**
```
2024/LitNum/Level-1-Literacy-and-Numeracy-Attainment-Statistics-National-2024-20250302.csv
2024/LitNum/Level-1-Literacy-and-Numeracy-Attainment-Statistics-National-Gender-2024-20250302.csv
2024/LitNum/Level-1-Literacy-and-Numeracy-Attainment-Statistics-National-Ethnicity-2024-20250302.csv
2024/LitNum/Level-1-Literacy-and-Numeracy-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv
2024/LitNum/Level-1-Literacy-and-Numeracy-Attainment-Statistics-National-Region-2024-20250302.csv
```

**Qualification Endorsement** (Merit/Excellence):
```
2024/Qualification-endorsement/Qualification-Endorsement-Attainment-Statistics-National-2024-20250302.csv
2024/Qualification-endorsement/Qualification-Endorsement-Attainment-Statistics-National-Gender-2024-20250302.csv
2024/Qualification-endorsement/Qualification-Endorsement-Attainment-Statistics-National-Ethnicity-2024-20250302.csv
2024/Qualification-endorsement/Qualification-Endorsement-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv
2024/Qualification-endorsement/Qualification-Endorsement-Attainment-Statistics-National-Region-2024-20250302.csv
```

**Scholarship:**
```
2024/Scholarship/Scholarship-Attainment-Statistics-National-2024-20250302.csv
2024/Scholarship/Scholarship-Attainment-Statistics-National-Gender-2024-20250302.csv
2024/Scholarship/Scholarship-Attainment-Statistics-National-Ethnicity-2024-20250302.csv
2024/Scholarship/Scholarship-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv
2024/Scholarship/Scholarship-Attainment-Statistics-National-Region-2024-20250302.csv
```

**Standard Attainment** (large files, per-standard data):
```
2024/Standard-Attainment-Statistics-National-2024-20250302.csv (11 MB)
2024/Standard/Standard-Attainment-Statistics-National-Gender-2024-20250302.csv (20 MB)
2024/Standard/Standard-Attainment-Statistics-National-Ethnicity-2024-20250302.csv (42 MB)
2024/Standard/Standard-Attainment-Statistics-National-School-Equity-Index-Group-2024-20250302.csv (9.2 MB)
2024/Standard/Standard-Attainment-Statistics-National-Region-2024-20250302.csv (66 MB)
```

**Standards List:**
```
2024/List-of-all-Standards-2024-20250302.csv (20 MB)
```

### Older Year Datasets

The same file structure exists for years 2018–2023. URL pattern:
```
{year}/Subject/Subject-Attainment-Statistics-National-{variant}-{year}-{datestamp}.csv
```

The datestamp varies by year. Visit each year's page to get exact filenames:
- 2023: https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/2023/
- 2022: https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/data-2022/
- 2021: https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/data-2021/
- 2020: https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/data-2020/
- 2019: https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/data-2019/
- 2018: https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/data-2018/

### Secondary: Education Counts (Ministry of Education)

**18-Year-Olds with NCEA Level 2+:** https://www.educationcounts.govt.nz/statistics/18-year-olds-with-level-2-or-equivalent
- Pivot table (Excel) and CSV for 2011–2022
- Breakdowns: student gender, ethnicity, leaving age, school type (decile, affiliation), region

### Secondary: NZQA Annual Reports (PDF)

Available for 2009–2024 at:
```
https://www2.nzqa.govt.nz/assets/NCEA/Secondary-school-and-NCEA/Annual-Reports-NCEA-Scholarship-Data/
```
These contain additional narrative context and tables not in the CSVs. Useful for pre-2014 data points and for understanding policy changes.

## ⚠️ CRITICAL: What Was Actually Built (Read Before Any Code)

### The DB is seeded and live at `src/data/nzqa.db`
- Run `node -e "const db = require('better-sqlite3')('src/data/nzqa.db',{readonly:true}); console.log(db.prepare('SELECT COUNT(*) as n FROM subject_attainment').get());"` to verify
- subject_attainment: 834 rows (Mathematics - Statistics, 2015–2024)

### Macron Encoding Warning
The source CSV files have `M?ori` (literal question mark, not ā). After any re-seed, run:
```js
const db = new Database('src/data/nzqa.db');
db.prepare("UPDATE subject_attainment SET ethnicity = REPLACE(ethnicity, 'M?ori', 'Māori') WHERE ethnicity LIKE '%M?ori%'").run();
```

### Actual Ethnicity Labels in DB (post-fix)
- `Asian`
- `European`
- `Māori` (with macron — must fix after re-seed)
- `Middle Eastern/Latin American/African` (long form, NOT "MELAA")
- `Pacific Peoples`

### Actual Equity Group Labels in DB
- `Fewer` (not "Low" or "Bottom")
- `Moderate`
- `More` (not "High" or "Top")
- Pre-2023 decile bands: `Decile 1-3`, `Decile 4-7`, `Decile 8-10`

### CRITICAL: No Cross-Tabulation in Data
Each CSV is a single-dimension breakdown. In `subject_attainment`:
- National row: all of `ethnicity`, `gender`, `equity_index_group`, `region` are NULL
- Ethnicity row: only `ethnicity` is non-null, all others NULL
- Gender row: only `gender` is non-null, all others NULL
- Region row: only `region` is non-null, all others NULL
- Equity row: only `equity_index_group` is non-null, all others NULL

**NO row has two non-null dimension columns.** Visualisations must not require cross-tabulation.

### What `achieved_rate` Actually Means
`achieved_rate` = proportion of students who received the "Achieved" NCEA grade band ONLY.
It does NOT include Merit or Excellence. Total pass rate = `achieved_rate + merit_rate + excellence_rate`.
The "Achieved" band alone can be higher for some groups even if their overall pass rate is lower (if fewer get Merit/Excellence). Do not interpret `achieved_rate` as the overall pass rate.

### Available API Endpoints
```
GET /api/nzqa/subjects?level=1&year=2024&region=null&ethnicity=null&gender=null&equityGroup=null
  → Passing ?param=null means IS NULL (only national rows)
  → Omitting a param means no filter on that column (returns all variants)

GET /api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=1
  → groupBy: national | ethnicity | equity_index_group | region | gender
  → Returns: { data: [{ year, level, group_label, value, assessed_count }] }
  → This is the correct endpoint for year × group visualisations
```

### RegionalMap Drilldown
Clicking a region shows NCEA Level 1/2/3 breakdown for that region (not ethnicity — no cross-tab data).
URL: `/api/nzqa/subjects?year=2024&region=Auckland&ethnicity=null&gender=null&equityGroup=null`

### ComparisonDashboard Heatmap
Uses `/api/nzqa/timeline` — X axis = year (2015–2024), Y axis = group labels from selected groupBy.
Do NOT use the subjects API for cross-tabulation (no data exists).

## Important Data Notes

### NCEA Context
- **NCEA started in 2002** (Level 1), Level 2 in 2003, Level 3 in 2004
- Pre-NCEA qualifications (School Certificate, Sixth Form Certificate, University Bursary) are NOT in these datasets
- **Year 9 (Form 3) students do NOT sit NCEA** — NCEA starts at Year 11
- So the meaningful exam data covers Years 11–13 (NCEA Levels 1–3, UE, Scholarship)

### Decile → Equity Index Transition
- **Pre-2023:** Schools grouped by "Decile Band" (1–3 low, 4–7 mid, 8–10 high)
- **2023 onwards:** Replaced by "School Equity Index Group" (different methodology)
- The seed script must handle both systems and map them where possible
- This transition is a key data story — discuss it in the narrative

### Ethnicity Categories
The NZQA data uses these ethnicity groupings:
- NZ European / Pākehā
- Māori
- Pacific Peoples
- Asian
- MELAA (Middle Eastern, Latin American, African) — only disaggregated from 2022
- Other

### Regions
The NZQA region data covers NZ regional council areas. A TopoJSON file for NZ regional boundaries is needed for the map visualisation — store in `public/geo/`.

## Database Schema

Use SQLite via `better-sqlite3` at `src/data/nzqa.db`.

Proposed tables:
```sql
-- Subject-level achievement (filter for Maths/Stats)
CREATE TABLE subject_attainment (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  level INTEGER, -- NCEA level 1/2/3
  subject TEXT NOT NULL,
  metric TEXT NOT NULL, -- e.g. 'participation_rate', 'achievement_rate'
  value REAL,
  count INTEGER,
  total INTEGER,
  gender TEXT, -- NULL for national aggregates
  ethnicity TEXT,
  equity_index_group TEXT, -- or decile_band for pre-2023
  region TEXT
);

-- Qualification attainment (NCEA L1/L2/L3, UE)
CREATE TABLE qualification_attainment (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  qualification TEXT NOT NULL,
  basis TEXT NOT NULL, -- 'participation' or 'enrolment'
  metric TEXT NOT NULL,
  value REAL,
  count INTEGER,
  total INTEGER,
  gender TEXT,
  ethnicity TEXT,
  equity_index_group TEXT,
  region TEXT
);

-- Level 1 Literacy and Numeracy
CREATE TABLE literacy_numeracy (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  area TEXT NOT NULL, -- 'literacy' or 'numeracy'
  metric TEXT NOT NULL,
  value REAL,
  count INTEGER,
  total INTEGER,
  gender TEXT,
  ethnicity TEXT,
  equity_index_group TEXT,
  region TEXT
);

-- Scholarship results
CREATE TABLE scholarship (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  subject TEXT,
  metric TEXT NOT NULL,
  value REAL,
  count INTEGER,
  total INTEGER,
  gender TEXT,
  ethnicity TEXT,
  equity_index_group TEXT,
  region TEXT
);

-- Qualification endorsements (Merit/Excellence)
CREATE TABLE qualification_endorsement (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  level INTEGER,
  endorsement TEXT NOT NULL, -- 'merit' or 'excellence'
  metric TEXT NOT NULL,
  value REAL,
  count INTEGER,
  total INTEGER,
  gender TEXT,
  ethnicity TEXT,
  equity_index_group TEXT,
  region TEXT
);
```

## API Routes

Create under `src/app/api/nzqa/`:

```
GET /api/nzqa/subjects?year=2024&level=1&ethnicity=Māori&region=Auckland
GET /api/nzqa/qualifications?yearFrom=2015&yearTo=2024&basis=participation
GET /api/nzqa/literacy-numeracy?year=2024&gender=Female
GET /api/nzqa/scholarship?year=2024&subject=Mathematics
GET /api/nzqa/endorsements?level=3&endorsement=excellence
GET /api/nzqa/timeline?metric=achievement_rate&groupBy=ethnicity
```

All routes return JSON. Support filtering by all dimension columns.

## Planned Visualisations

1. **TimelineExplorer** (D3) — `src/components/charts/TimelineExplorer.tsx`
2. **EquityGapVisualizer** (D3) — `src/components/charts/EquityGapVisualizer.tsx`
3. **RegionalMap** (D3 + TopoJSON) — `src/components/charts/RegionalMap.tsx`
4. **AchievementLandscape** (Three.js/R3F) — `src/components/three/AchievementLandscape.tsx`
5. **ComparisonDashboard** (D3) — `src/components/charts/ComparisonDashboard.tsx`

## Implementation Order

1. **Phase 1: Data Pipeline** — Download CSVs, create DB, seed script, API routes
2. **Phase 2: Visualisations** — Build the 5 viz components, wire to API
3. **Phase 3: Narrative & Polish** — Guided text sections, transitions, responsive polish

## Brand Quick Reference

- **Mazmatics Gradient:** `linear-gradient(to left, #BA90FF, #47A5F1)` — for nav/headings only, NOT data
- **Primary Purple:** `#8C5FD5`
- **Light Purple:** `#BA90FF`
- **Sky Blue:** `#47A5F1`
- **Yellow:** `#FFF73E`
- **Dark text:** `#3A3A39`
- **Logo font:** Bungee Shade (optional for wordmark)
- **Body font:** Geist Sans (already in project)
- **Mono font:** Geist Mono (for data labels)
- **Dark mode:** `slate-950` background, `slate-100` text
- **NZ English:** colour, maths, recognise
- **i18n ready:** externalisable strings, te reo Māori macrons
- See `brand.md` for full details
