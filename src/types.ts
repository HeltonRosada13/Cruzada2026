export interface Pillar {
  id: string;
  number: string;
  title: string;
  description: string;
  iconName: 'Flame' | 'BookOpen' | 'Users' | 'HeartHandshake' | 'Music' | 'Sparkles' | 'Shield' | 'Church';
  image?: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  category: string;
  url: string;
  date?: string;
  featured?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  duration?: string;
  date?: string;
  speaker?: string;
  isFeatured?: boolean;
  thumbnailUrl?: string;
}

export interface ServiceTime {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string;
  location: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  speaker: string;
  totalSeats?: number;
  seatsLeft?: number;
  image: string;
  description: string;
  registrationOpen: boolean;
  tag?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  date: string;
}

export interface SocialLinks {
  youtube: string;
  instagram: string;
  facebook: string;
  spotify: string;
  whatsappChannel: string;
}

export interface ContactInfo {
  whatsappNumber: string;
  defaultMessage: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  googleMapsUrl: string;
  socialLinks: SocialLinks;
}

export interface HeroData {
  badge: string;
  title: string;
  subtitle: string;
  eventDate: string; // ISO date string e.g. "2026-09-15T19:30:00"
  location: string;
  locationDetails: string;
  preacher: string;
  preacherRole: string;
  quote: string;
  description: string;
  videoUrl: string; // MP4 or YouTube URL
  ctaText: string;
  secondaryCtaText: string;
}

export interface ChurchData {
  hero: HeroData;
  pillars: Pillar[];
  photos: PhotoItem[];
  photoCategories: string[];
  videos: VideoItem[];
  regularServices: ServiceTime[];
  upcomingEvents: ChurchEvent[];
  testimonials: Testimonial[];
  contact: ContactInfo;
  stats: { label: string; value: string }[];
  lastUpdated: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phone: string;
  numAttendees: number;
  registeredAt: string;
}
