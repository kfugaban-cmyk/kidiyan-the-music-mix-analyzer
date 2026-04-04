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
  // Each device contributes exactly one observation, flagging a problem
  // where one exists, or confirming safety when it doesn't.

  // --- Phone speakers (small drivers, limited bass extension, mono-ish) ---
  let phoneNote: string;
  let phoneIssue = false;
  if (spectrum.sub > 58) {
    phoneNote = "low-end energy will likely disappear on phone speakers — the sub weight won't carry";
    phoneIssue = true;
  } else if (spectrum.high > 65) {
    phoneNote = "top end may feel harsh and brittle through phone speakers without a proper tweeter";
    phoneIssue = true;
  } else if (spectrum.mid < 28 && spectrum.sub > 40) {
    phoneNote = "vocal clarity may suffer on phone speakers — the mid presence is low relative to the bass";
    phoneIssue = true;
  } else if (spectrum.sub < 18 && spectrum.lowMid < 28) {
    phoneNote = "the mix is already light on low-end, so phone speakers won't lose much body";
  } else {
    phoneNote = "mid-range clarity should hold up reasonably well on phone speakers";
  }

  // --- Headphones (detailed, intimate, full stereo field) ---
  let headphoneNote: string;
  let headphoneIssue = false;
  if (stereo.widthScore > 72) {
    headphoneNote = "the wide stereo field may feel exaggerated or disorienting on headphones";
    headphoneIssue = true;
  } else if (stereo.widthScore < 12) {
    headphoneNote = "the narrow stereo field may feel flat and unengaging on headphones";
    headphoneIssue = true;
  } else if (spectrum.high > 65) {
    headphoneNote = "high frequencies may feel sharper and more exposed on headphones";
    headphoneIssue = true;
  } else if (dynamics.crestFactor > 18) {
    headphoneNote = "dynamic swings may feel dramatic in quiet listening on headphones";
    headphoneIssue = true;
  } else {
    headphoneNote = "stereo balance and dynamics should translate comfortably on headphones";
  }

  // --- Car speakers (bass resonance, road noise, extended listening) ---
  let carNote: string;
  let carIssue = false;
  if (spectrum.sub > 65) {
    carNote = "bass may build up and sound boomy through car speakers — the sub is already heavy";
    carIssue = true;
  } else if (dynamics.crestFactor > 16) {
    carNote = "vocals may sit behind road noise — the dynamic range is wide enough to get lost in a car";
    carIssue = true;
  } else if (spectrum.sub < 18 && spectrum.lowMid < 28) {
    carNote = "the mix may feel very thin in a car — car resonance may overemphasize what little low-end there is";
    carIssue = true;
  } else if (dynamics.crestFactor < 7) {
    carNote = "the compressed dynamics should cut through road noise without getting lost";
  } else if (spectrum.mid > 55) {
    carNote = "strong midrange presence should help the mix cut through road noise";
  } else {
    carNote = "should translate reasonably on a standard car system";
  }

  const details = [phoneNote, headphoneNote, carNote];
  const issueCount = [phoneIssue, headphoneIssue, carIssue].filter(Boolean).length;

  const risk: TranslationRiskData["risk"] =
    issueCount === 0 ? "low" : issueCount === 1 ? "medium" : "high";

  let label: TranslationRiskData["label"];
  if (issueCount === 0) {
    label = "translates well";
  } else if (phoneIssue && (spectrum.sub > 58 || (spectrum.sub < 18 && spectrum.lowMid < 28))) {
    label = carIssue || headphoneIssue ? "multiple risks" : "low-end risk";
  } else if (headphoneIssue && (stereo.widthScore > 72 || stereo.widthScore < 12)) {
    label = carIssue || phoneIssue ? "multiple risks" : "stereo risk";
  } else if (headphoneIssue && spectrum.high > 65) {
    label = carIssue || phoneIssue ? "multiple risks" : "harshness risk";
  } else {
    label = issueCount > 1 ? "multiple risks" : "translates well";
  }

  return { label, risk, details };
}
