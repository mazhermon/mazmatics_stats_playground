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

describe('ETHNICITY_COLOURS coverage', () => {
  it('every key in strings.ethnicities exists in ETHNICITY_COLOURS', () => {
    const ethnicityKeys = Object.keys(nzqaStringsModule.strings.ethnicities);
    ethnicityKeys.forEach((key) => {
      expect(paletteModule.ETHNICITY_COLOURS).toHaveProperty(key);
    });
  });
});
