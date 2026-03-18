# Task: Phase 16 — Migrate from SQLite to Supabase (Postgres)

## Context

This project currently uses two local SQLite databases (`src/data/nzqa.db`, `src/data/primary.db`) accessed via `better-sqlite3`. This works locally but fails on Vercel serverless because the native binary cannot be bundled reliably.

We are migrating to **Supabase Postgres** — same data, same SQL queries, different driver. The approach minimises rewrite risk:
- Replace `better-sqlite3` with the `postgres` npm package (raw SQL, serverless-safe)
- Supabase provides a Postgres connection string — we use it directly
- SQL queries stay the same; only positional param syntax changes (`?` → `$1`, `$2`…)
- Supabase Auth and user tables will be added in a later phase

## Prerequisites — COMPLETE ✅

Supabase project created and linked via Vercel Marketplace. `.env.local` populated via `vercel env pull`. The following env vars are confirmed present:

- `MZMS__POSTGRES_URL` — pooled connection string (use this in the app)
- `MZMS__POSTGRES_URL_NON_POOLING` — direct connection (use this in the seed script)
- `MZMS__SUPABASE_URL` — Supabase project URL
- `MZMS__SUPABASE_SERVICE_ROLE_KEY` — server-side admin key
- `NEXT_PUBLIC_MZMS__SUPABASE_URL` — public Supabase URL
- `NEXT_PUBLIC_MZMS__SUPABASE_PUBLISHABLE_KEY` — public anon key

---

## Steps

### Step 1 — Read all existing DB and API route files first

Read these files before touching anything:
- `src/lib/db/index.ts`
- `src/lib/db/primary.ts`
- All files in `src/app/api/nzqa/` (use Glob to find them)
- All files in `src/app/api/primary/` (use Glob to find them)
- All files in `src/__tests__/api/` (use Glob to find them)
- `next.config.ts`
- `package.json`

Do NOT edit any file until you have read it.

---

### Step 2 — Install packages

```bash
npm install postgres
npm uninstall better-sqlite3 @types/better-sqlite3
```

---

### Step 3 — Create Supabase/Postgres client

Replace `src/lib/db/index.ts` entirely. New content:

```ts
import postgres from 'postgres';

// Connection is pooled automatically by the postgres package.
// In Vercel serverless, each function invocation gets a connection from the pool.
// MZMS__POSTGRES_URL must be the Supabase Session pooler connection string.
let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!sql) {
    if (!process.env.MZMS__POSTGRES_URL) {
      throw new Error('MZMS__POSTGRES_URL environment variable is not set');
    }
    sql = postgres(process.env.MZMS__POSTGRES_URL, {
      max: 5,           // max connections in pool
      idle_timeout: 20, // close idle connections after 20s
      connect_timeout: 10,
    });
  }
  return sql;
}
```

Keep all the TypeScript row types (`SubjectRow`, `QualRow`, `LitNumRow`, `ScholarshipRow`, `EndorsementRow`) in this file — they are still valid for Postgres result rows. Just remove the `Database` import from better-sqlite3.

---

### Step 4 — Update `src/lib/db/primary.ts`

Replace the better-sqlite3 import and `getDb()` with the same `postgres` client. Import `getDb` from `./index` (they share the same Postgres database — all tables will live in Supabase):

```ts
import { getDb } from './index';
export { getDb };
```

If `primary.ts` defines its own TypeScript row types (`TimssRow`, `NmssaRow`, etc.), keep those. Remove any better-sqlite3 imports.

---

### Step 5 — Write the Postgres schema SQL file

Create `src/data/schema.sql`. This is the schema to run in Supabase's SQL editor to create all tables.

Translate the existing SQLite tables to Postgres. Key differences:
- `INTEGER PRIMARY KEY` → `SERIAL PRIMARY KEY` (or `BIGSERIAL`)
- `REAL` → `FLOAT8` (double precision)
- `TEXT` → `TEXT` (same)
- `INTEGER` → `INTEGER` or `BIGINT`
- No `AUTOINCREMENT` keyword in Postgres (use `SERIAL`)

Tables to include (inspect the existing DB files to get exact column names):
```bash
npx tsx -e "
import Database from 'better-sqlite3';
const nzqa = new Database('src/data/nzqa.db', { readonly: true });
const primary = new Database('src/data/primary.db', { readonly: true });
const tables = [
  ...nzqa.prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all(),
  ...primary.prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all(),
];
tables.forEach(t => {
  console.log('\\n-- Table:', t.name);
  console.log(nzqa.prepare('PRAGMA table_info(' + t.name + ')').all() || primary.prepare('PRAGMA table_info(' + t.name + ')').all());
});
" 2>/dev/null || echo "Run after better-sqlite3 is uninstalled — use SQLite CLI instead"
```

If better-sqlite3 is already uninstalled, get schema from SQLite CLI:
```bash
sqlite3 src/data/nzqa.db ".schema"
sqlite3 src/data/primary.db ".schema"
```

Write the `schema.sql` file based on output. Include `DROP TABLE IF EXISTS` guards and `CREATE INDEX` for commonly queried columns (subject, year, ethnicity, region).

---

### Step 6 — Write the seed script

Create `src/scripts/seed-supabase.ts`. This script:
1. Reads all rows from the local SQLite databases
2. Bulk-inserts them into Supabase Postgres via the `postgres` client
3. Handles the data type conversions (SQLite numbers → Postgres numbers, nulls stay null)

```ts
import Database from 'better-sqlite3'; // still on disk during transition — devDependency only
import postgres from 'postgres';

// Use NON-POOLING URL for seed script — direct connection handles bulk inserts better
const sql = postgres(process.env.MZMS__POSTGRES_URL_NON_POOLING!, { max: 1 });

async function seed() {
  const sql = getDb();
  const nzqa = new Database('src/data/nzqa.db', { readonly: true });
  const primary = new Database('src/data/primary.db', { readonly: true });

  // For each table: truncate then insert all rows
  // Use sql`INSERT INTO table ${sql(rows)}` for bulk insert
  // ...

  console.log('Seed complete');
  await sql.end();
}

seed().catch(console.error);
```

**Important:** The seed script keeps `better-sqlite3` as a devDependency (only needed to run the one-time seed). After seeding, `better-sqlite3` can be fully removed. Note this clearly in the file header comment.

Add to `package.json` scripts:
```json
"seed:supabase": "npx tsx src/scripts/seed-supabase.ts"
```

---

### Step 7 — Update all NZQA API routes

For each file in `src/app/api/nzqa/*/route.ts`, update to use the `postgres` client.

Key syntax changes from better-sqlite3 to `postgres` npm package:

**Before (better-sqlite3):**
```ts
const db = getDb();
const rows = db.prepare(`SELECT * FROM subject_attainment WHERE subject = ? AND year = ?`).all(subject, year);
```

**After (postgres npm package):**
```ts
const sql = getDb();
const rows = await sql`SELECT * FROM subject_attainment WHERE subject = ${subject} AND year = ${year}`;
```

The `postgres` package uses tagged template literals — NO `?` placeholders, NO `.prepare()`, NO `.all()`. Parameters are interpolated directly into the template string and are safely parameterised automatically.

For dynamic WHERE clauses (where conditions are optional based on query params), use `sql.unsafe()` carefully OR build condition arrays. Prefer the fragment approach:

```ts
const conditions = [];
if (subject) conditions.push(sql`subject = ${subject}`);
if (year) conditions.push(sql`year = ${year}`);
const whereClause = conditions.length > 0
  ? sql`WHERE ${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
  : sql``;
const rows = await sql`SELECT * FROM subject_attainment ${whereClause} ORDER BY year ASC`;
```

All route handlers must be made `async` (they may already be, but check). The `postgres` package returns arrays of row objects with the same shape as before.

---

### Step 8 — Update all primary API routes

Same pattern as Step 7 for:
- `src/app/api/primary/timss/route.ts`
- `src/app/api/primary/nmssa/route.ts`
- `src/app/api/primary/curriculum-insights/route.ts`

---

### Step 9 — Update `next.config.ts`

Remove the `better-sqlite3` specific config:
- Remove `serverExternalPackages: ["better-sqlite3"]`
- Remove `outputFileTracingIncludes`

The `postgres` npm package is pure JS — no native binaries, no special bundling needed.

Updated config:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "d3"],
};

export default nextConfig;
```

---

### Step 10 — Update unit tests

The unit tests in `src/__tests__/api/` currently mock `better-sqlite3`. Update them to mock the `postgres` package instead.

**Before:**
```ts
jest.mock('better-sqlite3', () => { ... })
```

**After:** Mock `src/lib/db/index.ts` directly:
```ts
jest.mock('@/lib/db/index', () => ({
  getDb: jest.fn(() => {
    // Return a mock sql tagged template function
    const mockSql = jest.fn().mockImplementation((...args) => Promise.resolve(mockRows));
    return mockSql;
  }),
}));
```

Read each test file carefully before modifying. Keep all existing test assertions — only the mock setup changes.

---

### Step 11 — Create `.env.local.example`

Create `.env.local.example` documenting the required env vars (no real values):

```
# Supabase Postgres — pooled connection (use in app routes)
MZMS__POSTGRES_URL=postgres://...

# Supabase Postgres — direct connection (use in seed script only)
MZMS__POSTGRES_URL_NON_POOLING=postgres://...

# Supabase project
MZMS__SUPABASE_URL=https://xxxx.supabase.co
MZMS__SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_MZMS__SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_MZMS__SUPABASE_PUBLISHABLE_KEY=...
```

Confirm `.env.local` is in `.gitignore` (it should already be from Next.js default).

---

### Step 12 — TypeScript + lint check

```bash
npx tsc --noEmit
npm run lint
```

Fix all errors. Both must be clean before continuing.

---

### Step 13 — Build check

```bash
npm run build
```

The build must succeed. If `MZMS__POSTGRES_URL` is not set locally, `getDb()` will throw at runtime but should NOT throw at build time (Next.js doesn't call route handlers during build). If build fails due to missing env var, ensure `getDb()` only throws when called, not on import.

---

### Step 14 — Run unit tests

```bash
npm test
```

All 175 unit tests must pass. The tests mock the DB so they don't need a live connection.

Fix any failures. The most likely failures are in the mock setup changes from Step 10.

---

### Step 15 — Update docs

Update these files:

**`plan.md`:** Add Phase 16 section at top, mark complete (or in-progress if MZMS__POSTGRES_URL not set). Update Future Work to reference Phase 17 (Supabase Auth + user tables).

**`progress.md`:** Add Phase 16 checklist.

**`summary.md`:** Add Phase 16 summary section.

---

## Migration checklist (what "done" means)

**Code changes (automatable — loop can complete these):**
- [ ] `postgres` package installed, `better-sqlite3` removed from main deps
- [ ] `src/lib/db/index.ts` rewritten — postgres client, same TypeScript types
- [ ] `src/lib/db/primary.ts` updated
- [ ] `src/data/schema.sql` written — all tables in Postgres SQL
- [ ] `src/scripts/seed-supabase.ts` written
- [ ] All 7 NZQA API routes updated to postgres tagged template syntax
- [ ] All 3 primary API routes updated
- [ ] `next.config.ts` cleaned up (no more serverExternalPackages)
- [ ] Unit tests updated and passing (175/175)
- [ ] `tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] Docs updated

**Manual steps (Maz must do these):**
- [ ] Create Supabase project
- [ ] Run `schema.sql` in Supabase SQL editor
- [ ] Set `MZMS__POSTGRES_URL` in `.env.local`
- [ ] Run `npm run seed:supabase`
- [ ] Add `MZMS__POSTGRES_URL` to Vercel environment variables
- [ ] Redeploy — verify charts load

---

## Completion Promise

<promise>SUPABASE_MIGRATION_COMPLETE</promise>

---

# [ARCHIVED] Phase 15: About Page ✅ COMPLETE (2026-03-18)

Phase 15 built the `/about` page with full Mazmatics brand treatment.
See `progress.md` for full checklist. 204/204 e2e + 175/175 unit tests passing.

# [ARCHIVED] Phase 14: Data Sources Page ✅ COMPLETE (2026-03-18)

Phase 14 built the `/data-sources` page. See `progress.md` for full checklist.
