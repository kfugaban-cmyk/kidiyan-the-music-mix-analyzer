# Ki'Diyan's Mix Analyzer

Mix Analyzer is a React/Vite application that allows any music producer to see what their mix is doing emotionally, based on the auditory translation of technical mix measurements. The interpretations and pracitcal listening experiments are a useful way to determine what sound the producer has, what they're going for, and how to experiment and have fun. 

The app analyzes audio locally and presents technical findings across tonal balance, dynamics, stereo translation, and perceived emotional tendencies. Instead of grading the mix or claiming that a song has one objectively correct emotional meaning, it treats the results as an interpretable emotional map.

For example, measurements such as low-mid density, compression behavior, spectral balance, stereo width, and dynamic variation may be connected to perceived tendencies such as warmth, tenderness, fragile vulnerability, melancholy, openness, urgency, or grit.

The app then turns those findings into reversible A/B listening experiments. Producers can also choose a creative intention—such as making the mix feel closer, weightier, more open, more urgent, or more contrasting—and receive a new reading grounded in the same measured evidence.

A bundled 30-second sample mix is available so judges can test the complete experience immediately. Users can also upload their own WAV or MP3 tracks.

Audio analysis is performed locally in the browser. An optional Vercel Function can turn the bounded measurement results into a structured, intention-aware GPT-5.6 reading without uploading the audio itself.

## Potential Impact

Mix Analyzer addresses a specific problem faced by developing music producers, independent artists, songwriters, and self-mixing musicians:

Technical audio-analysis tools can show what is happening in a mix, but they often do not help users understand how those measurements may affect the emotional experience of the listener.

A producer may be able to see that a track has strong low-mid energy, limited dynamic variation, or a narrow stereo image without knowing what those traits could mean creatively. The result is often one of two extremes:

- Technical feedback that is accurate but difficult to act on
- Generic AI advice that sounds confident but is not visibly connected to the audio evidence

Mix Analyzer is designed to bridge that gap.

### The audience

The primary audience includes:

- Developing producers who understand basic mixing concepts but are still learning how technical choices affect perception
- Independent artists who mix their own music without regular access to an experienced engineer
- Songwriters and vocal producers who think first in terms of emotion rather than engineering terminology
- Music students who need a clearer connection between audio measurements and creative decisions

The app is not intended to replace a mix engineer or make final artistic decisions. It is intended to make technical evidence more understandable and useful during the revision process.

### How the demonstrated solution addresses the problem

The project addresses the problem through several concrete design choices demonstrated in the working application.

#### 1. It connects interpretation to evidence

Each major finding includes the measurement associated with the interpretation. The app does not simply say that a mix feels warm, vulnerable, or melancholic; it shows which measured characteristics contributed to that reading.

This helps the user understand both the technical condition and its possible creative significance.

#### 2. It avoids reducing the mix to a quality score

The emotional profile is presented as a set of perceived tendencies rather than a grade.

This is important because a darker, denser, narrower, or less dynamic mix may be artistically appropriate. The app does not assume that technical difference is technical failure.

#### 3. It produces actionable but reversible guidance

The app turns its findings into small A/B listening experiments rather than permanent corrections.

Each suggestion explains:

- What adjustment to test
- What perceptual change to listen for
- What tradeoff the change might introduce

This gives the producer a specific next step while keeping the final decision in human hands.

#### 4. It adapts to the producer's intention

A user can choose whether they want the mix to feel closer, weightier, more open, more urgent, or more contrasting.

The app then reorganizes its recommendations around that goal while using the same underlying evidence. This makes the guidance more relevant than a universal list of mixing rules.

#### 5. It lowers the barrier to evaluation

The bundled sample mix allows judges and new users to experience the full workflow immediately.

Users can also analyze their own WAV or MP3 files, making the demonstrated experience directly transferable to real production work.

#### 6. It protects user audio

Audio decoding and feature extraction happen locally in the browser. The audio itself is not uploaded for interpretation.

Only a bounded ledger of measurements and the selected production intention may be sent to the server function. This makes the system more credible for artists working with private or unreleased material.

### Why the impact is credible

The project does not claim to solve the subjective nature of musical emotion.

Instead, it solves a narrower and more realistic problem:

> Helping producers understand how measurable mix characteristics may contribute to listener perception, and helping them identify a grounded next experiment.

That value is demonstrated in the application itself:

- The app accepts real audio
- Extracts measurable features locally
- Shows evidence-linked findings
- Generates intention-aware recommendations
- Provides a deterministic fallback
- Includes an immediately testable sample
- Preserves producer control over the final artistic decision

The potential impact is therefore not based only on a future concept. The core workflow is already implemented and can be evaluated end to end.

### Long-term potential

With further testing and calibration, the same approach could support:

- Music-production education
- Guided mix revision for independent artists
- Comparison between two versions of a mix
- Section-by-section analysis
- Feedback tools for songwriting and production courses
- More accessible communication between artists and engineers
- Genre-aware interpretation
- Collaborative review between producers, vocalists, and clients

The broader opportunity is to make audio analysis more interpretable, emotionally relevant, and usable by people who do not naturally think in engineering measurements.
## What the Music Mix Analyzer does

The application guides the user through five main stages:

1. **Load a track**
   - Use the bundled sample mix for an immediate demonstration.
   - Or upload a personal WAV or MP3 file.

2. **Analyze the stereo mix locally**
   - Audio decoding and feature extraction happen in the browser.
   - The app measures characteristics related to tone, dynamics, stereo behavior, density, and translation.

3. **Present an overall mix identity**
   - The app summarizes the strongest perceived emotional tendencies.
   - These are framed as cautious interpretations, not objective truths about the song or performance.

4. **Connect interpretations to evidence**
   - Key findings include the measurement that contributed to each interpretation.
   - Numerical estimates represent relative tendencies, not mix-quality grades.

5. **Generate reversible next steps**
   - The app proposes focused A/B listening experiments.
   - Each experiment includes what to try, what to listen for, and a possible tradeoff.
   - Users can select a production intention and regenerate the reading around that goal without changing or inventing the underlying evidence.

The project intentionally separates:

- **Measured facts** derived from the audio
- **Limited inferences** reasonably connected to those measurements
- **Creative interpretations** that remain subjective and producer-led

## Fastest way to evaluate the project

The deployed application includes a bundled sample, so no external data or personal audio file is required.

1. Open the deployed application.
2. Select **Analyze sample mix**.
3. Review the overall emotional profile and three key findings.
4. Inspect the measurement connection shown for each interpretation.
5. Review the reversible listening experiments.
6. Choose a production intention such as **More open**.
7. Generate the intention-led reading.
8. Confirm that each recommendation remains connected to the measured evidence.

Users may also upload their own WAV or MP3 files. Uploaded audio follows the same browser-local analysis path as the bundled sample.

## Architecture and privacy

The deployable app lives in `artifacts/mix-analyzer`. Audio decoding and feature extraction run in the browser. Selected audio is held only in page memory: it is not uploaded to an API, written to a database, or permanently stored by the app. Refreshing or closing the page removes it.

The intention-led analysis sends only a bounded measurement ledger and the selected production intention to `/api/interpret`. `OPENAI_API_KEY` is read only inside the Vercel Function in `api/interpret.ts`; it is never exposed to Vite or the browser. If that function or key is unavailable, the app automatically uses deterministic local evidence rules.

The **Analyze sample mix** action loads a bundled 30-second excerpt of **“anche se ti sbagli...”** supplied by the project owner for this demo. The excerpt covers 1:05-1:35, preserves the source's 24-bit/48 kHz stereo PCM, and has SHA-256 `67885e89e929d21954ba9ea266968bcb20e2eebcaf5bc0431e77398ba7b4f98e`. It runs through the same browser-local analysis path as an upload; only the resulting bounded measurement ledger can be sent to `/api/interpret`.

## Requirements

- Node.js 20 or newer
- pnpm 10.32.1 (Corepack can install the pinned version)

No secret is required for the deterministic experience. `OPENAI_API_KEY` is required only for live GPT-5.6 interpretation. `OPENAI_INTERPRETATION_MODEL`, `PORT`, and `BASE_PATH` are optional; see `.env.example`.

## Local development

From the repository root:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @workspace/mix-analyzer dev
```

Open `http://localhost:5173`. Upload a WAV or MP3 to test browser-local analysis, or choose **Analyze sample mix** for a repeatable smoke test using the bundled excerpt. The measurement stage is deterministic and browser-local. The interpretation stage uses GPT-5.6 when `/api/interpret` and `OPENAI_API_KEY` are available, otherwise it uses the deterministic fallback.

Plain Vite development intentionally falls back to the local interpreter because it does not run the Vercel Function. To exercise `/api/interpret` locally, install/use the Vercel CLI, provide `OPENAI_API_KEY` in a local uncommitted environment file, and run `vercel dev` from the repository root.

## Automated checks

```sh
pnpm --filter @workspace/mix-analyzer run test
pnpm --filter @workspace/mix-analyzer run typecheck
pnpm --filter @workspace/mix-analyzer run build
```

The production verification command runs all three in sequence:

```sh
pnpm --filter @workspace/mix-analyzer run verify
```

## Production build

The production command declared in `vercel.json` is:

```sh
pnpm --filter @workspace/mix-analyzer run verify
```

The static output is written to `artifacts/mix-analyzer/dist/public`. To inspect it locally:

```sh
pnpm --filter @workspace/mix-analyzer serve
```

Then open `http://localhost:5173` and verify the upload path, demo analysis, emotional profile, and print report.

## Deploy with GitHub and Vercel

1. Push the repository to GitHub without committing `.env` files, generated output, or local audio. The root `.gitignore` covers these paths and common audio formats.
2. Import the GitHub repository into Vercel and leave the project root set to the repository root.
3. Vercel will use `vercel.json` to install with pnpm, test/typecheck/build `@workspace/mix-analyzer`, publish `artifacts/mix-analyzer/dist/public`, and expose `api/interpret.ts` as a server function.
4. For GPT-5.6 mode, add `OPENAI_API_KEY` in Vercel Project Settings -> Environment Variables for Preview and Production. Do not name it `VITE_OPENAI_API_KEY`.
5. The optional `OPENAI_INTERPRETATION_MODEL` defaults to `gpt-5.6`. Set `BASE_PATH` only if another host serves the app under a URL subpath.

After deployment, open the production URL and run **Analyze sample mix**. Choose a production intention, generate a grounded reading, and confirm that every claim shows evidence. The mode badge should say **GPT-5.6 structured** when the key is configured or **Deterministic fallback** when it is not. Also confirm audio playback and **Print report**.

## How GPT-5.5, GPT-5.6, and Codex were used

The project developed across multiple OpenAI tools and model generations. GPT-5.5, GPT-5.6, and Codex served different but complementary roles during development.

GPT-5.5 was used during much of the early product-development process, including concept exploration, interface critique, wording refinement, feature prioritization, and repeated evaluation of the deployed app.

GPT-5.6 was used later for deeper technical and product reasoning, judge-facing documentation, and the app’s optional structured intention-aware interpretation layer.

Codex worked directly with the repository to implement, refactor, test, debug, and deploy the application.

### Where GPT-5.5 contributed

GPT-5.5 supported the earlier design and iteration process by helping to:

- Develop the original concept of connecting mix measurements to perceived emotional tendencies
- Review screenshots and deployed versions of the app
- Identify areas where the dashboard was too dense or repetitive
- Refine the structure of the emotional profile and deep-reading cards
- Improve producer-facing explanations
- Develop the idea of reversible listening experiments
- Clarify how confidence, uncertainty, and subjectivity should be communicated
- Prepare prompts and implementation instructions for Codex
- Evaluate whether new features supported the central product idea

These conversations helped shape the product direction before and alongside the code-level implementation.
## How GPT-5.6 and Codex were used

GPT-5.6 and Codex served different roles during development.

The central idea, emotional-analysis direction, interface priorities, and product constraints were human-directed. AI accelerated implementation and helped refine how the app communicates technical and interpretive uncertainty.

### Where Codex accelerated the workflow

Codex was used directly against the codebase to:

- Inspect the existing repository and application structure
- Build and revise React components
- Implement the browser-local upload and sample-analysis flows
- Connect extracted measurements to the dashboard
- Create reusable findings and experiment cards
- Implement the intention-selection interface
- Add the `/api/interpret` Vercel Function
- Validate and constrain the measurement payload
- Build the deterministic fallback path
- Improve responsive layout and visual hierarchy
- Diagnose type, build, runtime, and deployment issues
- Add automated tests, type checking, verification commands, and deployment configuration
- Audit API-key handling and prevent secrets from entering the browser bundle

Codex made it possible to move quickly from a specific product observation to a working implementation. A typical cycle involved identifying a problem in the live app, describing the intended behavior and constraints, asking Codex to inspect the relevant files, reviewing the resulting diff, testing it locally or in deployment, and then refining or rejecting the change.

### Where GPT-5.6 was used in the product

GPT-5.6 powers the optional intention-aware interpretation layer.

The model does not receive the uploaded audio. It receives only:

- A bounded ledger of measurements extracted locally in the browser
- The production intention selected by the user
- Structural instructions that constrain the form of the response

GPT-5.6 is used to organize those measurements into:

- A measured overall reading
- Evidence-linked interpretations
- Reversible listening experiments
- Expected perceptual effects
- Creative tradeoffs
- Guidance aligned with the selected production intention

The server requests structured output so the frontend can render the reading consistently. If GPT-5.6 or the server function is unavailable, the deterministic local interpreter preserves the main experience.

### Where GPT-5.6 supported the design process

GPT-5.6 was also used as a reasoning and communication partner while shaping the product. It helped:

- Clarify the distinction between measurements, inferences, and creative interpretations
- Identify language that sounded too authoritative
- Refine uncertainty and confidence labels
- Translate technical evidence into understandable producer-facing language
- Develop the reversible A/B experiment format
- Reduce information overload in earlier dashboard versions
- Refine the judge-facing explanation of the app

### Key human decisions

The most important design choices were made by the project owner, including:

- Framing the output as an emotional map rather than a quality score
- Avoiding claims that mix measurements can objectively determine emotion
- Keeping uploaded audio local to the browser
- Sending only a bounded measurement ledger to GPT-5.6
- Requiring major interpretations to show their measurement connection
- Labeling numerical values as estimates rather than grades
- Presenting recommendations as reversible experiments rather than corrections
- Including tradeoffs so that no change is presented as universally beneficial
- Allowing the producer’s intention to guide the analysis
- Providing a deterministic fallback when AI interpretation is unavailable
- Including an original sample mix so the complete workflow can be evaluated immediately

### Example of a human-directed AI iteration

An earlier direction risked making emotional outputs resemble objective scores. The product decision was made to reposition the results as:

> An emotional map, not a scoreboard.

GPT-5.6 helped refine the conceptual and explanatory language. Codex then helped implement the corresponding interface changes, confidence framing, evidence labels, and reusable components.

The final implementation therefore reflects a combination of human product direction, GPT-5.6 reasoning and interpretation, and Codex-assisted engineering.

## Security notes

The frontend contains no API keys, tokens, or database credentials. Any variable prefixed with `VITE_` is embedded in the browser bundle and must be treated as public; never place `OPENAI_API_KEY` or another secret in a `VITE_` variable. The server function disables response caching, requests no OpenAI response storage, validates the measurement payload, and returns no provider error body or secret.

See `BASELINE.md` for the pre-Build Week audit and `BUILD_WEEK_PLAN.md` for the implementation roadmap.
