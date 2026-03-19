# Task: Phase 17 — Beta Banner + Corner Badge

## Context

The Mazmatics Stats site is in early beta. We need a persistent disclaimer banner across every page and a small corner badge to communicate this clearly to visitors. This is a purely UI task — no data changes, no API changes.

Read `brand.md` and `CLAUDE.md` before writing any code. The Mazmatics gradient is `linear-gradient(to left, #BA90FF, #47A5F1)`. Dark mode is default. NZ English throughout. Tone: warm, honest, conversational — not clinical.

---

## What to Build

### 1. `src/components/layout/BetaBanner.tsx` — Server Component

A full-width horizontal strip that sits **above all page content** on every page.

**Design spec:**
- Full-width, no horizontal padding gaps
- Background: `bg-amber-950/60` with a bottom border `border-b border-amber-800/40` — warm dark amber tint, not garish
- Left accent: a 3px left border strip using the Mazmatics yellow `#FFF73E` to draw the eye
- Icon: small inline SVG warning triangle (Lucide-style, 16×16) in `#FFF73E`
- Text: NZ English, warm and honest, e.g.:
  > "Early beta — we're still checking the data and finding the best ways to show it. Take everything as a useful starting point, not the final word."
- Text colour: `text-amber-100` for body, `text-[#FFF73E]` for "Early beta" label
- Compact height — single line on desktop (around 40–44px), wraps gracefully on mobile
- `font-mono` for "Early beta" label (uses Geist Mono, consistent with data labels elsewhere)
- No close/dismiss button — this is a persistent disclaimer
- Fully accessible: `role="banner"` or wrap in `<aside>` with `aria-label="Beta notice"`

### 2. `src/components/layout/BetaBadge.tsx` — Server Component

A small fixed-position corner ribbon/badge in the **top-right corner** of every page.

**Design spec:**
- Fixed position: `fixed top-0 right-0 z-50`
- CSS ribbon triangle effect: a rotated `<div>` with overflow hidden parent creating a corner triangle
- Dimensions: ~80×80px parent clip, ~120px rotated inner div
- Background: Mazmatics gradient (`linear-gradient(to left, #BA90FF, #47A5F1)`)
- Text: `"BETA"` — uppercase, `font-mono`, small (10–11px), white, bold, rotated 45°
- `aria-hidden="true"` — decorative only, the banner provides the accessible notice
- `pointer-events-none` so it doesn't block clicks

### 3. Update `src/app/layout.tsx`

Add both components into the root layout so they appear on every page:

```tsx
import { BetaBanner } from '@/components/layout/BetaBanner';
import { BetaBadge } from '@/components/layout/BetaBadge';

// Inside <body>:
<BetaBanner />
<BetaBadge />
{children}
```

---

## Acceptance Criteria

- [ ] Banner appears on every page (home, /nzqa-maths, /primary-maths, /nzqa-scholarship, /about, /data-sources)
- [ ] Badge appears in top-right corner on every page
- [ ] Both are Server Components (no 'use client')
- [ ] No layout shift — banner is in normal document flow
- [ ] `prefers-reduced-motion` respected (no animations needed here anyway)
- [ ] WCAG AA contrast on banner text
- [ ] Banner wraps cleanly on mobile (375px)
- [ ] Badge does not obscure interactive elements
- [ ] `tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] e2e smoke test: add 2 tests to a new `e2e/beta-banner.spec.ts`:
  - Banner text is visible on home page
  - Badge is present in DOM on home page

## Completion Promise

When all acceptance criteria are met, output the exact text:

<promise>BETA_BANNER_COMPLETE</promise>
