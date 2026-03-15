# Mazmatics Brand Guide — Data Site Context

> This file provides brand context for Claude when building the Mazmatics Stats data visualisation site.
> Read this alongside CLAUDE.md and plan.md before writing any UI code.

## About Mazmatics

Mazmatics is a New Zealand-based project created by Maz Hermon (web developer, parent of two). It began as a maths activity book for kids ("Fun Math 4 Kids, Volume 1") and is expanding into a data visualisation platform exploring NZ maths achievement statistics.

### Mission
Help kids develop a positive relationship with mathematics. The tagline energy is: **"Help your kids to say 'I like maths.'"** The book is "designed for home play, not homework" — maths should be enjoyable, low-pressure, and part of everyday life.

### Core Values
- **Fun first** — Learning happens best when kids are engaged and enjoying themselves
- **Inclusion** — No child should feel excluded from mathematics at a young age
- **Growth mindset** — Struggle is part of learning; it's healthy and productive
- **Interleaved learning** — Mix topics and approaches rather than drilling one thing
- **Challenge** — Kids benefit from being gently stretched beyond comfort
- **Practice** — Maths, like music or sport, improves with consistent practice
- **Away from screens** — The book is deliberately paper-based (though the data site is obviously digital)

### The Book
- Activity and story book combining maths exercises with drawing, storytelling, and code-breaking
- Features a fantasy narrative ("Lindy's Quest") with illustrated characters
- Black-and-white interior pages that kids draw on, colour, and mark up directly
- Deliberately has no answer pages — kids need to work things through
- Includes dice, games, humour (poop emoji maths, evil tacos, silly jokes)
- Target: ages 6+, purchased by parents/whānau/educators

## Audience for the Data Site

**Primary audience: Parents and educators in New Zealand** who want to understand maths achievement trends, equity gaps, and how their region/school type compares nationally.

**Secondary audience: Older students and data-curious people** who might find the interactive visualisations engaging.

This is NOT a children's site, but it should retain the Mazmatics warmth and accessibility. Language should be simple, clear, and correct — never condescending, never jargon-heavy.

## Tone of Voice

### Do
- Write conversationally, the way people actually speak in NZ
- Use NZ English spelling (colour, recognise, maths not math)
- Be warm, encouraging, and clear
- Use plain language to explain statistical concepts
- Be honest about what the data shows, including uncomfortable truths about inequity
- Use humour where appropriate (but this is serious data — lighter touch than the book)
- Acknowledge the real impact on real kids and communities

### Don't
- Use academic jargon or statistical terminology without explanation
- Be preachy or moralising about the data
- Be dry or clinical — this should feel like a conversation, not a government report
- Use overly childish language (this audience is adults)
- Shy away from showing inequity clearly — making it visible is the whole point

### Future: Te Reo Māori
The site should be architected for full translation into te reo Māori in future. This means:
- All user-facing strings should be externalisable (no hardcoded English in components)
- Use a simple i18n approach (e.g. key-value JSON files per locale)
- Consider Māori data sovereignty principles when presenting ethnicity data
- Use macrons correctly in all Māori words (Māori, whānau, Tāmaki Makaurau, etc.)
- Place names should use te reo where commonly used (e.g. Tāmaki Makaurau / Auckland)

## Visual Identity

### Overall Feel
The Mazmatics book site (mazmatics.com) is **playful, warm, illustrated, and child-friendly** — white background with a graph-paper grid pattern, bold purple branding, hand-drawn character illustrations, and bright yellow call-to-action sections. The data site needs to **evolve this into something more mature** while keeping the DNA:

- **Approachable but credible** — data journalism meets friendly design
- **Warm, not corporate** — this isn't a government dashboard
- **Clear and readable** — data must be the hero, not decoration
- **Dark mode primary** (established in the existing Next.js app) but with warmth — not cold/techy dark

### Exact Brand Colours (extracted from mazmatics.com)

```
Mazmatics Purple (logo/primary):  #8C5FD5  rgb(140, 95, 213)
Light Purple (accent/buttons):    #BA90FF  rgb(186, 144, 255)
Sky Blue (gradient end):          #47A5F1  rgb(71, 165, 241)
Bright Yellow (CTA sections):     #FFF73E  rgb(255, 247, 62)
Dark Charcoal (body text):        #3A3A39  rgb(58, 58, 57)
White (page background):          #FFFFFF  rgb(255, 255, 255)
```

**The Mazmatics Gradient** (used on nav bar, buttons, and section headings with `background-clip: text`):
```css
background: linear-gradient(to left, #BA90FF, #47A5F1);
/* Purple-to-blue — this is THE signature Mazmatics visual element */
/* Sometimes reversed to blue-to-purple for section headings */
```

**Decorative box-shadows** (used on images/cards for a playful offset block effect):
```css
box-shadow: #BA90FF 16px 16px 0px 0px, #47A5F1 -16px -16px 0px 0px;
/* Purple block bottom-right, blue block top-left — stacked colour blocks */
```

### Colour Direction for the Data Site

The data site runs in dark mode. Adapt the brand colours:

**Primary palette (dark mode):**
- Background: Deep slate/charcoal (not pure black — warmer, e.g. `slate-950` or `zinc-950`)
- Text: Off-white (`slate-100` or `zinc-100`) for body, white for headings
- Accent gradient: Use the Mazmatics gradient (`#47A5F1` → `#BA90FF`) for the site header/nav, branding elements, and section headings (via `background-clip: text`)
- Primary interactive colour: `#BA90FF` (Light Purple) for buttons, active states, hover accents
- Secondary interactive colour: `#47A5F1` (Sky Blue) for links, secondary actions

**Data visualisation palette:**
- Do NOT use the brand purple/blue gradient for encoding data — reserve it for branding only
- Use a carefully chosen categorical palette for ethnicity data that is:
  - Distinguishable for colour-blind users (test with a simulator)
  - Culturally respectful (avoid assigning "cold" or "negative" colours to any ethnic group)
  - Vibrant enough to pop on dark backgrounds
- Suggested starting point: a warm sequential palette for single-metric charts, a diverging palette for equity gap visualisations
- Use consistent colour assignments throughout — once a colour represents an ethnic group or region, it stays the same everywhere

**Semantic colours:**
- Success/positive: Warm green (not neon)
- Warning/attention: `#FFF73E` (the Mazmatics yellow) or amber/gold
- Negative/decline: Soft red/coral (not alarming — this is data, not an emergency)
- Neutral: Slate greys

### Typography

**On mazmatics.com:**
- **Display/Logo font:** `Bungee Shade` — chunky, 3D, retro-playful. Used ONLY for the "MAZMATICS" wordmark at 88px
- **Body/UI font:** `Outfit` — clean, geometric, modern sans-serif. Used for all headings (h2 at ~51px) and body text

**On the data site (already configured in layout.tsx):**
- **Geist Sans** — clean, modern, excellent readability. Use for all body text and headings
- **Geist Mono** — for data labels, axis ticks, statistical figures, and numerical values
- The `Bungee Shade` font could optionally be loaded for the "Mazmatics" wordmark on the data site header to maintain brand continuity — but do not use it elsewhere
- Hierarchy: Large bold headings for section titles, medium for chart titles, readable body text for narrative sections
- Data labels should be slightly smaller and use the mono font for numerical precision

### Layout & Design Patterns

**On mazmatics.com, key design patterns include:**
- Graph-paper grid background (white with faint blue/purple grid lines) — evokes a maths exercise book
- Single-column scrolling layout with full-width coloured sections
- Generous whitespace between sections
- Offset colour-block shadows behind images (purple + blue)
- Diagonal purple stripe decorative SVG elements as section dividers
- Purple downward-pointing triangle chevrons between sections
- Cards with subtle rounded corners and light box shadows (`rgba(0,0,0,0.75) 0px 4px 16px -6px`)
- Yellow full-width banner sections for CTAs
- The gradient applied to text via `background-clip: text` + transparent text colour

**For the data site, adapt these:**
- Single-column narrative flow with full-width visualisations (like a scrollytelling piece)
- Generous whitespace — let the data breathe
- Mobile-first responsive design (charts must work well on phone screens)
- Sticky controls/filters that follow the user as they scroll through visualisations
- Loading states: pulsing skeleton placeholders (`animate-pulse bg-slate-800 rounded-lg`)
- Consider using the graph-paper grid as a subtle background pattern on the dark theme (faint grid lines on dark slate) — this would be a lovely nod to the book's maths exercise book feel
- Use the Mazmatics gradient on the nav/header and on section heading text (via `background-clip: text`)
- Reserve the offset colour-block shadow effect for featured cards or key stat callouts

### Illustration & Character
- The book features Lindy (a girl adventurer in a hat — black and white with grey shading), emoji faces, and hand-drawn illustrations
- The data site should NOT directly use children's book illustrations — it would clash with the serious data
- Instead, consider subtle nods: hand-drawn style dividers (like the diagonal stripe SVGs on the main site), slightly rounded chart edges, friendly empty states
- SVG icons should feel warm and rounded, not sharp/corporate (consider Lucide icons or similar)

### Inspiration
Think: the visual quality of **The Pudding** or **Our World in Data** meets the warmth and accessibility of a good NZ parenting resource. Data journalism that your mate who's a teacher would share on Facebook. The graph-paper grid background subtly ties it back to the Mazmatics book world.

## Key Reminders for Implementation

1. **Read the .claude/skills/ SKILL.md files** (especially d3-visualization, frontend-design, ui-ux-pro-max) before building any UI
2. **The Mazmatics gradient is `linear-gradient(to left, #BA90FF, #47A5F1)`** — use for branding (nav, headings), NOT for data encoding
3. **Colour-blind safe palettes are non-negotiable** for data about real people
4. **Macrons matter** — always use correct te reo Māori spelling (Māori, whānau, Tāmaki Makaurau)
5. **NZ English** — colour not color, maths not math, recognise not recognize
6. **Externalisable strings** — build with i18n in mind from day one
7. **Dark mode is default** but ensure sufficient contrast ratios (WCAG AA minimum)
8. **Charts are the content** — narrative text supports the visualisations, not the other way around
9. **Graph-paper grid background** — consider a subtle dark-mode version as a nod to the maths exercise book
10. **Offset colour-block shadows** (`#BA90FF` + `#47A5F1`) — use sparingly for featured cards/stats
