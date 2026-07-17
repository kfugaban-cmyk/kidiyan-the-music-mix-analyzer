import type { DynamicsData } from "./types";

export function analyzeDynamics(audioBuffer: AudioBuffer): DynamicsData {
  const channel = audioBuffer.getChannelData(0);
  const len = channel.length;

  let peakAbs = 0;
  let sumSq = 0;

  for (let i = 0; i < len; i++) {
    const abs = Math.abs(channel[i]);
    if (abs > peakAbs) peakAbs = abs;
    sumSq += abs * abs;
  }

  const rms = Math.sqrt(sumSq / len);

  const peakDb = peakAbs > 0 ? 20 * Math.log10(peakAbs) : -96;
  const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -96;
  const approxLufs = rmsDb - 0.7;

  const crestFactor = peakAbs > 0 && rms > 0 ? peakAbs / rms : 1;
  const crestDb = 20 * Math.log10(crestFactor);

  let label: DynamicsData["label"];
  let score: number;

  if (crestDb < 6) {
    label = "compressed";
    score = 10;
  } else if (crestDb < 12) {
    label = "punchy";
    score = 40;
  } else if (crestDb < 20) {
    label = "dynamic";
    score = 75;
  } else {
    label = "very-dynamic";
    score = 100;
  }

  return {
    crestFactor: Math.round(crestDb * 10) / 10,
    rmsDb: Math.round(rmsDb * 10) / 10,
    peakDb: Math.round(peakDb * 10) / 10,
    approxLufs: Math.round(approxLufs * 10) / 10,
    label,
    score,
  };
}
