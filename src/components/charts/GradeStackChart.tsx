'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { fmtRate } from '@/lib/palette';
import { resumeAudio } from '@/lib/audio';
import { strings } from '@/lib/nzqa-strings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GroupMode = 'national' | 'ethnicity' | 'equity_index_group' | 'gender';

const GRADE_BANDS = [
  { key: 'not_achieved', label: 'Not Achieved', color: '#ef4444' },
  { key: 'achieved',     label: 'Achieved',     color: '#f59e0b' },
  { key: 'merit',        label: 'Merit',        color: '#6366f1' },
  { key: 'excellence',   label: 'Excellence',   color: '#10b981' },
] as const;

type BandKey = typeof GRADE_BANDS[number]['key'];

const KNOWN_GROUPS: Record<GroupMode, string[]> = {
  national:           [],
  // DB values — 'European' is the stored value, displayed as 'NZ European / Pākehā' via DISPLAY_LABELS
  ethnicity:          ['Asian', 'European', 'MELAA', 'Māori', 'Pacific Peoples'],
  equity_index_group: ['Fewer', 'Moderate', 'More'],
  gender:             ['Female', 'Male'],
};

// Display label overrides for dropdown options
const DISPLAY_LABELS: Record<string, string> = {
  'European':  'NZ European / Pākehā',
  'Fewer':     'Fewer resources (equiv. low decile)',
  'Moderate':  'Moderate resources',
  'More':      'More resources (equiv. high decile)',
};

const ANNOTATIONS = [
  { year: 2020, label: 'COVID' },
  { year: 2024, label: 'NCEA reform' },
];

interface StackRow {
  year: number;
  not_achieved: number;
  achieved: number;
  merit: number;
  excellence: number;
}

interface TooltipState {
  x: number;
  y: number;
  row: StackRow | null;
  visible: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GradeStackChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState(1);
  const [groupMode, setGroupMode] = useState<GroupMode>('national');
  const [groupValue, setGroupValue] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, row: null, visible: false });

  // When groupMode changes, reset groupValue to the first known group (or null for national)
  const availableGroups = KNOWN_GROUPS[groupMode];

  const levelParam = `&level=${level}`;
  const apiGroupBy = groupMode === 'national' ? 'national' : groupMode;

  // Fetch all 4 grade metrics in parallel
  const naUrl  = `/api/nzqa/timeline?metric=not_achieved_rate&groupBy=${apiGroupBy}${levelParam}`;
  const achUrl = `/api/nzqa/timeline?metric=achieved_rate&groupBy=${apiGroupBy}${levelParam}`;
  const merUrl = `/api/nzqa/timeline?metric=merit_rate&groupBy=${apiGroupBy}${levelParam}`;
  const excUrl = `/api/nzqa/timeline?metric=excellence_rate&groupBy=${apiGroupBy}${levelParam}`;

  const { data: naData,  loading: l1 } = useNzqaData<TimelineResponse>(naUrl);
  const { data: achData, loading: l2 } = useNzqaData<TimelineResponse>(achUrl);
  const { data: merData, loading: l3 } = useNzqaData<TimelineResponse>(merUrl);
  const { data: excData, loading: l4 } = useNzqaData<TimelineResponse>(excUrl);

  const loading = l1 || l2 || l3 || l4;

  // Build stacked rows
  const stackData = useMemo<StackRow[]>(() => {
    if (!naData || !achData || !merData || !excData) return [];

    const isNational = groupMode === 'national';

    const filterRows = (d: TimelineResponse) => {
      const pts = d.data as TimelineGroupPoint[];
      if (isNational) return pts;
      return pts.filter((r) =>
        groupValue ? r.group_label === groupValue : true
      );
    };

    const naRows  = filterRows(naData);
    const achRows = filterRows(achData);
    const merRows = filterRows(merData);
    const excRows = filterRows(excData);

    const years = Array.from(new Set(naRows.map((r) => r.year))).sort();

    return years.map((yr) => {
      const naVal  = naRows.find((r) => r.year === yr)?.value ?? 0;
      const achVal = achRows.find((r) => r.year === yr)?.value ?? 0;
      const merVal = merRows.find((r) => r.year === yr)?.value ?? 0;
      const excVal = excRows.find((r) => r.year === yr)?.value ?? 0;
      return { year: yr, not_achieved: naVal, achieved: achVal, merit: merVal, excellence: excVal };
    });
  }, [naData, achData, merData, excData, groupMode, groupValue]);

  // D3 rendering
  useEffect(() => {
    if (!stackData.length || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth || 800;
    const H = 280;
    const margin = { top: 20, right: 24, bottom: 40, left: 52 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    let g = svg.select<SVGGElement>('g.stack-body');
    if (g.empty()) g = svg.append('g').attr('class', 'stack-body');
    g.attr('transform', `translate(${margin.left},${margin.top})`);

    const keys: BandKey[] = ['not_achieved', 'achieved', 'merit', 'excellence'];
    const colourMap = Object.fromEntries(GRADE_BANDS.map((b) => [b.key, b.color]));

    const stackGen = d3.stack<StackRow, BandKey>().keys(keys).order(d3.stackOrderNone).offset(d3.stackOffsetNone);
    const series = stackGen(stackData);

    const xScale = d3.scaleBand()
      .domain(stackData.map((d) => String(d.year)))
      .range([0, innerW]).padding(0.12);

    const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]).nice();

    // Axes
    g.selectAll<SVGGElement, unknown>('.x-axis').data([null]).join('g').attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .call((ax) => {
        ax.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '10px');
        ax.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    g.selectAll<SVGGElement, unknown>('.y-axis').data([null]).join('g').attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${Math.round((d as number) * 100)}%`))
      .call((ax) => {
        ax.selectAll('text').style('fill', '#94a3b8').style('font-family', 'var(--font-geist-mono, monospace)').style('font-size', '11px');
        ax.selectAll('line, path').style('stroke', 'rgba(255,255,255,0.1)');
      });

    // Grid
    g.selectAll('.grid-h').data(yScale.ticks(5)).join('line').attr('class', 'grid-h')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', (d) => yScale(d)).attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(255,255,255,0.05)').attr('stroke-dasharray', '3,3');

    // Stacked bars
    g.selectAll<SVGGElement, d3.Series<StackRow, BandKey>>('.band-group')
      .data(series, (d) => d.key)
      .join('g').attr('class', 'band-group')
      .attr('fill', (d) => colourMap[d.key] ?? '#888')
      .selectAll<SVGRectElement, d3.SeriesPoint<StackRow>>('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => xScale(String(d.data.year)) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => Math.max(0, yScale(d[0]) - yScale(d[1])));

    // Annotation lines
    ANNOTATIONS.forEach(({ year, label }) => {
      const xPos = (xScale(String(year)) ?? 0) + xScale.bandwidth() / 2;
      g.selectAll<SVGLineElement, unknown>(`.ann-line-${year}`).data([null]).join('line')
        .attr('class', `ann-line-${year}`)
        .attr('x1', xPos).attr('x2', xPos).attr('y1', 0).attr('y2', innerH)
        .attr('stroke', '#475569').attr('stroke-width', 1).attr('stroke-dasharray', '4,3');
      g.selectAll<SVGTextElement, unknown>(`.ann-label-${year}`).data([null]).join('text')
        .attr('class', `ann-label-${year}`)
        .attr('x', xPos + 3).attr('y', 10)
        .attr('fill', '#64748b').style('font-size', '9px')
        .style('font-family', 'var(--font-geist-mono, monospace)')
        .text(label);
    });

    // Invisible hover rects for tooltip
    g.selectAll<SVGRectElement, StackRow>('.hover-bar')
      .data(stackData, (d) => d.year)
      .join('rect').attr('class', 'hover-bar')
      .attr('x', (d) => xScale(String(d.year)) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('y', 0).attr('height', innerH)
      .attr('fill', 'transparent').style('cursor', 'crosshair')
      .on('mouseenter', function (event: MouseEvent, d) {
        const rect = container.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, row: d, visible: true });
        d3.select(this).attr('fill', 'rgba(255,255,255,0.04)');
      })
      .on('mousemove', function (event: MouseEvent, d) {
        const rect = container.getBoundingClientRect();
        setTooltip((prev) => ({ ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top }));
      })
      .on('mouseleave', function () {
        setTooltip((prev) => ({ ...prev, visible: false }));
        d3.select(this).attr('fill', 'transparent');
      });

  }, [stackData]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Level */}
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 font-mono">Level:</span>
          {[1, 2, 3].map((lvl) => (
            <button key={lvl} onClick={() => { resumeAudio(); setLevel(lvl); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${level === lvl ? 'bg-violet-500 text-white' : 'text-slate-500 border border-slate-700 hover:border-slate-500'}`}>
              L{lvl}
            </button>
          ))}
        </div>

        {/* Group mode */}
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-xs text-slate-500 font-mono">Group:</span>
          {(['national', 'ethnicity', 'equity_index_group', 'gender'] as GroupMode[]).map((m) => (
            <button key={m}
              onClick={() => { resumeAudio(); setGroupMode(m); setGroupValue(KNOWN_GROUPS[m][0] ?? null); }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${groupMode === m ? 'bg-slate-600 text-white border border-slate-500' : 'text-slate-500 border border-slate-700 hover:border-slate-500'}`}>
              {m === 'national' ? 'National' : m === 'ethnicity' ? 'Ethnicity' : m === 'equity_index_group' ? 'Equity' : 'Gender'}
            </button>
          ))}
        </div>

        {/* Group value (when not national) */}
        {groupMode !== 'national' && availableGroups.length > 0 && (
          <select value={groupValue ?? ''} onChange={(e) => setGroupValue(e.target.value || null)}
            className="bg-slate-800 text-slate-300 text-xs font-mono rounded px-2 py-1 border border-slate-700 cursor-pointer">
            {availableGroups.map((g) => (
              <option key={g} value={g}>{DISPLAY_LABELS[g] ?? g}</option>
            ))}
          </select>
        )}
      </div>

      {groupMode === 'equity_index_group' && (
        <p className="text-xs text-slate-500 font-mono">Equity group data available 2019–2024 only.</p>
      )}

      {/* Chart */}
      <div ref={containerRef} className="relative w-full">
        {loading && <div className="animate-pulse bg-slate-800 rounded-lg h-[280px] w-full" />}
        {!loading && (
          <svg ref={svgRef} className="w-full" style={{ height: 280 }} />
        )}

        {tooltip.visible && tooltip.row && (
          <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl space-y-1"
            style={{ left: tooltip.x + 12, top: tooltip.y - 80 }}>
            <span className="text-slate-300 font-semibold">{tooltip.row.year}</span>
            {GRADE_BANDS.map((b) => (
              <div key={b.key} className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: b.color }} />
                <span className="text-slate-400">{b.label}:</span>
                <span className="text-white">{fmtRate(tooltip.row![b.key])}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {GRADE_BANDS.map((b) => (
          <div key={b.key} className="flex items-center gap-1.5 text-xs font-mono">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: b.color }} />
            <span className="text-slate-400">{b.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 font-mono">{strings.dataNote}</p>
    </div>
  );
}
