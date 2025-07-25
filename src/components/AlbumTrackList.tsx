import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Clock } from 'lucide-react';

import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { useMusicPlayback } from '@/hooks/useMusicPlayback';
import { htmlToText } from '@/lib/html-utils';
import type { AlbumTrack } from '@/hooks/useAlbumFeed';
// import type { PodcastIndexPodcast } from '@/hooks/usePodcastIndex';

interface AlbumTrackListProps {
  tracks: AlbumTrack[];
  albumArtist: string;
}

export function AlbumTrackList({ tracks, albumArtist }: AlbumTrackListProps) {
  const { currentPodcast, isPlaying, playPodcast, setIsPlaying } = usePodcastPlayer();
  const { loadingTrackId } = useMusicPlayback();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTrackPlay = (track: AlbumTrack) => {
    const trackId = track.id.toString();
    
    // Check if this track is already playing
    if (isPlaying && currentPodcast?.id === trackId) {
      setIsPlaying(false);
      return;
    }

    // Check if we need to resume the same track
    if (!isPlaying && currentPodcast?.id === trackId) {
      setIsPlaying(true);
      return;
    }

    // Play the new track
    const podcastEpisode = {
      id: trackId,
      title: track.title,
      author: track.albumArtist || albumArtist,
      url: track.enclosureUrl,
      imageUrl: track.albumArt || track.image,
      duration: track.duration,
    };

    playPodcast(podcastEpisode);
  };

  const isTrackPlaying = (track: AlbumTrack) => {
    return isPlaying && currentPodcast?.id === track.id.toString();
  };

  const isTrackLoading = (track: AlbumTrack) => {
    return loadingTrackId === track.id.toString();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {tracks.map((track) => (
            <div
              key={track.guid}
              className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                isTrackPlaying(track) ? 'bg-muted/30' : ''
              }`}
            >
              {/* Track Number */}
              <div className="w-8 text-center text-sm text-muted-foreground">
                {track.trackNumber || '-'}
              </div>

              {/* Play Button */}
              <button
                onClick={() => handleTrackPlay(track)}
                disabled={isTrackLoading(track)}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isTrackPlaying(track) ? 'Pause' : 'Play'}
              >
                {isTrackLoading(track) ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : isTrackPlaying(track) ? (
                  <Pause className="h-4 w-4 text-primary" />
                ) : (
                  <Play className="h-4 w-4 text-primary ml-0.5" />
                )}
              </button>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.title}</h4>
                {track.description && track.description !== track.title && (
                  <p className="text-sm text-muted-foreground truncate">
                    {htmlToText(track.description)}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(track.duration)}
              </div>


            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}