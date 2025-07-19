import { useQuery } from '@tanstack/react-query';
import { PodcastIndexEpisode } from './usePodcastIndex';
import { fetchAndParseFeed } from '@/lib/feed-parser';

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
    // Use the existing fetchAndParseFeed function which handles CORS and fallbacks
    const parsedFeed = await fetchAndParseFeed(feedUrl);
    
    // Transform the RSS data into our album format
    const albumData: AlbumFeedData = {
      title: parsedFeed.title || 'Unknown Album',
      artist: 'The Doerfels', // Hardcode the correct artist name
      description: parsedFeed.description || '',
      artwork: parsedFeed.image || '',
      tracks: [],
      value: parsedFeed.value ? {
        model: {
          type: parsedFeed.value.type || 'lightning',
          method: parsedFeed.value.method || 'keysend',
          suggested: parsedFeed.value.suggested || '1000',
        },
        destinations: parsedFeed.value.recipients.map(recipient => ({
          name: recipient.name || 'Unknown',
          address: recipient.address,
          type: recipient.type,
          split: recipient.split,
        })),
      } : undefined,
      funding: undefined, // The parser doesn't extract funding info yet
    };

    // Process episodes as tracks
    if (parsedFeed.episodes && Array.isArray(parsedFeed.episodes)) {
      albumData.tracks = parsedFeed.episodes.map((episode, index) => {
        // Parse duration from string format (e.g., "3:45" to seconds)
        let durationInSeconds = 0;
        if (episode.duration) {
          const parts = episode.duration.split(':');
          if (parts.length === 2) {
            durationInSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
          } else if (parts.length === 3) {
            durationInSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
          } else if (!isNaN(parseInt(episode.duration))) {
            durationInSeconds = parseInt(episode.duration);
          }
        }
        
        return {
          id: index + 1, // Use numeric ID for compatibility
          title: episode.title || `Track ${index + 1}`,
          link: episode.link || '',
          description: episode.description || '',
          guid: episode.guid || `track-${index}`,
          datePublished: episode.pubDate ? new Date(episode.pubDate).getTime() / 1000 : Date.now() / 1000,
          datePublishedPretty: episode.pubDate || new Date().toISOString(),
          dateCrawled: Date.now() / 1000,
          enclosureUrl: episode.enclosure?.url || '',
          enclosureType: episode.enclosure?.type || 'audio/mpeg',
          enclosureLength: episode.enclosure?.length || 0,
          duration: durationInSeconds,
          explicit: 0,
          episodeType: 'full',
          image: albumData.artwork,
          feedImage: albumData.artwork,
          feedId: 0,
          feedTitle: albumData.title,
          feedLanguage: 'en',
          feedUrl: feedUrl,
          feedAuthor: albumData.artist,
          feedDescription: albumData.description,
          value: episode.value ? {
            model: {
              type: episode.value.type || 'lightning',
              method: episode.value.method || 'keysend',
              suggested: episode.value.suggested || '1000',
            },
            destinations: episode.value.recipients.map(recipient => ({
              name: recipient.name || 'Unknown',
              address: recipient.address,
              type: recipient.type,
              split: recipient.split,
            })),
          } : parsedFeed.value ? {
            model: {
              type: parsedFeed.value.type || 'lightning',
              method: parsedFeed.value.method || 'keysend',
              suggested: parsedFeed.value.suggested || '1000',
            },
            destinations: parsedFeed.value.recipients.map(recipient => ({
              name: recipient.name || 'Unknown',
              address: recipient.address,
              type: recipient.type,
              split: recipient.split,
            })),
          } : undefined,
          trackNumber: index + 1,
          albumTitle: albumData.title,
          albumArtist: albumData.artist,
          albumArt: albumData.artwork,
        };
      });
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