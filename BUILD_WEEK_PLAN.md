# Build Week Implementation Plan

This plan extends the preserved `v1.0.0` prototype without rewriting it. Every new interpretation must keep three categories visibly separate:

1. **Measured fact**: directly computed from decoded PCM or FFT data, with units, method, and scope.
2. **Limited technical inference**: a transparent rule or proxy derived from measured facts, with explicit caveats.
3. **Subjective creative interpretation**: an intention-aware producer reading grounded in cited evidence, never presented as truth.

## Phase 1: Grounded vertical slice

Deliver the complete path: upload or rights-cleared demo -> defensible overall measurements -> production intention -> structured interpretation -> visible supporting evidence.

- Add a typed measurement ledger with stable evidence IDs, units, methods, scopes, and limitations.
- Add a small set of production intentions so the same measurement can be discussed differently depending on the user's goal.
- Add a structured interpretation schema in which every claim cites measurement IDs.
- Add a deterministic local interpreter that works offline and produces byte-stable results for the same measurements and intention.
- Add an optional secure server endpoint for GPT interpretation. Send only measurements and intention, never audio, and keep the API key server-side.
- Fall back automatically to deterministic interpretation when the server endpoint or key is unavailable.
- Present measured facts, limited inferences, and creative interpretation with distinct labels and styling.
- Phrase proposed changes as reversible listening experiments with an observation target, not universal prescriptions.

## Phase 2: Measurement credibility

- Replace approximate LUFS with browser-based BS.1770-style K-weighting, channel weighting, gating, and integrated loudness tests.
- Add true-peak oversampling or label sample peak consistently until that is implemented.
- Add L/R correlation and actual mono fold-down delta measurements.
- Preserve raw band-energy shares and ratios instead of exposing only calibrated 0-100 proxies.
- Add fixture-based tests using deterministic synthetic signals: silence, sine tones, impulses, mono/stereo pairs, phase-inverted pairs, and stepped levels.
- Document browser/codec variance and minimum-duration constraints.

## Phase 3: Section-level comparison

- Begin with explicit time regions and label them as regions, not inferred song sections.
- Add novelty-based boundary candidates from loudness, spectral, and width change.
- Allow the user to confirm or adjust proposed boundaries before naming sections.
- Compare level, crest, spectral balance, width, density proxies, and contrast across confirmed sections.
- Cite section and timestamp in every section-level claim.

## Phase 4: Intention-aware GPT interpretation

- Use a server-only OpenAI API call with a JSON schema and a model selected through a server environment variable.
- Constrain model input to the measurement ledger, transparent inference outputs, intention, and allowed evidence IDs.
- Reject or repair responses containing uncited claims, unsupported source-specific claims, or evidence IDs that were not supplied.
- Store no uploaded audio. Avoid logging raw measurement payloads unless an explicit diagnostic mode is enabled.
- Show whether the result came from the model or deterministic fallback and explain why fallback was used.

## Phase 5: Product depth and validation

- Connect the existing 15-dimension emotional profile to the new evidence ledger while retaining its nuanced language and tradeoff model.
- Add reference-aware experiments and A/B notes without declaring a universal ideal.
- Add unit tests for extraction helpers, scoring boundaries, evidence validation, and deterministic output.
- Add component tests for intention selection, category labels, fallback state, and evidence expansion.
- Add end-to-end smoke tests for upload, demo, interpretation, print, and deployment routing.
- Add accessibility, mobile, print, and reduced-motion verification.

## Security and deployment contract

- `OPENAI_API_KEY` is server-only and must never use a `VITE_` prefix.
- The browser sends measurement JSON and a selected intention, not the audio file.
- The application remains fully useful without an API key through deterministic fallback.
- `.env.example` contains names and explanations only, never real values.
- Vercel preview and production deployments run typecheck, tests, and the production build before release.
- The built-in demo remains original, deterministic, and documented as rights-cleared for this project.

## Definition of done for the first slice

- Upload and demo both create a measurement ledger.
- The user must choose an intention before requesting interpretation.
- Every interpretation claim displays at least one supporting measured fact.
- Every item is labeled as fact, inference, or creative interpretation.
- Every suggested move is framed as a listening experiment with a stated tradeoff or thing to monitor.
- Model unavailability is handled without breaking the report.
- No secret appears in the browser bundle.
- Automated tests, typecheck, production build, and a visual browser pass succeed.
