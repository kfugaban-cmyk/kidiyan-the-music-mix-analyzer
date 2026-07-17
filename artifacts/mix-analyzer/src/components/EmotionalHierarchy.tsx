import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { EmotionalDimensionAnalysis } from "@/analysis/types";

interface Props {
  dimensions: EmotionalDimensionAnalysis[];
}

type EmotionTone = {
  glow: string;
  fill: string;
  ring: string;
  text: string;
  shadow: string;
};

const TONES: Record<string, EmotionTone> = {
  "Fragile Vulnerability": {
    glow: "radial-gradient(circle at 50% 50%, rgba(168, 202, 255, 0.55) 0%, rgba(214, 229, 255, 0.14) 48%, rgba(255,255,255,0) 76%)",
    fill: "linear-gradient(180deg, rgba(242,247,255,0.95) 0%, rgba(214,229,255,0.78) 100%)",
    ring: "rgba(127, 163, 227, 0.28)",
    text: "#29507c",
    shadow: "0 18px 44px rgba(99, 144, 216, 0.22)",
  },
  "Intentional Vulnerability": {
    glow: "radial-gradient(circle at 50% 50%, rgba(255, 198, 214, 0.5) 0%, rgba(255, 226, 233, 0.14) 50%, rgba(255,255,255,0) 77%)",
    fill: "linear-gradient(180deg, rgba(255,246,249,0.96) 0%, rgba(255,221,231,0.8) 100%)",
    ring: "rgba(230, 146, 173, 0.28)",
    text: "#7c3652",
    shadow: "0 18px 44px rgba(216, 117, 150, 0.2)",
  },
  "Warmth / Tenderness": {
    glow: "radial-gradient(circle at 50% 50%, rgba(255, 205, 154, 0.5) 0%, rgba(255, 235, 203, 0.16) 52%, rgba(255,255,255,0) 78%)",
    fill: "linear-gradient(180deg, rgba(255,248,238,0.96) 0%, rgba(255,226,185,0.8) 100%)",
    ring: "rgba(225, 156, 82, 0.26)",
    text: "#875121",
    shadow: "0 20px 46px rgba(211, 143, 68, 0.2)",
  },
  "Tension / Suspense": {
    glow: "radial-gradient(circle at 50% 50%, rgba(255, 199, 150, 0.38) 0%, rgba(255, 234, 208, 0.12) 50%, rgba(255,255,255,0) 76%)",
    fill: "linear-gradient(180deg, rgba(255,249,241,0.95) 0%, rgba(255,228,195,0.78) 100%)",
    ring: "rgba(205, 143, 78, 0.24)",
    text: "#7c512c",
    shadow: "0 20px 46px rgba(196, 133, 69, 0.18)",
  },
  "Urgency / Pressure": {
    glow: "radial-gradient(circle at 50% 50%, rgba(255, 189, 160, 0.42) 0%, rgba(255, 223, 213, 0.12) 50%, rgba(255,255,255,0) 77%)",
    fill: "linear-gradient(180deg, rgba(255,247,244,0.96) 0%, rgba(255,219,207,0.8) 100%)",
    ring: "rgba(220, 127, 93, 0.26)",
    text: "#7f402e",
    shadow: "0 20px 46px rgba(204, 115, 79, 0.2)",
  },
  "Aggression / Grit / Threat": {
    glow: "radial-gradient(circle at 50% 50%, rgba(255, 151, 151, 0.42) 0%, rgba(255, 217, 217, 0.12) 52%, rgba(255,255,255,0) 78%)",
    fill: "linear-gradient(180deg, rgba(255,244,244,0.96) 0%, rgba(255,212,212,0.82) 100%)",
    ring: "rgba(212, 95, 95, 0.28)",
    text: "#7b2d2d",
    shadow: "0 22px 48px rgba(196, 75, 75, 0.22)",
  },
  "Emotional Heaviness / Weight": {
    glow: "radial-gradient(circle at 50% 50%, rgba(185, 173, 255, 0.42) 0%, rgba(228, 223, 255, 0.14) 52%, rgba(255,255,255,0) 80%)",
    fill: "linear-gradient(180deg, rgba(248,246,255,0.96) 0%, rgba(221,214,255,0.8) 100%)",
    ring: "rgba(137, 118, 219, 0.24)",
    text: "#4d3f81",
    shadow: "0 22px 48px rgba(117, 96, 205, 0.22)",
  },
  "Openness / Air / Transcendence": {
    glow: "radial-gradient(circle at 50% 50%, rgba(177, 236, 255, 0.42) 0%, rgba(219, 246, 255, 0.14) 52%, rgba(255,255,255,0) 78%)",
    fill: "linear-gradient(180deg, rgba(246,253,255,0.96) 0%, rgba(212,242,255,0.8) 100%)",
    ring: "rgba(103, 191, 223, 0.24)",
    text: "#22627d",
    shadow: "0 22px 48px rgba(91, 178, 209, 0.18)",
  },
};

const DEFAULT_TONE: EmotionTone = {
  glow: "radial-gradient(circle at 50% 50%, rgba(216, 205, 189, 0.42) 0%, rgba(242, 236, 228, 0.12) 52%, rgba(255,255,255,0) 78%)",
  fill: "linear-gradient(180deg, rgba(255,251,247,0.96) 0%, rgba(239,231,221,0.8) 100%)",
  ring: "rgba(138, 117, 93, 0.18)",
  text: "#5f4e3a",
  shadow: "0 22px 48px rgba(88, 69, 48, 0.14)",
};

function toneFor(name: string): EmotionTone {
  return TONES[name] ?? DEFAULT_TONE;
}

function topEvidence(dimension: EmotionalDimensionAnalysis): string[] {
  return dimension.evidence.slice(0, 3).map((item) => `${item.feature} increased ${dimension.name.toLowerCase()} because ${item.influence.toLowerCase()}`);
}

function balanceLabel(topThree: EmotionalDimensionAnalysis[]) {
  const spread = topThree[0].score - topThree[2].score;
  if (spread <= 8) return { label: "Tightly clustered", note: "The top emotional pulls are closely matched rather than dominated by a single feeling." };
  if (spread <= 18) return { label: "Moderately differentiated", note: "One emotion leads, but the supporting emotions still meaningfully shape the mix." };
  return { label: "Strongly centered", note: "A single emotion clearly anchors the mix while the others support it from the edges." };
}

function EmotionNode({
  dimension,
  rank,
  className,
  style,
}: {
  dimension: EmotionalDimensionAnalysis;
  rank: 1 | 2 | 3;
  className: string;
  style?: CSSProperties;
}) {
  const tone = toneFor(dimension.name);
  const size =
    rank === 1
      ? "h-44 w-44 md:h-56 md:w-56"
      : rank === 2
        ? "h-32 w-32 md:h-[9.5rem] md:w-[9.5rem]"
        : "h-28 w-28 md:h-[8.5rem] md:w-[8.5rem]";
  const scoreSize = rank === 1 ? "text-4xl" : "text-2xl";

  return (
    <HoverCard openDelay={120} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.button
          type="button"
          className={`group absolute flex flex-col items-center justify-center rounded-full text-center transition-transform duration-500 hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-stone-400/40 ${size} ${className}`}
          style={{
            background: tone.fill,
            boxShadow: tone.shadow,
            border: `1px solid ${tone.ring}`,
            color: tone.text,
            ...style,
          }}
          animate={{
            scale: [1, rank === 1 ? 1.028 : 1.018, 1],
            y: [0, rank === 1 ? -5 : -3, 0],
            boxShadow: [tone.shadow, tone.shadow.replace(/0\.\d+\)/, rank === 1 ? "0.34)" : "0.26)"), tone.shadow],
          }}
          transition={{
            duration: rank === 1 ? 8.4 : 10.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: rank * 0.4,
          }}
        >
          <motion.div
            className="absolute inset-[-18%] rounded-full blur-2xl"
            style={{ background: tone.glow }}
            animate={{ opacity: [0.5, rank === 1 ? 0.86 : 0.72, 0.5], scale: [0.98, 1.05, 0.98] }}
            transition={{ duration: rank === 1 ? 9.5 : 11, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <div className="relative z-10 px-4">
            <p className={`font-semibold tracking-tight ${rank === 1 ? "text-lg md:text-xl" : "text-sm md:text-base"}`}>{dimension.name}</p>
            <p className={`mt-2 font-semibold tabular-nums ${scoreSize}`}>{dimension.score}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.24em] opacity-70">{rank === 1 ? "Primary anchor" : rank === 2 ? "Supporting force" : "Outer support"}</p>
          </div>
        </motion.button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 rounded-3xl border-stone-200/80 bg-white/96 p-4 shadow-[0_16px_48px_rgba(38,30,18,0.12)]">
        <p className="text-sm font-semibold text-stone-900">{dimension.name}</p>
        <p className="mt-2 text-sm leading-6 text-stone-700">{dimension.summary}</p>
        <div className="mt-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">What contributed</p>
          <ul className="mt-2 space-y-2">
            {topEvidence(dimension).map((item) => (
              <li key={item} className="text-sm leading-6 text-stone-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function EmotionalHierarchy({ dimensions }: Props) {
  const topThree = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 3);
  if (topThree.length < 3) return null;

  const [primary, secondary, tertiary] = topThree as [EmotionalDimensionAnalysis, EmotionalDimensionAnalysis, EmotionalDimensionAnalysis];
  const balance = balanceLabel(topThree);
  const averageTop = Math.round((primary.score + secondary.score + tertiary.score) / 3);

  return (
    <div className="rounded-[30px] border border-stone-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,243,235,0.92)_50%,rgba(245,238,229,0.88)_100%)] p-5 shadow-[0_18px_56px_rgba(34,26,14,0.10)] print:hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone-500">Emotional hierarchy</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">An emotional map, not a scoreboard</h3>
          <p className="mt-3 text-sm leading-6 text-stone-700">
            This mix is emotionally centered in <span className="font-semibold text-stone-900">{primary.name}</span>, supported by <span className="font-semibold text-stone-900">{secondary.name}</span> and <span className="font-semibold text-stone-900">{tertiary.name}</span>.
          </p>
        </div>

        <div className="rounded-2xl bg-white/72 px-4 py-3 ring-1 ring-stone-200/80">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Balance indicator</p>
          <div className="mt-2 h-2.5 w-44 overflow-hidden rounded-full bg-stone-200">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#ca8a52_0%,#7c9bd7_50%,#d08698_100%)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, averageTop)}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-stone-900">{balance.label}</p>
          <p className="mt-1 max-w-[18rem] text-xs leading-5 text-stone-600">{balance.note}</p>
        </div>
      </div>

      <div className="relative mt-8 h-[420px] overflow-hidden rounded-[28px] border border-white/60 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.75)_0%,rgba(247,241,234,0.75)_38%,rgba(236,228,217,0.92)_100%)]">
        <motion.div
          className="absolute inset-0 opacity-60"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 25%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0) 28%), radial-gradient(circle at 78% 18%, rgba(255,236,221,0.72) 0%, rgba(255,255,255,0) 30%), radial-gradient(circle at 72% 78%, rgba(219,234,255,0.48) 0%, rgba(255,255,255,0) 24%)",
            backgroundSize: "160% 160%",
          }}
        />

        <div className="absolute left-1/2 top-[54%] h-[1px] w-[58%] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(120,100,80,0)_0%,rgba(120,100,80,0.16)_50%,rgba(120,100,80,0)_100%)]" />
        <div className="absolute left-1/2 top-[54%] h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-300/35" />
        <div className="absolute left-1/2 top-[54%] h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-300/25" />

        <EmotionNode dimension={primary} rank={1} className="left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2" />
        <EmotionNode dimension={secondary} rank={2} className="left-[16%] top-[18%] md:left-[18%] md:top-[16%]" />
        <EmotionNode dimension={tertiary} rank={3} className="right-[10%] top-[22%] md:right-[14%] md:top-[20%]" />

        <div className="absolute bottom-5 left-5 max-w-[18rem] rounded-2xl bg-white/78 px-4 py-3 ring-1 ring-stone-200/75 backdrop-blur-[6px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Reading</p>
          <p className="mt-1 text-sm leading-6 text-stone-700">
            The center node marks the strongest emotional anchor. Supporting nodes stay offset and slightly smaller so the mix reads as a field of forces rather than a ranked list.
          </p>
        </div>
      </div>
    </div>
  );
}
