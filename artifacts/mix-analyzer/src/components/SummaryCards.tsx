import type { ReactNode } from "react";
import type { MixAnalysis, EmotionalDimensionAnalysis } from "@/analysis/types";
import { Activity, AlertTriangle, CheckCircle2, ChevronDown, Compass, FlaskConical, Layers3, Sparkles } from "lucide-react";
import { EmotionalHierarchy } from "@/components/EmotionalHierarchy";
import { DynamicsDisplay } from "@/components/DynamicsDisplay";
import { IntentionAnalysis } from "@/components/IntentionAnalysis";
import { SpectrumDisplay } from "@/components/SpectrumDisplay";
import { StereoWidthDisplay } from "@/components/StereoWidthDisplay";
import { WaveformDisplay } from "@/components/WaveformDisplay";

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
    <div className="rounded-[24px] p-5" style={surfaceStyle}>
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

function evidenceSignature(dimension: EmotionalDimensionAnalysis): string {
  return dimension.evidence
    .slice(0, 2)
    .map((item) => item.feature.trim().toLowerCase())
    .sort()
    .join("|");
}

function rankDimensions(dimensions: EmotionalDimensionAnalysis[]): EmotionalDimensionAnalysis[] {
  const confidenceBonus = { low: 0, medium: 2, high: 4 };
  return [...dimensions].sort((a, b) => {
    const aStrength = a.score + confidenceBonus[a.confidence] + a.evidence.filter((item) => item.strength === "strong").length;
    const bStrength = b.score + confidenceBonus[b.confidence] + b.evidence.filter((item) => item.strength === "strong").length;
    return bStrength - aStrength;
  });
}

function distinctDeeperReadings(dimensions: EmotionalDimensionAnalysis[]): EmotionalDimensionAnalysis[] {
  const seen = new Set<string>();

  return dimensions.filter((dimension) => {
    // Keep the two vulnerability models distinct even when they share evidence.
    if (dimension.key === "fragileVulnerability" || dimension.key === "intentionalVulnerability") return true;
    const signature = `${dimension.tendency}:${evidenceSignature(dimension)}`;
    if (!signature || seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function FindingCard({ dimension, index }: { dimension: EmotionalDimensionAnalysis; index: number }) {
  const evidence = dimension.evidence.find((item) => item.strength === "strong") ?? dimension.evidence[0];

  return (
    <article className="rounded-[24px] border border-stone-200/80 bg-white/88 p-5 shadow-[0_10px_30px_rgba(35,32,24,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Finding {index + 1}</p>
          <h3 className="mt-2 text-lg font-semibold leading-tight text-stone-900">{dimension.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill className={classForLevel(dimension.tendency)}>{dimension.tendency} tendency</Pill>
            <Pill className={confidenceClass(dimension.confidence)}>{dimension.confidence} confidence</Pill>
          </div>
        </div>
        <div className="min-w-[68px] rounded-2xl bg-stone-900 px-3 py-2 text-right text-stone-50">
          <p className="text-xl font-semibold tabular-nums">{dimension.score}</p>
          <p className="text-[9px] uppercase tracking-[0.18em] text-stone-300">Estimate</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-stone-700">
        The model estimates a {dimension.tendency} tendency toward {dimension.name.toLowerCase()}. {evidence?.influence}
      </p>
      {evidence && (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Measurement connection</p>
          </div>
          <p className="mt-2 text-sm font-semibold text-stone-900">{evidence.feature}</p>
          <p className="mt-1 text-sm leading-6 text-stone-700">{evidence.observation}</p>
        </div>
      )}
    </article>
  );
}

function QuickExperiment({ dimension }: { dimension: EmotionalDimensionAnalysis }) {
  const increase = dimension.recommendations.find((item) => item.direction === "increase");
  const action = increase?.items[0];
  if (!action) return null;

  return (
    <article className="rounded-[22px] border border-amber-100 bg-amber-50/55 p-4">
      <div className="flex items-center gap-2 text-amber-900">
        <FlaskConical className="h-4 w-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]">A/B experiment</p>
      </div>
      <h4 className="mt-3 text-sm font-semibold text-stone-900">Test for more {dimension.name.toLowerCase()}</h4>
      <p className="mt-2 text-sm leading-6 text-stone-700">On a short representative loop, try this move: {action}</p>
      <p className="mt-2 text-xs leading-5 text-stone-600"><strong>Listen for:</strong> whether the emotional tendency becomes clearer without simply becoming louder. Level-match the bypass before deciding.</p>
      {dimension.tradeoffs[0] && <p className="mt-1 text-xs leading-5 text-stone-600"><strong>Tradeoff:</strong> {dimension.tradeoffs[0]}</p>}
    </article>
  );
}

function DeepReadingCard({ dimension }: { dimension: EmotionalDimensionAnalysis }) {
  const increase = dimension.recommendations.find((item) => item.direction === "increase");
  const reduce = dimension.recommendations.find((item) => item.direction === "reduce");

  return (
    <article className="rounded-[22px] border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-stone-900">{dimension.name}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill className={classForLevel(dimension.tendency)}>{dimension.tendency} tendency</Pill>
            <Pill className={confidenceClass(dimension.confidence)}>{dimension.confidence} confidence</Pill>
          </div>
        </div>
        <p className="text-2xl font-semibold tabular-nums text-stone-900">{dimension.score}</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-stone-700">{dimension.interpretation}</p>
      <div className="mt-4 space-y-2">
        {dimension.evidence.slice(0, 2).map((item) => (
          <div key={item.feature} className="rounded-xl bg-stone-50 p-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-semibold text-stone-900">{item.feature}</p>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-stone-400">{item.strength}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-stone-600">{item.observation} {item.influence}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {increase?.items[0] && <p className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-950"><strong>To increase:</strong> {increase.items[0]}</p>}
        {reduce?.items[0] && <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950"><strong>To reduce:</strong> {reduce.items[0]}</p>}
      </div>
    </article>
  );
}

export function SummaryCards({ analysis }: Props) {
  const snapshot = describeEvidenceSnapshot(analysis);
  const { emotionalProfile, translation } = analysis;
  const rankedDimensions = rankDimensions(emotionalProfile.dimensions);
  const keyFindings = rankedDimensions.slice(0, 3);
  const deeperReadings = distinctDeeperReadings(rankedDimensions.slice(3));

  return (
    <div className="space-y-5">
      <SectionCard icon={<Sparkles className="h-5 w-5" />} title="Overall Mix Identity" eyebrow="Perceived emotional profile">
        <div className="space-y-4">
          <p className="max-w-3xl text-sm leading-6 text-stone-800">{emotionalProfile.overview}</p>
          <p className="text-xs leading-5 text-stone-600">{emotionalProfile.disclaimer}</p>

          <EmotionalHierarchy dimensions={emotionalProfile.dimensions} />
        </div>
      </SectionCard>

      <SectionCard icon={<Layers3 className="h-5 w-5" />} title="Three Key Findings" eyebrow="Strongest evidence-backed readings">
        <div className="grid gap-4 lg:grid-cols-3">
          {keyFindings.map((dimension, index) => (
            <FindingCard key={dimension.key} dimension={dimension} index={index} />
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={<FlaskConical className="h-5 w-5" />} title="What to Try Next" eyebrow="Reversible listening experiments">
        <div className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-3">
            {keyFindings.map((dimension) => <QuickExperiment key={dimension.key} dimension={dimension} />)}
          </div>
          <IntentionAnalysis ledger={analysis.measurementLedger} />
        </div>
      </SectionCard>

      <SectionCard icon={<Activity className="h-5 w-5" />} title="Technical Evidence" eyebrow="Measured facts + bounded proxies">
        <div className="space-y-5">
          <WaveformDisplay data={analysis.waveform} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SpectrumDisplay data={analysis.spectrum} />
            <StereoWidthDisplay data={analysis.stereo} />
          </div>
          <DynamicsDisplay data={analysis.dynamics} />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] bg-stone-50 p-5 ring-1 ring-stone-200">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-stone-700" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Interpretable proxies</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {snapshot.map((item) => (
                  <div key={item.label} className="rounded-xl bg-white p-3 ring-1 ring-stone-200">
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-xs font-semibold text-stone-900">{item.label}</p>
                      <p className="text-base font-semibold tabular-nums text-stone-900">{item.value}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-stone-600">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] bg-stone-900 p-5 text-stone-50">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300">What is driving the read</p>
              <p className="mt-3 text-sm leading-6 text-stone-100">{describeTonalBalance(analysis)}</p>
              <p className="mt-3 text-sm leading-6 text-stone-100">{describeDynamicFeel(analysis)}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Measurement ledger</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {analysis.measurementLedger.facts.map((fact) => (
                <div key={fact.id} className="rounded-xl border border-stone-200 bg-white p-3">
                  <p className="text-[10px] font-semibold leading-4 text-stone-500">{fact.label}</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{fact.displayValue}</p>
                  <p className="mt-1 text-[9px] leading-4 text-stone-500">{fact.method}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] bg-stone-50 p-5 ring-1 ring-stone-200">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-stone-700" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Translation risk</p>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Pill className={translation.risk === "high" ? "text-rose-900 bg-rose-500/10 border-rose-700/20" : translation.risk === "medium" ? "text-amber-900 bg-amber-500/10 border-amber-700/20" : "text-emerald-900 bg-emerald-500/10 border-emerald-700/20"}>{translation.risk} risk</Pill>
                <Pill className="text-stone-800 bg-white border-stone-200">{translation.label}</Pill>
              </div>
              {translation.details.map((detail) => <p key={detail} className="mt-2 text-xs leading-5 text-stone-600">{detail}</p>)}
            </div>
            <div className="rounded-[22px] bg-amber-50 p-5 ring-1 ring-amber-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">Limits + uncertainty</p>
              {[...analysis.measurementLedger.caveats, ...emotionalProfile.uncertainty].map((note, index) => (
                <p key={`${index}-${note}`} className="mt-2 text-xs leading-5 text-amber-950">{note}</p>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <details className="group overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_14px_44px_rgba(35,32,24,0.07)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:content-none sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-stone-50"><Layers3 className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Optional deeper reading</p>
              <h3 className="text-base font-semibold text-stone-900">Explore the deeper reading</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-stone-500 sm:inline">{deeperReadings.length} distinct dimensions</span>
            <ChevronDown className="h-5 w-5 text-stone-500 transition-transform duration-300 group-open:rotate-180" />
          </div>
        </summary>
        <div className="border-t border-stone-200 bg-stone-50/60 p-4 sm:p-6">
          <p className="mb-4 max-w-2xl text-xs leading-5 text-stone-600">
            These secondary tendencies remain available for exploration, but they are intentionally separated from the judge-facing conclusions above. Cards with the same dominant evidence pattern are shown only once.
          </p>
          <div className="grid gap-4 xl:grid-cols-2">
            {deeperReadings.map((dimension) => <DeepReadingCard key={dimension.key} dimension={dimension} />)}
          </div>
        </div>
      </details>
    </div>
  );
}
