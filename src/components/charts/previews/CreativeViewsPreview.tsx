'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { ETHNICITY_COLOURS } from '@/lib/palette';

interface TimelineRow {
  year: number;
  level: number;
  group_label: string;
  value: number;
  assessed_count: number;
}

interface ApiResponse {
  data: TimelineRow[];
  metric: string;
  groupBy: string;
}

const LABEL_MAP: Record<string, string> = {
  Maori: 'Māori',
  'Pacific Peoples': 'Pacific Peoples',
  European: 'European',
  Asian: 'Asian',
  'Middle Eastern/Latin American/African': 'MELAA',
};

const FEATURED_GROUPS = ['Maori', 'European', 'Pacific Peoples', 'Asian'];

const SHORT_LABELS: Record<string, string> = {
  Maori: 'Māori',
  European: 'European',
  'Pacific Peoples': 'Pacific',
  Asian: 'Asian',
};

export function CreativeViewsPreview() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rows, setRows] = useState<TimelineRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=2')
      .then(r => r.json())
      .then((res: ApiResponse) => {
        if (!cancelled) setRows(res.data ?? []);
      })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!rows || !svgRef.current) return;

    const featured = rows.filter(d => FEATURED_GROUPS.includes(d.group_label));
    if (!featured.length) return;

    const grouped = new Map<string, TimelineRow[]>();
    for (const row of featured) {
      if (!grouped.has(row.group_label)) grouped.set(row.group_label, []);
      grouped.get(row.group_label)!.push(row);
    }
    grouped.forEach(arr => arr.sort((a, b) => a.year - b.year));

    const allYears = [...new Set(featured.map(d => d.year))].sort((a, b) => a - b);
    const allValues = featured.map(d => d.value);

    const w = 500, h = 180;
    const margin = { top: 12, right: 60, bottom: 28, left: 40 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([d3.min(allYears)!, d3.max(allYears)!])
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([Math.max(0, d3.min(allValues)! - 0.05), Math.min(1, d3.max(allValues)! + 0.05)])
      .nice()
      .range([innerH, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(yScale.ticks(4))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#1e293b').attr('stroke-width', 1);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => String(d)).tickSize(3))
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('text').attr('fill', '#475569').attr('font-size', '9px');
        ax.selectAll('.tick line').attr('stroke', '#334155');
      });

    // Y axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(4)
          .tickFormat(d => `${Math.round((d as number) * 100)}%`)
          .tickSize(3)
      )
      .call(ax => {
        ax.select('.domain').remove();
        ax.selectAll('text').attr('fill', '#475569').attr('font-size', '9px');
        ax.selectAll('.tick line').attr('stroke', '#334155');
      });

    const lineGen = d3.line<TimelineRow>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value));

    grouped.forEach((groupRows, label) => {
      const paletteKey = LABEL_MAP[label] ?? label;
      const colour = ETHNICITY_COLOURS[paletteKey] ?? '#94a3b8';

      g.append('path')
        .datum(groupRows)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', colour)
        .attr('stroke-width', 2);

      const last = groupRows[groupRows.length - 1];
      if (last) {
        g.append('text')
          .attr('x', xScale(last.year) + 5)
          .attr('y', yScale(last.value) + 4)
          .attr('fill', colour)
          .attr('font-size', '9px')
          .attr('font-weight', '600')
          .text(SHORT_LABELS[label] ?? label);
      }
    });
  }, [rows]);

  return (
    <div style={{ height: 180, position: 'relative' }}>
      {rows === null && (
        <div className="absolute inset-0 animate-pulse bg-slate-800/60 rounded-lg" />
      )}
      <svg
        ref={svgRef}
        viewBox="0 0 500 180"
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: 180, display: 'block' }}
      />
    </div>
  );
}
