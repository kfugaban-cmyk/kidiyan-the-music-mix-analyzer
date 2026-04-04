import type { StereoWidthData } from "@/analysis/types";

interface Props {
  data: StereoWidthData;
}

export function StereoWidthDisplay({ data }: Props) {
  const { widthScore, midEnergy, sideEnergy } = data;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Stereo Width</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-stone-400 w-12 text-right">Narrow</span>
        <div className="relative flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${widthScore}%`,
              background: "linear-gradient(to right, hsl(263 60% 70%), hsl(320 50% 70%))",
            }}
          />
        </div>
        <span className="text-xs text-stone-400 w-10">Wide</span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-lg font-semibold text-stone-700">{midEnergy}%</p>
          <p className="text-xs text-stone-400 mt-0.5">Mid energy</p>
        </div>
        <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-lg font-semibold text-stone-700">{sideEnergy}%</p>
          <p className="text-xs text-stone-400 mt-0.5">Side energy</p>
        </div>
        <div className="flex-1 bg-violet-50 rounded-xl p-3 text-center">
          <p className="text-lg font-semibold text-violet-600">{widthScore}</p>
          <p className="text-xs text-violet-400 mt-0.5">Width score</p>
        </div>
      </div>
    </div>
  );
}
