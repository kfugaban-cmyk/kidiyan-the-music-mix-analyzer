import type { AudioFeatureData } from "./types";
import { fft, hanning } from "./fft";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function scale(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp(((value - min) / (max - min)) * 100);
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], pct: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * pct;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function db(value: number): number {
  return value > 0 ? 20 * Math.log10(value) : -96;
}

export function analyzeAudioFeatures(audioBuffer: AudioBuffer): AudioFeatureData {
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const channelCount = audioBuffer.numberOfChannels;
  const left = audioBuffer.getChannelData(0);
  const right = channelCount > 1 ? audioBuffer.getChannelData(1) : left;

  const mono = new Float64Array(length);
  let peakAbs = 0;
  let sumSq = 0;

  for (let i = 0; i < length; i++) {
    const sample = channelCount > 1 ? (left[i] + right[i]) * 0.5 : left[i];
    mono[i] = sample;
    const abs = Math.abs(sample);
    if (abs > peakAbs) peakAbs = abs;
    sumSq += sample * sample;
  }

  const rms = Math.sqrt(sumSq / Math.max(1, length));
  const rmsDb = db(rms);
  const peakDb = db(peakAbs);
  const crestDb = peakAbs > 0 && rms > 0 ? 20 * Math.log10(peakAbs / rms) : 0;

  // This is intentionally labeled as approximate because we are not doing full K-weighting.
  const approxLufs = rmsDb - 0.7;

  const fftSize = 4096;
  const hop = 2048;
  const window = hanning(fftSize);
  const bins = fftSize >> 1;
  const possibleWindows = Math.max(0, Math.floor((length - fftSize) / hop) + 1);
  const maxWindows = 96;
  const step = Math.max(1, Math.floor(possibleWindows / maxWindows));
  const hzPerBin = sampleRate / fftSize;

  const bandMap = {
    sub: [20, 80],
    bass: [80, 160],
    lowMid: [160, 500],
    mid: [500, 2000],
    upperMid: [2000, 5000],
    brilliance: [5000, 10000],
    air: [10000, 18000],
    lowWidth: [20, 180],
    midWidth: [180, 2500],
    highWidth: [2500, 18000],
  } as const;

  function bandEnergy(power: Float64Array, lowHz: number, highHz: number): number {
    const lo = Math.max(0, Math.floor(lowHz / hzPerBin));
    const hi = Math.min(bins - 1, Math.ceil(highHz / hzPerBin));
    let energy = 0;
    for (let i = lo; i <= hi; i++) energy += power[i];
    return Math.sqrt(energy / Math.max(1, hi - lo + 1));
  }

  const rmsFrames: number[] = [];
  const crestFrames: number[] = [];
  const frameSharpness: number[] = [];
  const frameContinuity: number[] = [];
  const tonalFrames: Array<Record<string, number>> = [];
  const widthFrames: Array<Record<string, number>> = [];
  const centroidFrames: number[] = [];

  for (let frameIndex = 0; frameIndex < possibleWindows; frameIndex += step) {
    const start = frameIndex * hop;
    const reMono = new Float64Array(fftSize);
    const imMono = new Float64Array(fftSize);
    const reMid = new Float64Array(fftSize);
    const imMid = new Float64Array(fftSize);
    const reSide = new Float64Array(fftSize);
    const imSide = new Float64Array(fftSize);

    let frameSumSq = 0;
    let framePeak = 0;

    for (let i = 0; i < fftSize; i++) {
      const l = left[start + i] ?? 0;
      const r = right[start + i] ?? l;
      const m = channelCount > 1 ? (l + r) * 0.5 : l;
      const s = channelCount > 1 ? (l - r) * 0.5 : 0;
      const weightedMono = m * window[i];

      reMono[i] = weightedMono;
      reMid[i] = m * window[i];
      reSide[i] = s * window[i];

      frameSumSq += m * m;
      framePeak = Math.max(framePeak, Math.abs(m));
    }

    fft(reMono, imMono);
    fft(reMid, imMid);
    fft(reSide, imSide);

    const monoPower = new Float64Array(bins);
    const midPower = new Float64Array(bins);
    const sidePower = new Float64Array(bins);

    let centroidNumerator = 0;
    let centroidDenominator = 0;

    for (let bin = 0; bin < bins; bin++) {
      monoPower[bin] = reMono[bin] * reMono[bin] + imMono[bin] * imMono[bin];
      midPower[bin] = reMid[bin] * reMid[bin] + imMid[bin] * imMid[bin];
      sidePower[bin] = reSide[bin] * reSide[bin] + imSide[bin] * imSide[bin];
      const hz = bin * hzPerBin;
      centroidNumerator += monoPower[bin] * hz;
      centroidDenominator += monoPower[bin];
    }

    const frameRms = Math.sqrt(frameSumSq / fftSize);
    const frameRmsDb = db(frameRms);
    const frameCrestDb = framePeak > 0 && frameRms > 0 ? 20 * Math.log10(framePeak / frameRms) : 0;

    const sub = bandEnergy(monoPower, ...bandMap.sub);
    const bass = bandEnergy(monoPower, ...bandMap.bass);
    const lowMid = bandEnergy(monoPower, ...bandMap.lowMid);
    const mid = bandEnergy(monoPower, ...bandMap.mid);
    const upperMid = bandEnergy(monoPower, ...bandMap.upperMid);
    const brilliance = bandEnergy(monoPower, ...bandMap.brilliance);
    const air = bandEnergy(monoPower, ...bandMap.air);
    const total = sub + bass + lowMid + mid + upperMid + brilliance + air || 1;

    const widthBand = (lowHz: number, highHz: number): number => {
      const mid = bandEnergy(midPower, lowHz, highHz);
      const side = bandEnergy(sidePower, lowHz, highHz);
      const totalBand = mid + side || 1;
      return clamp((side / totalBand) * 200);
    };

    const upperToBody = (upperMid + brilliance) / Math.max(0.0001, lowMid + mid);
    const transientProxy = scale(frameCrestDb, 6, 18) * 0.7 + scale(upperToBody, 0.28, 0.85) * 0.3;

    rmsFrames.push(frameRmsDb);
    crestFrames.push(frameCrestDb);
    frameSharpness.push(transientProxy);
    frameContinuity.push(total > 0 ? (lowMid + mid + air) / total : 0);
    tonalFrames.push({
      sub: (sub / total) * 100,
      bass: (bass / total) * 100,
      lowMid: (lowMid / total) * 100,
      mid: (mid / total) * 100,
      upperMid: (upperMid / total) * 100,
      brilliance: (brilliance / total) * 100,
      air: (air / total) * 100,
    });
    widthFrames.push({
      total: widthBand(20, 18000),
      low: widthBand(...bandMap.lowWidth),
      mid: widthBand(...bandMap.midWidth),
      high: widthBand(...bandMap.highWidth),
    });
    centroidFrames.push(centroidDenominator > 0 ? centroidNumerator / centroidDenominator : 0);
  }

  const avgBand = (key: keyof (typeof tonalFrames)[number]) => mean(tonalFrames.map((frame) => frame[key]));
  const avgWidth = (key: keyof (typeof widthFrames)[number]) => mean(widthFrames.map((frame) => frame[key]));

  // These derived feature formulas are the main tuning surface for the emotional engine.
  // Adjust the ranges first if the scores feel systematically too hot or too cold.
  const subPresence = scale(avgBand("sub") + avgBand("bass") * 0.5, 8, 32);
  const bassDominance = scale(avgBand("sub") + avgBand("bass") + avgBand("lowMid") * 0.45, 18, 46);
  const lowMidDensity = scale(avgBand("bass") * 0.35 + avgBand("lowMid"), 11, 30);
  const midPresence = scale(avgBand("mid"), 18, 36);
  const upperMidPresence = scale(avgBand("upperMid"), 6, 20);
  const airBandEnergy = scale(avgBand("air"), 2, 12);
  const harshness2k5k = clamp(scale(avgBand("upperMid"), 7, 17) * 0.8 + scale(mean(crestFrames), 4, 10) * 0.2);
  const harshness6k10k = clamp(scale(avgBand("brilliance"), 4, 15) * 0.7 + scale(avgWidth("high"), 20, 85) * 0.1 + scale(mean(crestFrames), 4, 10) * 0.2);

  const macroRange = percentile(rmsFrames, 0.9) - percentile(rmsFrames, 0.1);
  const microDynamics = clamp(
    scale(mean(rmsFrames.map((value, index, values) => (index === 0 ? 0 : Math.abs(value - values[index - 1])))), 0.5, 3.5) * 0.6 +
      scale(percentile(crestFrames, 0.8) - percentile(crestFrames, 0.2), 1, 7) * 0.4
  );
  const sectionContrast = clamp(scale(percentile(rmsFrames, 0.9) - percentile(rmsFrames, 0.3), 1.5, 10));
  const compressionDensity = clamp(
    scale(12 - crestDb, 0, 8) * 0.45 +
      scale(approxLufs, -22, -8) * 0.2 +
      scale(10 - macroRange, 0, 8) * 0.2 +
      scale(40 - microDynamics, 0, 35) * 0.15
  );

  const sharpness = clamp(mean(frameSharpness) * 0.7 + harshness2k5k * 0.2 + harshness6k10k * 0.1);
  const softness = clamp(100 - sharpness * 0.78 + scale(avgWidth("high"), 15, 55) * 0.08 + scale(lowMidDensity, 25, 70) * 0.14);

  const totalWidth = avgWidth("total");
  const lowBandWidth = avgWidth("low");
  const midBandWidth = avgWidth("mid");
  const highBandWidth = avgWidth("high");
  const centerDominance = clamp(100 - totalWidth * 0.9 + scale(lowBandWidth, 0, 40) * 0.1);
  const sideDominance = clamp(totalWidth);
  const monoCompatibility = clamp(
    100 - lowBandWidth * 0.45 - Math.max(0, highBandWidth - midBandWidth) * 0.25 - totalWidth * 0.2
  );

  const warmth = clamp(lowMidDensity * 0.55 + subPresence * 0.15 + (100 - harshness2k5k) * 0.2 + (100 - airBandEnergy) * 0.1);
  const harmonicDensity = clamp(lowMidDensity * 0.34 + upperMidPresence * 0.22 + compressionDensity * 0.24 + scale(avgBand("brilliance"), 4, 11) * 0.2);

  // Spatial cues are intentionally named as "impressions" because stereo mixdown can only support inference here.
  const reverbImpression = clamp(highBandWidth * 0.28 + airBandEnergy * 0.24 + softness * 0.14 + scale(20 - sectionContrast, 0, 15) * 0.18 + scale(60 - centerDominance, 0, 50) * 0.16);
  const dryWet = reverbImpression;
  const decayImpression = clamp(reverbImpression * 0.5 + softness * 0.25 + scale(mean(frameContinuity), 0.18, 0.45) * 0.25);
  const spatialDepth = clamp(reverbImpression * 0.42 + totalWidth * 0.2 + highBandWidth * 0.18 + airBandEnergy * 0.12 + scale(45 - centerDominance, 0, 35) * 0.08);

  const maskingRisk = clamp(lowMidDensity * 0.3 + upperMidPresence * 0.18 + compressionDensity * 0.24 + centerDominance * 0.12 + scale(55 - sectionContrast, 0, 45) * 0.16);
  const clutter = clamp(maskingRisk * 0.55 + lowMidDensity * 0.15 + harshness2k5k * 0.12 + scale(40 - totalWidth, 0, 35) * 0.18);
  const overallDensity = clamp(lowMidDensity * 0.22 + midPresence * 0.12 + bassDominance * 0.12 + compressionDensity * 0.28 + maskingRisk * 0.26);

  const vocalForwardness = clamp(midPresence * 0.36 + upperMidPresence * 0.12 + centerDominance * 0.24 + (100 - dryWet) * 0.18 + (100 - bassDominance) * 0.1);
  const vocalForwardnessConfidence: "low" | "medium" | "high" =
    midPresence > 50 && centerDominance > 45 ? "high" : midPresence > 30 ? "medium" : "low";
  const intimacyProxy = clamp(vocalForwardness * 0.46 + (100 - dryWet) * 0.34 + centerDominance * 0.2);

  const uncertaintyNotes: string[] = [];
  if (channelCount < 2) {
    uncertaintyNotes.push("Stereo-dependent cues such as width by band, depth, and openness are limited because the source is mono.");
  }
  if (audioBuffer.duration < 35) {
    uncertaintyNotes.push("Section contrast is estimated from a short excerpt, so drama and narrative movement are less reliable than on a full song.");
  }
  if (vocalForwardnessConfidence === "low") {
    uncertaintyNotes.push("Lead-source closeness is inferred cautiously because the mix does not present a clearly dominant center-mid focal element.");
  }
  if (monoCompatibility < 45) {
    uncertaintyNotes.push("Wide side energy suggests some spatial impressions may collapse noticeably in mono playback.");
  }

  return {
    loudness: {
      rmsDb: Math.round(rmsDb * 10) / 10,
      peakDb: Math.round(peakDb * 10) / 10,
      crestDb: Math.round(crestDb * 10) / 10,
      approxLufs: Math.round(approxLufs * 10) / 10,
    },
    dynamics: {
      macroRange: Math.round(macroRange * 10) / 10,
      microDynamics: Math.round(microDynamics),
      compressionDensity: Math.round(compressionDensity),
      sectionContrast: Math.round(sectionContrast),
    },
    transients: {
      sharpness: Math.round(sharpness),
      softness: Math.round(softness),
    },
    tonal: {
      spectralCentroidHz: Math.round(mean(centroidFrames)),
      subPresence: Math.round(subPresence),
      bassDominance: Math.round(bassDominance),
      lowMidDensity: Math.round(lowMidDensity),
      midPresence: Math.round(midPresence),
      upperMidPresence: Math.round(upperMidPresence),
      harshness2k5k: Math.round(harshness2k5k),
      harshness6k10k: Math.round(harshness6k10k),
      airBandEnergy: Math.round(airBandEnergy),
      warmth: Math.round(warmth),
      harmonicDensity: Math.round(harmonicDensity),
    },
    stereo: {
      totalWidth: Math.round(totalWidth),
      lowBandWidth: Math.round(lowBandWidth),
      midBandWidth: Math.round(midBandWidth),
      highBandWidth: Math.round(highBandWidth),
      centerDominance: Math.round(centerDominance),
      sideDominance: Math.round(sideDominance),
      monoCompatibility: Math.round(monoCompatibility),
    },
    space: {
      dryWet: Math.round(dryWet),
      reverbImpression: Math.round(reverbImpression),
      decayImpression: Math.round(decayImpression),
      spatialDepth: Math.round(spatialDepth),
    },
    density: {
      maskingRisk: Math.round(maskingRisk),
      clutter: Math.round(clutter),
      overallDensity: Math.round(overallDensity),
    },
    focal: {
      vocalForwardness: Math.round(vocalForwardness),
      vocalForwardnessConfidence,
      intimacyProxy: Math.round(intimacyProxy),
    },
    uncertaintyNotes,
  };
}
