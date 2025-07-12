import { useQuery } from '@tanstack/react-query';
import CryptoJS from 'crypto-js';

// Podcast Index API types
export interface PodcastIndexPodcast {
  id: number;
  title: string;
  url: string;
  originalUrl: string;
  link: string;
  description: string;
  author: string;
  ownerName: string;
  image: string;
  artwork: string;
  lastUpdateTime: number;
  lastCrawlTime: number;
  lastParseTime: number;
  lastGoodHttpStatusTime: number;
  lastHttpStatus: number;
  contentType: string;
  itunesId?: number;
  itunesType: string;
  generator: string;
  language: string;
  type: number;
  dead: number;
  crawlErrors: number;
  parseErrors: number;
  categories: Record<string, string>;
  locked: number;
  imageUrlHash: number;
  newestItemPubdate: number;
  episodeCount: number;
  funding?: {
    url: string;
    message: string;
  };
  value?: {
    model: {
      type: string;
      method: string;
      suggested: string;
    };
    destinations: Array<{
      name: string;
      address: string;
      type: string;
      split: number;
    }>;
  };
}

export interface PodcastIndexEpisode {
  id: number;
  title: string;
  link: string;
  description: string;
  guid: string;
  datePublished: number;
  datePublishedPretty: string;
  dateCrawled: number;
  enclosureUrl: string;
  enclosureType: string;
  enclosureLength: number;
  duration: number;
  explicit: number;
  episode?: number;
  episodeType: string;
  season?: number;
  image: string;
  feedItunesId?: number;
  feedImage: string;
  feedId: number;
  feedTitle: string;
  feedLanguage: string;
  chaptersUrl?: string;
  transcriptUrl?: string;
  value?: {
    model: {
      type: string;
      method: string;
      suggested: string;
    };
    destinations: Array<{
      name: string;
      address: string;
      type: string;
      split: number;
    }>;
  };
}

interface PodcastIndexResponse<T> {
  status: string;
  feeds?: T[];
  episodes?: T[];
  count: number;
  query: string;
  description: string;
}

// API credentials from environment variables or fallback to demo credentials
const API_KEY = import.meta.env.VITE_PODCAST_INDEX_API_KEY || 'UXKCGDSYGY6UIQNRNPJ7';
const API_SECRET = import.meta.env.VITE_PODCAST_INDEX_API_SECRET || 'yzJtuQGBpfZp^t5V4vB^5PYg#H8&EX^kLx8EhZuP';
const BASE_URL = 'https://api.podcastindex.org/api/1.0';

function generateAuthHeaders() {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const data4Hash = API_KEY + API_SECRET + apiHeaderTime;
  const hash4Header = CryptoJS.SHA1(data4Hash).toString();

  return {
    'X-Auth-Date': apiHeaderTime.toString(),
    'X-Auth-Key': API_KEY,
    'Authorization': hash4Header,
    'User-Agent': 'Podtardstr/1.0',
  };
}

export async function podcastIndexFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<PodcastIndexResponse<T>> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...generateAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Podcast Index API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function useSearchPodcasts(query: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['podcast-index', 'search', 'podcasts', query],
    queryFn: async () => {
      if (!query.trim()) return { feeds: [], count: 0 };

      const response = await podcastIndexFetch<PodcastIndexPodcast>('/search/byterm', {
        q: query.trim(),
        max: '20',
        clean: 'true',
        medium: 'music', // Only show music content like LNBeats
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
    enabled: options.enabled !== false && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchEpisodes(query: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['podcast-index', 'search', 'episodes', query],
    queryFn: async () => {
      if (!query.trim()) return { episodes: [], count: 0 };

      const response = await podcastIndexFetch<PodcastIndexEpisode>('/search/byterm', {
        q: query.trim(),
        max: '20',
        clean: 'true',
        medium: 'music', // Only show music content like LNBeats
      });

      // Sort by Value4Value (prioritize V4V content)
      const musicEpisodes = (response.episodes || []).sort((a, b) => {
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
    enabled: options.enabled !== false && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePodcastEpisodes(feedId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['podcast-index', 'episodes', feedId],
    queryFn: async () => {
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
        id: feedId.toString(),
        max: '50',
      });

      return {
        episodes: response.episodes || [],
        count: response.count,
      };
    },
    enabled: options.enabled !== false && feedId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTrendingPodcasts() {
  return useQuery({
    queryKey: ['podcast-index', 'trending'],
    queryFn: async () => {
      const response = await podcastIndexFetch<PodcastIndexPodcast>('/podcasts/trending', {
        max: '20',
        lang: 'en',
        medium: 'music', // Only show music content like LNBeats
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
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useRecentEpisodes() {
  return useQuery({
    queryKey: ['podcast-index', 'recent-episodes'],
    queryFn: async () => {
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/recent/episodes', {
        max: '20',
        excludeString: 'trailer,preview',
        medium: 'music', // Only show music content like LNBeats
      });

      // Sort by Value4Value (prioritize V4V content)
      const musicEpisodes = (response.episodes || []).sort((a, b) => {
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