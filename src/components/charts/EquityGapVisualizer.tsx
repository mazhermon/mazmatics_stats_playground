'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS, fmtRate } from '@/lib/palette';
import { playHoverTone, playSelectChord, playTransitionSweep, resumeAudio } from '@/lib/audio';
import { strings } from '@/lib/nzqa-strings';

type GroupMode = 'ethnicity' | 'equity_index_group';

// Metric options — some are API columns, some are computed from two API columns
type MetricKey = 'not_achieved_rate' | 'pass_rate' | 'merit_excellence' | 'achieved_rate';

const METRIC_OPTIONS: { key: MetricKey; label: string; apiMetric: string; apiMetric2?: string }[] = [
  { key: 'not_achieved_rate', label: 'Fail rate (Not Achieved)', apiMetric: 'not_achieved_rate' },
  { key: 'pass_rate',         label: 'Overall pass rate',         apiMetric: 'not_achieved_rate' },
  { key: 'merit_excellence',  label: 'Merit + Excellence',        apiMetric: 'merit_rate', apiMetric2: 'excellence_rate' },
  { key: 'achieved_rate',     label: 'Achieved only ⚠️',          apiMetric: 'achieved_rate' },
];

interface TooltipState {
  x: number;
  y: number;
  group: string;
  year: number;
  value: number;
  visible: boolean;
}

const LOCAL_EQUITY_COLOURS: Record<string, string> = {
  'Fewer': '#EE6677',
  'Moderate': '#CCBB44',
  'Middle': '#CCBB44',
  'More': '#4477AA',
  'Decile 1-3': '#EE6677',
  'Decile 4-7': '#CCBB44',
  'Decile 8-10': '#4477AA',
};

const ETHNICITY_ORDER = ['Pacific Peoples', 'Māori', 'Other', 'MELAA', 'Asian', 'NZ European / Pākehā', 'NZ European', 'European'];
const EQUITY_ORDER = ['Fewer', 'Decile 1-3', 'Moderate', 'Middle', 'Decile 4-7', 'More', 'Decile 8-10'];

export function EquityGapVisualizer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<GroupMode>('ethnicity');
  const [level, setLevel] = useState(1);
  const [metric, setMetric] = useState<MetricKey>('not_achieved_rate');
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, group: '', year: 0, value: 0, visible: false });

  const metricOpt = METRIC_OPTIONS.find((m) => m.key === metric) ?? METRIC_OPTIONS[0]!;

  // Primary API fetch
  const url1 = `/api/nzqa/timeline?metric=${metricOpt.apiMetric}&groupBy=${mode}&level=${level}`;
  const { data: data1, loading, error } = useNzqaData<TimelineResponse>(url1);

  // Secondary fetch only for merit_excellence (need to sum merit + excellence)
  const url2 = metricOpt.apiMetric2
    ? `/api/nzqa/timeline?metric=${metricOpt.apiMetric2}&groupBy=${mode}&level=${level}`
    : null;
  const { data: data2 } = useNzqaData<TimelineResponse>(url2);

  // Combine and transform data based on selected metric
  const computedData = useMemo(() => {
    if (!data1) return null;
    const points = data1.data as TimelineGroupPoint[];

    if (metric === 'pass_rate') {
      // 1 - not_achieved_rate
      return points.map((d) => ({ ...d, value: d.value !== null ? 1 - d.value : d.value }));
    }

    if (metric === 'merit_excellence' && data2) {
      // merit_rate + excellence_rate
      const pts2 = data2.data as TimelineGroupPoint[];
      const map2 = new Map(pts2.map((d) => [`${d.group_label}|${d.year}|${d.level}`, d.value]));
      return points.map((d) => {
        const exc = map2.get(`${d.group_label}|${d.year}|${d.level}`) ?? 0;
        return { ...d, value: d.value + exc };
      });
    }

    return points;
  }, [data1, data2, metric]);

  const handleModeChange = useCallback((m: GroupMode) => {
    resumeAudio();
    playTransitionSweep();
    setMode(m);
    setHighlighted(null);
  }, []);

  useEffect(() => {
    if (!computedData || !svgRef.current || !containerRef.current) return;

    const points = computedData;
    if (points.length === 0) return;

    const container = containerRef.current;
    const W = container.clientWidth || 800;
    const H = 360;
    const margin = { top: 24, right: 160, bottom: 48, left: 52 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const groups = Array.from(new Set(points.map((d) => d.group_label))).sort((a, b) => {
      const order = mode === 'ethnicity' ? ETHNICITY_ORDER : EQUITY_ORDER;
      const ia = order.findIndex((o) => a.includes(o) || o.includes(a));
      const ib = order.findIndex((o) => b.includes(o) || o.includes(b));
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    const colours = mode === 'ethnicity' ? ETHNICITY_COLOURS : LOCAL_EQUITY_COLOURS;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    let g = svg.select<SVGGElement>('g.chart-body');
    if (g.empty()) g = svg.append('g').attr('class', 'chart-body');
    g.attr('transform', `translate(${margin.left},${margin.top})`);

    const grouped = d3.group(points, (d) => d.group_label);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(points, (d) => d.year) as [number, number])
      .range([0, innerW]);

    const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // Grid
    g.selectAll('.grid-h')
      .data(yScale.ticks(5))
      .join('line').attr('class', 'grid-h')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-dasharray', '4,4');

    // Reference line at 50%
    g.selectAll('.ref-50')
      .data([0.5])
      .join('line').attr('class', 'ref-50')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yScale(0.5)).attr('y2', yScale(0.5))
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('stroke-dasharray', '8,4');

    g.selectAll('.ref-50-label')
      .data([0.5])
      .join('text').attr('class', 'ref-50-label')
      .attr('x', innerW + 4).attr('y', yScale(0.5) + 4)
      .attr('fill', '#475569')
      .style('font-size', '10px')
      .style('font-family', 'var(--font-geist-mono, monospace)')
      .text('50%');

    // Axes
    g.selectAll<SVGGElement, unknown>('.y-axis').data([null]).join('g').attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${Math.round((d as number) * 100)}%`))
      .call((ag) => {
        ag.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '11px');
        ag.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    g.selectAll<SVGGElement, unknown>('.x-axis').data([null]).join('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat((d) => `${d}`))
      .call((ag) => {
        ag.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '11px');
        ag.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    const line = d3.line<TimelineGroupPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Collision-free end labels
    const labelPositions = new Map<string, number>();
    {
      const lastPoints = groups.map((group) => {
        const gp = (grouped.get(group) ?? []).sort((a, b) => a.year - b.year);
        const last = gp[gp.length - 1];
        return { group, y: last ? yScale(last.value) + 4 : null };
      }).filter((d): d is { group: string; y: number } => d.y !== null);

      lastPoints.sort((a, b) => a.y - b.y);
      const MIN_GAP = 12;
      for (let k = 1; k < lastPoints.length; k++) {
        const prev = lastPoints[k - 1]!;
        const curr = lastPoints[k]!;
        if (curr.y - prev.y < MIN_GAP) curr.y = prev.y + MIN_GAP;
      }
      lastPoints.forEach((d) => labelPositions.set(d.group, d.y));
    }

    // Draw each group line
    groups.forEach((group, i) => {
      const groupPoints = (grouped.get(group) ?? []).sort((a, b) => a.year - b.year);
      const colour = colours[group] ?? colours[group.split(' / ')[0] ?? ''] ?? '#8D99AE';
      const isHighlighted = highlighted === null || highlighted === group;
      const opacity = isHighlighted ? 1 : 0.15;

      g.selectAll<SVGPathElement, unknown>(`.line-${i}`)
        .data([groupPoints])
        .join('path')
        .attr('class', `line-${i}`)
        .attr('fill', 'none')
        .attr('stroke', colour)
        .attr('stroke-width', highlighted === group ? 3.5 : 2)
        .attr('stroke-linecap', 'round')
        .transition()
        .duration(600)
        .ease(d3.easeQuadInOut)
        .attr('stroke-opacity', opacity)
        .attr('d', line);

      const last = groupPoints[groupPoints.length - 1];
      if (last) {
        g.selectAll<SVGTextElement, unknown>(`.end-label-${i}`)
          .data([last])
          .join('text')
          .attr('class', `end-label-${i}`)
          .attr('x', xScale(last.year) + 8)
          .attr('y', labelPositions.get(group) ?? yScale(last.value) + 4)
          .attr('fill', colour)
          .style('font-size', '10px')
          .style('font-family', 'var(--font-geist-mono, monospace)')
          .style('font-weight', highlighted === group ? '700' : '400')
          .transition().duration(300)
          .attr('opacity', isHighlighted ? 1 : 0.2)
          .text(group.replace(' / Pākehā', '').replace(' Region', ''));
      }

      // Invisible hover area
      g.selectAll<SVGPathElement, unknown>(`.hover-line-${i}`)
        .data([groupPoints])
        .join('path')
        .attr('class', `hover-line-${i}`)
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 20)
        .attr('d', line)
        .style('cursor', 'pointer')
        .on('mouseenter', function () {
          resumeAudio();
          const avg = d3.mean(groupPoints, (d) => d.value) ?? 0;
          playHoverTone(avg, 0.06);
          setHighlighted(group);
        })
        .on('click', function () {
          resumeAudio();
          const avg = d3.mean(groupPoints, (d) => d.value) ?? 0;
          playSelectChord(avg);
          setHighlighted((h) => h === group ? null : group);
        })
        .on('mousemove', function (event: MouseEvent) {
          const rect = container.getBoundingClientRect();
          const mouseX = event.clientX - rect.left - margin.left;
          const year = Math.round(xScale.invert(mouseX));
          const pt = groupPoints.find((d) => d.year === year);
          if (pt) {
            setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, group, year, value: pt.value, visible: true });
          }
        })
        .on('mouseleave', function () {
          setHighlighted(null);
          setTooltip((prev) => ({ ...prev, visible: false }));
        });
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedData, highlighted]);

  const currentMetricLabel = metricOpt.label.replace(' ⚠️', '');

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Group mode */}
        <div className="flex gap-2">
          {(['ethnicity', 'equity_index_group'] as GroupMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer
                ${mode === m
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 border border-slate-700 hover:border-slate-500'
                }`}
            >
              {m === 'ethnicity' ? 'By ethnicity' : 'By equity group'}
            </button>
          ))}
        </div>

        {/* Level */}
        <div className="flex gap-2">
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => { resumeAudio(); setLevel(lvl); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${level === lvl ? 'text-slate-950 bg-violet-400' : 'text-slate-500 border border-slate-700 hover:border-slate-500'}`}
            >
              L{lvl}
            </button>
          ))}
        </div>

        {/* Metric */}
        <div className="flex gap-2 flex-wrap">
          {METRIC_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { resumeAudio(); setMetric(opt.key); setHighlighted(null); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${metric === opt.key
                  ? 'bg-slate-600 text-white border border-slate-500'
                  : 'text-slate-500 border border-slate-700 hover:border-slate-500'
                }`}
              title={opt.key === 'achieved_rate' ? '"Achieved only" is the minimum passing grade — does not include Merit or Excellence.' : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achieved-only warning */}
      {metric === 'achieved_rate' && (
        <div className="text-xs font-mono text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
          ⚠️ &ldquo;Achieved only&rdquo; = the minimum passing grade. Students who got Merit or Excellence are <strong>not</strong> counted here.
          Groups with more top grades (e.g. Asian) will appear to have <em>lower</em> achievement than groups with fewer Merit/Excellence passes.
          Use &ldquo;Fail rate&rdquo; or &ldquo;Overall pass rate&rdquo; for a fair comparison.
        </div>
      )}

      {/* Equity data range note */}
      {mode === 'equity_index_group' && (
        <p className="text-xs text-slate-500 font-mono">Equity group data available 2019–2024 only.</p>
      )}

      {/* Chart */}
      <div ref={containerRef} className="relative w-full">
        {loading && <div className="animate-pulse bg-slate-800 rounded-lg h-[360px] w-full" />}
        {error && <div className="flex items-center justify-center h-[360px] text-slate-500 text-sm">{strings.error}</div>}
        {!loading && !error && <svg ref={svgRef} className="w-full" style={{ height: 360 }} />}

        {tooltip.visible && (
          <div
            className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
          >
            <span className="text-slate-400">{tooltip.group} · {tooltip.year}</span>
            <br />
            <span className="text-white font-semibold">{fmtRate(tooltip.value)} {currentMetricLabel.toLowerCase()}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono">{strings.dataNote}</p>
    </div>
  );
}
