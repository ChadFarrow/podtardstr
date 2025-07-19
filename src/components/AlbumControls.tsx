import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { useMusicPlayback } from '@/hooks/useMusicPlayback';
import type { AlbumTrack } from '@/hooks/useAlbumFeed';

interface AlbumControlsProps {
  albumData: {
    tracks: AlbumTrack[];
    artist: string;
    artwork: string;
  };
}

export function useAlbumControls({ albumData }: AlbumControlsProps) {
  const { currentPodcast, isPlaying, playPodcast, setIsPlaying, addToQueue, clearQueue } = usePodcastPlayer();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTrackPlay = (track: AlbumTrack) => {
    const trackId = track.id.toString();
    
    console.log('🎵 handleTrackPlay called:', {
      trackId,
      trackTitle: track.title,
      isCurrentlyPlaying: isPlaying && currentPodcast?.id === trackId,
      currentPodcastId: currentPodcast?.id,
      currentPodcastTitle: currentPodcast?.title
    });
    
    // Check if this track is already playing
    if (isPlaying && currentPodcast?.id === trackId) {
      console.log('🎵 Pausing current track');
      setIsPlaying(false);
      return;
    }

    // Check if we need to resume the same track
    if (!isPlaying && currentPodcast?.id === trackId) {
      console.log('🎵 Resuming current track');
      setIsPlaying(true);
      return;
    }

    console.log('🎵 Playing new track, setting up queue...');
    
    // Clear existing queue and set up new queue with ALL tracks from the album
    clearQueue();
    
    // Convert ALL tracks to the format expected by the player
    const allTracksData = albumData?.tracks.map(t => ({
      id: t.id.toString(),
      title: t.title,
      author: t.albumArtist || albumData?.artist || '',
      url: t.enclosureUrl,
      imageUrl: t.albumArt || t.image || albumData?.artwork || '',
      duration: t.duration,
    })) || [];
    
    // Find the index of the clicked track
    const clickedTrackIndex = albumData?.tracks.findIndex(t => t.id.toString() === trackId) || 0;
    
    console.log('🎵 Queue setup:', {
      totalTracks: allTracksData.length,
      clickedTrackIndex,
      clickedTrackTitle: allTracksData[clickedTrackIndex]?.title,
      clickedTrackUrl: allTracksData[clickedTrackIndex]?.url
    });
    
    // Add all tracks to queue except the clicked one (which we'll play directly)
    allTracksData.forEach((trackData, index) => {
      if (index !== clickedTrackIndex) {
        addToQueue(trackData);
      }
    });

    // Play the clicked track
    if (allTracksData.length > 0) {
      console.log('🎵 Calling playPodcast with:', allTracksData[clickedTrackIndex]);
      playPodcast(allTracksData[clickedTrackIndex]);
    }
  };

  const handleAlbumPlay = () => {
    if (!albumData?.tracks || albumData.tracks.length === 0) return;
    
    console.log('🎵 handleAlbumPlay called:', {
      trackCount: albumData.tracks.length,
      firstTrackTitle: albumData.tracks[0]?.title
    });
    
    // Clear existing queue
    clearQueue();
    
    // Convert tracks to the format expected by the player
    const tracksData = albumData.tracks.map(track => ({
      id: track.id.toString(),
      title: track.title,
      author: track.albumArtist || albumData.artist,
      url: track.enclosureUrl,
      imageUrl: track.albumArt || track.image || albumData.artwork,
      duration: track.duration,
    }));
    
    console.log('🎵 Album play setup:', {
      totalTracks: tracksData.length,
      firstTrack: tracksData[0]?.title,
      lastTrack: tracksData[tracksData.length - 1]?.title
    });
    
    // Set up the queue with all tracks and play the first one
    // We need to manually set the queue and current index instead of using addToQueue + playPodcast
    const { setQueue, setCurrentIndex } = usePodcastPlayer.getState();
    
    // Set the queue directly
    setQueue(tracksData);
    
    // Set current index to 0 and play the first track
    setCurrentIndex(0);
    
    // Play the first track
    if (tracksData.length > 0) {
      playPodcast(tracksData[0]);
    }
  };

  const isTrackPlaying = (track: AlbumTrack) => {
    return isPlaying && currentPodcast?.id === track.id.toString();
  };

  const isAlbumPlaying = () => {
    if (!albumData?.tracks || albumData.tracks.length === 0) return false;
    
    // Check if any track from this album is currently playing
    const currentTrackId = currentPodcast?.id;
    return isPlaying && albumData.tracks.some(track => track.id.toString() === currentTrackId);
  };

  return {
    formatDuration,
    handleTrackPlay,
    handleAlbumPlay,
    isTrackPlaying,
    isAlbumPlaying,
    isPlaying,
    currentPodcast
  };
} 