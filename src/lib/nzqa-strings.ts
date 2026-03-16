/**
 * Internationalizable strings for the NZQA Data Explorer.
 * All user-facing text lives here for future te reo Māori translation.
 */

export const strings = {
  page: {
    title: 'NZ Maths Achievement Explorer',
    subtitle: 'Exploring a decade of mathematics achievement in New Zealand secondary schools',
    description: 'Interactive data from NZQA, 2015–2024',
  },
  nav: {
    backToHome: 'Back to Mazmatics',
    dataSource: 'Data: NZQA',
  },
  sections: {
    timeline: {
      heading: 'A decade of maths achievement',
      narrative: `Between 2015 and 2024, the fail rate in NCEA Mathematics has shifted — shaped by
        COVID disruptions in 2020–2021 and the 2024 NCEA reform which sent fail rates sharply upward.
        Switch the grouping to compare ethnic groups, equity groups, regions, or gender.
        Change the metric to view fail rates, pass rates, or Merit/Excellence rates.`,
    },
    equity: {
      heading: 'Not every student starts from the same place',
      narrative: `The gaps in maths achievement between ethnic groups are persistent and significant.
        Māori and Pacific Peoples students consistently have higher fail rates and lower Merit/Excellence
        rates than their peers — not because of ability, but because of systemic inequities in how
        schools are resourced, supported, and connected to communities.
        Toggle between "Fail rate", "Pass rate", and "Merit + Excellence" to see the full picture.`,
    },
    map: {
      heading: 'Where you live matters',
      narrative: `Achievement rates vary across NZ regions. Click on a region to see how
        different groups of students are doing in that area — and where the equity gaps
        are largest.`,
    },
    landscape: {
      heading: 'The shape of inequality',
      narrative: `Rotate, zoom, and explore this 3D view of maths achievement. The height
        of each column shows the achievement rate — and the landscape shows us exactly
        where the peaks and valleys are across different groups and years.`,
    },
    comparison: {
      heading: 'Explore the data your way',
      narrative: `Pick any two dimensions to cross-tabulate maths achievement. What story
        does gender × equity group tell? What about region × ethnicity? Every combination
        reveals a different facet of the picture.`,
    },
  },
  controls: {
    level: 'NCEA Level',
    level1: 'Level 1',
    level2: 'Level 2',
    level3: 'Level 3',
    metric: 'Metric',
    groupBy: 'Group by',
    year: 'Year',
    ethnicity: 'Ethnicity',
    equityGroup: 'Equity group',
    region: 'Region',
    gender: 'Gender',
    xAxis: 'X axis',
    yAxis: 'Y axis',
    allStudents: 'All students',
    national: 'National',
  },
  ethnicities: {
    'Māori': 'Māori',
    'Pacific Peoples': 'Pacific Peoples',
    'Asian': 'Asian',
    'NZ European': 'NZ European / Pākehā',
    'European': 'NZ European / Pākehā',
    'NZ European / Pākehā': 'NZ European / Pākehā',
    'MELAA': 'MELAA',
    'Other': 'Other',
  },
  equityGroups: {
    'Fewer': 'Fewer resources',
    'Middle': 'Moderate resources',
    'More': 'More resources',
    'Decile 1-3': 'Low decile (1–3)',
    'Decile 4-7': 'Mid decile (4–7)',
    'Decile 8-10': 'High decile (8–10)',
  },
  metrics: {
    achieved_rate: 'Achievement rate',
    merit_rate: 'Merit rate',
    excellence_rate: 'Excellence rate',
    not_achieved_rate: 'Not achieved rate',
  },
  tooltips: {
    achievementRate: (rate: number | null, year: number, group: string) =>
      `${group} · ${year}: ${rate != null ? (rate * 100).toFixed(1) + '%' : '—'} achieved`,
    noData: 'No data available for this group',
    clickForDetail: 'Click to explore this region',
  },
  loading: 'Loading data...',
  error: 'Couldn\'t load the data. Please try refreshing.',
  dataNote: 'Source: NZQA Secondary School Statistics 2015–2024. Suppressed cells (S) are excluded.',
  decileNote: 'Note: School equity groups replaced decile bands in 2023. Pre-2023 data uses decile bands mapped to equivalent equity groups.',
};

export type StringKeys = keyof typeof strings;
