# Mazmatics Stats Playground

## Project Overview
An interactive data visualization web application for exploring mathematics and statistics concepts. Built with Next.js 15 (App Router, SSR), React 19, TypeScript, D3.js, and Three.js/React Three Fiber.

**Owner:** Maz
**Stack:** Next.js 15 | React 19 | TypeScript | Tailwind CSS v4 | D3.js v7 | Three.js | React Three Fiber | Drei

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
npm run test:e2e      # Run e2e tests (chromium + firefox + webkit)
npm run test:visual   # Run visual regression tests (chromium only)
```
- E2E tests in `e2e/` directory
- Visual regression snapshots in `e2e/visual/snapshots/`
- Update visual snapshots: `npx playwright test --config=playwright.visual.config.ts --update-snapshots`

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

### Key Rules
- Always wrap Canvas in a client component with dynamic import (ssr: false)
- Use `useFrame` for animations, not `requestAnimationFrame`
- Dispose of geometries and materials in cleanup
- Use instanced meshes for large datasets (>1000 points)

## Getting Started

```bash
npm install           # Install dependencies
npm run dev           # Start dev server at http://localhost:3000
npm run build         # Production build
npm run lint          # ESLint check
npm test              # Unit tests
npm run test:e2e      # E2E tests (requires dev server or builds first)
```

## Skills Available
This project includes Claude Code skills in `.claude/skills/`:
- **ui-ux-pro-max** — Design intelligence (palettes, fonts, patterns)
- **frontend-design** — Anti-AI-slop frontend design principles
- **remotion** — Programmatic video creation with React
- **code-reviewer** — Security, performance, and quality review
- **d3-visualization** — D3.js v7 best practices for React
- **threejs-viz** — Three.js / React Three Fiber patterns
- **nextjs-ssr** — Next.js App Router and SSR strategies
