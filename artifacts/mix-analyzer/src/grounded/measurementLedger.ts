import type { AudioFeatureData } from "@/analysis/types";
import type { MeasurementLedger, MeasurementRecord, TimeRegionMeasurement } from "./types";

const SILENCE_DB = -96;

function db(value: number): number {
  return value > 0 ? 20 * Math.log10(value) : SILENCE_DB;
}

function rounded(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function measurePcmRange(
  channels: Float32Array[],
  start: number,
  end: number
): { rmsDbfs: number; peakDbfs: number; crestDb: number } {
  let sumSq = 0;
  let peak = 0;
  const length = Math.max(1, end - start);

  for (let index = start; index < end; index += 1) {
    let mono = 0;
    for (const channel of channels) mono += channel[index] ?? 0;
    mono /= channels.length;
    sumSq += mono * mono;
    peak = Math.max(peak, Math.abs(mono));
  }

  const rms = Math.sqrt(sumSq / length);
  return {
    rmsDbfs: rounded(db(rms)),
    peakDbfs: rounded(db(peak)),
    crestDb: rounded(peak > 0 && rms > 0 ? 20 * Math.log10(peak / rms) : 0),
  };
}

export function measureStereoChannels(channels: Float32Array[]): {
  correlation: number;
  sideSharePct: number;
  monoFoldDownDeltaDb: number;
} {
  if (channels.length < 2) {
    return { correlation: 1, sideSharePct: 0, monoFoldDownDeltaDb: 0 };
  }

  const [left, right] = channels;
  let leftSq = 0;
  let rightSq = 0;
  let cross = 0;
  let midSq = 0;
  let sideSq = 0;

  for (let index = 0; index < left.length; index += 1) {
    const l = left[index];
    const r = right[index] ?? 0;
    const mid = (l + r) * 0.5;
    const side = (l - r) * 0.5;
    leftSq += l * l;
    rightSq += r * r;
    cross += l * r;
    midSq += mid * mid;
    sideSq += side * side;
  }

  const count = Math.max(1, left.length);
  const leftRms = Math.sqrt(leftSq / count);
  const rightRms = Math.sqrt(rightSq / count);
  const midRms = Math.sqrt(midSq / count);
  const sideRms = Math.sqrt(sideSq / count);
  const averageChannelRms = (leftRms + rightRms) * 0.5;
  const denominator = Math.sqrt(leftSq * rightSq);

  return {
    correlation: rounded(denominator > 0 ? cross / denominator : 1, 2),
    sideSharePct: rounded(((sideRms / Math.max(1e-12, midRms + sideRms)) * 100), 1),
    monoFoldDownDeltaDb: rounded(db(midRms) - db(averageChannelRms), 1),
  };
}

function fact(
  id: string,
  label: string,
  value: number,
  unit: string,
  method: string,
  limitation: string,
  scope: MeasurementRecord["scope"] = "whole_mix"
): MeasurementRecord {
  return {
    id,
    category: "measured_fact",
    label,
    value,
    unit,
    displayValue: unit === "%" ? `${value}%` : unit ? `${value} ${unit}` : String(value),
    scope,
    method,
    limitation,
  };
}

export function createMeasurementLedger(
  audioBuffer: AudioBuffer,
  features: AudioFeatureData
): MeasurementLedger {
  const channels = Array.from(
    { length: audioBuffer.numberOfChannels },
    (_, index) => audioBuffer.getChannelData(index)
  );
  const overall = measurePcmRange(channels, 0, audioBuffer.length);
  const stereo = measureStereoChannels(channels);
  const regionLabels = ["Opening third", "Middle third", "Ending third"];
  const regionIds: TimeRegionMeasurement["id"][] = ["opening", "middle", "ending"];
  const timeRegions = regionIds.map((id, index): TimeRegionMeasurement => {
    const start = Math.floor((audioBuffer.length * index) / 3);
    const end = index === 2 ? audioBuffer.length : Math.floor((audioBuffer.length * (index + 1)) / 3);
    const region = measurePcmRange(channels, start, end);
    return {
      id,
      label: regionLabels[index],
      startSeconds: rounded(start / audioBuffer.sampleRate, 2),
      endSeconds: rounded(end / audioBuffer.sampleRate, 2),
      rmsDbfs: region.rmsDbfs,
      crestDb: region.crestDb,
    };
  });
  const regionLevels = timeRegions.map((region) => region.rmsDbfs);
  const regionLevelSpread = rounded(Math.max(...regionLevels) - Math.min(...regionLevels));
  const bands = features.measured.bandAmplitudeSharePct;

  const facts: MeasurementRecord[] = [
    fact("level.rms_dbfs", "RMS level", overall.rmsDbfs, "dBFS", "Root mean square of the decoded mono fold-down.", "Unweighted level; this is not LUFS."),
    fact("level.sample_peak_dbfs", "Sample peak", overall.peakDbfs, "dBFS", "Largest decoded sample in the mono fold-down.", "Sample peak only; inter-sample true peak is not measured."),
    fact("dynamics.crest_db", "Crest factor", overall.crestDb, "dB", "Difference between sample peak and RMS level.", "A global crest factor cannot identify compressor settings."),
    fact("dynamics.frame_range_db", "Frame level range", features.dynamics.macroRange, "dB", "90th minus 10th percentile of short-frame RMS levels.", "Describes level spread, not a standards-based dynamic-range score."),
    fact("spectrum.centroid_hz", "Spectral centroid", features.tonal.spectralCentroidHz, "Hz", "Power-weighted center frequency across sampled 4,096-point FFT frames.", "A broad brightness descriptor; it does not locate a specific instrument."),
    fact("spectrum.low_body_share_pct", "Low-body amplitude share", rounded(bands.bass + bands.lowMid), "%", "Average relative FFT-band amplitude from 80-500 Hz.", "Band result depends on the fixed windows and is not perceived loudness."),
    fact("spectrum.presence_share_pct", "Presence amplitude share", rounded(bands.mid + bands.upperMid), "%", "Average relative FFT-band amplitude from 500 Hz-5 kHz.", "Cannot determine whether this energy is vocal, percussion, or another source."),
    fact("spectrum.air_share_pct", "Air amplitude share", bands.air, "%", "Average relative FFT-band amplitude from 10-18 kHz.", "Codec and sample-rate bandwidth can materially affect this value."),
    fact("stereo.side_share_pct", "Side amplitude share", stereo.sideSharePct, "%", "Side RMS divided by combined mid-plus-side RMS.", "Width amount alone does not indicate whether the side signal is beneficial."),
    fact("stereo.lr_correlation", "L/R correlation", stereo.correlation, "", "Normalized sample correlation between decoded left and right channels.", "A whole-mix average can hide short phase problems."),
    fact("stereo.mono_delta_db", "Mono fold-down delta", stereo.monoFoldDownDeltaDb, "dB", "Mono mid RMS compared with average channel RMS.", "A level delta does not describe all tonal changes after fold-down."),
    fact("regions.level_spread_db", "Third-to-third level spread", regionLevelSpread, "dB", "Difference between the loudest and quietest equal-duration thirds.", "These are time regions, not detected musical sections."),
    ...timeRegions.map((region) =>
      fact(
        `region.${region.id}.rms_dbfs`,
        `${region.label} RMS`,
        region.rmsDbfs,
        "dBFS",
        `RMS level from ${region.startSeconds}-${region.endSeconds} seconds.`,
        "Equal-duration region; the boundary may not align with the arrangement.",
        "time_region"
      )
    ),
  ];

  const caveats = [
    "No source separation is used, so focal-source and instrument-specific claims are intentionally excluded.",
    "The three regions are equal-duration comparisons, not automatically detected verses, choruses, or drops.",
  ];
  if (audioBuffer.numberOfChannels < 2) caveats.push("Stereo evidence is limited because the decoded source is mono.");
  if (audioBuffer.duration < 15) caveats.push("Short excerpts reduce confidence in region-level contrast.");

  return {
    version: 1,
    durationSeconds: rounded(audioBuffer.duration, 2),
    sampleRateHz: audioBuffer.sampleRate,
    channelCount: audioBuffer.numberOfChannels,
    facts,
    timeRegions,
    caveats,
  };
}
