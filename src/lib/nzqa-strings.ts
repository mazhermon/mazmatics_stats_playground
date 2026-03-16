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
      narrative: `Between 2015 and 2024, the proportion of students achieving in NCEA Mathematics
        has shifted — shaped by curriculum changes, COVID disruptions in 2020–2021,
        and the introduction of new NCEA level reforms in 2024. Toggle between levels
        to see how the story changes.`,
    },
    equity: {
      heading: 'Not every student starts from the same place',
      narrative: `The gaps in maths achievement between ethnic groups are persistent and significant.
        Students who are Māori or Pacific Peoples consistently achieve at lower rates than their
        peers. These are not gaps about ability — they reflect systemic inequities in how our
        schools are resourced, supported, and connected to communities.`,
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
