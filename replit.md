# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Mix Analyzer (`artifacts/mix-analyzer`)

A browser-based audio mix analysis dashboard for music producers. **Frontend-only — no backend.**

**Features (v1):**
- Upload WAV or MP3 files via drag-and-drop
- In-browser audio playback
- Waveform visualization (peak amplitude over time)
- Tonal balance overview (sub / low-mid / mid / high band energy)
- Stereo width analysis (mid/side ratio)
- Dynamic contrast (crest factor / RMS)
- 4 summary cards: Tonal Balance, Dynamic Feel, Translation Risk, Emotional Read
- Emotional Read: heuristic label pairs (intimate/distant, soft/sharp, dark/bright, narrow/wide)

**Analysis logic lives in `src/analysis/`** — each file is isolated so scoring rules can be tweaked independently:
- `waveform.ts` — peak amplitude downsampling
- `spectrum.ts` — FFT-based band energy (uses Web Audio API)
- `stereoWidth.ts` — mid/side energy ratio
- `dynamics.ts` — crest factor + RMS/peak dB
- `emotionalRead.ts` — heuristic label mapping + translation risk

**Tech:** React + Vite, Tailwind CSS, Web Audio API, browser-only (no server calls)
**Preview path:** `/`
