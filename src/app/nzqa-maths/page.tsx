import type { Metadata } from 'next';
import Link from 'next/link';
import { strings } from '@/lib/nzqa-strings';
import {
  TimelineExplorer,
  EquityGapVisualizer,
  RegionalMap,
  AchievementLandscape,
  ComparisonDashboard,
  GradeStackChart,
  DeltaChart,
} from './NzqaMathsClient';

export const metadata: Metadata = {
  title: 'NZ Maths Achievement Explorer — Mazmatics',
  description: 'Interactive exploration of NCEA mathematics achievement data 2015–2024',
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

export default function NzqaMathsPage() {
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
            ← {strings.nav.backToHome}
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
          <span className="text-xs text-slate-600 font-mono hidden sm:block">{strings.nav.dataSource}</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* Hero */}
        <header className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono border border-slate-700 text-slate-500">
            NZQA Secondary School Statistics · 2015–2024
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
            {strings.page.title}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            {strings.page.subtitle}
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <StatCard value="10 yrs" label="of NCEA maths data" note="2015–2024" />
            <StatCard value="16" label="NZ regions mapped" note="Click to explore" />
            <StatCard value="5" label="ethnic groups tracked" note="Māori, Pacific, Asian…" />
            <StatCard value="3" label="NCEA levels" note="L1 · L2 · L3" />
          </div>
        </header>

        <SectionDivider />

        {/* Section 1: Timeline */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>{strings.sections.timeline.heading}</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              {strings.sections.timeline.narrative}
            </p>
          </div>
          <TimelineExplorer />
        </section>

        <SectionDivider />

        {/* Section 1b: Grade distribution over time */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Where do students land?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Each band shows the share of students landing in that grade tier each year.
              Watch how COVID leniency (2020) temporarily collapsed the &ldquo;Not Achieved&rdquo; band,
              and how the 2024 NCEA reform sent it sharply upward. Switch group to compare
              how different communities experience these shifts.
            </p>
          </div>
          <GradeStackChart />
        </section>

        <SectionDivider />

        {/* Section 1c: Year-on-year change */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Year-on-year change</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              How much did the fail rate move each year compared to the one before?
              The 2020 COVID leniency produced one of the largest single-year improvements on record,
              while 2024&rsquo;s NCEA reform reversed that — with some groups hit far harder than others.
            </p>
          </div>
          <DeltaChart />
        </section>

        <SectionDivider />

        {/* Section 2: Equity gaps */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>{strings.sections.equity.heading}</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              {strings.sections.equity.narrative}
            </p>
          </div>
          <EquityGapVisualizer />
        </section>

        <SectionDivider />

        {/* Section 3: Regional map */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>{strings.sections.map.heading}</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              {strings.sections.map.narrative}
            </p>
          </div>
          <RegionalMap />
        </section>

        <SectionDivider />

        {/* Section 4: 3D landscape */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>{strings.sections.landscape.heading}</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              {strings.sections.landscape.narrative}
            </p>
          </div>
          <AchievementLandscape />
        </section>

        <SectionDivider />

        {/* Section 5: Comparison dashboard */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>{strings.sections.comparison.heading}</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              {strings.sections.comparison.narrative}
            </p>
          </div>
          <ComparisonDashboard />
        </section>

        <SectionDivider />

        {/* Data notes */}
        <footer className="space-y-2 pb-8">
          <p className="text-xs text-slate-600 font-mono">{strings.dataNote}</p>
          <p className="text-xs text-slate-600 font-mono">{strings.decileNote}</p>
          <p className="text-xs text-slate-600 font-mono">
            Source: NZQA Secondary School Statistics 2015–2024.{' '}
            <Link href="/data-sources#source-nzqa" className="text-blue-500/70 hover:text-blue-400 transition-colors">
              About this data ↗
            </Link>
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · D3.js · Three.js · React Three Fiber · data from{' '}
            <span className="text-slate-500">NZQA Secondary School Statistics</span>
          </p>
          <p className="text-xs text-slate-700 font-mono pt-2">
            <Link href="/data-sources" className="text-slate-600 hover:text-slate-400 transition-colors">
              Data sources &amp; methodology →
            </Link>
          </p>
        </footer>

      </main>
    </div>
  );
}
