import type { WaveformData } from "@/analysis/types";

interface Props {
  data: WaveformData;
}

export function WaveformDisplay({ data }: Props) {
  const { peaks } = data;
  const width = 600;
  const height = 80;
  const mid = height / 2;

  const barWidth = Math.max(1, width / peaks.length);
  const gap = peaks.length > 800 ? 0 : 0.5;
  const effectiveBar = barWidth - gap;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Waveform</p>
      <div className="w-full overflow-hidden rounded-lg" style={{ background: "hsl(250 30% 98%)" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: 80 }}
        >
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(263 60% 70%)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(263 60% 70%)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {Array.from(peaks).map((peak, i) => {
            const barH = Math.max(1, peak * (height * 0.9));
            const x = i * barWidth;
            return (
              <rect
                key={i}
                x={x}
                y={mid - barH / 2}
                width={Math.max(effectiveBar, 1)}
                height={barH}
                rx={effectiveBar > 2 ? 1 : 0}
                fill="url(#waveGradient)"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
