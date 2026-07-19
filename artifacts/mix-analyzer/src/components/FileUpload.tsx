import { useCallback, useState } from "react";
import { ArrowRight, Upload, Music, Play } from "lucide-react";
import { DEMO_TRACK } from "@/demoAudio";

interface Props {
  onFile: (file: File) => void;
  onDemo?: () => void;
  isAnalyzing: boolean;
}

export function FileUpload({ onFile, onDemo, isAnalyzing }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/audio\/(wav|mpeg|mp3|x-wav|wave)/)) {
        alert("Please upload a WAV or MP3 file.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      {onDemo && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={onDemo}
            disabled={isAnalyzing}
            className="group relative w-full overflow-hidden rounded-[28px] border border-stone-800 bg-stone-950 px-5 py-5 text-left text-white shadow-[0_22px_55px_rgba(39,30,20,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/70 hover:shadow-[0_28px_65px_rgba(39,30,20,0.28)] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 sm:px-7 sm:py-6"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(245,158,11,0.22)_0%,rgba(245,158,11,0)_35%),linear-gradient(115deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_55%)]" />
            <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-amber-300/10" />
            <div className="pointer-events-none absolute -right-5 -top-12 h-36 w-36 rounded-full border border-amber-300/10" />

            <div className="relative flex items-center gap-4 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f6b954_0%,#d86f2c_100%)] text-stone-950 shadow-[0_10px_28px_rgba(224,127,45,0.35)] transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16">
                {isAnalyzing
                  ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-950 border-t-transparent" />
                  : <Play className="h-6 w-6 fill-current sm:h-7 sm:w-7" />
                }
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">Recommended for judges</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {isAnalyzing ? "Loading the sample mix..." : "Analyze the sample mix"}
                </p>
                <p className="mt-1.5 max-w-lg text-xs leading-5 text-stone-300 sm:text-sm">
                  Run the complete emotional analysis immediately with the built-in 30-second excerpt.
                </p>
                <p className="mt-2 truncate text-[10px] font-medium text-amber-100/70 sm:text-xs">
                  “{DEMO_TRACK.title}” · {DEMO_TRACK.excerpt} excerpt
                </p>
              </div>

              <span className="hidden shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-stone-900 transition-transform duration-300 group-hover:translate-x-1 sm:inline-flex">
                Start analysis
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3 px-2" aria-hidden="true">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">or analyze your own mix</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
        </div>
      )}

      <label
        className={`
          relative flex flex-col items-center justify-center gap-4
          w-full min-h-52 rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-200
          ${isDragging
            ? "border-violet-400 scale-[1.01]"
            : "border-stone-200 hover:border-violet-300"
          }
          ${isAnalyzing ? "pointer-events-none opacity-60" : ""}
        `}
        style={{
          background: isDragging
            ? "linear-gradient(135deg, hsl(263 60% 97%) 0%, hsl(280 50% 97%) 100%)"
            : "linear-gradient(135deg, hsl(36 20% 98%) 0%, hsl(263 30% 97%) 100%)",
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".wav,.mp3,audio/wav,audio/mpeg"
          className="sr-only"
          onChange={onInputChange}
          disabled={isAnalyzing}
        />

        <div className={`
          relative flex items-center justify-center w-14 h-14 rounded-2xl
          transition-all duration-200
          ${isDragging ? "scale-110" : ""}
        `}
          style={{ background: "linear-gradient(135deg, hsl(263 50% 96%) 0%, hsl(280 45% 94%) 100%)", boxShadow: "0 2px 12px hsl(263 40% 70% / 0.18), 0 0 0 1px hsl(263 40% 85% / 0.4)" }}
        >
          {isAnalyzing
            ? <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            : <Music className="w-6 h-6 text-violet-500" />
          }
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-stone-800">
            {isAnalyzing ? "Analyzing your mix…" : "Drop your mix here"}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {isAnalyzing ? "This takes a moment" : "WAV or MP3 · Click to browse"}
          </p>
        </div>

        {!isAnalyzing && (
          <div
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors text-violet-700"
            style={{ background: "hsl(263 60% 95%)", boxShadow: "0 0 0 1px hsl(263 40% 85%)" }}
          >
            <Upload className="w-3 h-3" />
            <span>Upload file</span>
          </div>
        )}
      </label>

    </div>
  );
}
