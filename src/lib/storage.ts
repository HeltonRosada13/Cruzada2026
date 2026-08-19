import { useSyncExternalStore } from 'react';
import { ChurchData, EventRegistration } from '../types';
import { defaultChurchData } from './defaultData';
import { idbGet, idbSet, idbRemove } from './idb';

const STORAGE_KEY = 'catedral_amor_e_fe_data_v1';
const REGISTRATIONS_KEY = 'catedral_registrations_v1';
const BROADCAST_CHANNEL = 'catedral_sync_channel';

// In-memory cache
let cachedData: ChurchData | null = null;
let cachedRegistrations: EventRegistration[] = [];
let syncListeners = new Set<() => void>();
let broadcastChannel: BroadcastChannel | null = null;
let currentSyncStatus: 'synced' | 'syncing' | 'offline' = 'synced';

// Setup broadcast channel if available in browser
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'DATA_UPDATED' && event.data?.payload) {
        cachedData = event.data.payload;
        notifyListeners();
      }
      if (event.data?.type === 'REGISTRATION_ADDED' && event.data?.payload) {
        cachedRegistrations = [event.data.payload, ...cachedRegistrations];
        notifyListeners();
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel not initialized:', e);
  }
}

function notifyListeners() {
  syncListeners.forEach((listener) => listener());
}

// Asynchronously load rich data from IndexedDB on startup
if (typeof window !== 'undefined') {
  // 1. Initial async check from IndexedDB
  idbGet<ChurchData>(STORAGE_KEY).then((dbData) => {
    if (dbData && dbData.hero && dbData.pillars) {
      cachedData = dbData;
      notifyListeners();
    }
  }).catch((err) => {
    console.warn('IndexedDB initial load error:', err);
  });

  // 2. Initial async registrations from IndexedDB
  idbGet<EventRegistration[]>(REGISTRATIONS_KEY).then((dbRegs) => {
    if (dbRegs && Array.isArray(dbRegs)) {
      cachedRegistrations = dbRegs;
      notifyListeners();
    }
  }).catch((err) => {
    console.warn('IndexedDB initial registrations load error:', err);
  });
}

// Helper to save to localStorage safely without quota errors
function safeSaveLocalStorage(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(data);
    // If larger than 2.5MB, create a lightweight version to prevent quota issues
    if (serialized.length > 2500000) {
      // In lightweight version, avoid storing heavy base64 video URLs in localStorage
      const sanitized = JSON.parse(serialized);
      if (sanitized.hero && typeof sanitized.hero.videoUrl === 'string' && sanitized.hero.videoUrl.startsWith('data:video/')) {
        sanitized.hero.videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      }
      if (Array.isArray(sanitized.videos)) {
        sanitized.videos = sanitized.videos.map((v: any) => ({
          ...v,
          youtubeUrl: v.youtubeUrl?.startsWith('data:video/') ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : v.youtubeUrl,
        }));
      }
      localStorage.setItem(key, JSON.stringify(sanitized));
    } else {
      localStorage.setItem(key, serialized);
    }
  } catch {
    // Graceful fallback if localStorage is full or disabled (IndexedDB has authoritative data)
  }
}

// Read raw initial data safely
function getInitialData(): ChurchData {
  if (cachedData) return cachedData;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.hero && parsed.pillars) {
          cachedData = parsed;
          return cachedData!;
        }
      }
    } catch (err) {
      console.warn('Failed to parse cached church data from localStorage:', err);
    }
  }

  cachedData = defaultChurchData;
  return cachedData;
}

// Read initial registrations
function getInitialRegistrations(): EventRegistration[] {
  if (cachedRegistrations.length > 0) return cachedRegistrations;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(REGISTRATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cachedRegistrations = parsed;
          return cachedRegistrations;
        }
      }
    } catch (err) {
      console.warn('Failed to parse registrations:', err);
    }
  }
  return cachedRegistrations;
}

// Server snapshot for SSR / initial hydration
const serverSnapshot: ChurchData = defaultChurchData;
const serverRegistrationsSnapshot: EventRegistration[] = [];

// Subscribe callback for useSyncExternalStore
function subscribe(listener: () => void) {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

// Get snapshot callback
function getSnapshot(): ChurchData {
  return cachedData || getInitialData();
}

function getServerSnapshot(): ChurchData {
  return serverSnapshot;
}

function getRegSnapshot(): EventRegistration[] {
  return cachedRegistrations.length > 0 ? cachedRegistrations : getInitialRegistrations();
}

function getRegServerSnapshot(): EventRegistration[] {
  return serverRegistrationsSnapshot;
}

// React Hook to access Church Data safely with Zero Hydration Flash
export function useChurchData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    data,
    updateData,
    resetToDefaultData,
    syncStatus: currentSyncStatus,
    forceSync,
  };
}

// React Hook to access and manage event registrations
export function useRegistrations() {
  const registrations = useSyncExternalStore(subscribe, getRegSnapshot, getRegServerSnapshot);
  return {
    registrations,
    addRegistration,
  };
}

// Update Church Data Function with high-capacity IndexedDB storage & safe fallback
export async function updateData(updater: Partial<ChurchData> | ((prev: ChurchData) => ChurchData)): Promise<void> {
  currentSyncStatus = 'syncing';
  notifyListeners();

  const prevData = getSnapshot();
  const nextData: ChurchData = typeof updater === 'function' ? updater(prevData) : { ...prevData, ...updater };
  nextData.lastUpdated = new Date().toISOString();

  cachedData = nextData;

  // 1. Authoritative persistent storage via IndexedDB (handles large video/photo files smoothly)
  try {
    await idbSet(STORAGE_KEY, nextData);
  } catch (err) {
    console.warn('Error saving to IndexedDB:', err);
  }

  // 2. Safe synchronous cache in localStorage
  safeSaveLocalStorage(STORAGE_KEY, nextData);

  // 3. Broadcast to other open browser tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'DATA_UPDATED', payload: nextData });
    } catch {
      // ignore
    }
  }

  // Artificial slight delay for visual sync confirmation
  await new Promise((resolve) => setTimeout(resolve, 250));
  currentSyncStatus = 'synced';
  notifyListeners();
}

// Add an event registration
export async function addRegistration(registration: Omit<EventRegistration, 'id' | 'registeredAt'>): Promise<EventRegistration> {
  const newReg: EventRegistration = {
    ...registration,
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    registeredAt: new Date().toISOString(),
  };

  const current = getRegSnapshot();
  const next = [newReg, ...current];
  cachedRegistrations = next;

  try {
    await idbSet(REGISTRATIONS_KEY, next);
  } catch (err) {
    console.warn('Error saving registration to IndexedDB:', err);
  }

  safeSaveLocalStorage(REGISTRATIONS_KEY, next);

  // Also decrement available seats in event if applicable
  updateData((prev) => ({
    ...prev,
    upcomingEvents: prev.upcomingEvents.map((evt) => {
      if (evt.id === registration.eventId && evt.seatsLeft && evt.seatsLeft > 0) {
        return {
          ...evt,
          seatsLeft: Math.max(0, evt.seatsLeft - registration.numAttendees),
        };
      }
      return evt;
    }),
  }));

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'REGISTRATION_ADDED', payload: newReg });
    } catch {
      // ignore
    }
  }

  notifyListeners();
  return newReg;
}

// Reset to factory defaults
export async function resetToDefaultData(): Promise<void> {
  currentSyncStatus = 'syncing';
  notifyListeners();

  cachedData = defaultChurchData;

  try {
    await idbSet(STORAGE_KEY, defaultChurchData);
  } catch (err) {
    console.warn('Error resetting IndexedDB:', err);
  }

  safeSaveLocalStorage(STORAGE_KEY, defaultChurchData);

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'DATA_UPDATED', payload: defaultChurchData });
    } catch {
      // ignore
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  currentSyncStatus = 'synced';
  notifyListeners();
}

// Force resynchronization
export async function forceSync(): Promise<void> {
  currentSyncStatus = 'syncing';
  notifyListeners();
  try {
    const dbData = await idbGet<ChurchData>(STORAGE_KEY);
    if (dbData) {
      cachedData = dbData;
    }
  } catch {
    // ignore
  }
  await new Promise((resolve) => setTimeout(resolve, 400));
  currentSyncStatus = 'synced';
  notifyListeners();
}

