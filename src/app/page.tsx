import Link from 'next/link';
import {
  TIMSSPreview,
  SecondaryMathsPreview,
  LiteracyNumeracyPreview,
  CreativeViewsPreview,
} from './HomeClient';

interface NavCard {
  href: string;
  title: string;
  description: string;
  tag: string;
}

const moreNavCards: NavCard[] = [
  {
    href: '/nzqa-scholarship',
    title: 'NZ Scholarship Explorer',
    description: 'Who earns NZ\'s top academic award? Calculus and Statistics Scholarship rates by ethnicity, equity, and region.',
    tag: 'Scholarship · Calculus · Statistics',
  },
  {
    href: '/nzqa-endorsement',
    title: 'NZ Endorsement Explorer',
    description: 'Beyond the pass — who earns Excellence and Merit? NCEA qualification endorsement rates by ethnicity, equity, gender, and region.',
    tag: 'Excellence · Merit · L1–L3 · UE',
  },
  {
    href: '/nzqa-stories',
    title: 'Data Stories',
    description: 'Waffle grid, beeswarm, and small multiples — humanising student counts at a glance.',
    tag: 'Waffle · Beeswarm · Multiples',
  },
  {
    href: '/nzqa-patterns',
    title: 'Patterns & Trends',
    description: 'Ridgeline plot, horizon chart, and bubble comparison — density, deviation, and population.',
    tag: 'Ridgeline · Horizon · Bubbles',
  },
  {
    href: '/about',
    title: 'About Mazmatics',
    description: 'Who built this, why it exists, and where the data comes from.',
    tag: 'About · Story · Data',
  },
];

interface FeaturedCard {
  href: string;
  title: string;
  description: string;
  tag: string;
  gradient: string;
  chart: React.ReactNode;
}

export default function Home() {
  const featuredCards: FeaturedCard[] = [
    {
      href: '/primary-maths',
      title: 'NZ Primary Maths Explorer',
      description: 'TIMSS international rankings, NMSSA equity gaps, and Curriculum Insights — Year 3 to Year 8.',
      tag: 'TIMSS · NMSSA · Pipeline',
      gradient: 'linear-gradient(to left, #BA90FF, #47A5F1)',
      chart: <TIMSSPreview />,
    },
    {
      href: '/nzqa-maths',
      title: 'NZ Secondary Maths Explorer',
      description: 'Choropleth map, 3D landscape, equity gaps — a decade of NCEA maths data.',
      tag: 'Timeline · Map · 3D',
      gradient: 'linear-gradient(to left, #47A5F1, #2DD4BF)',
      chart: <SecondaryMathsPreview />,
    },
    {
      href: '/nzqa-literacy-numeracy',
      title: 'NZ Literacy & Numeracy Explorer',
      description: 'The floor is falling — 16 years of NCEA co-requisite attainment. Year 11 numeracy dropped from 86% to 56% since the 2020 reforms.',
      tag: 'Literacy · Numeracy · 2009–2024',
      gradient: 'linear-gradient(to left, #2DD4BF, #FB923C)',
      chart: <LiteracyNumeracyPreview />,
    },
    {
      href: '/nzqa-creative',
      title: 'Creative Views',
      description: 'Bump chart, slope chart, and stream graph — rank shifts and trends across regions and ethnicities.',
      tag: 'Bump · Slope · Stream',
      gradient: 'linear-gradient(to left, #FB923C, #E53E3E)',
      chart: <CreativeViewsPreview />,
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 -z-10" />

      {/* Content */}
      <div className="space-y-16 max-w-4xl w-full">

        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mazmatics
            </span>{' '}
            NZ school math stats playground
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
            Explore Aotearoa/NZ school maths stats through interactive visualizations
          </p>
          <p className="text-slate-400">
            How are things changing over time and with different groups? Explore below to find out.
          </p>
        </div>

        {/* Featured Explorations */}
        <section className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Featured Explorations</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featuredCards.map((card) => (
              <a
                key={card.href}
                href={card.href}
                className="group block bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-xl p-5 transition-all hover:bg-slate-800/80 space-y-4"
              >
                {/* Chart preview area */}
                <div className="bg-black/30 rounded-lg overflow-hidden border border-slate-800/60">
                  {card.chart}
                </div>

                {/* Card info */}
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-slate-500 group-hover:text-violet-400 transition-colors">
                    {card.tag}
                  </div>
                  <div
                    className="text-base font-semibold"
                    style={{
                      background: card.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {card.title}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
                </div>

                <div className="text-xs text-violet-400/70 group-hover:text-violet-300 transition-colors font-mono">
                  Explore →
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* More Explorations */}
        <section className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">More Explorations</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moreNavCards.map((card) => (
              <a
                key={card.href}
                href={card.href}
                className="group block bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-xl p-5 transition-all hover:bg-slate-800/80"
              >
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-500 group-hover:text-violet-400 transition-colors">
                    {card.tag}
                  </div>
                  <div
                    className="text-base font-semibold"
                    style={{
                      background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {card.title}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center space-y-1 pt-4">
          <p className="text-sm text-slate-500">
            Built with Next.js 15, React 19, Three.js, and D3 · Data: NZQA 2015–2024
          </p>
          <p className="text-sm text-slate-600">
            All data is publicly sourced.{' '}
            <Link href="/data-sources" className="text-slate-500 hover:text-slate-300 underline transition-colors">
              View data sources →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
