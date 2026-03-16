# Security Summary — Mazmatics Stats Playground

## Status
- Code review fixes: **COMPLETE** (applied in earlier session)
- Shannon pentest: **PARTIAL** — pre-recon + vuln analysis phases completed, exploitation/report phases not run (stopped intentionally — overkill for local dev)

---

## Code Review Fixes Already Applied

These were identified and fixed in a previous session:

| File | Fix |
|---|---|
| `src/lib/palette.ts` | NaN guards in `choroplethColour`, `fmtRate`, `fmtCount` |
| `src/lib/hooks/useNzqaData.ts` | Null-url state reset + error type narrowing |
| `src/app/api/nzqa/timeline/route.ts` | `parseInt` NaN guards + `console.error` in catch |
| `src/lib/db/index.ts` | Removed pointless WAL pragma on read-only connection |
| `src/lib/audio/index.ts` | Oscillator cleanup `onended` + catch comments |
| `src/lib/nzqa-strings.ts` | Null-rate guard in tooltip function |

---

## Shannon Pre-Recon Findings (2026-03-16)

Workspace: `mazmatics-audit-003` | Log: `~/shannon/audit-logs/mazmatics-audit-003/workflow.log`

Shannon completed pre-recon, entry point mapping, and vulnerability analysis phases. Summary of what it found:

### Not Applicable (by design)
These findings are expected for a **local dev/public data visualisation** project and do not need fixing unless shipping to production:

- No authentication/authorisation — all data is public NZQA statistics, no user accounts
- No CORS configuration — local dev only
- No rate limiting — local dev only
- SQLite database read-only and contains only public data

### Worth Fixing Before Any Production Deploy

**1. API key in `.env`**
- The `.env` file contains `ANTHROPIC_API_KEY` in plaintext
- Ensure `.env` is in `.gitignore` (verify this is the case)
- Never commit it to version control

**2. Missing HTTP security headers**
- No Content Security Policy (CSP)
- No `X-Frame-Options`
- No `X-Content-Type-Options`
- No HSTS
- Fix: add a `next.config.ts` headers block or middleware

**3. No input validation on API query params**
- API routes under `/api/nzqa/*` accept query params that feed directly into SQL queries via better-sqlite3
- better-sqlite3 uses parameterised queries (safe from injection) but params are not validated for type/range
- Fix: add Zod schema validation on route inputs

**4. No rate limiting**
- All 6 API endpoints are open with no throttling
- Low risk for local dev, but add before any public deploy
- Fix: Next.js middleware with a simple rate-limit library (e.g. `@upstash/ratelimit`)

### API Endpoints Identified (all public, no auth)
- `GET /api/nzqa/subjects`
- `GET /api/nzqa/qualifications`
- `GET /api/nzqa/timeline`
- `GET /api/nzqa/literacy-numeracy`
- `GET /api/nzqa/scholarship`
- `GET /api/nzqa/endorsements`

---

## Recommended Next Steps (priority order)

1. **Verify `.env` is gitignored** — quick check, do it now
2. **Add security headers** — 30 min job in `next.config.ts`
3. **Add Zod validation to API routes** — 1–2 hours across all 6 routes
4. **Rate limiting** — only needed before public deploy

---

## Shannon Setup Notes (for re-running later)

If you want to run a full pentest in future:

```bash
cd ~/shannon

# Credentials are configured — uses Claude Code OAuth token
# docker-compose.yml is patched to mount the project directly:
#   - /Users/mazhermon/Sites/mazmaticsClaudeProjects/mazmaticsStats_001:/repos/mazmaticsStats:ro
# Note: PATH must include Docker Desktop binaries
export PATH="$PATH:/Applications/Docker.app/Contents/Resources/bin"

./shannon start URL=http://host.docker.internal:3000 REPO=mazmaticsStats WORKSPACE=mazmatics-audit-004
```

Note: The OAuth token in `~/shannon/.env` expires — if it fails with an auth error, re-extract it:
```bash
security find-generic-password -s "Claude Code-credentials" -a "mazhermon" -w | \
  python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d['claudeAiOauth']['accessToken'])"
```
