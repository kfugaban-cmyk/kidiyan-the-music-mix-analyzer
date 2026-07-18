import assert from "node:assert/strict";
import test from "node:test";
import { measurePcmRange, measureStereoChannels } from "./measurementLedger";

test("measures identical stereo channels as centered and correlated", () => {
  const channel = Float32Array.from([0.5, -0.5, 0.25, -0.25]);
  const result = measureStereoChannels([channel, channel]);

  assert.equal(result.correlation, 1);
  assert.equal(result.sideSharePct, 0);
  assert.equal(result.monoFoldDownDeltaDb, 0);
});

test("measures polarity-inverted channels as cancelling in mono", () => {
  const left = Float32Array.from([0.5, -0.5, 0.25, -0.25]);
  const right = Float32Array.from(left, (value) => -value);
  const result = measureStereoChannels([left, right]);

  assert.equal(result.correlation, -1);
  assert.equal(result.sideSharePct, 100);
  assert.ok(result.monoFoldDownDeltaDb < -80);
});

test("reports PCM RMS, sample peak, and crest without claiming LUFS", () => {
  const channel = Float32Array.from([0.5, -0.5, 0.5, -0.5]);
  const result = measurePcmRange([channel], 0, channel.length);

  assert.equal(result.rmsDbfs, -6);
  assert.equal(result.peakDbfs, -6);
  assert.equal(result.crestDb, 0);
});
