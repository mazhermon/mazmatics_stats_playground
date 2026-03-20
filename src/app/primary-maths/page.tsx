import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TIMSSTrendChart,
  TIMSSWorldRanking,
  NMSSAEquityGaps,
  NMSSATrendChart,
  CurriculumInsightsPipeline,
} from './PrimaryMathsClient';
import { PageSourcesFooter } from '@/components/PageSourcesFooter';

export const metadata: Metadata = {
  title: 'NZ Primary Maths Explorer — Mazmatics',
  description: 'How are NZ primary school students doing in maths? TIMSS international rankings, NMSSA equity gaps, and Curriculum Insights — Year 3 to Year 8.',
};

function GradientHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl md:text-4xl font-bold"
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

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </div>
  );
}

function StatCard({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div
      className="bg-slate-900 rounded-xl p-5 relative overflow-hidden"
      style={{
        boxShadow: '#47A5F1 4px 4px 0px 0px, #10b981 -4px -4px 0px 0px',
      }}
    >
      <div
        className="text-3xl font-bold font-mono mb-1"
        style={{
          background: 'linear-gradient(to left, #47A5F1, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </div>
      <div className="text-slate-300 text-sm">{label}</div>
      {note && <div className="text-slate-600 text-xs mt-1 font-mono">{note}</div>}
    </div>
  );
}

function CaveatBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-400 font-mono">
      {children}
    </div>
  );
}

export default function PrimaryMathsPage() {
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2"
          >
            ← Home
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
          <Link
            href="/nzqa-maths"
            className="text-xs text-slate-600 font-mono hidden sm:block hover:text-slate-400 transition-colors"
          >
            Secondary maths →
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* Hero */}
        <header className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono border border-slate-700 text-slate-500">
            NZ Primary & Intermediate School Maths · Year 3–8 · 1995–2024
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{
              background: 'linear-gradient(to left, #47A5F1, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            How are NZ primary school students doing in maths?
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            NZ participates in TIMSS international testing every four years. Domestic sampling
            studies — NMSSA and Curriculum Insights — track equity gaps across year levels.
            The picture is consistent: most primary students are not meeting curriculum expectations.
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <StatCard value="~40th" label="NZ world rank" note="out of 58 countries (TIMSS 2023)" />
            <StatCard value="22%" label="Year 8 students meeting expectations" note="Curriculum Insights 2024" />
            <StatCard value="21 pts" label="decile gap at Year 8" note="≈ 2.5 years of learning" />
            <StatCard value="490" label="NZ TIMSS score 2023" note="vs intl avg 503" />
          </div>
        </header>

        <SectionDivider />

        {/* Section 1: TIMSS Trend */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>NZ maths performance since 1995</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              New Zealand has participated in TIMSS (Trends in International Mathematics and Science Study)
              since 1995, testing Year 5 students every four years. NZ has never reached the international average.
              After declining from 2003 to 2011, scores have stabilised around 487–491 — but the 2023 gender split
              reveals boys gained 17 points since 2019 while girls dropped 5.
            </p>
          </div>
          <TIMSSTrendChart />
          <CaveatBanner>
            TIMSS tests Year 5 students (age ~9) in February each year. International average is recalculated each
            cycle based on participating countries — the 1995 average includes fewer countries.
            AUS/ENG comparison lines are approximate from published TIMSS reports.
          </CaveatBanner>
        </section>

        <SectionDivider />

        {/* Section 2: TIMSS World Ranking */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Where does NZ sit globally?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              In 2023, NZ ranked approximately 40th out of 58 participating countries — below comparable
              English-speaking nations Australia (525), England (552), and the USA (517).
              The gap to Singapore (615) is 125 points — equivalent to roughly 3–4 years of learning.
            </p>
          </div>
          <TIMSSWorldRanking />
        </section>

        <SectionDivider />

        {/* Section 3: NMSSA Equity Gaps */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Who falls behind — and when?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              NMSSA 2022 reveals stark gaps that widen between Year 4 and Year 8. Pacific students
              score 12 MS units below average at Year 4 — equivalent to over 1.5 years behind.
              By Year 8 that gap has held at 14.6 units. The decile gap at Year 8 is 21.4 units,
              equivalent to 2.5 years of learning between students in low and high decile schools.
            </p>
          </div>
          <NMSSAEquityGaps />
          <CaveatBanner>
            MS Scale Score is set so Year 4 = 100 and Year 8 = 100 at the 2013 baseline — the two year
            levels are NOT on the same scale. Each MS unit ≈ 8 weeks of learning. Source: NMSSA 2022
            Report 30, Tables A2.1 and A2.2.
          </CaveatBanner>
        </section>

        <SectionDivider />

        {/* Section 4: NMSSA Trend Chart */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Three cycles of NMSSA — how has achievement shifted?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              NMSSA sampled Year 4 and Year 8 in 2013, 2018, and 2022 using a common MS scale
              (designed so the combined 2013 baseline average ≈ 100). Between 2013 and 2018, Year 8
              achievement rose by 3 MS units — a statistically significant gain. Between 2018 and 2022
              it fell back by 1.3 units. Year 4 scores have remained essentially flat across all three cycles.
            </p>
            <p className="text-slate-400 max-w-2xl leading-relaxed text-sm">
              The 2018→2022 decline at Year 8 is sharpest for girls (−2.8 MS), Māori (−3.3 MS), and Pacific
              students (−4.4 MS) — widening gaps that had narrowed between 2013 and 2018.
            </p>
          </div>
          <NMSSATrendChart />
          <CaveatBanner>
            2013 values are reconstructed on the 2018 MS scale via a linking exercise (NMSSA Report 19,
            Appendix 6). They differ from the original 2013 report figures. CIs for 2013 are approximated
            from 2018 standard errors — treat them as indicative. Source: NMSSA Reports 19 (2018) and 30 (2022).
          </CaveatBanner>
        </section>

        <SectionDivider />

        {/* Section 5: Curriculum Insights Pipeline */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>The primary maths pipeline</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Since 2023, the Curriculum Insights study (successor to NMSSA) measures what proportion of
              students are meeting the new NZ Curriculum provisional benchmarks. At every year level,
              fewer than one in three students are meeting expectations. At Year 8 in 2024, 62% are
              more than a year behind — and these are the students entering secondary school.
            </p>
            <p className="text-slate-400 max-w-2xl leading-relaxed text-sm">
              Connecting to NZQA data: approximately 65% of Year 11 students pass NCEA Level 1 Maths.
              The mismatch suggests significant catch-up happens — or expectations shift — between Year 8
              and secondary school. These two datasets use different scales and cannot be directly compared.
            </p>
          </div>
          <CurriculumInsightsPipeline />
        </section>

        <SectionDivider />

        {/* Cross-link to secondary data */}
        <section className="space-y-4">
          <GradientHeading>See secondary maths →</GradientHeading>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            These primary students go on to sit NCEA. Explore a decade of secondary maths data —
            equity gaps, regional trends, grade distributions, and the impact of the 2024 NCEA reform.
          </p>
          <Link
            href="/nzqa-maths"
            className="inline-block px-6 py-3 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(to right, #47A5F1, #10b981)',
              color: '#020617',
            }}
          >
            NZ Secondary Maths Explorer →
          </Link>
        </section>

        <SectionDivider />

        {/* Data notes footer */}
        <footer className="space-y-2 pb-8">
          <p className="text-xs text-slate-600 font-mono">
            TIMSS data: IEA/TIMSS 2023 International Results report (timss2023.org). NZ Year 5 (Grade 4) scores 1995–2023.{' '}
            <Link href="/data-sources#source-timss" className="text-blue-500/70 hover:text-blue-400 transition-colors">
              About this data ↗
            </Link>
          </p>
          <p className="text-xs text-slate-600 font-mono">
            NMSSA data: National Monitoring Study of Student Achievement — Report 19 (2018) and Report 30 (2022).
            University of Otago / NZCER on behalf of Ministry of Education.
            2013 values reconstructed on the 2018 MS scale via linking exercise (NMSSA Report 19, Appendix 6).
            Sample: ~2,000 students per year level, English-medium state/integrated schools.{' '}
            <Link href="/data-sources#source-nmssa" className="text-blue-500/70 hover:text-blue-400 transition-colors">
              About this data ↗
            </Link>
          </p>
          <p className="text-xs text-slate-600 font-mono">
            Curriculum Insights data: Curriculum Insights Dashboard Report 2023–2024 (curriculuminsights.otago.ac.nz).
            Successor to NMSSA. % meeting provisional NZ Curriculum benchmarks — NOT the same scale as NMSSA MS scores.{' '}
            <Link href="/data-sources#source-curriculum-insights" className="text-blue-500/70 hover:text-blue-400 transition-colors">
              About this data ↗
            </Link>
          </p>
          <p className="text-xs text-slate-600 font-mono">
            No per-school primary data is publicly available in NZ. All data is national sample-level only.
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · D3.js · data from TIMSS 2023 · NMSSA 2013/2018/2022 · Curriculum Insights 2024
          </p>
          <PageSourcesFooter chartPageId="primary-maths" />
        </footer>

      </main>
    </div>
  );
}
