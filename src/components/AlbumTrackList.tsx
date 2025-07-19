import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Clock } from 'lucide-react';
import { V4VPaymentButton } from '@/components/V4VPaymentButton';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { useMusicPlayback } from '@/hooks/useMusicPlayback';
import type { AlbumTrack } from '@/hooks/useAlbumFeed';
import type { PodcastIndexPodcast } from '@/hooks/usePodcastIndex';

interface AlbumTrackListProps {
  tracks: AlbumTrack[];
  albumTitle: string;
  albumArtist: string;
  defaultValue?: PodcastIndexPodcast['value'];
}

export function AlbumTrackList({ tracks, albumTitle, albumArtist, defaultValue }: AlbumTrackListProps) {
  const { currentPodcast, isPlaying, playPodcast, setIsPlaying } = usePodcastPlayer();
  const { loadingTrackId } = useMusicPlayback();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTrackPlay = (track: AlbumTrack) => {
    // Check if this track is already playing
    if (isPlaying && currentPodcast?.id === track.id) {
      setIsPlaying(false);
      return;
    }

    // Check if we need to resume the same track
    if (!isPlaying && currentPodcast?.id === track.id) {
      setIsPlaying(true);
      return;
    }

    // Play the new track
    const podcastEpisode = {
      id: track.id,
      title: track.title,
      author: track.albumArtist || albumArtist,
      url: track.enclosureUrl,
      imageUrl: track.albumArt || track.image,
      duration: track.duration,
    };

    playPodcast(podcastEpisode);
  };

  const isTrackPlaying = (track: AlbumTrack) => {
    return isPlaying && currentPodcast?.id === track.id;
  };

  const isTrackLoading = (track: AlbumTrack) => {
    return loadingTrackId === track.id;
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
                  <p className="text-sm text-muted-foreground truncate">{track.description}</p>
                )}
              </div>

              {/* Duration */}
              {track.duration > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(track.duration)}
                </div>
              )}

              {/* Track-specific V4V Payment */}
              {(track.value?.destinations || defaultValue?.destinations) && (
                <V4VPaymentButton
                  valueDestinations={track.value?.destinations || defaultValue?.destinations}
                  feedUrl={track.feedUrl}
                  totalAmount={21}
                  contentTitle={`${track.title} - ${albumTitle}`}
                  feedId={track.id}
                  size="sm"
                  variant="ghost"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}