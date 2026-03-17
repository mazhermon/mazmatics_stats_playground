import { NextResponse } from 'next/server';
import { getPrimaryDb } from '@/lib/db/primary';

export const dynamic = 'force-dynamic';

/**
 * GET /api/primary/curriculum-insights
 *
 * Returns all Curriculum Insights % meeting provisional benchmarks (2023–2024)
 * for all year levels.
 */
export function GET() {
  try {
    const db = getPrimaryDb();
    const rows = db.prepare(`
      SELECT id, year, year_level, group_type, group_value,
             pct_meeting, pct_less_1yr, pct_more_1yr
      FROM curriculum_insights_maths
      ORDER BY year, year_level
    `).all();
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[/api/primary/curriculum-insights]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
