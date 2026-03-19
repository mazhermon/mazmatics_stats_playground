/**
 * BetaBadge — decorative corner ribbon in the top-right of every page.
 * Server Component — purely decorative, aria-hidden.
 */
export function BetaBadge() {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none z-50"
    >
      <div
        className="absolute top-3 -right-6 w-28 py-1.5 text-center font-mono font-bold text-white text-[10px] tracking-widest uppercase rotate-45"
        style={{
          background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
        }}
      >
        beta
      </div>
    </div>
  );
}
