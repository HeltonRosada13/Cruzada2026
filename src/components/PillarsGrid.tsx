import React from 'react';
import { Pillar } from '../types';
import { Flame, BookOpen, Users, HeartHandshake, Music, Sparkles, Shield, Church } from 'lucide-react';

interface PillarsGridProps {
  pillars: Pillar[];
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Flame,
  BookOpen,
  Users,
  HeartHandshake,
  Music,
  Sparkles,
  Shield,
  Church,
};

export const PillarsGrid: React.FC<PillarsGridProps> = ({ pillars }) => {
  return (
    <section id="momentos" className="border-b border-gray-100 bg-[#FDFDFC]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {pillars.map((pillar, index) => {
          const IconComponent = iconMap[pillar.iconName] || Sparkles;
          return (
            <div
              key={pillar.id || index}
              className="p-8 sm:p-10 flex flex-col justify-between hover:bg-[#F9F9F7] transition-all group"
            >
              <div>
                {/* Top Badge with Number and Icon */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-9 h-9 rounded-full border border-[#C5A059]/40 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059]/10 transition-colors">
                    <span className="text-[11px] text-[#C5A059] font-bold italic font-editorial">
                      {pillar.number || String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <IconComponent className="w-5 h-5 text-[#C5A059] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>

                {/* Pillar Title */}
                <h3 className="font-editorial text-2xl text-[#1A1A1A] font-bold mb-3 group-hover:text-[#C5A059] transition-colors">
                  {pillar.title}
                </h3>

                {/* Pillar Description */}
                <p className="text-xs text-gray-500 leading-relaxed font-sans font-normal">
                  {pillar.description}
                </p>
              </div>

              {/* Bottom decorative bar */}
              <div className="mt-8 pt-4 border-t border-gray-100/60 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400">
                <span>Pilar Fundamental</span>
                <span className="text-[#C5A059] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
