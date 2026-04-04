import type { DynamicsData } from "@/analysis/types";

interface Props {
  data: DynamicsData;
}

export function DynamicsDisplay({ data }: Props) {
  const { crestFactor, rmsDb, peakDb, score } = data;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Dynamic Contrast</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-stone-400 w-20 text-right">Compressed</span>
        <div className="relative flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
              background: "linear-gradient(to right, hsl(300 40% 65%), hsl(263 60% 70%))",
            }}
          />
        </div>
        <span className="text-xs text-stone-400 w-12">Dynamic</span>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-base font-semibold text-stone-700">{rmsDb} <span className="text-xs font-normal">dB</span></p>
          <p className="text-xs text-stone-400 mt-0.5">RMS level</p>
        </div>
        <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-base font-semibold text-stone-700">{peakDb} <span className="text-xs font-normal">dB</span></p>
          <p className="text-xs text-stone-400 mt-0.5">Peak level</p>
        </div>
        <div className="flex-1 bg-violet-50 rounded-xl p-3 text-center">
          <p className="text-base font-semibold text-violet-600">{crestFactor} <span className="text-xs font-normal">dB</span></p>
          <p className="text-xs text-violet-400 mt-0.5">Crest factor</p>
        </div>
      </div>
    </div>
  );
}
