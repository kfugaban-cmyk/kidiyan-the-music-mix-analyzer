import type { MixAnalysis, SpectrumData, DynamicsData } from "@/analysis/types";
import { AlertTriangle, Activity, Headphones, Sparkles } from "lucide-react";

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
  // balanced
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
    const color = risk === "low" ? "bg-emerald-400" : risk === "medium" ? "bg-amber-400" : "bg-rose-400";
    return <div className={`w-2 h-2 rounded-full ${color} shadow-sm`} />;
  }
  if (score !== undefined) {
    const color = score > 60 ? "bg-emerald-400" : score > 30 ? "bg-amber-400" : "bg-rose-400";
    return <div className={`w-2 h-2 rounded-full ${color} shadow-sm`} />;
  }
  return null;
}

function LabelPill({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full text-violet-600"
      style={{ background: "hsl(263 60% 96%)", boxShadow: "0 0 0 1px hsl(263 40% 88%)" }}
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
          ? { background: "linear-gradient(135deg, hsl(263 55% 95%) 0%, hsl(280 50% 93%) 100%)", boxShadow: "0 0 0 1px hsl(263 40% 88%)" }
          : { background: "linear-gradient(135deg, hsl(40 100% 95%) 0%, hsl(35 90% 92%) 100%)", boxShadow: "0 0 0 1px hsl(40 60% 86%)" }
      }
    >
      {children}
    </div>
  );
}

function AxisRow({ name, left, right, value }: { name: string; left: string; right: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">{name}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs w-14 text-right transition-colors ${value <= 50 ? "text-stone-600 font-medium" : "text-stone-300"}`}>
          {left}
        </span>
        <div className="relative flex-1 h-1.5 rounded-full overflow-visible" style={{ background: "hsl(263 20% 93%)" }}>
          <div
            className="absolute top-0 h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${value}%`,
              background: "linear-gradient(to right, hsl(263 45% 72%), hsl(263 65% 56%))",
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white transition-all duration-700 ease-out"
            style={{
              left: `calc(${value}% - 6px)`,
              background: "hsl(263 65% 58%)",
              boxShadow: "0 1px 4px hsl(263 50% 50% / 0.35)",
            }}
          />
        </div>
        <span className={`text-xs w-10 transition-colors ${value > 50 ? "text-stone-600 font-medium" : "text-stone-300"}`}>
          {right}
        </span>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)",
  boxShadow: "0 1px 3px hsl(263 30% 30% / 0.06), 0 0 0 1px hsl(263 20% 92%)",
};

export function SummaryCards({ analysis }: Props) {
  const { spectrum, dynamics, translation, emotional } = analysis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconBox color="violet">
              <Activity className="w-4 h-4 text-violet-500" />
            </IconBox>
            <div>
              <p className="text-sm font-semibold text-stone-700">Tonal Balance</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot score={spectrum.score} />
                <span className="text-xs text-stone-400">score {spectrum.score}/100</span>
              </div>
            </div>
          </div>
          <LabelPill label={spectrum.label} />
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          {describeTonalBalance(spectrum)}
        </p>
      </div>

      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconBox color="violet">
              <Headphones className="w-4 h-4 text-violet-500" />
            </IconBox>
            <div>
              <p className="text-sm font-semibold text-stone-700">Dynamic Feel</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot score={dynamics.score} />
                <span className="text-xs text-stone-400">crest factor {dynamics.crestFactor} dB</span>
              </div>
            </div>
          </div>
          <LabelPill label={dynamics.label} />
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          {describeDynamicFeel(dynamics)}
        </p>
      </div>

      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconBox color="amber">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </IconBox>
            <div>
              <p className="text-sm font-semibold text-stone-700">Translation Risk</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot risk={translation.risk} />
                <span className="text-xs text-stone-400">{translation.risk} risk</span>
              </div>
            </div>
          </div>
          <LabelPill label={translation.label} />
        </div>
        <ul className="space-y-1.5">
          {translation.details.map((d, i) => (
            <li key={i} className="text-xs text-stone-500 flex gap-2">
              <span className="text-violet-300 mt-px flex-shrink-0">·</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <IconBox color="violet">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </IconBox>
          <p className="text-sm font-semibold text-stone-700">Emotional Read</p>
        </div>
        <div className="space-y-4">
          <AxisRow name="Presence" left="recessed" right="upfront" value={emotional.presence.value} />
          <AxisRow name="Attack" left="rounded" right="cutting" value={emotional.attack.value} />
          <AxisRow name="Space" left="dry" right="open" value={emotional.space.value} />
          <AxisRow name="Weight" left="airy" right="heavy" value={emotional.weight.value} />
        </div>
      </div>
    </div>
  );
}
