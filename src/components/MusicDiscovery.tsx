import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Search, Zap, Bitcoin, Heart, ExternalLink, ChevronDown, ChevronRight, Album } from 'lucide-react';
import { useRecentMusicEpisodes, useMusicSearch } from '@/hooks/useMusicIndex';
import { useTrendingPodcasts } from '@/hooks/usePodcastIndex';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { usePodcastEpisodes } from '@/hooks/usePodcastIndex';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';


export function MusicDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [expandedAlbum, setExpandedAlbum] = useState<number | null>(null);
  const { playPodcast } = usePodcastPlayer();

  const { data: trendingMusic, isLoading: trendingLoading } = useTrendingPodcasts(); // Use same hook as main trending
  const { data: recentEpisodes, isLoading: recentLoading } = useRecentMusicEpisodes();
  const { data: searchResults, isLoading: searchLoading } = useMusicSearch(searchQuery, { enabled: searchQuery.length > 2 });
  const { data: episodesData } = usePodcastEpisodes(selectedFeedId || 0, { enabled: selectedFeedId !== null });
  const { data: albumTracksData } = usePodcastEpisodes(expandedAlbum || 0, { enabled: expandedAlbum !== null });

  const handlePlayTrack = (episode: PodcastIndexEpisode) => {
    playPodcast({
      id: episode.id.toString(),
      title: episode.title,
      author: episode.feedTitle,
      url: episode.enclosureUrl,
      imageUrl: episode.image || episode.feedImage,
      duration: episode.duration,
    });
  };

  const handlePlayAlbum = async (podcast: PodcastIndexPodcast) => {
    console.log('Play button clicked for:', podcast.title, 'Feed ID:', podcast.id);
    
    // First try to fetch episodes for this feed
    setSelectedFeedId(podcast.id);
    
    // If no episodes are found after a short delay, try to play the feed URL directly
    setTimeout(() => {
      if (selectedFeedId === podcast.id) {
        console.log('No episodes found, trying to play feed URL directly:', podcast.url);
        
        if (podcast.url) {
          // Create a mock episode from the feed data to play directly
          const mockEpisode = {
            id: podcast.id.toString(),
            title: podcast.title,
            author: podcast.author,
            url: podcast.url,
            imageUrl: podcast.image || podcast.artwork,
            duration: 0,
          };
          
          console.log('Playing feed URL as episode:', mockEpisode);
          playPodcast(mockEpisode);
        }
        
        setSelectedFeedId(null);
      }
    }, 2000); // Wait 2 seconds for episodes to load
  };

  // Auto-play first episode when episodes are loaded
  React.useEffect(() => {
    if (episodesData?.episodes?.length > 0) {
      const firstEpisode = episodesData.episodes[0];
      console.log('Episodes loaded for feed:', selectedFeedId, episodesData.episodes);
      console.log('First episode:', firstEpisode);
      
      if (firstEpisode.enclosureUrl) {
        console.log('Playing episode:', firstEpisode.title, firstEpisode.enclosureUrl);
        handlePlayTrack(firstEpisode);
      } else {
        console.log('No enclosure URL found for episode:', firstEpisode.title);
      }
      setSelectedFeedId(null); // Reset after playing
    } else if (selectedFeedId !== null) {
      console.log('No episodes found for feed:', selectedFeedId);
    }
  }, [episodesData]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasValue4Value = (item: PodcastIndexPodcast | PodcastIndexEpisode) => {
    return item.value?.destinations && item.value.destinations.length > 0;
  };

  const handleAlbumClick = (podcast: PodcastIndexPodcast) => {
    if (expandedAlbum === podcast.id) {
      setExpandedAlbum(null); // Collapse if already expanded
    } else {
      setExpandedAlbum(podcast.id); // Expand this album
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search for artists, albums, or tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {searchQuery.length > 2 && (
            <div className="mt-4">
              {searchLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : searchResults && (searchResults.feeds.length > 0 || searchResults.episodes.length > 0) ? (
                <div className="space-y-4">
                  {searchResults.episodes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tracks</h4>
                      <div className="grid gap-3">
                        {searchResults.episodes.map((episode) => (
                          <div key={episode.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted">
                            <img 
                              src={episode.image || episode.feedImage} 
                              alt={episode.title}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium truncate">{episode.title}</h5>
                              <p className="text-sm text-muted-foreground truncate">{episode.feedTitle}</p>
                              {episode.duration && (
                                <p className="text-xs text-muted-foreground">{formatDuration(episode.duration)}</p>
                              )}
                            </div>
                            {hasValue4Value(episode) && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Bitcoin className="h-3 w-3" />
                                V4V
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => handlePlayTrack(episode)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.feeds.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Albums & Artists</h4>
                      <div className="grid gap-3">
                        {searchResults.feeds.map((feed) => (
                          <div key={feed.id} className="border rounded-lg">
                            <div className="flex items-center gap-3 p-3 hover:bg-muted">
                              <img 
                                src={feed.image || feed.artwork} 
                                alt={feed.title}
                                className="h-12 w-12 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium truncate">{feed.title}</h5>
                                <p className="text-sm text-muted-foreground truncate">{feed.author}</p>
                                <p className="text-xs text-muted-foreground">{feed.episodeCount} tracks</p>
                              </div>
                              {hasValue4Value(feed) && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  V4V
                                </Badge>
                              )}
                              <Button 
                                variant="ghost"
                                size="sm" 
                                onClick={() => handleAlbumClick(feed)}
                                className="flex items-center gap-1"
                              >
                                <Album className="h-4 w-4" />
                                {expandedAlbum === feed.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handlePlayAlbum(feed)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Expanded track listing */}
                            {expandedAlbum === feed.id && (
                              <div className="border-t bg-muted/30">
                                {albumTracksData?.episodes ? (
                                  <div className="p-3 space-y-2">
                                    <h6 className="text-sm font-medium text-muted-foreground">All Tracks</h6>
                                    {albumTracksData.episodes.map((episode, index) => (
                                      <div key={episode.id} className="flex items-center gap-3 p-2 hover:bg-background rounded">
                                        <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                                        <img 
                                          src={episode.image || episode.feedImage} 
                                          alt={episode.title}
                                          className="h-8 w-8 rounded object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{episode.title}</p>
                                          {episode.duration && (
                                            <p className="text-xs text-muted-foreground">{formatDuration(episode.duration)}</p>
                                          )}
                                        </div>
                                        {hasValue4Value(episode) && (
                                          <Badge variant="outline" size="sm">V4V</Badge>
                                        )}
                                        <Button 
                                          size="sm" 
                                          variant="ghost"
                                          onClick={() => handlePlayTrack(episode)}
                                        >
                                          <Play className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3">
                                    <p className="text-sm text-muted-foreground">Loading tracks...</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No music found for "{searchQuery}"</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Trending Music */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Trending Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendingLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : trendingMusic && trendingMusic.feeds.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trendingMusic.feeds.map((feed) => (
                <Card key={feed.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={feed.image || feed.artwork} 
                        alt={feed.title}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{feed.title}</h5>
                        <p className="text-sm text-muted-foreground truncate">{feed.author}</p>
                        <p className="text-xs text-muted-foreground mt-1">{feed.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {hasValue4Value(feed) && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Bitcoin className="h-3 w-3" />
                              V4V
                            </Badge>
                          )}
                          <Button size="sm" onClick={() => handlePlayAlbum(feed)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trending music found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Music Episodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Latest Releases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentEpisodes && recentEpisodes.episodes.length > 0 ? (
            <div className="space-y-3">
              {recentEpisodes.episodes.map((episode) => (
                <div key={episode.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted">
                  <img 
                    src={episode.image || episode.feedImage} 
                    alt={episode.title}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium truncate">{episode.title}</h5>
                    <p className="text-sm text-muted-foreground truncate">{episode.feedTitle}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {episode.duration && <span>{formatDuration(episode.duration)}</span>}
                      <span>{new Date(episode.datePublished * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {hasValue4Value(episode) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      V4V
                    </Badge>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => handlePlayTrack(episode)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent music releases found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}