import type { DynamicsData } from "@/analysis/types";

interface Props {
  data: DynamicsData;
}

function getTip(d: DynamicsData): string | null {
  const { crestFactor } = d;

  if (crestFactor < 6) {
    return "The mix is heavily limited — most transient energy has been flattened. To restore punch, try pulling the master limiter ceiling back 2–3 dB, or reduce the ratio on upstream compressors before revisiting the limiter.";
  }
  if (crestFactor < 9) {
    return "Well compressed with limited headroom going into mastering. If you want more punch, try parallel compression — keep an uncompressed path blended alongside the compressed signal and dial in to taste.";
  }
  if (crestFactor > 20) {
    return "Wide dynamic range — streaming platforms will normalize loudness down, which may make quieter passages feel too low. A gentle limiter at −1 to −2 dBFS ceiling can raise the RMS without harming the transients.";
  }
  if (crestFactor > 15) {
    return "Good dynamics — if you're targeting streaming, a light limiting pass before delivery ensures the normalized playback level doesn't make the mix sound underwhelming compared to louder tracks.";
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

export function DynamicsDisplay({ data }: Props) {
  const { crestFactor, rmsDb, peakDb, score } = data;
  const tip = getTip(data);

  const cardStyle = { background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)", boxShadow: "0 1px 3px hsl(263 30% 30% / 0.07), 0 0 0 1px hsl(263 20% 90%)" };
  const statStyle = { background: "hsl(263 15% 96%)", boxShadow: "0 0 0 1px hsl(263 15% 90%)" };
  const statHighStyle = { background: "linear-gradient(135deg, hsl(263 55% 95%) 0%, hsl(280 50% 94%) 100%)", boxShadow: "0 0 0 1px hsl(263 40% 86%)" };

  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">Dynamic Contrast</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-stone-600 w-20 text-right">Compressed</span>
        <div className="relative flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(263 20% 91%)" }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: "linear-gradient(to right, hsl(300 40% 60%), hsl(263 60% 60%))" }}
          />
        </div>
        <span className="text-xs font-medium text-stone-600 w-12">Dynamic</span>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3 text-center" style={statStyle}>
          <p className="text-base font-bold text-stone-900 tabular-nums">{rmsDb} <span className="text-xs font-normal text-stone-500">dB</span></p>
          <p className="text-xs text-stone-500 mt-0.5">RMS level</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={statStyle}>
          <p className="text-base font-bold text-stone-900 tabular-nums">{peakDb} <span className="text-xs font-normal text-stone-500">dB</span></p>
          <p className="text-xs text-stone-500 mt-0.5">Peak level</p>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={statHighStyle}>
          <p className="text-base font-bold text-violet-700 tabular-nums">{crestFactor} <span className="text-xs font-normal text-violet-500">dB</span></p>
          <p className="text-xs text-violet-500 mt-0.5">Crest factor</p>
        </div>
      </div>
      {tip && <Tip text={tip} />}
    </div>
  );
}
