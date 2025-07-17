import { useState, useCallback } from 'react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { podcastIndexFetch } from '@/hooks/usePodcastIndex';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';

export function useMusicPlayback() {
  const { playPodcast, currentPodcast, isPlaying, setIsPlaying } = usePodcastPlayer();
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);

  const handlePlayPauseAlbum = useCallback(async (podcast: PodcastIndexPodcast) => {
    const podcastId = podcast.id.toString();
    
    console.log('🎵 Album play button clicked:', {
      podcastId,
      title: podcast.title,
      author: podcast.author,
      currentPodcast: currentPodcast?.id,
      isPlaying,
      loadingTrackId
    });
    
    // Prevent rapid clicks while loading
    if (loadingTrackId && loadingTrackId !== podcastId) {
      console.log('Ignoring click - another track is loading');
      return;
    }
    
    // Check if any episode from this album is currently playing
    const isThisAlbumPlaying = currentPodcast && isPlaying && (
      currentPodcast.author === podcast.author || 
      currentPodcast.id.startsWith(podcastId) ||
      currentPodcast.title.includes(podcast.title) ||
      currentPodcast.id === `${podcastId}-album`
    );
    
    console.log('Is this album currently playing?', isThisAlbumPlaying);
    
    if (isThisAlbumPlaying) {
      // Pause the current track
      console.log('Pausing current track');
      setIsPlaying(false);
      return;
    }
    
    // If this is the same track that's already loaded but not playing, just play it
    if (currentPodcast && currentPodcast.id.startsWith(podcastId) && !isPlaying) {
      console.log('Resuming already loaded track');
      setIsPlaying(true);
      return;
    }
    
    // Set loading state
    console.log('Setting loading state for podcast:', podcastId);
    setLoadingTrackId(podcastId);
    
    // Try to fetch episodes first, then play the first one
    try {
      console.log('Fetching episodes for podcast:', podcastId);
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
        id: podcast.id.toString(),
        max: '10', // Fetch more episodes for queue
      });
      
      console.log('Episodes response:', {
        itemsCount: response.items?.length || 0,
        items: response.items?.slice(0, 3) // Log first 3 items
      });
      
      const episodes = (response.items || []).filter(ep => ep.enclosureUrl);
      const firstEpisode = episodes.find(ep => ep.enclosureUrl);
      
      console.log('Filtered episodes:', {
        totalEpisodes: response.items?.length || 0,
        episodesWithEnclosure: episodes.length,
        firstEpisode: firstEpisode ? {
          id: firstEpisode.id,
          title: firstEpisode.title,
          enclosureUrl: firstEpisode.enclosureUrl
        } : null
      });
      
      if (firstEpisode) {
        const podcastToPlay = {
          id: `${podcastId}-${firstEpisode.id}`,
          title: firstEpisode.title,
          author: firstEpisode.feedTitle || podcast.author,
          url: firstEpisode.enclosureUrl,
          imageUrl: firstEpisode.image || firstEpisode.feedImage || podcast.image || podcast.artwork,
          duration: firstEpisode.duration,
        };
        
        console.log('Playing podcast:', podcastToPlay);
        
        // Play the first episode with a valid audio URL
        playPodcast(podcastToPlay);
        
        // Immediately try to play audio to satisfy browser autoplay policy
        // This must happen in the user interaction context
        const audio = document.querySelector('audio');
        if (audio) {
          audio.src = podcastToPlay.url;
          audio.play().catch(error => {
            console.log('Autoplay prevented by browser:', error);
          });
        }
      } else {
        console.warn('No playable episodes found in album:', podcast.title);
      }
    } catch (error) {
      console.error('Failed to fetch album episodes:', error);
    } finally {
      // Clear loading state after a short delay
      setTimeout(() => {
        console.log('Clearing loading state for podcast:', podcastId);
        setLoadingTrackId(null);
      }, 1000);
    }
  }, [currentPodcast, isPlaying, playPodcast, setIsPlaying, loadingTrackId]);

  // Helper function to check if a track/album is currently playing
  const isCurrentlyPlaying = useCallback((id: string, feedTitle?: string) => {
    if (!currentPodcast || !isPlaying) return false;
    
    // For individual tracks/episodes
    if (currentPodcast.id === id) return true;
    
    // For albums, check if the current podcast is from this feed
    if (feedTitle) {
      // Check if current track is from this album/feed
      return (
        currentPodcast.author === feedTitle ||
        currentPodcast.id.startsWith(id) ||
        currentPodcast.id === `${id}-album` ||
        currentPodcast.title.includes(feedTitle)
      );
    }
    
    return false;
  }, [currentPodcast, isPlaying]);

  return {
    handlePlayPauseAlbum,
    isCurrentlyPlaying,
    loadingTrackId,
    currentPodcast,
    isPlaying
  };
} 