import type { MeasurementLedger } from "@/grounded/types";

export interface WaveformData {
  peaks: Float32Array;
  duration: number;
  sampleRate: number;
}

export interface SpectrumData {
  sub: number;
  lowMid: number;
  mid: number;
  high: number;
  label: "bass-heavy" | "balanced" | "bright" | "thin" | "mid-forward";
  score: number;
}

export interface StereoWidthData {
  widthScore: number;
  label: "narrow" | "moderate" | "wide" | "very-wide";
  midEnergy: number;
  sideEnergy: number;
}

export interface DynamicsData {
  crestFactor: number;
  rmsDb: number;
  peakDb: number;
  approxLufs: number;
  label: "compressed" | "punchy" | "dynamic" | "very-dynamic";
  score: number;
}

export interface AudioFeatureData {
  measured: {
    bandAmplitudeSharePct: {
      sub: number;
      bass: number;
      lowMid: number;
      mid: number;
      upperMid: number;
      brilliance: number;
      air: number;
    };
  };
  loudness: {
    rmsDb: number;
    peakDb: number;
    crestDb: number;
    approxLufs: number;
  };
  dynamics: {
    macroRange: number;
    microDynamics: number;
    compressionDensity: number;
    sectionContrast: number;
  };
  transients: {
    sharpness: number;
    softness: number;
  };
  tonal: {
    spectralCentroidHz: number;
    subPresence: number;
    bassDominance: number;
    lowMidDensity: number;
    midPresence: number;
    upperMidPresence: number;
    harshness2k5k: number;
    harshness6k10k: number;
    airBandEnergy: number;
    warmth: number;
    harmonicDensity: number;
  };
  stereo: {
    totalWidth: number;
    lowBandWidth: number;
    midBandWidth: number;
    highBandWidth: number;
    centerDominance: number;
    sideDominance: number;
    monoCompatibility: number;
  };
  space: {
    dryWet: number;
    reverbImpression: number;
    decayImpression: number;
    spatialDepth: number;
  };
  density: {
    maskingRisk: number;
    clutter: number;
    overallDensity: number;
  };
  focal: {
    vocalForwardness: number;
    vocalForwardnessConfidence: "low" | "medium" | "high";
    intimacyProxy: number;
  };
  uncertaintyNotes: string[];
}

export type EmotionalDimensionKey =
  | "heaviness"
  | "intimacy"
  | "fragileVulnerability"
  | "intentionalVulnerability"
  | "warmth"
  | "tension"
  | "urgency"
  | "openness"
  | "isolation"
  | "aggression"
  | "stability"
  | "movement"
  | "melancholy"
  | "overwhelm"
  | "restraint";

export interface EmotionalEvidence {
  feature: string;
  observation: string;
  influence: string;
  strength: "supporting" | "strong";
}

export interface EmotionalRecommendation {
  direction: "increase" | "reduce";
  items: string[];
}

export interface EmotionalDimensionAnalysis {
  key: EmotionalDimensionKey;
  name: string;
  score: number;
  tendency: "low" | "moderate" | "high";
  confidence: "low" | "medium" | "high";
  summary: string;
  interpretation: string;
  mixCause: string;
  evidence: EmotionalEvidence[];
  recommendations: EmotionalRecommendation[];
  tradeoffs: string[];
}

export interface EmotionalProfileData {
  overview: string;
  disclaimer: string;
  standoutDimensions: EmotionalDimensionKey[];
  dimensions: EmotionalDimensionAnalysis[];
  tradeoffHighlights: string[];
  uncertainty: string[];
}

export interface TranslationRiskData {
  label: "translates well" | "low-end risk" | "stereo risk" | "harshness risk" | "multiple risks";
  risk: "low" | "medium" | "high";
  details: string[];
}

export interface MixAnalysis {
  waveform: WaveformData;
  spectrum: SpectrumData;
  stereo: StereoWidthData;
  dynamics: DynamicsData;
  features: AudioFeatureData;
  emotionalProfile: EmotionalProfileData;
  translation: TranslationRiskData;
  measurementLedger: MeasurementLedger;
}
