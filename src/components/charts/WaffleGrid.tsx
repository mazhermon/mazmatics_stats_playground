'use client';

import { useState } from 'react';
import { useNzqaData, type TimelineResponse, type TimelineGroupPoint } from '@/lib/hooks/useNzqaData';
import { ETHNICITY_COLOURS, fmtRate } from '@/lib/palette';

const GRID_SIZE = 10; // 10×10 = 100 cells
const CELL_SIZE = 22;
const CELL_GAP = 2;

function WafflePanel({ label, rate, color }: { label: string; rate: number | null; color: string }) {
  const achieved = rate !== null ? Math.round(rate * 100) : 0;
  const total = GRID_SIZE * GRID_SIZE;

  return (
    <div className="bg-slate-900 rounded-xl p-4 space-y-3">
      <div className="space-y-1">
        <div className="text-sm font-semibold" style={{ color }}>
          {label}
        </div>
        <div className="text-2xl font-bold font-mono" style={{ color }}>
          {rate !== null ? achieved : '—'}
          <span className="text-sm font-normal text-slate-500"> / 100</span>
        </div>
        <div className="text-xs text-slate-500 font-mono">{fmtRate(rate)} achieved</div>
      </div>

      <svg
        viewBox={`0 0 ${GRID_SIZE * (CELL_SIZE + CELL_GAP)} ${GRID_SIZE * (CELL_SIZE + CELL_GAP)}`}
        className="w-full h-auto"
        aria-label={`Waffle chart: ${achieved} out of 100 students achieved`}
      >
        {Array.from({ length: total }, (_, i) => {
          const col = i % GRID_SIZE;
          const row = Math.floor(i / GRID_SIZE);
          const filled = i < achieved;
          return (
            <rect
              key={i}
              x={col * (CELL_SIZE + CELL_GAP)}
              y={row * (CELL_SIZE + CELL_GAP)}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              fill={filled ? color : '#1e293b'}
              fillOpacity={filled ? 0.9 : 1}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function WaffleGrid() {
  const [level, setLevel] = useState(2);
  const [year, setYear] = useState(2024);

  const url = `/api/nzqa/timeline?metric=achieved_rate&groupBy=ethnicity&level=${level}`;
  const { data, loading, error } = useNzqaData<TimelineResponse>(url);

  if (loading) return <div className="animate-pulse bg-slate-800 rounded-xl h-[400px]" />;
  if (error) return <div className="text-red-400 text-sm p-4 bg-slate-900 rounded-xl">{error}</div>;
  if (!data) return null;

  const allPoints = data.data as TimelineGroupPoint[];
  const years = [...new Set(allPoints.map((d) => d.year))].sort((a, b) => a - b);
  const groups = [...new Set(allPoints.map((d) => d.group_label))].filter(Boolean).sort();

  const yearData = allPoints.filter((d) => d.year === year);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-mono">Level:</span>
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
              L{l}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-slate-500 font-mono">Year:</span>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                year === y
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Waffle panels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {groups.map((g) => {
          const pt = yearData.find((d) => d.group_label === g);
          return (
            <WafflePanel
              key={g}
              label={g}
              rate={pt?.value ?? null}
              color={ETHNICITY_COLOURS[g] ?? '#94a3b8'}
            />
          );
        })}
      </div>

      <p className="text-xs text-slate-600 font-mono">
        Each square = 1 student out of 100. Filled = achieved NCEA Level {level} maths in {year}.
      </p>
    </div>
  );
}
