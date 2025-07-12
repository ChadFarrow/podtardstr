import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PodcastEpisode {
  id: string;
  title: string;
  author: string;
  url: string;
  imageUrl?: string;
  duration?: number;
}

interface PodcastPlayerState {
  currentPodcast: PodcastEpisode | null;
  isPlaying: boolean;
  queue: PodcastEpisode[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playPodcast: (podcast: PodcastEpisode) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  addToQueue: (podcast: PodcastEpisode) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePodcastPlayer = create<PodcastPlayerState>()(
  persist(
    (set, get) => ({
      currentPodcast: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,

      playPodcast: (podcast) => {
        const state = get();
        
        // If this podcast is already in the queue, just play it
        const existingIndex = state.queue.findIndex(p => p.id === podcast.id);
        
        if (existingIndex !== -1) {
          set({
            currentPodcast: podcast,
            currentIndex: existingIndex,
            isPlaying: true,
          });
        } else {
          // Add to queue and play
          const newQueue = [...state.queue, podcast];
          set({
            currentPodcast: podcast,
            queue: newQueue,
            currentIndex: newQueue.length - 1,
            isPlaying: true,
          });
        }
      },

      setIsPlaying: (playing) => {
        set({ isPlaying: playing });
      },

      setCurrentTime: (time) => {
        set({ currentTime: time });
      },

      setDuration: (duration) => {
        set({ duration });
      },

      setVolume: (volume) => {
        set({ volume, isMuted: false });
      },

      setIsMuted: (muted) => {
        set({ isMuted: muted });
      },

      addToQueue: (podcast) => {
        const state = get();
        const exists = state.queue.some(p => p.id === podcast.id);
        
        if (!exists) {
          set({ queue: [...state.queue, podcast] });
        }
      },

      removeFromQueue: (id) => {
        const state = get();
        const newQueue = state.queue.filter(p => p.id !== id);
        const currentPodcast = state.currentPodcast;
        
        if (currentPodcast?.id === id) {
          // If we're removing the currently playing podcast
          set({
            queue: newQueue,
            currentPodcast: null,
            currentIndex: -1,
            isPlaying: false,
          });
        } else {
          // Update the current index if needed
          const newIndex = currentPodcast 
            ? newQueue.findIndex(p => p.id === currentPodcast.id)
            : -1;
          
          set({
            queue: newQueue,
            currentIndex: newIndex,
          });
        }
      },

      clearQueue: () => {
        set({
          queue: [],
          currentPodcast: null,
          currentIndex: -1,
          isPlaying: false,
        });
      },

      playNext: () => {
        const state = get();
        const nextIndex = state.currentIndex + 1;
        
        if (nextIndex < state.queue.length) {
          const nextPodcast = state.queue[nextIndex];
          set({
            currentPodcast: nextPodcast,
            currentIndex: nextIndex,
            isPlaying: true,
          });
        }
      },

      playPrevious: () => {
        const state = get();
        const prevIndex = state.currentIndex - 1;
        
        if (prevIndex >= 0) {
          const prevPodcast = state.queue[prevIndex];
          set({
            currentPodcast: prevPodcast,
            currentIndex: prevIndex,
            isPlaying: true,
          });
        }
      },
    }),
    {
      name: 'podcast-player-storage',
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        currentPodcast: state.currentPodcast,
      }),
    }
  )
);