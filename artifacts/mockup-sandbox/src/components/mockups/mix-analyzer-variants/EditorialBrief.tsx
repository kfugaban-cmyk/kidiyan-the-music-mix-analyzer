import React from 'react';

export function EditorialBrief() {
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#E87A5D] selection:text-white px-6 py-12 md:py-24">
      <div className="max-w-2xl mx-auto relative">
        {/* Decorative Waveform Line */}
        <div className="absolute -top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E87A5D]/30 to-transparent opacity-50" />
        
        {/* Header */}
        <header className="mb-16 pt-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-[#1A1A1A]/50 font-medium mb-1">Target File</span>
            <h2 className="text-sm font-mono text-[#1A1A1A]/80">dream_chorus_v3.wav</h2>
          </div>
          <div className="flex flex-col md:text-right">
            <span className="text-xs uppercase tracking-widest text-[#1A1A1A]/50 font-medium mb-1">Duration</span>
            <span className="text-sm font-mono text-[#1A1A1A]/80">3:42</span>
          </div>
        </header>

        {/* Main Emotional Read Headline */}
        <section className="mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.15] tracking-tight text-[#1A1A1A] mb-8">
            An <span className="text-[#E87A5D] italic">upfront</span> and <span className="text-[#E87A5D] italic">open</span> presence, grounded by rounded transients and an airy weight.
          </h1>
          <p className="text-lg md:text-xl text-[#1A1A1A]/60 leading-relaxed max-w-xl font-serif italic">
            The mix leans into its character, choosing emotional impact over clinical precision. It feels spacious without losing its center of gravity.
          </p>
        </section>

        {/* Body Copy Sections */}
        <div className="space-y-12 md:space-y-16 text-base md:text-lg leading-[1.8] text-[#1A1A1A]/80 font-serif">
          
          <section>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#E87A5D] font-sans font-semibold mb-6">Tonal Balance</h3>
            <p className="indent-8">
              Tonally, the mix presents a decidedly mid-forward posture. The low-mids carry a distinct warmth that gives the body of the track its weight, while the upper-mids remain present and articulate, pushing the vocal or lead elements to the front of the soundstage. The low end is notably controlled—the sub frequencies are moderate, providing an anchor without overwhelming the mix. Up top, the high end is open and breathable, entirely avoiding any brittle or harsh characteristics.
            </p>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#E87A5D] font-sans font-semibold mb-6">Dynamic Movement & Width</h3>
            <p className="indent-8">
              The dynamic profile is decidedly punchy. While there is clear evidence of compression tying the elements together, it never sacrifices the track’s inherent movement. The crest factor sits comfortably around 9dB with an RMS of roughly −14 LUFS, ensuring the track feels alive and physical rather than constrained.
            </p>
            <p className="indent-8 mt-4">
              Spatially, the stereo width is treated with moderation. It is spacious enough to feel wide and immersive, yet it avoids hyper-extended widening tricks that might compromise mono compatibility. The center remains strong and focused.
            </p>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#E87A5D] font-sans font-semibold mb-6">Translation & Real-World Playback</h3>
            <p className="indent-8">
              In terms of real-world translation, the mix holds up exceptionally well. When played back on smaller phone speakers, some of the underlying sub warmth will inevitably be lost, but the crucial mid-range information ensures the core of the song remains intact. On headphones and in the car, the mix translates cleanly, retaining its intended emotional weight and spatial depth.
            </p>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-[#1A1A1A]/10 text-center">
          <p className="text-[10px] font-mono text-[#1A1A1A]/40 uppercase tracking-[0.3em]">
            Analyzed by Mix Analyzer
          </p>
        </footer>

      </div>
    </div>
  );
}

export default EditorialBrief;
