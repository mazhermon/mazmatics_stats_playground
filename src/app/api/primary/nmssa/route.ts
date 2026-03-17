import { NextRequest, NextResponse } from 'next/server';
import { getPrimaryDb } from '@/lib/db/primary';

export const dynamic = 'force-dynamic';

/**
 * GET /api/primary/nmssa?yearLevel=4|8|all&groupType=all|ethnicity|decile|gender
 *
 * Returns NMSSA 2022 mean scale scores filtered by year level and group type.
 */
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const yearLevel = searchParams.get('yearLevel') ?? 'all';
  const groupType = searchParams.get('groupType') ?? 'all';

  const conditions: string[] = [];
  const params: Record<string, number | string> = {};

  if (yearLevel !== 'all') {
    const yl = parseInt(yearLevel, 10);
    if (isNaN(yl) || (yl !== 4 && yl !== 8)) {
      return NextResponse.json({ error: 'yearLevel must be 4, 8, or all' }, { status: 400 });
    }
    conditions.push('year_level = @year_level');
    params.year_level = yl;
  }

  const allowedGroupTypes = ['all', 'national', 'gender', 'ethnicity', 'decile'];
  if (!allowedGroupTypes.includes(groupType)) {
    return NextResponse.json({ error: 'Invalid groupType' }, { status: 400 });
  }
  if (groupType !== 'all') {
    conditions.push('group_type = @group_type');
    params.group_type = groupType;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const db = getPrimaryDb();
    const rows = db.prepare(`
      SELECT id, year, year_level, group_type, group_value,
             mean_score, ci_lower, ci_upper, sd, n, pct_at_curriculum_level
      FROM nmssa_maths
      ${where}
      ORDER BY year, year_level, group_type, group_value
    `).all(params);
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[/api/primary/nmssa]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
