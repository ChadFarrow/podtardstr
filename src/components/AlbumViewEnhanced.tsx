import { useAlbumFeed } from '@/hooks/useAlbumFeed';
import { AlbumBackground } from '@/components/AlbumBackground';
import { AlbumHero } from '@/components/AlbumHero';
import { TrackList } from '@/components/TrackList';
import { AlbumRecommendations } from '@/components/AlbumRecommendations';
import { useAlbumControls } from '@/components/AlbumControls';
import { AlbumNavigation } from '@/components/AlbumNavigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AlbumViewEnhancedProps {
  feedUrl?: string;
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
];

export function AlbumViewEnhanced({ feedUrl }: AlbumViewEnhancedProps) {
  const currentFeedUrl = feedUrl || FEATURED_ALBUMS[0].feedUrl;
  
  console.log('🎵 AlbumViewEnhanced: Loading feed URL:', currentFeedUrl);
  
  const { data: albumData, isLoading, error } = useAlbumFeed(currentFeedUrl);
  
  console.log('🎵 AlbumViewEnhanced: Hook result:', { 
    isLoading, 
    hasError: !!error, 
    hasData: !!albumData,
    trackCount: albumData?.tracks?.length || 0,
    firstTrackDuration: albumData?.tracks?.[0]?.duration || 'N/A',
    hasPodroll: !!albumData?.podroll,
    podrollLength: albumData?.podroll?.length || 0,
    podrollItems: albumData?.podroll
  });

  // Use the album controls hook
  const controls = useAlbumControls({ albumData: albumData || { tracks: [], artist: '', artwork: '' } });

  // Calculate total duration and current year
  const totalDuration = albumData?.tracks?.reduce((total, track) => total + track.duration, 0) || 0;
  const currentYear = new Date().getFullYear();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="relative z-10 h-full flex flex-col">
          {/* Hero Section Skeleton */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-6xl w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Album Art Skeleton */}
                <div className="flex justify-center">
                  <Skeleton className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl" />
                </div>
                
                {/* Album Details Skeleton */}
                <div className="text-center lg:text-left space-y-6">
                  <div>
                    <Skeleton className="h-4 w-32 mx-auto lg:mx-0 mb-2" />
                    <Skeleton className="h-16 w-64 mx-auto lg:mx-0 mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto lg:mx-0 mb-6" />
                  </div>
                  <Skeleton className="h-6 w-full max-w-lg mx-auto lg:mx-0" />
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-12 w-40 mx-auto lg:mx-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Track List Skeleton */}
          <div className="p-8">
            <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
              <Skeleton className="h-8 w-32 mx-auto mb-6" />
              <div className="space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center space-x-6">
                      <Skeleton className="w-8 h-8" />
                      <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !albumData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Failed to load album</h1>
          <p className="text-gray-400">Please check the feed URL and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <AlbumBackground artwork={albumData.artwork}>
      <AlbumNavigation />
      <AlbumHero
        title={albumData.title}
        artist={albumData.artist}
        artwork={albumData.artwork}
        description={albumData.description}
        trackCount={albumData.tracks.length}
        totalDuration={totalDuration}
        currentYear={currentYear}
        isPlaying={controls.isAlbumPlaying()}
        funding={albumData.funding}
        onPlayAlbum={controls.handleAlbumPlay}
      />

      <TrackList
        tracks={albumData.tracks}
        artist={albumData.artist}
        onTrackPlay={controls.handleTrackPlay}
        isTrackPlaying={controls.isTrackPlaying}
      />

      <div className="pb-8"></div>

      <AlbumRecommendations
        podroll={albumData.podroll}
        currentFeedUrl={currentFeedUrl}
      />
    </AlbumBackground>
  );
}