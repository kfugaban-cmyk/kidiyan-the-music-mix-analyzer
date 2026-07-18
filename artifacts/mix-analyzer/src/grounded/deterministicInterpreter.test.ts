import assert from "node:assert/strict";
import test from "node:test";
import { createDeterministicInterpretation } from "./deterministicInterpreter";
import { validateInterpretationContent } from "./interpretationClient";
import type { MeasurementLedger, MeasurementRecord, ProductionIntentionKey } from "./types";

function record(id: string, label: string, value: number, unit: string): MeasurementRecord {
  return {
    id,
    category: "measured_fact",
    label,
    value,
    unit,
    displayValue: unit ? `${value} ${unit}` : String(value),
    scope: id.startsWith("region.") ? "time_region" : "whole_mix",
    method: "Deterministic test fixture.",
    limitation: "Synthetic fixture.",
  };
}

function fixture(): MeasurementLedger {
  return {
    version: 1,
    durationSeconds: 30,
    sampleRateHz: 48_000,
    channelCount: 2,
    facts: [
      record("level.rms_dbfs", "RMS level", -14, "dBFS"),
      record("level.sample_peak_dbfs", "Sample peak", -1, "dBFS"),
      record("dynamics.crest_db", "Crest factor", 13, "dB"),
      record("dynamics.frame_range_db", "Frame level range", 8, "dB"),
      record("spectrum.centroid_hz", "Spectral centroid", 2400, "Hz"),
      record("spectrum.low_body_share_pct", "Low body", 31, "%"),
      record("spectrum.presence_share_pct", "Presence", 40, "%"),
      record("spectrum.air_share_pct", "Air", 6, "%"),
      record("stereo.side_share_pct", "Side share", 24, "%"),
      record("stereo.lr_correlation", "L/R correlation", 0.72, ""),
      record("stereo.mono_delta_db", "Mono delta", -0.8, "dB"),
      record("regions.level_spread_db", "Region spread", 4, "dB"),
      record("region.opening.rms_dbfs", "Opening third RMS", -16, "dBFS"),
      record("region.middle.rms_dbfs", "Middle third RMS", -12, "dBFS"),
      record("region.ending.rms_dbfs", "Ending third RMS", -14, "dBFS"),
    ],
    timeRegions: [],
    caveats: ["Synthetic fixture."],
  };
}

const intentions: ProductionIntentionKey[] = [
  "closer_exposure",
  "weight_grounding",
  "openness_lift",
  "urgency_impact",
  "contrast_drama",
];

test("deterministic fallback is stable and cites only supplied facts", () => {
  const ledger = fixture();

  for (const intention of intentions) {
    const first = createDeterministicInterpretation(ledger, intention);
    const second = createDeterministicInterpretation(ledger, intention);
    assert.deepEqual(first, second);
    assert.equal(first.mode, "deterministic");
    assert.ok(validateInterpretationContent(first, ledger));
  }
});

test("production intention changes the creative reading without changing facts", () => {
  const ledger = fixture();
  const closer = createDeterministicInterpretation(ledger, "closer_exposure");
  const openness = createDeterministicInterpretation(ledger, "openness_lift");

  assert.notEqual(closer.claims[0].title, openness.claims[0].title);
  assert.equal(ledger.facts.length, 15);
});

test("evidence validator rejects invented evidence IDs", () => {
  const ledger = fixture();
  const result = createDeterministicInterpretation(ledger, "openness_lift");
  result.claims[0].evidenceIds = ["stereo.imaginary_measurement"];

  assert.equal(validateInterpretationContent(result, ledger), false);
});
