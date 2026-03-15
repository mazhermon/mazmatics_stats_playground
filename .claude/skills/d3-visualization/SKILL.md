---
name: d3-visualization
description: D3.js v7+ best practices for data visualization with React/Next.js integration. Covers charts, responsive design, animation, interaction, and accessibility.
version: 1.0.0
stacks:
  - D3.js v7+
  - React
  - Next.js
  - SVG
---

# D3.js Data Visualization Mastery

## D3.js v7 Fundamentals

D3.js (Data-Driven Documents) is a JavaScript library for binding data to the DOM and applying data-driven transformations to the document.

### Core Concepts
- **Data Binding**: Joining data to DOM elements
- **Scales**: Functions mapping data domain to visual range
- **Axes**: Visual representation of scales
- **Generators**: Functions producing path strings (line, area, arc)
- **Transitions**: Animated updates to visual properties

### Setup with React/Next.js
```bash
npm install d3
npm install -D @types/d3  # TypeScript
```

## D3.js with React/Next.js Integration

### The React-D3 Pattern
```tsx
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export function BarChart({ data }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    const width = 800
    const height = 400
    const margin = { top: 20, right: 30, bottom: 30, left: 60 }

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height - margin.bottom, margin.top])

    // Select and bind data
    const svg = d3.select(svgRef.current)

    svg.selectAll('rect')
      .data(data, d => d.label)
      .join('rect')
      .attr('x', d => xScale(d.label))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.value))
      .attr('fill', '#3b82f6')
  }, [data])

  return <svg ref={svgRef} width={800} height={400} />
}
```

### Server-Side Rendering (Next.js)
```tsx
'use client'  // Ensure client-side rendering

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./Chart'), { ssr: false })

export default function Page() {
  return <Chart data={data} />
}
```

## Chart Types Implementation

### Bar Chart
```tsx
const barChart = (selection, data) => {
  const margin = { top: 20, right: 20, bottom: 30, left: 60 }
  const width = 800 - margin.left - margin.right
  const height = 400 - margin.top - margin.bottom

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.1)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0])

  const g = selection.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', d => x(d.name))
    .attr('y', d => y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.value))
    .attr('fill', '#3b82f6')
}
```

### Line Chart
```tsx
const lineChart = (selection, data) => {
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value))

  const path = selection.append('path')
    .datum(data)
    .attr('d', line)
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 2)
    .attr('fill', 'none')

  // Add area under line
  const area = d3.area()
    .x(d => x(d.date))
    .y0(height)
    .y1(d => y(d.value))

  selection.append('path')
    .datum(data)
    .attr('d', area)
    .attr('fill', '#3b82f6')
    .attr('fill-opacity', 0.1)
}
```

### Scatter Plot
```tsx
const scatterPlot = (selection, data) => {
  selection.selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 5)
    .attr('fill', '#3b82f6')
    .attr('opacity', 0.7)
}
```

### Pie Chart
```tsx
const pieChart = (selection, data) => {
  const radius = 150
  const pie = d3.pie().value(d => d.value)
  const arc = d3.arc().innerRadius(0).outerRadius(radius)

  const g = selection.append('g')
    .attr('transform', `translate(${radius},${radius})`)

  g.selectAll('path')
    .data(pie(data))
    .join('path')
    .attr('d', arc)
    .attr('fill', (d, i) => colorScale(i))
}
```

### Treemap
```tsx
const treemap = (selection, data) => {
  const hierarchy = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value)

  const layout = d3.treemap()
    .size([width, height])
    .padding(4)

  layout(hierarchy)

  selection.selectAll('rect')
    .data(hierarchy.leaves())
    .join('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => colorScale(d.parent.data.name))
}
```

### Force-Directed Graph
```tsx
const forceGraph = (selection, data) => {
  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links).id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))

  const link = selection.selectAll('line')
    .data(data.links)
    .join('line')

  const node = selection.selectAll('circle')
    .data(data.nodes)
    .join('circle')
    .attr('r', 5)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
  })
}
```

### Geographic Maps
```tsx
import { feature } from 'topojson-client'

const geoMap = (selection, worldData) => {
  const projection = d3.geoMercator()
    .fitSize([width, height], feature(worldData, worldData.objects.countries))

  const path = d3.geoPath().projection(projection)

  selection.selectAll('path')
    .data(feature(worldData, worldData.objects.countries).features)
    .join('path')
    .attr('d', path)
    .attr('fill', '#ccc')
    .attr('stroke', '#fff')
}
```

## Data Binding Patterns (Enter/Update/Exit)

### The Join Pattern
```tsx
// The canonical D3 pattern
const update = selection.selectAll('rect').data(data)

const enter = update.enter().append('rect')
  .attr('x', d => x(d.name))
  .attr('width', x.bandwidth())

update
  .attr('y', d => y(d.value))
  .attr('height', d => height - y(d.value))

update.exit().remove()

// Shorthand with .join()
selection.selectAll('rect')
  .data(data)
  .join('rect')
  .attr('x', d => x(d.name))
  .attr('y', d => y(d.value))
```

### Key Function for Transitions
```tsx
// Preserve object identity across updates
.data(data, d => d.id)  // Use stable ID, not index

// Without key, elements rebind in order (wrong for animations)
.data(data)  // Binds by index
```

## Scales, Axes, and Legends

### Scale Types
```tsx
// Linear scale (continuous to continuous)
const linear = d3.scaleLinear()
  .domain([0, 100])
  .range([0, width])

// Band scale (ordinal to continuous)
const band = d3.scaleBand()
  .domain(['A', 'B', 'C'])
  .range([0, width])
  .padding(0.1)

// Color scale (continuous or categorical)
const colorLinear = d3.scaleLinear()
  .domain([0, 50, 100])
  .range(['red', 'yellow', 'green'])

const colorOrdinal = d3.scaleOrdinal()
  .domain(['category1', 'category2'])
  .range(d3.schemeCategory10)

// Log scale (useful for wide ranges)
const log = d3.scaleLog()
  .domain([1, 1000])
  .range([0, width])

// Time scale
const time = d3.scaleTime()
  .domain([new Date(2020, 0, 1), new Date(2024, 0, 1)])
  .range([0, width])
```

### Axes
```tsx
const xAxis = d3.axisBottom(xScale)
  .tickSize(5)
  .tickPadding(8)

const yAxis = d3.axisLeft(yScale)
  .ticks(5)
  .tickFormat(d => `$${d}`)

svg.append('g')
  .attr('transform', `translate(0,${height})`)
  .call(xAxis)

svg.append('g')
  .call(yAxis)
```

### Legends
```tsx
const legend = selection.append('g')
  .attr('transform', `translate(${width - 100}, 20)`)

legend.selectAll('rect')
  .data(categories)
  .join('rect')
  .attr('y', (d, i) => i * 25)
  .attr('width', 15)
  .attr('height', 15)
  .attr('fill', d => colorScale(d))

legend.selectAll('text')
  .data(categories)
  .join('text')
  .attr('y', (d, i) => i * 25 + 12)
  .attr('x', 20)
  .text(d => d)
```

## Responsive SVG Techniques

### Viewbox Pattern (Scales with Container)
```tsx
<svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto' }}>
  {/* Content scales responsively */}
</svg>
```

### Container Query Approach
```tsx
function ResponsiveChart({ data }) {
  const ref = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setDimensions({
        width: width,
        height: width * 0.5  // Maintain aspect ratio
      })
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return <svg ref={ref} width={dimensions.width} height={dimensions.height} />
}
```

## Animation and Transitions

### Basic Transition
```tsx
selection.selectAll('rect')
  .data(newData)
  .join('rect')
  .transition()
  .duration(750)
  .attr('y', d => yScale(d.value))
  .attr('height', d => height - yScale(d.value))
```

### Easing Functions
```tsx
.transition()
  .duration(750)
  .ease(d3.easeQuadInOut)  // Many available: linear, easeExp, easeBounce, etc.
  .attr('y', d => yScale(d.value))
```

### Staggered Transitions
```tsx
.transition()
  .delay((d, i) => i * 50)  // 50ms between each element
  .duration(500)
  .attr('y', d => yScale(d.value))
```

## Interaction Patterns

### Hover Effects
```tsx
selection.selectAll('rect')
  .on('mouseenter', function(event, d) {
    d3.select(this)
      .attr('fill', '#ef4444')
      .attr('opacity', 0.8)

    // Show tooltip
    tooltip.style('display', 'block')
      .html(`${d.name}: ${d.value}`)
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY + 10 + 'px')
  })
  .on('mouseleave', function() {
    d3.select(this)
      .attr('fill', '#3b82f6')
      .attr('opacity', 1)

    tooltip.style('display', 'none')
  })
```

### Click Interactions
```tsx
.on('click', (event, d) => {
  // Handle click
  console.log('Clicked:', d)
})
```

### Brush Selection
```tsx
const brush = d3.brush()
  .on('start brush end', brushed)

svg.append('g')
  .call(brush)

function brushed(event) {
  const selection = event.selection
  if (selection) {
    const [[x0, y0], [x1, y1]] = selection
    // Filter data based on selection
  }
}
```

### Zoom
```tsx
const zoom = d3.zoom()
  .on('zoom', (event) => {
    g.attr('transform', event.transform)
  })

svg.call(zoom)
```

## Color Scales for Data

### Sequential (Light to Dark)
```tsx
const sequential = d3.scaleLinear()
  .domain([0, max])
  .range(['#f0f9ff', '#0c4a6e'])  // Light blue to dark blue
```

### Diverging (Opposite Colors)
```tsx
const diverging = d3.scaleDiverging()
  .domain([-max, 0, max])
  .range(['#d73027', '#ffffbf', '#1a9850'])  // Red, white, green
```

### Categorical
```tsx
const categorical = d3.scaleOrdinal()
  .domain(categories)
  .range(d3.schemeSet2)  // Or: schemeCategory10, schemePastel1, etc.
```

### Viridis & Perceptually Uniform
```tsx
const viridis = d3.scaleLinear()
  .domain(d3.range(0, 1, 1/256))
  .range(d3.schemeViridis[256])
```

## Accessibility for Charts

### ARIA Labels
```tsx
svg.append('title').text('Sales by Region')
svg.append('desc').text('Bar chart showing quarterly sales for each region')

// Annotate data elements
bars.append('title')
  .text(d => `${d.region}: $${d.value.toLocaleString()}`)
```

### Keyboard Navigation
```tsx
selection.selectAll('rect')
  .attr('tabindex', 0)
  .on('keydown', (event, d) => {
    if (event.key === 'Enter') {
      // Handle selection
    }
  })
```

### Screen Reader Text
```tsx
// Hidden text for screen readers
svg.append('text')
  .attr('class', 'sr-only')
  .text('Sales increased by 23% in Q3 2024')
  .style('position', 'absolute')
  .style('left', '-10000px')
```

### Color-Blind Friendly Palettes
Use `d3.schemePiYG`, `d3.schemePRGn`, `d3.schemeSpectral` for colorblind accessibility. Avoid red-green combinations.

## Production-Ready Checklist

- Data validated before binding
- Memory leaks prevented (remove old elements)
- Responsive to container size changes
- Tooltips accessible and non-blocking
- Transitions smooth and purposeful
- Error handling for missing/invalid data
- Legends clear and positioned logically
- Axes labeled with units
- Color palette accessible
- SVG optimized (no excessive elements)
- Performance: Charts render in < 1s
- Zoom/pan works smoothly
- No console errors
- Mobile touch interactions supported
