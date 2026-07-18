import { analyzeWaveform } from "./waveform";
import { analyzeSpectrum } from "./spectrum";
import { analyzeStereoWidth } from "./stereoWidth";
import { analyzeDynamics } from "./dynamics";
import { analyzeAudioFeatures } from "./audioFeatures";
import { analyzeEmotionalProfile } from "./emotionalProfile";
import { analyzeTranslationRisk } from "./translation";
import { createMeasurementLedger } from "@/grounded/measurementLedger";
import type { MixAnalysis } from "./types";

export async function analyzeMix(file: File): Promise<{ audioBuffer: AudioBuffer; analysis: MixAnalysis }> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  const waveform = analyzeWaveform(audioBuffer);
  const spectrum = analyzeSpectrum(audioBuffer);
  const stereo = analyzeStereoWidth(audioBuffer);
  const dynamics = analyzeDynamics(audioBuffer);
  const features = analyzeAudioFeatures(audioBuffer);
  const emotionalProfile = analyzeEmotionalProfile(features);
  const translation = analyzeTranslationRisk(spectrum, stereo, dynamics);
  const measurementLedger = createMeasurementLedger(audioBuffer, features);

  return {
    audioBuffer,
    analysis: { waveform, spectrum, stereo, dynamics, features, emotionalProfile, translation, measurementLedger },
  };
}

export type {
  MixAnalysis,
  WaveformData,
  SpectrumData,
  StereoWidthData,
  DynamicsData,
  AudioFeatureData,
  EmotionalProfileData,
  EmotionalDimensionAnalysis,
  EmotionalEvidence,
  EmotionalRecommendation,
  EmotionalDimensionKey,
  TranslationRiskData,
} from "./types";
