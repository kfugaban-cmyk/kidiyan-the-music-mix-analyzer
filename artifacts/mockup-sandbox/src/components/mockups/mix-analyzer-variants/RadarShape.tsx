import React from "react";

const DATA = [
  { label: "Sub Warmth", value: 45 },
  { label: "Low-Mid Body", value: 55 },
  { label: "Mid Presence", value: 60 },
  { label: "High Clarity", value: 38 },
  { label: "Stereo Width", value: 52 },
  { label: "Dynamic Punch", value: 62 },
];

const GRID_RINGS = [20, 40, 60, 80, 100];

export function RadarShape() {
  const size = 500;
  const center = size / 2;
  const radius = 180;

  // Calculate coordinates for a given value (0-100) and index
  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    };
  };

  // Generate polygon points for the data
  const dataPoints = DATA.map((d, i) => getCoordinates(d.value, i, DATA.length));
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-3xl w-full flex flex-col items-center space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="font-mono text-xs text-slate-500 tracking-wider uppercase">
            File: dream_chorus_v3.wav • 3:42
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            A mid-forward, punchy mix with an upfront presence.
          </h1>
        </div>

        {/* Radar Chart Area */}
        <div className="relative w-full flex flex-col items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${size} ${size}`}
            className="max-w-[500px] overflow-visible"
            style={{ filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.1))" }}
          >
            {/* Grid Rings */}
            {GRID_RINGS.map((ringValue) => {
              const ringPoints = Array.from({ length: DATA.length }).map((_, i) =>
                getCoordinates(ringValue, i, DATA.length)
              );
              const ringPath = ringPoints.map((p) => `${p.x},${p.y}`).join(" ");
              return (
                <polygon
                  key={`ring-${ringValue}`}
                  points={ringPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-800"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Axes */}
            {DATA.map((_, i) => {
              const endPoint = getCoordinates(100, i, DATA.length);
              return (
                <line
                  key={`axis-${i}`}
                  x1={center}
                  y1={center}
                  x2={endPoint.x}
                  y2={endPoint.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-800"
                />
              );
            })}

            {/* Data Polygon */}
            <polygon
              points={polygonPoints}
              className="text-emerald-400/20 fill-current stroke-emerald-400"
              strokeWidth="2"
              strokeLinejoin="round"
              style={{ transition: "all 1s ease-out" }}
            />

            {/* Data Points */}
            {dataPoints.map((p, i) => (
              <circle
                key={`point-${i}`}
                cx={p.x}
                cy={p.y}
                r="4"
                className="fill-emerald-400"
              />
            ))}

            {/* Axis Labels */}
            {DATA.map((d, i) => {
              // Push labels slightly further out than max radius
              const labelPos = getCoordinates(115, i, DATA.length);
              
              // Adjust text anchoring based on position
              let textAnchor = "middle";
              if (labelPos.x < center - 10) textAnchor = "end";
              if (labelPos.x > center + 10) textAnchor = "start";

              return (
                <text
                  key={`label-${i}`}
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor={textAnchor}
                  alignmentBaseline="middle"
                  className="fill-slate-500 text-[11px] font-mono uppercase tracking-widest select-none"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 w-full max-w-xl">
          {DATA.map((d, i) => (
            <div key={d.label} className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">{d.label}</span>
              <span className="text-emerald-400 font-mono text-sm">{d.value}%</span>
            </div>
          ))}
        </div>

        {/* Readings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl mt-8 pt-8 border-t border-slate-800/50 text-sm leading-relaxed text-slate-400">
          <div>
            <span className="block text-white font-medium mb-1">Tonal Balance</span>
            Warm low-mids, present upper-mids, controlled low end; sub is moderate, high end open but not harsh.
          </div>
          <div>
            <span className="block text-white font-medium mb-1">Stereo Width</span>
            Spacious enough to feel wide, not hyper-extended.
          </div>
          <div>
            <span className="block text-white font-medium mb-1">Dynamics</span>
            Compressed but with real movement; punchy crest factor.
          </div>
          <div>
            <span className="block text-white font-medium mb-1">Translation Risk</span>
            Phone speakers will lose some sub warmth; headphones and car translate cleanly.
          </div>
        </div>
      </div>
    </div>
  );
}
