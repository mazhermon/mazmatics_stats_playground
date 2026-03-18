import { NextRequest, NextResponse } from 'next/server';
import { getPrimaryDb } from '@/lib/db/primary';

export const dynamic = 'force-dynamic';

/**
 * GET /api/primary/nmssa?yearLevel=4|8|all&groupType=all|ethnicity|decile|gender
 *
 * Returns NMSSA mean scale scores filtered by year level and group type.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const yearLevel = searchParams.get('yearLevel') ?? 'all';
  const groupType = searchParams.get('groupType') ?? 'all';

  const conditions: string[] = [];
  const params: (string | number | null)[] = [];
  let p = 1;

  if (yearLevel !== 'all') {
    const yl = parseInt(yearLevel, 10);
    if (isNaN(yl) || (yl !== 4 && yl !== 8)) {
      return NextResponse.json({ error: 'yearLevel must be 4, 8, or all' }, { status: 400 });
    }
    conditions.push(`year_level = $${p++}`);
    params.push(yl);
  }

  const allowedGroupTypes = ['all', 'national', 'gender', 'ethnicity', 'decile'];
  if (!allowedGroupTypes.includes(groupType)) {
    return NextResponse.json({ error: 'Invalid groupType' }, { status: 400 });
  }
  if (groupType !== 'all') {
    conditions.push(`group_type = $${p++}`);
    params.push(groupType);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const sql = getPrimaryDb();
    const rows = await sql.unsafe(`
      SELECT id, year, year_level, group_type, group_value,
             mean_score, ci_lower, ci_upper, sd, n, pct_at_curriculum_level
      FROM nmssa_maths
      ${where}
      ORDER BY year, year_level, group_type, group_value
    `, params);
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[/api/primary/nmssa]', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
