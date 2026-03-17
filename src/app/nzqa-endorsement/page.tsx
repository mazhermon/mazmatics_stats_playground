import type { Metadata } from 'next';
import Link from 'next/link';
import { EndorsementTrendChart, EndorsementBreakdownChart } from './NzqaEndorsementClient';

export const metadata: Metadata = {
  title: 'NZ Qualification Endorsement Explorer — Mazmatics',
  description: 'Who earns Excellence and Merit endorsement on NCEA qualifications? Explore endorsement rates by ethnicity, equity, and gender — 2015–2024.',
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

export default function NzqaEndorsementPage() {
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
            NZQA Endorsement · NCEA Level 1–3 &amp; University Entrance · 2015–2024
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
            Beyond the pass — who earns Excellence?
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Endorsement is the quality signal within NCEA — passed is not enough, it&rsquo;s about{' '}
            <em>how well</em>. Merit and Excellence endorsements reveal the performance gap beneath
            the headline pass rate, and the story by ethnicity and school equity is striking.
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <StatCard value="~50%" label="NCEA L3 endorsed" note="2024 Year 13 cohort" />
            <StatCard value="~15%" label="Excellence rate (L3)" note="2024 national" />
            <StatCard value="10 yrs" label="of endorsement data" note="2015–2024" />
            <StatCard value="4" label="qualifications tracked" note="L1 · L2 · L3 · UE" />
          </div>
        </header>

        <SectionDivider />

        {/* Section 1: Trend over time */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Endorsement rates over time</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Of students who achieved the qualification, how many earned Excellence (gold), Merit (purple),
              or No Endorsement (dark)? Select a qualification level and switch to Ethnicity or Gender view
              to see how different groups trend across the decade.
            </p>
          </div>
          <EndorsementTrendChart />
        </section>

        <SectionDivider />

        {/* Section 2: Breakdown by group */}
        <section className="space-y-6">
          <div className="space-y-3">
            <GradientHeading>Who earns endorsement?</GradientHeading>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Each bar shows the endorsement breakdown for a group in a selected year — Excellence (gold),
              Merit (purple), and No Endorsement (dark). Sorted by endorsed rate.
              Switch between Ethnicity, Equity, Gender, and Region breakdowns.
            </p>
          </div>
          <EndorsementBreakdownChart />
          <p className="text-xs text-slate-600 font-mono">
            Equity group data available 2019–2024 only. Rates are among students who achieved the qualification — endorsement is separate from attainment.
          </p>
        </section>

        <SectionDivider />

        {/* Data notes */}
        <footer className="space-y-2 pb-8">
          <p className="text-xs text-slate-600 font-mono">
            Source: NZQA Qualification Endorsement Statistics. Each breakdown is single-dimensional — no cross-tabulation.
          </p>
          <p className="text-xs text-slate-600 font-mono">
            Endorsement is awarded when a student achieves enough Excellence or Merit credits in a single year
            (Excellence: 50+ credits at Excellence; Merit: 50+ credits at Merit or above). Rates shown are among
            those who attained the qualification, not the full enrolled cohort. Data filtered to primary year level per qualification (L1=Yr11, L2=Yr12, L3/UE=Yr13).
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with Next.js · D3.js · data from{' '}
            <span className="text-slate-500">NZQA Secondary School Statistics</span>
          </p>
          <div className="pt-4 flex gap-4">
            <Link href="/nzqa-maths" className="text-xs text-violet-500 hover:text-violet-400 transition-colors">
              ← NZQA Maths Explorer (NCEA)
            </Link>
            <Link href="/nzqa-scholarship" className="text-xs text-violet-500 hover:text-violet-400 transition-colors">
              NZQA Scholarship Explorer →
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
