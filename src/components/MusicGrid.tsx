import { MusicCard } from '@/components/MusicCard';
import type { PodcastIndexPodcast } from '@/hooks/usePodcastIndex';

interface MusicGridProps {
  feeds: PodcastIndexPodcast[];
  loadingTrackId: string | null;
  onPlayPause: (podcast: PodcastIndexPodcast) => void;
  isCurrentlyPlaying: (id: string, feedTitle?: string) => boolean;
}

export function MusicGrid({ 
  feeds, 
  loadingTrackId, 
  onPlayPause, 
  isCurrentlyPlaying 
}: MusicGridProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground px-1">
        Showing Top {feeds.length} tracks from the Value4Value Music Chart
      </div>
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {feeds.map((feed, index) => (
          <MusicCard
            key={`trending-${feed.id}-${index}`}
            feed={feed}
            index={index}
            loadingTrackId={loadingTrackId}
            onPlayPause={onPlayPause}
            isCurrentlyPlaying={isCurrentlyPlaying}
          />
        ))}
      </div>
    </div>
  );
} 