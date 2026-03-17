interface NavCard {
  href: string;
  title: string;
  description: string;
  tag: string;
}

const navCards: NavCard[] = [
  {
    href: '/primary-maths',
    title: 'NZ Primary Maths Explorer',
    description: 'TIMSS international rankings, NMSSA equity gaps, and Curriculum Insights — Year 3 to Year 8.',
    tag: 'TIMSS · NMSSA · Pipeline',
  },
  {
    href: '/nzqa-maths',
    title: 'NZ Secondary Maths Explorer',
    description: 'Choropleth map, 3D landscape, equity gaps — a decade of NCEA maths data.',
    tag: 'Timeline · Map · 3D',
  },
  {
    href: '/nzqa-scholarship',
    title: 'NZ Scholarship Explorer',
    description: 'Who earns NZ\'s top academic award? Calculus and Statistics Scholarship rates by ethnicity, equity, and region.',
    tag: 'Scholarship · Calculus · Statistics',
  },
  {
    href: '/nzqa-creative',
    title: 'Creative Views',
    description: 'Bump chart, slope chart, and stream graph — rank shifts and trends across regions and ethnicities.',
    tag: 'Bump · Slope · Stream',
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
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 -z-10" />

      {/* Content */}
      <div className="text-center space-y-8 max-w-3xl w-full">
        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mazmatics
            </span>{" "}
            math stats playground
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
          Explore mathematics through interactive visualizations
        </p>

        {/* Nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
          {navCards.map((card) => (
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

        {/* Footer note */}
        <p className="text-sm text-slate-500 pt-4">
          Built with Next.js 15, React 19, Three.js, and D3 · Data: NZQA 2015–2024
        </p>
      </div>
    </main>
  );
}
