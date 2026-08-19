import React, { useState, useEffect } from 'react';
import { Testimonial } from '../types';
import { Quote, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate every 6 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const current = testimonials[currentIndex] || testimonials[0];

  if (!current) return null;

  return (
    <section id="testemunhos" className="py-16 sm:py-24 border-b border-gray-100 bg-[#FDFDFC]">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-[10px] uppercase tracking-[0.25em] font-bold rounded-sm mb-4">
          <Heart className="w-3 h-3" />
          Testemunhos & Fé Compartilhada
        </div>

        <h2 className="font-editorial text-3xl sm:text-4xl text-[#1A1A1A] font-bold tracking-tight mb-12">
          Vidas Transformadas pela Graça
        </h2>

        {/* Testimonial Card */}
        <div className="relative bg-white border border-gray-100 p-8 sm:p-14 rounded-sm shadow-sm">
          <Quote className="w-12 h-12 text-[#C5A059]/20 mx-auto mb-6" />

          {/* Testimonial Quote */}
          <p className="font-editorial text-xl sm:text-2xl sm:leading-relaxed text-[#1A1A1A] italic max-w-3xl mx-auto mb-8 transition-opacity duration-300">
            "{current.quote}"
          </p>

          {/* Author Details */}
          <div className="flex flex-col items-center">
            <img
              src={current.avatar}
              alt={current.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#C5A059] mb-3 shadow-sm"
            />
            <h4 className="font-editorial text-lg font-bold text-[#1A1A1A]">
              {current.name}
            </h4>
            <span className="text-xs uppercase tracking-widest text-[#C5A059] font-medium">
              {current.role} {current.date ? `• ${current.date}` : ''}
            </span>
          </div>

          {/* Navigation Controls */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-[#C5A059] flex items-center justify-center text-gray-600 hover:text-[#C5A059] transition-all"
                title="Depoimento Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-[#C5A059] w-6' : 'bg-gray-200'
                    }`}
                    aria-label={`Ir para depoimento ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-[#C5A059] flex items-center justify-center text-gray-600 hover:text-[#C5A059] transition-all"
                title="Próximo Depoimento"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
