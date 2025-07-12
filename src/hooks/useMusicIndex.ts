import { useQuery } from '@tanstack/react-query';
import { podcastIndexFetch, PodcastIndexPodcast, PodcastIndexEpisode } from './usePodcastIndex';

// Using medium=music parameter for proper music filtering like LNBeats

export function useMusicSearch(query: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['music-index', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return { feeds: [], episodes: [], count: 0 };

      console.log('Searching for:', query);

      // Search for music content only using medium=music filter
      const [podcastResponse, episodeResponse] = await Promise.all([
        podcastIndexFetch<PodcastIndexPodcast>('/search/byterm', {
          q: query.trim(),
          max: '20',
          clean: 'true',
          medium: 'music',
        }),
        podcastIndexFetch<PodcastIndexEpisode>('/search/byterm', {
          q: query.trim(),
          max: '50', 
          clean: 'true',
          medium: 'music',
        })
      ]);

      console.log('Podcast search response:', podcastResponse);
      console.log('Episode search response:', episodeResponse);

      // Sort by Value4Value (prioritize V4V content)
      const musicFeeds = (podcastResponse.feeds || []).sort((a, b) => {
        const aHasValue = a.value?.destinations?.length > 0;
        const bHasValue = b.value?.destinations?.length > 0;
        if (aHasValue && !bHasValue) return -1;
        if (!aHasValue && bHasValue) return 1;
        return 0;
      });

      const musicEpisodes = (episodeResponse.episodes || episodeResponse.items || []).sort((a, b) => {
        const aHasValue = a.value?.destinations?.length > 0;
        const bHasValue = b.value?.destinations?.length > 0;
        if (aHasValue && !bHasValue) return -1;
        if (!aHasValue && bHasValue) return 1;
        return 0;
      });

      return {
        feeds: musicFeeds,
        episodes: musicEpisodes,
        count: musicFeeds.length + musicEpisodes.length,
      };
    },
    enabled: options.enabled !== false && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Removed useTrendingMusic - Music tab now uses useTrendingPodcasts for consistency

export function useRecentMusicEpisodes() {
  return useQuery({
    queryKey: ['music-index', 'recent-episodes'],
    queryFn: async () => {
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/recent/episodes', {
        max: '20',
        excludeString: 'trailer,preview',
        medium: 'music', // Filter for music content only
      });

      // Sort by Value4Value (prioritize V4V content)
      const musicEpisodes = (response.episodes || response.items || []).sort((a, b) => {
        const aHasValue = a.value?.destinations?.length > 0;
        const bHasValue = b.value?.destinations?.length > 0;
        if (aHasValue && !bHasValue) return -1;
        if (!aHasValue && bHasValue) return 1;
        return 0;
      });

      return {
        episodes: musicEpisodes,
        count: musicEpisodes.length,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useMusicByCategory(category: string) {
  return useQuery({
    queryKey: ['music-index', 'category', category],
    queryFn: async () => {
      const response = await podcastIndexFetch<PodcastIndexPodcast>('/search/byterm', {
        q: category,
        max: '15',
        clean: 'true',
        medium: 'music', // Filter for music content only
      });

      // Sort by Value4Value (prioritize V4V content)
      const musicFeeds = (response.feeds || []).sort((a, b) => {
        const aHasValue = a.value?.destinations?.length > 0;
        const bHasValue = b.value?.destinations?.length > 0;
        if (aHasValue && !bHasValue) return -1;
        if (!aHasValue && bHasValue) return 1;
        return 0;
      });

      return {
        feeds: musicFeeds,
        count: musicFeeds.length,
      };
    },
    enabled: category.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}