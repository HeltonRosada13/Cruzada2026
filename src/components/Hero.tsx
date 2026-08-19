import React, { useState, useEffect, useRef } from 'react';
import { HeroData } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { MapPin, User, Share2, Play, Calendar, Video, Volume2, VolumeX, X } from 'lucide-react';
import { isYouTubeVideoUrl, formatYouTubeEmbedUrl, isDirectVideoUrl, getYouTubeThumbnail } from '../lib/utils';

interface HeroProps {
  hero: HeroData;
  onOpenRsvp: () => void;
  onOpenShare: () => void;
}

export const Hero: React.FC<HeroProps> = ({ hero, onOpenRsvp, onOpenShare }) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default as requested
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [soundBlockedByBrowser, setSoundBlockedByBrowser] = useState(false);

  const isUserManuallyMutedRef = useRef(false);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);

  const isYouTube = isYouTubeVideoUrl(hero.videoUrl);
  const isDirect = isDirectVideoUrl(hero.videoUrl);
  const hasVideo = isYouTube || isDirect;

  // Determine background image or poster
  const getBackgroundImageUrl = () => {
    if (isYouTube) {
      return getYouTubeThumbnail(hero.videoUrl);
    }
    if (hero.videoUrl && hero.videoUrl.startsWith('http') && !isDirect) {
      return hero.videoUrl;
    }
    return 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1600';
  };

  const backgroundMediaUrl = getBackgroundImageUrl();

  // Helper to reliably apply mute / unmute across HTML5 video & YouTube iframe
  const applyAudioState = (muted: boolean) => {
    setIsMuted(muted);

    if (videoRef.current) {
      videoRef.current.muted = muted;
      if (!muted) {
        videoRef.current.volume = 1;
        videoRef.current.play().catch(() => {});
      }
    }

    if (youtubeIframeRef.current?.contentWindow) {
      const command = muted ? 'mute' : 'unMute';
      youtubeIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
      if (!muted) {
        youtubeIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      }
    }
  };

  // Handle initial unmuted autoplay & browser audio policy
  useEffect(() => {
    if (isDirect && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = isMuted;
      vid.volume = 1;

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Modern browsers may block unmuted autoplay on initial load without user gesture
          if (err.name === 'NotAllowedError') {
            setSoundBlockedByBrowser(true);
            // Temporary muted playback until first user gesture
            vid.muted = true;
            vid.play().catch(() => {});
          }
        });
      }
    }
  }, [hero.videoUrl, isDirect]);

  // Global listener for first user interaction to ensure audio is unmuted immediately
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      setSoundBlockedByBrowser(false);

      if (!isUserManuallyMutedRef.current) {
        applyAudioState(false);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // AUTO-MUTE ON SCROLL: Mute when user scrolls down away from hero, unmute when back in hero
  useEffect(() => {
    const heroEl = heroSectionRef.current;
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When hero is less than 20% visible (scrolled down to other sections) -> Auto MUTE
        if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
          applyAudioState(true);
        } else {
          // Scrolled back into Hero -> Restore sound unless user explicitly clicked Mute
          if (!isUserManuallyMutedRef.current) {
            applyAudioState(false);
          }
        }
      },
      {
        threshold: [0, 0.15, 0.3, 0.6, 1.0],
      }
    );

    observer.observe(heroEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Tab Visibility Change: PAUSE on other tabs / RESUME when returning to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden or user switched to another tab -> PAUSE
        if (videoRef.current) {
          videoRef.current.pause();
        }
        if (youtubeIframeRef.current?.contentWindow) {
          youtubeIframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
          );
        }
      } else {
        // User returned to tab -> RESUME playing
        if (videoRef.current) {
          videoRef.current.muted = isMuted;
          videoRef.current.play().catch(() => {});
        }
        if (youtubeIframeRef.current?.contentWindow) {
          youtubeIframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
            '*'
          );
          if (!isMuted) {
            youtubeIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
              '*'
            );
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMuted]);

  // Toggle Audio Mute / Unmute manually
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    isUserManuallyMutedRef.current = nextMuted;
    setSoundBlockedByBrowser(false);
    applyAudioState(nextMuted);
  };

  return (
    <section
      ref={heroSectionRef}
      id="hero-section"
      className="relative border-b border-gray-100 bg-[#FDFDFC] overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row min-h-[580px] lg:h-[620px] w-full">
        {/* Left Side: Dark Luxury Editorial with Background Video/Media & Countdown */}
        <div className="w-full lg:w-[62%] relative overflow-hidden bg-[#141414] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 group">
          {/* Background Media Layer - Continuous Loop & Unmuted Audio */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {isDirect ? (
              <video
                ref={videoRef}
                src={hero.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onEnded={(e) => {
                  e.currentTarget.currentTime = 0;
                  e.currentTarget.play().catch(() => {});
                }}
                className="w-full h-full object-cover opacity-50 scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
            ) : isYouTube ? (
              <div className="w-full h-full relative pointer-events-none scale-110">
                <iframe
                  ref={youtubeIframeRef}
                  src={formatYouTubeEmbedUrl(hero.videoUrl, true, {
                    loop: true,
                    mute: isMuted,
                    controls: false,
                  })}
                  title={hero.title}
                  className="w-full h-full border-0 absolute inset-0 opacity-45"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
            ) : (
              <div
                className="w-full h-full bg-cover bg-center opacity-45 scale-105 group-hover:scale-100 transition-transform duration-1000"
                style={{
                  backgroundImage: `url(${backgroundMediaUrl})`,
                }}
              />
            )}

            {/* Atmospheric overlay with gradient depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/65 to-black/40 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent to-[#141414]/85 pointer-events-none" />
          </div>

          {/* Top Tag & Sound Status / Watch Video Quick Action */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/25 border border-[#C5A059]/50 rounded-sm backdrop-blur-sm shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <span className="text-[#C5A059] text-[10px] uppercase tracking-[0.25em] font-bold">
                {hero.badge || 'Atividade em Destaque'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Unmuted Audio Control Pill / Indicator */}
              {hasVideo && (
                <button
                  type="button"
                  id="hero-audio-toggle-btn"
                  onClick={toggleMute}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm backdrop-blur-md text-[10px] uppercase tracking-wider font-bold transition-all shadow-md cursor-pointer border ${
                    isMuted
                      ? 'bg-black/60 hover:bg-black text-gray-300 border-white/20'
                      : 'bg-[#C5A059]/90 hover:bg-[#C5A059] text-white border-[#C5A059]'
                  }`}
                  title={isMuted ? 'Clique para Ativar Som' : 'Som Ativo (Clique para Mutar)'}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                      <span>Som Mutado</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 fill-current animate-pulse" />
                      <span className="flex items-center gap-1">
                        <span>Áudio Ativo</span>
                        <span className="hidden sm:inline text-[9px] opacity-80">(Ao Vivo)</span>
                      </span>
                    </>
                  )}
                </button>
              )}

              {hasVideo && (
                <button
                  id="hero-watch-teaser-btn"
                  onClick={() => setVideoModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1A1A1A]/80 hover:bg-[#C5A059] text-white text-[10px] uppercase tracking-widest font-bold rounded-sm backdrop-blur-sm transition-all border border-white/20 active:scale-95 group/btn cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current group-hover/btn:scale-110 transition-transform" />
                  <span>Expandir Vídeo</span>
                </button>
              )}
            </div>
          </div>

          {/* Sound Prompt Notice if browser blocked initial autoplay with sound */}
          {soundBlockedByBrowser && !hasUserInteracted && (
            <div
              onClick={toggleMute}
              className="relative z-10 my-2 px-3.5 py-2 bg-[#C5A059]/90 hover:bg-[#C5A059] text-white text-xs font-semibold rounded-sm flex items-center justify-between gap-3 shadow-lg cursor-pointer border border-white/30 animate-bounce"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Clique em qualquer lugar para liberar o áudio da transmissão</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-xs font-bold">
                Ouvir Áudio
              </span>
            </div>
          )}

          {/* Main Title, Subtitle & Interactive Video Focus Card */}
          <div className="relative z-10 my-auto py-6">
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.12] font-normal tracking-tight mb-4 max-w-2xl text-balance">
              {hero.title}
            </h1>
            <p className="text-white/80 text-sm sm:text-base font-light leading-relaxed max-w-xl font-sans mb-6">
              {hero.subtitle}
            </p>

            {/* Hero Interactive Media Player Trigger Card */}
            {hasVideo && (
              <div
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-3.5 p-2.5 sm:p-3 pr-5 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-sm border border-white/20 cursor-pointer group/card transition-all shadow-lg hover:border-[#C5A059]/60 max-w-lg"
              >
                <div className="relative w-16 sm:w-20 aspect-video rounded-xs overflow-hidden bg-black shrink-0 border border-white/20">
                  <img
                    src={backgroundMediaUrl}
                    alt={hero.title}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-[#C5A059] text-white flex items-center justify-center shadow-md group-hover/card:scale-115 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#C5A059] font-bold">
                    <Video className="w-3 h-3" />
                    <span>{isYouTube ? 'Transmissão Oficial YouTube' : 'Vídeo da Catedral'}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate group-hover/card:text-[#C5A059] transition-colors">
                    Clique para assistir com tela cheia em HD
                  </h4>
                  <span className="text-[10px] text-white/60 block truncate">
                    {hero.preacher} • Som e Imagem em Alta Definição
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live Countdown Timer */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <span className="text-white/50 text-[9px] uppercase tracking-[0.2em] font-medium block mb-2">
              Contagem Regressiva Oficial para o Início
            </span>
            <CountdownTimer targetDate={hero.eventDate} />
          </div>
        </div>

        {/* Right Side: Sleek Editorial Info Card */}
        <div className="w-full lg:w-[38%] bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100">
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#C5A059]" />
                  Localização
                </span>
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">
                {hero.location}
              </p>
              {hero.locationDetails && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {hero.locationDetails}
                </p>
              )}
            </div>

            {/* Preacher / Speaker */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-1.5 mb-1">
                <User className="w-3 h-3 text-[#C5A059]" />
                Preletor Principal
              </span>
              <p className="font-editorial text-2xl text-[#1A1A1A] leading-tight font-bold">
                {hero.preacher}
              </p>
              {hero.preacherRole && (
                <p className="text-xs text-[#C5A059] font-medium uppercase tracking-wider mt-0.5">
                  {hero.preacherRole}
                </p>
              )}
            </div>

            {/* Quote */}
            {hero.quote && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-[#C5A059] pl-3 py-0.5">
                  "{hero.quote}"
                </p>
              </div>
            )}

            {/* Video Quick Link if available */}
            {hasVideo && (
              <div className="pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-gray-50 hover:bg-[#141414] text-gray-700 hover:text-white rounded-sm text-xs font-semibold flex items-center justify-between border border-gray-200 transition-all group/vbtn cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-[#C5A059] fill-current" />
                    <span>Ver Vídeo da Atividade</span>
                  </span>
                  <span className="text-[10px] text-gray-400 group-hover/vbtn:text-[#C5A059] font-bold uppercase tracking-wider">
                    Abrir Player →
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-8 flex items-center gap-3">
            <button
              id="hero-register-btn"
              onClick={onOpenRsvp}
              className="flex-1 py-3.5 px-6 bg-[#C5A059] hover:bg-[#A8843F] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{hero.ctaText || 'Garantir Inscrição'}</span>
            </button>

            <button
              id="hero-share-btn"
              onClick={onOpenShare}
              className="p-3.5 border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black rounded-sm transition-all flex items-center justify-center group cursor-pointer"
              title="Compartilhar Atividade"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal Player with Sound & Full Controls */}
      {videoModalOpen && (
        <div
          id="hero-video-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
        >
          <div className="relative w-full max-w-4xl bg-black rounded-sm overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-[#141414] border-b border-white/10 text-white">
              <div className="flex items-center gap-2.5 truncate mr-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-ping" />
                <span className="text-xs uppercase tracking-widest font-bold text-[#C5A059] truncate">
                  {hero.title}
                </span>
              </div>
              <button
                id="close-hero-video-modal-btn"
                onClick={() => setVideoModalOpen(false)}
                className="px-3 py-1 bg-white/10 hover:bg-white/25 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors shrink-0 cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {isYouTube ? (
                <iframe
                  src={formatYouTubeEmbedUrl(hero.videoUrl, true, { loop: true, mute: false })}
                  title={hero.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : isDirect ? (
                <video
                  src={hero.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted={false}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center">
                  <Play className="w-12 h-12 text-[#C5A059] mb-3" />
                  <p className="text-sm mb-2">Nenhum link de vídeo compatível configurado.</p>
                  <p className="text-xs text-gray-400">
                    Selecione um vídeo no Painel Admin ou insira uma URL do YouTube.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#141414] border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C5A059]" />
                {hero.preacher}
              </span>
              <span className="text-[11px] text-[#C5A059] font-medium">
                Catedral de Amor e Fé • Transmissão em Alta Definição
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

