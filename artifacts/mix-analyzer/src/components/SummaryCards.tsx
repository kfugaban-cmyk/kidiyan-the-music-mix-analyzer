import type { MixAnalysis } from "@/analysis/types";
import { AlertTriangle, Activity, Headphones, Sparkles } from "lucide-react";

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
          {spectrum.label === "balanced"
            ? "Weight, warmth, and clarity feel evenly shared — nothing is pulling too hard in any direction."
            : spectrum.label === "bass-heavy"
            ? "Low-end weight is dominant, giving the mix a heavy, dense feel. Upper clarity may be getting pushed back."
            : spectrum.label === "bright"
            ? "Top end feels very forward and exposed. The mix has air and clarity, but warmth and body are light."
            : spectrum.label === "mid-forward"
            ? "Midrange carries most of the mix's energy — presence is strong, but the low end and top end sit back."
            : "Low-end weight is minimal, giving a lighter overall feel. The mix may lack body or fullness in the low-mids."
          }
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
          {dynamics.label === "compressed"
            ? "Heavy limiting applied. The mix has very little dynamic variation — common for modern pop/EDM."
            : dynamics.label === "punchy"
            ? "Moderate compression with strong transients. A balanced feel that works well across genres."
            : dynamics.label === "dynamic"
            ? "Good dynamic range preserved. Transients are clear and the mix breathes naturally."
            : "Wide dynamic range detected. May need level management depending on the target platform."
          }
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
