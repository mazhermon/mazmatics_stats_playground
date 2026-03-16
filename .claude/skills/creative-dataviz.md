# Creative DataViz Skill

## When to Use This Skill

Use this skill when:
- Adding a new visualisation to the Mazmatics Stats project
- The user asks "what other ways could we show this data?"
- Improving or replacing an existing chart
- Designing a new data story or feature page
- Choosing between visualisation types for a given dataset shape

**Stack context:** Next.js 15, React 19, TypeScript, D3.js v7, Three.js / R3F v9, Tailwind v4, better-sqlite3, NZQA achievement data.

---

## Core Philosophy

1. **Form follows data shape** — the data's structure (distribution, flow, hierarchy, geography, time) should drive the choice of chart, not habit.
2. **Beauty is clarity** — aesthetic decisions that also aid comprehension (colour, spacing, metaphor) are always correct.
3. **Beyond the bar chart** — bar charts are fine defaults but rarely the most insightful or engaging option.
4. **Honest proportionality** — areas and volumes must be scaled correctly (area = value, NOT radius = value for circles/bubbles).
5. **Interaction as revelation** — hover, scroll, filter, and drill-down should reveal information that the static view cannot.

---

## Decision Framework: Choosing a Visualisation Type

### Step 1: What is the data's primary relationship?

| Relationship | Go-to Types | Creative Alternatives |
|---|---|---|
| **Comparison** (groups) | Bar, lollipop | Slope chart, bump chart, beeswarm |
| **Distribution** (spread) | Histogram, box plot | Violin, ridgeline, beeswarm, density |
| **Composition** (parts) | Bar (stacked) | Waffle, treemap, sunburst, voronoi, unit chart |
| **Trend** (over time) | Line, area | Stream graph, bump, horizon, spiral |
| **Flow** (movement) | Sankey | Alluvial, chord, arc diagram |
| **Relationship** (correlation) | Scatter | Heatmap, bubble, connected scatter, correlogram |
| **Network** (connections) | Node-link | Chord, arc, edge bundling, adjacency matrix |
| **Geographic** (spatial) | Choropleth | Cartogram, hexbin, bubble map, flow map |
| **Hierarchy** (nested) | Tree | Sunburst, circle packing, treemap |

### Step 2: How many dimensions / variables?

- **1 variable** → histogram, density, dot plot
- **2 variables** → scatter, bar, line, slope
- **3 variables** → bubble, heatmap, parallel coordinates
- **4+ variables** → small multiples, parallel coordinates, radar (use sparingly)
- **Many groups over time** → ridgeline, horizon chart, stream graph

### Step 3: What is the user's goal?

- **Lookup a value** → table, labelled bar
- **Compare values** → sorted bar, slope, bump
- **Find patterns/trends** → line, area, stream, heatmap
- **Explore freely** → interactive scatter, filterable view
- **Understand a story** → scrollytelling, annotated chart, stepper
- **Feel the scale** → unit/waffle chart, proportional area, cartogram
- **Find outliers** → beeswarm, box plot, scatter

---

## Visualisation Catalogue for This Project

### Beeswarm Chart
**What:** Each data point is a dot, jittered to avoid overlap, positioned on an axis.
**Use for:** "Where does each NZ region sit on the achievement scale?" — shows all individual values without aggregation loss.
**D3 pattern:**
```tsx
// Use d3-force or d3.forceSimulation with x-position = value, y-force = collision
import { forceSimulation, forceX, forceY, forceCollide } from 'd3';
const simulation = forceSimulation(nodes)
  .force('x', forceX(d => xScale(d.value)).strength(1))
  .force('y', forceY(height / 2).strength(0.05))
  .force('collide', forceCollide(radius + 1));
```

### Ridgeline / Joy Plot
**What:** Stacked density curves, one per group, offset vertically.
**Use for:** Year-on-year achievement distributions by ethnicity; shows when curves shift, narrow, or overlap.
**D3 pattern:**
```tsx
// Use d3.density (kernel density estimation) per group
import { area, curveBasis } from 'd3';
// KDE function:
function kde(kernel, thresholds, data) {
  return thresholds.map(x => [x, d3.mean(data, v => kernel(x - v))]);
}
function epanechnikovKernel(bandwidth) {
  return v => Math.abs(v /= bandwidth) <= 1 ? 0.75 * (1 - v * v) / bandwidth : 0;
}
```

### Waffle / Unit Chart
**What:** 10×10 grid; each square = 1% (or 1 student, etc).
**Use for:** "Of every 100 Māori students, 68 achieved." Immediate human-scale comprehension.
**D3 pattern:**
```tsx
// Generate 100 cells in a grid, colour by threshold
const cells = Array.from({length: 100}, (_, i) => ({
  x: i % 10,
  y: Math.floor(i / 10),
  filled: i < value,
}));
// Render as <rect> elements, square size = (width - padding) / 10
```

### Alluvial / Sankey Diagram
**What:** Nodes connected by bands whose width = flow volume.
**Use for:** Student cohort movement between attainment bands across years; ethnicity × achievement level flows.
**Library:** `d3-sankey` or `@nivo/sankey`
```tsx
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
const sankeyGen = sankey()
  .nodeWidth(20)
  .nodePadding(10)
  .extent([[padding, padding], [width - padding, height - padding]]);
```

### Bump Chart
**What:** Rank on y-axis, time on x-axis; lines connect rank positions.
**Use for:** Regional achievement ranking over years — dramatic rank reversals immediately visible.
**D3 pattern:**
```tsx
// y-scale is ordinal (ranks 1–16), x-scale is time
// Use monotoneX curve for smooth lines
import { line, curveMonotoneX } from 'd3';
const rankLine = line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.rank))
  .curve(curveMonotoneX);
```

### Slope Chart
**What:** Two vertical axes (before/after years); each line = one group.
**Use for:** 2014 vs 2024 achievement by ethnicity — who improved most? Who fell behind?
**D3 pattern:**
```tsx
// Two x positions (left/right), y-scale = achievement %
// Label left and right endpoints; colour by change direction
const xLeft = margin.left;
const xRight = width - margin.right;
// Each entity is a line from (xLeft, yScale(val2014)) to (xRight, yScale(val2024))
```

### Horizon Chart
**What:** Compact time series; bands of colour fold negatives upward. Many series in small space.
**Use for:** Show all 16 NZ regions' achievement trends simultaneously in one compact view.
**Library:** `d3-horizon-chart` or custom SVG clip-path approach
```tsx
// Divide y-range into bands (e.g. 4 bands of 25% each)
// Positive bands: blue gradient layers; negative: red gradient layers
// Each band is clipped and offset to overlap, creating compact density
```

### Chord Diagram
**What:** Circular diagram; arcs between groups with width = flow/relationship strength.
**Use for:** Ethnic group overlap in achievement bands; region-to-region comparison matrix.
**D3 pattern:**
```tsx
import { chord, ribbon, arc } from 'd3';
const chordLayout = chord().padAngle(0.05).sortSubgroups(d3.descending);
const chords = chordLayout(matrix);
// Outer arcs = groups, inner ribbons = flows
```

### Stream Graph
**What:** Stacked, smoothed area chart centred on a baseline that flows organically.
**Use for:** Achievement composition over time across ethnic groups; shows ebb/flow aesthetically.
**D3 pattern:**
```tsx
import { stack, stackOffsetWiggle, stackOrderInsideOut, area, curveCatmullRom } from 'd3';
const stackGen = stack().offset(stackOffsetWiggle).order(stackOrderInsideOut);
```

### Small Multiples
**What:** Same chart repeated for every subgroup on a consistent scale.
**Use for:** One chart per NZ region, all at same y-scale — enforces honest comparison. Or one per ethnicity.
**Pattern:**
```tsx
// Grid of N charts using the SAME scales (share xScale, yScale across all)
// Each chart = same component, different data slice
// CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`
```

### Scrollytelling
**What:** Scroll position triggers chart state changes: annotations appear, data updates, transitions fire.
**Use for:** Walking users through a data narrative ("How Māori achievement changed 2014–2024").
**Pattern (Intersection Observer):**
```tsx
'use client';
import { useEffect, useRef, useState } from 'react';

export function ScrollySection({ steps, chart: Chart }) {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    const observers = stepRefs.current.map((el, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return (
    <div className="relative flex">
      {/* Sticky chart panel */}
      <div className="sticky top-0 h-screen w-1/2 flex items-center">
        <Chart step={activeStep} />
      </div>
      {/* Scrolling text steps */}
      <div className="w-1/2 pl-8">
        {steps.map((step, i) => (
          <div key={i} ref={el => stepRefs.current[i] = el} className="min-h-screen flex items-center">
            <p className="text-lg">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Proportional Circle / Bubble Comparison
**What:** Circles sized by area = value; positioned by category or geography.
**Use for:** NZ regions as bubbles — area = student population, colour = achievement rate.
**Critical:** Use `r = Math.sqrt(value / Math.PI) * scaleFactor` — NOT `r = value * scale`.
```tsx
// Pack layout or manual positioning
import { pack, hierarchy } from 'd3';
const root = hierarchy({ children: data }).sum(d => d.value);
pack().size([width, height]).padding(3)(root);
```

### Cartogram (NZ-specific)
**What:** Distort the NZ map so each region's geographic area is proportional to student count.
**Use for:** Makes Auckland's dominance visible; removes misleading large-but-sparse region bias.
**Approach:** Pre-process TopoJSON with `topogram` library or use approximate rectangular/hexagonal cartogram.

---

## D3 Integration Patterns (React/Next.js)

### Always Dynamic Import (ssr: false)
```tsx
// In a 'use client' wrapper file:
import dynamic from 'next/dynamic';
const BeeswarmChart = dynamic(() => import('@/components/charts/BeeswarmChart'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-800 rounded h-64" />,
});
```

### useEffect + useRef Pattern
```tsx
'use client';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export function MyChart({ data }: { data: DataPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clean slate on re-render
    // ... chart code
  }, [data]);

  return <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" />;
}
```

### Responsive Dimensions
```tsx
import { useResizeObserver } from '@/lib/hooks/useResizeObserver';

const { ref, width, height } = useResizeObserver();
// viewBox stays fixed; SVG scales via CSS width: 100%
```

### Animated Transitions (D3)
```tsx
// Enter + update + exit with .join()
svg.selectAll('circle')
  .data(data, d => d.id)
  .join(
    enter => enter.append('circle').attr('r', 0).call(e => e.transition().attr('r', d => rScale(d.value))),
    update => update.call(u => u.transition().attr('cx', d => xScale(d.x)).attr('cy', d => yScale(d.y))),
    exit => exit.call(e => e.transition().attr('r', 0).remove()),
  );
```

---

## Colour Strategy

### NZQA Achievement Palette (suggested)
```tsx
// Diverging scale: low achievement (red) → neutral (grey) → high achievement (blue/green)
const achievementScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);

// Ethnicity palette — accessible, distinct
const ethnicityColours = {
  'Māori':         '#F59E0B', // amber
  'Pasifika':      '#10B981', // emerald
  'Asian':         '#3B82F6', // blue
  'European/Pākehā': '#8B5CF6', // violet
  'Other':         '#6B7280', // grey
  'Total':         '#F3F4F6', // light grey
};

// Always use oklch() in Tailwind v4 for perceptual uniformity
```

### Accessibility
- Minimum contrast ratio 4.5:1 for text on backgrounds
- Never use red/green alone for diverging scales (colour blindness) — add texture, pattern, or luminance difference
- Provide alt text or table equivalent for every chart
- Test with `prefers-reduced-motion` — disable animations when set

---

## Design Aesthetics (IiB-Inspired)

### Dark Theme Defaults (Mazmatics)
- Background: `slate-950` or `zinc-950`
- Chart background: `slate-900`
- Grid lines: `slate-800` (subtle, 30% opacity)
- Text: `slate-100` (primary), `slate-400` (secondary/labels)
- Accent colours: use the ethnicity palette above

### Visual Storytelling Devices
1. **Annotation layers** — call out specific data points with lines + text labels
2. **Highlight + grey** — emphasise one series, grey out the rest
3. **Progressive reveal** — animate data in order of narrative importance
4. **Reference lines** — national average, target threshold, historical baseline
5. **Contextual icons** — small pictograms near relevant data points
6. **Gradient backgrounds on chart area** — subtle depth without distraction

### Typography in Charts
- Axis labels: `text-sm font-mono` (monospace for numbers)
- Title: `text-base font-semibold`
- Annotations: `text-xs` italic
- Numbers in charts: always right-aligned or centred over their bar/point

---

## Implementation Checklist for New Visualisations

- [ ] Is `ssr: false` applied via dynamic import in a `'use client'` wrapper?
- [ ] Does the chart respond to container resize (viewBox + CSS width:100%)?
- [ ] Are bubble/circle areas correctly scaled (`r = sqrt(value/π) * k`)?
- [ ] Does the D3 code use `.join()` pattern (not deprecated enter/append)?
- [ ] Are transitions cleaned up on component unmount?
- [ ] Is there a loading skeleton while the component loads?
- [ ] Is colour accessible (not relying on hue alone)?
- [ ] Is there a `prefers-reduced-motion` guard?
- [ ] Are axis labels readable at mobile widths?
- [ ] Does the data flow server → client (fetch in Server Component, render in Client)?

---

## Quick Reference: Chart Type → NZQA Use Case

| Chart Type | NZQA Use Case |
|---|---|
| Beeswarm | All regions' achievement rates as individual dots |
| Ridgeline | Achievement score distributions per ethnicity, stacked |
| Waffle | "X in 100 students achieved" — humanised proportion |
| Alluvial/Sankey | Student flow across attainment bands over years |
| Bump | Region achievement rank changes 2014→2024 |
| Slope | Two-year before/after by ethnicity or equity index |
| Horizon | All 16 regions' trends in compact single panel |
| Chord | Ethnic group overlap in achievement tiers |
| Stream | Achievement composition evolution over time |
| Small Multiples | One chart per region or ethnicity, same scale |
| Scrollytelling | Guided data narrative with scroll-triggered reveals |
| Bubble Map | Regions as circles on NZ map: area=students, colour=achievement |
| Cartogram | NZ map distorted by student population, not geography |

---

## Implementation Patterns (Validated March 2026)

### Beeswarm — Force Simulation (Synchronous)
```tsx
// CORRECT: run simulation synchronously before SVG render
const simulation = d3.forceSimulation<Node>(nodes)
  .force('x', d3.forceX<Node>(d => xScale(d.value)).strength(1))
  .force('y', d3.forceY<Node>(height / 2).strength(0.05))
  .force('collide', d3.forceCollide<Node>(d => d.r + 2))
  .stop(); // <-- stop immediately, don't animate
for (let i = 0; i < 200; i++) simulation.tick(); // run physics to completion
// WRONG: letting simulation run asynchronously (render fires before physics settles)
```

### Bubble Comparison — Force Layout (NOT d3.pack)
```tsx
// Prefer force simulation over d3.pack for bubble sizing — simpler TypeScript types
const nodes = data.map(d => ({ ...d, r: rScale(d.count), x: W/2, y: H/2 }));
d3.forceSimulation(nodes)
  .force('center', d3.forceCenter(W/2, H/2).strength(0.05))
  .force('collide', d3.forceCollide(d => d.r + 3).strength(0.8))
  .stop();
for (let i = 0; i < 300; i++) simulation.tick();
// d3.pack() requires complex HierarchyCircularNode generics — hard to type correctly
```

### Dots in Loop (NOT selectAll(null))
```tsx
// CORRECT: append dots in a for loop (avoids TypeScript error with selectAll(null))
for (const [x, y] of lineData) {
  g.append('circle').attr('cx', x).attr('cy', y).attr('r', 4).attr('fill', color);
}
// WRONG: g.selectAll(null).data(pts).join('circle') — TypeScript rejects null selector
```

### Horizon Chart — Clip-path per Row
```tsx
// Each row MUST have its own clip-path to prevent overflow into adjacent rows
defs.append('clipPath').attr('id', `horizon-clip-${i}`)
  .append('rect').attr('width', innerW).attr('height', ROW_H);
rowGroup.attr('clip-path', `url(#horizon-clip-${i})`);
// Positive deviation: area drawn from ROW_H upward
// Negative deviation: area drawn from ROW_H downward (folds into same space via clip)
```

### Ridgeline KDE — Recommended Settings
```tsx
// For ~10 data points per group (annual NZQA data):
const bandwidth = 0.07;  // too low (<0.04) = spiky; too high (>0.15) = all detail lost
const thresholds = d3.range(0, 1.01, 0.01); // 101 points across [0, 1]
// Use Epanechnikov kernel (compact support, efficient)
function epanechnikovKernel(bw) {
  return v => { const u = v/bw; return Math.abs(u) <= 1 ? 0.75*(1-u*u)/bw : 0; };
}
```

### Stream Graph — Wiggle Offset
```tsx
// stackOffsetWiggle requires COMPLETE matrix (no missing years for any group)
const matrix = years.map(yr => {
  const row = { year: yr };
  for (const g of groups) {
    const pt = data.find(d => d.year === yr && d.group === g);
    row[g] = pt?.value ?? 0; // fill missing with 0 — critical!
  }
  return row;
});
// y-axis values are meaningless — always note this for users
```
