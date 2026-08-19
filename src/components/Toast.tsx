import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      id="app-toast"
      onClick={onClose}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#141414] text-white px-5 py-3 rounded-sm shadow-2xl border border-[#C5A059]/40 flex items-center gap-3 cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="w-5 h-5 rounded-full bg-[#C5A059] flex items-center justify-center text-white shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs font-medium font-sans tracking-wide">
        {message}
      </span>
    </div>
  );
};
