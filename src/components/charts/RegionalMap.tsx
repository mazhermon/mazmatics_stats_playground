'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';

interface RegionProperties {
  REGC_name: string;
  REGC_code: string;
  [key: string]: unknown;
}

import { useNzqaData, type TimelineResponse, type TimelineGroupPoint, type SubjectResponse } from '@/lib/hooks/useNzqaData';
import { LEVEL_COLOURS, choroplethColour, fmtRate } from '@/lib/palette';
import { playSelectChord, playHoverTone, resumeAudio } from '@/lib/audio';

type MapMetric = 'not_achieved_rate' | 'pass_rate' | 'merit_excellence';

const MAP_METRIC_OPTIONS: { key: MapMetric; label: string; apiMetric: string; apiMetric2?: string }[] = [
  { key: 'not_achieved_rate', label: 'Fail rate',          apiMetric: 'not_achieved_rate' },
  { key: 'pass_rate',         label: 'Pass rate',          apiMetric: 'not_achieved_rate' },
  { key: 'merit_excellence',  label: 'Merit + Excellence', apiMetric: 'merit_rate', apiMetric2: 'excellence_rate' },
];

interface DrilldownData {
  region: string;
  byLevel: Array<{
    level: number;
    not_achieved_rate: number | null;
    achieved_rate: number | null;
    merit_rate: number | null;
    excellence_rate: number | null;
  }>;
}

// Map NZQA region names → TopoJSON REGC_name
const NZQA_TO_TOPOJSON: Record<string, string> = {
  'Auckland':            'Auckland Region',
  'Bay of Plenty':       'Bay of Plenty Region',
  'Canterbury':          'Canterbury Region',
  'Gisborne':            'Gisborne Region',
  "Hawke's Bay":         "Hawke's Bay Region",
  'Manawatu-Whanganui':  'Manawatū-Whanganui Region',
  'Marlborough':         'Marlborough Region',
  'Nelson':              'Nelson Region',
  'Northland':           'Northland Region',
  'Otago':               'Otago Region',
  'Southland':           'Southland Region',
  'Taranaki':            'Taranaki Region',
  'Tasman':              'Tasman Region',
  'Waikato':             'Waikato Region',
  'Wellington':          'Wellington Region',
  'West Coast':          'West Coast Region',
};

const MAP_YEARS = Array.from({ length: 10 }, (_, i) => 2015 + i); // 2015–2024

// ---------------------------------------------------------------------------
// Region ranking panel
// ---------------------------------------------------------------------------

function RegionRanking({
  regionRates,
  metricLabel,
  year,
  level,
  onSelect,
}: {
  regionRates: Map<string, number | null>;
  metricLabel: string;
  year: number;
  level: number;
  onSelect: (region: string) => void;
}) {
  const ranked = useMemo(() => {
    const entries = Array.from(regionRates.entries())
      .filter((e): e is [string, number] => e[1] !== null)
      .sort((a, b) => b[1] - a[1]); // highest value first
    return entries;
  }, [regionRates]);

  const maxVal = ranked[0]?.[1] ?? 1;

  if (ranked.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 border-dashed flex items-center justify-center min-h-[200px]">
        <p className="text-slate-600 text-sm text-center">Loading regional data…</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 max-h-[480px] overflow-y-auto">
      <p className="text-xs text-slate-500 font-mono mb-3">
        All regions · {metricLabel} · L{level} · {year}
      </p>
      <div className="space-y-2">
        {ranked.map(([region, value], i) => (
          <button
            key={region}
            onClick={() => onSelect(region)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 group-hover:text-white transition-colors font-mono">
                <span className="text-slate-600 mr-2">{String(i + 1).padStart(2, '0')}</span>
                {region}
              </span>
              <span className="text-slate-400 font-mono">{fmtRate(value)}</span>
            </div>
            <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(value / maxVal) * 100}%`,
                  background: 'linear-gradient(to right, #BA90FF, #47A5F1)',
                }}
              />
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 font-mono mt-3">Click a region to see grade breakdown</p>
    </div>
  );
}

export function RegionalMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [topo, setTopo] = useState<Topology | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [drilldown, setDrilldown] = useState<DrilldownData | null>(null);
  const [level, setLevel] = useState(1);
  const [year, setYear] = useState(2024);
  const [mapMetric, setMapMetric] = useState<MapMetric>('not_achieved_rate');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; region: string; rate: number | null; visible: boolean }>({
    x: 0, y: 0, region: '', rate: null, visible: false,
  });

  const metricOpt = MAP_METRIC_OPTIONS.find((m) => m.key === mapMetric) ?? MAP_METRIC_OPTIONS[0]!;

  // Fetch TopoJSON
  useEffect(() => {
    fetch('/geo/nz-regions.topojson')
      .then((r) => r.json())
      .then((t: Topology) => setTopo(t))
      .catch(() => {});
  }, []);

  // Primary regional data fetch
  const { data: data1 } = useNzqaData<TimelineResponse>(
    `/api/nzqa/timeline?groupBy=region&level=${level}&metric=${metricOpt.apiMetric}&yearFrom=${year}&yearTo=${year}`
  );

  // Secondary fetch for merit_excellence (need to sum merit + excellence)
  const { data: data2 } = useNzqaData<TimelineResponse>(
    metricOpt.apiMetric2
      ? `/api/nzqa/timeline?groupBy=region&level=${level}&metric=${metricOpt.apiMetric2}&yearFrom=${year}&yearTo=${year}`
      : null
  );

  // Drilldown — fetch all 3 levels for selected region + selected year
  const { data: drilldownRaw } = useNzqaData<SubjectResponse>(
    selected
      ? `/api/nzqa/subjects?year=${year}&region=${encodeURIComponent(selected)}&ethnicity=null&gender=null&equityGroup=null`
      : null
  );

  useEffect(() => {
    if (!drilldownRaw || !selected) { setDrilldown(null); return; }
    const byLevel = drilldownRaw.data
      .filter((r) => r.level !== null)
      .map((r) => ({
        level: r.level!,
        not_achieved_rate: r.not_achieved_rate,
        achieved_rate: r.achieved_rate,
        merit_rate: r.merit_rate,
        excellence_rate: r.excellence_rate,
      }))
      .sort((a, b) => a.level - b.level);
    setDrilldown({ region: selected, byLevel });
  }, [drilldownRaw, selected]);

  // Build region → display rate lookup (with derived metric computation)
  const regionRates = useMemo(() => {
    const map = new Map<string, number | null>();
    if (!data1) return map;
    const pts1 = data1.data as TimelineGroupPoint[];

    if (mapMetric === 'pass_rate') {
      for (const r of pts1) {
        if (r.group_label) map.set(r.group_label, r.value !== null ? 1 - r.value : null);
      }
    } else if (mapMetric === 'merit_excellence' && data2) {
      const pts2 = data2.data as TimelineGroupPoint[];
      const exc2 = new Map(pts2.map((r) => [r.group_label, r.value]));
      for (const r of pts1) {
        if (r.group_label) {
          const exc = exc2.get(r.group_label) ?? 0;
          map.set(r.group_label, r.value + exc);
        }
      }
    } else {
      for (const r of pts1) {
        if (r.group_label && r.value !== null) map.set(r.group_label, r.value);
      }
    }
    return map;
  }, [data1, data2, mapMetric]);

  const drawMap = useCallback(() => {
    if (!topo || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const W = Math.min(container.clientWidth || 600, 600);
    const H = W * 1.5;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    const geojson = feature(topo, topo.objects.regions as never) as unknown as GeoJSON.FeatureCollection<GeoJSON.MultiPolygon, RegionProperties>;
    const projection = d3.geoMercator().fitSize([W, H], geojson);
    const pathGen = d3.geoPath().projection(projection);

    let g = svg.select<SVGGElement>('g.map-body');
    if (g.empty()) g = svg.append('g').attr('class', 'map-body');

    g.selectAll<SVGPathElement, (typeof geojson.features)[0]>('.region')
      .data(geojson.features, (d) => d.properties?.REGC_name ?? '')
      .join(
        (enter) => enter.append('path').attr('class', 'region').attr('opacity', 0)
          .call((p) => p.transition().duration(800).ease(d3.easeCubicOut).attr('opacity', 1)),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr('d', pathGen)
      .style('cursor', 'pointer')
      .transition().duration(400)
      .attr('fill', (d) => {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        const rate = nzqaName ? regionRates.get(nzqaName) ?? null : null;
        return choroplethColour(rate);
      })
      .attr('stroke', (d) => {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        return selected && nzqaName === selected ? '#BA90FF' : '#0f172a';
      })
      .attr('stroke-width', (d) => {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        return selected && nzqaName === selected ? 2 : 0.5;
      });

    // Event handlers
    g.selectAll<SVGPathElement, (typeof geojson.features)[0]>('.region')
      .on('mouseenter', function (event: MouseEvent, d) {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        const rate = nzqaName ? regionRates.get(nzqaName) ?? null : null;
        if (rate !== null) { resumeAudio(); playHoverTone(rate, 0.07); }
        d3.select(this).attr('stroke', '#BA90FF').attr('stroke-width', 1.5);
        const rect = container.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, region: nzqaName ?? topoName ?? '', rate, visible: true });
      })
      .on('mouseleave', function (_, d) {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        d3.select(this)
          .attr('stroke', selected && nzqaName === selected ? '#BA90FF' : '#0f172a')
          .attr('stroke-width', selected && nzqaName === selected ? 2 : 0.5);
        setTooltip((prev) => ({ ...prev, visible: false }));
      })
      .on('click', function (_, d) {
        const topoName = d.properties?.REGC_name;
        const nzqaName = Object.entries(NZQA_TO_TOPOJSON).find(([, v]) => v === topoName)?.[0];
        if (!nzqaName) return;
        resumeAudio();
        playSelectChord(regionRates.get(nzqaName) ?? 0.5);
        setSelected((s) => s === nzqaName ? null : nzqaName);
      });

  }, [topo, regionRates, selected]);

  useEffect(() => { drawMap(); }, [drawMap]);

  const metricLabel = metricOpt.label.toLowerCase();

  // Grade bands for drilldown
  const GradeBands = ({ row }: { row: DrilldownData['byLevel'][0] }) => {
    const bands = [
      { label: 'NA',  value: row.not_achieved_rate ?? 0, color: '#ef4444' },
      { label: 'Ach', value: row.achieved_rate ?? 0,     color: '#f59e0b' },
      { label: 'Mer', value: row.merit_rate ?? 0,        color: '#6366f1' },
      { label: 'Exc', value: row.excellence_rate ?? 0,   color: '#10b981' },
    ];
    return (
      <div className="h-2 rounded-full overflow-hidden flex">
        {bands.map(({ label, value, color }) => (
          <div key={label} style={{ width: `${value * 100}%`, background: color }} title={`${label}: ${fmtRate(value)}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Level */}
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 font-mono">Level:</span>
          {[1, 2, 3].map((lvl) => (
            <button key={lvl} onClick={() => { resumeAudio(); setLevel(lvl); setSelected(null); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${level === lvl ? 'bg-violet-500 text-white' : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
              L{lvl}
            </button>
          ))}
        </div>

        {/* Metric */}
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-xs text-slate-500 font-mono">Show:</span>
          {MAP_METRIC_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => { resumeAudio(); setMapMetric(opt.key); }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer
                ${mapMetric === opt.key ? 'bg-slate-600 text-white border border-slate-500' : 'text-slate-500 border border-slate-700 hover:border-slate-500'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Year */}
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-500 font-mono">Year:</span>
          <select value={year} onChange={(e) => { setYear(Number(e.target.value)); setSelected(null); }}
            className="bg-slate-800 text-slate-300 text-xs font-mono rounded px-2 py-1 border border-slate-700 cursor-pointer">
            {MAP_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <div className="flex-1 min-w-0">
          <div ref={containerRef} className="relative">
            {!topo && <div className="animate-pulse bg-slate-800 rounded-lg w-full" style={{ height: 500 }} />}
            {topo && <svg ref={svgRef} className="w-full max-w-sm mx-auto block" />}
            {tooltip.visible && (
              <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 shadow-xl"
                style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}>
                <span className="text-slate-400">{tooltip.region}</span>
                <br />
                <span className="text-white font-semibold">
                  {tooltip.rate !== null ? `${fmtRate(tooltip.rate)} ${metricLabel}` : 'No data'}
                </span>
              </div>
            )}
          </div>

          {/* Choropleth legend */}
          <div className="flex items-center gap-2 mt-3 justify-center">
            <span className="text-xs text-slate-500 font-mono">Low</span>
            {['#1a1a2e','#0f3460','#533483','#8C5FD5','#BA90FF','#d4bbff'].map((c) => (
              <div key={c} className="w-6 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span className="text-xs text-slate-500 font-mono">High</span>
          </div>
          <p className="text-xs text-slate-600 text-center mt-1 font-mono">
            {metricOpt.label} · Level {level} · {year}
          </p>
        </div>

        {/* Right panel: drilldown or ranking */}
        <div className="w-full lg:w-72 shrink-0">
          {selected && drilldown ? (
            /* --- Drilldown: grade distribution by level --- */
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-100">{selected}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer">Clear</button>
              </div>
              <p className="text-xs text-slate-500 mb-1 font-mono">Grade distribution by level · {year}</p>
              <div className="flex gap-3 text-[10px] mb-4 font-mono flex-wrap">
                {[['#ef4444','Not Ach'],['#f59e0b','Achieved'],['#6366f1','Merit'],['#10b981','Excellence']].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-sm" style={{ background: c }} />
                    <span className="text-slate-500">{l}</span>
                  </span>
                ))}
              </div>
              <div className="space-y-4">
                {drilldown.byLevel.map((row) => (
                  <div key={row.level}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-mono" style={{ color: LEVEL_COLOURS[row.level] }}>NCEA Level {row.level}</span>
                      <span className="font-mono text-red-400">{fmtRate(row.not_achieved_rate)} fail</span>
                    </div>
                    <GradeBands row={row} />
                    <div className="flex justify-between text-[10px] mt-1 font-mono text-slate-600">
                      <span>{fmtRate(row.not_achieved_rate)}</span>
                      <span>{fmtRate(row.achieved_rate)}</span>
                      <span>{fmtRate(row.merit_rate)}</span>
                      <span>{fmtRate(row.excellence_rate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- Region ranking list --- */
            <RegionRanking
              regionRates={regionRates}
              metricLabel={metricLabel}
              year={year}
              level={level}
              onSelect={(r) => setSelected(r)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
