import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface Props {
  file: File;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ file }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)", boxShadow: "0 1px 3px hsl(263 30% 30% / 0.06), 0 0 0 1px hsl(263 20% 92%)" }}>
      <audio
        ref={audioRef}
        src={url || undefined}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 rounded-full text-white transition-all flex-shrink-0 hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, hsl(263 65% 62%) 0%, hsl(280 60% 55%) 100%)", boxShadow: "0 2px 10px hsl(263 60% 60% / 0.35), 0 1px 3px hsl(263 50% 40% / 0.2)" }}
        >
          {isPlaying
            ? <Pause className="w-4 h-4" />
            : <Play className="w-4 h-4 ml-0.5" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-stone-600 truncate mb-2">{file.name}</p>
          <div
            className="relative h-1.5 rounded-full cursor-pointer group"
            style={{ background: "hsl(263 20% 93%)" }}
            onClick={seek}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "linear-gradient(to right, hsl(263 45% 72%), hsl(263 65% 56%))" }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)`, background: "hsl(263 65% 58%)", boxShadow: "0 1px 4px hsl(263 50% 50% / 0.4)" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-stone-400">{formatTime(currentTime)}</span>
            <span className="text-xs text-stone-400">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Volume2 className="w-3.5 h-3.5 text-stone-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-16 h-1 accent-violet-400"
          />
        </div>
      </div>
    </div>
  );
}
