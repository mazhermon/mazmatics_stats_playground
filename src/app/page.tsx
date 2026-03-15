export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 -z-10" />

      {/* Content */}
      <div className="text-center space-y-8 max-w-2xl">
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

        {/* Description */}
        <p className="text-base md:text-lg text-slate-400 leading-relaxed">
          A playground for discovering the beauty of data, statistics, and mathematical concepts through dynamic, interactive visual experiments.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a href="/nzqa-maths" className="px-8 py-3 rounded-lg font-semibold transition-all text-center"
            style={{ background: 'linear-gradient(to left, #BA90FF, #47A5F1)', color: '#0f172a' }}>
            NZ Maths Achievement Explorer
          </a>
          <button className="px-8 py-3 border border-slate-500 hover:border-slate-300 rounded-lg font-semibold transition-colors text-slate-300 hover:text-white">
            More coming soon
          </button>
        </div>

        {/* Footer note */}
        <p className="text-sm text-slate-500 pt-8">
          Built with Next.js 15, React 19, Three.js, and D3
        </p>
      </div>
    </main>
  );
}
