/**
 * Colour palettes for NZQA data visualisations.
 * These are colour-blind safe and culturally respectful.
 * Do NOT use the Mazmatics brand gradient (#BA90FF → #47A5F1) for data encoding.
 */

// Colour-blind safe categorical palette for ethnicity groups
// Based on Paul Tol's bright scheme (protanopia + deuteranopia safe)
export const ETHNICITY_COLOURS: Record<string, string> = {
  'Māori': '#E53E3E',            // red — culturally significant in te ao Māori
  'Pacific Peoples': '#CCBB44',  // golden yellow
  'Asian': '#66CCEE',            // sky blue
  'European': '#4477AA',         // solid blue
  'NZ European': '#4477AA',
  'NZ European / Pākehā': '#4477AA',
  'MELAA': '#228833',            // forest green
  'Middle Eastern/Latin American/African': '#228833',
  'Other': '#AA3377',            // purple
  'International': '#BBBBBB',
  'All Students': '#BA90FF',     // brand purple for the "all" line
};

// Equity group colours: warm-to-cool diverging
// Fewer = less resourced (warm), More = well resourced (cool)
export const EQUITY_COLOURS: Record<string, string> = {
  'Fewer': '#EE6677',    // red/coral — fewer resources
  'Moderate': '#CCBB44', // golden — middle
  'Middle': '#CCBB44',   // alias
  'More': '#4477AA',     // blue — more resources
  // Pre-2023 decile bands
  'Decile 1-3': '#EE6677',
  'Decile 4-7': '#CCBB44',
  'Decile 8-10': '#4477AA',
};

// Gender colours — Boys/Male = brand purple, Girls/Female = Mazmatics yellow
// Note: data records binary gender (boys/girls); see GenderNote component for acknowledgement
export const GENDER_COLOURS: Record<string, string> = {
  'Female': '#FFF73E',   // Mazmatics yellow
  'Girls':  '#FFF73E',   // alias for primary school data
  'Male':   '#BA90FF',   // brand purple
  'Boys':   '#BA90FF',   // alias for primary school data
  'Other':  '#66CCEE',   // sky blue
};

// NCEA Level colours (brand-adjacent but distinguishable)
export const LEVEL_COLOURS: Record<number, string> = {
  1: '#BA90FF',   // brand purple
  2: '#47A5F1',   // brand blue
  3: '#2A9D8F',   // teal
};

// Sequential choropleth palette for regional map
// Low → high achievement
export const CHOROPLETH_SEQUENTIAL = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#6B48A3', '#8C5FD5', '#BA90FF', '#d4bbff',
];

// Achievement rate thresholds
export const ACHIEVEMENT_DOMAIN = [0, 0.3, 0.5, 0.7, 0.85, 1.0];

/** Get choropleth colour for an achievement rate [0,1] */
export function choroplethColour(rate: number | null): string {
  if (rate === null || isNaN(rate)) return '#2a2a3a';
  // Map [0,1] to one of 8 colours
  const idx = Math.min(7, Math.floor(rate * 8));
  return CHOROPLETH_SEQUENTIAL[idx]!;
}

/** Format a rate as a percentage string */
export function fmtRate(rate: number | null): string {
  if (rate === null || isNaN(rate)) return '—';
  return `${(rate * 100).toFixed(1)}%`;
}

/** Format a number with commas */
export function fmtCount(count: number | null): string {
  if (count === null || isNaN(count)) return '—';
  return count.toLocaleString('en-NZ');
}
