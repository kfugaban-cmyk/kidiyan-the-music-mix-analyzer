const SAMPLE_RATE = 22_050;
const DURATION_SECONDS = 12;
const CHANNEL_COUNT = 2;
const BITS_PER_SAMPLE = 16;

const clampSample = (value: number) => Math.max(-1, Math.min(1, value));

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

/**
 * Creates the bundled demo as deterministic PCM instead of shipping a
 * third-party recording. The musical material is original to this project,
 * rights-cleared, and always produces identical analyzer input.
 */
export function createDemoMixFile(): File {
  const frameCount = SAMPLE_RATE * DURATION_SECONDS;
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const dataSize = frameCount * CHANNEL_COUNT * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, CHANNEL_COUNT, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * CHANNEL_COUNT * bytesPerSample, true);
  view.setUint16(32, CHANNEL_COUNT * bytesPerSample, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const roots = [110, 98, 82.41, 123.47];
  const ratios = [1, 1.5, 2, 2.5];
  let noiseState = 0x5eed1234;

  for (let frame = 0; frame < frameCount; frame += 1) {
    const time = frame / SAMPLE_RATE;
    const section = Math.min(roots.length - 1, Math.floor(time / 3));
    const root = roots[section];
    const sectionTime = time % 3;
    const pulseTime = time % 0.75;
    const fade = Math.min(1, time / 0.4, (DURATION_SECONDS - time) / 0.55);

    let center = 0;
    let side = 0;
    for (let partial = 0; partial < ratios.length; partial += 1) {
      const frequency = root * ratios[partial];
      const level = 0.12 / (partial + 1);
      center += Math.sin(2 * Math.PI * frequency * time) * level;
      side += Math.sin(2 * Math.PI * (frequency * 1.004) * time + partial) * level;
    }

    // A restrained pulse and exposed lead give the demo useful dynamic,
    // spectral, and intimacy cues without targeting a particular score.
    const kickEnvelope = Math.exp(-pulseTime * 11);
    const kick = Math.sin(2 * Math.PI * (48 + 42 * kickEnvelope) * time) * kickEnvelope * 0.24;
    const phraseEnvelope = Math.pow(Math.sin(Math.PI * Math.min(1, sectionTime / 2.7)), 1.4);
    const lead = Math.sin(2 * Math.PI * root * 4 * time + 0.18 * Math.sin(time * 5.3))
      * phraseEnvelope
      * 0.075;

    noiseState = (Math.imul(noiseState, 1_664_525) + 1_013_904_223) >>> 0;
    const breath = ((noiseState / 0xffffffff) * 2 - 1) * phraseEnvelope * 0.008;

    const left = clampSample((center + side * 0.72 + kick + lead + breath) * fade);
    const right = clampSample((center - side * 0.72 + kick + lead - breath * 0.4) * fade);
    const offset = 44 + frame * CHANNEL_COUNT * bytesPerSample;
    view.setInt16(offset, Math.round(left * 0x7fff), true);
    view.setInt16(offset + bytesPerSample, Math.round(right * 0x7fff), true);
  }

  return new File([buffer], "mix-analyzer-original-demo.wav", { type: "audio/wav" });
}
