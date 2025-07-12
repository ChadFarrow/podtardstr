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
  items?: T[];
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
        q: `${query.trim()} music`,  // Add 'music' to search to bias towards music content
        max: '50',
        clean: 'true',
      });

      // Filter for actual music content
      const musicFeeds = (response.feeds || []).filter((feed: PodcastIndexPodcast) => {
        const title = feed.title?.toLowerCase() || '';
        const description = feed.description?.toLowerCase() || '';
        const categories = Object.values(feed.categories || {}).join(' ').toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Must contain search query and music indicators
        const hasQuery = title.includes(queryLower) || description.includes(queryLower);
        const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'musician', 'singer'];
        const hasMusicKeyword = musicKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword) || categories.includes(keyword)
        );

        // Exclude obvious non-music content
        const excludeKeywords = ['podcast', 'news', 'sports', 'talk', 'interview', 'radio show', 'comedy'];
        const hasExcludeKeyword = excludeKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );

        return hasQuery && hasMusicKeyword && !hasExcludeKeyword;
      })
      .sort((a, b) => {
        // Sort by Value4Value (prioritize V4V content)
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
        q: `${query.trim()} music`,  // Add 'music' to search to bias towards music content
        max: '50',
        clean: 'true',
      });

      // Filter for actual music episodes
      const musicEpisodes = (response.episodes || []).filter((episode: PodcastIndexEpisode) => {
        const title = episode.title?.toLowerCase() || '';
        const description = episode.description?.toLowerCase() || '';
        const feedTitle = episode.feedTitle?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        
        // Must contain search query and music indicators
        const hasQuery = title.includes(queryLower) || description.includes(queryLower) || feedTitle.includes(queryLower);
        const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'musician', 'singer'];
        const hasMusicKeyword = musicKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword) || feedTitle.includes(keyword)
        );

        // Exclude obvious non-music content
        const excludeKeywords = ['podcast', 'news', 'sports', 'talk', 'interview', 'radio show', 'comedy'];
        const hasExcludeKeyword = excludeKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword) || feedTitle.includes(keyword)
        );

        return hasQuery && hasMusicKeyword && !hasExcludeKeyword;
      })
      .sort((a, b) => {
        // Sort by Value4Value (prioritize V4V content)
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
    enabled: options.enabled !== false && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEpisodeByGuid(guid: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['podcast-index', 'episode-by-guid', guid],
    queryFn: async () => {
      console.log('Fetching episode by GUID:', guid);
      
      try {
        const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byguid', {
          guid: guid,
        });

        console.log('Episode by GUID API response:', response);

        return {
          episode: response.episodes?.[0] || null,
        };
      } catch (error) {
        console.error('Error fetching episode by GUID', guid, ':', error);
        throw error;
      }
    },
    enabled: options.enabled !== false && guid.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePodcastEpisodes(feedId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['podcast-index', 'episodes', feedId],
    queryFn: async () => {
      console.log('Fetching episodes for feed ID:', feedId);
      
      try {
        const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
          id: feedId.toString(),
          max: '50',
        });

        console.log('Episodes API response for feed', feedId, ':', response);

        return {
          episodes: response.episodes || response.items || [],
          count: response.count,
        };
      } catch (error) {
        console.error('Error fetching episodes for feed', feedId, ':', error);
        throw error;
      }
    },
    enabled: options.enabled !== false && feedId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Top100 Music Chart from Podcast Index (same as LNBeats)
interface Top100MusicEntry {
  rank: number;
  boosts: string;
  title: string;
  author: string;
  image: string;
  feedId?: number;
  feedUrl?: string;
  itemGuid?: string;
}

export function useTrendingPodcasts() {
  return useQuery({
    queryKey: ['podcast-index', 'trending'],
    queryFn: async () => {
      try {
        // Use official Podcast Index Top100 Music chart (same as LNBeats)
        const response = await fetch('https://stats.podcastindex.org/v4vmusic.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch top100 music chart');
        }
        
        const top100Response = await response.json();
        const top100Data: Top100MusicEntry[] = top100Response.items || [];
        
        // Convert to our PodcastIndexPodcast format
        const musicFeeds: PodcastIndexPodcast[] = top100Data.slice(0, 20).map((entry, index) => ({
          id: entry.feedId || entry.rank,
          title: entry.title,
          url: entry.feedUrl || '', 
          originalUrl: '',
          link: '',
          description: `Rank #${entry.rank} on V4V Music Chart with ${entry.boosts} boosts`,
          author: entry.author,
          ownerName: '',
          image: entry.image,
          artwork: entry.image,
          lastUpdateTime: 0,
          lastCrawlTime: 0,
          lastParseTime: 0,
          lastGoodHttpStatusTime: 0,
          lastHttpStatus: 200,
          contentType: '',
          itunesType: 'music',
          generator: '',
          language: 'en',
          type: 0,
          dead: 0,
          crawlErrors: 0,
          parseErrors: 0,
          categories: { 'music': 'Music' },
          locked: 0,
          imageUrlHash: 0,
          newestItemPubdate: 0,
          episodeCount: 1,
          // Mark as Value4Value enabled (these are all from V4V chart)
          value: {
            model: {
              type: 'lightning',
              method: 'keysend',
              suggested: '0.00000001000'
            },
            destinations: [{
              name: entry.author,
              address: '',
              type: 'node',
              split: 100
            }]
          }
        }));

        return {
          feeds: musicFeeds,
          count: musicFeeds.length,
        };
      } catch (error) {
        console.error('Failed to fetch top100 music chart, falling back to search:', error);
        
        // Fallback to search-based approach
        const searchResponse = await podcastIndexFetch<PodcastIndexPodcast>('/search/byterm', {
          q: 'music',
          max: '50',
          clean: 'true',
        });

        const musicFeeds = (searchResponse.feeds || []).filter((feed: PodcastIndexPodcast) => {
          const title = feed.title?.toLowerCase() || '';
          const description = feed.description?.toLowerCase() || '';
          const categories = Object.values(feed.categories || {}).join(' ').toLowerCase();
          
          const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'musician', 'singer'];
          const hasMusicKeyword = musicKeywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword) || categories.includes(keyword)
          );

          const excludeKeywords = ['podcast', 'news', 'sports', 'talk', 'interview', 'radio show', 'comedy'];
          const hasExcludeKeyword = excludeKeywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword)
          );

          return hasMusicKeyword && !hasExcludeKeyword;
        })
        .sort((a, b) => {
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
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useRecentEpisodes() {
  return useQuery({
    queryKey: ['podcast-index', 'recent-episodes'],
    queryFn: async () => {
      // Get more episodes to filter through
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/recent/episodes', {
        max: '100',
        excludeString: 'trailer,preview',
      });

      // Filter for actual music episodes
      const musicEpisodes = (response.episodes || []).filter((episode: PodcastIndexEpisode) => {
        const title = episode.title?.toLowerCase() || '';
        const description = episode.description?.toLowerCase() || '';
        const feedTitle = episode.feedTitle?.toLowerCase() || '';
        
        // Must have music indicators
        const musicKeywords = ['music', 'album', 'song', 'track', 'artist', 'band', 'musician', 'singer'];
        const hasMusicKeyword = musicKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword) || feedTitle.includes(keyword)
        );

        // Exclude obvious non-music content
        const excludeKeywords = ['podcast', 'news', 'sports', 'talk', 'interview', 'radio show', 'comedy'];
        const hasExcludeKeyword = excludeKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword) || feedTitle.includes(keyword)
        );

        return hasMusicKeyword && !hasExcludeKeyword;
      })
      .sort((a, b) => {
        // Sort by Value4Value (prioritize V4V content)
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