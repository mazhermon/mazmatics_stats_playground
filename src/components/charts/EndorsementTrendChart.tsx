'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fmtRate, ETHNICITY_COLOURS, GENDER_COLOURS } from '@/lib/palette';
import { GenderNote } from './GenderNote';

type Qualification = 'NCEA Level 1' | 'NCEA Level 2' | 'NCEA Level 3' | 'University Entrance';
type ViewMode = 'national' | 'ethnicity' | 'gender';

interface NationalRow {
  year: number;
  excellence_rate: number | null;
  merit_rate: number | null;
  no_endorsement_rate: number | null;
  total_attainment: number | null;
}

interface GroupedRow {
  year: number;
  group_label: string;
  excellence_rate: number | null;
  merit_rate: number | null;
  no_endorsement_rate: number | null;
  total_attainment: number | null;
}

const ETHNICITY_DISPLAY: Record<string, string> = {
  Maori: 'Māori',
  European: 'NZ European / Pākehā',
  'Middle Eastern/Latin American/African': 'MELAA',
  'Pacific Peoples': 'Pacific Peoples',
  Asian: 'Asian',
};

const ENDORSEMENT_ETHNICITY_COLOURS: Record<string, string> = {
  Maori: ETHNICITY_COLOURS['Māori'] ?? '#EE6677',
  European: ETHNICITY_COLOURS['European'] ?? '#4477AA',
  Asian: ETHNICITY_COLOURS['Asian'] ?? '#66CCEE',
  'Pacific Peoples': ETHNICITY_COLOURS['Pacific Peoples'] ?? '#CCBB44',
  'Middle Eastern/Latin American/African': ETHNICITY_COLOURS['MELAA'] ?? '#228833',
};

const BAND_COLOURS = {
  excellence: '#FFF73E',
  merit: '#BA90FF',
  no_endorsement: '#1e3a5f',
} as const;

const QUAL_LABELS: Record<Qualification, string> = {
  'NCEA Level 1': 'L1',
  'NCEA Level 2': 'L2',
  'NCEA Level 3': 'L3',
  'University Entrance': 'UE',
};

export function EndorsementTrendChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [qualification, setQualification] = useState<Qualification>('NCEA Level 3');
  const [view, setView] = useState<ViewMode>('national');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nationalData, setNationalData] = useState<NationalRow[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedRow[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string; visible: boolean }>({
    x: 0, y: 0, html: '', visible: false,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    const groupBy = view === 'national' ? 'national' : view;
    fetch(`/api/nzqa/endorsement?qualification=${encodeURIComponent(qualification)}&groupBy=${groupBy}`)
      .then((r) => r.json())
      .then((json: { error?: string; data: NationalRow[] | GroupedRow[] }) => {
        if (json.error) throw new Error(json.error);
        if (view === 'national') {
          setNationalData(json.data as NationalRow[]);
          setGroupedData([]);
        } else {
          setGroupedData(json.data as GroupedRow[]);
          setNationalData([]);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [qualification, view]);

  useEffect(() => {
    const el = svgRef.current;
    const container = containerRef.current;
    if (!el || !container || loading || error) return;

    const w = container.clientWidth || 720;
    const h = 300;
    const margin = { top: 24, right: view === 'national' ? 110 : 120, bottom: 40, left: 52 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const svg = d3.select(el);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('height', h);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    if (view === 'national' && nationalData.length > 0) {
      type StackDatum = { year: number; excellence: number; merit: number; no_endorsement: number };
      const stackData: StackDatum[] = nationalData.map((d) => ({
        year: d.year,
        excellence: d.excellence_rate ?? 0,
        merit: d.merit_rate ?? 0,
        no_endorsement: d.no_endorsement_rate ?? 0,
      }));

      const years = stackData.map((d) => d.year);
      const x = d3.scaleLinear()
        .domain([d3.min(years)! - 0.5, d3.max(years)! + 0.5])
        .range([0, innerW]);
      const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ''))
        .call((ax) => ax.select('.domain').remove())
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#1e293b').attr('stroke-dasharray', '3,3'));

      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat((d) => String(d)))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${((d as number) * 100).toFixed(0)}%`))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      const stack = d3.stack<StackDatum>()
        .keys(['no_endorsement', 'merit', 'excellence'])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stacked = stack(stackData);
      const area = d3.area<d3.SeriesPoint<StackDatum>>()
        .x((d) => x(d.data.year))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]))
        .curve(d3.curveMonotoneX);

      g.selectAll('.band')
        .data(stacked)
        .join('path')
        .attr('class', 'band')
        .attr('d', area)
        .attr('fill', (d) => BAND_COLOURS[d.key as keyof typeof BAND_COLOURS] ?? '#555')
        .attr('opacity', 0.9);

      const bisect = d3.bisector<StackDatum, number>((d) => d.year).left;
      const overlay = g.append('rect')
        .attr('width', innerW).attr('height', innerH)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair');

      const vLine = g.append('line')
        .attr('stroke', '#94a3b8').attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
        .attr('y1', 0).attr('y2', innerH).attr('opacity', 0);

      overlay
        .on('mousemove', (event: MouseEvent) => {
          const [mx] = d3.pointer(event);
          const yr = Math.round(x.invert(mx));
          const idx = bisect(stackData, yr, 0);
          const d = stackData[Math.min(idx, stackData.length - 1)];
          if (!d) return;
          vLine.attr('x1', x(d.year)).attr('x2', x(d.year)).attr('opacity', 1);
          const endorsedRate = d.excellence + d.merit;
          const rect = container.getBoundingClientRect();
          setTooltip({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            html: `<strong>${d.year}</strong><br/>Endorsed: <strong>${fmtRate(endorsedRate)}</strong><br/>Excellence: ${fmtRate(d.excellence)}<br/>Merit: ${fmtRate(d.merit)}<br/>No Endorsement: ${fmtRate(d.no_endorsement)}`,
            visible: true,
          });
        })
        .on('mouseleave', () => {
          vLine.attr('opacity', 0);
          setTooltip((t) => ({ ...t, visible: false }));
        });

      const legend = svg.append('g').attr('transform', `translate(${w - margin.right + 10},${margin.top + 10})`);
      ([
        { label: 'Excellence', color: BAND_COLOURS.excellence },
        { label: 'Merit', color: BAND_COLOURS.merit },
        { label: 'No Endorsement', color: '#374151' },
      ] as { label: string; color: string }[]).forEach((item, i) => {
        const row = legend.append('g').attr('transform', `translate(0,${i * 22})`);
        row.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', item.color);
        row.append('text').attr('x', 16).attr('y', 10).attr('fill', '#94a3b8').attr('font-size', '11px').text(item.label);
      });
    } else if (view !== 'national' && groupedData.length > 0) {
      const groups = [...new Set(groupedData.map((d) => d.group_label))];
      const years = [...new Set(groupedData.map((d) => d.year))].sort();

      const byGroupYear = new Map<string, Map<number, number>>();
      groupedData.forEach((d) => {
        if (!byGroupYear.has(d.group_label)) byGroupYear.set(d.group_label, new Map());
        byGroupYear.get(d.group_label)!.set(d.year, (d.excellence_rate ?? 0) + (d.merit_rate ?? 0));
      });

      const allValues = groupedData.map((d) => (d.excellence_rate ?? 0) + (d.merit_rate ?? 0));
      const yMax = Math.max(0.6, (d3.max(allValues) ?? 0.6) * 1.1);

      const x = d3.scaleLinear()
        .domain([d3.min(years)! - 0.5, d3.max(years)! + 0.5])
        .range([0, innerW]);
      const y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ''))
        .call((ax) => ax.select('.domain').remove())
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#1e293b').attr('stroke-dasharray', '3,3'));

      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat((d) => String(d)))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${((d as number) * 100).toFixed(0)}%`))
        .call((ax) => ax.select('.domain').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('.tick line').attr('stroke', '#475569'))
        .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'));

      const lineGen = d3.line<{ year: number; value: number }>()
        .x((d) => x(d.year))
        .y((d) => y(d.value))
        .defined((d) => !isNaN(d.value) && d.value !== null)
        .curve(d3.curveMonotoneX);

      const lineColours = view === 'ethnicity' ? ENDORSEMENT_ETHNICITY_COLOURS : GENDER_COLOURS;

      groups.forEach((group) => {
        const groupMap = byGroupYear.get(group)!;
        const lineData = years.map((yr) => ({ year: yr, value: groupMap.get(yr) ?? NaN }));
        const color = lineColours[group] ?? '#888888';
        const displayLbl = view === 'ethnicity' ? (ETHNICITY_DISPLAY[group] ?? group) : group;

        g.append('path')
          .datum(lineData)
          .attr('d', lineGen)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2.5)
          .attr('opacity', 0.9);

        const lastPt = lineData.filter((d) => !isNaN(d.value)).at(-1);
        if (lastPt) {
          g.append('circle')
            .attr('cx', x(lastPt.year))
            .attr('cy', y(lastPt.value))
            .attr('r', 4)
            .attr('fill', color);
          const shortLabel = displayLbl.split(' ')[0] ?? displayLbl;
          svg
            .append('text')
            .attr('x', margin.left + x(lastPt.year) + 8)
            .attr('y', margin.top + y(lastPt.value) + 4)
            .attr('fill', color)
            .attr('font-size', '10px')
            .text(shortLabel);
        }
      });

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .text('Endorsement rate (Excellence + Merit)');
    }
  }, [nationalData, groupedData, view, loading, error]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Qualification selector */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(['NCEA Level 1', 'NCEA Level 2', 'NCEA Level 3', 'University Entrance'] as Qualification[]).map((q) => (
            <button
              key={q}
              onClick={() => setQualification(q)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                qualification === q ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {QUAL_LABELS[q]}
            </button>
          ))}
        </div>
        {/* View mode */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(
            [
              ['national', 'National'],
              ['ethnicity', 'By Ethnicity'],
              ['gender', 'By Gender'],
            ] as [ViewMode, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === v ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="w-full bg-slate-900/50 rounded-xl p-4 relative overflow-visible">
        {loading && <div className="animate-pulse bg-slate-800 rounded-xl h-72" />}
        {error && <div className="text-red-400 text-sm p-4">Error: {error}</div>}
        {!loading && !error && <svg ref={svgRef} className="w-full" />}

        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-10 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl whitespace-nowrap"
            style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
          />
        )}
      </div>

      {view === 'national' && (
        <p className="text-xs text-slate-500 font-mono">
          Gold band = Excellence endorsement · Purple band = Merit endorsement · Dark base = No endorsement (passed but unendorsed)
        </p>
      )}
      {view === 'gender' && <GenderNote />}
    </div>
  );
}
