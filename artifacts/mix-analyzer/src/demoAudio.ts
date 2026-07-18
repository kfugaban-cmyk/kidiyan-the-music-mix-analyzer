export const DEMO_TRACK = {
  title: "anche se ti sbagli...",
  fileName: "anche se ti sbagli... - demo excerpt.wav",
  excerpt: "1:05-1:35",
  assetPath: "demo/anche-se-ti-sbagli-demo.wav",
} as const;

/** Loads the bundled, project-owner-provided excerpt into the same File path as an upload. */
export async function loadDemoMixFile(): Promise<File> {
  const response = await fetch(`${import.meta.env.BASE_URL}${DEMO_TRACK.assetPath}`, {
    cache: "force-cache",
  });
  if (!response.ok) throw new Error(`Demo mix request failed with ${response.status}.`);

  const audio = await response.blob();
  return new File([audio], DEMO_TRACK.fileName, { type: "audio/wav" });
}
