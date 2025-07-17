import { Button } from '@/components/ui/button';
import { ListMusic } from 'lucide-react';
import { usePlayAll } from '@/hooks/usePlayAll';
import type { PodcastIndexPodcast } from '@/hooks/usePodcastIndex';

interface PlayAllButtonProps {
  trendingMusic: { feeds: PodcastIndexPodcast[] } | undefined;
}

export function PlayAllButton({ trendingMusic }: PlayAllButtonProps) {
  const { handlePlayAll, isLoadingPlayAll } = usePlayAll();

  return (
    <Button
      onClick={() => trendingMusic && handlePlayAll(trendingMusic)}
      disabled={isLoadingPlayAll || !trendingMusic?.feeds.length}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      <ListMusic className="h-4 w-4" />
      {isLoadingPlayAll ? 'Loading...' : 'Play All'}
    </Button>
  );
} 