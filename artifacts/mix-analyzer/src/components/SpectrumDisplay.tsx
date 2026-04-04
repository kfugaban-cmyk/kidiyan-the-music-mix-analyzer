import type { SpectrumData } from "@/analysis/types";

interface Props {
  data: SpectrumData;
}

const BANDS = [
  { key: "sub" as const, label: "Sub", range: "20–80 Hz", color: "hsl(263 60% 62%)" },
  { key: "lowMid" as const, label: "Low-Mid", range: "80–500 Hz", color: "hsl(280 55% 59%)" },
  { key: "mid" as const, label: "Mid", range: "500–4k Hz", color: "hsl(300 45% 57%)" },
  { key: "high" as const, label: "High", range: "4k–20k Hz", color: "hsl(320 40% 62%)" },
];

function getTip(d: SpectrumData): string | null {
  const { label, lowMid, mid, sub, high } = d;

  if (label === "thin") {
    return "Low-end body is very sparse. A low-shelf boost starting around 80–120 Hz, or harmonic saturation on the bass and kick, can add warmth without making the mix muddy.";
  }
  if (lowMid > 62) {
    return "The low-mids are piling up — this is where muddiness lives (roughly 150–400 Hz). A narrow bell cut in that range can clear up the mix and let the low end breathe without losing body.";
  }
  if (label === "bass-heavy") {
    return "Sub-bass is dominant. Try high-passing elements that don't need deep low end, and check that your kick and bass aren't stacking energy in the same sub-frequency range below 80 Hz.";
  }
  if (label === "bright") {
    return "The top end is very forward. A gentle high-shelf cut above 8–10 kHz can tame the brightness. If you still want the air, bus saturation adds harmonic shimmer without lifting the actual shelf level.";
  }
  if (label === "mid-forward" && mid > 68) {
    return "The midrange is very dominant — if the mix sounds boxy or nasal, try a narrow bell cut between 1–3 kHz, or a wider dip around 400–800 Hz to reduce the honkiness without pushing the lead back.";
  }
  if (high > 68) {
    return "High-end energy is elevated. If the mix feels fatiguing over time, try a gentle shelf cut above 10 kHz or pull back the presence on individual bright elements before it reaches the bus.";
  }
  if (sub > 72) {
    return "Sub energy is building up even with a balanced overall shape. Check for low-frequency resonances below 60 Hz and consider a gentle high-pass on elements that don't need true sub content.";
  }
  return null;
}

function Tip({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: "hsl(40 70% 96%)", boxShadow: "0 0 0 1px hsl(40 50% 87%)" }}>
      <p className="text-xs leading-relaxed text-amber-900">
        <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px]">Fix → </span>
        {text}
      </p>
    </div>
  );
}

export function SpectrumDisplay({ data }: Props) {
  const tip = getTip(data);

  return (
    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)", boxShadow: "0 1px 3px hsl(263 30% 30% / 0.07), 0 0 0 1px hsl(263 20% 90%)" }}>
      <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">Tonal Balance</p>
      <div className="space-y-3.5">
        {BANDS.map(({ key, label, range, color }) => {
          const value = data[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <p className="text-xs font-semibold text-stone-800">{label}</p>
                <p className="text-[10px] text-stone-500">{range}</p>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(263 20% 91%)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${value}%`, background: color }}
                />
              </div>
              <span className="text-xs font-semibold text-stone-700 tabular-nums w-8 text-right">{value}%</span>
            </div>
          );
        })}
      </div>
      {tip && <Tip text={tip} />}
    </div>
  );
}
