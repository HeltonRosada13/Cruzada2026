import React, { useState } from 'react';
import { VideoItem } from '../types';
import { Video, Play, Clock, Calendar, User, ExternalLink, X } from 'lucide-react';
import { formatYouTubeEmbedUrl, isYouTubeVideoUrl, getYouTubeThumbnail } from '../lib/utils';

interface VideoGalleryProps {
  videos: VideoItem[];
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const featuredVideo = videos.find((v) => v.isFeatured) || videos[0];
  const regularVideos = videos.filter((v) => v.id !== featuredVideo?.id);

  return (
    <section id="videos" className="py-16 sm:py-24 border-b border-gray-100 bg-[#F9F9F7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-[10px] uppercase tracking-[0.25em] font-bold rounded-sm mb-3">
              <Video className="w-3 h-3" />
              Mensagens & Transmissões
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#1A1A1A] font-bold tracking-tight">
              Palavra Gravada & Adoração
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-md font-sans leading-relaxed">
            Acompanhe as ministrações completas, cultos ao vivo e mensagens de fé para edificar sua vida onde quer que esteja.
          </p>
        </div>

        {/* Featured Video High-Impact Card */}
        {featuredVideo && (
          <div className="mb-12 bg-[#141414] rounded-sm overflow-hidden text-white grid grid-cols-1 lg:grid-cols-12 shadow-md">
            {/* Thumbnail and Play Trigger */}
            <div
              onClick={() => setActiveVideo(featuredVideo)}
              className="lg:col-span-7 relative aspect-video bg-black cursor-pointer group overflow-hidden"
            >
              <img
                src={featuredVideo.thumbnailUrl || getYouTubeThumbnail(featuredVideo.youtubeUrl)}
                alt={featuredVideo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#C5A059] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-sm text-[9px] uppercase tracking-widest text-[#C5A059] font-bold">
                  Em Destaque
                </span>
                {featuredVideo.duration && (
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-sm text-[10px] text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C5A059]" />
                    {featuredVideo.duration}
                  </span>
                )}
              </div>
            </div>

            {/* Featured Video Meta Info */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059]">
                  Culto Solene Gravado
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-white font-bold leading-tight">
                  {featuredVideo.title}
                </h3>
                {featuredVideo.speaker && (
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <User className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Ministrado por: <strong className="text-white">{featuredVideo.speaker}</strong></span>
                  </div>
                )}
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Assista a esta mensagem profética que impactou centenas de famílias com revelação bíblica e poder de oração.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  {featuredVideo.date || 'Disponível em HD'}
                </span>
                <button
                  onClick={() => setActiveVideo(featuredVideo)}
                  className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#A8843F] text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 rounded-sm transition-all shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Assistir Agora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeUrl)}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-[#C5A059]/90 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white rounded-xs text-[10px] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-[#C5A059]" />
                    {video.duration}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-editorial text-lg font-bold text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors leading-snug mb-2">
                    {video.title}
                  </h4>
                  {video.speaker && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                      <User className="w-3 h-3 text-gray-400" />
                      {video.speaker}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400">
                  <span>{video.date || 'Recente'}</span>
                  <span className="text-[#C5A059] font-bold group-hover:underline">Assistir</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div
          id="video-player-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
        >
          <div className="relative w-full max-w-4xl bg-black rounded-sm overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-[#141414] border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#C5A059] fill-current" />
                <span className="text-xs uppercase tracking-widest font-bold text-white truncate max-w-lg">
                  {activeVideo.title}
                </span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 text-white/60 hover:text-white transition-colors"
                title="Fechar Vídeo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {isYouTubeVideoUrl(activeVideo.youtubeUrl) ? (
                <iframe
                  src={formatYouTubeEmbedUrl(activeVideo.youtubeUrl, true)}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={activeVideo.youtubeUrl} controls autoPlay className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
