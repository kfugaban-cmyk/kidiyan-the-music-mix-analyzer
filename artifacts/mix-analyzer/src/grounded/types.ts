export type EvidenceCategory =
  | "measured_fact"
  | "limited_inference"
  | "creative_interpretation";

export type ConfidenceLabel = "low" | "medium" | "high";

export type ProductionIntentionKey =
  | "closer_exposure"
  | "weight_grounding"
  | "openness_lift"
  | "urgency_impact"
  | "contrast_drama";

export interface ProductionIntention {
  key: ProductionIntentionKey;
  name: string;
  shortLabel: string;
  description: string;
}

export interface MeasurementRecord {
  id: string;
  category: "measured_fact";
  label: string;
  value: number;
  unit: string;
  displayValue: string;
  scope: "whole_mix" | "time_region";
  method: string;
  limitation: string;
}

export interface TimeRegionMeasurement {
  id: "opening" | "middle" | "ending";
  label: string;
  startSeconds: number;
  endSeconds: number;
  rmsDbfs: number;
  crestDb: number;
}

export interface MeasurementLedger {
  version: 1;
  durationSeconds: number;
  sampleRateHz: number;
  channelCount: number;
  facts: MeasurementRecord[];
  timeRegions: TimeRegionMeasurement[];
  caveats: string[];
}

export interface ListeningExperiment {
  action: string;
  listenFor: string;
  tradeoff: string;
}

export interface GroundedClaim {
  category: "limited_inference" | "creative_interpretation";
  title: string;
  statement: string;
  confidence: ConfidenceLabel;
  evidenceIds: string[];
  experiment: ListeningExperiment;
}

export interface GroundedInterpretationContent {
  headline: string;
  relationshipToIntention: string;
  claims: GroundedClaim[];
}

export interface GroundedInterpretation extends GroundedInterpretationContent {
  intention: ProductionIntentionKey;
  mode: "gpt-5.6" | "deterministic";
  model: string;
  fallbackReason?: string;
}

export interface InterpretationRequest {
  intention: ProductionIntentionKey;
  ledger: MeasurementLedger;
}
