# Mix Analyzer Dashboard

A frontend-only React/Vite application that analyzes stereo audio and presents interpretable mix, dynamics, translation, and perceived-emotional-tendency feedback.

## Architecture and privacy

The deployable app lives in `artifacts/mix-analyzer`. Audio decoding, feature extraction, scoring, and report generation all run in the browser. Selected audio is held only in page memory: it is not uploaded to an API, written to a database, or permanently stored by the app. Refreshing or closing the page removes it.

The **Analyze demo mix** action creates a short, original PCM WAV from deterministic synthesis code in `src/demoAudio.ts`. It is rights-cleared for this project, produces the same input on every run, and does not require a downloaded or copyrighted recording.

## Requirements

- Node.js 20 or newer
- pnpm 10.32.1 (Corepack can install the pinned version)

No secrets or environment variables are required. `PORT` and `BASE_PATH` are optional; see `.env.example`.

## Local development

From the repository root:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @workspace/mix-analyzer dev
```

Open `http://localhost:5173`. Upload a WAV or MP3 to test browser-local analysis, or choose **Analyze demo mix** for a deterministic smoke test.

## Production build

The production command used by Vercel is:

```sh
pnpm --filter @workspace/mix-analyzer run build
```

The static output is written to `artifacts/mix-analyzer/dist/public`. To inspect it locally:

```sh
pnpm --filter @workspace/mix-analyzer serve
```

Then open `http://localhost:5173` and verify the upload path, demo analysis, emotional profile, and print report.

## Deploy with GitHub and Vercel

1. Push the repository to GitHub without committing `.env` files, generated output, or local audio. The root `.gitignore` covers these paths and common audio formats.
2. Import the GitHub repository into Vercel and leave the project root set to the repository root.
3. Vercel will use `vercel.json` to install with pnpm, build `@workspace/mix-analyzer`, and publish `artifacts/mix-analyzer/dist/public`.
4. Do not add environment variables for the standard root-domain deployment. Set `BASE_PATH` only if another host serves the app under a URL subpath.

After deployment, open the production URL and run **Analyze demo mix**. Confirm that the report renders, audio playback works, and **Print report** preserves the report cards and visualizations in print preview.

## Security notes

The frontend contains no API keys, tokens, database credentials, or required secret variables. Any future variable prefixed with `VITE_` will be embedded in the browser bundle and must be treated as public; never place a secret in a `VITE_` variable.
