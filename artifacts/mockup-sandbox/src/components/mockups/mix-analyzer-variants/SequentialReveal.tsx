import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Smartphone, Headphones, Car } from "lucide-react";

export function SequentialReveal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      triggerTransition(() => setCurrentStep((prev) => prev + 1));
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      triggerTransition(() => setCurrentStep((prev) => prev - 1));
    }
  };

  const goToStep = (step: number) => {
    if (step !== currentStep && step >= 0 && step < totalSteps) {
      triggerTransition(() => setCurrentStep(step));
    }
  };

  const triggerTransition = (action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setIsTransitioning(false);
    }, 300);
  };

  const bgColors = [
    "bg-[#EFE8DE]", // warm stone
    "bg-[#E6E6FA]", // cool lavender
    "bg-[#D9E4DD]", // soft sage
    "bg-[#2C303A] text-white", // deep charcoal
  ];

  return (
    <div
      className={`min-h-screen w-full flex flex-col transition-colors duration-700 ease-in-out font-sans ${bgColors[currentStep]}`}
    >
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 text-sm tracking-wide opacity-60 font-mono z-10">
        <div>dream_chorus_v3.wav</div>
        <div>Mix Analyzer</div>
        <div>{currentStep + 1} / {totalSteps}</div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden px-8">
        <div
          className={`w-full max-w-4xl mx-auto transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentStep === 0 && <TonalBalanceCard />}
          {currentStep === 1 && <EmotionalReadCard />}
          {currentStep === 2 && <TranslationRiskCard />}
          {currentStep === 3 && <DynamicFeelCard />}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="w-full flex justify-between items-center p-8 z-10">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0 || isTransitioning}
          className={`flex items-center gap-2 px-4 py-2 transition-opacity ${
            currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-50 hover:opacity-100"
          }`}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium tracking-widest uppercase">Previous</span>
        </button>

        <div className="flex gap-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className="group relative p-2 focus:outline-none"
              aria-label={`Go to step ${i + 1}`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? currentStep === 3 ? "bg-white scale-150" : "bg-black scale-150"
                    : currentStep === 3 ? "bg-white/30 group-hover:bg-white/60" : "bg-black/20 group-hover:bg-black/50"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1 || isTransitioning}
          className={`flex items-center gap-2 px-4 py-2 transition-opacity ${
            currentStep === totalSteps - 1 ? "opacity-0 pointer-events-none" : "opacity-50 hover:opacity-100"
          }`}
        >
          <span className="text-sm font-medium tracking-widest uppercase">Next</span>
          <ArrowRight size={20} />
        </button>
      </footer>
    </div>
  );
}

function TonalBalanceCard() {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-12">
      <div className="space-y-4">
        <h2 className="text-sm font-medium tracking-widest uppercase opacity-60">Tonal Balance</h2>
        <h1 className="text-6xl md:text-8xl font-light tracking-tight text-neutral-800">mid-forward</h1>
      </div>
      
      <p className="text-xl leading-relaxed text-neutral-700 max-w-xl font-serif">
        Warm low-mids and present upper-mids create an intimate, upfront character. 
        The low end is controlled with moderate sub energy, while the high end breathes without turning harsh.
      </p>

      <div className="w-full max-w-md pt-8">
        <div className="flex justify-between text-xs font-mono opacity-50 mb-2">
          <span>LOW</span>
          <span>MID</span>
          <span>HIGH</span>
        </div>
        <div className="flex h-2 w-full gap-1">
          <div className="h-full bg-neutral-400 rounded-l-full" style={{ width: '25%' }}></div>
          <div className="h-full bg-neutral-800" style={{ width: '55%' }}></div>
          <div className="h-full bg-neutral-300 rounded-r-full" style={{ width: '20%' }}></div>
        </div>
      </div>
    </div>
  );
}

function EmotionalReadCard() {
  const axes = [
    { label: "Presence", value: 68, description: "upfront" },
    { label: "Attack", value: 32, description: "rounded" },
    { label: "Space", value: 62, description: "open" },
    { label: "Weight", value: 38, description: "airy" },
  ];

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-16">
      <h2 className="text-sm font-medium tracking-widest uppercase opacity-60 mb-8">Emotional Read</h2>
      
      <div className="w-full space-y-12">
        {axes.map((axis, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="w-32 text-xl font-light tracking-wide text-neutral-800">{axis.label}</div>
            
            <div className="flex-grow relative h-px mx-8 flex items-center">
              <div className="absolute inset-0 border-b border-neutral-300 border-dashed"></div>
              <div 
                className="absolute w-3 h-3 bg-neutral-800 rounded-full shadow-sm transition-all duration-1000 ease-out transform -translate-x-1/2"
                style={{ left: `${axis.value}%` }}
              ></div>
            </div>
            
            <div className="w-32 text-right text-xl font-serif italic text-neutral-600">
              {axis.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TranslationRiskCard() {
  const devices = [
    {
      icon: <Smartphone strokeWidth={1.5} size={32} />,
      name: "Phone",
      observation: "Will lose some sub warmth, emphasizing the vocal presence.",
      risk: "low"
    },
    {
      icon: <Headphones strokeWidth={1.5} size={32} />,
      name: "Headphones",
      observation: "Translates cleanly; spacious stereo field remains intact.",
      risk: "none"
    },
    {
      icon: <Car strokeWidth={1.5} size={32} />,
      name: "Car Audio",
      observation: "Controlled low end prevents muddiness on consumer systems.",
      risk: "none"
    }
  ];

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto space-y-16">
      <h2 className="text-sm font-medium tracking-widest uppercase opacity-60">Translation Risk</h2>
      
      <div className="w-full flex flex-col space-y-12">
        {devices.map((device, i) => (
          <div key={i} className="flex items-center gap-8 bg-white/30 p-8 rounded-2xl backdrop-blur-sm">
            <div className="text-neutral-700 opacity-80">
              {device.icon}
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-medium mb-1 text-neutral-800">{device.name}</h3>
              <p className="text-lg text-neutral-600 font-serif">{device.observation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DynamicFeelCard() {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-16 text-white">
      <div className="space-y-4">
        <h2 className="text-sm font-medium tracking-widest uppercase opacity-60">Dynamic Feel</h2>
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase">PUNCHY</h1>
      </div>
      
      {/* Animated visual representation */}
      <div className="h-32 w-full flex items-center justify-center gap-2 opacity-80">
        {[...Array(24)].map((_, i) => {
          const height = Math.sin(i * 0.5) * 40 + Math.random() * 20 + 20;
          const isAccent = i % 4 === 0;
          return (
            <div 
              key={i}
              className={`w-3 rounded-full bg-white transition-all duration-300 ease-in-out ${isAccent ? 'opacity-100' : 'opacity-40'}`}
              style={{ 
                height: `${isAccent ? height * 1.5 : height}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          );
        })}
      </div>

      <div className="space-y-4">
        <p className="text-2xl font-light tracking-wide max-w-xl leading-relaxed">
          Compressed but with real movement.
        </p>
        <div className="flex gap-8 justify-center opacity-60 font-mono text-sm pt-4">
          <span>CREST: ~9dB</span>
          <span>RMS: -14 LUFS</span>
        </div>
      </div>
    </div>
  );
}
