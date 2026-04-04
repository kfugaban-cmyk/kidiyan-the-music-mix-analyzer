import type { MixAnalysis, SpectrumData, DynamicsData, EmotionalReadData } from "@/analysis/types";
import { AlertTriangle, Activity, Headphones, Sparkles } from "lucide-react";

function generateEmotionalSummary(e: EmotionalReadData): string {
  const p = e.presence.value;   // recessed (0) → upfront (100)
  const a = e.attack.value;     // rounded (0) → cutting (100)
  const s = e.space.value;      // dry (0) → open (100)
  const w = e.weight.value;     // airy (0) → heavy (100)

  // Opening clause — overall character (presence × space)
  let opening: string;
  if (p < 35 && s < 35)       opening = "close and dry";
  else if (p < 35 && s > 65)  opening = "distant but open";
  else if (p < 35)             opening = "slightly withdrawn";
  else if (p > 65 && s > 65)  opening = "open and upfront";
  else if (p > 65 && s < 35)  opening = "close and direct";
  else if (p > 65)             opening = "forward and present";
  else if (s > 65)             opening = "settled and spacious";
  else if (s < 35)             opening = "intimate and focused";
  else                         opening = "centered and even";

  // Second clause — texture and body (attack × weight)
  let texture: string;
  if (a < 35 && w < 35)       texture = "a light, feathery touch with very little body";
  else if (a < 35 && w > 65)  texture = "smooth transients and a heavy, grounded bottom";
  else if (a < 35 && w > 45)  texture = "rounded edges and a solid, full body";
  else if (a < 35)             texture = "a soft, unhurried edge and an airy frame";
  else if (a > 65 && w > 65)  texture = "crisp attack and dense, weighty low end";
  else if (a > 65 && w < 35)  texture = "a cutting edge but a lean, thin body";
  else if (a > 65 && w > 45)  texture = "sharp transients and a grounded, full presence";
  else if (a > 65)             texture = "a defined, punchy edge with controlled weight";
  else if (w > 65)             texture = "measured movement and a heavy, grounded body";
  else if (w < 35)             texture = "gentle definition and a lean, airy frame";
  else                         texture = "balanced weight and a measured, even edge";

  return `${opening}, with ${texture}`;
}

function describeTonalBalance(s: SpectrumData): string {
  const { sub, lowMid, mid, high, label } = s;
  if (label === "bass-heavy") {
    const clarity = mid + high;
    return `Sub-bass is dominant at ${sub}% — the low-end weight is thick. Mid and high energy combined (${clarity}%) is sitting back, so clarity and air may be getting masked by the low-end mass.`;
  }
  if (label === "bright") {
    return `High end carries ${high}% of the spectral energy — the mix has air and presence, but body is light: sub at ${sub}%, low-mids at ${lowMid}%. It may feel thin on small speakers.`;
  }
  if (label === "mid-forward") {
    return `Midrange is the dominant force at ${mid}% — vocals and lead instruments are upfront. Sub sits at ${sub}% and highs at ${high}%, so the mix has limited low-end weight and top-end shimmer.`;
  }
  if (label === "thin") {
    return `Low-end energy is very sparse — sub at ${sub}%, low-mids at ${lowMid}%. The mix may lack body and fullness, especially on anything with bass drivers or subwoofers.`;
  }
  return `Spread is fairly even — sub ${sub}%, low-mids ${lowMid}%, mids ${mid}%, highs ${high}%. No single band is dominating, which gives the mix flexibility across playback systems.`;
}

function describeDynamicFeel(d: DynamicsData): string {
  const { label, crestFactor, rmsDb } = d;
  if (label === "compressed") {
    return `Crest factor is ${crestFactor} dB — heavy limiting has flattened most transient movement. The mix has consistent loudness (${rmsDb} dBFS RMS) but very little dynamic breathing room.`;
  }
  if (label === "punchy") {
    return `Crest factor of ${crestFactor} dB gives the mix body without smashing it flat. Transients are landing with definition, and the RMS of ${rmsDb} dBFS keeps energy present throughout.`;
  }
  if (label === "dynamic") {
    return `${crestFactor} dB of crest factor means transients are largely intact — the mix breathes naturally. At ${rmsDb} dBFS RMS, it has headroom. Loud platforms may need a master limiter pass.`;
  }
  return `Crest factor of ${crestFactor} dB is wide — dynamic range is very open. The ${rmsDb} dBFS RMS average is low, which is natural but may need taming for streaming platforms.`;
}

interface Props {
  analysis: MixAnalysis;
}

function ScoreDot({ score, risk }: { score?: number; risk?: "low" | "medium" | "high" }) {
  if (risk !== undefined) {
    const color = risk === "low" ? "bg-emerald-500" : risk === "medium" ? "bg-amber-500" : "bg-rose-500";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  }
  if (score !== undefined) {
    const color = score > 60 ? "bg-emerald-500" : score > 30 ? "bg-amber-500" : "bg-rose-500";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  }
  return null;
}

function LabelPill({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full text-violet-700"
      style={{ background: "hsl(263 60% 95%)", boxShadow: "0 0 0 1px hsl(263 40% 85%)" }}
    >
      {label}
    </span>
  );
}

function IconBox({ children, color }: { children: React.ReactNode; color: "violet" | "amber" }) {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={
        color === "violet"
          ? { background: "linear-gradient(135deg, hsl(263 55% 94%) 0%, hsl(280 50% 92%) 100%)", boxShadow: "0 0 0 1px hsl(263 40% 86%)" }
          : { background: "linear-gradient(135deg, hsl(40 100% 94%) 0%, hsl(35 90% 91%) 100%)", boxShadow: "0 0 0 1px hsl(40 60% 84%)" }
      }
    >
      {children}
    </div>
  );
}


const cardStyle = {
  background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)",
  boxShadow: "0 1px 3px hsl(263 30% 30% / 0.07), 0 0 0 1px hsl(263 20% 90%)",
};

export function SummaryCards({ analysis }: Props) {
  const { spectrum, dynamics, translation, emotional } = analysis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Tonal Balance */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <IconBox color="violet">
              <Activity className="w-4 h-4 text-violet-600" />
            </IconBox>
            <div>
              <p className="text-sm font-bold text-stone-900">Tonal Balance</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot score={spectrum.score} />
                <span className="text-xs text-stone-500">score {spectrum.score}/100</span>
              </div>
            </div>
          </div>
          <LabelPill label={spectrum.label} />
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {describeTonalBalance(spectrum)}
        </p>
      </div>

      {/* Dynamic Feel */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <IconBox color="violet">
              <Headphones className="w-4 h-4 text-violet-600" />
            </IconBox>
            <div>
              <p className="text-sm font-bold text-stone-900">Dynamic Feel</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot score={dynamics.score} />
                <span className="text-xs text-stone-500">crest {dynamics.crestFactor} dB</span>
              </div>
            </div>
          </div>
          <LabelPill label={dynamics.label} />
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {describeDynamicFeel(dynamics)}
        </p>
      </div>

      {/* Translation Risk */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <IconBox color="amber">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </IconBox>
            <div>
              <p className="text-sm font-bold text-stone-900">Translation Risk</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot risk={translation.risk} />
                <span className="text-xs text-stone-500">{translation.risk} risk</span>
              </div>
            </div>
          </div>
          <LabelPill label={translation.label} />
        </div>
        <ul className="space-y-2">
          {translation.details.map((d, i) => (
            <li key={i} className="text-xs text-stone-600 flex gap-2 leading-relaxed">
              <span className="text-violet-400 mt-px flex-shrink-0 font-bold">·</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Emotional Read */}
      <div className="rounded-2xl p-5 flex flex-col justify-between" style={cardStyle}>
        <div className="flex items-center gap-2.5 mb-4">
          <IconBox color="violet">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </IconBox>
          <p className="text-sm font-bold text-stone-900">Emotional Read</p>
        </div>
        <p className="text-sm italic text-stone-700 leading-relaxed">
          {generateEmotionalSummary(emotional)}
        </p>
      </div>
    </div>
  );
}
