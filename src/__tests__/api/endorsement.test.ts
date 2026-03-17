/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/nzqa/endorsement/route';

const mockAll = jest.fn();
const mockPrepare = jest.fn(() => ({ all: mockAll }));
jest.mock('@/lib/db', () => ({
  getDb: jest.fn(() => ({ prepare: mockPrepare })),
}));

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/nzqa/endorsement');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function capturedSql(): string {
  const call = mockPrepare.mock.calls[0] as unknown as [string] | undefined;
  return call?.[0] ?? '';
}

describe('GET /api/nzqa/endorsement', () => {
  beforeEach(() => {
    mockAll.mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Validation ─────────────────────────────────────────────────────────────

  describe('qualification validation', () => {
    it('invalid qualification → 400', async () => {
      const res = await GET(makeRequest({ qualification: 'Biology' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'Invalid qualification' });
    });

    it.each(['NCEA Level 1', 'NCEA Level 2', 'NCEA Level 3', 'University Entrance'])(
      'valid qualification "%s" → 200',
      async (qualification) => {
        const res = await GET(makeRequest({ qualification }));
        expect(res.status).toBe(200);
      }
    );
  });

  describe('groupBy validation', () => {
    it('invalid groupBy → 400', async () => {
      const res = await GET(makeRequest({ groupBy: 'hacker' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'Invalid groupBy' });
    });

    it.each(['national', 'ethnicity', 'equity_index_group', 'gender', 'region'])(
      'valid groupBy "%s" → 200',
      async (groupBy) => {
        const res = await GET(makeRequest({ groupBy }));
        expect(res.status).toBe(200);
      }
    );
  });

  describe('yearFrom/yearTo validation', () => {
    it('non-numeric yearFrom → 400', async () => {
      const res = await GET(makeRequest({ yearFrom: 'notanumber' }));
      expect(res.status).toBe(400);
    });

    it('non-numeric yearTo → 400', async () => {
      const res = await GET(makeRequest({ yearTo: 'notanumber' }));
      expect(res.status).toBe(400);
    });

    it('numeric yearFrom/yearTo → 200', async () => {
      const res = await GET(makeRequest({ yearFrom: '2020', yearTo: '2024' }));
      expect(res.status).toBe(200);
    });
  });

  // ─── SQL generation ──────────────────────────────────────────────────────────

  describe('national groupBy SQL', () => {
    it('uses qualification and year_level conditions', async () => {
      await GET(makeRequest({ qualification: 'NCEA Level 3', groupBy: 'national' }));
      const sql = capturedSql();
      expect(sql).toContain('qualification = @qualification');
      expect(sql).toContain('year_level = @yearLevel');
    });

    it('excludes all dimension columns (all IS NULL)', async () => {
      await GET(makeRequest({ qualification: 'NCEA Level 3', groupBy: 'national' }));
      const sql = capturedSql();
      expect(sql).toContain('gender IS NULL');
      expect(sql).toContain('ethnicity IS NULL');
      expect(sql).toContain('equity_index_group IS NULL');
      expect(sql).toContain('region IS NULL');
    });

    it('selects rate and count columns', async () => {
      await GET(makeRequest({ qualification: 'NCEA Level 3', groupBy: 'national' }));
      const sql = capturedSql();
      expect(sql).toContain('excellence_rate');
      expect(sql).toContain('merit_rate');
      expect(sql).toContain('no_endorsement_rate');
    });
  });

  describe('dimension groupBy SQL', () => {
    it('ethnicity groupBy → ethnicity IS NOT NULL + others IS NULL', async () => {
      await GET(makeRequest({ groupBy: 'ethnicity' }));
      const sql = capturedSql();
      expect(sql).toContain('ethnicity IS NOT NULL');
      expect(sql).toContain('gender IS NULL');
      expect(sql).toContain('equity_index_group IS NULL');
      expect(sql).toContain('region IS NULL');
    });

    it('ethnicity groupBy → selects ethnicity as group_label', async () => {
      await GET(makeRequest({ groupBy: 'ethnicity' }));
      const sql = capturedSql();
      expect(sql).toContain('ethnicity as group_label');
    });

    it('equity_index_group groupBy → equity IS NOT NULL + others IS NULL', async () => {
      await GET(makeRequest({ groupBy: 'equity_index_group' }));
      const sql = capturedSql();
      expect(sql).toContain('equity_index_group IS NOT NULL');
      expect(sql).toContain('gender IS NULL');
      expect(sql).toContain('ethnicity IS NULL');
      expect(sql).toContain('region IS NULL');
    });

    it('gender groupBy → gender IS NOT NULL + others IS NULL', async () => {
      await GET(makeRequest({ groupBy: 'gender' }));
      const sql = capturedSql();
      expect(sql).toContain('gender IS NOT NULL');
      expect(sql).toContain('ethnicity IS NULL');
      expect(sql).toContain('equity_index_group IS NULL');
      expect(sql).toContain('region IS NULL');
    });

    it('region groupBy → region IS NOT NULL + others IS NULL', async () => {
      await GET(makeRequest({ groupBy: 'region' }));
      const sql = capturedSql();
      expect(sql).toContain('region IS NOT NULL');
      expect(sql).toContain('gender IS NULL');
      expect(sql).toContain('ethnicity IS NULL');
      expect(sql).toContain('equity_index_group IS NULL');
    });
  });

  describe('yearFrom/yearTo in SQL', () => {
    it('yearFrom → adds year >= condition', async () => {
      await GET(makeRequest({ yearFrom: '2020' }));
      const sql = capturedSql();
      expect(sql).toContain('year >= @yearFrom');
    });

    it('yearTo → adds year <= condition', async () => {
      await GET(makeRequest({ yearTo: '2022' }));
      const sql = capturedSql();
      expect(sql).toContain('year <= @yearTo');
    });
  });

  describe('primary year_level mapping', () => {
    it('NCEA Level 1 uses year_level 11', async () => {
      await GET(makeRequest({ qualification: 'NCEA Level 1' }));
      const callArgs = mockAll.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
      expect(callArgs?.yearLevel).toBe(11);
    });

    it('NCEA Level 2 uses year_level 12', async () => {
      await GET(makeRequest({ qualification: 'NCEA Level 2' }));
      const callArgs = mockAll.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
      expect(callArgs?.yearLevel).toBe(12);
    });

    it('NCEA Level 3 uses year_level 13', async () => {
      await GET(makeRequest({ qualification: 'NCEA Level 3' }));
      const callArgs = mockAll.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
      expect(callArgs?.yearLevel).toBe(13);
    });

    it('University Entrance uses year_level 13', async () => {
      await GET(makeRequest({ qualification: 'University Entrance' }));
      const callArgs = mockAll.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
      expect(callArgs?.yearLevel).toBe(13);
    });
  });

  // ─── Happy path ──────────────────────────────────────────────────────────────

  describe('happy path', () => {
    it('returns data with correct response shape (national)', async () => {
      const mockRows = [
        { year: 2024, excellence_rate: 0.15, merit_rate: 0.32, no_endorsement_rate: 0.53, total_attainment: 33000 },
        { year: 2023, excellence_rate: 0.14, merit_rate: 0.31, no_endorsement_rate: 0.55, total_attainment: 32000 },
      ];
      mockAll.mockReturnValue(mockRows);

      const res = await GET(makeRequest({ qualification: 'NCEA Level 3', groupBy: 'national' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.qualification).toBe('NCEA Level 3');
      expect(body.groupBy).toBe('national');
      expect(body.data[0]).toHaveProperty('excellence_rate', 0.15);
      expect(body.data[0]).toHaveProperty('merit_rate', 0.32);
    });

    it('returns group_label rows for ethnicity groupBy', async () => {
      const mockRows = [
        { year: 2024, group_label: 'Asian', excellence_rate: 0.22, merit_rate: 0.35, no_endorsement_rate: 0.43 },
        { year: 2024, group_label: 'Maori', excellence_rate: 0.08, merit_rate: 0.20, no_endorsement_rate: 0.72 },
      ];
      mockAll.mockReturnValue(mockRows);

      const res = await GET(makeRequest({ groupBy: 'ethnicity', yearFrom: '2024', yearTo: '2024' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data[0]).toHaveProperty('group_label', 'Asian');
      expect(body.groupBy).toBe('ethnicity');
    });

    it('default qualification is NCEA Level 3', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.qualification).toBe('NCEA Level 3');
    });

    it('default groupBy is national', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.groupBy).toBe('national');
    });
  });

  // ─── DB failure ──────────────────────────────────────────────────────────────

  describe('DB failure', () => {
    it('DB throws → 500 with error message', async () => {
      mockAll.mockImplementation(() => { throw new Error('DB exploded'); });
      const res = await GET(makeRequest({ qualification: 'NCEA Level 3' }));
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body).toEqual({ error: 'Database error' });
    });
  });
});
