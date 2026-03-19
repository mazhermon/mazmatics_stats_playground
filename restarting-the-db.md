# Restarting the Supabase Database (Free Tier)

## What happens after 7 days of inactivity

Supabase free tier projects **pause automatically** after 7 days with no database activity. When paused:
- The app will return 500 errors on all chart pages
- API routes will fail with a connection error
- The data is not lost — it's just hibernated

## How to unpause

1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project (mazmaticsStats or similar)
3. You'll see a banner saying the project is paused
4. Click **Restore project**
5. Wait 1-2 minutes for it to come back online
6. Visit the live site and check a chart page loads

That's it — no commands to run, no data to re-seed. The database and all data are preserved.

## How to tell if the DB is paused

- Charts show no data or the page returns an error
- Visit your Supabase dashboard and look for the paused/restore banner
- Or check: Vercel deployment logs will show `connect_timeout` or `ECONNREFUSED` errors

## Avoiding the 7-day pause

Any database activity resets the 7-day timer. Options:
- Visit the site yourself every few days
- Set up a simple uptime monitor (e.g. UptimeRobot free tier) to ping the homepage every 24h — this won't hit the DB directly but will keep the Vercel functions warm
- Upgrade to **Supabase Pro ($25/mo)** — pausing is disabled entirely on Pro

## Note on the seed script

You do **not** need to re-run `npm run seed:supabase` after unpausing. The data is still there. The seed script is only needed if you want to reset all data from the local SQLite source files.
