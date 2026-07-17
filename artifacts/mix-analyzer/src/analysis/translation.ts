import type { TranslationRiskData, SpectrumData, StereoWidthData, DynamicsData } from "./types";

export function analyzeTranslationRisk(
  spectrum: SpectrumData,
  stereo: StereoWidthData,
  dynamics: DynamicsData
): TranslationRiskData {
  let phoneNote: string;
  let phoneIssue = false;
  if (spectrum.sub > 58) {
    phoneNote = `Phone speakers: sub is at ${spectrum.sub}% and may disappear on small drivers, so perceived weight could collapse.`;
    phoneIssue = true;
  } else if (spectrum.high > 65) {
    phoneNote = `Phone speakers: high end is at ${spectrum.high}%, so a bright upper range may feel harder or thinner than intended.`;
    phoneIssue = true;
  } else if (spectrum.mid < 28 && spectrum.sub > 40) {
    phoneNote = `Phone speakers: mids are only ${spectrum.mid}% while sub sits at ${spectrum.sub}%, so once bass disappears the focal content may recede.`;
    phoneIssue = true;
  } else {
    phoneNote = `Phone speakers: mids at ${spectrum.mid}% should help the core material survive small-speaker playback.`;
  }

  let headphoneNote: string;
  let headphoneIssue = false;
  if (stereo.widthScore > 72) {
    headphoneNote = `Headphones: width scores ${stereo.widthScore}/100, so the image may feel impressively open but slightly exaggerated at close range.`;
    headphoneIssue = true;
  } else if (stereo.widthScore < 12) {
    headphoneNote = `Headphones: width is only ${stereo.widthScore}/100, so the image may feel flatter than the emotional profile suggests.`;
    headphoneIssue = true;
  } else if (spectrum.high > 65) {
    headphoneNote = `Headphones: high energy at ${spectrum.high}% will expose upper-band fatigue more clearly than speakers might.`;
    headphoneIssue = true;
  } else {
    headphoneNote = `Headphones: width and top-end both sit in a manageable range for close listening.`;
  }

  let carNote: string;
  let carIssue = false;
  if (spectrum.sub > 65) {
    carNote = `Car playback: sub sits at ${spectrum.sub}% and could build into boom inside resonant cabins.`;
    carIssue = true;
  } else if (dynamics.crestFactor > 16) {
    carNote = `Car playback: crest factor is ${dynamics.crestFactor} dB, so quieter detail may get swallowed by road noise.`;
    carIssue = true;
  } else if (spectrum.sub < 18 && spectrum.lowMid < 28) {
    carNote = `Car playback: both sub (${spectrum.sub}%) and low-mids (${spectrum.lowMid}%) are light, so the mix may feel thin even on bass-friendly systems.`;
    carIssue = true;
  } else {
    carNote = `Car playback: low-end balance and dynamic consistency look fairly manageable for noisy environments.`;
  }

  const details = [phoneNote, headphoneNote, carNote];
  const issueCount = [phoneIssue, headphoneIssue, carIssue].filter(Boolean).length;
  const risk: TranslationRiskData["risk"] = issueCount === 0 ? "low" : issueCount === 1 ? "medium" : "high";

  let label: TranslationRiskData["label"];
  if (issueCount === 0) label = "translates well";
  else if (phoneIssue && (spectrum.sub > 58 || (spectrum.sub < 18 && spectrum.lowMid < 28))) label = issueCount > 1 ? "multiple risks" : "low-end risk";
  else if (headphoneIssue && (stereo.widthScore > 72 || stereo.widthScore < 12)) label = issueCount > 1 ? "multiple risks" : "stereo risk";
  else if (headphoneIssue && spectrum.high > 65) label = issueCount > 1 ? "multiple risks" : "harshness risk";
  else label = issueCount > 1 ? "multiple risks" : "translates well";

  return { label, risk, details };
}
