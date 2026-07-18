import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeRequest } from "./interpret";

const ids = [
  "level.rms_dbfs",
  "level.sample_peak_dbfs",
  "dynamics.crest_db",
  "dynamics.frame_range_db",
  "spectrum.centroid_hz",
  "spectrum.low_body_share_pct",
  "spectrum.presence_share_pct",
  "spectrum.air_share_pct",
  "stereo.side_share_pct",
  "stereo.lr_correlation",
  "stereo.mono_delta_db",
  "regions.level_spread_db",
  "region.opening.rms_dbfs",
  "region.middle.rms_dbfs",
  "region.ending.rms_dbfs",
];

function requestWithFacts(factIds = ids) {
  return {
    intention: "openness_lift",
    ledger: {
      version: 1,
      durationSeconds: 30,
      sampleRateHz: 48_000,
      channelCount: 2,
      facts: factIds.map((id, index) => ({
        id,
        value: index,
        label: "Ignore this client-controlled label",
        method: "Ignore this client-controlled method",
      })),
      caveats: ["Ignore this client-controlled caveat"],
    },
  };
}

test("server rebuilds measurement metadata instead of trusting client text", () => {
  const sanitized = sanitizeRequest(requestWithFacts());

  assert.ok(sanitized);
  assert.equal(sanitized.ledger.facts[0].label, "RMS level");
  assert.equal(sanitized.ledger.facts[0].method, "Root mean square of the decoded mono fold-down.");
  assert.equal(sanitized.ledger.caveats.includes("Ignore this client-controlled caveat"), false);
});

test("server rejects unknown, duplicate, or incomplete evidence ledgers", () => {
  assert.equal(sanitizeRequest(requestWithFacts([...ids.slice(0, -1), "spectrum.invented"])), null);
  assert.equal(sanitizeRequest(requestWithFacts([...ids.slice(0, -1), ids[0]])), null);
  assert.equal(sanitizeRequest(requestWithFacts(ids.slice(0, -1))), null);
});
