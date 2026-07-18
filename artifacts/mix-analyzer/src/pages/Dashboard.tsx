import { useState, useCallback } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AudioPlayer } from "@/components/AudioPlayer";
import { WaveformDisplay } from "@/components/WaveformDisplay";
import { SpectrumDisplay } from "@/components/SpectrumDisplay";
import { StereoWidthDisplay } from "@/components/StereoWidthDisplay";
import { DynamicsDisplay } from "@/components/DynamicsDisplay";
import { SummaryCards } from "@/components/SummaryCards";
import { IntentionAnalysis } from "@/components/IntentionAnalysis";
import { analyzeMix, type MixAnalysis } from "@/analysis";
import { createDemoMixFile } from "@/demoAudio";

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

  const handleDemo = useCallback(() => {
    void handleFile(createDemoMixFile());
  }, [handleFile]);

  const printReport = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen print:bg-white" style={{ background: "radial-gradient(ellipse 100% 52% at 50% -8%, hsl(36 62% 93%) 0%, hsl(42 28% 97%) 56%, hsl(38 18% 95%) 100%)" }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b border-stone-200/60 print:static print:border-b-0 print:backdrop-blur-none" style={{ background: "hsl(42 28% 97% / 0.9)" }}>
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
          <div className="flex shrink-0 items-center gap-2 print:hidden">
            {analysis && (
              <button
                onClick={printReport}
                className="whitespace-nowrap text-xs font-medium text-stone-700 transition-colors px-3 py-1.5 rounded-lg bg-white/80 border border-stone-200 hover:border-stone-300 hover:text-stone-900 hover:bg-white"
              >
                Print report
              </button>
            )}
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5 print:max-w-none print:px-0 print:py-4">
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
            <div className="print:hidden">
              <FileUpload onFile={handleFile} isAnalyzing={isAnalyzing} />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            )}

            {file && !isAnalyzing && !error && (
              <div className="print:hidden">
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
              <div className="print-report space-y-5">
                <div className="hidden print:block print:mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">Mix Analyzer Report</p>
                  <h2 className="mt-1 text-2xl font-semibold text-stone-900">{file?.name ?? "Mix analysis"}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Emotional mix analysis based on interpretable stereo-audio evidence. Printed views preserve the structure of the emotional profile, evidence, and action steps.
                  </p>
                </div>

                <div className="print:break-inside-avoid print-page-card">
                  <WaveformDisplay data={analysis.waveform} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
                  <div className="print:break-inside-avoid print-page-card">
                    <SpectrumDisplay data={analysis.spectrum} />
                  </div>
                  <div className="print:break-inside-avoid print-page-card">
                    <StereoWidthDisplay data={analysis.stereo} />
                  </div>
                </div>

                <div className="print:break-inside-avoid print-page-card">
                  <DynamicsDisplay data={analysis.dynamics} />
                </div>

                <IntentionAnalysis
                  key={`${file?.name ?? "mix"}-${file?.size ?? 0}`}
                  ledger={analysis.measurementLedger}
                />

                <div>
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Emotional Analysis</p>
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
