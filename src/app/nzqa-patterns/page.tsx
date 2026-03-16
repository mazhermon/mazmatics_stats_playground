import type { Metadata } from 'next';
import Link from 'next/link';
import { RidgelinePlot, HorizonChart, BubbleComparison } from './NzqaPatternsClient';

export const metadata: Metadata = {
  title: 'Patterns & Trends — Mazmatics',
  description: 'Ridgeline plot, horizon chart, and bubble comparison of NZ maths achievement data',
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

export default function NzqaPatternsPage() {
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
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
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
            Patterns & Trends · NZQA 2015–2024
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
            Patterns & Trends
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Density curves, compact region strips, and population-weighted bubbles — three analytical perspectives on a decade of data.
          </p>
        </header>

        <SectionDivider />

        {/* Section 1: Ridgeline */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>The distribution of a decade</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Each ridge shows the spread of achievement rates across years for one ethnic group. A narrow, high ridge means consistent achievement; a wide ridge means volatile year-to-year swings. Curves shifted right indicate improvement over the decade.
            </p>
          </div>
          <RidgelinePlot />
        </section>

        <SectionDivider />

        {/* Section 2: Horizon Chart */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>All regions, one compact view</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              The horizon chart packs all NZ regions into a single panel. Each row shows how a region&apos;s achievement rate has moved above (teal) or below (coral) the national average. Darker shades = greater deviation.
            </p>
          </div>
          <HorizonChart />
        </section>

        <SectionDivider />

        {/* Section 3: Bubble Comparison */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Population meets performance</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Bubble size = number of students assessed; colour = achievement rate (red → green). This view shows that the highest-achieving regions are not always the largest — and vice versa. Select a year to watch the bubbles shift.
            </p>
          </div>
          <BubbleComparison />
        </section>

        <SectionDivider />

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
