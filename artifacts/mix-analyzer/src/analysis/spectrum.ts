import type { SpectrumData } from "./types";

function computeBandEnergy(magnitudes: Float32Array, sampleRate: number, lowHz: number, highHz: number): number {
  const binCount = magnitudes.length;
  const hzPerBin = sampleRate / 2 / binCount;
  const lowBin = Math.floor(lowHz / hzPerBin);
  const highBin = Math.min(Math.ceil(highHz / hzPerBin), binCount - 1);

  let energy = 0;
  for (let i = lowBin; i <= highBin; i++) {
    const linear = Math.pow(10, magnitudes[i] / 20);
    energy += linear * linear;
  }
  return Math.sqrt(energy / Math.max(1, highBin - lowBin + 1));
}

export function analyzeSpectrum(audioBuffer: AudioBuffer): SpectrumData {
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const fftSize = 8192;
  const analyser = offlineCtx.createAnalyser();
  analyser.fftSize = fftSize;

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  analyser.connect(offlineCtx.destination);

  const binCount = analyser.frequencyBinCount;
  const sampleRate = audioBuffer.sampleRate;
  const hzPerBin = sampleRate / 2 / binCount;

  const channelData = audioBuffer.getChannelData(0);
  const stepSize = Math.floor(channelData.length / binCount);

  const magnitudes = new Float32Array(binCount);
  for (let i = 0; i < binCount; i++) {
    let power = 0;
    const start = i * stepSize;
    const end = Math.min(start + stepSize, channelData.length);
    for (let j = start; j < end; j++) {
      power += channelData[j] * channelData[j];
    }
    const rms = Math.sqrt(power / Math.max(1, end - start));
    magnitudes[i] = rms > 0 ? 20 * Math.log10(rms) : -96;
  }

  const sub = computeBandEnergy(magnitudes, sampleRate, 20, 80);
  const lowMid = computeBandEnergy(magnitudes, sampleRate, 80, 500);
  const mid = computeBandEnergy(magnitudes, sampleRate, 500, 4000);
  const high = computeBandEnergy(magnitudes, sampleRate, 4000, 20000);

  const total = sub + lowMid + mid + high;
  const subRatio = sub / total;
  const highRatio = high / total;
  const midRatio = mid / total;

  let label: SpectrumData["label"];
  let score: number;

  if (subRatio > 0.4) {
    label = "bass-heavy";
    score = Math.round(subRatio * 100);
  } else if (highRatio > 0.4) {
    label = "bright";
    score = Math.round(highRatio * 100);
  } else if (midRatio > 0.5) {
    label = "mid-forward";
    score = Math.round(midRatio * 100);
  } else if (sub < 0.001 && highRatio < 0.1) {
    label = "thin";
    score = 30;
  } else {
    label = "balanced";
    score = Math.round((1 - Math.abs(subRatio - 0.25) - Math.abs(highRatio - 0.25)) * 100);
  }

  return {
    sub: Math.min(100, Math.round((sub / total) * 100 * 2.5)),
    lowMid: Math.min(100, Math.round((lowMid / total) * 100 * 2)),
    mid: Math.min(100, Math.round((mid / total) * 100 * 2)),
    high: Math.min(100, Math.round((high / total) * 100 * 2.5)),
    label,
    score: Math.max(0, Math.min(100, score)),
  };
}
