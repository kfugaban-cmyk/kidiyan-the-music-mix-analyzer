import type { ReactNode } from "react";
import type { MixAnalysis, EmotionalDimensionAnalysis } from "@/analysis/types";
import { Activity, AlertTriangle, Compass, Gauge, Layers3, Sparkles } from "lucide-react";
import { EmotionalHierarchy } from "@/components/EmotionalHierarchy";

interface Props {
  analysis: MixAnalysis;
}

const surfaceStyle = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,245,239,0.98) 100%)",
  boxShadow: "0 12px 40px rgba(35, 32, 24, 0.08), 0 0 0 1px rgba(72, 63, 48, 0.08)",
};

function classForLevel(level: "low" | "moderate" | "high") {
  if (level === "high") return "text-stone-900 bg-stone-900/8 border-stone-900/15";
  if (level === "moderate") return "text-amber-900 bg-amber-500/10 border-amber-600/20";
  return "text-teal-900 bg-teal-500/10 border-teal-700/20";
}

function confidenceClass(level: "low" | "medium" | "high") {
  if (level === "high") return "text-emerald-900 bg-emerald-500/10 border-emerald-700/20";
  if (level === "medium") return "text-amber-900 bg-amber-500/10 border-amber-700/20";
  return "text-rose-900 bg-rose-500/10 border-rose-700/20";
}

function Pill({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>{children}</span>;
}

function SectionCard({
  icon,
  title,
  eyebrow,
  children,
}: {
  icon: ReactNode;
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[24px] p-5 print-page-card print:break-inside-avoid" style={surfaceStyle}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-stone-50 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">{eyebrow}</p>
          <p className="text-base font-semibold text-stone-900">{title}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function describeTonalBalance(analysis: MixAnalysis): string {
  const { spectrum, features } = analysis;
  return `Sub ${spectrum.sub}%, low-mids ${spectrum.lowMid}%, mids ${spectrum.mid}%, highs ${spectrum.high}%. The deeper emotional read is being shaped by low-mid density at ${features.tonal.lowMidDensity}/100, air at ${features.tonal.airBandEnergy}/100, and 2k-5k pressure at ${features.tonal.harshness2k5k}/100.`;
}

function describeDynamicFeel(analysis: MixAnalysis): string {
  const { dynamics, features } = analysis;
  return `Crest factor is ${dynamics.crestFactor} dB with approximate loudness around ${dynamics.approxLufs} LUFS. Microdynamic motion scores ${features.dynamics.microDynamics}/100, section contrast ${features.dynamics.sectionContrast}/100, and compression density ${features.dynamics.compressionDensity}/100, which says more about felt pressure than loudness alone.`;
}

function describeEvidenceSnapshot(analysis: MixAnalysis): Array<{ label: string; value: number; note: string }> {
  const { features } = analysis;
  return [
    {
      label: "Dry / wet",
      value: features.space.dryWet,
      note: features.space.dryWet > 60 ? "More ambient distance is influencing the emotional read." : "The mix stays relatively dry and immediate.",
    },
    {
      label: "Center hold",
      value: features.stereo.centerDominance,
      note: features.stereo.centerDominance > 60 ? "Emotion is anchored around the center image." : "The frame leans less center-held and more spread.",
    },
    {
      label: "Masking risk",
      value: features.density.maskingRisk,
      note: features.density.maskingRisk > 60 ? "Density is likely competing for the same space." : "Layer separation is helping the emotional cues stay legible.",
    },
    {
      label: "Vocal closeness",
      value: features.focal.vocalForwardness,
      note:
        features.focal.vocalForwardnessConfidence === "low"
          ? "Lead closeness is uncertain because no obvious center focal source stands out."
          : "The focal source appears meaningfully present in the emotional foreground.",
    },
  ];
}

function EmotionCard({ dimension }: { dimension: EmotionalDimensionAnalysis }) {
  const increase = dimension.recommendations.find((item) => item.direction === "increase");
  const reduce = dimension.recommendations.find((item) => item.direction === "reduce");

  return (
    <div className="rounded-[24px] border border-stone-200/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(35,32,24,0.06)] print-page-card print:break-inside-avoid">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-base font-semibold leading-tight text-stone-900">{dimension.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill className={classForLevel(dimension.tendency)}>{dimension.tendency} tendency</Pill>
            <Pill className={confidenceClass(dimension.confidence)}>{dimension.confidence} confidence</Pill>
          </div>
        </div>
        <div className="min-w-[72px] rounded-2xl bg-stone-900 px-3 py-2 text-right text-stone-50">
          <p className="text-xl font-semibold tabular-nums">{dimension.score}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-300">Score</p>
        </div>
      </div>

      <p className="text-sm leading-6 text-stone-800">{dimension.summary}</p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Why it may feel this way</p>
          <p className="text-sm leading-6 text-stone-700">{dimension.interpretation}</p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Likely mix causes</p>
          <p className="text-sm leading-6 text-stone-700">{dimension.mixCause}</p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Evidence</p>
          <div className="space-y-2">
            {dimension.evidence.map((item) => (
              <div key={item.feature} className="rounded-2xl bg-stone-50 px-3 py-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900">{item.feature}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${item.strength === "strong" ? "text-stone-900" : "text-stone-500"}`}>
                    {item.strength}
                  </span>
                </div>
                <p className="text-sm leading-6 text-stone-700">{item.observation}</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">{item.influence}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 px-4 py-4 ring-1 ring-emerald-100">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">To increase this feeling</p>
            <ul className="space-y-2">
              {increase?.items.map((item) => (
                <li key={item} className="text-sm leading-6 text-emerald-950">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-4 ring-1 ring-amber-100">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800">To reduce this feeling</p>
            <ul className="space-y-2">
              {reduce?.items.map((item) => (
                <li key={item} className="text-sm leading-6 text-amber-950">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Potential tradeoffs</p>
          <ul className="space-y-2">
            {dimension.tradeoffs.map((tradeoff) => (
              <li key={tradeoff} className="text-sm leading-6 text-stone-700">
                {tradeoff}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SummaryCards({ analysis }: Props) {
  const snapshot = describeEvidenceSnapshot(analysis);
  const { emotionalProfile, translation } = analysis;

  return (
    <div className="space-y-5 print:space-y-4">
      <SectionCard icon={<Sparkles className="h-5 w-5" />} title="Emotional Profile" eyebrow="Perceived tendencies">
        <div className="space-y-4">
          <p className="max-w-3xl text-sm leading-6 text-stone-800">{emotionalProfile.overview}</p>
          <p className="text-xs leading-5 text-stone-600">{emotionalProfile.disclaimer}</p>

          <EmotionalHierarchy dimensions={emotionalProfile.dimensions} />

          <div className="flex flex-wrap gap-2">
            {emotionalProfile.standoutDimensions.map((key) => {
              const item = emotionalProfile.dimensions.find((dimension) => dimension.key === key);
              if (!item) return null;
              return <Pill key={key} className={classForLevel(item.tendency)}>{item.name}</Pill>;
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[22px] bg-stone-900 px-5 py-5 text-stone-50">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-300">Model note</p>
              <p className="text-sm leading-6 text-stone-100">
                This engine is rule-based and interpretable: it scores emotional dimensions from measured mix proxies like density, width by band, transient shape, dynamic relief, dry/wet impression, and spectral balance. It is intentionally not treating emotion as objective truth.
              </p>
            </div>

            <div className="rounded-[22px] bg-stone-50 px-5 py-5 ring-1 ring-stone-200">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Potential tradeoffs</p>
              <ul className="space-y-2">
                {emotionalProfile.tradeoffHighlights.map((tradeoff) => (
                  <li key={tradeoff} className="text-sm leading-6 text-stone-700">
                    {tradeoff}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {emotionalProfile.uncertainty.length > 0 && (
            <div className="rounded-[22px] bg-amber-50 px-5 py-5 ring-1 ring-amber-100">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Uncertainty</p>
              <ul className="space-y-2">
                {emotionalProfile.uncertainty.map((note) => (
                  <li key={note} className="text-sm leading-6 text-amber-950">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={<Activity className="h-5 w-5" />} title="Tonal + Dynamic Context" eyebrow="What is driving the read">
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Spectrum</p>
              <p className="text-sm leading-6 text-stone-700">{describeTonalBalance(analysis)}</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">Dynamics</p>
              <p className="text-sm leading-6 text-stone-700">{describeDynamicFeel(analysis)}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<Compass className="h-5 w-5" />} title="Evidence Snapshot" eyebrow="Interpretable proxies">
          <div className="grid gap-3 sm:grid-cols-2">
            {snapshot.map((item) => (
              <div key={item.label} className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900">{item.label}</p>
                  <p className="text-lg font-semibold tabular-nums text-stone-900">{item.value}</p>
                </div>
                <p className="text-sm leading-6 text-stone-700">{item.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={<AlertTriangle className="h-5 w-5" />} title="Translation Risk" eyebrow="Playback realism">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pill className={translation.risk === "high" ? "text-rose-900 bg-rose-500/10 border-rose-700/20" : translation.risk === "medium" ? "text-amber-900 bg-amber-500/10 border-amber-700/20" : "text-emerald-900 bg-emerald-500/10 border-emerald-700/20"}>
              {translation.risk} risk
            </Pill>
            <Pill className="text-stone-800 bg-stone-100 border-stone-200">{translation.label}</Pill>
          </div>
          <ul className="space-y-2">
            {translation.details.map((detail) => (
              <li key={detail} className="text-sm leading-6 text-stone-700">
                {detail}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={<Gauge className="h-5 w-5" />} title="Feature Model" eyebrow="Tuneable system">
          <div className="space-y-3 text-sm leading-6 text-stone-700">
            <p>The emotional engine separates feature extraction, emotion scoring, explanation, and suggestion generation so you can retune the mapping without rewriting the UI.</p>
            <p>Heuristics use weighted combinations, not one-to-one tags, which lets contradictory feelings coexist: a mix can be intimate and open, heavy and restrained, or warm and overwhelming at the same time.</p>
            <p>The strongest tuning points live in the feature scores and rule weights, not in presentation copy.</p>
          </div>
        </SectionCard>
      </div>

      <SectionCard icon={<Layers3 className="h-5 w-5" />} title="Per-Emotion Score Cards" eyebrow="Deep read">
        <div className="grid gap-4 xl:grid-cols-2">
          {emotionalProfile.dimensions.map((dimension) => (
            <EmotionCard key={dimension.key} dimension={dimension} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
