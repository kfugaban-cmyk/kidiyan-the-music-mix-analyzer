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
    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)", boxShadow: "0 1px 3px hsl(263 30% 30% / 0.06), 0 0 0 1px hsl(263 20% 92%)" }}>
      <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">Waveform</p>
      <div className="w-full overflow-hidden rounded-xl" style={{ background: "linear-gradient(180deg, hsl(263 30% 97%) 0%, hsl(263 25% 99%) 100%)" }}>
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
