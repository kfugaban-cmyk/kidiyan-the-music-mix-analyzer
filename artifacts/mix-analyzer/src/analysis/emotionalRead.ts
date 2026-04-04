import type { EmotionalReadData, TranslationRiskData, SpectrumData, StereoWidthData, DynamicsData } from "./types";

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * PRESENCE — vocal presence vs. background
 *
 * Driven by:
 *  - spectrum.mid: the 500–4kHz band where vocals, guitars, and lead
 *    instruments live. High energy here = something is upfront.
 *  - crestFactor: a heavily limited mix (low crest) flattens presence
 *    and pushes everything into the background even if mid is loud.
 *    Some crest headroom signals that transients are intact and the
 *    lead is "reaching out" toward the listener.
 *  - spectrum.sub penalty: a boomy low-end masks presence and pushes
 *    the perceived "body" of the mix away from the listener.
 */
function scorePresence(spectrum: SpectrumData, dynamics: DynamicsData): number {
  const midContrib = spectrum.mid * 0.65;
  const crestBonus = Math.min(dynamics.crestFactor * 2.2, 28);
  const subPenalty = spectrum.sub * 0.2;
  return clamp(midContrib + crestBonus - subPenalty - 10);
}

/**
 * ATTACK — softness of transients (rounded vs. cutting)
 *
 * Crest factor is the most direct proxy:
 *  - Below ~6 dB: heavy limiting has rounded every transient into a
 *    smooth, wall-like surface — nothing pops or snaps.
 *  - 6–12 dB: moderate compression; hits land with body but not bite.
 *  - 12–20 dB: transients are largely preserved; snares crack, kicks
 *    thump with definition, attacks feel alive.
 *  - Above 20 dB: very open dynamics — individual transients are sharp
 *    and cutting, like an unprocessed acoustic recording.
 */
function scoreAttack(dynamics: DynamicsData): number {
  return clamp((dynamics.crestFactor - 4) * 5.5);
}

/**
 * SPACE — dry vs. open/reverberant
 *
 * Uses two proxies together:
 *  - stereo.widthScore: reverb and room ambience spread energy into the
 *    side channel, so wider = more likely to contain spatial information.
 *  - spectrum.high: high-frequency air (8kHz+) is where reverb tails
 *    and room shimmer live. A lot of high-shelf energy suggests space.
 *  - spectrum.sub penalty: heavy sub content closes the room down —
 *    mixes that are sub-dominant tend to feel close and dry.
 */
function scoreSpace(spectrum: SpectrumData, stereo: StereoWidthData): number {
  const widthContrib = stereo.widthScore * 0.6;
  const airContrib = spectrum.high * 0.38;
  const subPenalty = spectrum.sub * 0.18;
  return clamp(widthContrib + airContrib - subPenalty);
}

/**
 * WEIGHT — spectral gravity (airy vs. heavy)
 *
 * Compares low-frequency mass against high-frequency lightness:
 *  - Sub and low-mid energy = physical weight, body, ground.
 *  - High energy = air, shimmer, lightness — the mix floats.
 * An offset of 20 keeps balanced mixes near the midpoint rather than
 * defaulting to "airy" simply because highs are low.
 */
function scoreWeight(spectrum: SpectrumData): number {
  const lowMass = spectrum.sub * 0.55 + spectrum.lowMid * 0.35;
  const highLift = spectrum.high * 0.3;
  return clamp(lowMass - highLift + 20);
}

export function analyzeEmotionalRead(
  spectrum: SpectrumData,
  stereo: StereoWidthData,
  dynamics: DynamicsData
): EmotionalReadData {
  const presenceValue = scorePresence(spectrum, dynamics);
  const attackValue = scoreAttack(dynamics);
  const spaceValue = scoreSpace(spectrum, stereo);
  const weightValue = scoreWeight(spectrum);

  return {
    presence: {
      value: presenceValue,
      label: presenceValue >= 50 ? "upfront" : "recessed",
    },
    attack: {
      value: attackValue,
      label: attackValue >= 45 ? "cutting" : "rounded",
    },
    space: {
      value: spaceValue,
      label: spaceValue >= 40 ? "open" : "dry",
    },
    weight: {
      value: weightValue,
      label: weightValue >= 50 ? "heavy" : "airy",
    },
  };
}

export function analyzeTranslationRisk(
  spectrum: SpectrumData,
  stereo: StereoWidthData,
  dynamics: DynamicsData
): TranslationRiskData {
  const risks: string[] = [];

  if (spectrum.sub > 70) risks.push("Heavy sub-bass may not translate on small speakers");
  if (stereo.widthScore < 10) risks.push("Very narrow stereo field — check mono compatibility");
  if (stereo.widthScore > 80) risks.push("Extreme stereo width may collapse in mono");
  if (spectrum.high > 75) risks.push("Harsh high-frequency content may cause listener fatigue");
  if (dynamics.crestFactor < 6) risks.push("Heavy limiting — little dynamic headroom remaining");

  let label: TranslationRiskData["label"];
  let risk: TranslationRiskData["risk"];

  if (risks.length === 0) {
    label = "mono-safe";
    risk = "low";
  } else if (risks.length === 1) {
    if (risks[0].includes("sub-bass")) label = "low-end risk";
    else if (risks[0].includes("stereo") || risks[0].includes("narrow")) label = "stereo risk";
    else label = "harshness risk";
    risk = "medium";
  } else {
    label = "multiple risks";
    risk = "high";
    if (!risks.some(r => r.includes("sub"))) {
      risks.unshift("Check low-end translation on consumer speakers");
    }
  }

  if (risks.length === 0) {
    risks.push("Mix looks safe across formats");
  }

  return { label, risk, details: risks };
}
