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
    <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Tonal Balance</p>
      <div className="space-y-3">
        {BANDS.map(({ key, label, range, color }) => {
          const value = data[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <p className="text-xs font-medium text-stone-600">{label}</p>
                <p className="text-[10px] text-stone-400">{range}</p>
              </div>
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${value}%`,
                    background: color,
                  }}
                />
              </div>
              <span className="text-xs text-stone-400 w-8 text-right">{value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
