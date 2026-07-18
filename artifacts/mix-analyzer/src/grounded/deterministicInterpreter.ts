import { getProductionIntention } from "./intentions";
import type {
  GroundedClaim,
  GroundedInterpretation,
  MeasurementLedger,
  MeasurementRecord,
  ProductionIntentionKey,
} from "./types";

function factMap(ledger: MeasurementLedger): Map<string, MeasurementRecord> {
  return new Map(ledger.facts.map((fact) => [fact.id, fact]));
}

function requireFact(facts: Map<string, MeasurementRecord>, id: string): MeasurementRecord {
  const value = facts.get(id);
  if (!value) throw new Error(`Missing deterministic interpretation evidence: ${id}`);
  return value;
}

function claim(value: GroundedClaim): GroundedClaim {
  return value;
}

function interpretCloser(facts: Map<string, MeasurementRecord>): GroundedClaim[] {
  const presence = requireFact(facts, "spectrum.presence_share_pct");
  const side = requireFact(facts, "stereo.side_share_pct");
  const crest = requireFact(facts, "dynamics.crest_db");
  const frameRange = requireFact(facts, "dynamics.frame_range_db");

  return [
    claim({
      category: "limited_inference",
      title: "Foreground readability",
      statement: presence.value >= 35
        ? `The mix carries substantial 500 Hz-5 kHz energy (${presence.displayValue}), which may help a central performance read clearly, but the measurement cannot identify a vocal.`
        : `The 500 Hz-5 kHz share is ${presence.displayValue}, so a focal performance may need to compete with less naturally forward spectral support; source identity remains unknown.`,
      confidence: "medium",
      evidenceIds: [presence.id],
      experiment: {
        action: "Try a level-only 0.5-1 dB lift on the emotional focal source, then loudness-match the comparison.",
        listenFor: "Whether words, breath, or phrasing become easier to follow without the whole mix turning harder.",
        tradeoff: "Extra foreground level can reduce depth and make upper-mid buildup more obvious.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Exposure versus enclosure",
      statement: side.value <= 22
        ? `With ${side.displayValue} in the side channel, the mix may feel more center-held than enveloping. For a closer intention, that can support directness if the focal source is actually centered.`
        : `A ${side.displayValue} side share gives the frame noticeable lateral space. That may make exposure feel scenic rather than face-to-face unless the center remains clearly prioritized.`,
      confidence: "medium",
      evidenceIds: [side.id],
      experiment: {
        action: "Narrow only the emotionally central return or double by 10-15%, leaving the rest of the width intact.",
        listenFor: "Whether the focal moment feels nearer without shrinking the arrangement around it.",
        tradeoff: "Narrowing too much can trade intimacy for a smaller, less dimensional image.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Controlled reveal",
      statement: crest.value >= 11 || frameRange.value >= 7
        ? `Crest factor (${crest.displayValue}) and frame range (${frameRange.displayValue}) leave meaningful level contrast, so closeness could retain human movement rather than feeling completely leveled.`
        : `Crest factor (${crest.displayValue}) and frame range (${frameRange.displayValue}) are relatively contained, so the mix may present exposure through clarity more than through audible dynamic looseness.`,
      confidence: "medium",
      evidenceIds: [crest.id, frameRange.id],
      experiment: {
        action: "Bypass one stage of vocal or mix-bus leveling and compensate the output level before comparing.",
        listenFor: "Whether low-level phrase movement adds emotional access or merely makes the focal element unstable.",
        tradeoff: "More variation can feel vulnerable, but it can also weaken lyric consistency on small speakers.",
      },
    }),
  ];
}

function interpretWeight(facts: Map<string, MeasurementRecord>): GroundedClaim[] {
  const lowBody = requireFact(facts, "spectrum.low_body_share_pct");
  const centroid = requireFact(facts, "spectrum.centroid_hz");
  const crest = requireFact(facts, "dynamics.crest_db");
  const regionSpread = requireFact(facts, "regions.level_spread_db");

  return [
    claim({
      category: "limited_inference",
      title: "Spectral center of gravity",
      statement: `The 80-500 Hz amplitude share is ${lowBody.displayValue} while the spectral centroid is ${centroid.displayValue}. Together they ${lowBody.value >= 28 && centroid.value < 2600 ? "support" : "do not yet strongly establish"} a lower, more embodied center of gravity.`,
      confidence: "medium",
      evidenceIds: [lowBody.id, centroid.id],
      experiment: {
        action: "Audition a broad, level-matched 0.5-1 dB move around 180-350 Hz on the musical body bus.",
        listenFor: "Whether the mix gains burden and physical body, or only loses separation.",
        tradeoff: "Added body can increase emotional weight while also raising masking and boxiness.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Mass versus punch",
      statement: crest.value < 10
        ? `A ${crest.displayValue} crest factor keeps peak-to-average movement compact, which may let weight feel sustained rather than struck and released.`
        : `A ${crest.displayValue} crest factor leaves pronounced peaks, so the current low-end impression may read as punch or motion more readily than continuous mass.`,
      confidence: "medium",
      evidenceIds: [crest.id],
      experiment: {
        action: "Compare a slower attack treatment against a transient-softened parallel path on the low-frequency anchor.",
        listenFor: "Which version feels heavier at the same loudness without losing the groove's first edge.",
        tradeoff: "Sustained mass can feel grounded, but too much can reduce propulsion.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Continuity of weight",
      statement: `Equal-duration regions differ by ${regionSpread.displayValue}. ${regionSpread.value <= 3 ? "That relative steadiness may keep weight present across the excerpt." : "That contrast suggests weight may arrive in selected moments rather than define the whole excerpt."}`,
      confidence: "low",
      evidenceIds: [regionSpread.id],
      experiment: {
        action: "Automate the low-body bus by less than 1 dB across the three broad time regions and compare both directions.",
        listenFor: "Whether continuity strengthens groundedness or erases a useful sense of arrival.",
        tradeoff: "Evening regions can create stability while reducing drama.",
      },
    }),
  ];
}

function interpretOpenness(facts: Map<string, MeasurementRecord>): GroundedClaim[] {
  const side = requireFact(facts, "stereo.side_share_pct");
  const correlation = requireFact(facts, "stereo.lr_correlation");
  const monoDelta = requireFact(facts, "stereo.mono_delta_db");
  const air = requireFact(facts, "spectrum.air_share_pct");

  return [
    claim({
      category: "limited_inference",
      title: "Lateral room",
      statement: `Side energy accounts for ${side.displayValue} and whole-mix L/R correlation is ${correlation.displayValue}. ${side.value >= 18 ? "There is measurable lateral information available for openness" : "The image is relatively center-led"}, though neither value describes front-to-back depth.`,
      confidence: "high",
      evidenceIds: [side.id, correlation.id],
      experiment: {
        action: "Increase width only above the low-mid range by a small amount, then fold the comparison to mono.",
        listenFor: "Whether the top opens around a stable center rather than detaching from it.",
        tradeoff: "More side energy can improve lift while weakening focus or mono consistency.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Air as lift",
      statement: air.value >= 5
        ? `The 10-18 kHz share is ${air.displayValue}, giving the mix measurable top-band material that could read as sheen or lift depending on source and balance.`
        : `Only ${air.displayValue} sits in the 10-18 kHz band, so openness may need to come from arrangement and space rather than additional gloss.`,
      confidence: "medium",
      evidenceIds: [air.id],
      experiment: {
        action: "Try a level-matched high shelf on ambience or supporting elements rather than the entire mix.",
        listenFor: "Whether the frame feels taller and freer without making the focal source brittle or distant.",
        tradeoff: "Air can create transcendence, but it can also reduce tenderness and expose codec noise.",
      },
    }),
    claim({
      category: "limited_inference",
      title: "Mono cost of openness",
      statement: `The measured mono fold-down level change is ${monoDelta.displayValue}. ${monoDelta.value < -1.5 ? "That loss suggests some openness may rely on cancelling side relationships." : "The average level change is modest, although tonal fold-down changes may still exist."}`,
      confidence: "medium",
      evidenceIds: [monoDelta.id, correlation.id],
      experiment: {
        action: "Toggle mono at the loudest and sparsest moments while bypassing each widening stage in turn.",
        listenFor: "Which stage changes the emotional scale versus merely lowering or hollowing the center.",
        tradeoff: "Protecting mono may reduce spectacular width, but often improves the reliability of the intended lift.",
      },
    }),
  ];
}

function interpretUrgency(facts: Map<string, MeasurementRecord>): GroundedClaim[] {
  const rms = requireFact(facts, "level.rms_dbfs");
  const crest = requireFact(facts, "dynamics.crest_db");
  const presence = requireFact(facts, "spectrum.presence_share_pct");
  const frameRange = requireFact(facts, "dynamics.frame_range_db");

  return [
    claim({
      category: "limited_inference",
      title: "Peak-to-average pressure",
      statement: `The mix measures ${rms.displayValue} RMS with ${crest.displayValue} of crest. ${crest.value <= 9 ? "That compact peak-to-average relationship can support continuous pressure" : "The larger peak margin favors impact and release over constant pressure"}, independent of final playback gain.`,
      confidence: "high",
      evidenceIds: [rms.id, crest.id],
      experiment: {
        action: "Compare 1 dB of level-matched bus compression with a transient-only parallel path.",
        listenFor: "Whether urgency comes from sustained pressure or from clearer front-edge impact.",
        tradeoff: "Continuous pressure can increase force while reducing vulnerability and long-term comfort.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Forward spectral pressure",
      statement: `The 500 Hz-5 kHz share is ${presence.displayValue}. ${presence.value >= 38 ? "That may make the mix feel insistently close or forceful" : "The mix is not relying heavily on the broad presence range for urgency"}, but the contributing sources cannot be identified.`,
      confidence: "medium",
      evidenceIds: [presence.id],
      experiment: {
        action: "Automate a narrow 0.5 dB presence lift into one intended peak instead of applying it globally.",
        listenFor: "Whether the section steps forward without creating hardness across the whole song.",
        tradeoff: "Presence supports urgency quickly, but fatigue and vocal harshness can rise just as quickly.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Relief around impact",
      statement: `Short-frame level range is ${frameRange.displayValue}. ${frameRange.value >= 8 ? "There is enough measured relief for forceful moments to arrive by contrast." : "The relatively uniform level contour may make urgency constant rather than dramatically earned."}`,
      confidence: "medium",
      evidenceIds: [frameRange.id],
      experiment: {
        action: "Pull the setup region down 0.5-1 dB instead of pushing the impact region up.",
        listenFor: "Whether the arrival feels more urgent at the same peak level.",
        tradeoff: "More setup contrast can improve impact while making quiet detail less portable in noisy playback.",
      },
    }),
  ];
}

function interpretContrast(facts: Map<string, MeasurementRecord>): GroundedClaim[] {
  const spread = requireFact(facts, "regions.level_spread_db");
  const frameRange = requireFact(facts, "dynamics.frame_range_db");
  const opening = requireFact(facts, "region.opening.rms_dbfs");
  const middle = requireFact(facts, "region.middle.rms_dbfs");
  const ending = requireFact(facts, "region.ending.rms_dbfs");

  const regionFacts = [opening, middle, ending];
  const loudest = [...regionFacts].sort((a, b) => b.value - a.value)[0];
  const quietest = [...regionFacts].sort((a, b) => a.value - b.value)[0];

  return [
    claim({
      category: "limited_inference",
      title: "Time-region contrast",
      statement: `The three equal-duration regions span ${spread.displayValue}; ${loudest.label.toLowerCase()} is loudest at ${loudest.displayValue}, and ${quietest.label.toLowerCase()} is quietest at ${quietest.displayValue}.`,
      confidence: "high",
      evidenceIds: [spread.id, loudest.id, quietest.id],
      experiment: {
        action: "Place markers at the actual musical boundaries nearest these thirds before making any automation decision.",
        listenFor: "Whether the measured contrast aligns with a real verse, chorus, breakdown, or outro transition.",
        tradeoff: "Equal thirds are useful evidence but can misrepresent the arrangement if boundaries land mid-section.",
      },
    }),
    claim({
      category: "limited_inference",
      title: "Macro versus local movement",
      statement: `Third-to-third spread is ${spread.displayValue}, while short-frame range is ${frameRange.displayValue}. ${frameRange.value > spread.value + 3 ? "Most measured movement appears local rather than section-scale." : "Broad regions account for a meaningful share of the level contrast."}`,
      confidence: "medium",
      evidenceIds: [spread.id, frameRange.id],
      experiment: {
        action: "Compare section automation against phrase-level automation, one at a time and loudness-matched.",
        listenFor: "Whether drama improves more from changing the architecture or from preserving movement inside each section.",
        tradeoff: "Large section moves can clarify narrative while flattening expressive detail within sections.",
      },
    }),
    claim({
      category: "creative_interpretation",
      title: "Drama through separation",
      statement: spread.value >= 4
        ? `A ${spread.displayValue} broad-region difference gives the mix a measurable basis for arrival and withdrawal, provided those regions correspond to musical events.`
        : `At ${spread.displayValue}, broad level contrast is restrained, so drama may currently depend more on orchestration, harmony, or timbre than on section-scale loudness.`,
      confidence: "low",
      evidenceIds: [spread.id],
      experiment: {
        action: "Reduce one pre-impact region by 0.75 dB and remove one supporting layer before changing the peak section.",
        listenFor: "Whether the next section feels larger because space was created, not because the master became louder.",
        tradeoff: "More separation can strengthen drama but may interrupt flow or expose sparse arrangement details.",
      },
    }),
  ];
}

export function createDeterministicInterpretation(
  ledger: MeasurementLedger,
  intentionKey: ProductionIntentionKey,
  fallbackReason?: string
): GroundedInterpretation {
  const facts = factMap(ledger);
  const intention = getProductionIntention(intentionKey);
  const claimsByIntention: Record<ProductionIntentionKey, () => GroundedClaim[]> = {
    closer_exposure: () => interpretCloser(facts),
    weight_grounding: () => interpretWeight(facts),
    openness_lift: () => interpretOpenness(facts),
    urgency_impact: () => interpretUrgency(facts),
    contrast_drama: () => interpretContrast(facts),
  };

  return {
    intention: intentionKey,
    mode: "deterministic",
    model: "local evidence rules v1",
    fallbackReason,
    headline: `A measured reading for “${intention.name}”`,
    relationshipToIntention: `This is an intention-specific listening hypothesis, not a verdict on the mix. The same measurements can support a different creative reading under another goal.`,
    claims: claimsByIntention[intentionKey](),
  };
}
