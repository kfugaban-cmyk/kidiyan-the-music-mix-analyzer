import type { StereoWidthData } from "@/analysis/types";

interface Props {
  data: StereoWidthData;
}

function getTip(d: StereoWidthData): string | null {
  const { widthScore } = d;

  if (widthScore < 15) {
    return "The mix is almost mono. Adding stereo width to reverbs, delays, or background pads can open it up considerably. Even a subtle chorus or haas effect on a bus can make a significant difference.";
  }
  if (widthScore < 30) {
    return "The stereo field is tight. If this isn't intentional, try widening the room reverb or applying gentle M/S processing on the mix bus. Keep anything below 150 Hz in mono for the best translation.";
  }
  if (widthScore > 85) {
    return "The stereo image is very wide — test in mono before mastering. Hard-panned elements can phase-cancel or disappear on a single speaker. Consider narrowing the side signal, especially below 200 Hz.";
  }
  if (widthScore > 72) {
    return "Wide stereo field — check mono compatibility. Streaming playback on phones and smart speakers is often mono or near-mono, so important elements should still land after a fold-down.";
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

export function StereoWidthDisplay({ data }: Props) {
  const { widthScore, midEnergy, sideEnergy } = data;
  const tip = getTip(data);

  const cardStyle = { background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)", boxShadow: "0 1px 3px hsl(263 30% 30% / 0.07), 0 0 0 1px hsl(263 20% 90%)" };
  const statStyle = { background: "hsl(263 15% 96%)", boxShadow: "0 0 0 1px hsl(263 15% 90%)" };
  const statHighStyle = { background: "linear-gradient(135deg, hsl(263 55% 95%) 0%, hsl(280 50% 94%) 100%)", boxShadow: "0 0 0 1px hsl(263 40% 86%)" };

  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">Stereo Width</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-stone-600 w-12 text-right">Narrow</span>
        <div className="relative flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(263 20% 91%)" }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{ width: `${widthScore}%`, background: "linear-gradient(to right, hsl(263 55% 62%), hsl(320 50% 62%))" }}
          />
        </div>
        <span className="text-xs font-medium text-stone-600 w-10">Wide</span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-xl p-3 text-center" style={statStyle}>
          <p className="text-lg font-bold text-stone-900 tabular-nums">{midEnergy}%</p>
          <p className="text-xs text-stone-500 mt-0.5">Mid energy</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={statStyle}>
          <p className="text-lg font-bold text-stone-900 tabular-nums">{sideEnergy}%</p>
          <p className="text-xs text-stone-500 mt-0.5">Side energy</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={statHighStyle}>
          <p className="text-lg font-bold text-violet-700 tabular-nums">{widthScore}</p>
          <p className="text-xs text-violet-500 mt-0.5">Width score</p>
        </div>
      </div>
      {tip && <Tip text={tip} />}
    </div>
  );
}
