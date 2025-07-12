import { useQuery } from '@tanstack/react-query';
import { podcastIndexFetch, PodcastIndexPodcast, PodcastIndexEpisode } from './usePodcastIndex';

// Music-specific filtering function
function isMusicContent(title: string, description: string, categories: string, itunesType?: string): boolean {
  const text = `${title} ${description} ${categories}`.toLowerCase();
  
  // Strong music indicators
  const musicKeywords = [
    'music', 'album', 'song', 'track', 'artist', 'band', 'ep', 'single',
    'indie', 'rock', 'pop', 'jazz', 'electronic', 'hip hop', 'rap', 'classical',
    'folk', 'country', 'blues', 'metal', 'punk', 'alternative', 'ambient',
    'techno', 'house', 'trance', 'dubstep', 'drum and bass', 'acoustic',
    'singer-songwriter', 'vocalist', 'musician', 'composer', 'producer'
  ];
  
  // Value4Value and Podcasting 2.0 indicators
  const value4valueKeywords = [
    'value4value', 'v4v', 'lightning', 'bitcoin', 'sats', 'boost', 'streaming sats'
  ];
  
  const hasMusic = musicKeywords.some(keyword => text.includes(keyword));
  const hasValue4Value = value4valueKeywords.some(keyword => text.includes(keyword));
  const isItunesMusic = itunesType === 'music';
  
  // Prioritize content that has both music and value4value
  return hasMusic || isItunesMusic || hasValue4Value;
}

export function useMusicSearch(query: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['music-index', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return { feeds: [], episodes: [], count: 0 };

      // Search for both podcasts and episodes
      const [podcastResponse, episodeResponse] = await Promise.all([
        podcastIndexFetch<PodcastIndexPodcast>('/search/byterm', {
          q: query.trim(),
          max: '50',
          clean: 'true',
        }),
        podcastIndexFetch<PodcastIndexEpisode>('/search/byterm', {
          q: query.trim(),
          max: '50',
          clean: 'true',
        })
      ]);

      // Filter for music content
      const musicFeeds = (podcastResponse.feeds || []).filter((feed: PodcastIndexPodcast) => {
        const categories = Object.values(feed.categories || {}).join(' ');
        return isMusicContent(feed.title, feed.description, categories, feed.itunesType);
      }).slice(0, 20);

      const musicEpisodes = (episodeResponse.episodes || []).filter((episode: PodcastIndexEpisode) => {
        return isMusicContent(episode.title, episode.description, episode.feedTitle);
      }).slice(0, 20);

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

export function useTrendingMusic() {
  return useQuery({
    queryKey: ['music-index', 'trending'],
    queryFn: async () => {
      const response = await podcastIndexFetch<PodcastIndexPodcast>('/podcasts/trending', {
        max: '100', // Get more to filter for music
        lang: 'en',
      });

      // Filter for music content and prioritize Value4Value
      const musicFeeds = (response.feeds || []).filter((feed: PodcastIndexPodcast) => {
        const categories = Object.values(feed.categories || {}).join(' ');
        return isMusicContent(feed.title, feed.description, categories, feed.itunesType);
      })
      .sort((a, b) => {
        // Prioritize feeds with Value4Value
        const aHasValue = a.value?.destinations?.length > 0;
        const bHasValue = b.value?.destinations?.length > 0;
        if (aHasValue && !bHasValue) return -1;
        if (!aHasValue && bHasValue) return 1;
        return 0;
      })
      .slice(0, 20);

      return {
        feeds: musicFeeds,
        count: musicFeeds.length,
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useRecentMusicEpisodes() {
  return useQuery({
    queryKey: ['music-index', 'recent-episodes'],
    queryFn: async () => {
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/recent/episodes', {
        max: '100', // Get more to filter for music
        excludeString: 'trailer,preview',
      });

      // Filter for music content
      const musicEpisodes = (response.episodes || []).filter((episode: PodcastIndexEpisode) => {
        return isMusicContent(episode.title, episode.description, episode.feedTitle);
      })
      .sort((a, b) => {
        // Prioritize episodes with Value4Value
        const aHasValue = a.value?.destinations?.length > 0;
        const bHasValue = b.value?.destinations?.length > 0;
        if (aHasValue && !bHasValue) return -1;
        if (!aHasValue && bHasValue) return 1;
        return 0;
      })
      .slice(0, 20);

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
        max: '50',
        clean: 'true',
      });

      // Filter for music content in this category
      const musicFeeds = (response.feeds || []).filter((feed: PodcastIndexPodcast) => {
        const categories = Object.values(feed.categories || {}).join(' ');
        const isMusic = isMusicContent(feed.title, feed.description, categories, feed.itunesType);
        const hasCategory = categories.toLowerCase().includes(category.toLowerCase()) ||
                           feed.title.toLowerCase().includes(category.toLowerCase());
        return isMusic && hasCategory;
      }).slice(0, 15);

      return {
        feeds: musicFeeds,
        count: musicFeeds.length,
      };
    },
    enabled: category.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}