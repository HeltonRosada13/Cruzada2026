import React, { useState } from 'react';
import { Menu, X, Shield, Radio, Calendar, Image as ImageIcon, Video, Heart, MapPin, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenRsvp: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onOpenRsvp, syncStatus = 'synced' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Sobre', href: '#sobre', icon: Sparkles },
    { name: 'Momentos', href: '#momentos', icon: Heart },
    { name: 'Fotos', href: '#fotos', icon: ImageIcon },
    { name: 'Vídeos', href: '#videos', icon: Video },
    { name: 'Agenda', href: '#agenda', icon: Calendar },
    { name: 'Testemunhos', href: '#testemunhos', icon: Radio },
    { name: 'Contato', href: '#contato', icon: MapPin },
  ];

  return (
    <nav
      id="main-navbar"
      className="sticky top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-md transition-all"
    >
      {/* Brand Monogram & Title */}
      <a href="#" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-[#C5A059] flex items-center justify-center rounded-sm shadow-sm group-hover:scale-105 transition-transform">
          <span className="text-white font-bold text-xl font-editorial">C</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#1A1A1A]/70 leading-none">
            Catedral de
          </span>
          <span className="font-editorial text-lg leading-tight font-bold text-[#1A1A1A]">
            Amor & Fé
          </span>
        </div>
      </a>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] uppercase tracking-widest font-medium text-[#1A1A1A]/80">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="hover:text-[#C5A059] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#C5A059] hover:after:w-full after:transition-all"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Quick CTA */}
        <button
          id="nav-quick-rsvp-btn"
          onClick={onOpenRsvp}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#C5A059] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#A8843F] transition-all rounded-sm shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Inscrições</span>
        </button>

        {/* Admin Button */}
        <button
          id="nav-admin-btn"
          onClick={onOpenAdmin}
          className="flex items-center gap-2 px-3.5 py-2 border border-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1A1A] hover:text-white transition-all rounded-sm group"
          title="Área Administrativa"
        >
          <Shield className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Painel Admin</span>
          {/* Live Sync Dot */}
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-green-500 animate-pulse'
                : syncStatus === 'syncing'
                ? 'bg-amber-500 animate-spin'
                : 'bg-gray-400'
            }`}
            title={`Status: ${syncStatus}`}
          />
        </button>

        {/* Mobile menu toggle */}
        <button
          id="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#1A1A1A] hover:bg-gray-100 rounded-sm"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-2"
        >
          <div className="flex flex-col divide-y divide-gray-100 text-xs uppercase tracking-widest font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 flex items-center justify-between text-[#1A1A1A] hover:text-[#C5A059] transition-colors"
                >
                  <span>{link.name}</span>
                  <Icon className="w-4 h-4 text-gray-400" />
                </a>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRsvp();
              }}
              className="w-full py-3 bg-[#C5A059] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm"
            >
              <Calendar className="w-4 h-4" />
              Garantir Inscrição
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full py-3 border border-[#1A1A1A] text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-[#1A1A1A] hover:text-white transition-all rounded-sm"
            >
              <Shield className="w-4 h-4" />
              Gerenciar Portal (Admin)
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
