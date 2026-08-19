import React from 'react';
import { ChurchData } from '../types';
import { MapPin, Navigation, Compass, Heart, Users, Clock, ShieldCheck } from 'lucide-react';

interface AboutSectionProps {
  data: ChurchData;
  onOpenRsvp: () => void;
  onOpenShare: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ data, onOpenRsvp, onOpenShare }) => {
  return (
    <section id="sobre" className="py-16 sm:py-24 border-b border-gray-100 bg-[#FDFDFC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-[10px] uppercase tracking-[0.25em] font-bold rounded-sm mb-3">
              <Compass className="w-3 h-3" />
              Nossa Missão & Propósito
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#1A1A1A] font-bold tracking-tight max-w-2xl">
              Um Altar de Adoração, Acolhimento e Fé Viva
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-md font-sans leading-relaxed">
            Fundada sobre a rocha inabalável das Escrituras Sagradas, a Catedral de Amor e Fé existe para proclamar a graça redentora de Cristo e transformar vidas.
          </p>
        </div>

        {/* Content Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Visual Image Card with Quote */}
          <div className="lg:col-span-7 relative rounded-sm overflow-hidden bg-[#141414] min-h-[380px] flex flex-col justify-end p-8 sm:p-12 text-white group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />

            <div className="relative z-10 space-y-4">
              <span className="text-[#C5A059] text-[10px] uppercase tracking-[0.2em] font-bold">
                Mensagem Pastoral
              </span>
              <p className="font-editorial text-2xl sm:text-3xl text-white font-medium italic leading-relaxed">
                "Não somos apenas um templo de concreto; somos uma família unida pela cruz, chamada para ser luz nas trevas e abrigo aos necessitados."
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-white/20">
                <span className="text-xs uppercase tracking-widest text-white/80 font-semibold">
                  Bispo Samuel & Pra. Helena Oliveira
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059]">
                  Liderança Sênior
                </span>
              </div>
            </div>
          </div>

          {/* Right Statistics & Location Info */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Stats Counter Grid */}
            <div className="grid grid-cols-2 gap-4">
              {data.stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-6 bg-white border border-gray-100 hover:border-[#C5A059]/40 rounded-sm transition-all shadow-sm"
                >
                  <span className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] block mb-1">
                    {stat.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Location & Directions Box */}
            <div className="p-6 bg-[#F9F9F7] border border-gray-100 rounded-sm flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-2">
                  <MapPin className="w-4 h-4" />
                  Sede Oficial
                </div>
                <h4 className="font-editorial text-xl font-bold text-[#1A1A1A] mb-1">
                  Catedral de Amor e Fé
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed font-sans">
                  {data.contact.address} • {data.contact.cityState}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={data.contact.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(data.contact.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Como Chegar (Google Maps)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
