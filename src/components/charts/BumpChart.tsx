'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';

// 16 distinct colours for up to 16 NZ regions
const REGION_PALETTE = [
  '#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE',
  '#AA3377', '#BBBBBB', '#44BB99', '#EEDD88', '#EE8866',
  '#AAAAAA', '#77AADD', '#FFAABB', '#99DDFF', '#BBCC33', '#7700AA',
];

export function BumpChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(2);

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=region&level=${level}`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const points = (data.data as TimelineGroupPoint[]).filter(
      (d) => d.value !== null && d.group_label
    );

    if (points.length === 0) return;

    // Compute ranks per year
    const yearGroups = d3.group(points, (d) => d.year);
    const yearsSorted = [...yearGroups.keys()].sort((a, b) => a - b);

    // region → year → rank
    const rankMap = new Map<string, Map<number, number>>();
    for (const [year, yearData] of yearGroups) {
      const sorted = [...yearData].sort((a, b) => b.value - a.value);
      sorted.forEach((d, i) => {
        if (!rankMap.has(d.group_label)) rankMap.set(d.group_label, new Map());
        rankMap.get(d.group_label)!.set(year, i + 1);
      });
    }

    const regions = [...rankMap.keys()].sort();
    const numRegions = regions.length;

    const W = Math.max(containerRef.current.clientWidth || 700, 400);
    const H = Math.max(numRegions * 28 + 80, 420);
    const margin = { top: 32, right: 140, bottom: 40, left: 44 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scalePoint()
      .domain(yearsSorted.map(String))
      .range([0, innerW])
      .padding(0.15);

    const yScale = d3.scaleLinear().domain([1, numRegions]).range([0, innerH]);

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(regions)
      .range(REGION_PALETTE);

    // Subtle vertical grid
    g.selectAll<SVGLineElement, number>('.grid-v')
      .data(yearsSorted)
      .join('line')
      .attr('class', 'grid-v')
      .attr('x1', (d) => xScale(String(d))!)
      .attr('x2', (d) => xScale(String(d))!)
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1);

    // Rank lines
    const lineGen = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveMonotoneX);

    for (const region of regions) {
      const rMap = rankMap.get(region)!;
      const lineData: [number, number][] = yearsSorted
        .filter((yr) => rMap.has(yr))
        .map((yr) => [xScale(String(yr))!, yScale(rMap.get(yr)!)]);

      if (lineData.length < 2) continue;

      const col = colorScale(region);

      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', col)
        .attr('stroke-width', 2.5)
        .attr('stroke-opacity', 0.85)
        .attr('d', lineGen);

      // Dots on each year
      for (const [px, py] of lineData) {
        g.append('circle')
          .attr('cx', px)
          .attr('cy', py)
          .attr('r', 3.5)
          .attr('fill', col)
          .attr('stroke', '#020617')
          .attr('stroke-width', 1);
      }

      // Label at last year
      const lastYr = yearsSorted[yearsSorted.length - 1];
      if (rMap.has(lastYr)) {
        g.append('text')
          .attr('x', xScale(String(lastYr))! + 10)
          .attr('y', yScale(rMap.get(lastYr)!) + 4)
          .attr('fill', col)
          .attr('font-size', 10)
          .attr('font-family', 'ui-monospace, monospace')
          .text(region.replace(' Region', ''));
      }
    }

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH + 8})`)
      .call(
        d3.axisBottom(xScale).tickFormat((d) => d)
      )
      .call((ax) => ax.select('.domain').remove())
      .call((ax) =>
        ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11).attr('font-family', 'ui-monospace, monospace')
      )
      .call((ax) => ax.selectAll('.tick line').remove());

    // Y axis (rank label)
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .tickValues(d3.range(1, numRegions + 1))
          .tickFormat((d) => `#${d}`)
      )
      .call((ax) => ax.select('.domain').remove())
      .call((ax) =>
        ax.selectAll('text').attr('fill', '#475569').attr('font-size', 10).attr('font-family', 'ui-monospace, monospace')
      )
      .call((ax) => ax.selectAll('.tick line').remove());

    // Y axis label
    g.append('text')
      .attr('x', -innerH / 2)
      .attr('y', -32)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569')
      .attr('font-size', 10)
      .attr('font-family', 'ui-monospace, monospace')
      .text('Rank (1 = highest achievement)');
  }, [data]);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[500px]" />;
  if (error) return <div className="text-red-400 text-sm p-4 bg-slate-900 rounded-xl">{error}</div>;

  return (
    <div className="space-y-3">
      {/* Level selector */}
      <div className="flex gap-2 items-center">
        <span className="text-xs text-slate-500 font-mono">NCEA Level:</span>
        {([1, 2, 3] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              level === l
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Level {l}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>
    </div>
  );
}
