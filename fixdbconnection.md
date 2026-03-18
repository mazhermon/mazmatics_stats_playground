I've found everything. There are actually two separate issues — one causing the runtime 500 errors, and one causing your production deployments to fail at build time.

Issue 1: Runtime 500 errors (the charts not loading)
Error: SqliteError: unable to open database file (SQLITE_CANTOPEN)
Root cause: Your getDb() function in src/lib/db/index.ts opens the SQLite file using:
tsconst dbPath = path.join(process.cwd(), 'src/data/nzqa.db');
db = new Database(dbPath, { readonly: true });
The .db file is committed to the repo, but Vercel serverless functions don't have access to the project source directory at runtime. When Next.js builds, it bundles the API routes into .next/server/..., and process.cwd() at runtime points to /var/task (the serverless function root), not the repo root. The src/data/nzqa.db file is simply not available there.
Fix: You need to move nzqa.db into the public folder — but that won't work for server-side SQLite either. The correct fix for Vercel is to copy the database file into the serverless function bundle. You can do this by adding this to your next.config.ts:
tsconst nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "d3"],
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    '/api/**': ['./src/data/*.db'],
  },
};
```

This tells Vercel's file tracing to include the `.db` file in the serverless function bundle. Then in your `getDb()` function, you may also need to adjust the path since traced files land in a different location — using `path.join(process.cwd(), 'src/data/nzqa.db')` should still work with the tracing include above.

---

## Issue 2: Production build failures

**Error:** `npm error Conflicting peer dependency: react@18.3.1` — `@testing-library/react@14.1.2` requires `react@"^18.0.0"` (which 18.3.1 satisfies, but npm is being strict about it).

**Fix:** Add `--legacy-peer-deps` to your npm install command. The easiest way is to create a `.npmrc` file at the root of your project with:
```
legacy-peer-deps=true
This is why only the preview deployment from master is working (it likely has a package-lock.json that resolves differently), while the production deployments from main keep failing.

Summary of what to do:

Add outputFileTracingIncludes to next.config.ts to bundle the SQLite .db file with the serverless functions.
Add a .npmrc file with legacy-peer-deps=true to fix the build failures.


## more info
Issue 1: Runtime 500 errors (the charts not loading)
Error: SqliteError: unable to open database file (SQLITE_CANTOPEN)
Root cause: Your getDb() function in src/lib/db/index.ts opens the SQLite file using:
tsconst dbPath = path.join(process.cwd(), 'src/data/nzqa.db');
db = new Database(dbPath, { readonly: true });
The .db file is committed to the repo, but Vercel serverless functions don't have access to the project source directory at runtime. When Next.js builds, it bundles the API routes into .next/server/..., and process.cwd() at runtime points to /var/task (the serverless function root), not the repo root. The src/data/nzqa.db file is simply not available there.
Fix: You need to move nzqa.db into the public folder — but that won't work for server-side SQLite either. The correct fix for Vercel is to copy the database file into the serverless function bundle. You can do this by adding this to your next.config.ts:
tsconst nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "d3"],
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    '/api/**': ['./src/data/*.db'],
  },
};
```

This tells Vercel's file tracing to include the `.db` file in the serverless function bundle. Then in your `getDb()` function, you may also need to adjust the path since traced files land in a different location — using `path.join(process.cwd(), 'src/data/nzqa.db')` should still work with the tracing include above.

---

## Issue 2: Production build failures

**Error:** `npm error Conflicting peer dependency: react@18.3.1` — `@testing-library/react@14.1.2` requires `react@"^18.0.0"` (which 18.3.1 satisfies, but npm is being strict about it).

**Fix:** Add `--legacy-peer-deps` to your npm install command. The easiest way is to create a `.npmrc` file at the root of your project with:
```
legacy-peer-deps=true
This is why only the preview deployment from master is working (it likely has a package-lock.json that resolves differently), while the production deployments from main keep failing.

Summary of what to do:

Add outputFileTracingIncludes to next.config.ts to bundle the SQLite .db file with the serverless functions.
Add a .npmrc file with legacy-peer-deps=true to fix the build failures.

Would you like help making those changes?