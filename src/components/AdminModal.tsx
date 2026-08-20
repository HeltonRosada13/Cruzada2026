import React, { useState } from 'react';
import { ChurchData, Pillar, PhotoItem, VideoItem, ServiceTime, ChurchEvent, Testimonial } from '../types';
import { useRegistrations } from '../lib/storage';
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Video,
  Calendar,
  Heart,
  Share2,
  Database,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Phone,
  Lock,
  Download,
  FileJson,
  RefreshCw,
  Play,
  Check,
  Search,
  ExternalLink,
  Film,
  FolderOpen,
  Code,
  Copy,
} from 'lucide-react';
import { compressImageFile, isYouTubeVideoUrl, getYouTubeThumbnail, isDirectVideoUrl, formatYouTubeEmbedUrl } from '../lib/utils';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ChurchData;
  onSave: (newData: ChurchData) => Promise<void>;
  onReset: () => Promise<void>;
  onForceSync: () => Promise<void>;
  syncStatus: 'synced' | 'syncing' | 'offline';
  onNotifyToast: (msg: string) => void;
}

type TabKey =
  | 'hero'
  | 'pillars'
  | 'photos'
  | 'videos'
  | 'schedule'
  | 'testimonials'
  | 'contact'
  | 'database';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  onReset,
  onForceSync,
  syncStatus,
  onNotifyToast,
}) => {
  const { registrations } = useRegistrations();

  const [activeTab, setActiveTab] = useState<TabKey>('hero');
  const [formData, setFormData] = useState<ChurchData>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Quick photo upload state
  const [photoBatchCategory, setPhotoBatchCategory] = useState('Louvor');
  const [photoBatchTitle, setPhotoBatchTitle] = useState('');

  // Video form state
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoSpeaker, setNewVideoSpeaker] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('1h 20m');
  const [alsoSetHeroOnAdd, setAlsoSetHeroOnAdd] = useState(false);
  const [alsoSetFeaturedOnAdd, setAlsoSetFeaturedOnAdd] = useState(false);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
    thumbnail?: string;
  } | null>(null);

  // Hero Media Gallery Pickers State
  const [videoGalleryPickerOpen, setVideoGalleryPickerOpen] = useState(false);
  const [photoGalleryPickerOpen, setPhotoGalleryPickerOpen] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [photoFilterCategory, setPhotoFilterCategory] = useState('Todos');
  const [syncEventInfoWithVideo, setSyncEventInfoWithVideo] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  if (!isOpen) return null;

  // Handlers for deleting items safely without native confirm()
  const handleDeletePhoto = (photoId: string, photoTitle: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Fotografia',
      message: `Tem certeza que deseja excluir a foto "${photoTitle}" da galeria? Esta ação removerá a foto da exibição.`,
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          photos: prev.photos.filter((p) => p.id !== photoId),
        }));
        onNotifyToast('Foto excluída com sucesso da galeria!');
        setDeleteConfirmState(null);
      },
    });
  };

  const handleDeleteVideo = (videoId: string, videoTitle: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Vídeo',
      message: `Tem certeza que deseja excluir o vídeo "${videoTitle}" da galeria?`,
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          videos: prev.videos.filter((v) => v.id !== videoId),
        }));
        onNotifyToast('Vídeo excluído com sucesso!');
        setDeleteConfirmState(null);
      },
    });
  };

  const handleDeleteService = (serviceId: string, serviceTitle: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Culto/Programação',
      message: `Tem certeza que deseja remover "${serviceTitle}" da grade de cultos semanais?`,
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          regularServices: prev.regularServices.filter((s) => s.id !== serviceId),
        }));
        onNotifyToast('Culto removido da programação!');
        setDeleteConfirmState(null);
      },
    });
  };

  const handleDeleteTestimonial = (testimonialId: string, testimonialName: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Testemunho',
      message: `Tem certeza que deseja excluir o testemunho de "${testimonialName}"?`,
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          testimonials: prev.testimonials.filter((t) => t.id !== testimonialId),
        }));
        onNotifyToast('Testemunho excluído com sucesso!');
        setDeleteConfirmState(null);
      },
    });
  };

  // Add new Service
  const handleAddService = () => {
    const newService: ServiceTime = {
      id: `svc-${Date.now()}`,
      day: 'Domingo',
      time: '19:00',
      title: 'Culto de Celebração & Fé',
      description: 'Momento de louvor, adoração e comunhão com a palavra de Deus.',
      location: 'Nave Principal',
    };
    setFormData((prev) => ({
      ...prev,
      regularServices: [...prev.regularServices, newService],
    }));
    onNotifyToast('Novo culto adicionado! Edite os campos e clique em Salvar.');
  };

  // Add new Testimonial
  const handleAddTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: `test-${Date.now()}`,
      name: 'Novo Membro',
      role: 'Membro da Catedral',
      quote: 'Deus transformou a minha vida e a da minha família através da comunhão e da palavra nesta casa.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setFormData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial],
    }));
    onNotifyToast('Novo testemunho adicionado! Edite os dados e clique em Salvar.');
  };

  // Handler to select a video for the Hero section
  const handleSelectVideoForHero = (video: VideoItem, syncDetails: boolean = false) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        videoUrl: video.youtubeUrl,
        ...(syncDetails ? { title: video.title, preacher: video.speaker } : {}),
      },
    }));
    setVideoGalleryPickerOpen(false);
    onNotifyToast(`Vídeo "${video.title}" definido para o Hero com sucesso!`);
  };

  // Handler to select a photo for the Hero section
  const handleSelectPhotoForHero = (photo: PhotoItem) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        videoUrl: photo.url,
      },
    }));
    setPhotoGalleryPickerOpen(false);
    onNotifyToast(`Foto "${photo.title}" definida como fundo do Hero!`);
  };

  // Direct upload of MP4 / image for the Hero
  const handleHeroDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (file.type.startsWith('image/')) {
        const dataUrl = await compressImageFile(file, 1920, 0.85);
        setFormData((prev) => ({
          ...prev,
          hero: { ...prev.hero, videoUrl: dataUrl },
        }));
        onNotifyToast('Imagem do Hero carregada e otimizada com sucesso!');
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const videoDataUrl = event.target?.result as string;
          setFormData((prev) => ({
            ...prev,
            hero: { ...prev.hero, videoUrl: videoDataUrl },
          }));
          onNotifyToast('Vídeo do Hero carregado com sucesso!');
        };
        reader.readAsDataURL(file);
      } else {
        alert('Formato não suportado. Por favor envie imagem ou vídeo MP4.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o arquivo.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onNotifyToast('Todas as alterações foram salvas e sincronizadas com a nuvem!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  // Multiple photos upload and compression
  const handleMultiplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newPhotos: PhotoItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageFile(file, 1400, 0.82);
        newPhotos.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          title: photoBatchTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: photoBatchCategory,
          url: dataUrl,
          date: new Date().toISOString().split('T')[0],
          featured: false,
        });
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...newPhotos, ...prev.photos],
      }));

      onNotifyToast(`${newPhotos.length} foto(s) carregada(s) e otimizada(s) com sucesso!`);
      setPhotoBatchTitle('');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar as fotos enviadas.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Direct Video file upload from device
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Por favor selecione um arquivo de vídeo válido (ex: MP4, WebM, MOV).');
      return;
    }

    setIsUploading(true);
    try {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const reader = new FileReader();
      reader.onload = (event) => {
        const videoDataUrl = event.target?.result as string;
        
        // Auto-extract thumbnail using hidden video canvas
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.src = videoDataUrl;

        let extractedThumbnail = 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=800';

        videoElement.onloadeddata = () => {
          videoElement.currentTime = 1;
        };

        videoElement.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(videoElement.videoWidth || 640, 640);
            canvas.height = Math.min(videoElement.videoHeight || 360, 360);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              extractedThumbnail = canvas.toDataURL('image/jpeg', 0.82);
            }
          } catch (err) {
            console.warn('Could not generate canvas thumbnail from video', err);
          }

          setUploadedVideoFile({
            name: file.name,
            size: `${fileSizeMb} MB`,
            dataUrl: videoDataUrl,
            thumbnail: extractedThumbnail,
          });

          if (!newVideoTitle.trim()) {
            setNewVideoTitle(cleanFileName);
          }

          onNotifyToast(`Vídeo "${file.name}" carregado com sucesso! Não é necessário digitar URL.`);
          setIsUploading(false);
        };

        videoElement.onerror = () => {
          setUploadedVideoFile({
            name: file.name,
            size: `${fileSizeMb} MB`,
            dataUrl: videoDataUrl,
            thumbnail: extractedThumbnail,
          });
          if (!newVideoTitle.trim()) {
            setNewVideoTitle(cleanFileName);
          }
          onNotifyToast(`Vídeo "${file.name}" pronto para publicação.`);
          setIsUploading(false);
        };
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar o arquivo de vídeo.');
      setIsUploading(false);
    } finally {
      e.target.value = '';
    }
  };

  // Add video with destination routing (URL is completely optional if file is uploaded or title is provided)
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check video source: uploaded file, or URL, or default placeholder video
    const hasUploadedFile = !!uploadedVideoFile?.dataUrl;
    const hasUrl = !!newVideoUrl.trim();

    if (!hasUploadedFile && !hasUrl && !newVideoTitle.trim()) {
      alert('Por favor, selecione um arquivo de vídeo do seu dispositivo ou informe o título/link do vídeo.');
      return;
    }

    const videoTitleClean = newVideoTitle.trim() || uploadedVideoFile?.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Culto & Palavra Profética';
    const videoUrlClean = uploadedVideoFile?.dataUrl || newVideoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const videoSpeakerClean = newVideoSpeaker.trim() || 'Catedral de Amor e Fé';
    const videoDurationClean = newVideoDuration.trim() || '1h 15m';
    const finalThumbnail = uploadedVideoFile?.thumbnail || getYouTubeThumbnail(videoUrlClean);

    const newVid: VideoItem = {
      id: `vid-${Date.now()}`,
      title: videoTitleClean,
      youtubeUrl: videoUrlClean,
      speaker: videoSpeakerClean,
      duration: videoDurationClean,
      date: 'Recente',
      isFeatured: alsoSetFeaturedOnAdd || formData.videos.length === 0,
      thumbnailUrl: finalThumbnail,
    };

    setFormData((prev) => {
      let updatedVideos = [newVid, ...prev.videos];
      if (alsoSetFeaturedOnAdd) {
        updatedVideos = updatedVideos.map((v) => ({
          ...v,
          isFeatured: v.id === newVid.id,
        }));
      }

      let updatedHero = prev.hero;
      if (alsoSetHeroOnAdd) {
        updatedHero = {
          ...prev.hero,
          videoUrl: videoUrlClean,
          title: videoTitleClean,
          preacher: videoSpeakerClean,
        };
      }

      return {
        ...prev,
        videos: updatedVideos,
        hero: updatedHero,
      };
    });

    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoSpeaker('');
    setUploadedVideoFile(null);
    setAlsoSetHeroOnAdd(false);
    setAlsoSetFeaturedOnAdd(false);

    if (alsoSetHeroOnAdd) {
      onNotifyToast('Vídeo adicionado à Galeria de Vídeos e definido como Atividade Principal do Hero!');
    } else {
      onNotifyToast('Vídeo adicionado com sucesso à Galeria de Vídeos da Catedral!');
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_catedral_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotifyToast('Backup exportado com sucesso!');
  };

  // Copy current data formatted for defaultData.ts
  const handleCopyDefaultDataTS = async () => {
    try {
      const codeOutput = `import { ChurchData } from '../types';

export const defaultChurchData: ChurchData = ${JSON.stringify(formData, null, 2)};
`;
      await navigator.clipboard.writeText(codeOutput);
      onNotifyToast('Código do defaultData.ts copiado para a Área de Transferência!');
    } catch {
      alert('Não foi possível copiar automaticamente. Use a exportação JSON.');
    }
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.hero && parsed.pillars) {
          setFormData(parsed);
          onNotifyToast('Backup importado com sucesso! Clique em "Salvar Alterações".');
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { key: 'hero', label: 'Atividade & Hero', icon: Sparkles },
    { key: 'pillars', label: 'Momentos Marcantes', icon: Layers },
    { key: 'photos', label: 'Galeria de Fotos', icon: ImageIcon },
    { key: 'videos', label: 'Galeria de Vídeos', icon: Video },
    { key: 'schedule', label: 'Agenda & Cultos', icon: Calendar },
    { key: 'testimonials', label: 'Testemunhos', icon: Heart },
    { key: 'contact', label: 'Redes & Contatos', icon: Phone },
    { key: 'database', label: 'Status do Banco', icon: Database },
  ];

  return (
    <div
      id="admin-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in"
    >
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-sm border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-[#141414] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center rounded-sm text-white font-bold font-editorial">
              C
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold leading-none">
                Painel Administrativo Catedral
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">
                Gestão em Tempo Real • Nuvem Sincronizada
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('videos');
                onNotifyToast('Navegando para a Galeria de Vídeos. Preencha os dados para adicionar.');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all border border-white/20"
              title="Adicionar um novo vídeo na galeria ou no hero"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Adicionar Vídeo</span>
            </button>

            <button
              id="admin-save-btn"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#C5A059] hover:bg-[#A8843F] text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 rounded-sm shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white rounded-sm transition-colors"
              title="Fechar Painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto px-6 py-2 bg-[#F9F9F7] border-b border-gray-200 shrink-0 no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as TabKey)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-black'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FDFDFC]">
          {/* TAB 1: HERO & ATIVIDADE PRINCIPAL */}
          {activeTab === 'hero' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in">
              <div>
                <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                  Atividade Principal & Destaque Hero
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  Configure o evento em foco, contagem regressiva, preletor e mídia de fundo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Crachá Superior (Badge)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.badge}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, badge: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Título Principal do Evento
                  </label>
                  <input
                    type="text"
                    value={formData.hero.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Subtítulo / Lema Explicativo
                  </label>
                  <textarea
                    rows={2}
                    value={formData.hero.subtitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Data e Hora do Evento (Contagem Regressiva)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.hero.eventDate.slice(0, 16)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, eventDate: new Date(e.target.value).toISOString() },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Preletor / Ministro
                  </label>
                  <input
                    type="text"
                    value={formData.hero.preacher}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, preacher: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Cargo / Título do Preletor
                  </label>
                  <input
                    type="text"
                    value={formData.hero.preacherRole}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, preacherRole: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Localização Principal
                  </label>
                  <input
                    type="text"
                    value={formData.hero.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, location: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Citação / Frase de Impacto
                  </label>
                  <input
                    type="text"
                    value={formData.hero.quote}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, quote: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-gray-800 font-bold">
                        Mídia do Hero (Vídeo ou Imagem de Destaque)
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Escolha um vídeo da galeria da igreja, uma foto de fundo ou cole um link do YouTube / MP4.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        id="hero-open-video-gallery-btn"
                        type="button"
                        onClick={() => setVideoGalleryPickerOpen(true)}
                        className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-sm transition-all shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Galeria de Vídeos ({formData.videos.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('videos');
                          onNotifyToast('Preencha os dados do vídeo e marque "Definir também como Vídeo Principal do Hero".');
                        }}
                        className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#A8843F] text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-sm transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cadastrar Novo Vídeo</span>
                      </button>

                      <button
                        id="hero-open-photo-gallery-btn"
                        type="button"
                        onClick={() => setPhotoGalleryPickerOpen(true)}
                        className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-sm transition-all shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Galeria de Fotos ({formData.photos.length})</span>
                      </button>

                      <label className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 rounded-sm transition-all shadow-2xs cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                        <span>Upload Direto</span>
                        <input
                          type="file"
                          accept="video/mp4,image/*"
                          onChange={handleHeroDirectUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Input field with status indicator and clear button */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={formData.hero.videoUrl}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, videoUrl: e.target.value },
                          }))
                        }
                        placeholder="Cole a URL do YouTube (ex: https://www.youtube.com/watch?v=...) ou link direto .mp4 ou imagem"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-sm focus:border-[#C5A059] focus:outline-none pr-28"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {isYouTubeVideoUrl(formData.hero.videoUrl) && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            YouTube
                          </span>
                        )}
                        {isDirectVideoUrl(formData.hero.videoUrl) && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            MP4
                          </span>
                        )}
                        {!isYouTubeVideoUrl(formData.hero.videoUrl) &&
                          !isDirectVideoUrl(formData.hero.videoUrl) &&
                          formData.hero.videoUrl && (
                            <span className="text-[9px] bg-[#C5A059]/20 text-[#8E6D24] px-1.5 py-0.5 rounded font-bold uppercase">
                              Foto
                            </span>
                          )}
                      </div>
                    </div>

                    {formData.hero.videoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, videoUrl: '' },
                          }))
                        }
                        className="px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-sm font-medium transition-colors"
                        title="Limpar mídia do Hero"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {/* Active Media Preview / Current Setup */}
                  {formData.hero.videoUrl && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-20 h-12 bg-black rounded-xs overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-300">
                          {isYouTubeVideoUrl(formData.hero.videoUrl) ? (
                            <img
                              src={getYouTubeThumbnail(formData.hero.videoUrl)}
                              alt="Thumbnail do Hero"
                              className="w-full h-full object-cover"
                            />
                          ) : isDirectVideoUrl(formData.hero.videoUrl) ? (
                            <video
                              src={formData.hero.videoUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={formData.hero.videoUrl}
                              alt="Cover do Hero"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>

                        <div className="truncate text-xs">
                          <span className="font-bold text-[#1A1A1A] block truncate">
                            Mídia em reprodução no Hero
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono block truncate max-w-md">
                            {formData.hero.videoUrl}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewMediaUrl(formData.hero.videoUrl)}
                          className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-900 text-[10px] uppercase font-bold text-gray-800 rounded-sm flex items-center gap-1 shadow-2xs"
                        >
                          <Play className="w-3 h-3 text-[#C5A059]" />
                          <span>Assistir Prévia</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Select: Church Videos Ready for Hero */}
                  {formData.videos.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-[#C5A059]" />
                          Vídeos da Galeria (Clique para definir no Hero)
                        </span>
                        <button
                          type="button"
                          onClick={() => setVideoGalleryPickerOpen(true)}
                          className="text-[10px] text-[#C5A059] hover:underline font-bold uppercase tracking-wider"
                        >
                          Ver todos ({formData.videos.length}) →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {formData.videos.slice(0, 3).map((v) => {
                          const isSelected = formData.hero.videoUrl === v.youtubeUrl;
                          return (
                            <div
                              key={v.id}
                              className={`p-2.5 rounded-sm border transition-all flex flex-col justify-between gap-2 ${
                                isSelected
                                  ? 'bg-[#FDF9F0] border-[#C5A059] shadow-2xs'
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <img
                                  src={v.thumbnailUrl || getYouTubeThumbnail(v.youtubeUrl)}
                                  alt={v.title}
                                  className="w-14 h-10 object-cover rounded-xs shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h6 className="text-[11px] font-bold text-[#1A1A1A] leading-tight line-clamp-1">
                                    {v.title}
                                  </h6>
                                  <span className="text-[9px] text-gray-500 block truncate">
                                    {v.speaker}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSelectVideoForHero(v, false)}
                                className={`w-full py-1.5 px-2 text-[9px] uppercase tracking-wider font-bold rounded-xs flex items-center justify-center gap-1 transition-all ${
                                  isSelected
                                    ? 'bg-[#C5A059] text-white'
                                    : 'bg-gray-100 hover:bg-[#1A1A1A] text-gray-700 hover:text-white'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Ativo no Hero</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-2.5 h-2.5 text-[#C5A059]" />
                                    <span>Colocar no Hero</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PILARES & MOMENTOS MARCANTES */}
          {activeTab === 'pillars' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in">
              <div>
                <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                  Pilares & Momentos Marcantes
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  Edite os 4 pilares de fé fundamentais da catedral.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {formData.pillars.map((pillar, idx) => (
                  <div
                    key={pillar.id}
                    className="p-5 bg-white border border-gray-200 rounded-sm space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold flex items-center justify-center font-editorial">
                        {pillar.number}
                      </span>
                      <select
                        value={pillar.iconName}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setFormData((prev) => ({
                            ...prev,
                            pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, iconName: val } : p)),
                          }));
                        }}
                        className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded-sm"
                      >
                        <option value="Music">Ícone: Louvor (Music)</option>
                        <option value="BookOpen">Ícone: Palavra (BookOpen)</option>
                        <option value="Users">Ícone: Família (Users)</option>
                        <option value="Flame">Ícone: Oração (Flame)</option>
                        <option value="HeartHandshake">Ícone: Ação Social (Heart)</option>
                        <option value="Sparkles">Ícone: Milagres (Sparkles)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, title: val } : p)),
                          }));
                        }}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                        Descrição
                      </label>
                      <textarea
                        rows={2}
                        value={pillar.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            pillars: prev.pillars.map((p, i) => (i === idx ? { ...p, description: val } : p)),
                          }));
                        }}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GALERIA DE FOTOS */}
          {activeTab === 'photos' && (
            <div className="max-w-5xl space-y-8 animate-in fade-in">
              <div>
                <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                  Gerenciamento da Galeria de Fotos
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  Faça upload de fotos individuais ou em lote com compressão automática inteligente.
                </p>
              </div>

              {/* Upload Box */}
              <div className="p-6 bg-[#F9F9F7] border border-dashed border-[#C5A059] rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                      Categoria das Fotos
                    </label>
                    <select
                      value={photoBatchCategory}
                      onChange={(e) => setPhotoBatchCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 bg-white border border-gray-200 rounded-sm"
                    >
                      {formData.photoCategories.filter((c) => c !== 'Todos').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                      Título Padrão (Opcional)
                    </label>
                    <input
                      type="text"
                      value={photoBatchTitle}
                      onChange={(e) => setPhotoBatchTitle(e.target.value)}
                      placeholder="Ex: Culto de Jovens de Sábado"
                      className="w-full text-xs px-3 py-2.5 bg-white border border-gray-200 rounded-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center p-8 bg-white border border-gray-200 rounded-sm text-center">
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">
                      {isUploading ? 'Processando & Comprimindo...' : 'Selecionar Fotos (Múltiplos Arquivos)'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Suporta JPG, PNG, WEBP • Compressão automática em lote
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultiplePhotoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Photos List Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold text-gray-700 block">
                      Fotos Cadastradas ({formData.photos.length})
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Passe o mouse ou toque para gerenciar e excluir fotos
                    </span>
                  </div>
                </div>

                {formData.photos.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-sm text-gray-400 text-xs">
                    Nenhuma foto cadastrada. Faça o upload acima para adicionar imagens à galeria.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square bg-gray-100 rounded-sm overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md transition-all"
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top quick badges and direct delete action */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto z-10">
                          <span className="px-2 py-0.5 bg-black/70 backdrop-blur-sm text-[9px] uppercase tracking-widest font-bold text-[#C5A059] rounded-xs shadow-xs">
                            {photo.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(photo.id, photo.title);
                            }}
                            className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xs shadow-md transition-transform active:scale-90"
                            title="Excluir foto da galeria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Full overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                          <p className="text-xs font-editorial font-bold truncate mb-2">{photo.title}</p>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id, photo.title)}
                            className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase tracking-widest font-bold rounded-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir Foto</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GALERIA DE VÍDEOS */}
          {activeTab === 'videos' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
                <div>
                  <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                    Gerenciamento & Publicação de Vídeos
                  </h4>
                  <p className="text-xs text-gray-500 font-sans">
                    Adicione links do YouTube ou transmissões e escolha exatamente onde o vídeo será exibido no site.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-[#C5A059]/10 text-[#C5A059] text-[10px] uppercase tracking-widest font-bold rounded-sm">
                    {formData.videos.length} Vídeo(s) Cadastrado(s)
                  </span>
                </div>
              </div>

              {/* Add video form */}
              <form
                id="admin-add-video-form"
                onSubmit={handleAddVideo}
                className="p-6 sm:p-7 bg-white border border-[#C5A059]/30 rounded-sm space-y-5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#C5A059] text-white flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>Adicionar Novo Vídeo / Gravação de Culto</span>
                  </h5>
                  <span className="text-[10px] text-gray-400">
                    Suporta YouTube (Watch, Live, Shorts, Embed) e MP4
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* VIDEO SOURCE 1: Direct File Upload */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] uppercase tracking-widest text-[#1A1A1A] font-bold">
                        Arquivo de Vídeo (Direto do seu Celular / Computador)
                      </label>
                      <span className="text-[10px] text-[#C5A059] font-medium">
                        {uploadedVideoFile ? '✓ Arquivo selecionado' : 'Sem necessidade de URL'}
                      </span>
                    </div>

                    {uploadedVideoFile ? (
                      <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-sm flex items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="relative w-16 h-10 bg-black rounded-xs overflow-hidden shrink-0">
                            {uploadedVideoFile.thumbnail && (
                              <img
                                src={uploadedVideoFile.thumbnail}
                                alt="Capa do vídeo"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => setPreviewMediaUrl(uploadedVideoFile.dataUrl)}
                              className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center text-white"
                              title="Reproduzir prévia"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-emerald-950 block truncate">
                              {uploadedVideoFile.name}
                            </span>
                            <span className="text-[10px] text-emerald-700">
                              Tamanho: {uploadedVideoFile.size} • Capa extraída automaticamente
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewMediaUrl(uploadedVideoFile.dataUrl)}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] uppercase font-bold rounded-sm flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Ver Prévia</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadedVideoFile(null)}
                            className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[10px] uppercase font-bold rounded-sm transition-colors cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#C5A059]/40 hover:border-[#C5A059] bg-[#FDFBF7] hover:bg-[#F8F5EE] p-5 rounded-sm flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group text-center">
                        <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-white flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-[#1A1A1A] block">
                            Clique ou arraste para enviar o arquivo de vídeo (.mp4, .mov, .webm)
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            O vídeo será carregado diretamente do seu aparelho sem precisar de link externo
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/*"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* VIDEO SOURCE 2: Optional YouTube URL */}
                  <div className="sm:col-span-2 pt-1 border-t border-gray-100">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                      Link do YouTube / URL do Vídeo (Opcional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="Opcional: Cole o link do YouTube (caso não tenha enviado arquivo acima)"
                        className="flex-1 text-xs px-3.5 py-2.5 bg-[#F9F9F7] border border-gray-200 rounded-sm focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors"
                      />
                      {newVideoUrl.trim() && (
                        <button
                          type="button"
                          onClick={() => setPreviewMediaUrl(newVideoUrl.trim())}
                          className="px-3.5 py-2 bg-gray-900 hover:bg-[#C5A059] text-white text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Testar Prévia</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                      Título da Ministração / Mensagem *
                    </label>
                    <input
                      type="text"
                      required
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      placeholder="Ex: Rompendo Limites Pela Fé"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#F9F9F7] border border-gray-200 rounded-sm focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors font-medium"
                    />
                  </div>

                  {/* Speaker */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                      Preletor / Ministro
                    </label>
                    <input
                      type="text"
                      value={newVideoSpeaker}
                      onChange={(e) => setNewVideoSpeaker(e.target.value)}
                      placeholder="Ex: Bispo Samuel Oliveira"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#F9F9F7] border border-gray-200 rounded-sm focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                      Duração Estimada
                    </label>
                    <input
                      type="text"
                      value={newVideoDuration}
                      onChange={(e) => setNewVideoDuration(e.target.value)}
                      placeholder="Ex: 1h 25m"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#F9F9F7] border border-gray-200 rounded-sm focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Live Thumbnail Preview Box */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    {uploadedVideoFile?.thumbnail ? (
                      <div className="relative w-20 h-12 bg-black rounded-xs overflow-hidden shrink-0">
                        <img
                          src={uploadedVideoFile.thumbnail}
                          alt="Prévia do arquivo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : newVideoUrl.trim() ? (
                      <div className="relative w-20 h-12 bg-black rounded-xs overflow-hidden shrink-0">
                        <img
                          src={getYouTubeThumbnail(newVideoUrl.trim())}
                          alt="Prévia"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-12 bg-gray-200 rounded-xs flex items-center justify-center text-gray-400 shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-[11px] leading-tight">
                      <span className="font-semibold text-gray-700 block">
                        {uploadedVideoFile ? 'Capa Gerada do Arquivo' : 'Capa Automática em HD'}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {uploadedVideoFile ? 'Extraída do primeiro quadro do vídeo' : 'Gerada automaticamente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DESTINATION SELECTION: Onde o vídeo deve parar */}
                <div className="pt-4 border-t border-gray-200 space-y-2.5">
                  <label className="block text-[10px] uppercase tracking-widest text-[#1A1A1A] font-bold">
                    Destino da Publicação (Onde este vídeo deve parar no site):
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Destination 1: Public Video Gallery (Always active) */}
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-sm flex items-start gap-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </div>
                      <div className="text-xs">
                        <strong className="text-emerald-900 block font-medium">1. Galeria de Vídeos Oficial</strong>
                        <span className="text-emerald-700 text-[11px] leading-tight block mt-0.5">
                          Exibido na seção <em>"Palavra Gravada & Adoração"</em> da página principal com player dedicado.
                        </span>
                      </div>
                    </div>

                    {/* Destination 2: Also set as Hero Video */}
                    <label className={`p-3 border rounded-sm flex items-start gap-2.5 cursor-pointer transition-all ${
                      alsoSetHeroOnAdd
                        ? 'bg-[#C5A059]/10 border-[#C5A059] ring-1 ring-[#C5A059]'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      <input
                        type="checkbox"
                        checked={alsoSetHeroOnAdd}
                        onChange={(e) => setAlsoSetHeroOnAdd(e.target.checked)}
                        className="mt-1 accent-[#C5A059] w-4 h-4 rounded-xs"
                      />
                      <div className="text-xs">
                        <strong className="text-gray-900 block font-medium">2. Definir também como Vídeo Principal do Hero</strong>
                        <span className="text-gray-500 text-[11px] leading-tight block mt-0.5">
                          Coloca este vídeo no topo da página de abertura (com contagem regressiva e preletor).
                        </span>
                      </div>
                    </label>

                    {/* Destination 3: Also set as Featured Gallery Card */}
                    <label className={`sm:col-span-2 p-3 border rounded-sm flex items-start gap-2.5 cursor-pointer transition-all ${
                      alsoSetFeaturedOnAdd
                        ? 'bg-[#C5A059]/10 border-[#C5A059] ring-1 ring-[#C5A059]'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      <input
                        type="checkbox"
                        checked={alsoSetFeaturedOnAdd}
                        onChange={(e) => setAlsoSetFeaturedOnAdd(e.target.checked)}
                        className="mt-1 accent-[#C5A059] w-4 h-4 rounded-xs"
                      />
                      <div className="text-xs">
                        <strong className="text-gray-900 block font-medium">3. Destaque Principal da Semana na Galeria</strong>
                        <span className="text-gray-500 text-[11px] leading-tight block mt-0.5">
                          Exibe este vídeo no card maior (banner cinematográfico) na seção de vídeos.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto py-3 px-7 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#C5A059]" />
                    <span>Adicionar & Publicar Vídeo no Site</span>
                  </button>
                </div>
              </form>

              {/* Videos list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-700 block">
                    Vídeos Atualmente Exibidos ({formData.videos.length})
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Use os botões para definir no Hero, destacar ou remover
                  </span>
                </div>

                {formData.videos.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-dashed border-gray-300 rounded-sm text-gray-400 text-xs">
                    Nenhum vídeo cadastrado no momento. Preencha o formulário acima para adicionar o primeiro vídeo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.videos.map((video) => {
                      const isHeroVideo = formData.hero.videoUrl === video.youtubeUrl;
                      return (
                        <div
                          key={video.id}
                          className={`p-4 bg-white border rounded-sm flex items-center justify-between gap-4 shadow-2xs transition-all ${
                            isHeroVideo ? 'border-[#C5A059] ring-1 ring-[#C5A059]/40 bg-amber-50/20' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative w-20 h-12 rounded-xs overflow-hidden shrink-0 group">
                              <img
                                src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeUrl)}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewMediaUrl(video.youtubeUrl)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                title="Assistir prévia"
                              >
                                <Play className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                            <div className="truncate">
                              <h6 className="text-xs font-bold text-[#1A1A1A] truncate">{video.title}</h6>
                              <span className="text-[10px] text-gray-400 block truncate">{video.speaker}</span>
                              <div className="flex items-center gap-2 mt-1">
                                {video.isFeatured && (
                                  <span className="text-[9px] text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider">
                                    ★ Destaque
                                  </span>
                                )}
                                {isHeroVideo && (
                                  <span className="text-[9px] bg-[#C5A059] text-white px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider">
                                    Ativo no Hero
                                  </span>
                                )}
                                <span className="text-[9px] text-gray-400">
                                  {video.duration || 'HD'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Set on Hero Button */}
                            <button
                              type="button"
                              onClick={() => handleSelectVideoForHero(video, false)}
                              className={`px-2.5 py-1.5 text-[10px] uppercase font-bold rounded-sm border flex items-center gap-1 transition-all cursor-pointer ${
                                isHeroVideo
                                  ? 'bg-[#C5A059] text-white border-[#C5A059]'
                                  : 'border-gray-300 text-gray-700 hover:border-[#1A1A1A] hover:bg-gray-50'
                              }`}
                              title="Definir este vídeo como o vídeo principal do Hero"
                            >
                              <Video className="w-3 h-3" />
                              <span>{isHeroVideo ? 'No Hero' : 'Usar no Hero'}</span>
                            </button>

                            {/* Star Featured */}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  videos: prev.videos.map((v) => ({ ...v, isFeatured: v.id === video.id })),
                                }));
                                onNotifyToast(`"${video.title}" definido como destaque principal.`);
                              }}
                              className={`p-1.5 text-xs rounded-sm border cursor-pointer ${
                                video.isFeatured ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                              }`}
                              title="Definir como destaque na galeria"
                            >
                              ★
                            </button>

                            {/* Delete Video */}
                            <button
                              type="button"
                              onClick={() => handleDeleteVideo(video.id, video.title)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                              title="Excluir vídeo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AGENDA & CULTOS & INSCRIÇÕES */}
          {activeTab === 'schedule' && (
            <div className="max-w-5xl space-y-8 animate-in fade-in">
              <div>
                <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                  Agenda de Cultos & Eventos
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  Gerencie os horários fixos semanais, adicione novos cultos e acompanhe inscrições.
                </p>
              </div>

              {/* Weekly Services Editor */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">
                    Cultos Fixos Semanais ({formData.regularServices.length})
                  </h5>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#A8843F] text-white text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Novo Culto</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.regularServices.map((svc, idx) => (
                    <div key={svc.id} className="p-4 bg-white border border-gray-200 rounded-sm space-y-2 relative group shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <input
                            type="text"
                            value={svc.day}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                regularServices: prev.regularServices.map((s, i) => (i === idx ? { ...s, day: val } : s)),
                              }));
                            }}
                            className="text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-sm font-semibold text-[#C5A059]"
                            placeholder="Dia da semana"
                          />
                          <input
                            type="text"
                            value={svc.time}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                regularServices: prev.regularServices.map((s, i) => (i === idx ? { ...s, time: val } : s)),
                              }));
                            }}
                            className="text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-sm font-bold"
                            placeholder="Horário"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(svc.id, svc.title)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors shrink-0"
                          title="Excluir este culto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={svc.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            regularServices: prev.regularServices.map((s, i) => (i === idx ? { ...s, title: val } : s)),
                          }));
                        }}
                        className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-sm font-medium"
                        placeholder="Nome do Culto"
                      />
                      <input
                        type="text"
                        value={svc.location}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            regularServices: prev.regularServices.map((s, i) => (i === idx ? { ...s, location: val } : s)),
                          }));
                        }}
                        className="w-full text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-sm text-gray-500"
                        placeholder="Local"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Registrations Feed */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">
                    Inscrições Recebidas em Tempo Real ({registrations.length})
                  </h5>
                </div>

                {registrations.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-sm">
                    Nenhuma inscrição registrada ainda.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-sm divide-y divide-gray-100 bg-white">
                    {registrations.map((reg) => (
                      <div key={reg.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-[#1A1A1A] block">{reg.fullName}</strong>
                          <span className="text-[11px] text-gray-500">{reg.email} • {reg.phone || 'Sem telefone'}</span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] font-bold rounded-xs text-[10px]">
                            {reg.numAttendees} vaga(s)
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{reg.eventTitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TESTEMUNHOS */}
          {activeTab === 'testimonials' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                    Testemunhos & Histórias de Fé
                  </h4>
                  <p className="text-xs text-gray-500 font-sans">
                    Edite e atualize os testemunhos de membros da igreja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#A8843F] text-white text-xs uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Testemunho</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.testimonials.map((test, idx) => (
                  <div key={test.id} className="p-5 bg-white border border-gray-200 rounded-sm space-y-3 shadow-2xs relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
                        Depoimento #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(test.id, test.name)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        title="Excluir testemunho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                          Nome do Membro
                        </label>
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              testimonials: prev.testimonials.map((t, i) => (i === idx ? { ...t, name: val } : t)),
                            }));
                          }}
                          className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                          Papel / Tempo de Membresia
                        </label>
                        <input
                          type="text"
                          value={test.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              testimonials: prev.testimonials.map((t, i) => (i === idx ? { ...t, role: val } : t)),
                            }));
                          }}
                          className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                        Depoimento / Citação
                      </label>
                      <textarea
                        rows={2}
                        value={test.quote}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            testimonials: prev.testimonials.map((t, i) => (i === idx ? { ...t, quote: val } : t)),
                          }));
                        }}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: REDES & CONTATOS */}
          {activeTab === 'contact' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in">
              <div>
                <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                  Redes Sociais & Contatos Oficiais
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  Configure o WhatsApp da igreja, canais e links institucionais.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Número do WhatsApp (com DDI e DDD)
                  </label>
                  <input
                    type="text"
                    value={formData.contact.whatsappNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, whatsappNumber: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Telefone Fixo
                  </label>
                  <input
                    type="text"
                    value={formData.contact.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Mensagem Padrão do WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.contact.defaultMessage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, defaultMessage: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Endereço Completo da Sede
                  </label>
                  <input
                    type="text"
                    value={formData.contact.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, address: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Canal no YouTube
                  </label>
                  <input
                    type="text"
                    value={formData.contact.socialLinks.youtube}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          socialLinks: { ...prev.contact.socialLinks, youtube: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-1">
                    Perfil no Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.contact.socialLinks.instagram}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          socialLinks: { ...prev.contact.socialLinks, instagram: e.target.value },
                        },
                      }))
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STATUS DO BANCO & SINCRONIZAÇÃO */}
          {activeTab === 'database' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in">
              <div>
                <h4 className="font-editorial text-2xl font-bold text-[#1A1A1A] mb-1">
                  Status do Banco de Dados & Sincronização
                </h4>
                <p className="text-xs text-gray-500 font-sans">
                  Monitore a integridade da conexão na nuvem e faça backup dos dados.
                </p>
              </div>

              {/* Status Indicator Card */}
              <div className="p-6 bg-white border border-gray-200 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      syncStatus === 'synced'
                        ? 'bg-green-100 text-green-700'
                        : syncStatus === 'syncing'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-editorial text-lg font-bold text-[#1A1A1A]">
                      {syncStatus === 'synced' ? 'Banco Sincronizado & Operacional' : syncStatus === 'syncing' ? 'Sincronizando Nuvem...' : 'Modo Offline / Cache Local'}
                    </h5>
                    <p className="text-xs text-gray-500">
                      Última atualização: {new Date(formData.lastUpdated || Date.now()).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await onForceSync();
                    onNotifyToast('Sincronização forçada concluída!');
                  }}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-xs uppercase tracking-widest font-bold flex items-center gap-2 rounded-sm transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Forçar Sincronização
                </button>
              </div>

              {/* Backup & Restore Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-[#F9F9F7] border border-gray-200 rounded-sm space-y-3">
                  <h6 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#C5A059]" />
                    Exportar Backup JSON
                  </h6>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    Baixe uma cópia completa de todos os textos, fotos, cultos e configurações para segurança.
                  </p>
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-[#1A1A1A] text-xs uppercase tracking-widest font-bold rounded-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <FileJson className="w-4 h-4 text-[#C5A059]" />
                    Baixar Arquivo JSON
                  </button>
                </div>

                <div className="p-6 bg-[#F9F9F7] border border-gray-200 rounded-sm space-y-3">
                  <h6 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#C5A059]" />
                    Importar Backup JSON
                  </h6>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    Restaure um backup anterior previamente exportado para aplicar neste dispositivo.
                  </p>
                  <label className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-[#1A1A1A] text-xs uppercase tracking-widest font-bold rounded-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer">
                    <Upload className="w-4 h-4 text-[#C5A059]" />
                    Selecionar Arquivo JSON
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>

                <div className="p-6 bg-[#FDFBF7] border border-[#C5A059]/40 rounded-sm space-y-3">
                  <h6 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#C5A059]" />
                    Deploy Vercel & Celulares
                  </h6>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    Copie a estrutura atual para fixar em <code className="text-[#C5A059] font-bold">defaultData.ts</code> em novos deploys.
                  </p>
                  <button
                    onClick={handleCopyDefaultDataTS}
                    className="w-full py-2.5 bg-[#C5A059] hover:bg-[#A8843F] text-white text-xs uppercase tracking-widest font-bold rounded-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar defaultData.ts
                  </button>
                </div>
              </div>

              {/* Factory Reset */}
              <div className="p-6 border border-red-200 bg-red-50/50 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h6 className="text-xs uppercase tracking-widest font-bold text-red-700 flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    Restaurar Padrões de Fábrica
                  </h6>
                  <p className="text-xs text-red-600/80 font-sans">
                    Substitui todos os dados atuais pelas informações originais da Catedral.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmState({
                      isOpen: true,
                      title: 'Restaurar Dados Originais',
                      message: 'Atenção: Todas as fotos, vídeos, textos e programações personalizadas serão substituídos pelas informações padrão originais da Catedral. Deseja prosseguir?',
                      onConfirm: async () => {
                        await onReset();
                        onClose();
                        onNotifyToast('Dados restaurados para o padrão com sucesso!');
                        setDeleteConfirmState(null);
                      },
                    });
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-bold rounded-sm shrink-0 flex items-center gap-2 transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Padrões
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: VIDEO GALLERY PICKER FOR HERO */}
      {videoGalleryPickerOpen && (
        <div
          id="video-gallery-picker-modal"
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-4xl max-h-[88vh] rounded-sm border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#141414] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center rounded-sm text-white">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-editorial text-lg font-bold">
                    Galeria de Vídeos • Selecionar para o Hero
                  </h4>
                  <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-medium">
                    Escolha qual vídeo/mensagem será o foco e plano de fundo principal
                  </span>
                </div>
              </div>

              <button
                onClick={() => setVideoGalleryPickerOpen(false)}
                className="p-1 text-white/60 hover:text-white rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="p-4 bg-[#F9F9F7] border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por título ou preletor..."
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={syncEventInfoWithVideo}
                    onChange={(e) => setSyncEventInfoWithVideo(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4 rounded-xs"
                  />
                  <span>Sincronizar também o <strong>Título</strong> e <strong>Preletor</strong></span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setVideoGalleryPickerOpen(false);
                    setActiveTab('videos');
                  }}
                  className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#C5A059] text-white text-[10px] uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Novo Vídeo</span>
                </button>
              </div>
            </div>

            {/* Videos Grid List */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FDFDFC]">
              {formData.videos.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Film className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">Nenhum vídeo cadastrado na galeria ainda.</p>
                  <button
                    onClick={() => {
                      setVideoGalleryPickerOpen(false);
                      setActiveTab('videos');
                    }}
                    className="mt-3 text-xs text-[#C5A059] hover:underline font-bold uppercase tracking-wider"
                  >
                    + Adicionar vídeos na aba Galeria de Vídeos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.videos
                    .filter((v) => {
                      if (!videoSearchQuery.trim()) return true;
                      const q = videoSearchQuery.toLowerCase();
                      return (
                        v.title.toLowerCase().includes(q) ||
                        v.speaker.toLowerCase().includes(q)
                      );
                    })
                    .map((video) => {
                      const isCurrentlySelected = formData.hero.videoUrl === video.youtubeUrl;
                      return (
                        <div
                          key={video.id}
                          className={`bg-white border rounded-sm overflow-hidden flex flex-col justify-between transition-all group ${
                            isCurrentlySelected
                              ? 'border-[#C5A059] shadow-md ring-2 ring-[#C5A059]/40'
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-xs'
                          }`}
                        >
                          <div className="relative aspect-video bg-black overflow-hidden">
                            <img
                              src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeUrl)}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
                                YouTube
                              </span>
                              {video.duration && (
                                <span className="bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-xs">
                                  {video.duration}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setPreviewMediaUrl(video.youtubeUrl)}
                              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Testar vídeo"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#C5A059] flex items-center justify-center text-white shadow-lg">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </button>

                            {isCurrentlySelected && (
                              <div className="absolute bottom-2 right-2 bg-[#C5A059] text-white text-[9px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Hero Atual</span>
                              </div>
                            )}
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div className="mb-3">
                              <h5 className="font-bold text-xs text-[#1A1A1A] line-clamp-2 leading-snug">
                                {video.title}
                              </h5>
                              <span className="text-[11px] text-gray-500 font-medium mt-1 block">
                                {video.speaker}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectVideoForHero(video, syncEventInfoWithVideo)}
                              className={`w-full py-2 px-3 text-xs uppercase tracking-wider font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all ${
                                isCurrentlySelected
                                  ? 'bg-[#C5A059] text-white shadow-xs'
                                  : 'bg-[#1A1A1A] hover:bg-[#C5A059] text-white'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isCurrentlySelected ? 'Reaplicar no Hero' : 'Selecionar para o Hero'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500">
                Mostrando {formData.videos.length} vídeo(s) cadastrado(s)
              </span>
              <button
                onClick={() => setVideoGalleryPickerOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs uppercase tracking-wider font-bold rounded-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PHOTO GALLERY PICKER FOR HERO COVER */}
      {photoGalleryPickerOpen && (
        <div
          id="photo-gallery-picker-modal"
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-4xl max-h-[88vh] rounded-sm border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#141414] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center rounded-sm text-white">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-editorial text-lg font-bold">
                    Galeria de Fotos • Imagem de Fundo do Hero
                  </h4>
                  <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-medium">
                    Escolha uma fotografia da igreja para usar como plano de fundo editorial
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPhotoGalleryPickerOpen(false)}
                className="p-1 text-white/60 hover:text-white rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="p-3 bg-[#F9F9F7] border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
              {['Todos', ...formData.photoCategories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPhotoFilterCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-sm whitespace-nowrap transition-all ${
                    photoFilterCategory === cat
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FDFDFC]">
              {formData.photos.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">Nenhuma foto cadastrada na galeria ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {formData.photos
                    .filter((p) =>
                      photoFilterCategory === 'Todos' ? true : p.category === photoFilterCategory
                    )
                    .map((photo) => {
                      const isSelected = formData.hero.videoUrl === photo.url;
                      return (
                        <div
                          key={photo.id}
                          className={`group relative aspect-4/3 bg-gray-100 rounded-sm overflow-hidden border transition-all ${
                            isSelected
                              ? 'border-[#C5A059] ring-2 ring-[#C5A059]'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                            <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded-xs self-start">
                              {photo.category}
                            </span>
                            <div>
                              <p className="text-white text-xs font-semibold truncate mb-1">
                                {photo.title}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleSelectPhotoForHero(photo)}
                                className="w-full py-1.5 bg-[#C5A059] hover:bg-[#A8843F] text-white text-[10px] uppercase font-bold rounded-xs flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Check className="w-3 h-3" />
                                <span>Usar no Hero</span>
                              </button>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#C5A059] text-white p-1 rounded-full shadow-xs">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500">
                Mostrando {formData.photos.length} foto(s)
              </span>
              <button
                onClick={() => setPhotoGalleryPickerOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs uppercase tracking-wider font-bold rounded-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MEDIA PREVIEW PLAYER */}
      {previewMediaUrl && (
        <div
          id="admin-media-preview-modal"
          className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative w-full max-w-4xl bg-black rounded-sm overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-[#141414] border-b border-white/10 text-white">
              <div className="flex items-center gap-2 truncate">
                <Play className="w-4 h-4 text-[#C5A059] fill-current" />
                <span className="text-xs uppercase tracking-widest font-bold text-[#C5A059] truncate">
                  Prévia de Mídia • {isYouTubeVideoUrl(previewMediaUrl) ? 'YouTube Oficial' : isDirectVideoUrl(previewMediaUrl) ? 'Vídeo MP4' : 'Imagem'}
                </span>
              </div>
              <button
                onClick={() => setPreviewMediaUrl(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/25 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
              >
                Fechar ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {isYouTubeVideoUrl(previewMediaUrl) ? (
                <iframe
                  src={formatYouTubeEmbedUrl(previewMediaUrl, true)}
                  title="Prévia do Vídeo"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : isDirectVideoUrl(previewMediaUrl) ? (
                <video src={previewMediaUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img
                  src={previewMediaUrl}
                  alt="Prévia de Imagem"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="p-3 bg-[#141414] border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono text-[11px] truncate max-w-md">
                {previewMediaUrl}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, videoUrl: previewMediaUrl },
                  }));
                  onNotifyToast('Vídeo definido como mídia principal do Hero!');
                  setPreviewMediaUrl(null);
                }}
                className="px-3 py-1 bg-[#C5A059] hover:bg-[#A8843F] text-white font-bold text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Definir como Vídeo do Hero</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION DIALOG */}
      {deleteConfirmState && deleteConfirmState.isOpen && (
        <div
          id="admin-delete-confirm-modal"
          className="fixed inset-0 z-80 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-sm border border-red-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-editorial text-xl font-bold text-[#1A1A1A]">
                  {deleteConfirmState.title}
                </h4>
                <p className="text-xs text-gray-600 font-sans leading-relaxed">
                  {deleteConfirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmState(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs uppercase tracking-wider font-bold rounded-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={deleteConfirmState.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Exclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
