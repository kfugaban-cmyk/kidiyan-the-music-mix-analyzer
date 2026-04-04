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
  /** How forward the lead content sits — vocal presence vs. background */
  presence: { value: number; label: "recessed" | "upfront" };
  /** Transient character — soft/rounded attacks vs. sharp/cutting hits */
  attack: { value: number; label: "rounded" | "cutting" };
  /** Sense of room — tight and dry vs. open and reverberant */
  space: { value: number; label: "dry" | "open" };
  /** Spectral gravity — airy high-shelf feel vs. low-end weight */
  weight: { value: number; label: "airy" | "heavy" };
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
