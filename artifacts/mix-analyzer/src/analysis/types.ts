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
  label: "compressed" | "punchy" | "dynamic" | "very-dynamic";
  score: number;
}

export interface EmotionalReadData {
  intimacy: { value: number; label: "intimate" | "distant" };
  texture: { value: number; label: "soft" | "sharp" };
  brightness: { value: number; label: "dark" | "bright" };
  width: { value: number; label: "narrow" | "wide" };
}

export interface TranslationRiskData {
  label: "mono-safe" | "low-end risk" | "stereo risk" | "harshness risk" | "multiple risks";
  risk: "low" | "medium" | "high";
  details: string[];
}

export interface MixAnalysis {
  waveform: WaveformData;
  spectrum: SpectrumData;
  stereo: StereoWidthData;
  dynamics: DynamicsData;
  emotional: EmotionalReadData;
  translation: TranslationRiskData;
}
