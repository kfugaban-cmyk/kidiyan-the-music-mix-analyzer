import { useState, useCallback } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AudioPlayer } from "@/components/AudioPlayer";
import { WaveformDisplay } from "@/components/WaveformDisplay";
import { SpectrumDisplay } from "@/components/SpectrumDisplay";
import { StereoWidthDisplay } from "@/components/StereoWidthDisplay";
import { DynamicsDisplay } from "@/components/DynamicsDisplay";
import { SummaryCards } from "@/components/SummaryCards";
import { analyzeMix, type MixAnalysis } from "@/analysis";

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

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 110% 45% at 50% -2%, hsl(263 35% 95%) 0%, hsl(36 20% 97%) 60%)" }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b border-stone-100/80" style={{ background: "hsl(36 20% 97% / 0.85)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center shadow-sm shadow-violet-200">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7 Q3 3 5 7 Q7 11 9 7 Q11 3 13 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-stone-800 tracking-tight">Mix Analyzer</h1>
              <p className="text-[10px] text-stone-400 tracking-wide">Mix character · not just levels</p>
            </div>
          </div>
          {file && (
            <button
              onClick={reset}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
            >
              New file
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {!file ? (
          <div className="space-y-6">
            <div className="text-center pt-10 pb-4">
              <h2 className="text-3xl font-semibold text-stone-800 tracking-tight leading-tight">
                How does your mix feel?
              </h2>
              <p className="text-sm text-stone-400 mt-3 max-w-xs mx-auto leading-relaxed">
                Upload a stereo mix — get a snapshot of its character, not just its levels.
              </p>
            </div>
            <FileUpload onFile={handleFile} isAnalyzing={isAnalyzing} />
          </div>
        ) : (
          <>
            <FileUpload onFile={handleFile} isAnalyzing={isAnalyzing} />

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                <p className="text-sm text-rose-600">{error}</p>
              </div>
            )}

            {file && !isAnalyzing && !error && (
              <AudioPlayer file={file} />
            )}

            {isAnalyzing && (
              <div className="space-y-3">
                {[120, 100, 100, 100].map((h, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 animate-pulse" style={{ height: h }} />
                ))}
              </div>
            )}

            {analysis && (
              <>
                <WaveformDisplay data={analysis.waveform} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SpectrumDisplay data={analysis.spectrum} />
                  <StereoWidthDisplay data={analysis.stereo} />
                </div>

                <DynamicsDisplay data={analysis.dynamics} />

                <div>
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">Summary</p>
                    <div className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent" />
                  </div>
                  <SummaryCards analysis={analysis} />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
