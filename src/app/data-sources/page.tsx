import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Sources & Methodology — Mazmatics',
  description:
    'All data sources used across Mazmatics Stats — NZQA, TIMSS, NMSSA, and Curriculum Insights. Verify the numbers independently.',
};

function GradientHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl font-bold scroll-mt-20"
      style={{
        background: 'linear-gradient(to left, #47A5F1, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </h2>
  );
}

interface UsedOnChipProps {
  href: string;
  label: string;
}

function UsedOnChip({ href, label }: UsedOnChipProps) {
  return (
    <Link
      href={href}
      className="inline-block bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-full px-2 py-0.5 text-xs font-mono transition-colors"
    >
      {label}
    </Link>
  );
}

interface CaveatProps {
  type: 'warning' | 'info';
  children: React.ReactNode;
}

function Caveat({ type, children }: CaveatProps) {
  return (
    <li className={type === 'warning' ? 'text-amber-500/80' : 'text-slate-400'}>
      {children}
    </li>
  );
}

export default function DataSourcesPage() {
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundColor: '#020617',
        backgroundImage: `
          linear-gradient(rgba(71,165,241,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(71,165,241,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }}
    >
      {/* Nav */}
      <nav className="sticky top-10 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2"
          >
            ← All explorers
          </Link>
          <span
            className="text-sm font-semibold"
            style={{
              background: 'linear-gradient(to left, #47A5F1, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mazmatics
          </span>
          <span className="text-xs text-slate-600 font-mono hidden sm:block">Data Sources</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono border border-slate-700 text-slate-500">
            About the data
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight"
            style={{
              background: 'linear-gradient(to left, #47A5F1, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Data Sources &amp; Methodology
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            All data used across Mazmatics Stats is publicly sourced from NZ government bodies and
            international research organisations. Every source is linked below so you can verify the
            numbers independently and understand how they were collected.
          </p>
        </header>

        {/* Jump links */}
        <nav aria-label="Jump to source" className="flex flex-wrap gap-2">
          {[
            { href: '#source-nzqa', label: 'NZQA Secondary Stats' },
            { href: '#source-timss', label: 'TIMSS International' },
            { href: '#source-nmssa', label: 'NMSSA' },
            { href: '#source-curriculum-insights', label: 'Curriculum Insights' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-full px-3 py-1 text-xs font-mono transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Source 1: NZQA ── */}
        <section
          id="source-nzqa"
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 scroll-mt-20"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <GradientHeading id="source-nzqa-heading">
              NZQA Secondary School Statistics
            </GradientHeading>
            <div className="flex flex-wrap gap-2">
              <UsedOnChip href="/nzqa-maths" label="/nzqa-maths" />
              <UsedOnChip href="/nzqa-scholarship" label="/nzqa-scholarship" />
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Publisher</dt>
              <dd className="text-slate-300">New Zealand Qualifications Authority (NZQA)</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Years</dt>
              <dd className="text-slate-300">2015–2024</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Source URL</dt>
              <dd>
                <a
                  href="https://www.nzqa.govt.nz/about-us/publications/statistics/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline break-all"
                >
                  nzqa.govt.nz/statistics ↗
                </a>
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">What we use</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Subject attainment rates (Not Achieved / Achieved / Merit / Excellence) for NCEA Levels 1, 2,
              and 3, broken down by ethnicity, gender, school equity group (Q1–Q5), and region.
              Also scholarship attainment (Outstanding / Scholarship / No Award) for Calculus and Statistics.
              Coverage: English-medium secondary schools, reported at national level and by 16 NZ regions.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Key caveats</h3>
            <ul className="text-sm space-y-1.5 list-disc list-inside">
              <Caveat type="warning">
                <code className="text-amber-400/90 text-xs">achieved_rate</code> is the Achieved-grade-only
                band — NOT the overall pass rate. Pass rate = 1 − not_achieved_rate.
              </Caveat>
              <Caveat type="warning">
                Equity group data (Q1–Q5) is available from 2019 onwards only.
              </Caveat>
              <Caveat type="info">
                Each breakdown is single-dimensional — ethnicity, gender, and region data cannot be cross-tabulated.
              </Caveat>
              <Caveat type="info">
                Scholarship &ldquo;Maori&rdquo; appears without macron in source data.
              </Caveat>
            </ul>
          </div>

          <a
            href="https://www.nzqa.govt.nz/about-us/publications/statistics/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all"
          >
            View original source ↗
          </a>
        </section>

        {/* ── Source 2: TIMSS ── */}
        <section
          id="source-timss"
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 scroll-mt-20"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <GradientHeading id="source-timss-heading">
              TIMSS International Maths Study
            </GradientHeading>
            <div className="flex flex-wrap gap-2">
              <UsedOnChip href="/primary-maths" label="/primary-maths" />
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Publisher</dt>
              <dd className="text-slate-300">IEA (International Association for the Evaluation of Educational Achievement)</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Years</dt>
              <dd className="text-slate-300">1995, 2003, 2007, 2011, 2015, 2019, 2023</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Source URL</dt>
              <dd>
                <a
                  href="https://timss2023.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  timss2023.org ↗
                </a>
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Full title</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trends in International Mathematics and Science Study (TIMSS) 2023 — International Results
              in Mathematics at Grade 4.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">What we use</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              NZ Grade 4 (Year 5, age ~9) maths scale scores 1995–2023, by gender. 2023 international
              country comparison (~58 countries). Coverage: nationally representative sample of Year 5 students
              in English-medium schools, tested in February each year.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Key caveats</h3>
            <ul className="text-sm space-y-1.5 list-disc list-inside">
              <Caveat type="warning">
                International average is recalculated each cycle based on participating countries — not directly comparable across years.
              </Caveat>
              <Caveat type="warning">
                TIMSS scale is NOT the same as NMSSA MS scale. These are completely separate measurement systems.
              </Caveat>
              <Caveat type="info">
                AUS/ENG comparison lines are approximate from published reports; exact values may vary slightly by rounding.
              </Caveat>
            </ul>
          </div>

          <a
            href="https://timss2023.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all"
          >
            View original source ↗
          </a>
        </section>

        {/* ── Source 3: NMSSA ── */}
        <section
          id="source-nmssa"
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 scroll-mt-20"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <GradientHeading id="source-nmssa-heading">
              NMSSA Maths Achievement Reports
            </GradientHeading>
            <div className="flex flex-wrap gap-2">
              <UsedOnChip href="/primary-maths" label="/primary-maths" />
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Publisher</dt>
              <dd className="text-slate-300">University of Otago / NZCER on behalf of Ministry of Education</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Years</dt>
              <dd className="text-slate-300">2013, 2018, 2022</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Source URLs</dt>
              <dd className="space-y-1">
                <a
                  href="https://nmssa-production.s3.amazonaws.com/documents/NMSSA_2022_Mathematics_Achievement_Report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  Report 30 (2022) ↗
                </a>
                <a
                  href="https://nmssa-production.s3.amazonaws.com/documents/2018_NMSSA_MATHEMATICS.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  Report 19 (2018) ↗
                </a>
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Full title</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              National Monitoring Study of Student Achievement — Mathematics and Statistics.
              Report 19: Mathematics and Statistics 2018. Report 30: Mathematics and Statistics 2022.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">What we use</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mean Scale Score (MS units) for Year 4 and Year 8 students, by ethnicity, gender, and school
              decile band. Coverage: ~2,000 students per year level, English-medium state and integrated schools.
              Stratified sample by decile, region, and school size.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Key caveats</h3>
            <ul className="text-sm space-y-1.5 list-disc list-inside">
              <Caveat type="warning">
                MS scale is designed so the combined 2013 average ≈ 100 with SD ≈ 20. Year 4 and Year 8 are
                NOT on the same sub-scale — a score of 84 at Y4 is not comparable to 84 at Y8.
              </Caveat>
              <Caveat type="warning">
                2013 values in our data are reconstructed on the 2018 MS scale via a linking exercise (NMSSA
                Report 19, Appendix 6). They differ from the original 2013 report figures.
              </Caveat>
              <Caveat type="info">
                95% confidence intervals for 2013 are approximated from 2018 standard errors (similar sample sizes).
                Treat 2013 CIs as indicative.
              </Caveat>
              <Caveat type="info">
                NMSSA assessed at Year 4 and Year 8. The successor programme (Curriculum Insights) assesses
                at Year 3, Year 6, and Year 8.
              </Caveat>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://nmssa-production.s3.amazonaws.com/documents/NMSSA_2022_Mathematics_Achievement_Report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all"
            >
              Report 30 (2022) ↗
            </a>
            <a
              href="https://nmssa-production.s3.amazonaws.com/documents/2018_NMSSA_MATHEMATICS.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all"
            >
              Report 19 (2018) ↗
            </a>
          </div>
        </section>

        {/* ── Source 4: Curriculum Insights ── */}
        <section
          id="source-curriculum-insights"
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 scroll-mt-20"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <GradientHeading id="source-curriculum-insights-heading">
              Curriculum Insights Dashboard
            </GradientHeading>
            <div className="flex flex-wrap gap-2">
              <UsedOnChip href="/primary-maths" label="/primary-maths" />
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Publisher</dt>
              <dd className="text-slate-300">University of Otago / NZCER on behalf of Ministry of Education</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Years</dt>
              <dd className="text-slate-300">2023, 2024</dd>
            </div>
            <div>
              <dt className="text-slate-600 uppercase tracking-wider mb-1">Source URL</dt>
              <dd>
                <a
                  href="https://curriculuminsights.otago.ac.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  curriculuminsights.otago.ac.nz ↗
                </a>
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Full title</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Curriculum Insights Dashboard Reports 2023 and 2024.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">What we use</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Percentage of students meeting / approaching / behind provisional NZ Curriculum benchmarks,
              at Year 3, Year 6, and Year 8. Nationally representative sample, successor to NMSSA (launched 2023).
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Key caveats</h3>
            <ul className="text-sm space-y-1.5 list-disc list-inside">
              <Caveat type="warning">
                Uses % meeting benchmarks — NOT the MS scale score used by NMSSA. These two datasets
                cannot be compared on the same chart.
              </Caveat>
              <Caveat type="warning">
                Year levels changed: NMSSA measured Year 4 + Year 8; Curriculum Insights measures
                Year 3 + Year 6 + Year 8.
              </Caveat>
              <Caveat type="info">
                No statistically significant change was observed between 2023 and 2024 at any year level.
              </Caveat>
              <Caveat type="info">
                Demographic breakdowns (ethnicity, gender) are available in interactive data windows only —
                not included in our database.
              </Caveat>
            </ul>
          </div>

          <a
            href="https://curriculuminsights.otago.ac.nz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all"
          >
            View original source ↗
          </a>
        </section>

        {/* Footer */}
        <footer className="space-y-2 pb-8 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 font-mono">
            All data is publicly sourced from NZ government bodies and international research organisations.
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · data from NZQA 2015–2024 · TIMSS 2023 · NMSSA 2013/2018/2022 · Curriculum Insights 2024
          </p>
        </footer>

      </main>
    </div>
  );
}
