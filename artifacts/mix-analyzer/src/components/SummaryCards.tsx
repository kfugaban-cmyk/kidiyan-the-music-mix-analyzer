import type { MixAnalysis } from "@/analysis/types";
import { AlertTriangle, Activity, Headphones, Sparkles } from "lucide-react";

interface Props {
  analysis: MixAnalysis;
}

function ScoreDot({ score, risk }: { score?: number; risk?: "low" | "medium" | "high" }) {
  if (risk !== undefined) {
    const color = risk === "low" ? "bg-emerald-400" : risk === "medium" ? "bg-amber-400" : "bg-rose-400";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  }
  if (score !== undefined) {
    const color = score > 60 ? "bg-emerald-400" : score > 30 ? "bg-amber-400" : "bg-rose-400";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  }
  return null;
}

function LabelPill({ label }: { label: string }) {
  return (
    <span className="inline-block px-2.5 py-0.5 bg-violet-50 text-violet-600 text-xs font-medium rounded-full">
      {label}
    </span>
  );
}

function AxisRow({ name, left, right, value }: { name: string; left: string; right: string; value: number }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">{name}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs w-14 text-right transition-colors ${value <= 50 ? "text-stone-700 font-medium" : "text-stone-300"}`}>
          {left}
        </span>
        <div className="relative flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 h-full bg-violet-300 rounded-full transition-all duration-700"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className={`text-xs w-10 transition-colors ${value > 50 ? "text-stone-700 font-medium" : "text-stone-300"}`}>
          {right}
        </span>
      </div>
    </div>
  );
}

export function SummaryCards({ analysis }: Props) {
  const { spectrum, dynamics, translation, emotional } = analysis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-violet-500" />
            </div>
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
            ? "Energy is well-distributed across the frequency range. Likely to translate well on most playback systems."
            : spectrum.label === "bass-heavy"
            ? "Significant low-end energy dominates. Check translation on earbuds and laptop speakers."
            : spectrum.label === "bright"
            ? "Upper frequencies are prominent. May cause listener fatigue on extended listening."
            : spectrum.label === "mid-forward"
            ? "Strong mid-range presence. Great for guitar and vocal-led music; check for masking."
            : "Limited frequency content. Consider whether this suits the genre or needs attention."
          }
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-violet-500" />
            </div>
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

      <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
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
        <ul className="space-y-1">
          {translation.details.map((d, i) => (
            <li key={i} className="text-xs text-stone-500 flex gap-1.5">
              <span className="text-stone-300 mt-px">·</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
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
