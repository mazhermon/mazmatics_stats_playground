'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { LEVEL_COLOURS, fmtRate } from '@/lib/palette';
import { playHoverTone, playTransitionSweep, resumeAudio } from '@/lib/audio';
import { strings } from '@/lib/nzqa-strings';

interface TooltipState {
  x: number;
  y: number;
  year: number;
  value: number;
  level: number;
  visible: boolean;
}

export function TimelineExplorer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState<number | null>(null); // null = all levels
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, year: 0, value: 0, level: 1, visible: false });

  const url = '/api/nzqa/timeline?metric=achieved_rate&groupBy=national';
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  const handleLevelChange = useCallback((newLevel: number | null) => {
    resumeAudio();
    playTransitionSweep('up');
    setLevel(newLevel);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth || 800;
    const H = 320;
    const margin = { top: 24, right: 40, bottom: 48, left: 52 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    // Filter data by selected level
    const allPoints = data.data as Array<{ year: number; level: number; value: number; assessed_count: number }>;
    const levels = level !== null ? [level] : [1, 2, 3];
    const filtered = allPoints.filter((d) => levels.includes(d.level) && d.value !== null);

    if (filtered.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(filtered, (d) => d.year) as [number, number])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerH, 0]);

    // Group by level
    const grouped = d3.group(filtered, (d) => d.level);

    // --- Draw ---
    let g = svg.select<SVGGElement>('g.chart-body');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'chart-body');
    }
    g.attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.selectAll('.grid-h')
      .data(yScale.ticks(5))
      .join('line')
      .attr('class', 'grid-h')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-dasharray', '4,4');

    // Y axis
    const yAxisGroup = g.selectAll<SVGGElement, unknown>('.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis');

    yAxisGroup.call(
      d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `${Math.round((d as number) * 100)}%`)
    );

    yAxisGroup.selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-family', 'var(--font-geist-mono, monospace)')
      .style('font-size', '11px');
    yAxisGroup.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');

    // X axis
    const xAxisGroup = g.selectAll<SVGGElement, unknown>('.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`);

    xAxisGroup.call(
      d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat((d) => `${d}`)
    );

    xAxisGroup.selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-family', 'var(--font-geist-mono, monospace)')
      .style('font-size', '11px');
    xAxisGroup.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');

    // Area generator
    const area = d3.area<{ year: number; value: number }>()
      .x((d) => xScale(d.year))
      .y0(innerH)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line<{ year: number; value: number }>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw lines and areas per level
    grouped.forEach((points, lvl) => {
      const colour = LEVEL_COLOURS[lvl] ?? '#BA90FF';
      const sorted = [...points].sort((a, b) => a.year - b.year);

      // Area fill
      g.selectAll<SVGPathElement, unknown>(`.area-level-${lvl}`)
        .data([sorted])
        .join('path')
        .attr('class', `area-level-${lvl}`)
        .transition()
        .duration(900)
        .ease(d3.easeBackOut.overshoot(0.5))
        .attr('d', area)
        .attr('fill', colour)
        .attr('fill-opacity', 0.1);

      // Line
      const lineEl = g.selectAll<SVGPathElement, unknown>(`.line-level-${lvl}`)
        .data([sorted])
        .join('path')
        .attr('class', `line-level-${lvl}`)
        .attr('fill', 'none')
        .attr('stroke', colour)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      // Animate line draw on mount
      const totalLength = (lineEl.node() as SVGPathElement)?.getTotalLength() ?? 0;
      lineEl
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0)
        .attr('d', line);

      // Level label at end of line
      const last = sorted[sorted.length - 1];
      if (last) {
        g.selectAll<SVGTextElement, unknown>(`.label-level-${lvl}`)
          .data([last])
          .join('text')
          .attr('class', `label-level-${lvl}`)
          .attr('x', xScale(last.year) + 6)
          .attr('y', yScale(last.value) + 4)
          .attr('fill', colour)
          .style('font-size', '11px')
          .style('font-family', 'var(--font-geist-mono, monospace)')
          .style('font-weight', '600')
          .text(`L${lvl}`);
      }

      // Invisible hover dots for interaction
      g.selectAll<SVGCircleElement, typeof sorted[0]>(`.dot-level-${lvl}`)
        .data(sorted, (d) => d.year)
        .join('circle')
        .attr('class', `dot-level-${lvl}`)
        .attr('cx', (d) => xScale(d.year))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 18)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair')
        .on('mouseenter', function (event: MouseEvent, d) {
          d3.select(this).attr('r', 22);
          // Show visible dot
          g.selectAll<SVGCircleElement, typeof d>(`.vis-dot-${lvl}-${d.year}`)
            .data([d])
            .join('circle')
            .attr('class', `vis-dot-${lvl}-${d.year}`)
            .attr('cx', xScale(d.year))
            .attr('cy', yScale(d.value))
            .attr('r', 5)
            .attr('fill', colour)
            .attr('stroke', '#0f172a')
            .attr('stroke-width', 2);

          playHoverTone(d.value);
          const rect = container.getBoundingClientRect();
          setTooltip({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            year: d.year,
            value: d.value,
            level: lvl,
            visible: true,
          });
        })
        .on('mouseleave', function (_, d) {
          d3.select(this).attr('r', 18);
          g.selectAll(`.vis-dot-${lvl}-${d.year}`).remove();
          setTooltip((prev) => ({ ...prev, visible: false }));
        });
    });

    // Y axis label
    svg.selectAll('.y-label').data([null]).join('text')
      .attr('class', 'y-label')
      .attr('transform', `translate(14, ${H / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .style('font-size', '11px')
      .style('font-family', 'var(--font-geist-mono, monospace)')
      .text('Achievement rate');

  }, [data, level]);

  return (
    <div className="space-y-4">
      {/* Level toggle */}
      <div className="flex gap-2 flex-wrap">
        {([null, 1, 2, 3] as Array<number | null>).map((lvl) => (
          <button
            key={lvl ?? 'all'}
            onClick={() => handleLevelChange(lvl)}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
              ${level === lvl
                ? 'text-slate-950 shadow-lg scale-105'
                : 'text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
              }
            `}
            style={level === lvl ? {
              background: lvl !== null ? LEVEL_COLOURS[lvl] : 'linear-gradient(to left, #BA90FF, #47A5F1)',
            } : {}}
          >
            {lvl === null ? 'All levels' : `Level ${lvl}`}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div ref={containerRef} className="relative w-full">
        {loading && (
          <div className="animate-pulse bg-slate-800 rounded-lg h-80 w-full" />
        )}
        {error && (
          <div className="flex items-center justify-center h-80 text-slate-500 text-sm">
            {strings.error}
          </div>
        )}
        {!loading && !error && (
          <svg ref={svgRef} className="w-full" style={{ height: 320 }} />
        )}

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
          >
            <span className="text-slate-400">Level {tooltip.level} · {tooltip.year}</span>
            <br />
            <span className="text-white font-semibold">{fmtRate(tooltip.value)} achieved</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono">{strings.dataNote}</p>
    </div>
  );
}
