/**
 * seed-supabase.ts
 *
 * One-time script to migrate data from local SQLite databases into Supabase Postgres.
 *
 * Prerequisites:
 *   1. Run schema.sql in Supabase SQL editor first
 *   2. Set MZMS__POSTGRES_URL_NON_POOLING in .env.local
 *
 * Usage:
 *   npm run seed:supabase
 *
 * Note: better-sqlite3 is a devDependency — only needed for this seed script.
 * Once seeded, this script does not need to run again unless data changes.
 */

import 'dotenv/config';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import path from 'path';

const connectionString = process.env.MZMS__POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error('Error: MZMS__POSTGRES_URL_NON_POOLING not set in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

const nzqaPath = path.join(process.cwd(), 'src/data/nzqa.db');
const primaryPath = path.join(process.cwd(), 'src/data/primary.db');

const nzqa = new Database(nzqaPath, { readonly: true });
const primary = new Database(primaryPath, { readonly: true });

async function seedTable(
  tableName: string,
  rows: Record<string, unknown>[]
) {
  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 rows — skipping`);
    return;
  }
  // Truncate first to allow re-running safely
  await sql.unsafe(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
  // Bulk insert in batches of 500
  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await sql`INSERT INTO ${sql(tableName)} ${sql(batch)}`;
    inserted += batch.length;
  }
  console.log(`  ${tableName}: ${inserted} rows inserted`);
}

async function main() {
  console.log('Starting Supabase seed...\n');

  // ─── NZQA tables ─────────────────────────────────────────────────────────────
  console.log('NZQA tables:');

  const subjectRows = nzqa.prepare('SELECT * FROM subject_attainment').all() as Record<string, unknown>[];
  await seedTable('subject_attainment', subjectRows);

  const qualRows = nzqa.prepare('SELECT * FROM qualification_attainment').all() as Record<string, unknown>[];
  await seedTable('qualification_attainment', qualRows);

  const litNumRows = nzqa.prepare('SELECT * FROM literacy_numeracy').all() as Record<string, unknown>[];
  await seedTable('literacy_numeracy', litNumRows);

  const scholarshipRows = nzqa.prepare('SELECT * FROM scholarship').all() as Record<string, unknown>[];
  await seedTable('scholarship', scholarshipRows);

  const endorsementRows = nzqa.prepare('SELECT * FROM qualification_endorsement').all() as Record<string, unknown>[];
  await seedTable('qualification_endorsement', endorsementRows);

  // ─── Primary school tables ────────────────────────────────────────────────────
  console.log('\nPrimary school tables:');

  const timssNzRows = primary.prepare('SELECT * FROM timss_nz_yr5').all() as Record<string, unknown>[];
  await seedTable('timss_nz_yr5', timssNzRows);

  const timssIntlRows = primary.prepare('SELECT * FROM timss_intl_2023').all() as Record<string, unknown>[];
  await seedTable('timss_intl_2023', timssIntlRows);

  const nmssaRows = primary.prepare('SELECT * FROM nmssa_maths').all() as Record<string, unknown>[];
  await seedTable('nmssa_maths', nmssaRows);

  const curriculumRows = primary.prepare('SELECT * FROM curriculum_insights_maths').all() as Record<string, unknown>[];
  await seedTable('curriculum_insights_maths', curriculumRows);

  console.log('\nSeed complete.');
  await sql.end();
  nzqa.close();
  primary.close();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
