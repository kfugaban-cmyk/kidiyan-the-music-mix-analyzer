import type { StereoWidthData } from "@/analysis/types";

interface Props {
  data: StereoWidthData;
}

export function StereoWidthDisplay({ data }: Props) {
  const { widthScore, midEnergy, sideEnergy } = data;

  const cardStyle = { background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)", boxShadow: "0 1px 3px hsl(263 30% 30% / 0.06), 0 0 0 1px hsl(263 20% 92%)" };
  const statStyle = { background: "hsl(263 15% 97%)", boxShadow: "0 0 0 1px hsl(263 15% 91%)" };
  const statHighStyle = { background: "linear-gradient(135deg, hsl(263 55% 96%) 0%, hsl(280 50% 95%) 100%)", boxShadow: "0 0 0 1px hsl(263 40% 88%)" };

  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">Stereo Width</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-stone-400 w-12 text-right">Narrow</span>
        <div className="relative flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(263 20% 93%)" }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{ width: `${widthScore}%`, background: "linear-gradient(to right, hsl(263 55% 68%), hsl(320 50% 68%))" }}
          />
        </div>
        <span className="text-xs text-stone-400 w-10">Wide</span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-xl p-3 text-center" style={statStyle}>
          <p className="text-lg font-semibold text-stone-700 tabular-nums">{midEnergy}%</p>
          <p className="text-xs text-stone-400 mt-0.5">Mid energy</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={statStyle}>
          <p className="text-lg font-semibold text-stone-700 tabular-nums">{sideEnergy}%</p>
          <p className="text-xs text-stone-400 mt-0.5">Side energy</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={statHighStyle}>
          <p className="text-lg font-semibold text-violet-600 tabular-nums">{widthScore}</p>
          <p className="text-xs text-violet-400 mt-0.5">Width score</p>
        </div>
      </div>
    </div>
  );
}
