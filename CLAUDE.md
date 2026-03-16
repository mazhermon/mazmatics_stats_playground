# Mazmatics Stats Playground

## Project Overview
An interactive data visualization web application for exploring mathematics and statistics concepts. Built with Next.js 15 (App Router, SSR), React 19, TypeScript, D3.js, and Three.js/React Three Fiber.

**Owner:** Maz
**Stack:** Next.js 15 | React 19 | TypeScript | Tailwind CSS v4 | D3.js v7 | Three.js | React Three Fiber v9 | Drei v10 | better-sqlite3 | Playwright 1.58+

## Architecture

### Directory Structure
```
src/
├── app/                  # Next.js App Router pages and layouts
│   ├── layout.tsx        # Root layout (Geist fonts, dark mode, metadata)
│   ├── page.tsx          # Landing page (Server Component)
│   ├── globals.css       # Tailwind v4 imports and custom CSS
│   └── [feature]/        # Feature-based route directories
├── components/           # Shared React components
│   ├── ui/               # Primitive UI components (buttons, cards, inputs)
│   ├── charts/           # D3-based chart components
│   ├── three/            # Three.js/R3F 3D visualization components
│   └── layout/           # Layout components (nav, footer, sidebar)
├── lib/                  # Utility functions and helpers
│   ├── math/             # Math/statistics utility functions
│   ├── data/             # Data fetching and transformation
│   └── hooks/            # Custom React hooks
├── types/                # TypeScript type definitions
e2e/                      # Playwright end-to-end tests
├── visual/               # Visual regression tests + snapshots
.claude/skills/           # Claude Code skills for this project
```

### Key Architectural Decisions
- **Server Components by default** — Only use 'use client' when interactivity is required (D3, Three.js, event handlers)
- **Dynamic imports for heavy libs** — D3 and Three.js must be dynamically imported with `ssr: false` to avoid server-side window/document errors
- **Data flows server → client** — Fetch/compute data in Server Components, pass as props to Client Components for visualization
- **Composition over inheritance** — Build complex visualizations by composing smaller components

### SSR Strategy
```tsx
// Pattern for client-only visualization components
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('@/components/charts/MyChart'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-800 rounded-lg h-64" />,
});
```

## Code Conventions

### TypeScript
- Strict mode enabled — no `any` types unless absolutely necessary (and documented why)
- Use `interface` for component props, `type` for unions/intersections
- All components must have typed props
- Prefer `const` assertions and `satisfies` over manual casting

### React / Next.js
- Functional components only (no class components)
- Custom hooks for shared stateful logic (prefix with `use`)
- Server Components by default; mark client components explicitly with `'use client'`
- Use Next.js `<Image>` for all images, `<Link>` for navigation
- Error boundaries for every visualization route

### Styling
- Tailwind CSS v4 (utility-first, no custom CSS unless necessary)
- Design tokens via CSS custom properties for theming
- Dark mode is the default; light mode is secondary
- Responsive: mobile-first breakpoints (sm → md → lg → xl → 2xl)

### File Naming
- Components: PascalCase (`BarChart.tsx`, `ScatterPlot.tsx`)
- Utilities/hooks: camelCase (`useWindowSize.ts`, `formatNumber.ts`)
- Types: PascalCase (`ChartData.ts`, `VisualizationProps.ts`)
- Tests: `*.test.tsx` for unit, `*.spec.ts` for e2e, `*.visual.spec.ts` for visual regression

### Imports
- Use path alias `@/` for all project imports
- Order: React/Next → third-party → project imports → types → styles
- No default exports except for pages and layouts

## Testing

### Unit Tests (Jest + Testing Library)
```bash
npm test              # Run all unit tests
npm run test:watch    # Watch mode
```
- Test files live in `src/__tests__/` mirroring the source structure
- Use `@testing-library/react` for component tests
- Mock D3/Three.js in unit tests — test data transformations and component logic separately

### E2E Tests (Playwright)
```bash
npm run test:e2e      # Run e2e tests — chromium only, 65 tests (~1.4 min)
npm run test:visual   # Run visual regression tests — chromium only, 5 snapshot tests
npx playwright test e2e/diagnostic.spec.ts --project=chromium --reporter=list  # diagnostic run
```
- E2E tests in `e2e/` directory; visual specs excluded from main suite via `testIgnore`
- Visual regression snapshots in `e2e/visual/snapshots/` (separate config — `playwright.visual.config.ts`)
- Update visual snapshots: `npx playwright test --config=playwright.visual.config.ts --update-snapshots`
- Screenshots from diagnostic tests saved to `e2e/screenshots/`
- See `e2e-testing` skill for full patterns, timeout rules, and maintenance guide

### CRITICAL: Playwright macOS Sequoia Compatibility
- Playwright 1.40.x bundled Chromium crashes with SIGSEGV on macOS 15 (Sequoia / Darwin 25.x)
- Always use `@playwright/test` **1.58.0+**
- After upgrading, run `npx playwright install chromium` to download compatible browser
- Firefox and WebKit require separate install: `npx playwright install firefox webkit`
- Currently only Chromium is installed — config reflects this

### CRITICAL: /nzqa-maths Test Timeouts
The page fires 10+ parallel API requests on load. Any test that loads `/nzqa-maths` needs:
```ts
test.setTimeout(90000);
await page.waitForLoadState('networkidle', { timeout: 75000 });
```

## D3.js Patterns

### React Integration
```tsx
'use client';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export function Chart({ data }: { data: DataPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    // D3 bindings here — use .join() pattern
  }, [data]);

  return <svg ref={svgRef} className="w-full h-auto" />;
}
```

### Key Rules
- Always use the `.join()` pattern (not enter/append)
- Clean up selections in useEffect return
- Use `viewBox` for responsive SVGs, not fixed width/height
- Prefer D3 scales + React rendering over full D3 DOM manipulation

## Three.js / React Three Fiber Patterns

### CRITICAL: R3F Version Requirements
- **Use `@react-three/fiber` v9+ and `@react-three/drei` v10+** for React 19 compatibility
- R3F v8.x peer-requires `react >=18 <19` — it will crash on React 19 with `Cannot read properties of undefined (reading 'ReactCurrentOwner')`
- R3F v9+ requires `react ^19.0.0` and `three >=0.156`
- Drei v10+ requires `@react-three/fiber ^9.0.0` and `react ^19`

### JSX Types (React 19 + R3F v9)
The `src/types/r3f.d.ts` file is REQUIRED to make Three.js JSX elements work with React 19:
```ts
import type { ThreeElements } from '@react-three/fiber/dist/declarations/src/three-types';
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
```

### Canvas Setup
```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export function Scene({ data }: { data: DataPoint[] }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      {/* 3D visualization components */}
    </Canvas>
  );
}
```

### Animated Bar Pattern (useFrame)
```tsx
// CORRECT: unit geometry height, scale.y animates 0 → value
function Bar({ height }: { height: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentH = useRef(0);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentH.current += (height - currentH.current) * Math.min(1, delta * 4);
    meshRef.current.scale.y = currentH.current;
    meshRef.current.position.y = currentH.current / 2; // centre of scaled unit box
  });
  return (
    <mesh ref={meshRef} scale={[1, 0.001, 1]}>
      <boxGeometry args={[0.7, 1, 0.7]} /> {/* unit height — scale.y IS the height */}
      <meshStandardMaterial color="..." />
    </mesh>
  );
}
// WRONG: args={[0.7, height*5, 0.7]} and scale.y = height → bars are height² tall
```

### Key Rules
- Always wrap Canvas in a client component with dynamic import (ssr: false)
- Use `useFrame` for animations, not `requestAnimationFrame`
- Dispose of geometries and materials in cleanup
- Use instanced meshes for large datasets (>1000 points)
- Bar geometry height should be 1 (unit); control actual height via `scale.y`

## Getting Started

```bash
npm install           # Install dependencies
npm run dev           # Start dev server at http://localhost:3000
npm run build         # Production build
npm run lint          # ESLint check
npm test              # Unit tests
npm run test:e2e      # E2E tests (requires dev server or builds first)
```

## Known Issues & Gotchas

### ssr: false in Server Components
Next.js 15 **forbids** calling `dynamic(..., { ssr: false })` in Server Components. All D3/Three.js dynamic imports must live in a `'use client'` wrapper file. See `src/app/nzqa-maths/NzqaMathsClient.tsx` for the pattern.

### RegionalMap TopoJSON
- File: `public/geo/nz-regions.topojson`
- Object key: `regions`
- Feature property: `REGC_name` — includes " Region" suffix (e.g. `"Auckland Region"`)
- NZQA region names have NO suffix (e.g. `"Auckland"`)
- Mapping handled by `NZQA_TO_TOPOJSON` dict in `RegionalMap.tsx`
- Exception: `Manawatu-Whanganui` in DB (no macron), maps to `Manawatū-Whanganui Region` in TopoJSON

### NZQA Data: No Cross-Tabulation
Each NZQA CSV breakdown is single-dimensional. No row has two non-null dimension columns. Do NOT build visualisations that require ethnicity × region, ethnicity × equity, etc. — they will always return empty. Use `timeline` API (year × group) for multi-dimensional views.

### Tailwind CSS v4
- Requires `@tailwindcss/postcss` ≥ 4.2.1 (4.0.0 breaks with `negated` ScannerOptions error)
- Current: `tailwindcss@latest @tailwindcss/postcss@latest`

### better-sqlite3
- Server-only package — must be in `serverExternalPackages` in `next.config.ts`
- Database: `src/data/nzqa.db` (read-only in production, read-write only in seed script)

## Skills Available
This project includes Claude Code skills in `.claude/skills/`:
- **ui-ux-pro-max** — Design intelligence (palettes, fonts, patterns)
- **frontend-design** — Anti-AI-slop frontend design principles
- **remotion** — Programmatic video creation with React
- **code-reviewer** — Security, performance, and quality review
- **d3-visualization** — D3.js v7 best practices for React (includes stacked bar, delta chart, series toggle, annotation lines, Playwright testing patterns)
- **threejs-viz** — Three.js / React Three Fiber patterns
- **nextjs-ssr** — Next.js App Router and SSR strategies
- **nzqa-data-research** — NZQA data sources, DB schema, API design, data structure facts (READ BEFORE any NZQA work)
- **creative-dataviz** — Creative visualisation types beyond bar charts: beeswarm, ridgeline, waffle, bump, slope, horizon, stream, cartogram
- **e2e-testing** — Playwright test architecture, timeout rules, maintenance guide, debugging failures (READ BEFORE writing/fixing e2e tests)
