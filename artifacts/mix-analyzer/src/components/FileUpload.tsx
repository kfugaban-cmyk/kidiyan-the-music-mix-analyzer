import { useCallback, useState } from "react";
import { Upload, Music } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  isAnalyzing: boolean;
}

export function FileUpload({ onFile, isAnalyzing }: Props) {
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
        <p className="text-sm font-medium text-stone-700">
          {isAnalyzing ? "Analyzing your mix…" : "Drop your mix here"}
        </p>
        <p className="text-xs text-stone-400 mt-1">
          {isAnalyzing ? "This takes a moment" : "WAV or MP3 · Click to browse"}
        </p>
      </div>

      {!isAnalyzing && (
        <div
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors text-violet-600"
          style={{ background: "hsl(263 60% 96%)", boxShadow: "0 0 0 1px hsl(263 40% 88%)" }}
        >
          <Upload className="w-3 h-3" />
          <span>Upload file</span>
        </div>
      )}
    </label>
  );
}
