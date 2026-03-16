import {
  choroplethColour,
  fmtRate,
  fmtCount,
  CHOROPLETH_SEQUENTIAL,
} from '@/lib/palette';

describe('choroplethColour', () => {
  it('null → fallback colour', () => {
    expect(choroplethColour(null)).toBe('#2a2a3a');
  });

  it('NaN → fallback colour', () => {
    expect(choroplethColour(NaN)).toBe('#2a2a3a');
  });

  it('0 → CHOROPLETH_SEQUENTIAL[0]', () => {
    expect(choroplethColour(0)).toBe(CHOROPLETH_SEQUENTIAL[0]);
  });

  it('0.5 → CHOROPLETH_SEQUENTIAL[4]', () => {
    // 0.5 * 8 = 4.0 → floor = 4
    expect(choroplethColour(0.5)).toBe(CHOROPLETH_SEQUENTIAL[4]);
  });

  it('1.0 → CHOROPLETH_SEQUENTIAL[7] (boundary — not index 8)', () => {
    // Math.min(7, floor(1.0 * 8)) = Math.min(7, 8) = 7
    expect(choroplethColour(1.0)).toBe(CHOROPLETH_SEQUENTIAL[7]);
  });

  it('0.999 → CHOROPLETH_SEQUENTIAL[7]', () => {
    // 0.999 * 8 = 7.992 → floor = 7
    expect(choroplethColour(0.999)).toBe(CHOROPLETH_SEQUENTIAL[7]);
  });

  it('0.125 → CHOROPLETH_SEQUENTIAL[1]', () => {
    // 0.125 * 8 = 1.0 → floor = 1
    expect(choroplethColour(0.125)).toBe(CHOROPLETH_SEQUENTIAL[1]);
  });
});

describe('fmtRate', () => {
  it('null → "—"', () => {
    expect(fmtRate(null)).toBe('—');
  });

  it('NaN → "—"', () => {
    expect(fmtRate(NaN)).toBe('—');
  });

  it('0 → "0.0%"', () => {
    expect(fmtRate(0)).toBe('0.0%');
  });

  it('0.756 → "75.6%"', () => {
    expect(fmtRate(0.756)).toBe('75.6%');
  });

  it('1.0 → "100.0%"', () => {
    expect(fmtRate(1.0)).toBe('100.0%');
  });

  it('0.001 → "0.1%"', () => {
    expect(fmtRate(0.001)).toBe('0.1%');
  });
});

describe('fmtCount', () => {
  it('null → "—"', () => {
    expect(fmtCount(null)).toBe('—');
  });

  it('NaN → "—"', () => {
    expect(fmtCount(NaN)).toBe('—');
  });

  it('0 → "0"', () => {
    expect(fmtCount(0)).toBe('0');
  });

  it('1234567 → comma-separated', () => {
    // en-NZ locale uses commas for thousands
    expect(fmtCount(1234567)).toBe('1,234,567');
  });
});
