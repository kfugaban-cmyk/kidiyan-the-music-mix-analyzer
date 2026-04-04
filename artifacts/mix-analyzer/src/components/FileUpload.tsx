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
        w-full min-h-48 rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${isDragging
          ? "border-violet-400 bg-violet-50 scale-[1.01]"
          : "border-stone-200 bg-stone-50 hover:border-violet-300 hover:bg-violet-50/50"
        }
        ${isAnalyzing ? "pointer-events-none opacity-60" : ""}
      `}
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
        flex items-center justify-center w-14 h-14 rounded-full
        transition-colors duration-200
        ${isDragging ? "bg-violet-100" : "bg-white shadow-sm border border-stone-100"}
      `}>
        {isAnalyzing
          ? <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          : <Music className="w-6 h-6 text-violet-400" />
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
        <div className="flex items-center gap-2 text-xs text-violet-400 font-medium">
          <Upload className="w-3 h-3" />
          <span>Upload file</span>
        </div>
      )}
    </label>
  );
}
