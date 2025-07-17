import { useState, useCallback } from 'react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { podcastIndexFetch } from '@/hooks/usePodcastIndex';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';

export function usePlayAll() {
  const { playPodcast, addToQueue, clearQueue } = usePodcastPlayer();
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);

  const handlePlayAll = useCallback(async (trendingMusic: { feeds: PodcastIndexPodcast[] }) => {
    if (!trendingMusic?.feeds.length) return;
    
    setIsLoadingPlayAll(true);
    try {
      // Clear existing queue
      clearQueue();
      
      // Create placeholder array to maintain order
      const orderedEpisodes: Array<{
        id: string;
        title: string;
        author: string;
        url: string;
        imageUrl?: string;
        duration?: number;
        rank: number;
      } | null> = new Array(trendingMusic.feeds.length).fill(null);
      
      // Process feeds in parallel but maintain order with Promise.allSettled
      const episodePromises = trendingMusic.feeds.map(async (feed, index) => {
        try {
          console.log(`🎵 Fetching episode for #${index + 1}: ${feed.title}`);
          const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
            id: feed.id.toString(),
            max: '5', // Get first few episodes
          });
          
          const episodes = (response.items || []).filter(ep => ep.enclosureUrl);
          const firstEpisode = episodes.find(ep => ep.enclosureUrl);
          
          if (firstEpisode) {
            const episode = {
              id: `${feed.id}-${firstEpisode.id}`,
              title: firstEpisode.title,
              author: firstEpisode.feedTitle || feed.author,
              url: firstEpisode.enclosureUrl,
              imageUrl: firstEpisode.image || firstEpisode.feedImage || feed.image || feed.artwork,
              duration: firstEpisode.duration,
              rank: index + 1,
            };
            orderedEpisodes[index] = episode;
            console.log(`✅ Successfully queued #${index + 1}: ${episode.title}`);
            return episode;
          } else {
            console.warn(`⚠️ No playable episodes found for #${index + 1}: ${feed.title}`);
            return null;
          }
        } catch (error) {
          console.warn(`❌ Failed to fetch episodes for #${index + 1} ${feed.title}:`, error);
          return null;
        }
      });
      
      // Wait for all episode fetches to complete
      await Promise.allSettled(episodePromises);
      
      // Add episodes to queue in their original order, preserving rank gaps
      console.log('🎼 Final ordered episodes array:', orderedEpisodes.map((ep, idx) => 
        ep ? `#${idx + 1}: ${ep.title}` : `#${idx + 1}: [FAILED]`
      ));
      
      orderedEpisodes.forEach((episode, index) => {
        if (episode) {
          console.log(`📋 Adding to queue: #${episode.rank} - ${episode.title}`);
          addToQueue(episode);
        } else {
          console.log(`⚠️ Skipping failed episode at position #${index + 1}`);
        }
      });
      
      // Get the first valid episode for playing
      const firstValidEpisode = orderedEpisodes.find(ep => ep !== null);
      
      // Play the first valid episode
      if (firstValidEpisode) {
        console.log(`🎵 Starting playback with: #${firstValidEpisode.rank} - ${firstValidEpisode.title}`);
        playPodcast(firstValidEpisode);
      }
      
      const validEpisodes = orderedEpisodes.filter(ep => ep !== null);
      const skippedCount = trendingMusic.feeds.length - validEpisodes.length;
      console.log(`🎼 Queued ${validEpisodes.length} tracks from Top 100 V4V chart${skippedCount > 0 ? ` (${skippedCount} tracks skipped due to fetch errors)` : ''}`);
      
      if (skippedCount > 0) {
        console.log('📋 Successfully queued tracks:', validEpisodes.map(ep => `#${ep.rank}: ${ep.title}`));
      }
    } catch (error) {
      console.error('Failed to queue Top 100 tracks:', error);
    } finally {
      setIsLoadingPlayAll(false);
    }
  }, [clearQueue, addToQueue, playPodcast]);

  return {
    handlePlayAll,
    isLoadingPlayAll
  };
} 