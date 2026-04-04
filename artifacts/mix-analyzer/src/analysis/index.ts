import { analyzeWaveform } from "./waveform";
import { analyzeSpectrum } from "./spectrum";
import { analyzeStereoWidth } from "./stereoWidth";
import { analyzeDynamics } from "./dynamics";
import { analyzeEmotionalRead, analyzeTranslationRisk } from "./emotionalRead";
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
  const emotional = analyzeEmotionalRead(spectrum, stereo, dynamics);
  const translation = analyzeTranslationRisk(spectrum, stereo, dynamics);

  return {
    audioBuffer,
    analysis: { waveform, spectrum, stereo, dynamics, emotional, translation },
  };
}

export type { MixAnalysis, WaveformData, SpectrumData, StereoWidthData, DynamicsData, EmotionalReadData, TranslationRiskData } from "./types";
