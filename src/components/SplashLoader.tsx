import React, { useEffect, useState } from 'react';

interface SplashLoaderProps {
  onFinish?: () => void;
}

export const SplashLoader: React.FC<SplashLoaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(65), 150);
    const timer2 = setTimeout(() => setProgress(100), 350);
    const timer3 = setTimeout(() => setFading(true), 550);
    const timer4 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <div
      id="splash-loader"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFDFC] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center animate-fade-in">
        {/* Catedral Monogram Logo */}
        <div className="w-16 h-16 bg-[#C5A059] flex items-center justify-center rounded-sm shadow-md mb-6 transition-transform duration-500 scale-100">
          <span className="text-white font-bold text-3xl font-editorial">C</span>
        </div>

        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#1A1A1A]/70 mb-1">
          Catedral de
        </span>
        <h1 className="font-editorial text-2xl font-bold text-[#1A1A1A] tracking-tight mb-6">
          Amor & Fé
        </h1>

        {/* Golden sleek progress bar */}
        <div className="w-48 h-1 bg-[#EBE8DF] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#C5A059] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/40 font-medium">
          Sincronizando portal...
        </span>
      </div>
    </div>
  );
};
