'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { LEVEL_COLOURS, ETHNICITY_COLOURS, EQUITY_COLOURS, GENDER_COLOURS, fmtRate } from '@/lib/palette';
import { GenderNote } from './GenderNote';
import { playHoverTone, playTransitionSweep, resumeAudio } from '@/lib/audio';
import { strings } from '@/lib/nzqa-strings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MetricKey = 'not_achieved_rate' | 'pass_rate' | 'merit_excellence' | 'achieved_rate';
type GroupByKey = 'national' | 'ethnicity' | 'equity_index_group' | 'region' | 'gender' | 'maori_nonmaori';

const METRIC_OPTIONS: { key: MetricKey; label: string; apiMetric: string; apiMetric2?: string }[] = [
  { key: 'not_achieved_rate', label: 'Fail rate',          apiMetric: 'not_achieved_rate' },
  { key: 'pass_rate',         label: 'Pass rate',          apiMetric: 'not_achieved_rate' },
  { key: 'merit_excellence',  label: 'Merit + Excellence', apiMetric: 'merit_rate', apiMetric2: 'excellence_rate' },
  { key: 'achieved_rate',     label: 'Achieved only ⚠️',   apiMetric: 'achieved_rate' },
];

const GROUP_OPTIONS: { key: GroupByKey; label: string }[] = [
  { key: 'national',           label: 'National' },
  { key: 'ethnicity',          label: 'By ethnicity' },
  { key: 'maori_nonmaori',     label: 'Māori / non-Māori' },
  { key: 'equity_index_group', label: 'By equity' },
  { key: 'region',             label: 'By region' },
  { key: 'gender',             label: 'By gender' },
];

// Categorical colour palette for groups without a dedicated lookup
const REGION_COLOURS = d3.schemeTableau10;

const YEARS = Array.from({ length: 10 }, (_, i) => 2015 + i); // 2015–2024

// Key annotation years
const ANNOTATIONS: { year: number; label: string }[] = [
  { year: 2020, label: 'COVID' },
  { year: 2023, label: 'Equity reform' },
  { year: 2024, label: 'NCEA reform' },
];

interface TooltipState {
  x: number;
  y: number;
  year: number;
  value: number;
  groupLabel: string;
  visible: boolean;
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

function colourForGroup(groupBy: GroupByKey, group: string, index: number): string {
  if (groupBy === 'ethnicity' || groupBy === 'maori_nonmaori') {
    return ETHNICITY_COLOURS[group] ?? '#8D99AE';
  }
  if (groupBy === 'equity_index_group') {
    return EQUITY_COLOURS[group] ?? '#8D99AE';
  }
  if (groupBy === 'gender') {
    return GENDER_COLOURS[group] ?? '#8D99AE';
  }
  if (groupBy === 'region') {
    return REGION_COLOURS[index % REGION_COLOURS.length] ?? '#8D99AE';
  }
  return '#8D99AE';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TimelineExplorer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Controls
  const [level, setLevel] = useState<number | null>(null); // null = all (national mode only)
  const [groupBy, setGroupBy] = useState<GroupByKey>('national');
  const [metric, setMetric] = useState<MetricKey>('not_achieved_rate');
  const [yearFrom, setYearFrom] = useState(2015);
  const [yearTo, setYearTo] = useState(2024);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, year: 0, value: 0, groupLabel: '', visible: false });

  const metricOpt = METRIC_OPTIONS.find((m) => m.key === metric) ?? METRIC_OPTIONS[0]!;

  // For grouped modes, always use level=1 unless explicitly set
  const effectiveLevel = groupBy === 'national' ? level : (level ?? 1);

  // The actual groupBy param to send to the API
  const apiGroupBy: string = groupBy === 'maori_nonmaori' ? 'ethnicity' : groupBy;

  const levelParam = effectiveLevel !== null ? `&level=${effectiveLevel}` : '';
  const yearParam = `&yearFrom=${yearFrom}&yearTo=${yearTo}`;

  // Primary fetch
  const url1 = `/api/nzqa/timeline?metric=${metricOpt.apiMetric}&groupBy=${apiGroupBy}${levelParam}${yearParam}`;
  const { data: data1, loading, error } = useNzqaData<TimelineResponse>(url1);

  // Secondary fetch (only for merit_excellence)
  const url2 = metricOpt.apiMetric2
    ? `/api/nzqa/timeline?metric=${metricOpt.apiMetric2}&groupBy=${apiGroupBy}${levelParam}${yearParam}`
    : null;
  const { data: data2 } = useNzqaData<TimelineResponse>(url2);

  // Compute display data from API responses
  const computedData = useMemo(() => {
    if (!data1) return null;

    const isNational = groupBy === 'national';
    // National data has no group_label — coerce into same shape
    const rawPoints = isNational
      ? (data1.data as Array<{ year: number; level: number; value: number; assessed_count: number }>)
          .map((d) => ({ ...d, group_label: `Level ${d.level}` }))
      : (data1.data as TimelineGroupPoint[]);

    // Apply metric transformation
    let points = rawPoints;
    if (metric === 'pass_rate') {
      points = rawPoints.map((d) => ({ ...d, value: 1 - d.value }));
    } else if (metric === 'merit_excellence' && data2) {
      const pts2 = data2.data as TimelineGroupPoint[];
      const map2 = new Map(
        pts2.map((d) => {
          const gl = isNational ? `Level ${'level' in d ? (d as { level: number }).level : 0}` : d.group_label;
          return [`${gl}|${d.year}`, d.value];
        })
      );
      points = rawPoints.map((d) => {
        const key = isNational ? `${d.group_label}|${d.year}` : `${d.group_label}|${d.year}`;
        const exc = map2.get(key) ?? 0;
        return { ...d, value: d.value + exc };
      });
    }

    // For maori_nonmaori: compute non-Māori weighted average
    if (groupBy === 'maori_nonmaori') {
      const maoriRows = points.filter((d) => d.group_label === 'Māori');
      const otherRows = points.filter((d) => d.group_label !== 'Māori');
      const years = Array.from(new Set(points.map((d) => d.year)));
      const levels = Array.from(new Set(points.map((d) => 'level' in d ? (d as { level: number }).level : 1)));

      const nonMaoriRows: typeof points = [];
      for (const yr of years) {
        for (const lvl of levels) {
          const subset = otherRows.filter((d) => d.year === yr && ('level' in d ? (d as { level: number }).level === lvl : true));
          if (subset.length === 0) continue;
          const totalCount = d3.sum(subset, (d) => ('assessed_count' in d ? (d as { assessed_count: number }).assessed_count : 0));
          const weightedValue = totalCount > 0
            ? d3.sum(subset, (d) => d.value * (('assessed_count' in d ? (d as { assessed_count: number }).assessed_count : 0)))  / totalCount
            : d3.mean(subset, (d) => d.value) ?? 0;
          nonMaoriRows.push({ ...subset[0]!, group_label: 'non-Māori', value: weightedValue, year: yr });
        }
      }
      return [...maoriRows, ...nonMaoriRows];
    }

    return points;
  }, [data1, data2, metric, groupBy]);

  // Unique series labels for legend / toggle
  const seriesLabels = useMemo(() => {
    if (!computedData) return [];
    return Array.from(new Set(computedData.map((d) => d.group_label)));
  }, [computedData]);

  const toggleSeries = useCallback((label: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }, []);

  const handleGroupByChange = useCallback((g: GroupByKey) => {
    resumeAudio();
    playTransitionSweep('up');
    setGroupBy(g);
    setHiddenSeries(new Set());
    // Equity data only from 2019
    if (g === 'equity_index_group') setYearFrom((y) => Math.max(y, 2019));
  }, []);

  const handleLevelChange = useCallback((newLevel: number | null) => {
    resumeAudio();
    playTransitionSweep('up');
    setLevel(newLevel);
  }, []);

  // -------------------------------------------------------------------------
  // D3 rendering
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!computedData || !svgRef.current || !containerRef.current) return;

    const visibleData = computedData.filter((d) => !hiddenSeries.has(d.group_label));
    if (visibleData.length === 0) return;

    const container = containerRef.current;
    const W = container.clientWidth || 800;
    const H = 320;
    const margin = { top: 24, right: 48, bottom: 48, left: 52 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    let g = svg.select<SVGGElement>('g.chart-body');
    if (g.empty()) g = svg.append('g').attr('class', 'chart-body');
    g.attr('transform', `translate(${margin.left},${margin.top})`);

    const allYears = Array.from(new Set(visibleData.map((d) => d.year)));
    const xScale = d3.scaleLinear()
      .domain([yearFrom, yearTo])
      .range([0, innerW]);

    const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // Grid
    g.selectAll('.grid-h').data(yScale.ticks(5)).join('line').attr('class', 'grid-h')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255,255,255,0.06)').attr('stroke-dasharray', '4,4');

    // Annotation vertical lines
    g.selectAll<SVGLineElement, typeof ANNOTATIONS[0]>('.annotation-line')
      .data(ANNOTATIONS.filter((a) => a.year >= yearFrom && a.year <= yearTo))
      .join('line').attr('class', 'annotation-line')
      .attr('x1', (a) => xScale(a.year)).attr('x2', (a) => xScale(a.year))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#334155').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');

    g.selectAll<SVGTextElement, typeof ANNOTATIONS[0]>('.annotation-label')
      .data(ANNOTATIONS.filter((a) => a.year >= yearFrom && a.year <= yearTo))
      .join('text').attr('class', 'annotation-label')
      .attr('x', (a) => xScale(a.year) + 3).attr('y', 8)
      .attr('fill', '#475569').style('font-size', '9px')
      .style('font-family', 'var(--font-geist-mono, monospace)')
      .text((a) => a.label);

    // Axes
    g.selectAll<SVGGElement, unknown>('.y-axis').data([null]).join('g').attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${Math.round((d as number) * 100)}%`))
      .call((ag) => {
        ag.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '11px');
        ag.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    g.selectAll<SVGGElement, unknown>('.x-axis').data([null]).join('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(allYears.length).tickFormat((d) => `${d}`))
      .call((ag) => {
        ag.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '11px');
        ag.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    // Y axis label
    svg.selectAll('.y-label').data([null]).join('text').attr('class', 'y-label')
      .attr('transform', `translate(14, ${H / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle').attr('fill', '#64748b')
      .style('font-size', '11px').style('font-family', 'var(--font-geist-mono, monospace)')
      .text(METRIC_OPTIONS.find((m) => m.key === metric)?.label.replace(' ⚠️', '') ?? 'Rate');

    const grouped = d3.group(visibleData, (d) => d.group_label);
    const seriesArr = Array.from(grouped.keys());

    const area = d3.area<typeof visibleData[0]>()
      .x((d) => xScale(d.year))
      .y0(innerH).y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const line = d3.line<typeof visibleData[0]>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Remove old series no longer in data
    g.selectAll('[class^="area-s-"],[class^="line-s-"],[class^="dot-s-"],[class^="vis-dot-s-"]').remove();

    seriesArr.forEach((label, i) => {
      const points = (grouped.get(label) ?? []).sort((a, b) => a.year - b.year);
      const colour = groupBy === 'national'
        ? (LEVEL_COLOURS[i + 1] ?? '#BA90FF')
        : colourForGroup(groupBy, label, i);

      const classSlug = `s-${i}`;

      // Area (only in national mode for a cleaner look)
      if (groupBy === 'national') {
        g.selectAll<SVGPathElement, unknown>(`.area-${classSlug}`)
          .data([points])
          .join('path').attr('class', `area-${classSlug}`)
          .transition().duration(600).ease(d3.easeBackOut.overshoot(0.3))
          .attr('d', area).attr('fill', colour).attr('fill-opacity', 0.1);
      }

      // Line
      const lineEl = g.selectAll<SVGPathElement, unknown>(`.line-${classSlug}`)
        .data([points])
        .join('path').attr('class', `line-${classSlug}`)
        .attr('fill', 'none').attr('stroke', colour)
        .attr('stroke-width', 2.5).attr('stroke-linecap', 'round');

      lineEl.transition().duration(700).ease(d3.easeCubicInOut)
        .attr('d', line);

      // Dots for interaction
      g.selectAll<SVGCircleElement, typeof points[0]>(`.dot-${classSlug}`)
        .data(points, (d) => d.year)
        .join('circle').attr('class', `dot-${classSlug}`)
        .attr('cx', (d) => xScale(d.year)).attr('cy', (d) => yScale(d.value))
        .attr('r', 18).attr('fill', 'transparent').style('cursor', 'crosshair')
        .on('mouseenter', function (event: MouseEvent, d) {
          const glabel = d.group_label;
          g.selectAll<SVGCircleElement, typeof d>(`.vis-dot-${classSlug}-${d.year}`)
            .data([d]).join('circle')
            .attr('class', `vis-dot-${classSlug}-${d.year}`)
            .attr('cx', xScale(d.year)).attr('cy', yScale(d.value))
            .attr('r', 5).attr('fill', colour).attr('stroke', '#0f172a').attr('stroke-width', 2);
          playHoverTone(d.value);
          const rect = container.getBoundingClientRect();
          setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, year: d.year, value: d.value, groupLabel: glabel, visible: true });
        })
        .on('mouseleave', function (_, d) {
          g.selectAll(`.vis-dot-${classSlug}-${d.year}`).remove();
          setTooltip((prev) => ({ ...prev, visible: false }));
        });
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedData, hiddenSeries, yearFrom, yearTo]);

  const metricLabel = METRIC_OPTIONS.find((m) => m.key === metric)?.label.replace(' ⚠️', '') ?? 'Rate';

  return (
    <div className="space-y-4">
      {/* Row 1: Group by */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500 font-mono mr-1">View:</span>
        {GROUP_OPTIONS.map((opt) => (
          <button key={opt.key} onClick={() => handleGroupByChange(opt.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer
              ${groupBy === opt.key
                ? 'bg-violet-500 text-white'
                : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Row 2: Metric + level + year range */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Metric */}
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-mono self-center mr-1">Metric:</span>
          {METRIC_OPTIONS.map((opt) => (
            <button key={opt.key}
              onClick={() => { resumeAudio(); setMetric(opt.key); }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${metric === opt.key
                  ? 'bg-slate-600 text-white border border-slate-500'
                  : 'text-slate-500 border border-slate-700 hover:border-slate-500'}`}
              title={opt.key === 'achieved_rate' ? 'Achieved grade only — does not include Merit or Excellence' : undefined}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Level (always shown) */}
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 font-mono">Level:</span>
          {(groupBy === 'national'
            ? [null, 1, 2, 3] as Array<number | null>
            : [1, 2, 3] as Array<number | null>
          ).map((lvl) => (
            <button key={lvl ?? 'all'}
              onClick={() => handleLevelChange(lvl)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                ${(groupBy === 'national' ? level : (level ?? 1)) === lvl
                  ? 'text-slate-950 shadow-md'
                  : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}
              style={(groupBy === 'national' ? level : (level ?? 1)) === lvl ? {
                background: lvl !== null ? LEVEL_COLOURS[lvl] : 'linear-gradient(to left, #BA90FF, #47A5F1)',
              } : {}}>
              {lvl === null ? 'All' : `L${lvl}`}
            </button>
          ))}
        </div>

        {/* Year range */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-mono">Years:</span>
          <select value={yearFrom}
            onChange={(e) => setYearFrom(Number(e.target.value))}
            className="bg-slate-800 text-slate-300 text-xs font-mono rounded px-2 py-1 border border-slate-700 cursor-pointer">
            {YEARS.filter((y) => y <= yearTo).map((y) => (
              <option key={y} value={y} disabled={groupBy === 'equity_index_group' && y < 2019}>{y}</option>
            ))}
          </select>
          <span className="text-slate-600 text-xs">–</span>
          <select value={yearTo}
            onChange={(e) => setYearTo(Number(e.target.value))}
            className="bg-slate-800 text-slate-300 text-xs font-mono rounded px-2 py-1 border border-slate-700 cursor-pointer">
            {YEARS.filter((y) => y >= yearFrom).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equity data note */}
      {groupBy === 'equity_index_group' && (
        <p className="text-xs text-slate-500 font-mono">Equity group data available 2019–2024 only. Equity groups replaced decile bands in 2023; pre-2023 rows use mapped equivalents.</p>
      )}
      {metric === 'achieved_rate' && (
        <div className="text-xs font-mono text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
          ⚠️ &ldquo;Achieved only&rdquo; is the minimum passing grade. Students with Merit or Excellence are <strong>not</strong> included.
        </div>
      )}

      {/* Chart */}
      <div ref={containerRef} className="relative w-full">
        {loading && <div className="animate-pulse bg-slate-800 rounded-lg h-80 w-full" />}
        {error && <div className="flex items-center justify-center h-80 text-slate-500 text-sm">{strings.error}</div>}
        {!loading && !error && <svg ref={svgRef} className="w-full" style={{ height: 320 }} />}

        {tooltip.visible && (
          <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
            <span className="text-slate-400">{tooltip.groupLabel} · {tooltip.year}</span>
            <br />
            <span className="text-white font-semibold">{fmtRate(tooltip.value)} {metricLabel.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Series legend (for grouped modes) */}
      {groupBy !== 'national' && seriesLabels.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {seriesLabels.map((label, i) => {
            const colour = colourForGroup(groupBy, label, i);
            const hidden = hiddenSeries.has(label);
            return (
              <button key={label} onClick={() => toggleSeries(label)}
                className="flex items-center gap-1.5 text-xs font-mono cursor-pointer transition-opacity"
                style={{ opacity: hidden ? 0.3 : 1 }}>
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: colour }} />
                <span className="text-slate-400">{label}</span>
              </button>
            );
          })}
          {hiddenSeries.size > 0 && (
            <button onClick={() => setHiddenSeries(new Set())}
              className="text-xs font-mono text-slate-600 hover:text-slate-400 cursor-pointer">
              Show all
            </button>
          )}
        </div>
      )}

      {groupBy === 'gender' && <GenderNote />}
      <p className="text-xs text-slate-500 font-mono">{strings.dataNote}</p>
    </div>
  );
}
