/**
 * Seed script for primary.db
 * Run with: npx tsx scripts/seed-primary.ts
 *
 * Creates src/data/primary.db with 4 tables:
 *   - timss_nz_yr5     — TIMSS NZ Year 5 (Grade 4) maths 1995–2023
 *   - timss_intl_2023  — TIMSS 2023 international comparison
 *   - nmssa_maths      — NMSSA mean scale scores (2022)
 *   - curriculum_insights_maths — % meeting provisional benchmarks (2023–2024)
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../src/data/primary.db');

const db = new Database(dbPath);

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

db.exec(`
  DROP TABLE IF EXISTS timss_nz_yr5;
  DROP TABLE IF EXISTS timss_intl_2023;
  DROP TABLE IF EXISTS nmssa_maths;
  DROP TABLE IF EXISTS curriculum_insights_maths;

  CREATE TABLE timss_nz_yr5 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    group_type TEXT NOT NULL,   -- 'national' | 'gender'
    group_value TEXT,           -- NULL for national, 'Girls' | 'Boys' for gender
    mean_score REAL NOT NULL,
    se REAL,
    intl_avg REAL               -- international average that cycle (national rows only)
  );

  CREATE TABLE timss_intl_2023 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT NOT NULL,
    mean_score REAL NOT NULL,
    se REAL,
    is_nz INTEGER DEFAULT 0    -- 1 for NZ row
  );

  CREATE TABLE nmssa_maths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    year_level INTEGER NOT NULL,  -- 4 or 8
    group_type TEXT NOT NULL,     -- 'national' | 'gender' | 'ethnicity' | 'decile'
    group_value TEXT,             -- NULL for national; 'Girls', 'Boys', 'Māori', etc.
    mean_score REAL,
    ci_lower REAL,
    ci_upper REAL,
    sd REAL,
    n INTEGER,
    pct_at_curriculum_level REAL  -- % at Level 2+ (Y4) or Level 4+ (Y8)
  );

  CREATE TABLE curriculum_insights_maths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    year_level INTEGER NOT NULL,  -- 3, 6, or 8
    group_type TEXT NOT NULL,     -- 'national'
    group_value TEXT,             -- NULL for national
    pct_meeting REAL,
    pct_less_1yr REAL,
    pct_more_1yr REAL
  );
`);

// ---------------------------------------------------------------------------
// timss_nz_yr5 — NZ Year 5 (Grade 4) maths trend 1995–2023
// Source: TIMSS 2023 report, timss2023.org — extracted from Excel trend tables
// ---------------------------------------------------------------------------

const insertTimssNz = db.prepare(`
  INSERT INTO timss_nz_yr5 (year, group_type, group_value, mean_score, se, intl_avg)
  VALUES (@year, @group_type, @group_value, @mean_score, @se, @intl_avg)
`);

const timssNzRows = [
  // 1995
  { year: 1995, group_type: 'national', group_value: null, mean_score: 469, se: null, intl_avg: 529 },
  { year: 1995, group_type: 'gender',   group_value: 'Girls', mean_score: 474, se: null, intl_avg: null },
  { year: 1995, group_type: 'gender',   group_value: 'Boys',  mean_score: 465, se: null, intl_avg: null },
  // 2003
  { year: 2003, group_type: 'national', group_value: null, mean_score: 493, se: null, intl_avg: 495 },
  { year: 2003, group_type: 'gender',   group_value: 'Girls', mean_score: 493, se: null, intl_avg: null },
  { year: 2003, group_type: 'gender',   group_value: 'Boys',  mean_score: 494, se: null, intl_avg: null },
  // 2007
  { year: 2007, group_type: 'national', group_value: null, mean_score: 492, se: null, intl_avg: 473 },
  { year: 2007, group_type: 'gender',   group_value: 'Girls', mean_score: 492, se: null, intl_avg: null },
  { year: 2007, group_type: 'gender',   group_value: 'Boys',  mean_score: 493, se: null, intl_avg: null },
  // 2011
  { year: 2011, group_type: 'national', group_value: null, mean_score: 486, se: null, intl_avg: 491 },
  { year: 2011, group_type: 'gender',   group_value: 'Girls', mean_score: 486, se: null, intl_avg: null },
  { year: 2011, group_type: 'gender',   group_value: 'Boys',  mean_score: 486, se: null, intl_avg: null },
  // 2015
  { year: 2015, group_type: 'national', group_value: null, mean_score: 491, se: null, intl_avg: 493 },
  { year: 2015, group_type: 'gender',   group_value: 'Girls', mean_score: 489, se: null, intl_avg: null },
  { year: 2015, group_type: 'gender',   group_value: 'Boys',  mean_score: 492, se: null, intl_avg: null },
  // 2019
  { year: 2019, group_type: 'national', group_value: null, mean_score: 487, se: null, intl_avg: 502 },
  { year: 2019, group_type: 'gender',   group_value: 'Girls', mean_score: 484, se: null, intl_avg: null },
  { year: 2019, group_type: 'gender',   group_value: 'Boys',  mean_score: 490, se: null, intl_avg: null },
  // 2023
  { year: 2023, group_type: 'national', group_value: null, mean_score: 490, se: null, intl_avg: 503 },
  { year: 2023, group_type: 'gender',   group_value: 'Girls', mean_score: 479, se: null, intl_avg: null },
  { year: 2023, group_type: 'gender',   group_value: 'Boys',  mean_score: 501, se: null, intl_avg: null },
];

const insertTimssNzMany = db.transaction((rows: typeof timssNzRows) => {
  for (const row of rows) insertTimssNz.run(row);
});
insertTimssNzMany(timssNzRows);
console.log(`Seeded timss_nz_yr5: ${timssNzRows.length} rows`);

// ---------------------------------------------------------------------------
// timss_intl_2023 — selected countries, TIMSS 2023 Grade 4 Maths
// Source: TIMSS 2023 International Results in Mathematics, IEA/TIMSS
// Scores sourced from research-findings.md + TIMSS 2023 published report
// ---------------------------------------------------------------------------

const insertTimssIntl = db.prepare(`
  INSERT INTO timss_intl_2023 (country, mean_score, se, is_nz)
  VALUES (@country, @mean_score, @se, @is_nz)
`);

const timssIntlRows = [
  // Asia top performers
  { country: 'Singapore',       mean_score: 615, se: null, is_nz: 0 },
  { country: 'South Korea',     mean_score: 594, se: null, is_nz: 0 },
  { country: 'Chinese Taipei',  mean_score: 592, se: null, is_nz: 0 },
  { country: 'Japan',           mean_score: 578, se: null, is_nz: 0 },
  { country: 'Kazakhstan',      mean_score: 537, se: null, is_nz: 0 },
  // Europe / English-speaking
  { country: 'England',         mean_score: 552, se: null, is_nz: 0 },
  { country: 'Northern Ireland',mean_score: 546, se: null, is_nz: 0 },
  { country: 'Czech Republic',  mean_score: 531, se: null, is_nz: 0 },
  { country: 'Hungary',         mean_score: 527, se: null, is_nz: 0 },
  { country: 'Australia',       mean_score: 525, se: null, is_nz: 0 },
  { country: 'Netherlands',     mean_score: 524, se: null, is_nz: 0 },
  { country: 'USA',             mean_score: 517, se: null, is_nz: 0 },
  { country: 'Norway',          mean_score: 519, se: null, is_nz: 0 },
  { country: 'Denmark',         mean_score: 518, se: null, is_nz: 0 },
  { country: 'Finland',         mean_score: 516, se: null, is_nz: 0 },
  { country: 'Germany',         mean_score: 514, se: null, is_nz: 0 },
  { country: 'Lithuania',       mean_score: 511, se: null, is_nz: 0 },
  { country: 'Sweden',          mean_score: 507, se: null, is_nz: 0 },
  // Around NZ
  { country: 'New Zealand',     mean_score: 490, se: null, is_nz: 1 },
  { country: 'France',          mean_score: 484, se: null, is_nz: 0 },
  { country: 'Italy',           mean_score: 480, se: null, is_nz: 0 },
];

const insertTimssIntlMany = db.transaction((rows: typeof timssIntlRows) => {
  for (const row of rows) insertTimssIntl.run(row);
});
insertTimssIntlMany(timssIntlRows);
console.log(`Seeded timss_intl_2023: ${timssIntlRows.length} rows`);

// ---------------------------------------------------------------------------
// nmssa_maths — NMSSA 2022 Maths Mean Scale Scores
// Source: NMSSA 2022 Mathematics Achievement Report (Report 30)
//         Tables A2.1 (Year 4) and A2.2 (Year 8) — extracted via pdftotext
// ---------------------------------------------------------------------------

const insertNmssa = db.prepare(`
  INSERT INTO nmssa_maths
    (year, year_level, group_type, group_value, mean_score, ci_lower, ci_upper, sd, n, pct_at_curriculum_level)
  VALUES
    (@year, @year_level, @group_type, @group_value, @mean_score, @ci_lower, @ci_upper, @sd, @n, @pct_at_curriculum_level)
`);

const nmssaRows = [
  // ——— Year 4, 2022 ———
  { year: 2022, year_level: 4, group_type: 'national', group_value: null,        mean_score: 84.0, ci_lower: 83.0, ci_upper: 85.0, sd: 18.8, n: 2064, pct_at_curriculum_level: 81.8 },
  { year: 2022, year_level: 4, group_type: 'gender',   group_value: 'Girls',     mean_score: 82.4, ci_lower: 81.1, ci_upper: 83.7, sd: 18.0, n: 1060, pct_at_curriculum_level: 81.1 },
  { year: 2022, year_level: 4, group_type: 'gender',   group_value: 'Boys',      mean_score: 85.7, ci_lower: 84.3, ci_upper: 87.1, sd: 19.4, n: 1004, pct_at_curriculum_level: 82.6 },
  { year: 2022, year_level: 4, group_type: 'ethnicity',group_value: 'Māori',     mean_score: 75.3, ci_lower: 73.5, ci_upper: 77.1, sd: 16.3, n: 448,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 4, group_type: 'ethnicity',group_value: 'Pacific',   mean_score: 72.9, ci_lower: 70.6, ci_upper: 75.2, sd: 16.3, n: 269,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 4, group_type: 'ethnicity',group_value: 'Asian',     mean_score: 94.0, ci_lower: 91.8, ci_upper: 96.2, sd: 18.6, n: 413,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 4, group_type: 'ethnicity',group_value: 'NZ European',mean_score: 86.2, ci_lower: 84.9, ci_upper: 87.5, sd: 17.5, n: 955, pct_at_curriculum_level: null },
  { year: 2022, year_level: 4, group_type: 'decile',   group_value: 'Low',       mean_score: 72.8, ci_lower: 70.9, ci_upper: 74.7, sd: 16.6, n: 437,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 4, group_type: 'decile',   group_value: 'Mid',       mean_score: 84.1, ci_lower: 82.6, ci_upper: 85.6, sd: 17.9, n: 817,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 4, group_type: 'decile',   group_value: 'High',      mean_score: 89.9, ci_lower: 88.4, ci_upper: 91.4, sd: 18.1, n: 810,  pct_at_curriculum_level: null },
  // ——— Year 8, 2022 ———
  { year: 2022, year_level: 8, group_type: 'national', group_value: null,        mean_score: 115.8, ci_lower: 114.7, ci_upper: 116.9, sd: 21.3, n: 1960, pct_at_curriculum_level: 41.5 },
  { year: 2022, year_level: 8, group_type: 'gender',   group_value: 'Girls',     mean_score: 113.3, ci_lower: 111.8, ci_upper: 114.8, sd: 20.3, n: 955,  pct_at_curriculum_level: 36.7 },
  { year: 2022, year_level: 8, group_type: 'gender',   group_value: 'Boys',      mean_score: 118.1, ci_lower: 116.5, ci_upper: 119.7, sd: 21.9, n: 1005, pct_at_curriculum_level: null },
  { year: 2022, year_level: 8, group_type: 'ethnicity',group_value: 'Māori',     mean_score: 105.0, ci_lower: 103.0, ci_upper: 107.0, sd: 17.1, n: 423,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 8, group_type: 'ethnicity',group_value: 'Pacific',   mean_score: 101.2, ci_lower: 98.9,  ci_upper: 103.5, sd: 16.6, n: 283,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 8, group_type: 'ethnicity',group_value: 'Asian',     mean_score: 129.5, ci_lower: 126.6, ci_upper: 132.4, sd: 21.8, n: 308,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 8, group_type: 'ethnicity',group_value: 'NZ European',mean_score: 119.0, ci_lower: 117.6, ci_upper: 120.4, sd: 19.7, n: 1025,pct_at_curriculum_level: null },
  { year: 2022, year_level: 8, group_type: 'decile',   group_value: 'Low',       mean_score: 103.1, ci_lower: 101.0, ci_upper: 105.2, sd: 17.8, n: 409,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 8, group_type: 'decile',   group_value: 'Mid',       mean_score: 115.5, ci_lower: 113.9, ci_upper: 117.1, sd: 20.7, n: 930,  pct_at_curriculum_level: null },
  { year: 2022, year_level: 8, group_type: 'decile',   group_value: 'High',      mean_score: 124.5, ci_lower: 122.6, ci_upper: 126.4, sd: 20.0, n: 621,  pct_at_curriculum_level: null },
];

const insertNmssaMany = db.transaction((rows: typeof nmssaRows) => {
  for (const row of rows) insertNmssa.run(row);
});
insertNmssaMany(nmssaRows);
console.log(`Seeded nmssa_maths: ${nmssaRows.length} rows`);

// ---------------------------------------------------------------------------
// curriculum_insights_maths — % meeting provisional benchmarks 2023–2024
// Source: Curriculum Insights Dashboard Reports (NMSSA successor)
//         curriculuminsights.otago.ac.nz / NMSSA S3 PDFs
// ---------------------------------------------------------------------------

const insertCI = db.prepare(`
  INSERT INTO curriculum_insights_maths
    (year, year_level, group_type, group_value, pct_meeting, pct_less_1yr, pct_more_1yr)
  VALUES
    (@year, @year_level, @group_type, @group_value, @pct_meeting, @pct_less_1yr, @pct_more_1yr)
`);

const ciRows = [
  // 2023
  { year: 2023, year_level: 3, group_type: 'national', group_value: null, pct_meeting: 20, pct_less_1yr: 35, pct_more_1yr: 45 },
  { year: 2023, year_level: 6, group_type: 'national', group_value: null, pct_meeting: 28, pct_less_1yr: 16, pct_more_1yr: 56 },
  { year: 2023, year_level: 8, group_type: 'national', group_value: null, pct_meeting: 22, pct_less_1yr: 15, pct_more_1yr: 63 },
  // 2024
  { year: 2024, year_level: 3, group_type: 'national', group_value: null, pct_meeting: 22, pct_less_1yr: 35, pct_more_1yr: 43 },
  { year: 2024, year_level: 6, group_type: 'national', group_value: null, pct_meeting: 30, pct_less_1yr: 16, pct_more_1yr: 54 },
  { year: 2024, year_level: 8, group_type: 'national', group_value: null, pct_meeting: 23, pct_less_1yr: 15, pct_more_1yr: 62 },
];

const insertCIMany = db.transaction((rows: typeof ciRows) => {
  for (const row of rows) insertCI.run(row);
});
insertCIMany(ciRows);
console.log(`Seeded curriculum_insights_maths: ${ciRows.length} rows`);

db.close();
console.log(`\nDone. Database written to: ${dbPath}`);
