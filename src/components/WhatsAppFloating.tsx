import React, { useState } from 'react';
import { MessageCircle, X, Send, CheckCheck, Sparkles } from 'lucide-react';

interface WhatsAppFloatingProps {
  whatsappNumber: string;
  defaultMessage: string;
}

export const WhatsAppFloating: React.FC<WhatsAppFloatingProps> = ({
  whatsappNumber,
  defaultMessage,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  // Sanitize number
  const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');

  const handleOpenWhatsApp = (customText?: string) => {
    const textToSend = customText || userMsg || defaultMessage;
    const url = `https://wa.me/${cleanNumber.replace('+', '')}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
    setChatOpen(false);
  };

  return (
    <div id="whatsapp-widget" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Interactive Chat Popup */}
      {chatOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-sm shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg font-editorial">
                C
              </div>
              <div>
                <h4 className="font-editorial text-sm font-bold leading-tight">
                  Atendimento Catedral
                </h4>
                <span className="text-[10px] text-[#25D366] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  Online agora
                </span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/70 hover:text-white p-1"
              title="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#ECE5DD] min-h-[160px] flex flex-col justify-end space-y-3">
            {/* Auto greeting bubble */}
            <div className="self-start max-w-[85%] bg-white p-3 rounded-sm rounded-tl-none shadow-xs text-xs text-[#1A1A1A]">
              <p className="leading-relaxed">
                Graça e Paz! Seja muito bem-vindo(a) à Catedral de Amor e Fé. Como podemos orar por você ou auxiliá-lo(a) hoje?
              </p>
              <div className="text-[9px] text-gray-400 text-right mt-1 flex items-center justify-end gap-1">
                <span>Agora</span>
                <CheckCheck className="w-3 h-3 text-blue-500" />
              </div>
            </div>

            {/* Quick action chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => handleOpenWhatsApp('Olá! Gostaria de fazer um pedido de oração.')}
                className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#1A1A1A] text-[10px] rounded-xs shadow-2xs font-medium transition-all"
              >
                🙏 Pedido de Oração
              </button>
              <button
                onClick={() => handleOpenWhatsApp('Olá! Gostaria de saber os horários de cultos.')}
                className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#1A1A1A] text-[10px] rounded-xs shadow-2xs font-medium transition-all"
              >
                ⏰ Horários de Culto
              </button>
              <button
                onClick={() => handleOpenWhatsApp('Olá! Gostaria de participar de uma célula nos lares.')}
                className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#1A1A1A] text-[10px] rounded-xs shadow-2xs font-medium transition-all"
              >
                🏠 Encontrar Célula
              </button>
            </div>
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOpenWhatsApp();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#075E54]"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-sm bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center transition-colors shrink-0"
              title="Enviar no WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Circle Button */}
      <button
        id="whatsapp-floating-trigger"
        onClick={() => setChatOpen(!chatOpen)}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#1ebd5d] rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer transition-all transform hover:scale-105 active:scale-95 group relative"
        title="Fale conosco no WhatsApp"
        aria-label="Fale conosco no WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.83 3.136 1.27 4.927 1.27 5.466 0 9.911-4.444 9.913-9.91 0-2.651-1.032-5.143-2.908-7.02-1.876-1.877-4.366-2.91-7.016-2.91-5.465 0-9.91 4.444-9.913 9.91-.001 1.911.547 3.772 1.586 5.405l.19.297-1.01 3.691 3.777-.991z" />
        </svg>
      </button>
    </div>
  );
};
