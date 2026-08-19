import React, { useEffect, useState } from 'react';
import { calculateTimeRemaining, TimeRemaining } from '../lib/utils';

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    // Initial update
    setTimeLeft(calculateTimeRemaining(targetDate));

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div id="countdown-timer-live" className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-sm">
        <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
        <span className="text-white text-xs uppercase tracking-widest font-semibold">
          Evento em Andamento / Hoje
        </span>
      </div>
    );
  }

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  return (
    <div id="countdown-timer" className="flex items-center gap-3 sm:gap-6 mt-2">
      {/* Dias */}
      <div className="flex flex-col items-center sm:items-start">
        <span className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Dias</span>
        <span className="text-white text-2xl sm:text-4xl font-light font-editorial tabular-nums leading-none">
          {format2Digits(timeLeft.days)}
        </span>
      </div>

      <div className="text-white/30 text-2xl sm:text-3xl font-thin pb-1">:</div>

      {/* Horas */}
      <div className="flex flex-col items-center sm:items-start">
        <span className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Horas</span>
        <span className="text-white text-2xl sm:text-4xl font-light font-editorial tabular-nums leading-none">
          {format2Digits(timeLeft.hours)}
        </span>
      </div>

      <div className="text-white/30 text-2xl sm:text-3xl font-thin pb-1">:</div>

      {/* Minutos */}
      <div className="flex flex-col items-center sm:items-start">
        <span className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Min</span>
        <span className="text-white text-2xl sm:text-4xl font-light font-editorial tabular-nums leading-none">
          {format2Digits(timeLeft.minutes)}
        </span>
      </div>

      <div className="text-white/30 text-2xl sm:text-3xl font-thin pb-1">:</div>

      {/* Segundos */}
      <div className="flex flex-col items-center sm:items-start">
        <span className="text-[#C5A059] text-[10px] uppercase tracking-wider mb-0.5 font-medium">Seg</span>
        <span className="text-[#C5A059] text-2xl sm:text-4xl font-light font-editorial tabular-nums leading-none">
          {format2Digits(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};
