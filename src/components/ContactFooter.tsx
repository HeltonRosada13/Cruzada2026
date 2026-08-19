import React from 'react';
import { ContactInfo, ServiceTime } from '../types';
import { MapPin, Phone, Mail, Youtube, Instagram, Facebook, Disc, MessageCircle, Heart, Shield } from 'lucide-react';

interface ContactFooterProps {
  contact: ContactInfo;
  services: ServiceTime[];
  syncStatus?: 'synced' | 'syncing' | 'offline';
  onOpenAdmin: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  contact,
  services,
  syncStatus = 'synced',
  onOpenAdmin,
}) => {
  return (
    <footer id="contato" className="bg-[#141414] text-white/70 pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C5A059] flex items-center justify-center rounded-sm">
                <span className="text-white font-bold text-xl font-editorial">C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/60">
                  Catedral de
                </span>
                <span className="font-editorial text-lg leading-tight font-bold text-white">
                  Amor & Fé
                </span>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-sans max-w-sm">
              Um lugar de refúgio, ensino bíblico e adoração genuína. Conectando corações ao Deus vivo e transformando nossa sociedade pelo evangelho.
            </p>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 pt-2">
              {contact.socialLinks.youtube && (
                <a
                  href={contact.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-sm bg-white/5 hover:bg-[#C5A059] hover:text-white flex items-center justify-center transition-colors text-white/80"
                  title="Canal no YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {contact.socialLinks.instagram && (
                <a
                  href={contact.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-sm bg-white/5 hover:bg-[#C5A059] hover:text-white flex items-center justify-center transition-colors text-white/80"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {contact.socialLinks.facebook && (
                <a
                  href={contact.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-sm bg-white/5 hover:bg-[#C5A059] hover:text-white flex items-center justify-center transition-colors text-white/80"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {contact.socialLinks.whatsappChannel && (
                <a
                  href={contact.socialLinks.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-sm bg-white/5 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-colors text-white/80"
                  title="Canal WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {contact.socialLinks.spotify && (
                <a
                  href={contact.socialLinks.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-sm bg-white/5 hover:bg-[#1DB954] hover:text-white flex items-center justify-center transition-colors text-white/80"
                  title="Spotify Podcasts & Louvores"
                >
                  <Disc className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Service Times (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059] block">
              Horários de Celebração
            </span>
            <div className="space-y-2 text-xs">
              {services.map((s) => (
                <div key={s.id} className="flex items-start justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/80 font-medium">{s.title}</span>
                  <span className="text-[#C5A059] font-bold shrink-0 ml-2">{s.day} {s.time}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059] block">
              Canais de Atendimento
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>{contact.address} • {contact.cityState}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{contact.email}</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-sm transition-all"
                >
                  <Shield className="w-3 h-3 text-[#C5A059]" />
                  Acesso Administrativo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sleek Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/50 gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Catedral de Amor e Fé. Todos os direitos reservados.</span>
          </div>

          <div>
            <span className="text-white/40">Desenvolvido com excelência por</span>
            <span className="text-white font-bold ml-1.5 tracking-wider">Baobá Universe</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-green-500 animate-pulse'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-500 animate-spin'
                  : 'bg-gray-500'
              }`}
            />
            <span className="text-white/80 font-medium">
              {syncStatus === 'synced' ? 'Sincronizado Cloud' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Cache Local'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
