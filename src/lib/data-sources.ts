export type SourceId =
  | 'nzqa-secondary'
  | 'nzqa-scholarship'
  | 'nzqa-endorsement'
  | 'nzqa-literacy-numeracy'
  | 'timss'
  | 'nmssa'
  | 'curriculum-insights';

export type ChartPageId =
  | 'primary-maths'
  | 'nzqa-maths'
  | 'nzqa-scholarship'
  | 'nzqa-endorsement'
  | 'nzqa-literacy-numeracy'
  | 'nzqa-creative'
  | 'nzqa-stories'
  | 'nzqa-patterns';

export interface DataSource {
  id: SourceId;
  name: string;
  publisher: string;
  years: string;
  urls: Array<{ label: string; url: string }>;
  description: string;
  caveats: Array<{ type: 'warning' | 'info'; text: string }>;
}

export const CHART_PAGE_SOURCES: Record<ChartPageId, SourceId[]> = {
  'primary-maths':           ['timss', 'nmssa', 'curriculum-insights'],
  'nzqa-maths':              ['nzqa-secondary'],
  'nzqa-scholarship':        ['nzqa-scholarship'],
  'nzqa-endorsement':        ['nzqa-endorsement'],
  'nzqa-literacy-numeracy':  ['nzqa-literacy-numeracy'],
  'nzqa-creative':           ['nzqa-secondary'],
  'nzqa-stories':            ['nzqa-secondary'],
  'nzqa-patterns':           ['nzqa-secondary'],
};

export const CHART_PAGE_META: Record<ChartPageId, { label: string; href: string }> = {
  'primary-maths':           { label: 'NZ Primary Maths Explorer',       href: '/primary-maths' },
  'nzqa-maths':              { label: 'NZ Secondary Maths Explorer',      href: '/nzqa-maths' },
  'nzqa-scholarship':        { label: 'NZ Scholarship Explorer',          href: '/nzqa-scholarship' },
  'nzqa-endorsement':        { label: 'NZ Endorsement Explorer',          href: '/nzqa-endorsement' },
  'nzqa-literacy-numeracy':  { label: 'NZ Literacy & Numeracy Explorer',  href: '/nzqa-literacy-numeracy' },
  'nzqa-creative':           { label: 'Creative Views',                   href: '/nzqa-creative' },
  'nzqa-stories':            { label: 'Data Stories',                     href: '/nzqa-stories' },
  'nzqa-patterns':           { label: 'Patterns & Trends',                href: '/nzqa-patterns' },
};

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'nzqa-secondary',
    name: 'NZQA Subject Attainment Statistics',
    publisher: 'New Zealand Qualifications Authority (NZQA)',
    years: '2015–2024',
    urls: [
      { label: 'nzqa.govt.nz/statistics ↗', url: 'https://www.nzqa.govt.nz/about-us/publications/statistics/' },
    ],
    description:
      'Subject attainment rates (Not Achieved / Achieved / Merit / Excellence) for NCEA Levels 1, 2, and 3, broken down by ethnicity, gender, school equity group (Q1–Q5), and region. Coverage: English-medium secondary schools, reported at national level and by 16 NZ regions.',
    caveats: [
      { type: 'warning', text: 'achieved_rate is the Achieved-grade-only band — NOT the overall pass rate. Pass rate = 1 − not_achieved_rate.' },
      { type: 'warning', text: 'Equity group data (Q1–Q5) is available from 2019 onwards only.' },
      { type: 'info',    text: 'Each breakdown is single-dimensional — ethnicity, gender, and region data cannot be cross-tabulated.' },
      { type: 'info',    text: 'Scholarship "Maori" appears without macron in source data.' },
    ],
  },
  {
    id: 'nzqa-scholarship',
    name: 'NZQA Scholarship Statistics',
    publisher: 'New Zealand Qualifications Authority (NZQA)',
    years: '2015–2024',
    urls: [
      { label: 'nzqa.govt.nz/statistics ↗', url: 'https://www.nzqa.govt.nz/about-us/publications/statistics/' },
    ],
    description:
      'Outstanding / Scholarship / No Award rates for NZ Scholarship Calculus and Statistics, broken down by ethnicity, equity group, gender, and region.',
    caveats: [
      { type: 'info', text: 'Small cohort sizes in some ethnicity/region breakdowns — treat with caution.' },
      { type: 'info', text: 'Scholarship is awarded to the top ~3% of candidates nationally.' },
    ],
  },
  {
    id: 'nzqa-endorsement',
    name: 'NZQA Endorsement Statistics',
    publisher: 'New Zealand Qualifications Authority (NZQA)',
    years: '2015–2024',
    urls: [
      { label: 'nzqa.govt.nz/statistics ↗', url: 'https://www.nzqa.govt.nz/about-us/publications/statistics/' },
    ],
    description:
      'Excellence and Merit endorsement rates for NCEA L1, L2, L3 and University Entrance qualifications, broken down by ethnicity, equity, gender, and region.',
    caveats: [
      { type: 'info',    text: 'Endorsement is a qualification-level award (not subject-level) — reflects the full year\'s achievement across all subjects.' },
      { type: 'warning', text: 'Equity group format changed in 2019: decile bands replaced with equity index groups (Fewer/Moderate/More resources).' },
    ],
  },
  {
    id: 'nzqa-literacy-numeracy',
    name: 'NZQA Literacy & Numeracy Co-requisite Statistics',
    publisher: 'New Zealand Qualifications Authority (NZQA)',
    years: '2009–2024',
    urls: [
      { label: 'nzqa.govt.nz/statistics ↗', url: 'https://www.nzqa.govt.nz/about-us/publications/statistics/' },
    ],
    description:
      'Current-year and cumulative pass rates for NCEA literacy and numeracy co-requisite standards at Year 11, 12, and 13. Broken down by ethnicity, equity group, gender, and region.',
    caveats: [
      { type: 'warning', text: 'New co-requisite standards (CAAs) replaced old Unit Standards from 2020 — causes a sharp drop in current-year pass rates visible from 2020.' },
      { type: 'warning', text: 'Equity group format changed in 2019: decile bands replaced by equity index groups.' },
      { type: 'info',    text: 'Current-year rate = first-time passers. Cumulative rate = ever passed by that year level (includes re-sits).' },
    ],
  },
  {
    id: 'timss',
    name: 'TIMSS International Maths Study',
    publisher: 'IEA (International Association for the Evaluation of Educational Achievement)',
    years: '1995, 2003, 2007, 2011, 2015, 2019, 2023',
    urls: [
      { label: 'timss2023.org ↗', url: 'https://timss2023.org' },
    ],
    description:
      'NZ Grade 4 (Year 5, age ~9) maths scale scores 1995–2023, by gender. 2023 international country comparison (~58 countries). Coverage: nationally representative sample of Year 5 students in English-medium schools, tested in February each year.',
    caveats: [
      { type: 'warning', text: 'International average is recalculated each cycle based on participating countries — not directly comparable across years.' },
      { type: 'warning', text: 'TIMSS scale is NOT the same as NMSSA MS scale. These are completely separate measurement systems.' },
      { type: 'info',    text: 'AUS/ENG comparison lines are approximate from published reports; exact values may vary slightly by rounding.' },
    ],
  },
  {
    id: 'nmssa',
    name: 'NMSSA Maths Achievement Reports',
    publisher: 'University of Otago / NZCER on behalf of Ministry of Education',
    years: '2013, 2018, 2022',
    urls: [
      { label: 'Report 30 (2022) ↗', url: 'https://nmssa-production.s3.amazonaws.com/documents/NMSSA_2022_Mathematics_Achievement_Report.pdf' },
      { label: 'Report 19 (2018) ↗', url: 'https://nmssa-production.s3.amazonaws.com/documents/2018_NMSSA_MATHEMATICS.pdf' },
    ],
    description:
      'Mean Scale Score (MS units) for Year 4 and Year 8 students, by ethnicity, gender, and school decile band. Coverage: ~2,000 students per year level, English-medium state and integrated schools. Stratified sample by decile, region, and school size.',
    caveats: [
      { type: 'warning', text: 'MS scale is designed so the combined 2013 average ≈ 100 with SD ≈ 20. Year 4 and Year 8 are NOT on the same sub-scale — a score of 84 at Y4 is not comparable to 84 at Y8.' },
      { type: 'warning', text: '2013 values in our data are reconstructed on the 2018 MS scale via a linking exercise (NMSSA Report 19, Appendix 6). They differ from the original 2013 report figures.' },
      { type: 'info',    text: '95% confidence intervals for 2013 are approximated from 2018 standard errors (similar sample sizes). Treat 2013 CIs as indicative.' },
      { type: 'info',    text: 'NMSSA assessed at Year 4 and Year 8. The successor programme (Curriculum Insights) assesses at Year 3, Year 6, and Year 8.' },
    ],
  },
  {
    id: 'curriculum-insights',
    name: 'Curriculum Insights Dashboard',
    publisher: 'University of Otago / NZCER on behalf of Ministry of Education',
    years: '2023, 2024',
    urls: [
      { label: 'curriculuminsights.otago.ac.nz ↗', url: 'https://curriculuminsights.otago.ac.nz' },
    ],
    description:
      'Percentage of students meeting / approaching / behind provisional NZ Curriculum benchmarks, at Year 3, Year 6, and Year 8. Nationally representative sample, successor to NMSSA (launched 2023).',
    caveats: [
      { type: 'warning', text: 'Uses % meeting benchmarks — NOT the MS scale score used by NMSSA. These two datasets cannot be compared on the same chart.' },
      { type: 'warning', text: 'Year levels changed: NMSSA measured Year 4 + Year 8; Curriculum Insights measures Year 3 + Year 6 + Year 8.' },
      { type: 'info',    text: 'No statistically significant change was observed between 2023 and 2024 at any year level.' },
      { type: 'info',    text: 'Demographic breakdowns (ethnicity, gender) are available in interactive data windows only — not included in our database.' },
    ],
  },
];

export function getChartsForSource(sourceId: SourceId): ChartPageId[] {
  return (Object.entries(CHART_PAGE_SOURCES) as [ChartPageId, SourceId[]][])
    .filter(([, sources]) => sources.includes(sourceId))
    .map(([pageId]) => pageId);
}
