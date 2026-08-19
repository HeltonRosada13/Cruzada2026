/**
 * Utility functions for Church Application
 */

// Extract YouTube ID from all possible YouTube URL formats
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // Direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // Covers watch?v=, youtu.be/, embed/, v/, live/, shorts/, etc.
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/;
  const match = cleanUrl.match(regExp);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  // Fallback pattern
  const fallback = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const fallbackMatch = cleanUrl.match(fallback);
  if (fallbackMatch && fallbackMatch[2] && fallbackMatch[2].length === 11) {
    return fallbackMatch[2];
  }

  return null;
}

// Check if string is a valid YouTube URL or ID
export function isYouTubeVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return extractYouTubeId(url) !== null;
}

// Format YouTube URL to an embeddable iframe source with proper parameters
export function formatYouTubeEmbedUrl(
  url: string,
  autoPlay: boolean = false,
  options?: { loop?: boolean; mute?: boolean; controls?: boolean }
): string {
  const videoId = extractYouTubeId(url);
  if (!videoId) return url;
  
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
  });
  
  if (autoPlay) {
    params.set('autoplay', '1');
  }

  if (options?.loop) {
    params.set('loop', '1');
    params.set('playlist', videoId); // YouTube requirement for looping a single video
  }

  if (options?.mute !== undefined) {
    params.set('mute', options.mute ? '1' : '0');
  }

  if (options?.controls !== undefined) {
    params.set('controls', options.controls ? '1' : '0');
  }
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

// Get YouTube high-resolution thumbnail or fallback
export function getYouTubeThumbnail(url: string): string {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=1200';
  }
  // hqdefault is standard and reliably available for all YouTube videos
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Check if URL is an MP4 video, data URL or direct video stream
export function isDirectVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('data:video/') || clean.startsWith('blob:')) return true;
  const withoutQuery = clean.split('?')[0];
  return (
    withoutQuery.endsWith('.mp4') ||
    withoutQuery.endsWith('.webm') ||
    withoutQuery.endsWith('.ogg') ||
    withoutQuery.endsWith('.mov') ||
    withoutQuery.endsWith('.m4v')
  );
}

// Compress and convert uploaded image files to lightweight WebP/JPEG data URLs
export async function compressImageFile(file: File, maxWidth: number = 1600, quality: number = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Falha ao processar a imagem.'));
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
  });
}

// Format date in Portuguese
export function formatDatePT(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Format short date in Portuguese
export function formatShortDatePT(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Calculate remaining time for countdown timer
export interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function calculateTimeRemaining(targetDateStr: string): TimeRemaining {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const difference = target - now;

  if (difference <= 0 || isNaN(target)) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    total: difference,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
}
