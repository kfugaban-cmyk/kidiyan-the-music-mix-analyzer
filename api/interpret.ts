/// <reference lib="dom" />

declare const process: { env: Record<string, string | undefined> };

const INTENTIONS = new Set([
  "closer_exposure",
  "weight_grounding",
  "openness_lift",
  "urgency_impact",
  "contrast_drama",
]);

type SafeFact = {
  id: string;
  label: string;
  value: number;
  unit: string;
  displayValue: string;
  scope: "whole_mix" | "time_region";
  method: string;
  limitation: string;
};

type SafeRequest = {
  intention: string;
  ledger: {
    version: 1;
    durationSeconds: number;
    sampleRateHz: number;
    channelCount: number;
    facts: SafeFact[];
    caveats: string[];
  };
};

const FACT_DEFINITIONS: Record<string, Omit<SafeFact, "value" | "displayValue">> = {
  "level.rms_dbfs": { id: "level.rms_dbfs", label: "RMS level", unit: "dBFS", scope: "whole_mix", method: "Root mean square of the decoded mono fold-down.", limitation: "Unweighted level; this is not LUFS." },
  "level.sample_peak_dbfs": { id: "level.sample_peak_dbfs", label: "Sample peak", unit: "dBFS", scope: "whole_mix", method: "Largest decoded sample in the mono fold-down.", limitation: "Sample peak only; inter-sample true peak is not measured." },
  "dynamics.crest_db": { id: "dynamics.crest_db", label: "Crest factor", unit: "dB", scope: "whole_mix", method: "Difference between sample peak and RMS level.", limitation: "A global crest factor cannot identify compressor settings." },
  "dynamics.frame_range_db": { id: "dynamics.frame_range_db", label: "Frame level range", unit: "dB", scope: "whole_mix", method: "90th minus 10th percentile of short-frame RMS levels.", limitation: "Describes level spread, not a standards-based dynamic-range score." },
  "spectrum.centroid_hz": { id: "spectrum.centroid_hz", label: "Spectral centroid", unit: "Hz", scope: "whole_mix", method: "Power-weighted center frequency across sampled 4,096-point FFT frames.", limitation: "A broad brightness descriptor; it does not locate a specific instrument." },
  "spectrum.low_body_share_pct": { id: "spectrum.low_body_share_pct", label: "Low-body amplitude share", unit: "%", scope: "whole_mix", method: "Average relative FFT-band amplitude from 80-500 Hz.", limitation: "Band result depends on the fixed windows and is not perceived loudness." },
  "spectrum.presence_share_pct": { id: "spectrum.presence_share_pct", label: "Presence amplitude share", unit: "%", scope: "whole_mix", method: "Average relative FFT-band amplitude from 500 Hz-5 kHz.", limitation: "Cannot determine whether this energy is vocal, percussion, or another source." },
  "spectrum.air_share_pct": { id: "spectrum.air_share_pct", label: "Air amplitude share", unit: "%", scope: "whole_mix", method: "Average relative FFT-band amplitude from 10-18 kHz.", limitation: "Codec and sample-rate bandwidth can materially affect this value." },
  "stereo.side_share_pct": { id: "stereo.side_share_pct", label: "Side amplitude share", unit: "%", scope: "whole_mix", method: "Side RMS divided by combined mid-plus-side RMS.", limitation: "Width amount alone does not indicate whether the side signal is beneficial." },
  "stereo.lr_correlation": { id: "stereo.lr_correlation", label: "L/R correlation", unit: "", scope: "whole_mix", method: "Normalized sample correlation between decoded left and right channels.", limitation: "A whole-mix average can hide short phase problems." },
  "stereo.mono_delta_db": { id: "stereo.mono_delta_db", label: "Mono fold-down delta", unit: "dB", scope: "whole_mix", method: "Mono mid RMS compared with average channel RMS.", limitation: "A level delta does not describe all tonal changes after fold-down." },
  "regions.level_spread_db": { id: "regions.level_spread_db", label: "Third-to-third level spread", unit: "dB", scope: "whole_mix", method: "Difference between the loudest and quietest equal-duration thirds.", limitation: "These are time regions, not detected musical sections." },
  "region.opening.rms_dbfs": { id: "region.opening.rms_dbfs", label: "Opening third RMS", unit: "dBFS", scope: "time_region", method: "RMS level in the opening equal-duration third.", limitation: "The boundary may not align with the arrangement." },
  "region.middle.rms_dbfs": { id: "region.middle.rms_dbfs", label: "Middle third RMS", unit: "dBFS", scope: "time_region", method: "RMS level in the middle equal-duration third.", limitation: "The boundary may not align with the arrangement." },
  "region.ending.rms_dbfs": { id: "region.ending.rms_dbfs", label: "Ending third RMS", unit: "dBFS", scope: "time_region", method: "RMS level in the ending equal-duration third.", limitation: "The boundary may not align with the arrangement." },
};

const EXPECTED_FACT_IDS = Object.keys(FACT_DEFINITIONS);

const interpretationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "relationshipToIntention", "claims"],
  properties: {
    headline: { type: "string" },
    relationshipToIntention: { type: "string" },
    claims: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["category", "title", "statement", "confidence", "evidenceIds", "experiment"],
        properties: {
          category: { type: "string", enum: ["limited_inference", "creative_interpretation"] },
          title: { type: "string" },
          statement: { type: "string" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          evidenceIds: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: { type: "string" },
          },
          experiment: {
            type: "object",
            additionalProperties: false,
            required: ["action", "listenFor", "tradeoff"],
            properties: {
              action: { type: "string" },
              listenFor: { type: "string" },
              tradeoff: { type: "string" },
            },
          },
        },
      },
    },
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function displayValue(value: number, unit: string): string {
  if (unit === "%") return `${value}%`;
  return unit ? `${value} ${unit}` : String(value);
}

export function sanitizeRequest(value: unknown): SafeRequest | null {
  if (!value || typeof value !== "object") return null;
  const request = value as Record<string, unknown>;
  if (typeof request.intention !== "string" || !INTENTIONS.has(request.intention)) return null;
  if (!request.ledger || typeof request.ledger !== "object") return null;
  const ledger = request.ledger as Record<string, unknown>;
  if (ledger.version !== 1 || !Array.isArray(ledger.facts) || ledger.facts.length !== EXPECTED_FACT_IDS.length) return null;

  const facts: SafeFact[] = [];
  const seenIds = new Set<string>();
  for (const rawFact of ledger.facts) {
    if (!rawFact || typeof rawFact !== "object") return null;
    const fact = rawFact as Record<string, unknown>;
    if (typeof fact.id !== "string" || !FACT_DEFINITIONS[fact.id] || seenIds.has(fact.id) || !Number.isFinite(fact.value)) return null;
    const value = fact.value as number;
    if (value < -200 || value > 400_000) return null;
    const definition = FACT_DEFINITIONS[fact.id];
    seenIds.add(fact.id);
    facts.push({ ...definition, value, displayValue: displayValue(value, definition.unit) });
  }
  if (EXPECTED_FACT_IDS.some((id) => !seenIds.has(id))) return null;

  const durationSeconds = Number(ledger.durationSeconds);
  const sampleRateHz = Number(ledger.sampleRateHz);
  const channelCount = Number(ledger.channelCount);
  if (
    !Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 14_400 ||
    !Number.isFinite(sampleRateHz) || sampleRateHz < 8_000 || sampleRateHz > 384_000 ||
    !Number.isInteger(channelCount) || channelCount < 1 || channelCount > 8
  ) return null;

  return {
    intention: request.intention,
    ledger: {
      version: 1,
      durationSeconds,
      sampleRateHz,
      channelCount,
      facts,
      caveats: [
        "No source separation is used; source-specific claims are unsupported.",
        "Equal-duration regions are not detected musical sections.",
        ...(channelCount < 2 ? ["Stereo evidence is limited because the decoded source is mono."] : []),
        ...(durationSeconds < 15 ? ["Short excerpts reduce confidence in broad-region contrast."] : []),
      ],
    },
  };
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return null;

  for (const item of response.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && (part as { type?: unknown }).type === "output_text" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 75_000) return json({ error: "Request body is too large." }, 413);
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) return json({ error: "Cross-origin request rejected." }, 403);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: "Secure interpretation is not configured." }, 503);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const safeRequest = sanitizeRequest(payload);
  if (!safeRequest) return json({ error: "Invalid measurement request." }, 400);

  const model = process.env.OPENAI_INTERPRETATION_MODEL || "gpt-5.6";
  const evidenceIds = safeRequest.ledger.facts.map((fact) => fact.id);
  const instructions = [
    "You are a serious mix engineer interpreting measured stereo-audio evidence for a stated production intention.",
    "Use only facts supplied in the measurement ledger. Never infer a vocal, instrument, genre, performance emotion, reverb setting, compressor setting, or production process that was not measured.",
    "Clearly distinguish limited technical inference from subjective creative interpretation.",
    "Every claim must cite one or more supplied evidence IDs. Never invent an evidence ID.",
    "Frame changes as reversible, level-matched listening experiments rather than universal prescriptions.",
    "Use precise producer language and acknowledge ambiguity. Do not use therapy language or mystical claims.",
  ].join(" ");

  const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 2_500,
      reasoning: { effort: "low" },
      input: [
        { role: "developer", content: [{ type: "input_text", text: instructions }] },
        {
          role: "user",
          content: [{
            type: "input_text",
            text: JSON.stringify({
              productionIntention: safeRequest.intention,
              allowedEvidenceIds: evidenceIds,
              measurementLedger: safeRequest.ledger,
            }),
          }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "grounded_mix_interpretation",
          strict: true,
          schema: interpretationSchema,
        },
      },
    }),
  });

  if (!openAIResponse.ok) {
    return json({ error: "OpenAI interpretation request failed." }, 502);
  }

  const openAIPayload = await openAIResponse.json();
  const outputText = extractOutputText(openAIPayload);
  if (!outputText) return json({ error: "OpenAI returned no structured interpretation." }, 502);

  let content: unknown;
  try {
    content = JSON.parse(outputText);
  } catch {
    return json({ error: "OpenAI returned invalid structured output." }, 502);
  }

  const citedIds = JSON.stringify(content).match(/[a-z]+(?:[._-][a-z0-9]+)+/g) ?? [];
  if (citedIds.some((id) => id.includes(".") && !evidenceIds.includes(id))) {
    return json({ error: "OpenAI cited evidence outside the supplied ledger." }, 502);
  }

  return json({ content, model });
}
