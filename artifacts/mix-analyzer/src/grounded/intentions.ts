import type { ProductionIntention, ProductionIntentionKey } from "./types";

export const PRODUCTION_INTENTIONS: ProductionIntention[] = [
  {
    key: "closer_exposure",
    shortLabel: "Closer",
    name: "Closer and more exposed",
    description: "Keep the emotional focal point present, readable, and less protected by distance or density.",
  },
  {
    key: "weight_grounding",
    shortLabel: "Weightier",
    name: "Weightier and more grounded",
    description: "Favor embodied low-frequency mass and steadiness without automatically making the mix louder.",
  },
  {
    key: "openness_lift",
    shortLabel: "More open",
    name: "More open and lifting",
    description: "Look for spatial and spectral room while protecting the center and mono translation.",
  },
  {
    key: "urgency_impact",
    shortLabel: "More urgent",
    name: "More urgent and forceful",
    description: "Increase forward pressure and impact while watching fatigue and lost dynamic relief.",
  },
  {
    key: "contrast_drama",
    shortLabel: "More contrast",
    name: "More contrast and drama",
    description: "Strengthen the difference between restrained and dense moments instead of making everything bigger.",
  },
];

export function getProductionIntention(key: ProductionIntentionKey): ProductionIntention {
  return PRODUCTION_INTENTIONS.find((item) => item.key === key) ?? PRODUCTION_INTENTIONS[0];
}
