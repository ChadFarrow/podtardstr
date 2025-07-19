import { useAlbumFeed } from '@/hooks/useAlbumFeed';
import { AlbumBackground } from '@/components/AlbumBackground';
import { AlbumHero } from '@/components/AlbumHero';
import { TrackList } from '@/components/TrackList';
import { AlbumRecommendations } from '@/components/AlbumRecommendations';
import { useAlbumControls } from '@/components/AlbumControls';
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-96 h-96 rounded-2xl mx-auto" />
          <Skeleton className="w-64 h-8 mx-auto" />
          <Skeleton className="w-48 h-6 mx-auto" />
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
      <AlbumHero
        title={albumData.title}
        artist={albumData.artist}
        artwork={albumData.artwork}
        description={albumData.description}
        trackCount={albumData.tracks.length}
        totalDuration={totalDuration}
        currentYear={currentYear}
        isPlaying={controls.isAlbumPlaying()}
        onPlayAlbum={controls.handleAlbumPlay}
      />

      <TrackList
        tracks={albumData.tracks}
        artist={albumData.artist}
        onTrackPlay={controls.handleTrackPlay}
        isTrackPlaying={controls.isTrackPlaying}
      />

      <AlbumRecommendations
        podroll={albumData.podroll}
        currentFeedUrl={currentFeedUrl}
      />
    </AlbumBackground>
  );
}