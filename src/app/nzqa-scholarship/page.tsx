import type { Metadata } from 'next';
import Link from 'next/link';
import { ScholarshipTrendChart, ScholarshipBreakdownChart } from './NzqaScholarshipClient';

export const metadata: Metadata = {
  title: 'NZ Scholarship Maths Explorer — Mazmatics',
  description: 'Who earns NZ\'s top academic award? Explore Calculus and Statistics Scholarship data by ethnicity, equity, and region — 2015–2024.',
};

function GradientHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-3xl md:text-4xl font-bold"
      style={{
        background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
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
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </div>
  );
}

function StatCard({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div
      className="bg-slate-900 rounded-xl p-5 relative overflow-hidden"
      style={{
        boxShadow: '#BA90FF 4px 4px 0px 0px, #47A5F1 -4px -4px 0px 0px',
      }}
    >
      <div
        className="text-3xl font-bold font-mono mb-1"
        style={{
          background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
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

export default function NzqaScholarshipPage() {
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundColor: '#020617',
        backgroundImage: `
          linear-gradient(rgba(186,144,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(186,144,255,0.04) 1px, transparent 1px)
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
              background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mazmatics
          </span>
          <span className="text-xs text-slate-600 font-mono hidden sm:block">NZQA · 2015–2024</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* Hero */}
        <header className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono border border-slate-700 text-slate-500">
            NZQA Scholarship · Calculus &amp; Statistics · 2015–2024
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{
              background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            NZ&rsquo;s top academic award — who earns it?
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Scholarship is awarded to the highest-performing students in NZ — sitting above NCEA,
            with roughly 1 in 4 Calculus candidates earning any award.
            The gaps by ethnicity and school equity tell a stark story about
            who gets to the top of the academic pipeline.
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <StatCard value="~25%" label="Calculus award rate" note="2024 national" />
            <StatCard value="~40%" label="Statistics award rate" note="2024 national" />
            <StatCard value="10 yrs" label="of Scholarship data" note="2015–2024" />
            <StatCard value="2" label="maths subjects" note="Calculus · Statistics" />
          </div>
        </header>

        <SectionDivider />

        {/* Section 1: Trend over time */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Award rates over time</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              The national picture: how has the split between Outstanding awards, Scholarship awards,
              and No Award shifted from 2015 to 2024? Switch to Ethnicity or Gender view to see
              how different groups trend over the decade.
            </p>
          </div>
          <ScholarshipTrendChart />
        </section>

        <SectionDivider />

        {/* Section 2: Breakdown by group */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Who earns the award?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Each bar shows the award breakdown for a group in a given year — Outstanding (gold),
              Scholarship (blue), and No Award (dark). Sorted by award rate.
              Switch between Ethnicity, Equity, Gender, and Region breakdowns.
            </p>
          </div>
          <ScholarshipBreakdownChart />
          <p className="text-xs text-slate-600 font-mono">
            Equity group data available 2019–2024 only. Small group counts (n&lt;20) may be suppressed or unreliable.
          </p>
        </section>

        <SectionDivider />

        {/* Data notes */}
        <footer className="space-y-2 pb-8">
          <p className="text-xs text-slate-600 font-mono">
            Source: NZQA Scholarship Attainment Statistics. Each breakdown is single-dimensional — no cross-tabulation.
          </p>
          <p className="text-xs text-slate-600 font-mono">
            Scholarship is a separate qualification from NCEA — only top-year (Year 13) students typically sit it.
            Award rate = Outstanding + Scholarship (both are passing awards). No Award = attempted but did not earn a Scholarship award.
          </p>
          <p className="text-xs text-slate-600 font-mono">
            Source: NZQA Secondary School Statistics 2015–2024.{' '}
            <Link href="/data-sources#source-nzqa" className="text-blue-500/70 hover:text-blue-400 transition-colors">
              About this data ↗
            </Link>
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · D3.js · data from{' '}
            <span className="text-slate-500">NZQA Secondary School Statistics</span>
          </p>
          <div className="pt-4 flex gap-4">
            <Link href="/nzqa-maths" className="text-xs text-violet-500 hover:text-violet-400 transition-colors">
              ← NZQA Maths Explorer (NCEA)
            </Link>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              All explorers →
            </Link>
          </div>
          <p className="text-xs text-slate-700 font-mono">
            <Link href="/data-sources" className="text-slate-600 hover:text-slate-400 transition-colors">
              Data sources &amp; methodology →
            </Link>
          </p>
        </footer>

      </main>
    </div>
  );
}
