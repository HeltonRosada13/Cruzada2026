import React, { useState } from 'react';
import { ServiceTime, ChurchEvent } from '../types';
import { Calendar, Clock, MapPin, User, Users, CheckCircle2, Ticket } from 'lucide-react';
import { formatDatePT } from '../lib/utils';

interface ScheduleSectionProps {
  regularServices: ServiceTime[];
  upcomingEvents: ChurchEvent[];
  onSelectEventForRsvp: (event: ChurchEvent) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  regularServices,
  upcomingEvents,
  onSelectEventForRsvp,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'services'>('events');

  return (
    <section id="agenda" className="py-16 sm:py-24 border-b border-gray-100 bg-[#FDFDFC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-[10px] uppercase tracking-[0.25em] font-bold rounded-sm mb-3">
              <Calendar className="w-3 h-3" />
              Programação Oficial
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#1A1A1A] font-bold tracking-tight">
              Agenda de Cultos & Eventos
            </h2>
          </div>

          {/* Toggle Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-sm">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-5 py-2 text-xs uppercase tracking-widest font-bold rounded-sm transition-all ${
                activeTab === 'events' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Próximos Eventos ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-5 py-2 text-xs uppercase tracking-widest font-bold rounded-sm transition-all ${
                activeTab === 'services' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Cultos Semanais
            </button>
          </div>
        </div>

        {/* Tab 1: Upcoming Events & Conferences */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => {
              const hasSeatsLeft = event.seatsLeft !== undefined && event.seatsLeft > 0;
              return (
                <div
                  key={event.id}
                  className="bg-white border border-gray-100 hover:border-[#C5A059]/40 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Event Cover Image */}
                  <div className="relative h-48 bg-gray-900 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {event.tag && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#C5A059] text-white text-[9px] uppercase tracking-widest font-bold rounded-sm">
                        {event.tag}
                      </span>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-semibold text-white/90">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                        {formatDatePT(event.date)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-white/90">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        {event.time}h
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-editorial text-xl font-bold text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors leading-snug mb-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-sans line-clamp-2 mb-3">
                        {event.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Preletor: <strong>{event.speaker}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        {event.seatsLeft !== undefined && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>Vagas disponíveis: <strong className={event.seatsLeft < 50 ? 'text-red-500 font-bold' : 'text-gray-800'}>{event.seatsLeft} de {event.totalSeats || 500}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-gray-100">
                      <button
                        onClick={() => onSelectEventForRsvp(event)}
                        disabled={!event.registrationOpen || (event.seatsLeft !== undefined && event.seatsLeft <= 0)}
                        className={`w-full py-3 px-4 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm transition-all shadow-sm ${
                          event.registrationOpen && (event.seatsLeft === undefined || event.seatsLeft > 0)
                            ? 'bg-[#C5A059] hover:bg-[#A8843F] text-white active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Ticket className="w-4 h-4" />
                        <span>{event.registrationOpen ? 'Garantir Vaga Gratuita' : 'Inscrições Encerradas'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Regular Weekly Services */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularServices.map((service, index) => (
              <div
                key={service.id || index}
                className="p-8 bg-white border border-gray-100 hover:border-[#C5A059]/40 rounded-sm shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-[#C5A059] px-2.5 py-1 bg-[#C5A059]/10 rounded-sm">
                      {service.day}
                    </span>
                    <span className="font-editorial text-2xl font-bold text-[#1A1A1A]">
                      {service.time}
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl font-bold text-[#1A1A1A] mb-2 leading-snug">
                    {service.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed font-sans mb-4">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="truncate">{service.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
