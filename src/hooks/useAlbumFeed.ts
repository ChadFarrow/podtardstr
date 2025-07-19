import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PodcastIndexEpisode } from './usePodcastIndex';
import { fetchAndParseFeed, PodRollItem } from '@/lib/feed-parser';

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
  podroll?: PodRollItem[];
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

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

async function fetchAlbumFeed(feedUrl: string): Promise<AlbumFeedData> {
  try {
    // Use the existing fetchAndParseFeed function which handles CORS and fallbacks
    const parsedFeed = await fetchAndParseFeed(feedUrl);
    
    console.log('🎵 useAlbumFeed: Parsed feed data:', {
      feedUrl,
      title: parsedFeed.title,
      hasPodroll: !!parsedFeed.podroll,
      podrollLength: parsedFeed.podroll?.length || 0,
      podrollItems: parsedFeed.podroll
    });
    
    // Transform the RSS data into our album format
    const albumData: AlbumFeedData = {
      title: parsedFeed.title || 'Unknown Album',
      artist: 'The Doerfels', // Hardcode the correct artist name
      description: parsedFeed.description || '',
      artwork: parsedFeed.image || '',
      tracks: [],
      podroll: parsedFeed.podroll,
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
      funding: parsedFeed.funding
    };

    // Process episodes as tracks
    if (parsedFeed.episodes && Array.isArray(parsedFeed.episodes)) {
      albumData.tracks = parsedFeed.episodes.map((episode, index) => {
        // Parse duration from string format (e.g., "3:45" to seconds)
        let durationInSeconds = 0;
        if (episode.duration) {
          console.log(`Track ${index + 1} duration from RSS: "${episode.duration}"`);
          const parts = episode.duration.split(':');
          if (parts.length === 2) {
            durationInSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            console.log(`Parsed as MM:SS format: ${durationInSeconds} seconds`);
          } else if (parts.length === 3) {
            durationInSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            console.log(`Parsed as HH:MM:SS format: ${durationInSeconds} seconds`);
          } else if (!isNaN(parseInt(episode.duration))) {
            durationInSeconds = parseInt(episode.duration);
            console.log(`Parsed as seconds: ${durationInSeconds} seconds`);
          }
          console.log(`Final duration for track ${index + 1}: ${durationInSeconds} seconds (${formatDuration(durationInSeconds)})`);
        } else {
          console.log(`Track ${index + 1} has no duration`);
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

const FEATURED_ALBUMS = [
  {
    id: 'bloodshot-lies',
    title: 'Bloodshot Lies - The Album',
    artist: 'The Doerfels',
    feedUrl: 'https://www.doerfelverse.com/feeds/bloodshot-lies-album.xml',
  },
  {
    id: 'heycitizen-experience',
    title: 'The HeyCitizen Experience',
    artist: 'HeyCitizen',
    feedUrl: 'https://files.heycitizen.xyz/Songs/Albums/The-Heycitizen-Experience/the heycitizen experience.xml',
  },
  {
    id: 'think-ep',
    title: 'Think EP',
    artist: 'The Doerfels',
    feedUrl: 'https://www.doerfelverse.com/feeds/think-ep.xml',
  },
  {
    id: 'music-from-the-doerfelverse',
    title: 'Music From The Doerfel-Verse',
    artist: 'The Doerfels',
    feedUrl: 'https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml',
  },
  {
    id: 'stay-awhile',
    title: 'Stay Awhile',
    artist: 'Able and The Wolf',
    feedUrl: 'https://ableandthewolf.com/static/media/feed.xml',
  },
  {
    id: 'spectral-hiding',
    title: 'Spectral Hiding',
    artist: 'Bitpunk.fm',
    feedUrl: 'https://zine.bitpunk.fm/feeds/spectral-hiding.xml',
  },
  {
    id: 'polar-embrace',
    title: 'Polar Embrace',
    artist: 'The Satellite Skirmish',
    feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/rss/videofeed/feed.xml',
  },
  {
    id: 'autumn-rust',
    title: 'Autumn Rust',
    artist: 'The Satellite Skirmish',
    feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml',
  },
  {
    id: 'the-satellite-skirmish-album',
    title: 'The Satellite Skirmish',
    artist: 'Various Artists',
    feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/the_satellite_skirmish_album.xml',
  },
  {
    id: 'lofi-experience',
    title: 'HeyCitizen\'s Lo-Fi Hip-Hop Beats to Study and Relax to',
    artist: 'HeyCitizen',
    feedUrl: 'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/lofi.xml',
  },
  {
    id: 'tinderbox',
    title: 'Tinderbox',
    artist: 'Nate Johnivan',
    feedUrl: 'https://wavlake.com/feed/music/d677db67-0310-4813-970e-e65927c689f1',
  },
  {
    id: 'deathdreams',
    title: 'deathdreams',
    artist: 'Survival Guide (Emily Whitehurst)',
    feedUrl: 'https://static.staticsave.com/mspfiles/deathdreams.xml',
  },
  {
    id: 'pony-up-daddy',
    title: 'Pony Up Daddy',
    artist: '$2 Holla',
    feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Mike_Epting/$2Holla/pony%20up%20daddy.xml',
  },
  {
    id: 'empty-passenger-seat',
    title: 'Empty Passenger Seat',
    artist: 'White Rabbit Records',
    feedUrl: 'https://whiterabbitrecords.org/wp-content/uploads/2023/04/Empty-Passenger-Seat.xml',
  },
];

// Prefetch common albums for better performance
export function usePrefetchAlbums() {
  const queryClient = useQueryClient();
  
  // Prefetch the featured albums when the hook is called
  FEATURED_ALBUMS.forEach(album => {
    queryClient.prefetchQuery({
      queryKey: ['album-feed', album.feedUrl, '1.172'],
      queryFn: () => fetchAlbumFeed(album.feedUrl),
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    });
  });
}

export function useAlbumFeed(feedUrl: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['album-feed', feedUrl, '1.172'], // Add version to bust cache
    queryFn: () => fetchAlbumFeed(feedUrl),
    enabled: options.enabled !== false && !!feedUrl,
    staleTime: 10 * 60 * 1000, // 10 minutes - data is fresh for 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache for 1 hour
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
}