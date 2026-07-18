import { useState, useCallback } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AudioPlayer } from "@/components/AudioPlayer";
import { SummaryCards } from "@/components/SummaryCards";
import { analyzeMix, type MixAnalysis } from "@/analysis";
import { loadDemoMixFile } from "@/demoAudio";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<MixAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const { analysis: result } = await analyzeMix(f);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError("Failed to analyze the audio file. Make sure it's a valid WAV or MP3.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
  };

  const handleDemo = useCallback(async () => {
    setError(null);
    setIsAnalyzing(true);
    try {
      await handleFile(await loadDemoMixFile());
    } catch (demoError) {
      console.error(demoError);
      setError("The bundled sample mix could not be loaded. Please try again.");
      setIsAnalyzing(false);
    }
  }, [handleFile]);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 100% 52% at 50% -8%, hsl(36 62% 93%) 0%, hsl(42 28% 97%) 56%, hsl(38 18% 95%) 100%)" }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b border-stone-200/60" style={{ background: "hsl(42 28% 97% / 0.9)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, hsl(20 68% 48%) 0%, hsl(35 82% 58%) 100%)", boxShadow: "0 8px 18px rgba(180, 94, 27, 0.22)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7 Q3 3 5 7 Q7 11 9 7 Q11 3 13 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-900 tracking-tight">Mix Analyzer</h1>
              <p className="hidden text-[10px] text-stone-500 tracking-wide sm:block">Emotional impact through interpretable mix evidence</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {file && (
              <button
                onClick={reset}
                className="whitespace-nowrap text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
              >
                New file
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {!file ? (
          <div className="space-y-6">
            <div className="text-center pt-10 pb-4">
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight leading-tight">
                How does your mix feel, and why?
              </h2>
              <p className="text-sm text-stone-500 mt-3 max-w-md mx-auto leading-relaxed">
                Upload a stereo mix to estimate perceived emotional tendencies from density, depth, dynamics, spectral balance, and spatial cues, then turn that read into concrete mix moves.
              </p>
            </div>
            <FileUpload onFile={handleFile} onDemo={handleDemo} isAnalyzing={isAnalyzing} />
          </div>
        ) : (
          <>
            <div>
              <FileUpload onFile={handleFile} isAnalyzing={isAnalyzing} />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            )}

            {file && !isAnalyzing && !error && (
              <div>
                <AudioPlayer file={file} />
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-3">
                {[120, 100, 100, 100].map((h, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 animate-pulse" style={{ height: h }} />
                ))}
              </div>
            )}

            {analysis && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Judge-facing mix analysis</p>
                    <div className="flex-1 h-px bg-gradient-to-r from-stone-300 to-transparent" />
                  </div>
                  <SummaryCards analysis={analysis} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
