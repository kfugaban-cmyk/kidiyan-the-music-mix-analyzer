import { createDeterministicInterpretation } from "./deterministicInterpreter";
import type {
  GroundedClaim,
  GroundedInterpretation,
  GroundedInterpretationContent,
  MeasurementLedger,
  ProductionIntentionKey,
} from "./types";

function isClaim(value: unknown, evidenceIds: Set<string>): value is GroundedClaim {
  if (!value || typeof value !== "object") return false;
  const claim = value as Partial<GroundedClaim>;
  const experiment = claim.experiment;
  return (
    (claim.category === "limited_inference" || claim.category === "creative_interpretation") &&
    typeof claim.title === "string" &&
    typeof claim.statement === "string" &&
    (claim.confidence === "low" || claim.confidence === "medium" || claim.confidence === "high") &&
    Array.isArray(claim.evidenceIds) &&
    claim.evidenceIds.length > 0 &&
    claim.evidenceIds.every((id) => typeof id === "string" && evidenceIds.has(id)) &&
    Boolean(experiment) &&
    typeof experiment?.action === "string" &&
    typeof experiment.listenFor === "string" &&
    typeof experiment.tradeoff === "string"
  );
}

export function validateInterpretationContent(
  value: unknown,
  ledger: MeasurementLedger
): value is GroundedInterpretationContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Partial<GroundedInterpretationContent>;
  const evidenceIds = new Set(ledger.facts.map((fact) => fact.id));
  return (
    typeof content.headline === "string" &&
    typeof content.relationshipToIntention === "string" &&
    Array.isArray(content.claims) &&
    content.claims.length >= 2 &&
    content.claims.length <= 4 &&
    content.claims.every((claim) => isClaim(claim, evidenceIds))
  );
}

export async function requestGroundedInterpretation(
  ledger: MeasurementLedger,
  intention: ProductionIntentionKey
): Promise<GroundedInterpretation> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intention, ledger }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "The secure interpretation endpoint is unavailable in this local preview."
          : response.status === 503
            ? "The secure GPT-5.6 service is not configured on this deployment."
            : `The secure interpretation service returned ${response.status}.`
      );
    }

    const payload = await response.json() as {
      content?: unknown;
      model?: unknown;
    };
    if (!validateInterpretationContent(payload.content, ledger)) {
      throw new Error("The model response did not satisfy the evidence contract.");
    }

    return {
      ...payload.content,
      intention,
      mode: "gpt-5.6",
      model: typeof payload.model === "string" ? payload.model : "gpt-5.6",
    };
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError"
      ? "The secure GPT-5.6 request timed out."
      : error instanceof Error
        ? error.message
        : "The secure GPT-5.6 service was unavailable.";
    return createDeterministicInterpretation(ledger, intention, reason);
  } finally {
    window.clearTimeout(timeout);
  }
}
