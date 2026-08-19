import React, { useState } from 'react';
import { ChurchEvent, EventRegistration } from '../types';
import { useRegistrations } from '../lib/storage';
import { X, Calendar, Clock, MapPin, CheckCircle2, Ticket, QrCode, Download, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDatePT } from '../lib/utils';

interface EventRsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ChurchEvent | null;
  onNotifyToast: (msg: string) => void;
}

export const EventRsvpModal: React.FC<EventRsvpModalProps> = ({
  isOpen,
  onClose,
  event,
  onNotifyToast,
}) => {
  const { addRegistration } = useRegistrations();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [numAttendees, setNumAttendees] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedReg, setCompletedReg] = useState<EventRegistration | null>(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert('Por favor, preencha nome e e-mail.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reg = await addRegistration({
        eventId: event.id,
        eventTitle: event.title,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        numAttendees: Number(numAttendees),
      });

      setCompletedReg(reg);
      onNotifyToast('Inscrição confirmada com sucesso!');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A059', '#141414', '#ffffff', '#25D366'],
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao salvar sua inscrição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setCompletedReg(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setNumAttendees(1);
    onClose();
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.description}\nPreletor: ${event.speaker}\nLocal: ${event.location}`);
    const location = encodeURIComponent(event.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div
      id="rsvp-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-sm border border-gray-200 shadow-2xl overflow-hidden my-8">
        {/* Header with event preview */}
        <div className="relative bg-[#141414] text-white p-6 sm:p-8">
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="px-2.5 py-1 bg-[#C5A059] text-white text-[9px] uppercase tracking-widest font-bold rounded-sm inline-block mb-3">
            Inscrição Oficial Gratuita
          </span>

          <h3 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight mb-3">
            {event.title}
          </h3>

          <div className="flex flex-wrap gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
              {formatDatePT(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              {event.time}h
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              {event.location}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {completedReg ? (
            /* Voucher confirmation card */
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A]">
                  Vaga Confirmada com Sucesso!
                </h4>
                <p className="text-xs text-gray-500 font-sans mt-1">
                  Apresente este voucher digital na recepção da Catedral.
                </p>
              </div>

              {/* Digital Pass / Ticket */}
              <div className="border border-dashed border-[#C5A059] bg-[#FDFDFC] p-5 rounded-sm text-left space-y-3 relative">
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block">
                      Participante
                    </span>
                    <span className="font-editorial text-lg font-bold text-[#1A1A1A]">
                      {completedReg.fullName}
                    </span>
                    <span className="text-xs text-gray-500 block">{completedReg.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block">
                      Lugares
                    </span>
                    <span className="font-editorial text-lg font-bold text-[#C5A059]">
                      {completedReg.numAttendees} {completedReg.numAttendees > 1 ? 'Pessoas' : 'Pessoa'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                  <span>Cód: <strong className="font-mono text-[11px]">{completedReg.id.slice(0, 12)}</strong></span>
                  <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-xs">
                    Voucher Válido
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  Adicionar ao Google Agenda
                </a>

                <button
                  onClick={resetAndClose}
                  className="py-3 px-6 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs uppercase tracking-widest font-bold rounded-sm transition-all"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1.5">
                    E-mail para Confirmação *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1.5">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1.5">
                  Quantidade de Vagas
                </label>
                <select
                  value={numAttendees}
                  onChange={(e) => setNumAttendees(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                >
                  <option value={1}>1 pessoa (apenas eu)</option>
                  <option value={2}>2 pessoas (com acompanhante)</option>
                  <option value={3}>3 pessoas (família)</option>
                  <option value={4}>4 pessoas (família)</option>
                  <option value={5}>5 pessoas ou mais</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#C5A059] hover:bg-[#A8843F] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm shadow-sm transition-all disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isSubmitting ? 'Processando Vaga...' : 'Confirmar Presença Gratuita'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
