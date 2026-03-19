/**
 * GenderNote — small disclaimer shown on any chart filtered to gender view.
 * Acknowledges that the data only records a binary gender split.
 */
export function GenderNote() {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 leading-snug">
      {/* Rainbow arc icon */}
      <svg
        width="14"
        height="9"
        viewBox="0 0 14 9"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M1 8C1 4.68629 3.68629 2 7 2C10.3137 2 13 4.68629 13 8" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2.5 8C2.5 5.51472 4.51472 3.5 7 3.5C9.48528 3.5 11.5 5.51472 11.5 8" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 8C4 6.34315 5.34315 5 7 5C8.65685 5 10 6.34315 10 8" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5.5 8C5.5 7.17157 6.17157 6.5 7 6.5C7.82843 6.5 8.5 7.17157 8.5 8" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Mazmatics acknowledges the infinite gender spectrum — this data records boys and girls only.
    </p>
  );
}
