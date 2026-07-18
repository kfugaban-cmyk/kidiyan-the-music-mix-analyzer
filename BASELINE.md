# Build Week Baseline

Audit date: 2026-07-17  
Preserved product baseline: `5e3424e` (`v1.0.0`, "Build emotional mix analyzer")  
Deployment-only follow-ups: `dc69fdc`, `9edbe4b`

This file records the state of the project before the new OpenAI Build Week work. It is intended to keep useful prior work intact and to make the limits of the current analysis explicit.

## Existing product

The repository already contains a polished, browser-first mix-analysis prototype with:

- WAV and MP3 drag-and-drop or file-picker input.
- Browser-local decoding with the Web Audio API. Selected audio remains in page memory and is not uploaded or persisted.
- A deterministic, original 12-second stereo PCM demo generated in `artifacts/mix-analyzer/src/demoAudio.ts`.
- Waveform, tonal-balance, stereo-width, dynamics, and translation-risk displays.
- A 15-dimension perceived emotional profile, including separate fragile and intentional vulnerability dimensions.
- An Emotional Hierarchy visualization for the strongest emotional tendencies.
- Per-dimension evidence, likely mix causes, increase/reduce suggestions, tradeoffs, confidence labels, and uncertainty notes.
- A print stylesheet and Print report action.
- A responsive React interface with Vite production output.

The prior emotional work is substantial and should be preserved as a creative heuristic layer. Build Week work will add a stricter measurement and evidence contract alongside it rather than replacing it.

## What currently works

- Uploading or dropping a supported WAV/MP3 decodes and analyzes the file in the browser.
- The demo action generates a byte-identical WAV input and runs it through the same analysis path as an upload.
- The waveform, spectrum, stereo, dynamics, emotional profile, hierarchy, recommendations, and translation-risk views render from the analysis result.
- The audio player uses a temporary object URL and revokes it when it is replaced or unmounted.
- New file resets the current in-memory analysis.
- Print report opens browser print preview and print CSS preserves the report structure.
- `pnpm --filter @workspace/mix-analyzer run build` produces the deployable static site in `artifacts/mix-analyzer/dist/public`.
- Vercel is currently serving the main branch at `https://kidiyan-the-music-mix-analyzer-api.vercel.app/`.

## Genuinely calculated values

These values are computed directly from decoded PCM samples or FFT bins. They are measurements, subject to the stated implementation limits.

| Value | Current method | Important limit |
| --- | --- | --- |
| Duration and sample rate | Web Audio `AudioBuffer` metadata | Browser decoder behavior can vary slightly by codec. |
| Waveform peaks | Maximum absolute sample in 2,000 blocks of channel 1 | Display envelope only; not a loudness trace. |
| Sample peak dBFS | Maximum absolute sample | Channel 1 in the legacy dynamics card; mono average in the richer feature extractor. Not true peak. |
| RMS dBFS | Root mean square of samples | Unweighted electrical level, not perceived loudness. |
| Crest factor | Peak-to-RMS ratio in dB | Global value; does not identify compression by itself. |
| FFT power | 4,096-point Hann-windowed FFT over sampled windows | Frequency resolution and window sampling are fixed. |
| Spectral centroid | Power-weighted average FFT-bin frequency | A brightness descriptor, not an aesthetic judgment. |
| Frequency-band energy | Summed FFT power in fixed bands | Current UI percentages are rescaled after calculation and are not literal percent-of-total energy. |
| Mid/side energy | RMS of `(L+R)/2` and `(L-R)/2` | Stereo files only; does not measure phase correlation by itself. |
| Frequency-dependent M/S energy | FFT band energy on mid and side signals | The displayed width score is a normalized mapping of the ratio. |
| Frame RMS and frame crest | 4,096-sample frames with a 2,048-sample hop | Global frame statistics; not musical phrase detection. |
| Macro level range | 90th minus 10th percentile frame RMS in dB | Robust level spread, not a standards-based dynamic-range metric. |
| Adjacent-frame level movement | Mean absolute frame-to-frame RMS-dB change | Used as one input to a normalized microdynamics proxy. |

## Derived technical inferences

These values are deterministic formulas built from measured inputs, but their 0-100 scales and thresholds are hand-tuned. They should be labeled as limited technical inferences, not measured facts.

- Spectrum labels and health scores (`balanced`, `bass-heavy`, `bright`, `mid-forward`, `thin`).
- Normalized sub presence, bass dominance, low-mid density, mid presence, upper-mid presence, and air energy.
- Total and band-limited stereo-width scores, center dominance, and side dominance.
- Microdynamics, transient sharpness/softness, harshness, warmth, compression density, masking risk, clutter, and overall density.
- Translation-risk labels for phones, headphones, and cars.
- Mono-compatibility score. It is inferred from side energy and width; the app does not currently perform a fold-down comparison or phase-correlation measurement.
- Section contrast. The current implementation compares global frame-level percentiles and does not detect or compare musical sections.

## Heuristics, placeholders, and unsupported claims

The following outputs can still be musically useful, but the current stereo-only implementation does not directly measure the phenomenon named.

- `approxLUFS` is `RMS dBFS - 0.7`. It is not ITU-R BS.1770/EBU R128 integrated LUFS because there is no K-weighting, channel weighting, or gating.
- Compression density is a composite of crest factor, approximate loudness, macro range, and microdynamic movement. It cannot establish that a compressor was used.
- Reverb amount, decay impression, dry/wet balance, and spatial depth are proxies derived from width, air, transient softness, and contrast. No reverberation tail or direct-to-reverberant ratio is isolated.
- Vocal forwardness and focal intimacy are center/midrange/density proxies. There is no vocal or source detector.
- Harmonic density is a spectral-density formula. It does not isolate harmonics, saturation, or distortion products.
- Masking and clutter are broad spectral-density composites. There is no source separation or psychoacoustic masking model.
- Emotional scores are weighted creative heuristics over the technical proxies. They represent perceived emotional tendencies, not facts about the song, performer, or listener.
- Emotional confidence currently reflects driver strength and a few uncertainty penalties; it is not a calibrated probability.
- Recommendations are producer-oriented hypotheses. They are not guaranteed prescriptions and are not validated against a target reference or the user's production intention.

## Architecture

- Monorepo: pnpm workspace, Node.js 20+, TypeScript.
- Active product: `artifacts/mix-analyzer`, React 19, Vite 7, Tailwind CSS, Wouter.
- Analysis flow: file -> Web Audio decode -> waveform/spectrum/stereo/dynamics/richer feature extraction -> emotional rules and translation rules -> React report.
- Analysis modules are separated into extraction, emotional mapping, translation, and UI files, although the evidence taxonomy is not yet represented as a first-class type.
- The repository also contains an Express API scaffold, generated API client/schema packages, a database package, and a mockup sandbox. None participates in the deployed analyzer path.
- No automated test suite existed at this baseline.
- No OpenAI model call existed at this baseline.

## Security and deployment

- Production is a static Vite deployment on Vercel from GitHub repository `kfugaban-cmyk/kidiyan-the-music-mix-analyzer`.
- Vercel build command: `pnpm --filter @workspace/mix-analyzer run build`.
- Vercel output directory: `artifacts/mix-analyzer/dist/public`.
- The deployed analyzer requires no environment variables at baseline. `PORT` and `BASE_PATH` are optional build/development settings.
- No API keys, tokens, or credentials were found in the active frontend source.
- A dormant database workspace expects `DATABASE_URL`, but it is neither imported by nor deployed with the mix analyzer.
- The root `.gitignore` excludes environment files, build output, and common uploaded-audio formats. Audio selected in the browser is not committed or permanently stored by the app.

## Baseline conclusion

The app already has a strong producer-facing emotional vocabulary and an interpretable weighted-rule system. Its main technical debt is not lack of functionality; it is category clarity. Build Week work should retain the current emotional profile while introducing defensible measurement records, explicit inference boundaries, intention-aware interpretation, evidence-linked claims, experiments, tests, and a secure optional server-side model path.
