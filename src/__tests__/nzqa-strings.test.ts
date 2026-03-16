import * as nzqaStringsModule from '@/lib/nzqa-strings';
import * as paletteModule from '@/lib/palette';

describe('tooltips.achievementRate', () => {
  const { tooltips } = nzqaStringsModule.strings;

  it('includes rate, year, and group in output', () => {
    const result = tooltips.achievementRate(0.756, 2024, 'Māori');
    expect(result).toContain('75.6%');
    expect(result).toContain('2024');
    expect(result).toContain('Māori');
  });

  it('null rate → includes "—"', () => {
    const result = tooltips.achievementRate(null, 2024, 'Māori');
    expect(result).toContain('—');
  });
});

describe('strings shape (smoke)', () => {
  const s = nzqaStringsModule.strings;

  it('page.title is a non-empty string', () => {
    expect(typeof s.page.title).toBe('string');
    expect(s.page.title.length).toBeGreaterThan(0);
  });

  it('controls.level exists and is a string', () => {
    expect(typeof s.controls.level).toBe('string');
  });

  it('sections has expected keys', () => {
    const keys = Object.keys(s.sections);
    expect(keys).toContain('timeline');
    expect(keys).toContain('equity');
    expect(keys).toContain('map');
    expect(keys).toContain('landscape');
    expect(keys).toContain('comparison');
  });
});

describe('narrative accuracy (Phase 7 — metric corrections)', () => {
  const s = nzqaStringsModule.strings;

  it('timeline narrative describes fail rates, not "achievement rates"', () => {
    const narrative = s.sections.timeline.narrative.toLowerCase();
    expect(narrative).toMatch(/fail/);
  });

  it('equity narrative mentions fail rates', () => {
    const narrative = s.sections.equity.narrative.toLowerCase();
    expect(narrative).toMatch(/fail/);
  });

  it('equity narrative does NOT use the old misleading "achieve at lower rates" phrasing', () => {
    const narrative = s.sections.equity.narrative;
    expect(narrative).not.toContain('achieve at lower rates');
  });
});

describe('equityGroups completeness', () => {
  const { equityGroups } = nzqaStringsModule.strings;

  it('has entries for all equity group keys', () => {
    expect(equityGroups).toHaveProperty('Fewer');
    expect(equityGroups).toHaveProperty('Middle');
    expect(equityGroups).toHaveProperty('More');
    expect(equityGroups).toHaveProperty('Decile 1-3');
    expect(equityGroups).toHaveProperty('Decile 4-7');
    expect(equityGroups).toHaveProperty('Decile 8-10');
  });

  it('all equity group display values are non-empty strings', () => {
    Object.values(equityGroups).forEach((v) => {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    });
  });
});

describe('ethnicities display names', () => {
  const { ethnicities } = nzqaStringsModule.strings;

  it('"European" maps to "NZ European / Pākehā"', () => {
    expect(ethnicities['European']).toBe('NZ European / Pākehā');
  });

  it('"NZ European" maps to "NZ European / Pākehā"', () => {
    expect(ethnicities['NZ European']).toBe('NZ European / Pākehā');
  });

  it('"Māori" display name is "Māori"', () => {
    expect(ethnicities['Māori']).toBe('Māori');
  });
});

describe('ETHNICITY_COLOURS coverage', () => {
  it('every key in strings.ethnicities exists in ETHNICITY_COLOURS', () => {
    const ethnicityKeys = Object.keys(nzqaStringsModule.strings.ethnicities);
    ethnicityKeys.forEach((key) => {
      expect(paletteModule.ETHNICITY_COLOURS).toHaveProperty(key);
    });
  });
});
