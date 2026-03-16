/**
 * Tests for client-side metric computation logic used in
 * TimelineExplorer, EquityGapVisualizer, RegionalMap, and GradeStackChart.
 *
 * These are pure mathematical transformations — no imports needed.
 */

// ─── Pure computation helpers (mirrors component logic) ────────────────────

/** pass_rate = 1 - not_achieved_rate */
function computePassRate(notAchievedRate: number): number {
  return 1 - notAchievedRate;
}

/** merit_excellence = merit_rate + excellence_rate */
function computeMeritExcellence(meritRate: number, excellenceRate: number): number {
  return meritRate + excellenceRate;
}

/**
 * Weighted mean — used for non-Māori computation in TimelineExplorer.
 * Returns 0 when total weight is 0 (guard against division by zero).
 */
function weightedMean(values: number[], weights: number[]): number {
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((s, v, i) => s + v * weights[i]!, 0) / totalWeight;
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('computePassRate', () => {
  it('0.25 fail rate → 0.75 pass rate', () => {
    expect(computePassRate(0.25)).toBeCloseTo(0.75);
  });

  it('0 fail rate → 1.0 pass rate (everyone passes)', () => {
    expect(computePassRate(0)).toBe(1);
  });

  it('1.0 fail rate → 0 pass rate (no one passes)', () => {
    expect(computePassRate(1)).toBe(0);
  });

  it('typical Māori fail rate → expected pass rate', () => {
    // 10-year average: Māori ~24% fail rate → 76% pass rate
    expect(computePassRate(0.24)).toBeCloseTo(0.76);
  });

  it('typical Asian fail rate → expected pass rate', () => {
    // 10-year average: Asian ~14% fail rate → 86% pass rate
    expect(computePassRate(0.14)).toBeCloseTo(0.86);
  });
});

describe('computeMeritExcellence', () => {
  it('0.3 + 0.2 → 0.5', () => {
    expect(computeMeritExcellence(0.3, 0.2)).toBeCloseTo(0.5);
  });

  it('0 + 0 → 0', () => {
    expect(computeMeritExcellence(0, 0)).toBe(0);
  });

  it('typical Asian distribution: merit + excellence ≈ 0.51', () => {
    // 10-year average: Asian ~26% merit + ~25% excellence ≈ 51%
    expect(computeMeritExcellence(0.26, 0.25)).toBeCloseTo(0.51);
  });

  it('result is always ≥ 0', () => {
    expect(computeMeritExcellence(0, 0)).toBeGreaterThanOrEqual(0);
  });

  it('result does not exceed 1.0 with valid inputs', () => {
    expect(computeMeritExcellence(0.5, 0.5)).toBeLessThanOrEqual(1.0);
  });
});

describe('weightedMean (non-Māori computation)', () => {
  it('equal weights → simple arithmetic mean', () => {
    expect(weightedMean([0.2, 0.4], [100, 100])).toBeCloseTo(0.3);
  });

  it('heavier weight on lower value → mean pulled toward lower value', () => {
    // weights [200, 100]: mean closer to 0.2
    const result = weightedMean([0.2, 0.4], [200, 100]);
    expect(result).toBeCloseTo(0.267, 2);
    expect(result).toBeLessThan(0.3); // pulled toward 0.2
  });

  it('single value → returns that value', () => {
    expect(weightedMean([0.5], [100])).toBeCloseTo(0.5);
  });

  it('zero total weight → returns 0 (guard against division by zero)', () => {
    expect(weightedMean([0.5], [0])).toBe(0);
  });

  it('all zero weights → returns 0', () => {
    expect(weightedMean([0.2, 0.4, 0.6], [0, 0, 0])).toBe(0);
  });

  it('three ethnic groups weighted average', () => {
    // Pacific: 0.25 (n=500), Asian: 0.14 (n=1000), European: 0.16 (n=2000)
    // weighted mean = (0.25*500 + 0.14*1000 + 0.16*2000) / (500+1000+2000)
    //              = (125 + 140 + 320) / 3500 = 585/3500 ≈ 0.167
    expect(weightedMean([0.25, 0.14, 0.16], [500, 1000, 2000])).toBeCloseTo(0.167, 2);
  });
});

describe('grade bands sum to ~1 (data integrity)', () => {
  // Representative grade distributions from NZQA data (10-year national averages)
  const typicalRows = [
    { label: 'National L1',   na: 0.19, ach: 0.42, mer: 0.24, exc: 0.15 },
    { label: 'Māori L1',      na: 0.24, ach: 0.50, mer: 0.19, exc: 0.07 },
    { label: 'Asian L1',      na: 0.14, ach: 0.35, mer: 0.27, exc: 0.24 },
    { label: 'Pacific L1',    na: 0.25, ach: 0.51, mer: 0.17, exc: 0.07 },
    { label: 'European L1',   na: 0.16, ach: 0.42, mer: 0.27, exc: 0.15 },
  ];

  typicalRows.forEach(({ label, na, ach, mer, exc }) => {
    it(`${label}: bands sum to ≈ 1.0 (within 0.02)`, () => {
      const sum = na + ach + mer + exc;
      expect(sum).toBeGreaterThan(0.98);
      expect(sum).toBeLessThan(1.02);
    });
  });

  it('pass_rate + not_achieved_rate = 1.0', () => {
    const na = 0.19;
    expect(computePassRate(na) + na).toBeCloseTo(1.0);
  });

  it('merit_excellence + not_achieved_rate is always < 1.0 (leaves room for achieved)', () => {
    const na = 0.19;
    const me = computeMeritExcellence(0.24, 0.15);
    expect(na + me).toBeLessThan(1.0);
  });
});
