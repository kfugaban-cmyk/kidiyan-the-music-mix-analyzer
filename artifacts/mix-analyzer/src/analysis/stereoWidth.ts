import type { StereoWidthData } from "./types";

export function analyzeStereoWidth(audioBuffer: AudioBuffer): StereoWidthData {
  const isMono = audioBuffer.numberOfChannels < 2;

  if (isMono) {
    return {
      widthScore: 0,
      label: "narrow",
      midEnergy: 100,
      sideEnergy: 0,
    };
  }

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  const sampleCount = left.length;
  let midEnergySq = 0;
  let sideEnergySq = 0;

  for (let i = 0; i < sampleCount; i++) {
    const m = (left[i] + right[i]) * 0.5;
    const s = (left[i] - right[i]) * 0.5;
    midEnergySq += m * m;
    sideEnergySq += s * s;
  }

  const midRms = Math.sqrt(midEnergySq / sampleCount);
  const sideRms = Math.sqrt(sideEnergySq / sampleCount);

  const totalEnergy = midRms + sideRms;
  const sideRatio = totalEnergy > 0 ? sideRms / totalEnergy : 0;

  const widthScore = Math.round(sideRatio * 200);
  const clampedScore = Math.max(0, Math.min(100, widthScore));

  let label: StereoWidthData["label"];
  if (clampedScore < 15) label = "narrow";
  else if (clampedScore < 40) label = "moderate";
  else if (clampedScore < 70) label = "wide";
  else label = "very-wide";

  return {
    widthScore: clampedScore,
    label,
    midEnergy: Math.round((midRms / totalEnergy) * 100),
    sideEnergy: Math.round((sideRms / totalEnergy) * 100),
  };
}
