import type { EmotionalReadData, TranslationRiskData, SpectrumData, StereoWidthData, DynamicsData } from "./types";

export function analyzeEmotionalRead(
  spectrum: SpectrumData,
  stereo: StereoWidthData,
  dynamics: DynamicsData
): EmotionalReadData {
  const intimacyValue = 100 - stereo.widthScore * 0.6 - (100 - dynamics.score) * 0.4;
  const textureValue = 100 - spectrum.high - dynamics.score * 0.3;
  const brightnessValue = spectrum.high;
  const widthValue = stereo.widthScore;

  return {
    intimacy: {
      value: Math.max(0, Math.min(100, Math.round(intimacyValue))),
      label: intimacyValue > 50 ? "intimate" : "distant",
    },
    texture: {
      value: Math.max(0, Math.min(100, Math.round(textureValue))),
      label: textureValue > 50 ? "soft" : "sharp",
    },
    brightness: {
      value: Math.max(0, Math.min(100, Math.round(brightnessValue))),
      label: brightnessValue > 45 ? "bright" : "dark",
    },
    width: {
      value: Math.max(0, Math.min(100, Math.round(widthValue))),
      label: widthValue > 35 ? "wide" : "narrow",
    },
  };
}

export function analyzeTranslationRisk(
  spectrum: SpectrumData,
  stereo: StereoWidthData,
  dynamics: DynamicsData
): TranslationRiskData {
  const risks: string[] = [];

  if (spectrum.sub > 70) risks.push("Heavy sub-bass may not translate on small speakers");
  if (stereo.widthScore < 10) risks.push("Very narrow stereo field — check mono compatibility");
  if (stereo.widthScore > 80) risks.push("Extreme stereo width may collapse in mono");
  if (spectrum.high > 75) risks.push("Harsh high-frequency content may cause listener fatigue");
  if (dynamics.crestFactor < 6) risks.push("Heavy limiting — little dynamic headroom remaining");

  let label: TranslationRiskData["label"];
  let risk: TranslationRiskData["risk"];

  if (risks.length === 0) {
    label = "mono-safe";
    risk = "low";
  } else if (risks.length === 1) {
    if (risks[0].includes("sub-bass")) label = "low-end risk";
    else if (risks[0].includes("stereo") || risks[0].includes("narrow")) label = "stereo risk";
    else label = "harshness risk";
    risk = "medium";
  } else {
    label = "multiple risks";
    risk = "high";
    if (!risks.some(r => r.includes("sub"))) {
      risks.unshift("Check low-end translation on consumer speakers");
    }
  }

  if (risks.length === 0) {
    risks.push("Mix looks safe across formats");
  }

  return { label, risk, details: risks };
}
