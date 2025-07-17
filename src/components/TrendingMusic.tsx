import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useTop100Music } from '@/hooks/usePodcastIndex';
import { useMusicPlayback } from '@/hooks/useMusicPlayback';
import { PlayAllButton } from '@/components/PlayAllButton';
import { MusicGrid } from '@/components/MusicGrid';

export function TrendingMusic() {
  const { data: trendingMusic, isLoading: trendingLoading } = useTop100Music();
  const { handlePlayPauseAlbum, isCurrentlyPlaying, loadingTrackId } = useMusicPlayback();



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top 100 V4V Music Chart
            </CardTitle>
            <PlayAllButton trendingMusic={trendingMusic} />
          </div>
        </CardHeader>
        <CardContent>
          {trendingLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-24 sm:h-32 w-full" />
              ))}
            </div>
          ) : trendingMusic && trendingMusic.feeds.length > 0 ? (
            <MusicGrid
              feeds={trendingMusic.feeds}
              loadingTrackId={loadingTrackId}
              onPlayPause={handlePlayPauseAlbum}
              isCurrentlyPlaying={isCurrentlyPlaying}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trending music found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}