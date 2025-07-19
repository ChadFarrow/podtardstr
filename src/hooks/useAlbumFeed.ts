import { useQuery } from '@tanstack/react-query';
import { PodcastIndexEpisode } from './usePodcastIndex';

export interface AlbumTrack extends PodcastIndexEpisode {
  trackNumber?: number;
  albumTitle?: string;
  albumArtist?: string;
  albumArt?: string;
}

export interface AlbumFeedData {
  title: string;
  artist: string;
  description: string;
  artwork: string;
  tracks: AlbumTrack[];
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
  funding?: {
    url: string;
    message: string;
  };
}

async function fetchAlbumFeed(feedUrl: string): Promise<AlbumFeedData> {
  try {
    // Use the existing RSS parsing server endpoint
    const proxyUrl = import.meta.env.DEV 
      ? `/api/rss`
      : 'https://api.podtardstr.com/rss';
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: feedUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the RSS data into our album format
    const albumData: AlbumFeedData = {
      title: data.title || 'Unknown Album',
      artist: data.author || data.itunes?.author || 'Unknown Artist',
      description: data.description || '',
      artwork: data.image?.url || data.itunes?.image || '',
      tracks: [],
      value: data.value,
      funding: data.funding,
    };

    // Process episodes as tracks
    if (data.items && Array.isArray(data.items)) {
      albumData.tracks = data.items.map((item: any, index: number) => ({
        id: item.guid || `track-${index}`,
        title: item.title || `Track ${index + 1}`,
        link: item.link || '',
        description: item.description || '',
        guid: item.guid || `track-${index}`,
        datePublished: new Date(item.pubDate || Date.now()).getTime() / 1000,
        datePublishedPretty: item.pubDate || new Date().toISOString(),
        dateCrawled: Date.now() / 1000,
        enclosureUrl: item.enclosures?.[0]?.url || '',
        enclosureType: item.enclosures?.[0]?.type || 'audio/mpeg',
        enclosureLength: item.enclosures?.[0]?.length || 0,
        duration: item.itunes?.duration || 0,
        explicit: 0,
        episodeType: 'full',
        image: item.itunes?.image || albumData.artwork,
        feedImage: albumData.artwork,
        feedId: 0,
        feedTitle: albumData.title,
        feedLanguage: 'en',
        feedUrl: feedUrl,
        feedAuthor: albumData.artist,
        feedDescription: albumData.description,
        value: item.value || data.value,
        trackNumber: index + 1,
        albumTitle: albumData.title,
        albumArtist: albumData.artist,
        albumArt: albumData.artwork,
      }));
    }

    return albumData;
  } catch (error) {
    console.error('Error fetching album feed:', error);
    throw error;
  }
}

export function useAlbumFeed(feedUrl: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['album-feed', feedUrl],
    queryFn: () => fetchAlbumFeed(feedUrl),
    enabled: options.enabled !== false && !!feedUrl,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}