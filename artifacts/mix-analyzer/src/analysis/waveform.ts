import type { WaveformData } from "./types";

export function analyzeWaveform(audioBuffer: AudioBuffer, resolution = 2000): WaveformData {
  const channel = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channel.length / resolution);
  const peaks = new Float32Array(resolution);

  for (let i = 0; i < resolution; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channel.length);
    let max = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(channel[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }

  return {
    peaks,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
  };
}
