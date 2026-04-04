import type { MixAnalysis, SpectrumData, DynamicsData, EmotionalReadData } from "@/analysis/types";
import { AlertTriangle, Activity, Headphones, Sparkles } from "lucide-react";

interface EmotionalParagraph {
  character: string;
  listenerEffect: string;
  masteringNote: string;
}

function buildEmotionalParagraph(e: EmotionalReadData): EmotionalParagraph {
  const p = e.presence.value;   // recessed (0) → upfront (100)
  const a = e.attack.value;     // rounded (0) → cutting (100)
  const s = e.space.value;      // dry (0) → open (100)
  const w = e.weight.value;     // airy (0) → heavy (100)

  // --- Sentence 1: character (presence × space + attack × weight) ---
  let opening: string;
  if (p < 35 && s < 35)       opening = "close and dry";
  else if (p < 35 && s > 65)  opening = "distant but open";
  else if (p < 35)             opening = "slightly withdrawn";
  else if (p > 65 && s > 65)  opening = "open and upfront";
  else if (p > 65 && s < 35)  opening = "close and direct";
  else if (p > 65)             opening = "forward and present";
  else if (s > 65)             opening = "settled and spacious";
  else if (s < 35)             opening = "intimate and focused";
  else                         opening = "centered and even";

  let texture: string;
  if (a < 35 && w < 35)       texture = "a light, feathery touch with very little body";
  else if (a < 35 && w > 65)  texture = "smooth transients and a heavy, grounded bottom";
  else if (a < 35 && w > 45)  texture = "rounded edges and a solid, full body";
  else if (a < 35)             texture = "a soft, unhurried edge and an airy frame";
  else if (a > 65 && w > 65)  texture = "crisp attack and dense, weighty low end";
  else if (a > 65 && w < 35)  texture = "a cutting edge but a lean, thin body";
  else if (a > 65 && w > 45)  texture = "sharp transients and a grounded, full presence";
  else if (a > 65)             texture = "a defined, punchy edge with controlled weight";
  else if (w > 65)             texture = "measured movement and a heavy, grounded body";
  else if (w < 35)             texture = "gentle definition and a lean, airy frame";
  else                         texture = "balanced weight and a measured, even edge";

  const character = `${opening}, with ${texture}`;

  // --- Sentence 2: listener effect (presence × weight as primary drivers) ---
  let listenerEffect: string;
  if (p > 65 && w > 65) {
    listenerEffect = "This combination pulls the listener in both emotionally and physically — the upfront presence demands attention while the low-end weight gives the body something to feel.";
  } else if (p > 65 && w < 35) {
    listenerEffect = "The forward presence keeps the listener engaged and alert, but the thin body means the energy comes from edge rather than mass — it can feel exciting but tiring over a full listen.";
  } else if (p > 65 && s > 65) {
    listenerEffect = "Being both present and spacious, the mix creates a sense of being in a room with the sound rather than behind it — immersive and immediate at once.";
  } else if (p > 65) {
    listenerEffect = "The upfront character keeps the listener close — there's no distance between the lead and the ear, which creates intimacy and directness.";
  } else if (p < 35 && s > 65) {
    listenerEffect = "The recessed presence and open space give the mix a cinematic quality — the listener observes rather than participates, which suits atmospheric or background material well.";
  } else if (p < 35 && w > 65) {
    listenerEffect = "The bottom end does most of the emotional work here — physical and weighty, but the lead stays back, which can create a dark, submerged feeling.";
  } else if (p < 35) {
    listenerEffect = "The mix sits back from the listener rather than reaching out, which can feel understated and cool, or slightly lifeless depending on the genre and intent.";
  } else if (w > 65 && a > 65) {
    listenerEffect = "Heavy low end combined with sharp transients creates a physically demanding listen — punchy and driving, the kind of mix that demands a sound system to fully land.";
  } else if (w > 65) {
    listenerEffect = "The weight of the low end grounds the emotional experience — there's a steadiness and density to the sound that feels committed and full.";
  } else if (s > 65 && a < 35) {
    listenerEffect = "Wide, soft, and open — the mix creates space rather than filling it, which suits gentle or introspective material but may lack the urgency needed in louder contexts.";
  } else if (a > 65) {
    listenerEffect = "Sharp transients keep the listener's nervous system active — the mix feels crisp and alert, where individual hits and details register clearly even at low volumes.";
  } else {
    listenerEffect = "The overall balance sits comfortably in the center — nothing pulls hard in any one direction, which gives the mix versatility across different listening contexts.";
  }

  // --- Sentence 3: mastering impact (keyed to the most extreme axis) ---
  const deviations = [
    { axis: "presence", val: p, lo: "low", hi: "high" },
    { axis: "attack",   val: a, lo: "low", hi: "high" },
    { axis: "space",    val: s, lo: "low", hi: "high" },
    { axis: "weight",   val: w, lo: "low", hi: "high" },
  ];
  const mostExtreme = deviations.reduce((best, cur) =>
    Math.abs(cur.val - 50) > Math.abs(best.val - 50) ? cur : best
  );
  const direction = mostExtreme.val > 50 ? "high" : "low";

  let masteringNote: string;
  if (mostExtreme.axis === "presence" && direction === "high") {
    masteringNote = "With the mix this forward, limiting is the most consequential mastering step — over-compressing will push the lead into harshness, so gain staging before the limiter matters more than usual.";
  } else if (mostExtreme.axis === "presence" && direction === "low") {
    masteringNote = "A gentle high-shelf lift in mastering (around 8–12kHz) could bring the lead forward without disrupting the spectral balance — or a touch of saturation to add presence without adding brightness.";
  } else if (mostExtreme.axis === "attack" && direction === "high") {
    masteringNote = "The sharp transients mean the limiter will engage on peaks frequently — a short transient shaper before limiting can soften the worst hits and allow a louder master without audible pumping.";
  } else if (mostExtreme.axis === "attack" && direction === "low") {
    masteringNote = "The soft transients leave room for transient enhancement in mastering — a gentle attack shaper can add front-end definition to the lead without over-brightening the high shelf.";
  } else if (mostExtreme.axis === "space" && direction === "high") {
    masteringNote = "The wide stereo field will narrow slightly in streaming loudness normalization and mono fold-down — the master should be checked in mono to ensure no critical elements cancel or collapse.";
  } else if (mostExtreme.axis === "space" && direction === "low") {
    masteringNote = "Mid-side processing in mastering could gently widen the stereo image — even a few percent of side-channel lift can open the mix considerably without introducing phase issues.";
  } else if (mostExtreme.axis === "weight" && direction === "high") {
    masteringNote = "The heavy low end will cause the limiter to work hardest on bass hits — a multiband approach, or high-passing the side channel before brick-walling, can prevent the sub from controlling the loudness ceiling.";
  } else if (mostExtreme.axis === "weight" && direction === "low") {
    masteringNote = "A low-shelf or sub-bass harmonic saturation in mastering can add warmth and body — this is especially useful if the mix will be heard on systems that can't reproduce deep sub frequencies.";
  } else {
    masteringNote = "With all axes close to center, the mix is in a balanced position going into mastering — modest limiting and EQ should be sufficient without any major corrective moves.";
  }

  return { character, listenerEffect, masteringNote };
}

function describeTonalBalance(s: SpectrumData): string {
  const { sub, lowMid, mid, high, label } = s;
  if (label === "bass-heavy") {
    const clarity = mid + high;
    return `Sub-bass is dominant at ${sub}% — the low-end weight is thick. Mid and high energy combined (${clarity}%) is sitting back, so clarity and air may be getting masked by the low-end mass.`;
  }
  if (label === "bright") {
    return `High end carries ${high}% of the spectral energy — the mix has air and presence, but body is light: sub at ${sub}%, low-mids at ${lowMid}%. It may feel thin on small speakers.`;
  }
  if (label === "mid-forward") {
    return `Midrange is the dominant force at ${mid}% — vocals and lead instruments are upfront. Sub sits at ${sub}% and highs at ${high}%, so the mix has limited low-end weight and top-end shimmer.`;
  }
  if (label === "thin") {
    return `Low-end energy is very sparse — sub at ${sub}%, low-mids at ${lowMid}%. The mix may lack body and fullness, especially on anything with bass drivers or subwoofers.`;
  }
  return `Spread is fairly even — sub ${sub}%, low-mids ${lowMid}%, mids ${mid}%, highs ${high}%. No single band is dominating, which gives the mix flexibility across playback systems.`;
}

function describeDynamicFeel(d: DynamicsData): string {
  const { label, crestFactor, rmsDb } = d;
  if (label === "compressed") {
    return `Crest factor is ${crestFactor} dB — heavy limiting has flattened most transient movement. The mix has consistent loudness (${rmsDb} dBFS RMS) but very little dynamic breathing room.`;
  }
  if (label === "punchy") {
    return `Crest factor of ${crestFactor} dB gives the mix body without smashing it flat. Transients are landing with definition, and the RMS of ${rmsDb} dBFS keeps energy present throughout.`;
  }
  if (label === "dynamic") {
    return `${crestFactor} dB of crest factor means transients are largely intact — the mix breathes naturally. At ${rmsDb} dBFS RMS, it has headroom. Loud platforms may need a master limiter pass.`;
  }
  return `Crest factor of ${crestFactor} dB is wide — dynamic range is very open. The ${rmsDb} dBFS RMS average is low, which is natural but may need taming for streaming platforms.`;
}

interface Props {
  analysis: MixAnalysis;
}

function ScoreDot({ score, risk }: { score?: number; risk?: "low" | "medium" | "high" }) {
  if (risk !== undefined) {
    const color = risk === "low" ? "bg-emerald-500" : risk === "medium" ? "bg-amber-500" : "bg-rose-500";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  }
  if (score !== undefined) {
    const color = score > 60 ? "bg-emerald-500" : score > 30 ? "bg-amber-500" : "bg-rose-500";
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  }
  return null;
}

function LabelPill({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full text-violet-700"
      style={{ background: "hsl(263 60% 95%)", boxShadow: "0 0 0 1px hsl(263 40% 85%)" }}
    >
      {label}
    </span>
  );
}

function IconBox({ children, color }: { children: React.ReactNode; color: "violet" | "amber" }) {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={
        color === "violet"
          ? { background: "linear-gradient(135deg, hsl(263 55% 94%) 0%, hsl(280 50% 92%) 100%)", boxShadow: "0 0 0 1px hsl(263 40% 86%)" }
          : { background: "linear-gradient(135deg, hsl(40 100% 94%) 0%, hsl(35 90% 91%) 100%)", boxShadow: "0 0 0 1px hsl(40 60% 84%)" }
      }
    >
      {children}
    </div>
  );
}


const cardStyle = {
  background: "linear-gradient(160deg, #ffffff 0%, hsl(263 20% 99%) 100%)",
  boxShadow: "0 1px 3px hsl(263 30% 30% / 0.07), 0 0 0 1px hsl(263 20% 90%)",
};

export function SummaryCards({ analysis }: Props) {
  const { spectrum, dynamics, translation, emotional } = analysis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Tonal Balance */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <IconBox color="violet">
              <Activity className="w-4 h-4 text-violet-600" />
            </IconBox>
            <div>
              <p className="text-sm font-bold text-stone-900">Tonal Balance</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot score={spectrum.score} />
                <span className="text-xs text-stone-500">score {spectrum.score}/100</span>
              </div>
            </div>
          </div>
          <LabelPill label={spectrum.label} />
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {describeTonalBalance(spectrum)}
        </p>
      </div>

      {/* Dynamic Feel */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <IconBox color="violet">
              <Headphones className="w-4 h-4 text-violet-600" />
            </IconBox>
            <div>
              <p className="text-sm font-bold text-stone-900">Dynamic Feel</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot score={dynamics.score} />
                <span className="text-xs text-stone-500">crest {dynamics.crestFactor} dB</span>
              </div>
            </div>
          </div>
          <LabelPill label={dynamics.label} />
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {describeDynamicFeel(dynamics)}
        </p>
      </div>

      {/* Translation Risk */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <IconBox color="amber">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </IconBox>
            <div>
              <p className="text-sm font-bold text-stone-900">Translation Risk</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ScoreDot risk={translation.risk} />
                <span className="text-xs text-stone-500">{translation.risk} risk</span>
              </div>
            </div>
          </div>
          <LabelPill label={translation.label} />
        </div>
        <ul className="space-y-2">
          {translation.details.map((d, i) => (
            <li key={i} className="text-xs text-stone-600 flex gap-2 leading-relaxed">
              <span className="text-violet-400 mt-px flex-shrink-0 font-bold">·</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Emotional Read */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-center gap-2.5 mb-4">
          <IconBox color="violet">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </IconBox>
          <p className="text-sm font-bold text-stone-900">Emotional Read</p>
        </div>
        {(() => {
          const { character, listenerEffect, masteringNote } = buildEmotionalParagraph(emotional);
          return (
            <div className="space-y-3">
              <p className="text-sm italic font-medium text-stone-800 leading-relaxed">
                {character}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {listenerEffect}
              </p>
              <div className="border-t border-stone-100 pt-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1.5">Mastering note</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {masteringNote}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
