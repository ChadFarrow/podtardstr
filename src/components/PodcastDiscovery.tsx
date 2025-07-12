import { TrendingUp, Clock, Play, Heart, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrendingPodcasts, useRecentEpisodes, type PodcastIndexPodcast, type PodcastIndexEpisode } from '@/hooks/usePodcastIndex';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface PodcastDiscoveryProps {
  className?: string;
}

export function PodcastDiscovery({ className }: PodcastDiscoveryProps) {
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { playPodcast } = usePodcastPlayer();
  const { toast } = useToast();

  const trendingQuery = useTrendingPodcasts();
  const recentQuery = useRecentEpisodes();

  const handleRecommendPodcast = (podcast: PodcastIndexPodcast) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to recommend podcasts on Nostr.',
        variant: 'destructive',
      });
      return;
    }

    createEvent({
      kind: 1,
      content: `🔥 Trending podcast: ${podcast.title}\n\n${podcast.description}\n\n${podcast.link}`,
      tags: [
        ['t', 'podcast'],
        ['t', 'trending'],
        ['t', 'recommendation'],
        ['r', podcast.link],
        ['title', podcast.title],
        ['podcast-index-id', podcast.id.toString()],
      ],
    });

    toast({
      title: 'Recommendation Posted',
      description: 'Your podcast recommendation has been shared on Nostr!',
    });
  };

  const handlePlayEpisode = (episode: PodcastIndexEpisode) => {
    playPodcast({
      id: episode.id.toString(),
      title: episode.title,
      author: episode.feedTitle,
      url: episode.enclosureUrl,
      imageUrl: episode.image || episode.feedImage,
      duration: episode.duration,
    });
  };

  const handleRecommendEpisode = (episode: PodcastIndexEpisode) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to recommend episodes on Nostr.',
        variant: 'destructive',
      });
      return;
    }

    createEvent({
      kind: 1,
      content: `🆕 Fresh episode: ${episode.title}\n\nFrom: ${episode.feedTitle}\n\n${episode.description}\n\n${episode.link}`,
      tags: [
        ['t', 'podcast'],
        ['t', 'episode'],
        ['t', 'fresh'],
        ['r', episode.link],
        ['title', episode.title],
        ['podcast-title', episode.feedTitle],
        ['episode-id', episode.id.toString()],
      ],
    });

    toast({
      title: 'Episode Shared',
      description: 'Your episode recommendation has been shared on Nostr!',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Trending Podcasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Podcasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendingQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trendingQuery.data?.feeds.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No trending podcasts available
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingQuery.data?.feeds.slice(0, 6).map((podcast) => (
                <Card key={podcast.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={podcast.image || podcast.artwork}
                        alt={podcast.title}
                        className="h-12 w-12 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {podcast.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {podcast.author || podcast.ownerName}
                        </p>
                        <div className="flex items-center gap-1 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {podcast.episodeCount} episodes
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => handleRecommendPodcast(podcast)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Recommend
                          </Button>
                          <Button
                            onClick={() => window.open(podcast.link, '_blank')}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Episodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Episodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentQuery.data?.episodes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent episodes available
            </p>
          ) : (
            <div className="space-y-4">
              {recentQuery.data?.episodes.slice(0, 8).map((episode) => (
                <div key={episode.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <img
                    src={episode.image || episode.feedImage}
                    alt={episode.title}
                    className="h-12 w-12 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-clamp-2 mb-1">
                      {episode.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {episode.feedTitle}
                    </p>
                    <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                      <span>{formatDate(episode.datePublished)}</span>
                      {episode.duration > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(episode.duration)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePlayEpisode(episode)}
                        size="sm"
                        className="h-7"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                      <Button
                        onClick={() => handleRecommendEpisode(episode)}
                        variant="outline"
                        size="sm"
                        className="h-7"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}