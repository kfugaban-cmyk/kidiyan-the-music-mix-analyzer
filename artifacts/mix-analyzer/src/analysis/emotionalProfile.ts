import type {
  AudioFeatureData,
  EmotionalDimensionAnalysis,
  EmotionalDimensionKey,
  EmotionalEvidence,
  EmotionalProfileData,
  EmotionalRecommendation,
} from "./types";

type Driver = {
  label: string;
  weight: number;
  polarity: "more" | "less";
  get: (features: AudioFeatureData) => number;
  observe: (features: AudioFeatureData) => string;
  influence: string;
};

type EmotionRule = {
  key: EmotionalDimensionKey;
  name: string;
  adjective: string;
  drivers: Driver[];
  summary: (features: AudioFeatureData, evidence: EmotionalEvidence[], score: number) => string;
  interpretation: (features: AudioFeatureData, evidence: EmotionalEvidence[], score: number) => string;
  mixCause: (features: AudioFeatureData, evidence: EmotionalEvidence[]) => string;
  recommendations: (features: AudioFeatureData) => EmotionalRecommendation[];
  tradeoffs: string[];
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tendency(score: number): "low" | "moderate" | "high" {
  if (score >= 67) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

function joinPhrases(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function driverContribution(driver: Driver, features: AudioFeatureData): number {
  const raw = driver.get(features);
  return driver.polarity === "more" ? raw : 100 - raw;
}

function confidenceForEmotion(
  key: EmotionalDimensionKey,
  features: AudioFeatureData,
  topContributions: number[]
): "low" | "medium" | "high" {
  const average = topContributions.length
    ? topContributions.reduce((sum, value) => sum + value, 0) / topContributions.length
    : 0;

  let penalty = 0;
  if ((key === "intimacy" || key === "fragileVulnerability" || key === "intentionalVulnerability") && features.focal.vocalForwardnessConfidence === "low") penalty += 18;
  if ((key === "openness" || key === "isolation") && features.stereo.monoCompatibility < 40) penalty += 8;
  if (features.uncertaintyNotes.length >= 3) penalty += 8;

  const adjusted = average - penalty;
  if (adjusted >= 70) return "high";
  if (adjusted >= 46) return "medium";
  return "low";
}

function buildEvidence(rule: EmotionRule, features: AudioFeatureData): { score: number; evidence: EmotionalEvidence[]; topContributions: number[] } {
  const weighted = rule.drivers.map((driver) => {
    const contribution = driverContribution(driver, features);
    return {
      driver,
      contribution,
      weightedContribution: contribution * driver.weight,
    };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.driver.weight, 0) || 1;
  const score = clamp(weighted.reduce((sum, item) => sum + item.weightedContribution, 0) / totalWeight);

  const evidence = [...weighted]
    .sort((a, b) => b.weightedContribution - a.weightedContribution)
    .slice(0, 3)
    .map(({ driver, contribution }): EmotionalEvidence => ({
      feature: driver.label,
      observation: driver.observe(features),
      influence: driver.influence,
      strength: contribution >= 72 ? "strong" : "supporting",
    }));

  return {
    score,
    evidence,
    topContributions: weighted
      .sort((a, b) => b.weightedContribution - a.weightedContribution)
      .slice(0, 3)
      .map((item) => item.contribution),
  };
}

// Each rule is a weighted combination of interpretable proxies.
// Tuning usually means adjusting driver weights or swapping a proxy, not rewriting UI text.
const rules: EmotionRule[] = [
  {
    key: "heaviness",
    name: "Emotional Heaviness / Weight",
    adjective: "emotionally heavy",
    drivers: [
      {
        label: "Low-mid density",
        weight: 1.35,
        polarity: "more",
        get: (f) => f.tonal.lowMidDensity,
        observe: (f) => `Low-mids read ${f.tonal.lowMidDensity}/100, so the body of the mix is dense rather than hollow.`,
        influence: "Dense lower mids make the mix feel burdened, embodied, and less weightless.",
      },
      {
        label: "Bass dominance",
        weight: 1.1,
        polarity: "more",
        get: (f) => f.tonal.bassDominance,
        observe: (f) => `Bass dominance sits at ${f.tonal.bassDominance}/100, which keeps the center of gravity low.`,
        influence: "A low spectral center of gravity supports groundedness and emotional mass.",
      },
      {
        label: "Compression density",
        weight: 0.9,
        polarity: "more",
        get: (f) => f.dynamics.compressionDensity,
        observe: (f) => `Compression density is ${f.dynamics.compressionDensity}/100, so the mix holds itself together instead of breathing freely.`,
        influence: "Controlled dynamics can make heaviness feel sustained instead of fleeting.",
      },
      {
        label: "Air band energy",
        weight: 0.7,
        polarity: "less",
        get: (f) => f.tonal.airBandEnergy,
        observe: (f) => `Air energy is ${f.tonal.airBandEnergy}/100, so the top end is not doing much to lift the frame.`,
        influence: "Less airy lift leaves more emotional mass in the body of the mix.",
      },
      {
        label: "Upper-field width",
        weight: 0.6,
        polarity: "less",
        get: (f) => f.stereo.highBandWidth,
        observe: (f) => `Upper-band width is ${f.stereo.highBandWidth}/100, which keeps the top image more centered than panoramic.`,
        influence: "A less expansive upper field tends to feel grounded rather than transcendently open.",
      },
    ],
    summary: (_f, evidence, score) =>
      `The mix shows a ${tendency(score)} tendency toward emotional weight because ${joinPhrases(
        evidence.map((item) => item.influence.toLowerCase())
      )}.`,
    interpretation: (_f, evidence, score) =>
      `It leans ${score >= 60 ? "burdened and grounded" : "only mildly weighted"} rather than airy because ${joinPhrases(
        evidence.map((item) => item.observation.toLowerCase())
      )}`,
    mixCause: (_f, evidence) =>
      `This usually comes from choices that let the center stay dense: ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Thicken the 150-400 Hz body carefully instead of adding only sub.",
          "Let the center image carry more of the emotional mass and avoid over-widening the top.",
          "Reduce excessive top-end polish if it is making the mix feel lighter than intended.",
          "Use slower, weightier ambience or softer attacks on focal elements where appropriate.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Open more air above 10 kHz if the mix feels too burdened.",
          "Clear some low-mid buildup so density becomes contour instead of fog.",
          "Allow more dynamic relief so the mix does not feel pinned down continuously.",
          "Spread selected upper elements wider to create lift above the center mass.",
        ],
      },
    ],
    tradeoffs: [
      "More weight can reduce openness and speed if low-mids and compression build up together.",
      "Reducing heaviness may improve lift but can also remove authority and groundedness.",
    ],
  },
  {
    key: "intimacy",
    name: "Intimacy / Closeness",
    adjective: "intimate",
    drivers: [
      {
        label: "Focal intimacy proxy",
        weight: 1.35,
        polarity: "more",
        get: (f) => f.focal.intimacyProxy,
        observe: (f) => `The closeness proxy sits at ${f.focal.intimacyProxy}/100, suggesting a short distance between the listener and the focal source.`,
        influence: "A close focal image makes the listener feel addressed rather than distant from the performance.",
      },
      {
        label: "Dry/wet balance",
        weight: 1.05,
        polarity: "less",
        get: (f) => f.space.dryWet,
        observe: (f) => `Dry/wet impression is ${f.space.dryWet}/100, so ambience is not fully swallowing the lead.`,
        influence: "Less perceived wetness preserves face-to-face immediacy.",
      },
      {
        label: "Center dominance",
        weight: 0.9,
        polarity: "more",
        get: (f) => f.stereo.centerDominance,
        observe: (f) => `Center dominance is ${f.stereo.centerDominance}/100, which keeps the emotional focus near the listener.`,
        influence: "A strong center image makes the mix feel conversational and embodied.",
      },
      {
        label: "Vocal forwardness",
        weight: 1,
        polarity: "more",
        get: (f) => f.focal.vocalForwardness,
        observe: (f) => `Lead forwardness is estimated at ${f.focal.vocalForwardness}/100 with ${f.focal.vocalForwardnessConfidence} confidence.`,
        influence: "When a focal source lives in the center-mid foreground, intimacy rises quickly.",
      },
      {
        label: "High-band width",
        weight: 0.55,
        polarity: "less",
        get: (f) => f.stereo.highBandWidth,
        observe: (f) => `High-band width is ${f.stereo.highBandWidth}/100, so the upper image is not pulling the listener away from the center.`,
        influence: "A contained upper image keeps the emotional conversation close.",
      },
    ],
    summary: (_f, evidence, score) =>
      `The mix shows a ${tendency(score)} intimacy tendency because ${joinPhrases(
        evidence.map((item) => item.influence.toLowerCase())
      )}.`,
    interpretation: (f, evidence, _score) =>
      `It may feel close rather than observational because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}. ${
        f.focal.vocalForwardnessConfidence === "low" ? "That read is cautious because the lead source is not clearly isolated from the mix." : ""
      }`,
    mixCause: (_f, evidence) =>
      `Likely causes include foreground placement, restrained ambience, and a center-led presentation shaped by ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Bring the emotional focal source slightly forward before adding more top-end gloss.",
          "Shorten reverb tails or reduce pre-delay on the lead so distance does not accumulate.",
          "Preserve breath, low-level detail, and center-mid articulation on the lead.",
          "Avoid widening the most personal element so far that it stops feeling face-to-face.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Create more listener distance with longer ambience or deeper front-to-back layering.",
          "Push the focal source slightly into the ensemble instead of keeping it fully exposed.",
          "Allow selective width around the lead so the mix feels less direct.",
          "Smooth hyper-detailed mouth-noise or transient detail if closeness feels intrusive.",
        ],
      },
    ],
    tradeoffs: [
      "More intimacy often reduces cinematic scale and openness.",
      "Pulling intimacy back can increase atmosphere, but it may also weaken emotional directness.",
    ],
  },
  {
    key: "fragileVulnerability",
    name: "Fragile Vulnerability",
    adjective: "fragile",
    drivers: [
      {
        label: "Microdynamics",
        weight: 1.2,
        polarity: "more",
        get: (f) => f.dynamics.microDynamics,
        observe: (f) => `Microdynamic variation is ${f.dynamics.microDynamics}/100, so small level fluctuations remain audible.`,
        influence: "Audible small-scale movement makes the mix feel less protected and less leveled.",
      },
      {
        label: "Compression density",
        weight: 1.15,
        polarity: "less",
        get: (f) => f.dynamics.compressionDensity,
        observe: (f) => `Compression density is ${f.dynamics.compressionDensity}/100, so the mix is not tightly armored by leveling.`,
        influence: "Less squeeze leaves inconsistencies and exposure more audible.",
      },
      {
        label: "Top-end polish",
        weight: 0.7,
        polarity: "less",
        get: (f) => f.tonal.airBandEnergy,
        observe: (f) => `Air-band sheen is ${f.tonal.airBandEnergy}/100, so the surface does not feel heavily polished.`,
        influence: "Less sheen can make the mix feel more exposed and less cosmetically protected.",
      },
      {
        label: "Section contrast",
        weight: 0.65,
        polarity: "more",
        get: (f) => f.dynamics.sectionContrast,
        observe: (f) => `Section contrast is ${f.dynamics.sectionContrast}/100, which exposes quieter, less defended moments.`,
        influence: "Exposed low-density moments can increase the sense of fragility.",
      },
      {
        label: "Transient smoothing",
        weight: 0.55,
        polarity: "less",
        get: (f) => f.transients.sharpness,
        observe: (f) => `Transient sharpness is ${f.transients.sharpness}/100, so front edges are not fully locked into a hard, controlled contour.`,
        influence: "Less rigid transient control helps fragile exposure remain audible.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Fragile vulnerability reads ${tendency(score)} because ${joinPhrases(
        evidence.map((item) => item.influence.toLowerCase())
      )}.`,
    interpretation: (f, evidence) =>
      `This is the "unprotected because control is loose" form of vulnerability: ${joinPhrases(
        evidence.map((item) => item.observation.toLowerCase())
      )}. ${f.focal.vocalForwardnessConfidence === "low" ? "Treat it as a mix-level instability read rather than a vocal-specific claim." : ""}`,
    mixCause: (_f, evidence) =>
      `This usually comes from leaving level contour, phrasing texture, or top-end polish less controlled, especially in ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Avoid over-leveling every phrase if small fluctuations help the mix feel exposed.",
          "Let breaths, low-level imperfections, or unstable details survive where they serve the song.",
          "Reduce cosmetic top-end gloss if the surface feels too protected.",
          "Leave some unevenness in dynamic contour instead of fully armoring the presentation.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Tighten dynamic variation if the mix feels too unstable to support the arrangement.",
          "Add a little protective sheen or saturation if the tone feels too exposed.",
          "Smooth the most inconsistent transient or phrasing edges.",
          "Use more controlled leveling so exposure feels intentional instead of accidental.",
        ],
      },
    ],
    tradeoffs: [
      "More fragile vulnerability can increase human exposure, but it also reduces perceived control.",
      "Reducing fragile vulnerability usually improves polish, though it can also make the performance feel armored.",
    ],
  },
  {
    key: "intentionalVulnerability",
    name: "Intentional Vulnerability",
    adjective: "emotionally exposed",
    drivers: [
      {
        label: "Focal closeness",
        weight: 1.2,
        polarity: "more",
        get: (f) => f.focal.vocalForwardness,
        observe: (f) => `Vocal or focal closeness is estimated at ${f.focal.vocalForwardness}/100, so the emotional center is clearly presented.`,
        influence: "A clear focal source makes emotional exposure readable even when the mix stays technically controlled.",
      },
      {
        label: "Intimacy proxy",
        weight: 1.15,
        polarity: "more",
        get: (f) => f.focal.intimacyProxy,
        observe: (f) => `Intimacy proxy sits at ${f.focal.intimacyProxy}/100, keeping the listener near the source.`,
        influence: "Closeness and emotional access are core signs of intentional vulnerability.",
      },
      {
        label: "Transparency vs density",
        weight: 0.95,
        polarity: "less",
        get: (f) => f.density.overallDensity,
        observe: (f) => `Overall density is ${f.density.overallDensity}/100, so the focal material is not being buried inside a thick wall.`,
        influence: "Lower density leaves less emotional information hidden behind the arrangement.",
      },
      {
        label: "Masking risk",
        weight: 0.85,
        polarity: "less",
        get: (f) => f.density.maskingRisk,
        observe: (f) => `Masking risk is ${f.density.maskingRisk}/100, which helps exposed emotional detail stay legible.`,
        influence: "Low masking supports transparency rather than concealment.",
      },
      {
        label: "Dynamic reveal under control",
        weight: 0.65,
        polarity: "more",
        get: (f) => clamp(f.dynamics.microDynamics * 0.45 + (100 - f.dynamics.compressionDensity) * 0.2 + f.focal.vocalForwardness * 0.35),
        observe: (f) => `Microdynamic reveal is supported by ${f.dynamics.microDynamics}/100 motion without losing access to the focal source.`,
        influence: "Emotion can feel intentionally exposed when detail survives without the mix falling apart.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Intentional vulnerability reads ${tendency(score)} because ${joinPhrases(
        evidence.map((item) => item.influence.toLowerCase())
      )}.`,
    interpretation: (f, evidence) =>
      `This is the "emotionally exposed despite control" form of vulnerability: ${joinPhrases(
        evidence.map((item) => item.observation.toLowerCase())
      )}. ${f.focal.vocalForwardnessConfidence === "low" ? "Because the focal element is less certain, treat this as a general exposure read rather than a lead-specific claim." : ""}`,
    mixCause: (_f, evidence) =>
      `This usually comes from making the focal material emotionally accessible through placement, transparency, and reduced masking, especially in ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Bring the emotional focal source forward without necessarily making the whole mix looser.",
          "Thin out masking layers so revealing details stay readable.",
          "Use depth and polish in ways that support access instead of hiding the center.",
          "Let the listener hear the performance clearly even if the mix remains controlled.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Push the focal source slightly back if the mix feels too exposed.",
          "Use density, width, or effects to veil emotional detail when more distance is desirable.",
          "Blend the lead more into the ensemble instead of spotlighting it.",
          "If polish is revealing too much, add tasteful concealment rather than only more compression.",
        ],
      },
    ],
    tradeoffs: [
      "More intentional vulnerability can increase intimacy without requiring technical looseness.",
      "Reducing intentional vulnerability often increases distance and polish, but it can also hide the song's emotional center.",
    ],
  },
  {
    key: "warmth",
    name: "Warmth / Tenderness",
    adjective: "warm",
    drivers: [
      {
        label: "Warmth balance",
        weight: 1.25,
        polarity: "more",
        get: (f) => f.tonal.warmth,
        observe: (f) => `Warmth is estimated at ${f.tonal.warmth}/100 from low-mid body versus upper-band bite.`,
        influence: "A warm tonal center supports tenderness more than hard-edged shine.",
      },
      {
        label: "Soft transient edge",
        weight: 0.95,
        polarity: "more",
        get: (f) => f.transients.softness,
        observe: (f) => `Transient softness sits at ${f.transients.softness}/100, so attacks lean rounded rather than clipped.`,
        influence: "Rounded attacks usually feel gentler and less confrontational.",
      },
      {
        label: "Harshness 2k-5k",
        weight: 0.95,
        polarity: "less",
        get: (f) => f.tonal.harshness2k5k,
        observe: (f) => `Upper-mid strain is ${f.tonal.harshness2k5k}/100, which keeps the core tone from hardening.`,
        influence: "Less 2k-5k pressure leaves more room for tenderness.",
      },
      {
        label: "Air band energy",
        weight: 0.55,
        polarity: "less",
        get: (f) => f.tonal.airBandEnergy,
        observe: (f) => `Air energy is ${f.tonal.airBandEnergy}/100, so sheen is not dominating the emotional read.`,
        influence: "Less top-end gloss often reads as warmth rather than polish.",
      },
      {
        label: "Low-mid density",
        weight: 0.6,
        polarity: "more",
        get: (f) => f.tonal.lowMidDensity,
        observe: (f) => `Low-mid density is ${f.tonal.lowMidDensity}/100, adding body around the emotional center.`,
        influence: "Body in the lower mids helps tenderness feel embodied instead of abstract.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Warmth reads ${tendency(score)} here because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel tender rather than hard-edged because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `That usually comes from choices that favor body, rounded attacks, and a less aggressive upper-mid posture in ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Build body in the low-mids before adding more brightness.",
          "Soften overly sharp attacks if the mix needs tenderness rather than edge.",
          "Use harmonic saturation or tape-like thickening to add warmth without mud.",
          "Tame brittle upper mids before boosting airy sheen.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Trim excess low-mid accumulation if warmth has turned into fog.",
          "Restore some attack or upper presence if the mix feels too padded.",
          "Open more air if the tone is too enclosed.",
          "Separate dense center elements so warmth does not become blanket-like blur.",
        ],
      },
    ],
    tradeoffs: [
      "More warmth can reduce urgency and apparent detail.",
      "Less warmth may improve clarity, but it can also harden the emotional surface.",
    ],
  },
  {
    key: "tension",
    name: "Tension / Suspense",
    adjective: "tense",
    drivers: [
      {
        label: "Upper-mid pressure",
        weight: 1.2,
        polarity: "more",
        get: (f) => f.tonal.harshness2k5k,
        observe: (f) => `2k-5k strain sits at ${f.tonal.harshness2k5k}/100, so the mix carries some upper-mid pressure.`,
        influence: "Upper-mid strain keeps the listener braced and unsettled.",
      },
      {
        label: "Compression density",
        weight: 0.9,
        polarity: "more",
        get: (f) => f.dynamics.compressionDensity,
        observe: (f) => `Compression density is ${f.dynamics.compressionDensity}/100, so release and relief are somewhat constrained.`,
        influence: "Constant density can make a mix feel held under pressure.",
      },
      {
        label: "Section contrast",
        weight: 0.85,
        polarity: "more",
        get: (f) => f.dynamics.sectionContrast,
        observe: (f) => `Section contrast is ${f.dynamics.sectionContrast}/100, which adds suspense between sparse and full passages.`,
        influence: "Contrast can turn density changes into emotional suspense.",
      },
      {
        label: "Upper-mid presence",
        weight: 0.8,
        polarity: "more",
        get: (f) => f.tonal.upperMidPresence,
        observe: (f) => `Upper-mid presence is ${f.tonal.upperMidPresence}/100, keeping articulation pointed and exposed.`,
        influence: "A pointed midrange makes anticipation feel more acute.",
      },
      {
        label: "Dryness",
        weight: 0.55,
        polarity: "less",
        get: (f) => f.space.dryWet,
        observe: (f) => `Dry/wet impression is ${f.space.dryWet}/100, so the mix is not fully cushioned by ambience.`,
        influence: "Less ambient cushioning often increases emotional nerve and suspense.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Tension is ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel emotionally braced because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `Likely causes include controlled relief, forward upper-mids, and contour changes shaped by ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Let upper-mid bite stay present if suspense matters more than comfort.",
          "Use automation and arrangement contrast to create withheld release before impacts.",
          "Keep some dynamic pressure in dense passages instead of fully relaxing them.",
          "Short, dry front edges often feel more tense than lush wide tails.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Relieve 2k-5k pressure if the mix feels anxious rather than compelling.",
          "Allow more breath between dense moments so the listener gets emotional release.",
          "Soften pointed midrange attacks on the most tense elements.",
          "Use space more generously if the mix needs calm instead of suspense.",
        ],
      },
    ],
    tradeoffs: [
      "More tension can help suspense, but it can also reduce warmth and ease.",
      "Reducing tension often makes the mix feel kinder, though sometimes less gripping.",
    ],
  },
  {
    key: "urgency",
    name: "Urgency / Pressure",
    adjective: "urgent",
    drivers: [
      {
        label: "Transient sharpness",
        weight: 1.15,
        polarity: "more",
        get: (f) => f.transients.sharpness,
        observe: (f) => `Transient sharpness is ${f.transients.sharpness}/100, so attacks arrive with speed.`,
        influence: "Fast front edges push the listener forward and increase pressure.",
      },
      {
        label: "Compression density",
        weight: 1,
        polarity: "more",
        get: (f) => f.dynamics.compressionDensity,
        observe: (f) => `Compression density reads ${f.dynamics.compressionDensity}/100, which keeps momentum from relaxing.`,
        influence: "When the mix stays packed and active, urgency rises.",
      },
      {
        label: "Section contrast",
        weight: 0.7,
        polarity: "more",
        get: (f) => f.dynamics.sectionContrast,
        observe: (f) => `Section contrast is ${f.dynamics.sectionContrast}/100, so pushes and drops are clearly felt.`,
        influence: "Contrast gives motion a target instead of a flat line.",
      },
      {
        label: "Lead forwardness",
        weight: 0.85,
        polarity: "more",
        get: (f) => f.focal.vocalForwardness,
        observe: (f) => `Lead forwardness is ${f.focal.vocalForwardness}/100, which keeps important information close to the listener.`,
        influence: "A forward focal element makes the mix feel immediate.",
      },
      {
        label: "Total width",
        weight: 0.45,
        polarity: "less",
        get: (f) => f.stereo.totalWidth,
        observe: (f) => `Overall width is ${f.stereo.totalWidth}/100, so the image is not overly diffuse.`,
        influence: "A tighter frame often feels more urgent than a very open one.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Urgency reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel pushed rather than patient because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `This often comes from preserving fast attacks while keeping the mix densely connected through ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Keep key transient edges defined so momentum feels immediate.",
          "Use compression to sustain pressure, but do it in a controlled way.",
          "Push the focal element forward if the song needs to feel more insistent.",
          "Trim diffuse ambience that slows the apparent front edge of the mix.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Soften transient bite if the mix feels rushed.",
          "Let the arrangement breathe with more dynamic relief between impacts.",
          "Add more depth or width if the frame feels claustrophically urgent.",
          "Pull back over-aggressive forwardness on the lead or snare if pressure becomes fatigue.",
        ],
      },
    ],
    tradeoffs: [
      "More urgency can boost propulsion, but it often increases fatigue.",
      "Less urgency may improve warmth and elegance, though it can also reduce drive.",
    ],
  },
  {
    key: "openness",
    name: "Openness / Air / Transcendence",
    adjective: "open",
    drivers: [
      {
        label: "High-band width",
        weight: 1.1,
        polarity: "more",
        get: (f) => f.stereo.highBandWidth,
        observe: (f) => `Upper-band width is ${f.stereo.highBandWidth}/100, so space lives above the center instead of only inside it.`,
        influence: "A wide upper field is one of the clearest stereo cues for openness.",
      },
      {
        label: "Air band energy",
        weight: 1.05,
        polarity: "more",
        get: (f) => f.tonal.airBandEnergy,
        observe: (f) => `Air energy is ${f.tonal.airBandEnergy}/100, which adds lift and sheen above the body.`,
        influence: "Airy extension makes the frame feel less earthbound.",
      },
      {
        label: "Spatial depth",
        weight: 1,
        polarity: "more",
        get: (f) => f.space.spatialDepth,
        observe: (f) => `Spatial depth is ${f.space.spatialDepth}/100, suggesting meaningful front-to-back layering.`,
        influence: "Depth keeps openness from being just width without dimension.",
      },
      {
        label: "Total width",
        weight: 0.8,
        polarity: "more",
        get: (f) => f.stereo.totalWidth,
        observe: (f) => `Overall width is ${f.stereo.totalWidth}/100, giving the mix a broader frame.`,
        influence: "A broad frame lets the mix feel expansive.",
      },
      {
        label: "Center dominance",
        weight: 0.45,
        polarity: "less",
        get: (f) => f.stereo.centerDominance,
        observe: (f) => `Center dominance is ${f.stereo.centerDominance}/100, so the mix is not completely tied to the center spine.`,
        influence: "Slightly less center lock makes the emotional field feel more open.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Openness reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel lifted or expansive because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `That impression usually comes from width, depth, and top-end lift working together through ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Open the upper field rather than widening the entire mix indiscriminately.",
          "Add air and tail extension carefully so lift feels intentional, not brittle.",
          "Use depth layers to create distance between foreground and halo elements.",
          "Keep the low end centered enough that openness feels elevated, not unstable.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Contain excessive top-end spread if the mix floats away from the song's body.",
          "Reduce ambient depth on key sources so the mix feels more embodied.",
          "Bring more emotional weight back into the center and low-mids.",
          "Watch for air boosting that adds polish but removes ache or intimacy.",
        ],
      },
    ],
    tradeoffs: [
      "More openness can reduce intimacy and heaviness.",
      "Less openness may improve focus, but it can also make the mix feel closed-in.",
    ],
  },
  {
    key: "isolation",
    name: "Isolation / Emptiness",
    adjective: "isolated",
    drivers: [
      {
        label: "Spatial depth",
        weight: 0.95,
        polarity: "more",
        get: (f) => f.space.spatialDepth,
        observe: (f) => `Spatial depth is ${f.space.spatialDepth}/100, which can place the listener outside the source rather than inside it.`,
        influence: "Distance can feel lonely when the focal source is not tightly embodied.",
      },
      {
        label: "Overall density",
        weight: 1,
        polarity: "less",
        get: (f) => f.density.overallDensity,
        observe: (f) => `Overall density is ${f.density.overallDensity}/100, so the frame leaves some empty room around what matters.`,
        influence: "Sparse space around the focal material often reads as emptiness.",
      },
      {
        label: "Center dominance",
        weight: 0.9,
        polarity: "less",
        get: (f) => f.stereo.centerDominance,
        observe: (f) => `Center dominance is ${f.stereo.centerDominance}/100, so the mix does not feel fully held by a central body.`,
        influence: "A weaker center can make the source feel detached from the listener.",
      },
      {
        label: "Section contrast",
        weight: 0.55,
        polarity: "more",
        get: (f) => f.dynamics.sectionContrast,
        observe: (f) => `Section contrast is ${f.dynamics.sectionContrast}/100, which can magnify the feeling of exposed space when sections thin out.`,
        influence: "Contrast can make sparse moments feel emotionally solitary.",
      },
      {
        label: "Dry/wet balance",
        weight: 0.6,
        polarity: "more",
        get: (f) => f.space.dryWet,
        observe: (f) => `Dry/wet impression is ${f.space.dryWet}/100, which can suggest distance rather than touch.`,
        influence: "More ambience can feel lonely if it increases distance without warmth.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Isolation reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel solitary or empty where ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `This usually comes from leaving more open space around the focal material and reducing central containment through ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Let sparse passages stay sparse instead of filling every gap.",
          "Use distance and depth deliberately if the song benefits from emotional separation.",
          "Keep some negative space around the focal source instead of surrounding it with constant support.",
          "Avoid overly warm glue if you want the mix to feel exposed or alone.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Strengthen the center body so the listener feels more connected to the source.",
          "Add supporting low-mid or harmonic content if emptiness feels accidental.",
          "Reduce excessive distance cues that make the lead feel detached.",
          "Use width and ambience in ways that feel immersive rather than lonely.",
        ],
      },
    ],
    tradeoffs: [
      "More isolation can increase drama and ache, but it may weaken immediacy.",
      "Reducing emptiness often helps connection, though sometimes at the cost of atmosphere.",
    ],
  },
  {
    key: "aggression",
    name: "Aggression / Grit / Threat",
    adjective: "aggressive",
    drivers: [
      {
        label: "Transient sharpness",
        weight: 1.1,
        polarity: "more",
        get: (f) => f.transients.sharpness,
        observe: (f) => `Transient sharpness is ${f.transients.sharpness}/100, so hits land with bite.`,
        influence: "Sharp front edges make the mix feel confrontational rather than yielding.",
      },
      {
        label: "Upper-mid pressure",
        weight: 1.1,
        polarity: "more",
        get: (f) => f.tonal.harshness2k5k,
        observe: (f) => `2k-5k pressure is ${f.tonal.harshness2k5k}/100, keeping the emotional edge exposed.`,
        influence: "Upper-mid pressure contributes threat, grit, and abrasion.",
      },
      {
        label: "Bass dominance",
        weight: 0.85,
        polarity: "more",
        get: (f) => f.tonal.bassDominance,
        observe: (f) => `Bass dominance sits at ${f.tonal.bassDominance}/100, which adds physical force underneath the edge.`,
        influence: "Low-end force turns edge into physical threat.",
      },
      {
        label: "Compression density",
        weight: 0.8,
        polarity: "more",
        get: (f) => f.dynamics.compressionDensity,
        observe: (f) => `Compression density is ${f.dynamics.compressionDensity}/100, so the mix stays assertive between impacts.`,
        influence: "Sustained pressure makes aggression feel relentless instead of momentary.",
      },
      {
        label: "Harmonic density",
        weight: 0.55,
        polarity: "more",
        get: (f) => f.tonal.harmonicDensity,
        observe: (f) => `Harmonic density is ${f.tonal.harmonicDensity}/100, implying some saturation or overtone thickness.`,
        influence: "Harmonic grit can make aggression feel textured rather than sterile.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Aggression reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel threatening or gritty where ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `That impression usually comes from bite, force, and sustained pressure combining through ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Preserve attack and upper-mid bite if the mix needs threat or snarl.",
          "Use harmonic saturation to add grit without relying only on harsh EQ.",
          "Let the low end hit with authority so aggression feels physical, not just bright.",
          "Keep dense passages assertive enough that the energy does not relax too much.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Relieve the most abrasive 2k-5k pressure before it turns into fatigue.",
          "Soften the sharpest attacks if the mix is more hostile than powerful.",
          "Reduce relentless density so the song gets moments of ease.",
          "Watch low-end force if it makes the mix feel more threatening than intended.",
        ],
      },
    ],
    tradeoffs: [
      "More aggression can add impact, but it often reduces tenderness and long-listen comfort.",
      "Less aggression may improve elegance while also softening the mix's sense of threat.",
    ],
  },
  {
    key: "stability",
    name: "Stability / Groundedness",
    adjective: "stable",
    drivers: [
      {
        label: "Bass dominance",
        weight: 1.05,
        polarity: "more",
        get: (f) => f.tonal.bassDominance,
        observe: (f) => `Bass dominance is ${f.tonal.bassDominance}/100, so the mix has a clear physical base.`,
        influence: "A reliable low anchor supports groundedness.",
      },
      {
        label: "Center dominance",
        weight: 1.05,
        polarity: "more",
        get: (f) => f.stereo.centerDominance,
        observe: (f) => `Center dominance sits at ${f.stereo.centerDominance}/100, which gives the mix a solid spine.`,
        influence: "A firm center makes the emotional read feel anchored.",
      },
      {
        label: "Mono compatibility",
        weight: 0.8,
        polarity: "more",
        get: (f) => f.stereo.monoCompatibility,
        observe: (f) => `Mono compatibility is ${f.stereo.monoCompatibility}/100, so the image should stay coherent when collapsed.`,
        influence: "Coherence across playback states reinforces stability.",
      },
      {
        label: "Low-band width",
        weight: 0.55,
        polarity: "less",
        get: (f) => f.stereo.lowBandWidth,
        observe: (f) => `Low-band width is ${f.stereo.lowBandWidth}/100, so the low end is not drifting too far out of the center.`,
        influence: "Keeping the lows centered supports groundedness.",
      },
      {
        label: "Section contrast",
        weight: 0.55,
        polarity: "less",
        get: (f) => f.dynamics.sectionContrast,
        observe: (f) => `Section contrast is ${f.dynamics.sectionContrast}/100, which keeps the mix from feeling emotionally volatile.`,
        influence: "Lower contrast can make the mix feel more settled and controlled.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Stability reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel grounded rather than drifting because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `That tends to come from a centered low end, coherent width choices, and measured contrast in ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Keep the low end centered and coherent before chasing extra width.",
          "Strengthen the mid spine if the mix feels emotionally untethered.",
          "Reduce dramatic volatility if the song needs steadiness more than swings.",
          "Check mono and low-frequency image control so the foundation stays trustworthy.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Add more contrast or spatial drift if the mix feels too settled.",
          "Loosen some center lock if the frame feels overly rigid.",
          "Allow more movement in dynamics if groundedness has become static.",
          "Introduce selective width above the lows to add freedom without losing translation.",
        ],
      },
    ],
    tradeoffs: [
      "More stability often reduces volatility and danger.",
      "Less stability can increase openness or movement, but it may also weaken trust and impact.",
    ],
  },
  {
    key: "movement",
    name: "Movement / Lift / Propulsion",
    adjective: "propulsive",
    drivers: [
      {
        label: "Section contrast",
        weight: 1.1,
        polarity: "more",
        get: (f) => f.dynamics.sectionContrast,
        observe: (f) => `Section contrast is ${f.dynamics.sectionContrast}/100, so the arrangement breathes between less and more.`,
        influence: "Contrast creates directional motion instead of one static emotional state.",
      },
      {
        label: "Microdynamics",
        weight: 0.9,
        polarity: "more",
        get: (f) => f.dynamics.microDynamics,
        observe: (f) => `Microdynamic motion is ${f.dynamics.microDynamics}/100, which keeps details alive inside the groove.`,
        influence: "Small internal changes help propulsion feel alive rather than mechanical.",
      },
      {
        label: "Transient sharpness",
        weight: 0.85,
        polarity: "more",
        get: (f) => f.transients.sharpness,
        observe: (f) => `Transient sharpness is ${f.transients.sharpness}/100, giving motion a clear front edge.`,
        influence: "Defined attacks help forward motion register clearly.",
      },
      {
        label: "Total width",
        weight: 0.55,
        polarity: "more",
        get: (f) => f.stereo.totalWidth,
        observe: (f) => `Overall width is ${f.stereo.totalWidth}/100, which can increase lift when it expands around the center.`,
        influence: "Width can add lift if it supports movement instead of haze.",
      },
      {
        label: "Compression density",
        weight: 0.45,
        polarity: "less",
        get: (f) => f.dynamics.compressionDensity,
        observe: (f) => `Compression density is ${f.dynamics.compressionDensity}/100, so the mix still leaves some contour to move through.`,
        influence: "Too much squeeze can flatten propulsion into mere loudness.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Movement reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel like it is lifting or pushing forward because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `This usually comes from contrast, attack, and internal motion combining through ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Create clearer contrast between sparse and full sections.",
          "Preserve enough transient definition that the groove has a front edge.",
          "Let width expand in ways that enhance lift rather than blur rhythm.",
          "Avoid flattening every section to the same density if propulsion matters.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Ease back dramatic density swings if the mix feels restless.",
          "Round the sharpest attacks if motion feels jittery instead of flowing.",
          "Use more consistent ambience and level contour if you want steadier pacing.",
          "Reduce width theatrics that exaggerate movement beyond the song's intent.",
        ],
      },
    ],
    tradeoffs: [
      "More movement can increase excitement, but it may reduce stability.",
      "Reducing movement can help control, though sometimes at the cost of lift and drama.",
    ],
  },
  {
    key: "melancholy",
    name: "Melancholy / Ache / Yearning",
    adjective: "aching",
    drivers: [
      {
        label: "Low-mid density",
        weight: 0.95,
        polarity: "more",
        get: (f) => f.tonal.lowMidDensity,
        observe: (f) => `Low-mid density is ${f.tonal.lowMidDensity}/100, which adds body and ache rather than only shine.`,
        influence: "A weighted lower body often supports ache more than brightness does.",
      },
      {
        label: "Transient softness",
        weight: 0.85,
        polarity: "more",
        get: (f) => f.transients.softness,
        observe: (f) => `Softness is ${f.transients.softness}/100, so the emotional surface feels more yielding than forceful.`,
        influence: "Gentler attacks can make a mix feel aching rather than combative.",
      },
      {
        label: "Spatial depth",
        weight: 0.8,
        polarity: "more",
        get: (f) => f.space.spatialDepth,
        observe: (f) => `Spatial depth is ${f.space.spatialDepth}/100, which can add distance or longing around the focal source.`,
        influence: "Depth often contributes yearning by placing the sound in reachable but not fully held space.",
      },
      {
        label: "Air band energy",
        weight: 0.55,
        polarity: "less",
        get: (f) => f.tonal.airBandEnergy,
        observe: (f) => `Air energy is ${f.tonal.airBandEnergy}/100, so sheen is not dominating the emotional picture.`,
        influence: "Less polish leaves more room for ache than for gloss.",
      },
      {
        label: "Intimacy proxy",
        weight: 0.65,
        polarity: "more",
        get: (f) => f.focal.intimacyProxy,
        observe: (f) => `Intimacy proxy is ${f.focal.intimacyProxy}/100, keeping the emotional center readable even if depth adds distance around it.`,
        influence: "Yearning often lands hardest when closeness and distance coexist.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Melancholy reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel more aching than triumphant because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `That usually comes from lower-body weight, softer attacks, and some depth working together through ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Favor body and ache over top-end polish if yearning is the target.",
          "Let softness and depth coexist so the mix can feel close yet not fully resolved.",
          "Avoid making every transient too clean if you want more emotional bruise.",
          "Keep the focal source readable even when space around it expands.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Open more top-end lift if the mix feels weighed down by ache.",
          "Tighten depth and low-mid density if melancholy is overwhelming the song.",
          "Restore a little edge or attack so the mix feels less mournful.",
          "Move the emotional center from ache toward clarity or confidence with cleaner contour.",
        ],
      },
    ],
    tradeoffs: [
      "More melancholy can deepen emotional nuance, but it may reduce lift and confidence.",
      "Reducing ache often improves polish, though sometimes at the cost of poignancy.",
    ],
  },
  {
    key: "overwhelm",
    name: "Overwhelm / Density",
    adjective: "overwhelming",
    drivers: [
      {
        label: "Overall density",
        weight: 1.2,
        polarity: "more",
        get: (f) => f.density.overallDensity,
        observe: (f) => `Overall density is ${f.density.overallDensity}/100, so much of the spectrum is active at once.`,
        influence: "High simultaneous activity makes the listener process more at once.",
      },
      {
        label: "Masking risk",
        weight: 1,
        polarity: "more",
        get: (f) => f.density.maskingRisk,
        observe: (f) => `Masking risk is ${f.density.maskingRisk}/100, so layers are competing for the same space.`,
        influence: "When layers fight, density feels overwhelming faster than when they interlock cleanly.",
      },
      {
        label: "Compression density",
        weight: 0.9,
        polarity: "more",
        get: (f) => f.dynamics.compressionDensity,
        observe: (f) => `Compression density is ${f.dynamics.compressionDensity}/100, reducing relief between events.`,
        influence: "Constant loudness removes the breathing room that keeps density manageable.",
      },
      {
        label: "Upper-mid pressure",
        weight: 0.65,
        polarity: "more",
        get: (f) => f.tonal.harshness2k5k,
        observe: (f) => `Upper-mid strain is ${f.tonal.harshness2k5k}/100, so the dense material also asks for attention.`,
        influence: "Dense plus strained is far more overwhelming than dense plus warm.",
      },
      {
        label: "Total width",
        weight: 0.45,
        polarity: "more",
        get: (f) => f.stereo.totalWidth,
        observe: (f) => `Overall width is ${f.stereo.totalWidth}/100, spreading the density across a larger frame.`,
        influence: "Wide density can feel immersive or engulfing depending on context.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Overwhelm reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel engulfing because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `This usually comes from many layers staying active at once with limited relief, especially in ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Keep multiple layers active if engulfing density is intentional.",
          "Use compression carefully to hold the wall together without turning it brittle.",
          "Let width support scale if you want the density to feel surrounding.",
          "If overwhelm is the goal, make sure the focal element still survives the mass.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Carve clearer roles between low-mids, mids, and upper-mids so layers stop masking each other.",
          "Create relief through automation, arrangement subtraction, or more dynamic breathing room.",
          "Tame upper-mid stress before reducing only volume, since harsh density overwhelms quickly.",
          "Narrow or simplify selected layers if the image feels crowded everywhere at once.",
        ],
      },
    ],
    tradeoffs: [
      "More overwhelm can create scale, but it often reduces both fragile exposure and intentional emotional access.",
      "Reducing density usually improves intelligibility, though it may also reduce impact and immersion.",
    ],
  },
  {
    key: "restraint",
    name: "Restraint / Control",
    adjective: "restrained",
    drivers: [
      {
        label: "Clutter",
        weight: 1.1,
        polarity: "less",
        get: (f) => f.density.clutter,
        observe: (f) => `Clutter is ${f.density.clutter}/100, so the mix leaves room instead of pushing everything at once.`,
        influence: "Low clutter is one of the clearest signs of intentional restraint.",
      },
      {
        label: "Upper-mid strain",
        weight: 0.85,
        polarity: "less",
        get: (f) => f.tonal.harshness2k5k,
        observe: (f) => `Upper-mid strain is ${f.tonal.harshness2k5k}/100, which keeps the mix from shouting emotionally.`,
        influence: "Controlled upper-mids keep the mix measured rather than excitable.",
      },
      {
        label: "Transient sharpness",
        weight: 0.75,
        polarity: "less",
        get: (f) => f.transients.sharpness,
        observe: (f) => `Transient sharpness is ${f.transients.sharpness}/100, so attacks are not constantly demanding attention.`,
        influence: "Less attack aggression supports composure.",
      },
      {
        label: "Mono compatibility",
        weight: 0.55,
        polarity: "more",
        get: (f) => f.stereo.monoCompatibility,
        observe: (f) => `Mono compatibility is ${f.stereo.monoCompatibility}/100, which suggests disciplined image choices.`,
        influence: "Coherent image decisions often correlate with emotional control.",
      },
      {
        label: "Section contrast",
        weight: 0.45,
        polarity: "less",
        get: (f) => f.dynamics.sectionContrast,
        observe: (f) => `Section contrast is ${f.dynamics.sectionContrast}/100, so the emotional arc stays measured rather than theatrical.`,
        influence: "Lower drama can read as restraint when the mix still feels intentional.",
      },
    ],
    summary: (_f, evidence, score) =>
      `Restraint reads ${tendency(score)} because ${joinPhrases(evidence.map((item) => item.influence.toLowerCase()))}.`,
    interpretation: (_f, evidence) =>
      `The mix may feel controlled and deliberate because ${joinPhrases(evidence.map((item) => item.observation.toLowerCase()))}.`,
    mixCause: (_f, evidence) =>
      `This usually comes from not overloading the frame with density, bite, or drama, especially in ${joinPhrases(
        evidence.map((item) => item.feature.toLowerCase())
      )}.`,
    recommendations: () => [
      {
        direction: "increase",
        items: [
          "Remove low-value layers before adding more polish or volume.",
          "Keep upper-mids disciplined so detail does not become insistence.",
          "Use measured automation rather than dramatic all-or-nothing swings.",
          "Preserve coherence in the stereo image so control feels intentional, not merely quiet.",
        ],
      },
      {
        direction: "reduce",
        items: [
          "Add more contrast or edge if the mix feels too emotionally withheld.",
          "Let a focal element step out more boldly if the presentation feels overly polite.",
          "Introduce controlled bite, width, or motion where the arrangement needs release.",
          "Watch that restraint does not become emotional flatness through over-caution.",
        ],
      },
    ],
    tradeoffs: [
      "More restraint can improve elegance and translation, but it may suppress risk and drama.",
      "Reducing restraint can increase excitement, though it also raises the chance of clutter or fatigue.",
    ],
  },
];

function createDimension(rule: EmotionRule, features: AudioFeatureData): EmotionalDimensionAnalysis {
  const { score, evidence, topContributions } = buildEvidence(rule, features);

  return {
    key: rule.key,
    name: rule.name,
    score,
    tendency: tendency(score),
    confidence: confidenceForEmotion(rule.key, features, topContributions),
    summary: rule.summary(features, evidence, score),
    interpretation: rule.interpretation(features, evidence, score),
    mixCause: rule.mixCause(features, evidence),
    evidence,
    recommendations: rule.recommendations(features),
    tradeoffs: rule.tradeoffs,
  };
}

function buildOverview(dimensions: EmotionalDimensionAnalysis[]): string {
  const standout = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 3);
  const counterweight = [...dimensions].sort((a, b) => a.score - b.score)[0];
  return `Perceived emotional tendencies lean most strongly toward ${joinPhrases(
    standout.map((item) => item.name.toLowerCase())
  )}. The main counterweight is ${counterweight.name.toLowerCase()}, which is comparatively less pronounced.`;
}

function addVulnerabilityRelationshipNotes(dimensions: EmotionalDimensionAnalysis[]): void {
  const fragile = dimensions.find((item) => item.key === "fragileVulnerability");
  const intentional = dimensions.find((item) => item.key === "intentionalVulnerability");
  if (!fragile || !intentional) return;

  let relationshipNote: string;
  if (fragile.score >= 60 && intentional.score >= 60) {
    relationshipNote =
      "Both forms are elevated, so the mix feels exposed both because some control is left open and because the focal emotion is deliberately accessible.";
  } else if (fragile.score >= 60 && intentional.score < 40) {
    relationshipNote =
      "Exposure is leaning more fragile than intentional: the mix feels unprotected because control is loose, not because the focal emotion is being clearly presented.";
  } else if (intentional.score >= 60 && fragile.score < 40) {
    relationshipNote =
      "Exposure is leaning more intentional than fragile: the mix stays controlled, but the focal emotion is still easy to access.";
  } else {
    relationshipNote =
      "The mix shows some exposed qualities, but they are split between mild fragility and mild intentional reveal rather than strongly committing to either.";
  }

  fragile.interpretation = `${fragile.interpretation} ${relationshipNote}`;
  intentional.interpretation = `${intentional.interpretation} ${relationshipNote}`;
}

export function analyzeEmotionalProfile(features: AudioFeatureData): EmotionalProfileData {
  const dimensions = rules.map((rule) => createDimension(rule, features));
  addVulnerabilityRelationshipNotes(dimensions);
  const standoutDimensions = [...dimensions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.key);

  const tradeoffHighlights = Array.from(
    new Set(
      [...dimensions]
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .flatMap((item) => item.tradeoffs)
    )
  ).slice(0, 4);

  return {
    overview: buildOverview(dimensions),
    disclaimer:
      "These are perceived emotional tendencies inferred from stereo mix characteristics, not objective truths about the song or performance.",
    standoutDimensions,
    dimensions,
    tradeoffHighlights,
    uncertainty: features.uncertaintyNotes,
  };
}
