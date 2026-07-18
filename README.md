# Mix Analyzer Dashboard

A React/Vite application that analyzes stereo audio locally and presents interpretable mix, dynamics, translation, and perceived-emotional-tendency feedback. An optional Vercel Function can turn measured values into a structured, intention-aware GPT-5.6 reading without uploading the audio.

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

Open `http://localhost:5173`. Upload a WAV or MP3 to test browser-local analysis, or choose **Analyze sample mix** for a deterministic smoke test using the bundled excerpt.

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

## Security notes

The frontend contains no API keys, tokens, or database credentials. Any variable prefixed with `VITE_` is embedded in the browser bundle and must be treated as public; never place `OPENAI_API_KEY` or another secret in a `VITE_` variable. The server function disables response caching, requests no OpenAI response storage, validates the measurement payload, and returns no provider error body or secret.

See `BASELINE.md` for the pre-Build Week audit and `BUILD_WEEK_PLAN.md` for the implementation roadmap.
