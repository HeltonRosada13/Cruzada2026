import React, { useState } from 'react';
import { PhotoItem } from '../types';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, Maximize2, Share2, Filter } from 'lucide-react';

interface PhotoGalleryProps {
  photos: PhotoItem[];
  categories: string[];
  onOpenShare: (title?: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, categories, onOpenShare }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos = selectedCategory === 'Todos'
    ? photos
    : photos.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const prevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  // Double photos array for seamless marquee infinite loop
  const marqueePhotos = [...photos, ...photos];

  return (
    <section id="fotos" className="py-16 sm:py-24 border-b border-gray-100 bg-[#FDFDFC] overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] text-[10px] uppercase tracking-[0.25em] font-bold rounded-sm mb-3">
              <ImageIcon className="w-3 h-3" />
              Galeria de Momentos Sagrados
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#1A1A1A] font-bold tracking-tight">
              Registros da Glória & Comunhão
            </h2>
          </div>
          <p className="text-gray-500 text-sm max-w-md font-sans leading-relaxed">
            Cada fotografia é um testemunho visual do agir soberano de Deus em nossa comunidade e nas vidas transformadas.
          </p>
        </div>
      </div>

      {/* Infinite Marquee Strip */}
      <div className="relative w-full overflow-hidden py-4 border-y border-gray-100 bg-[#141414] mb-12">
        <div className="animate-marquee flex items-center gap-4">
          {marqueePhotos.map((photo, i) => (
            <div
              key={`${photo.id}-marquee-${i}`}
              onClick={() => {
                const idx = photos.findIndex((p) => p.id === photo.id);
                if (idx !== -1) {
                  setSelectedCategory('Todos');
                  openLightbox(idx);
                }
              }}
              className="relative w-64 sm:w-80 h-44 sm:h-52 shrink-0 rounded-sm overflow-hidden cursor-pointer group"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block mb-0.5">
                  {photo.category}
                </span>
                <p className="text-xs font-semibold font-editorial truncate">
                  {photo.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1 mr-2 shrink-0">
            <Filter className="w-3 h-3" />
            Filtrar:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded-sm whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white" />
              
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-sm text-[9px] uppercase tracking-widest text-[#C5A059] font-bold">
                    {photo.category}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div>
                  <h4 className="font-editorial text-lg font-bold leading-snug">
                    {photo.title}
                  </h4>
                  {photo.date && (
                    <span className="text-[10px] text-white/70 block mt-0.5">
                      {photo.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-sm border border-dashed border-gray-200">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              Nenhuma foto encontrada para a categoria selecionada.
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div
          id="photo-lightbox"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in"
        >
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between p-4 sm:p-6 text-white border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-[#C5A059] text-white rounded-sm text-[10px] uppercase tracking-widest font-bold">
                {filteredPhotos[lightboxIndex].category}
              </span>
              <span className="font-editorial text-lg text-white font-medium">
                {filteredPhotos[lightboxIndex].title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenShare(filteredPhotos[lightboxIndex].title)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-sm transition-all"
                title="Compartilhar foto"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={closeLightbox}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-sm transition-all"
                title="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image & Navigation */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-4 sm:left-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm"
              title="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={filteredPhotos[lightboxIndex].url}
              alt={filteredPhotos[lightboxIndex].title}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-sm shadow-2xl animate-in zoom-in-95 duration-200"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-4 sm:right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm"
              title="Próxima foto"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Footer */}
          <div className="p-4 text-center text-white/60 text-xs border-t border-white/10">
            <span>
              Foto {lightboxIndex + 1} de {filteredPhotos.length}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
