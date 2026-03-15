/**
 * NZQA Data Seed Script
 * Run: npx tsx src/scripts/seed-nzqa.ts
 *
 * Parses all downloaded NZQA CSV files and populates src/data/nzqa.db
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data/raw/nzqa');
const DB_PATH = path.join(process.cwd(), 'src/data/nzqa.db');

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function num(val: string): number | null {
  if (!val || val === '' || val === 'S' || val === 'C') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function int(val: string): number | null {
  if (!val || val === '' || val === 'S' || val === 'C') return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function levelNum(levelStr: string): number | null {
  const m = levelStr.match(/(\d)/);
  return m ? parseInt(m[1], 10) : null;
}

function readCSV(filename: string): Record<string, string>[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ File not found: ${filename}`);
    return [];
  }
  const text = fs.readFileSync(filePath, 'utf-8');
  return parseCSV(text);
}

// ─── Database Setup ───────────────────────────────────────────────────────────

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS subject_attainment (
      id INTEGER PRIMARY KEY,
      year INTEGER NOT NULL,
      level INTEGER,
      subject TEXT NOT NULL,
      not_achieved_rate REAL,
      achieved_rate REAL,
      merit_rate REAL,
      excellence_rate REAL,
      assessed_count INTEGER,
      not_achieved_count INTEGER,
      achieved_count INTEGER,
      merit_count INTEGER,
      excellence_count INTEGER,
      students_1plus_count INTEGER,
      students_14plus_count INTEGER,
      provider_count INTEGER,
      gender TEXT,
      ethnicity TEXT,
      equity_index_group TEXT,
      region TEXT,
      UNIQUE(year, level, subject, gender, ethnicity, equity_index_group, region)
    );

    CREATE TABLE IF NOT EXISTS qualification_attainment (
      id INTEGER PRIMARY KEY,
      year INTEGER NOT NULL,
      year_level INTEGER,
      qualification TEXT NOT NULL,
      basis TEXT NOT NULL,
      cumulative_attainment_rate REAL,
      current_attainment_rate REAL,
      cumulative_attainment INTEGER,
      current_attainment INTEGER,
      total_count INTEGER,
      gender TEXT,
      ethnicity TEXT,
      equity_index_group TEXT,
      region TEXT,
      UNIQUE(year, year_level, qualification, basis, gender, ethnicity, equity_index_group, region)
    );

    CREATE TABLE IF NOT EXISTS literacy_numeracy (
      id INTEGER PRIMARY KEY,
      year INTEGER NOT NULL,
      year_level INTEGER,
      area TEXT NOT NULL,
      cumulative_attainment_rate REAL,
      current_attainment_rate REAL,
      cumulative_attainment INTEGER,
      current_attainment INTEGER,
      total_count INTEGER,
      gender TEXT,
      ethnicity TEXT,
      equity_index_group TEXT,
      region TEXT,
      UNIQUE(year, year_level, area, gender, ethnicity, equity_index_group, region)
    );

    CREATE TABLE IF NOT EXISTS scholarship (
      id INTEGER PRIMARY KEY,
      year INTEGER NOT NULL,
      subject TEXT,
      outstanding_rate REAL,
      scholarship_rate REAL,
      no_award_rate REAL,
      outstanding_count INTEGER,
      scholarship_count INTEGER,
      no_award_count INTEGER,
      total_assessed INTEGER,
      total_students INTEGER,
      gender TEXT,
      ethnicity TEXT,
      equity_index_group TEXT,
      region TEXT,
      UNIQUE(year, subject, gender, ethnicity, equity_index_group, region)
    );

    CREATE TABLE IF NOT EXISTS qualification_endorsement (
      id INTEGER PRIMARY KEY,
      year INTEGER NOT NULL,
      year_level INTEGER,
      qualification TEXT NOT NULL,
      excellence_rate REAL,
      merit_rate REAL,
      no_endorsement_rate REAL,
      excellence_count INTEGER,
      merit_count INTEGER,
      no_endorsement_count INTEGER,
      total_attainment INTEGER,
      total_count INTEGER,
      gender TEXT,
      ethnicity TEXT,
      equity_index_group TEXT,
      region TEXT,
      UNIQUE(year, year_level, qualification, gender, ethnicity, equity_index_group, region)
    );
  `);
}

// ─── Subject Attainment ───────────────────────────────────────────────────────

const MATHS_SUBJECTS = ['mathematics - statistics', 'mathematics'];

function isMatchSubject(s: string): boolean {
  return MATHS_SUBJECTS.some(m => s.toLowerCase().includes(m));
}

function insertSubjectRows(
  db: Database.Database,
  rows: Record<string, string>[],
  extras: { gender?: string; ethnicity?: string; equity?: string; region?: string } = {}
) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO subject_attainment
    (year, level, subject, not_achieved_rate, achieved_rate, merit_rate, excellence_rate,
     assessed_count, not_achieved_count, achieved_count, merit_count, excellence_count,
     students_1plus_count, students_14plus_count, provider_count,
     gender, ethnicity, equity_index_group, region)
    VALUES
    (@year, @level, @subject, @not_achieved_rate, @achieved_rate, @merit_rate, @excellence_rate,
     @assessed_count, @not_achieved_count, @achieved_count, @merit_count, @excellence_count,
     @students_1plus_count, @students_14plus_count, @provider_count,
     @gender, @ethnicity, @equity_index_group, @region)
  `);

  let count = 0;
  for (const row of rows) {
    const subject = row['Secondary Subject'] ?? '';
    if (!isMatchSubject(subject)) continue;

    const gender = row['Gender'] ?? extras.gender ?? null;
    const ethnicity = row['Ethnicity'] ?? extras.ethnicity ?? null;
    const equity = row['School Equity Index Group'] ?? extras.equity ?? null;
    const region = row['Region'] ?? extras.region ?? null;

    stmt.run({
      year: int(row['Academic Year']),
      level: levelNum(row['Level'] ?? ''),
      subject,
      not_achieved_rate: num(row['Not Achieved Rate']),
      achieved_rate: num(row['Achieved Rate']),
      merit_rate: num(row['Merit Rate']),
      excellence_rate: num(row['Excellence Rate']),
      assessed_count: int(row['Assessed Count']),
      not_achieved_count: int(row['Not Achieved Count']),
      achieved_count: int(row['Achieved Count']),
      merit_count: int(row['Merit Count']),
      excellence_count: int(row['Excellence Count']),
      students_1plus_count: int(row['Students Assessed in 1+ Credits Count']),
      students_14plus_count: int(row['Students Assessed in 14+ Credits Count']),
      provider_count: int(row['Provider Count']),
      gender,
      ethnicity,
      equity_index_group: equity,
      region,
    });
    count++;
  }
  return count;
}

function seedSubject(db: Database.Database) {
  console.log('📊 Seeding subject_attainment...');
  const STAMP = '2024-20250302';
  let total = 0;

  const national = readCSV(`Subject-Attainment-Statistics-National-${STAMP}.csv`);
  total += insertSubjectRows(db, national);

  const ethnicity = readCSV(`Subject-Attainment-Statistics-National-Ethnicity-${STAMP}.csv`);
  total += insertSubjectRows(db, ethnicity);

  const gender = readCSV(`Subject-Attainment-Statistics-National-Gender-${STAMP}.csv`);
  total += insertSubjectRows(db, gender);

  const equity = readCSV(`Subject-Attainment-Statistics-National-School-Equity-Index-Group-${STAMP}.csv`);
  total += insertSubjectRows(db, equity);

  const region = readCSV(`Subject-Attainment-Statistics-National-Region-${STAMP}.csv`);
  total += insertSubjectRows(db, region);

  console.log(`  ✓ ${total} subject rows inserted`);
}

// ─── Qualification Attainment ─────────────────────────────────────────────────

function insertQualRows(
  db: Database.Database,
  rows: Record<string, string>[],
  basis: 'participation' | 'enrolment',
  extras: { gender?: string; ethnicity?: string; equity?: string; region?: string } = {}
) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO qualification_attainment
    (year, year_level, qualification, basis,
     cumulative_attainment_rate, current_attainment_rate,
     cumulative_attainment, current_attainment, total_count,
     gender, ethnicity, equity_index_group, region)
    VALUES
    (@year, @year_level, @qualification, @basis,
     @cumulative_attainment_rate, @current_attainment_rate,
     @cumulative_attainment, @current_attainment, @total_count,
     @gender, @ethnicity, @equity_index_group, @region)
  `);

  let count = 0;
  for (const row of rows) {
    const gender = row['Gender'] ?? extras.gender ?? null;
    const ethnicity = row['Ethnicity'] ?? extras.ethnicity ?? null;
    const equity = row['School Equity Index Group'] ?? row['School Decile Band'] ?? extras.equity ?? null;
    const region = row['Region'] ?? extras.region ?? null;

    stmt.run({
      year: int(row['Academic Year']),
      year_level: int(row['Year Level']),
      qualification: row['Qualification'] ?? '',
      basis,
      cumulative_attainment_rate: num(row['Cumulative Year Attainment Rate']),
      current_attainment_rate: num(row['Current Year Attainment Rate']),
      cumulative_attainment: int(row['Cumulative Year Attainment']),
      current_attainment: int(row['Current Year Attainment']),
      total_count: int(row['Total Participant Count']) ?? int(row['Total Student Count']),
      gender,
      ethnicity,
      equity_index_group: equity,
      region,
    });
    count++;
  }
  return count;
}

function seedQualification(db: Database.Database) {
  console.log('📊 Seeding qualification_attainment...');
  const STAMP = '2024-20250302';
  let total = 0;

  // 2024 Participation files
  for (const V of ['', '-Gender', '-Ethnicity', '-School-Equity-Index-Group', '-Region']) {
    const rows = readCSV(`Participation-Qualification-Attainment-Statistics-National${V}-${STAMP}.csv`);
    total += insertQualRows(db, rows, 'participation');
  }

  // 2024 Enrolment files
  for (const V of ['', '-Gender', '-Ethnicity', '-School-Equity-Index-Group', '-Region']) {
    const rows = readCSV(`Enrolment-Qualification-Attainment-Statistics-National${V}-${STAMP}.csv`);
    total += insertQualRows(db, rows, 'enrolment');
  }

  // 2018 Qualification files (extends back to 2009, dedup via UNIQUE constraint)
  for (const V of ['National', 'Gender', 'Ethnicity', 'School-Decile-Band']) {
    const rows = readCSV(`NCEA-Qual-Attainment-2018-${V}.csv`);
    total += insertQualRows(db, rows, 'participation');
  }

  console.log(`  ✓ ${total} qualification rows inserted`);
}

// ─── Literacy & Numeracy ──────────────────────────────────────────────────────

function insertLitNumRows(
  db: Database.Database,
  rows: Record<string, string>[],
  extras: { gender?: string; ethnicity?: string; equity?: string; region?: string } = {}
) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO literacy_numeracy
    (year, year_level, area,
     cumulative_attainment_rate, current_attainment_rate,
     cumulative_attainment, current_attainment, total_count,
     gender, ethnicity, equity_index_group, region)
    VALUES
    (@year, @year_level, @area,
     @cumulative_attainment_rate, @current_attainment_rate,
     @cumulative_attainment, @current_attainment, @total_count,
     @gender, @ethnicity, @equity_index_group, @region)
  `);

  let count = 0;
  for (const row of rows) {
    const qualification = row['Qualification'] ?? '';
    // Map qualification to area: Literacy or Numeracy
    const area = qualification.toLowerCase().includes('numera') ? 'numeracy' : 'literacy';

    stmt.run({
      year: int(row['Academic Year']),
      year_level: int(row['Year Level']),
      area,
      cumulative_attainment_rate: num(row['Cumulative Year Attainment Rate']),
      current_attainment_rate: num(row['Current Year Attainment Rate']),
      cumulative_attainment: int(row['Cumulative Year Attainment']),
      current_attainment: int(row['Current Year Attainment']),
      total_count: int(row['Total Student Count']),
      gender: row['Gender'] ?? extras.gender ?? null,
      ethnicity: row['Ethnicity'] ?? extras.ethnicity ?? null,
      equity_index_group: row['School Equity Index Group'] ?? row['School Decile Band'] ?? extras.equity ?? null,
      region: row['Region'] ?? extras.region ?? null,
    });
    count++;
  }
  return count;
}

function seedLitNum(db: Database.Database) {
  console.log('📊 Seeding literacy_numeracy...');
  const STAMP = '2024-20250302';
  let total = 0;

  for (const V of ['', '-Gender', '-Ethnicity', '-School-Equity-Index-Group', '-Region']) {
    const rows = readCSV(`Level-1-Literacy-and-Numeracy-Attainment-Statistics-National${V}-${STAMP}.csv`);
    total += insertLitNumRows(db, rows);
  }

  // 2018 lit/num files (extends back to 2009)
  for (const V of ['National', 'Gender', 'Ethnicity', 'School-Decile-Band']) {
    const rows = readCSV(`LitNum-2018-${V}.csv`);
    total += insertLitNumRows(db, rows);
  }

  console.log(`  ✓ ${total} lit/num rows inserted`);
}

// ─── Scholarship ──────────────────────────────────────────────────────────────

function insertScholarshipRows(
  db: Database.Database,
  rows: Record<string, string>[],
  extras: { gender?: string; ethnicity?: string; equity?: string; region?: string } = {}
) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO scholarship
    (year, subject,
     outstanding_rate, scholarship_rate, no_award_rate,
     outstanding_count, scholarship_count, no_award_count,
     total_assessed, total_students,
     gender, ethnicity, equity_index_group, region)
    VALUES
    (@year, @subject,
     @outstanding_rate, @scholarship_rate, @no_award_rate,
     @outstanding_count, @scholarship_count, @no_award_count,
     @total_assessed, @total_students,
     @gender, @ethnicity, @equity_index_group, @region)
  `);

  let count = 0;
  for (const row of rows) {
    stmt.run({
      year: int(row['Academic Year']),
      subject: row['Subject'] ?? null,
      outstanding_rate: num(row['Outstanding Scholarship Rate']),
      scholarship_rate: num(row['Scholarship Rate']),
      no_award_rate: num(row['No Award Rate']),
      outstanding_count: int(row['Outstanding Scholarship Count']),
      scholarship_count: int(row['Scholarship Count']),
      no_award_count: int(row['No Award Count']),
      total_assessed: int(row['Total Assessed Result Count']),
      total_students: int(row['Total Student Count']),
      gender: row['Gender'] ?? extras.gender ?? null,
      ethnicity: row['Ethnicity'] ?? extras.ethnicity ?? null,
      equity_index_group: row['School Equity Index Group'] ?? extras.equity ?? null,
      region: row['Region'] ?? extras.region ?? null,
    });
    count++;
  }
  return count;
}

function seedScholarship(db: Database.Database) {
  console.log('📊 Seeding scholarship...');
  const STAMP = '2024-20250302';
  let total = 0;

  for (const V of ['', '-Gender', '-Ethnicity', '-School-Equity-Index-Group', '-Region']) {
    const rows = readCSV(`Scholarship-Attainment-Statistics-National${V}-${STAMP}.csv`);
    total += insertScholarshipRows(db, rows);
  }

  console.log(`  ✓ ${total} scholarship rows inserted`);
}

// ─── Qualification Endorsement ────────────────────────────────────────────────

function insertEndorsementRows(
  db: Database.Database,
  rows: Record<string, string>[],
  extras: { gender?: string; ethnicity?: string; equity?: string; region?: string } = {}
) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO qualification_endorsement
    (year, year_level, qualification,
     excellence_rate, merit_rate, no_endorsement_rate,
     excellence_count, merit_count, no_endorsement_count,
     total_attainment, total_count,
     gender, ethnicity, equity_index_group, region)
    VALUES
    (@year, @year_level, @qualification,
     @excellence_rate, @merit_rate, @no_endorsement_rate,
     @excellence_count, @merit_count, @no_endorsement_count,
     @total_attainment, @total_count,
     @gender, @ethnicity, @equity_index_group, @region)
  `);

  let count = 0;
  for (const row of rows) {
    stmt.run({
      year: int(row['Academic Year']),
      year_level: int(row['Year Level']),
      qualification: row['Qualification'] ?? '',
      excellence_rate: num(row['Current Year Attainment Rate - Excellence Endorsement']),
      merit_rate: num(row['Current Year Attainment Rate - Merit Endorsement']),
      no_endorsement_rate: num(row['Current Year Attainment Rate - No Endorsement']),
      excellence_count: int(row['Current Year Attainment - Excellence Endorsement']),
      merit_count: int(row['Current Year Attainment - Merit Endorsement']),
      no_endorsement_count: int(row['Current Year Attainment - No Endorsement']),
      total_attainment: int(row['Current Year Attainment']),
      total_count: int(row['Total Student Count']),
      gender: row['Gender'] ?? extras.gender ?? null,
      ethnicity: row['Ethnicity'] ?? extras.ethnicity ?? null,
      equity_index_group: row['School Equity Index Group'] ?? extras.equity ?? null,
      region: row['Region'] ?? extras.region ?? null,
    });
    count++;
  }
  return count;
}

function seedEndorsement(db: Database.Database) {
  console.log('📊 Seeding qualification_endorsement...');
  const STAMP = '2024-20250302';
  let total = 0;

  for (const V of ['', '-Gender', '-Ethnicity', '-School-Equity-Index-Group', '-Region']) {
    const rows = readCSV(`Qualification-Endorsement-Attainment-Statistics-National${V}-${STAMP}.csv`);
    total += insertEndorsementRows(db, rows);
  }

  console.log(`  ✓ ${total} endorsement rows inserted`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('🚀 Seeding NZQA database...\n');

  // Remove existing DB for a clean seed
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('  Removed existing database\n');
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  createSchema(db);
  console.log('✓ Schema created\n');

  seedSubject(db);
  seedQualification(db);
  seedLitNum(db);
  seedScholarship(db);
  seedEndorsement(db);

  // Print summary
  console.log('\n📋 Database summary:');
  const tables = ['subject_attainment', 'qualification_attainment', 'literacy_numeracy', 'scholarship', 'qualification_endorsement'];
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
    console.log(`  ${table}: ${row.count} rows`);
  }

  // Print year range for maths subjects
  const mathsYears = db.prepare(
    `SELECT MIN(year) as min_year, MAX(year) as max_year, COUNT(DISTINCT year) as years
     FROM subject_attainment WHERE subject LIKE '%Mathematics%'`
  ).get() as { min_year: number; max_year: number; years: number };
  console.log(`\n  Maths data: ${mathsYears.min_year}–${mathsYears.max_year} (${mathsYears.years} years)`);

  db.close();
  console.log('\n✅ Done!');
}

main();
