import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Twitter, Facebook, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
  onNotifyToast?: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title = 'Igreja Catedral de Amor e Fé',
  url = typeof window !== 'undefined' ? window.location.href : '',
  onNotifyToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (onNotifyToast) onNotifyToast('Link copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Participe conosco na Igreja Catedral de Amor e Fé: ${title}`,
          url,
        });
        onClose();
      } catch {
        // User cancelled
      }
    }
  };

  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — Participe conosco na Catedral de Amor e Fé: ${url}`)}`;
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — Catedral de Amor e Fé`)}&url=${encodeURIComponent(url)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const shareTelegram = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div
      id="share-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-sm border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-editorial text-xl font-bold text-[#1A1A1A]">
              Compartilhar Atividade
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 font-sans leading-relaxed">
          Convide seus amigos e familiares para estarem conosco nesta programação abençoada.
        </p>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <a
            href={shareWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-sm transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
          </a>

          <a
            href={shareTelegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-sm transition-all"
          >
            <Send className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Telegram</span>
          </a>

          <a
            href={shareFacebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-sm transition-all"
          >
            <Facebook className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Facebook</span>
          </a>

          <a
            href={shareTwitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-sm transition-all"
          >
            <Twitter className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Twitter</span>
          </a>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-gray-600 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-sm transition-all shrink-0 ${
              copied ? 'bg-green-600 text-white' : 'bg-[#1A1A1A] hover:bg-[#C5A059] text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3 border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            Opções Nativas do Aparelho
          </button>
        )}
      </div>
    </div>
  );
};
