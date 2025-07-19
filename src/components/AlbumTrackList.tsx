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
  const { currentPodcast, isPlaying } = usePodcastPlayer();
  const { handlePlayPause, loadingTrackId } = useMusicPlayback();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTrackPlay = (track: AlbumTrack) => {
    // Convert AlbumTrack to PodcastIndexPodcast format for player
    const podcastFormat: PodcastIndexPodcast = {
      id: parseInt(track.id) || Date.now(),
      title: track.title,
      url: track.feedUrl || '',
      originalUrl: track.feedUrl || '',
      link: track.link,
      description: track.description,
      author: track.albumArtist || albumArtist,
      ownerName: track.albumArtist || albumArtist,
      image: track.albumArt || track.image,
      artwork: track.albumArt || track.image,
      lastUpdateTime: 0,
      lastCrawlTime: 0,
      lastParseTime: 0,
      lastGoodHttpStatusTime: 0,
      lastHttpStatus: 200,
      contentType: 'audio/mpeg',
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
      newestItemPubdate: track.datePublished,
      episodeCount: 1,
      value: track.value || defaultValue,
    };

    handlePlayPause(podcastFormat, {
      id: track.id,
      guid: track.guid,
      title: track.title,
      enclosureUrl: track.enclosureUrl,
      duration: track.duration,
      feedTitle: track.albumTitle || albumTitle,
      feedAuthor: track.albumArtist || albumArtist,
      feedImage: track.albumArt || track.image,
      value: track.value || defaultValue,
    });
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