import { useState } from 'react';
import { Search, ExternalLink, Heart, Share2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Skeleton } from '@/components/ui/skeleton';
import { useSearchPodcasts, useSearchEpisodes, type PodcastIndexPodcast, type PodcastIndexEpisode } from '@/hooks/usePodcastIndex';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface PodcastSearchProps {
  className?: string;
}

export function PodcastSearch({ className }: PodcastSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('podcasts');
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { playPodcast } = usePodcastPlayer();
  const { toast } = useToast();

  const podcastsQuery = useSearchPodcasts(query);
  const episodesQuery = useSearchEpisodes(query);

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
      content: `🎙️ I recommend this podcast: ${podcast.title}\n\n${podcast.description}\n\n${podcast.link}`,
      tags: [
        ['t', 'podcast'],
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
      content: `🎧 Great episode: ${episode.title}\n\nFrom: ${episode.feedTitle}\n\n${episode.description}\n\n${episode.link}`,
      tags: [
        ['t', 'podcast'],
        ['t', 'episode'],
        ['t', 'recommendation'],
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
    <div className={cn('space-y-6', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search podcasts and episodes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {query && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="podcasts">
              Podcasts ({podcastsQuery.data?.count || 0})
            </TabsTrigger>
            <TabsTrigger value="episodes">
              Episodes ({episodesQuery.data?.count || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="podcasts" className="space-y-4">
            {podcastsQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : podcastsQuery.data?.feeds.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No podcasts found for "{query}"</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {podcastsQuery.data?.feeds.map((podcast) => (
                  <Card key={podcast.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <img
                          src={podcast.image || podcast.artwork}
                          alt={podcast.title}
                          className="h-16 w-16 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                            {podcast.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {podcast.author || podcast.ownerName}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {podcast.description}
                          </p>

                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary">
                              {podcast.episodeCount} episodes
                            </Badge>
                            {podcast.language && (
                              <Badge variant="outline">
                                {podcast.language.toUpperCase()}
                              </Badge>
                            )}
                            {Object.values(podcast.categories || {}).slice(0, 2).map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleRecommendPodcast(podcast)}
                              variant="outline"
                              size="sm"
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Recommend on Nostr
                            </Button>
                            <Button
                              onClick={() => window.open(podcast.link, '_blank')}
                              variant="ghost"
                              size="sm"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="episodes" className="space-y-4">
            {episodesQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : episodesQuery.data?.episodes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No episodes found for "{query}"</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {episodesQuery.data?.episodes.map((episode) => (
                  <Card key={episode.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start space-x-4">
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
                          <h3 className="font-semibold line-clamp-2 mb-1">
                            {episode.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {episode.feedTitle}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {episode.description}
                          </p>

                          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                            <span>{formatDate(episode.datePublished)}</span>
                            {episode.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(episode.duration)}</span>
                              </>
                            )}
                            {episode.episodeType && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {episode.episodeType}
                                </Badge>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handlePlayEpisode(episode)}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Play
                            </Button>
                            <Button
                              onClick={() => handleRecommendEpisode(episode)}
                              variant="outline"
                              size="sm"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share on Nostr
                            </Button>
                            <Button
                              onClick={() => window.open(episode.link, '_blank')}
                              variant="ghost"
                              size="sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}