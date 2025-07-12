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

async function podcastIndexFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<PodcastIndexResponse<T>> {
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
      });

      // Filter for music content
      const musicFeeds = (response.feeds || []).filter(feed => {
        const title = feed.title?.toLowerCase() || '';
        const description = feed.description?.toLowerCase() || '';
        const categories = Object.values(feed.categories || {}).join(' ').toLowerCase();
        
        // Look for music-related keywords
        const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'indie', 'rock', 'pop', 'jazz', 'electronic', 'hip hop', 'rap', 'classical'];
        
        return musicKeywords.some(keyword => 
          title.includes(keyword) || 
          description.includes(keyword) || 
          categories.includes(keyword) ||
          feed.itunesType === 'music'
        );
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
      });

      // Filter for music content
      const musicEpisodes = (response.episodes || []).filter(episode => {
        const title = episode.title?.toLowerCase() || '';
        const description = episode.description?.toLowerCase() || '';
        const feedTitle = episode.feedTitle?.toLowerCase() || '';
        
        // Look for music-related keywords
        const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'indie', 'rock', 'pop', 'jazz', 'electronic', 'hip hop', 'rap', 'classical'];
        
        return musicKeywords.some(keyword => 
          title.includes(keyword) || 
          description.includes(keyword) || 
          feedTitle.includes(keyword)
        );
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
        max: '50', // Get more to filter for music
        lang: 'en',
      });

      // Filter for music content
      const musicFeeds = (response.feeds || []).filter(feed => {
        const title = feed.title?.toLowerCase() || '';
        const description = feed.description?.toLowerCase() || '';
        const categories = Object.values(feed.categories || {}).join(' ').toLowerCase();
        
        // Look for music-related keywords
        const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'indie', 'rock', 'pop', 'jazz', 'electronic', 'hip hop', 'rap', 'classical'];
        
        return musicKeywords.some(keyword => 
          title.includes(keyword) || 
          description.includes(keyword) || 
          categories.includes(keyword) ||
          feed.itunesType === 'music'
        );
      }).slice(0, 20); // Take top 20 music feeds

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
        max: '50', // Get more to filter for music
        excludeString: 'trailer,preview',
      });

      // Filter for music content
      const musicEpisodes = (response.episodes || []).filter(episode => {
        const title = episode.title?.toLowerCase() || '';
        const description = episode.description?.toLowerCase() || '';
        const feedTitle = episode.feedTitle?.toLowerCase() || '';
        
        // Look for music-related keywords
        const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'indie', 'rock', 'pop', 'jazz', 'electronic', 'hip hop', 'rap', 'classical'];
        
        return musicKeywords.some(keyword => 
          title.includes(keyword) || 
          description.includes(keyword) || 
          feedTitle.includes(keyword)
        );
      }).slice(0, 20); // Take top 20 music episodes

      return {
        episodes: musicEpisodes,
        count: musicEpisodes.length,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}