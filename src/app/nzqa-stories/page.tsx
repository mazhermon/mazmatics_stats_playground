import type { Metadata } from 'next';
import Link from 'next/link';
import { WaffleGrid, BeeswarmChart, SmallMultiplesChart } from './NzqaStoriesClient';

export const metadata: Metadata = {
  title: 'Data Stories — Mazmatics',
  description: 'Waffle grid, beeswarm, and small multiples of NZ maths achievement data',
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

export default function NzqaStoriesPage() {
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
            Data Stories · NZQA 2015–2024
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
            Data Stories
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Making the numbers human — counting students, not percentages, and putting each region on the same scale.
          </p>
        </header>

        <SectionDivider />

        {/* Section 1: Waffle */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>In every 100 students…</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Each square represents one student in a class of 100. Filled squares achieved NCEA maths.
              This waffle chart makes the gaps immediate — select a year or level to see how the picture changes.
            </p>
          </div>
          <WaffleGrid />
        </section>

        <SectionDivider />

        {/* Section 2: Beeswarm */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Where every region stands</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Every dot is a NZ region, positioned by its achievement rate. Dot size reflects the student
              population. Hover a dot to identify the region and its exact rate.
            </p>
          </div>
          <BeeswarmChart />
        </section>

        <SectionDivider />

        {/* Section 3: Small Multiples */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Same scale, different stories</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Small multiples enforce an honest comparison — every chart uses the same y-axis, so steeper
              rises and higher plateaus are genuine differences, not axis tricks.
            </p>
          </div>
          <SmallMultiplesChart />
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
