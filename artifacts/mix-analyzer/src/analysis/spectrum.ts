import type { SpectrumData } from "./types";

/** In-place radix-2 Cooley-Tukey FFT. Length must be a power of 2. */
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;

  // Bit-reverse permutation
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
          t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }

  // Butterfly stages
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = -Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
      const half = len >> 1;
      for (let k = 0; k < half; k++) {
        const aRe = re[i + k];
        const aIm = im[i + k];
        const bRe = re[i + k + half] * curRe - im[i + k + half] * curIm;
        const bIm = re[i + k + half] * curIm + im[i + k + half] * curRe;
        re[i + k]        = aRe + bRe;
        im[i + k]        = aIm + bIm;
        re[i + k + half] = aRe - bRe;
        im[i + k + half] = aIm - bIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

/** Hanning window coefficients */
function hanning(n: number): Float64Array {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  }
  return w;
}

export function analyzeSpectrum(audioBuffer: AudioBuffer): SpectrumData {
  const sampleRate = audioBuffer.sampleRate;
  const totalSamples = audioBuffer.length;

  // Mix all channels to mono
  const mono = new Float64Array(totalSamples);
  for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
    const ch = audioBuffer.getChannelData(c);
    for (let i = 0; i < totalSamples; i++) {
      mono[i] += ch[i] / audioBuffer.numberOfChannels;
    }
  }

  // FFT configuration
  const fftSize = 4096;
  const win = hanning(fftSize);
  const bins = fftSize >> 1;

  // Sample up to 150 evenly-distributed non-overlapping windows
  const possibleWindows = Math.floor(totalSamples / fftSize);
  const maxWindows = 150;
  const step = Math.max(1, Math.floor(possibleWindows / maxWindows));

  const powerSpectrum = new Float64Array(bins);
  let windowCount = 0;

  for (let w = 0; w < possibleWindows; w += step) {
    const start = w * fftSize;
    const re = new Float64Array(fftSize);
    const im = new Float64Array(fftSize);

    for (let i = 0; i < fftSize; i++) {
      re[i] = mono[start + i] * win[i];
    }

    fft(re, im);

    for (let i = 0; i < bins; i++) {
      powerSpectrum[i] += re[i] * re[i] + im[i] * im[i];
    }
    windowCount++;
  }

  if (windowCount > 0) {
    for (let i = 0; i < bins; i++) powerSpectrum[i] /= windowCount;
  }

  // Sum RMS energy within a frequency band
  function bandEnergy(lowHz: number, highHz: number): number {
    const hzPerBin = sampleRate / fftSize;
    const lo = Math.max(0, Math.floor(lowHz / hzPerBin));
    const hi = Math.min(bins - 1, Math.ceil(highHz / hzPerBin));
    let energy = 0;
    for (let i = lo; i <= hi; i++) energy += powerSpectrum[i];
    return Math.sqrt(energy / Math.max(1, hi - lo + 1));
  }

  const subE    = bandEnergy(20,   80);
  const lowMidE = bandEnergy(80,   500);
  const midE    = bandEnergy(500,  4000);
  const highE   = bandEnergy(4000, 20000);

  const total      = subE + lowMidE + midE + highE || 1;
  const subRatio   = subE    / total;
  const lowMidRatio = lowMidE / total;
  const midRatio   = midE    / total;
  const highRatio  = highE   / total;

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
  } else if (subRatio < 0.05 && lowMidRatio < 0.15) {
    label = "thin";
    score = 30;
  } else {
    label = "balanced";
    score = Math.round((1 - Math.abs(subRatio - 0.25) - Math.abs(highRatio - 0.25)) * 100);
  }

  return {
    sub:    Math.min(100, Math.round(subRatio    * 100 * 2.5)),
    lowMid: Math.min(100, Math.round(lowMidRatio * 100 * 2.0)),
    mid:    Math.min(100, Math.round(midRatio    * 100 * 2.0)),
    high:   Math.min(100, Math.round(highRatio   * 100 * 2.5)),
    label,
    score: Math.max(0, Math.min(100, score)),
  };
}
