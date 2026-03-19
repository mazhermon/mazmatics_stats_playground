import type { Metadata } from 'next';
import Link from 'next/link';
import { LiteracyNumeracyTrendChart, LiteracyNumeracyBreakdownChart } from './NzqaLiteracyNumeracyClient';

export const metadata: Metadata = {
  title: 'NZ Literacy & Numeracy Co-requisite Explorer — Mazmatics',
  description: 'The floor is falling — explore 16 years of NCEA literacy and numeracy co-requisite attainment by ethnicity, equity, and gender. 2009–2024.',
};

function GradientHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl md:text-4xl font-bold"
      style={{
        background: 'linear-gradient(to left, #2DD4BF, #FB923C)',
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

function StatCard({ value, label, note, accent }: { value: string; label: string; note?: string; accent?: string }) {
  const gradient = accent ?? 'linear-gradient(to left, #2DD4BF, #FB923C)';
  return (
    <div
      className="bg-slate-900 rounded-xl p-5 relative overflow-hidden"
      style={{
        boxShadow: '#2DD4BF 4px 4px 0px 0px, #FB923C -4px -4px 0px 0px',
      }}
    >
      <div
        className="text-3xl font-bold font-mono mb-1"
        style={{
          background: gradient,
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

export default function NzqaLiteracyNumeracyPage() {
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundColor: '#020617',
        backgroundImage: `
          linear-gradient(rgba(45,212,191,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(251,146,60,0.03) 1px, transparent 1px)
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
            ← Back to home
          </Link>
          <span
            className="text-sm font-semibold"
            style={{
              background: 'linear-gradient(to left, #2DD4BF, #FB923C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mazmatics
          </span>
          <span className="text-xs text-slate-600 font-mono hidden sm:block">NZQA · 2009–2024</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* Hero */}
        <header className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono border border-slate-700 text-slate-500">
            NZQA Literacy &amp; Numeracy Co-requisites · 2009–2024 · 16 years
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{
              background: 'linear-gradient(to left, #2DD4BF, #FB923C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The floor is falling
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            To earn any NCEA qualification, students must first pass separate literacy and numeracy
            co-requisite standards. In 2009, 9 in 10 Year 11 students passed in their first year.
            By 2024 — after the 2020 curriculum reforms replaced the old standards with harder ones —
            fewer than 6 in 10 pass numeracy in Year 11. Who&rsquo;s being left behind?
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <StatCard
              value="56%"
              label="Year 11 numeracy (2024)"
              note="current-year pass rate"
              accent="linear-gradient(to left, #FB923C, #ef4444)"
            />
            <StatCard
              value="86%"
              label="Year 11 numeracy (2015)"
              note="before co-req reforms"
              accent="linear-gradient(to left, #2DD4BF, #3b82f6)"
            />
            <StatCard
              value="16 yrs"
              label="longest time series"
              note="2009–2024"
            />
            <StatCard
              value="92%"
              label="Year 13 cumulative (2024)"
              note="most catch up by Year 13"
            />
          </div>
        </header>

        <SectionDivider />

        {/* Section 1: Trend */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>16 years of literacy &amp; numeracy</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              The national trend, 2009–2024. <strong className="text-slate-300">Current year</strong> shows
              first-time passers each year — this is where the 2024 reform impact is most visible.{' '}
              <strong className="text-slate-300">Cumulative</strong> shows how many have ever passed by that
              year level, including re-sits. Switch year levels to see how students catch up over time,
              or switch to Ethnicity or Gender view for group comparisons.
            </p>
          </div>
          <LiteracyNumeracyTrendChart />
        </section>

        <SectionDivider />

        {/* Section 2: Breakdown */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Who is being left behind?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              For a selected year and group breakdown, how does the pass rate vary? The equity story
              here is stark — low-decile and &ldquo;fewer resources&rdquo; schools consistently show
              much lower current-year pass rates, meaning more students must spend Years 12 and 13
              catching up on the co-requisite instead of advancing.
            </p>
          </div>
          <LiteracyNumeracyBreakdownChart />
          <p className="text-xs text-slate-600 font-mono">
            Equity group format changed in 2019: pre-2019 uses school decile bands (1–3, 4–7, 8–10); 2019+ uses equity index groups (Fewer/Moderate/More resources).
            Each breakdown is single-dimensional — no cross-tabulation.
          </p>
        </section>

        <SectionDivider />

        {/* Data notes */}
        <footer className="space-y-2 pb-8">
          <p className="text-xs text-slate-600 font-mono">
            Source: NZQA Literacy and Numeracy Co-requisite Attainment Statistics. Data covers all Year 11–13 students nationally.
          </p>
          <p className="text-xs text-slate-600 font-mono">
            Co-requisites are mandatory standalone standards (not part of subject NCEA). From 2020, NZ replaced the old Unit Standard literacy/numeracy with new, harder &ldquo;Common Assessment Activities&rdquo; (CAAs). The sharp current-year drop reflects this transition, particularly visible from 2020–2024.
          </p>
          <p className="text-xs text-slate-600 font-mono">
            <strong className="text-slate-500">Current year rate</strong> = students passing for the first time in that year level.{' '}
            <strong className="text-slate-500">Cumulative rate</strong> = students who have ever passed by the end of that year level (includes prior years and re-sits).
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · D3.js · data from{' '}
            <span className="text-slate-500">NZQA Secondary School Statistics</span>
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link href="/nzqa-maths" className="text-xs text-teal-500 hover:text-teal-400 transition-colors">
              ← NZQA Maths Explorer (NCEA)
            </Link>
            <Link href="/nzqa-endorsement" className="text-xs text-teal-500 hover:text-teal-400 transition-colors">
              Endorsement Explorer →
            </Link>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              All explorers →
            </Link>
          </div>
        </footer>

      </main>
    </div>
  );
}
