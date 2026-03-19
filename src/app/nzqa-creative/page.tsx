import type { Metadata } from 'next';
import Link from 'next/link';
import { BumpChart, SlopeChart, StreamGraph } from './NzqaCreativeClient';

export const metadata: Metadata = {
  title: 'Creative Views — Mazmatics',
  description: 'Bump chart, slope chart, and stream graph of NZ maths achievement data',
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

export default function NzqaCreativePage() {
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
            ← Back to Mazmatics
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
          <span className="text-xs text-slate-600 font-mono hidden sm:block">Data: NZQA</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* Hero */}
        <header className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono border border-slate-700 text-slate-500">
            Creative Views · NZQA 2015–2024
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
            Creative Views
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Three alternative ways to see NZ maths achievement — rank shifts, decade comparisons, and flowing composition.
          </p>
        </header>

        <SectionDivider />

        {/* Section 1: Bump Chart */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Who rose and who fell?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              This bump chart ranks every NZ region by NCEA achievement rate each year. Lines crossing reveal dramatic reversals — regions that climbed the table and those that slipped. Select a level to see how regional fortunes changed.
            </p>
          </div>
          <BumpChart />
        </section>

        <SectionDivider />

        {/* Section 2: Slope Chart */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>A decade of change, group by group</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Each line connects a group&apos;s 2015 achievement rate (left) to their 2024 rate (right). Lines trending upward show improvement; downward lines show decline. The steepness tells you how much things changed.
            </p>
          </div>
          <SlopeChart />
        </section>

        <SectionDivider />

        {/* Section 3: Stream Graph */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>The rhythm of achievement</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              A stream graph shows how each ethnic group&apos;s achievement rate has flowed over time. The organic, layered shape reveals the shared dip during COVID years and the uneven recovery that followed.
            </p>
          </div>
          <StreamGraph />
        </section>

        <SectionDivider />

        {/* Data notes */}
        <footer className="space-y-2 pb-8">
          <p className="text-xs text-slate-600 font-mono">Source: NZQA Secondary School Statistics 2015–2024. Suppressed cells excluded.</p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · D3.js · data from{' '}
            <span className="text-slate-500">NZQA Secondary School Statistics</span>
          </p>
        </footer>

      </main>
    </div>
  );
}
