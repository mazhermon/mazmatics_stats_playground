/**
 * BetaBanner — persistent site-wide early beta disclaimer.
 * Server Component — no interactivity needed.
 */
export function BetaBanner() {
  return (
    <aside
      aria-label="Beta notice"
      className="sticky top-0 z-40 w-full bg-amber-950/80 backdrop-blur-sm border-b border-amber-800/40"
      style={{ borderLeft: '3px solid #FFF73E' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-start gap-2.5 sm:items-center">
        {/* Warning triangle */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFF73E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 mt-0.5 sm:mt-0"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        <p className="text-sm text-amber-100 leading-snug">
          <span className="font-mono font-semibold text-[#FFF73E] mr-1.5">
            Early beta
          </span>
          — we&apos;re still checking the data and finding the best ways to show it.
          Take everything as a useful starting point, not the final word.
        </p>
      </div>
    </aside>
  );
}
