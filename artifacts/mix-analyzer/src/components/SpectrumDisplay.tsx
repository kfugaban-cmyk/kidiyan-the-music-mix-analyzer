import type { SpectrumData } from "@/analysis/types";

interface Props {
  data: SpectrumData;
}

const BANDS = [
  { key: "sub" as const, label: "Sub", range: "20–80 Hz", color: "hsl(263 60% 68%)" },
  { key: "lowMid" as const, label: "Low-Mid", range: "80–500 Hz", color: "hsl(280 55% 65%)" },
  { key: "mid" as const, label: "Mid", range: "500–4k Hz", color: "hsl(300 45% 62%)" },
  { key: "high" as const, label: "High", range: "4k–20k Hz", color: "hsl(320 40% 68%)" },
];

export function SpectrumDisplay({ data }: Props) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)", boxShadow: "0 1px 3px hsl(263 30% 30% / 0.06), 0 0 0 1px hsl(263 20% 92%)" }}>
      <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">Tonal Balance</p>
      <div className="space-y-3.5">
        {BANDS.map(({ key, label, range, color }) => {
          const value = data[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <p className="text-xs font-medium text-stone-600">{label}</p>
                <p className="text-[10px] text-stone-400">{range}</p>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(263 20% 93%)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${value}%`,
                    background: `linear-gradient(to right, ${color}, ${color.replace(")", " / 0.7)").replace("hsl(", "hsl(")})`,
                  }}
                />
              </div>
              <span className="text-xs text-stone-400 tabular-nums w-8 text-right">{value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
