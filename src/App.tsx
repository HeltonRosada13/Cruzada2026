import React, { useState } from 'react';
import { useChurchData } from './lib/storage';
import { ChurchEvent } from './types';
import { SplashLoader } from './components/SplashLoader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PillarsGrid } from './components/PillarsGrid';
import { AboutSection } from './components/AboutSection';
import { PhotoGallery } from './components/PhotoGallery';
import { VideoGallery } from './components/VideoGallery';
import { ScheduleSection } from './components/ScheduleSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactFooter } from './components/ContactFooter';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { EventRsvpModal } from './components/EventRsvpModal';
import { ShareModal } from './components/ShareModal';
import { AdminModal } from './components/AdminModal';
import { Toast } from './components/Toast';

export default function App() {
  const { data, updateData, resetToDefaultData, syncStatus, forceSync } = useChurchData();

  const [isReady, setIsReady] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState('Igreja Catedral de Amor e Fé');
  const [rsvpEvent, setRsvpEvent] = useState<ChurchEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Open default event RSVP (main hero conference)
  const handleOpenDefaultRsvp = () => {
    if (data.upcomingEvents && data.upcomingEvents.length > 0) {
      setRsvpEvent(data.upcomingEvents[0]);
    } else {
      setRsvpEvent({
        id: 'main-conference',
        title: data.hero.title,
        date: data.hero.eventDate.split('T')[0],
        time: '19:30',
        location: data.hero.location,
        speaker: data.hero.preacher,
        image: data.hero.videoUrl.startsWith('http') ? data.hero.videoUrl : 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=800',
        description: data.hero.description,
        registrationOpen: true,
      });
    }
  };

  const handleOpenShare = (customTitle?: string) => {
    setShareTitle(customTitle || data.hero.title);
    setIsShareOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1A1A1A] flex flex-col selection:bg-[#C5A059]/20 selection:text-[#1A1A1A]">
      {/* Hydration & Initial sync guard */}
      {!isReady && <SplashLoader onFinish={() => setIsReady(true)} />}

      {/* Main Navigation Header */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRsvp={handleOpenDefaultRsvp}
        syncStatus={syncStatus}
      />

      {/* Main Page Sections */}
      <main className="flex-1 flex flex-col">
        {/* 1. Hero with Countdown & Video */}
        <Hero
          hero={data.hero}
          onOpenRsvp={handleOpenDefaultRsvp}
          onOpenShare={() => handleOpenShare(data.hero.title)}
        />

        {/* 2. Pillars / Momentos Marcantes */}
        <PillarsGrid pillars={data.pillars} />

        {/* 3. About Section with Leadership & Statistics */}
        <AboutSection
          data={data}
          onOpenRsvp={handleOpenDefaultRsvp}
          onOpenShare={() => handleOpenShare('Conheça a Catedral de Amor e Fé')}
        />

        {/* 4. Photo Gallery with Infinite Marquee & Lightbox */}
        <PhotoGallery
          photos={data.photos}
          categories={data.photoCategories}
          onOpenShare={handleOpenShare}
        />

        {/* 5. Video Gallery & Recorded Messages */}
        <VideoGallery videos={data.videos} />

        {/* 6. Schedule of Services & Upcoming Conferences */}
        <ScheduleSection
          regularServices={data.regularServices}
          upcomingEvents={data.upcomingEvents}
          onSelectEventForRsvp={(event) => setRsvpEvent(event)}
        />

        {/* 7. Testimonials */}
        <TestimonialsSection testimonials={data.testimonials} />
      </main>

      {/* Official Editorial Footer */}
      <ContactFooter
        contact={data.contact}
        services={data.regularServices}
        syncStatus={syncStatus}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating Interactive WhatsApp Widget */}
      <WhatsAppFloating
        whatsappNumber={data.contact.whatsappNumber}
        defaultMessage={data.contact.defaultMessage}
      />

      {/* Event RSVP / Registration Modal */}
      <EventRsvpModal
        isOpen={!!rsvpEvent}
        onClose={() => setRsvpEvent(null)}
        event={rsvpEvent}
        onNotifyToast={showToast}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={shareTitle}
        onNotifyToast={showToast}
      />

      {/* Full Admin Manager Suite */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        data={data}
        onSave={async (newData) => {
          await updateData(newData);
        }}
        onReset={resetToDefaultData}
        onForceSync={forceSync}
        syncStatus={syncStatus}
        onNotifyToast={showToast}
      />

      {/* Feedback Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
