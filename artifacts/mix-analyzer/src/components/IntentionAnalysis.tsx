import { useState } from "react";
import { ArrowRight, Beaker, CheckCircle2, FlaskConical, Gauge, Sparkles } from "lucide-react";
import { PRODUCTION_INTENTIONS, getProductionIntention } from "@/grounded/intentions";
import { requestGroundedInterpretation } from "@/grounded/interpretationClient";
import type {
  EvidenceCategory,
  GroundedInterpretation,
  MeasurementLedger,
  ProductionIntentionKey,
} from "@/grounded/types";

interface Props {
  ledger: MeasurementLedger;
}

const categoryLabels: Record<EvidenceCategory, string> = {
  measured_fact: "Measured fact",
  limited_inference: "Limited inference",
  creative_interpretation: "Creative interpretation",
};

const categoryStyles: Record<EvidenceCategory, string> = {
  measured_fact: "border-emerald-200 bg-emerald-50 text-emerald-800",
  limited_inference: "border-sky-200 bg-sky-50 text-sky-800",
  creative_interpretation: "border-amber-200 bg-amber-50 text-amber-900",
};

export function IntentionAnalysis({ ledger }: Props) {
  const [intention, setIntention] = useState<ProductionIntentionKey | null>(null);
  const [interpretation, setInterpretation] = useState<GroundedInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const chooseIntention = (key: ProductionIntentionKey) => {
    setIntention(key);
    setInterpretation(null);
  };

  const interpret = async () => {
    if (!intention) return;
    setIsLoading(true);
    try {
      setInterpretation(await requestGroundedInterpretation(ledger, intention));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedIntention = intention ? getProductionIntention(intention) : null;

  return (
    <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_20px_70px_rgba(72,55,38,0.09)] print:break-before-page">
      <div
        className="relative overflow-hidden border-b border-stone-200 px-5 py-6 sm:px-7"
        style={{ background: "linear-gradient(125deg, hsl(194 39% 18%) 0%, hsl(181 29% 24%) 58%, hsl(36 48% 28%) 130%)" }}
      >
        <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-8 h-28 w-28 rounded-full border border-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-teal-100/80">
            <Beaker className="h-3.5 w-3.5" />
            Intention-led evidence lab
          </div>
          <h3 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-white">What are you trying to make the listener feel?</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-200/85">
            Choose a production intention first. The reading will use measured values as evidence, then label where technical inference ends and creative judgment begins.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as EvidenceCategory[]).map((category) => (
              <span key={category} className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-white/85">
                {categoryLabels[category]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-7">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 print:hidden">
          {PRODUCTION_INTENTIONS.map((item) => {
            const selected = intention === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => chooseIntention(item.key)}
                className={`min-h-20 rounded-2xl border px-3 py-3 text-left transition-all duration-200 last:col-span-2 sm:last:col-span-1 ${
                  selected
                    ? "-translate-y-0.5 border-teal-600 bg-teal-950 text-white shadow-lg shadow-teal-950/15"
                    : "border-stone-200 bg-stone-50/70 text-stone-700 hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                <span className="block text-xs font-bold">{item.shortLabel}</span>
                <span className={`mt-1 block text-[10px] leading-4 ${selected ? "text-teal-100/80" : "text-stone-500"}`}>
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>

        {selectedIntention ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 p-4 sm:flex-row sm:items-center sm:justify-between print:border-stone-300 print:bg-white">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Selected intention</p>
              <p className="mt-1 text-sm font-semibold text-stone-900">{selectedIntention.name}</p>
            </div>
            <button
              type="button"
              onClick={interpret}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-950 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 print:hidden"
            >
              {isLoading ? "Grounding the reading..." : interpretation ? "Regenerate reading" : "Generate grounded reading"}
              {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-center print:hidden">
            <p className="text-xs font-semibold text-stone-700">Select one intention to begin the interpretation.</p>
            <p className="mt-1 text-[11px] text-stone-500">Measurements stay the same; the creative question changes.</p>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-emerald-700" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">Measured foundation</p>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${categoryStyles.measured_fact}`}>Measured fact</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ledger.facts.slice(0, 8).map((fact) => (
              <div key={fact.id} className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 print:break-inside-avoid">
                <p className="text-[10px] font-semibold leading-4 text-stone-500">{fact.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{fact.displayValue}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-4 text-stone-500">
            Measurements come from decoded PCM and sampled FFT frames. No source separation is used, and equal thirds are not claimed as song sections.
          </p>
        </div>

        {interpretation && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <h4 className="text-lg font-semibold text-stone-900">{interpretation.headline}</h4>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{interpretation.relationshipToIntention}</p>
              </div>
              <div className="shrink-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Interpretation mode</p>
                <p className="mt-1 text-[11px] font-semibold text-stone-800">
                  {interpretation.mode === "gpt-5.6" ? "GPT-5.6 structured" : "Deterministic fallback"}
                </p>
              </div>
            </div>

            {interpretation.fallbackReason && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-900">
                <strong>Fallback is active.</strong> {interpretation.fallbackReason} The reading below uses the same measured evidence with local, repeatable rules.
              </div>
            )}

            <div className="space-y-3">
              {interpretation.claims.map((item, index) => {
                const evidence = item.evidenceIds
                  .map((id) => ledger.facts.find((fact) => fact.id === id))
                  .filter((fact): fact is NonNullable<typeof fact> => Boolean(fact));
                return (
                  <article key={`${item.title}-${index}`} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm print:break-inside-avoid sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${categoryStyles[item.category]}`}>
                        {categoryLabels[item.category]}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-stone-400">{item.confidence} confidence</span>
                    </div>
                    <h5 className="mt-3 text-base font-semibold text-stone-900">{item.title}</h5>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{item.statement}</p>

                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/55 p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-800">Supporting evidence</p>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {evidence.map((fact) => (
                          <div key={fact.id} className="rounded-lg bg-white/75 px-3 py-2">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-[10px] font-semibold text-stone-600">{fact.label}</span>
                              <span className="text-xs font-bold text-stone-900">{fact.displayValue}</span>
                            </div>
                            <p className="mt-1 text-[9px] leading-4 text-stone-500">{fact.method}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                      <div className="flex items-center gap-2 text-amber-900">
                        <FlaskConical className="h-3.5 w-3.5" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em]">Listening experiment</p>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-5 text-stone-800">{item.experiment.action}</p>
                      <p className="mt-1 text-[11px] leading-5 text-stone-600"><strong>Listen for:</strong> {item.experiment.listenFor}</p>
                      <p className="mt-1 text-[11px] leading-5 text-stone-600"><strong>Tradeoff:</strong> {item.experiment.tradeoff}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-600">Boundaries of this reading</p>
              {ledger.caveats.map((caveat) => (
                <p key={caveat} className="mt-1 text-[10px] leading-4 text-stone-500">{caveat}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
