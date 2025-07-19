import { useState, useEffect } from 'react';

export interface PinnedAlbum {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  feedUrl: string;
  pinnedAt: number;
}

const PINNED_ALBUMS_KEY = 'podtardstr_pinned_albums';

export function usePinnedAlbums() {
  const [pinnedAlbums, setPinnedAlbums] = useState<PinnedAlbum[]>([]);

  // Load pinned albums from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PINNED_ALBUMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPinnedAlbums(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading pinned albums:', error);
    }
  }, []);

  // Save to localStorage whenever pinnedAlbums changes
  useEffect(() => {
    try {
      localStorage.setItem(PINNED_ALBUMS_KEY, JSON.stringify(pinnedAlbums));
    } catch (error) {
      console.error('Error saving pinned albums:', error);
    }
  }, [pinnedAlbums]);

  const pinAlbum = (album: Omit<PinnedAlbum, 'pinnedAt'>) => {
    setPinnedAlbums(prev => {
      // Check if already pinned
      if (prev.some(p => p.id === album.id)) {
        return prev;
      }
      
      // Add to beginning of array (most recently pinned first)
      return [{
        ...album,
        pinnedAt: Date.now()
      }, ...prev];
    });
  };

  const unpinAlbum = (albumId: string) => {
    setPinnedAlbums(prev => prev.filter(album => album.id !== albumId));
  };

  const isPinned = (albumId: string) => {
    return pinnedAlbums.some(album => album.id === albumId);
  };

  const clearAllPinned = () => {
    setPinnedAlbums([]);
  };

  return {
    pinnedAlbums,
    pinAlbum,
    unpinAlbum,
    isPinned,
    clearAllPinned,
  };
}