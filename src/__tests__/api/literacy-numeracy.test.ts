/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/nzqa/literacy-numeracy/route';

const mockUnsafe = jest.fn().mockResolvedValue([]);
jest.mock('@/lib/db', () => ({
  getDb: jest.fn(() => ({ unsafe: mockUnsafe })),
}));

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/nzqa/literacy-numeracy');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function capturedSql(): string {
  const call = mockUnsafe.mock.calls[0] as [string, unknown[]] | undefined;
  return call?.[0] ?? '';
}

function capturedParams(): unknown[] {
  const call = mockUnsafe.mock.calls[0] as [string, unknown[]] | undefined;
  return call?.[1] ?? [];
}

describe('GET /api/nzqa/literacy-numeracy', () => {
  beforeEach(() => {
    mockUnsafe.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Validation ─────────────────────────────────────────────────────────────

  describe('area validation', () => {
    it('invalid area → 400', async () => {
      const res = await GET(makeRequest({ area: 'science' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toEqual({ error: 'Invalid area' });
    });

    it('area=literacy → 200', async () => {
      const res = await GET(makeRequest({ area: 'literacy' }));
      expect(res.status).toBe(200);
    });

    it('area=numeracy → 200', async () => {
      const res = await GET(makeRequest({ area: 'numeracy' }));
      expect(res.status).toBe(200);
    });
  });

  describe('yearLevel validation', () => {
    it('yearLevel=10 → 400 (not a valid NCEA year level)', async () => {
      const res = await GET(makeRequest({ yearLevel: '10' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('Invalid yearLevel');
    });

    it('non-numeric yearLevel → 400', async () => {
      const res = await GET(makeRequest({ yearLevel: 'abc' }));
      expect(res.status).toBe(400);
    });

    it.each(['11', '12', '13'])('yearLevel=%s → 200', async (yearLevel) => {
      const res = await GET(makeRequest({ yearLevel }));
      expect(res.status).toBe(200);
    });
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
      const res = await GET(makeRequest({ yearFrom: '2009', yearTo: '2024' }));
      expect(res.status).toBe(200);
    });
  });

  // ─── SQL generation ──────────────────────────────────────────────────────────

  describe('national groupBy SQL', () => {
    it('includes area and year_level conditions', async () => {
      await GET(makeRequest({ area: 'numeracy', yearLevel: '11', groupBy: 'national' }));
      const sql = capturedSql();
      expect(sql).toMatch(/area = \$\d+/);
      expect(sql).toMatch(/year_level = \$\d+/);
    });

    it('excludes all dimension columns (all IS NULL)', async () => {
      await GET(makeRequest({ area: 'numeracy', yearLevel: '11', groupBy: 'national' }));
      const sql = capturedSql();
      expect(sql).toContain('gender IS NULL');
      expect(sql).toContain('ethnicity IS NULL');
      expect(sql).toContain('equity_index_group IS NULL');
      expect(sql).toContain('region IS NULL');
    });

    it('selects both rate columns', async () => {
      await GET(makeRequest({ area: 'numeracy', yearLevel: '11', groupBy: 'national' }));
      const sql = capturedSql();
      expect(sql).toContain('current_attainment_rate');
      expect(sql).toContain('cumulative_attainment_rate');
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
    it('yearFrom → adds year >= $N condition', async () => {
      await GET(makeRequest({ yearFrom: '2009' }));
      const sql = capturedSql();
      expect(sql).toMatch(/year >= \$\d+/);
    });

    it('yearTo → adds year <= $N condition', async () => {
      await GET(makeRequest({ yearTo: '2024' }));
      const sql = capturedSql();
      expect(sql).toMatch(/year <= \$\d+/);
    });
  });

  describe('yearLevel is passed to query params', () => {
    it('yearLevel=11 is passed as numeric 11', async () => {
      await GET(makeRequest({ yearLevel: '11' }));
      expect(capturedParams()).toContain(11);
    });

    it('yearLevel=13 is passed as numeric 13', async () => {
      await GET(makeRequest({ yearLevel: '13' }));
      expect(capturedParams()).toContain(13);
    });
  });

  // ─── Happy path ──────────────────────────────────────────────────────────────

  describe('happy path', () => {
    it('returns data with correct response shape (national)', async () => {
      const mockRows = [
        { year: 2024, area: 'numeracy', year_level: 11, current_attainment_rate: 0.559, cumulative_attainment_rate: 0.748, total_count: 70141 },
        { year: 2023, area: 'numeracy', year_level: 11, current_attainment_rate: 0.62, cumulative_attainment_rate: 0.78, total_count: 69000 },
      ];
      mockUnsafe.mockResolvedValue(mockRows);

      const res = await GET(makeRequest({ area: 'numeracy', yearLevel: '11', groupBy: 'national' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.area).toBe('numeracy');
      expect(body.yearLevel).toBe(11);
      expect(body.groupBy).toBe('national');
      expect(body.data[0]).toHaveProperty('current_attainment_rate', 0.559);
      expect(body.data[0]).toHaveProperty('cumulative_attainment_rate', 0.748);
    });

    it('returns group_label rows for ethnicity groupBy', async () => {
      const mockRows = [
        { year: 2024, group_label: 'Asian', current_attainment_rate: 0.72, cumulative_attainment_rate: 0.85 },
        { year: 2024, group_label: 'Maori', current_attainment_rate: 0.41, cumulative_attainment_rate: 0.63 },
      ];
      mockUnsafe.mockResolvedValue(mockRows);

      const res = await GET(makeRequest({ area: 'numeracy', yearLevel: '11', groupBy: 'ethnicity', yearFrom: '2024', yearTo: '2024' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data[0]).toHaveProperty('group_label', 'Asian');
      expect(body.groupBy).toBe('ethnicity');
    });

    it('default area is numeracy', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.area).toBe('numeracy');
    });

    it('default yearLevel is 11', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.yearLevel).toBe(11);
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
      mockUnsafe.mockRejectedValue(new Error('DB exploded'));
      const res = await GET(makeRequest({ area: 'numeracy', yearLevel: '11' }));
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body).toEqual({ error: 'Database error' });
    });
  });
});
