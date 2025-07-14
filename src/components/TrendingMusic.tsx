import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SecureImage } from '@/components/SecureImage';
import { Play, Pause, Zap, Star, ListMusic } from 'lucide-react';
import { useTop100Music, podcastIndexFetch } from '@/hooks/usePodcastIndex';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';
import { BoostModal } from '@/components/BoostModal';
import { type ValueDestination } from '@/lib/payment-utils';

interface V4VPaymentButtonProps {
  valueDestinations?: ValueDestination[];
  feedUrl?: string;
  episodeGuid?: string;
  totalAmount?: number;
  contentTitle?: string;
  feedId?: string;
  episodeId?: string;
}

// V4V Split Payment Button
function V4VPaymentButton({ 
  valueDestinations, 
  feedUrl,
  episodeGuid,
  totalAmount = 33, 
  contentTitle = 'Content',
  feedId,
  episodeId
}: V4VPaymentButtonProps) {
  const [boostModalOpen, setBoostModalOpen] = useState(false);

  return (
    <div className="mt-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setBoostModalOpen(true)}
        className="text-xs"
      >
        <Zap className="h-3 w-3 mr-1" />
        Boost {totalAmount} sats
      </Button>
      
      <BoostModal
        open={boostModalOpen}
        onOpenChange={setBoostModalOpen}
        valueDestinations={valueDestinations || []}
        feedUrl={feedUrl}
        episodeGuid={episodeGuid}
        totalAmount={totalAmount}
        contentTitle={contentTitle}
        feedId={feedId}
        episodeId={episodeId}
      />
    </div>
  );
}

export function TrendingMusic() {
  const { playPodcast, currentPodcast, isPlaying, setIsPlaying, addToQueue, clearQueue } = usePodcastPlayer();
  const { data: trendingMusic, isLoading: trendingLoading } = useTop100Music();
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);

  const handlePlayPauseAlbum = useCallback(async (podcast: PodcastIndexPodcast) => {
    const podcastId = podcast.id.toString();
    
    // Prevent rapid clicks while loading
    if (loadingTrackId && loadingTrackId !== podcastId) {
      console.log('Ignoring click - another track is loading');
      return;
    }
    
    // Check if any episode from this album is currently playing
    const isThisAlbumPlaying = currentPodcast && isPlaying && (
      currentPodcast.author === podcast.author || 
      currentPodcast.id.startsWith(podcastId) ||
      currentPodcast.title.includes(podcast.title) ||
      currentPodcast.id === `${podcastId}-album`
    );
    
    if (isThisAlbumPlaying) {
      // Pause the current track
      setIsPlaying(false);
      return;
    }
    
    // If this is the same track that's already loaded but not playing, just play it
    if (currentPodcast && currentPodcast.id.startsWith(podcastId) && !isPlaying) {
      setIsPlaying(true);
      return;
    }
    
    // Set loading state
    setLoadingTrackId(podcastId);
    
    // Try to fetch episodes first, then play the first one
    try {
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
        id: podcast.id.toString(),
        max: '10', // Fetch more episodes for queue
      });
      
      const episodes = (response.items || []).filter(ep => ep.enclosureUrl);
      const firstEpisode = episodes.find(ep => ep.enclosureUrl);
      
      if (firstEpisode) {
        const podcastToPlay = {
          id: `${podcastId}-${firstEpisode.id}`,
          title: firstEpisode.title,
          author: firstEpisode.feedTitle || podcast.author,
          url: firstEpisode.enclosureUrl,
          imageUrl: firstEpisode.image || firstEpisode.feedImage || podcast.image || podcast.artwork,
          duration: firstEpisode.duration,
        };
        
        // Play the first episode with a valid audio URL
        playPodcast(podcastToPlay);
      } else {
        console.warn('No playable episodes found in album:', podcast.title);
      }
    } catch (error) {
      console.error('Failed to fetch album episodes:', error);
    } finally {
      // Clear loading state after a short delay
      setTimeout(() => setLoadingTrackId(null), 1000);
    }
  }, [currentPodcast, isPlaying, playPodcast, setIsPlaying, loadingTrackId]);

  // Play All Top 100 tracks in order
  const handlePlayAll = useCallback(async () => {
    if (!trendingMusic?.feeds.length) return;
    
    setIsLoadingPlayAll(true);
    try {
      // Clear existing queue
      clearQueue();
      
      // Create placeholder array to maintain order
      const orderedEpisodes: Array<{
        id: string;
        title: string;
        author: string;
        url: string;
        imageUrl?: string;
        duration?: number;
        rank: number;
      } | null> = new Array(trendingMusic.feeds.length).fill(null);
      
      // Process feeds in parallel but maintain order with Promise.allSettled
      const episodePromises = trendingMusic.feeds.map(async (feed, index) => {
        try {
          console.log(`🎵 Fetching episode for #${index + 1}: ${feed.title}`);
          const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
            id: feed.id.toString(),
            max: '5', // Get first few episodes
          });
          
          const episodes = (response.items || []).filter(ep => ep.enclosureUrl);
          const firstEpisode = episodes.find(ep => ep.enclosureUrl);
          
          if (firstEpisode) {
            const episode = {
              id: `${feed.id}-${firstEpisode.id}`,
              title: firstEpisode.title,
              author: firstEpisode.feedTitle || feed.author,
              url: firstEpisode.enclosureUrl,
              imageUrl: firstEpisode.image || firstEpisode.feedImage || feed.image || feed.artwork,
              duration: firstEpisode.duration,
              rank: index + 1,
            };
            orderedEpisodes[index] = episode;
            console.log(`✅ Successfully queued #${index + 1}: ${episode.title}`);
            return episode;
          } else {
            console.warn(`⚠️ No playable episodes found for #${index + 1}: ${feed.title}`);
            return null;
          }
        } catch (error) {
          console.warn(`❌ Failed to fetch episodes for #${index + 1} ${feed.title}:`, error);
          return null;
        }
      });
      
      // Wait for all episode fetches to complete
      await Promise.allSettled(episodePromises);
      
      // Filter out failed episodes but maintain order
      const validEpisodes = orderedEpisodes.filter((episode): episode is NonNullable<typeof episode> => episode !== null);
      
      // Add episodes to queue in order
      validEpisodes.forEach(episode => {
        addToQueue(episode);
      });
      
      // Play the first valid episode
      if (validEpisodes.length > 0) {
        playPodcast(validEpisodes[0]);
      }
      
      const skippedCount = trendingMusic.feeds.length - validEpisodes.length;
      console.log(`🎼 Queued ${validEpisodes.length} tracks from Top 100 V4V chart${skippedCount > 0 ? ` (${skippedCount} tracks skipped due to fetch errors)` : ''}`);
      
      if (skippedCount > 0) {
        console.log('📋 Successfully queued tracks:', validEpisodes.map(ep => `#${ep.rank}: ${ep.title}`));
      }
    } catch (error) {
      console.error('Failed to queue Top 100 tracks:', error);
    } finally {
      setIsLoadingPlayAll(false);
    }
  }, [trendingMusic?.feeds, clearQueue, addToQueue, playPodcast]);

  // Helper function to check if a track/album is currently playing
  const isCurrentlyPlaying = useCallback((id: string, feedTitle?: string) => {
    if (!currentPodcast || !isPlaying) return false;
    
    // For individual tracks/episodes
    if (currentPodcast.id === id) return true;
    
    // For albums, check if the current podcast is from this feed
    if (feedTitle) {
      // Check if current track is from this album/feed
      return (
        currentPodcast.author === feedTitle ||
        currentPodcast.id.startsWith(id) ||
        currentPodcast.id === `${id}-album` ||
        currentPodcast.title.includes(feedTitle)
      );
    }
    
    return false;
  }, [currentPodcast, isPlaying]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top 100 V4V Music Chart
            </CardTitle>
            <Button
              onClick={handlePlayAll}
              disabled={isLoadingPlayAll || !trendingMusic?.feeds.length}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <ListMusic className="h-4 w-4" />
              {isLoadingPlayAll ? 'Loading...' : 'Play All'}
            </Button>
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
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground px-1">
                Showing Top {trendingMusic.feeds.length} tracks from the Value4Value Music Chart
              </div>
              <div className="grid gap-4 grid-cols-3 sm:grid-cols-2 lg:grid-cols-3">
                {trendingMusic.feeds.map((feed, index) => (
                  <Card key={`trending-${feed.id}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-2 sm:p-3">
                      {/* Mobile: Vertical layout for 3 columns */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="relative group h-20 w-full sm:h-12 sm:w-12 flex-shrink-0">
                          <SecureImage 
                            src={feed.image || feed.artwork} 
                            alt={feed.title}
                            className="h-20 w-full sm:h-12 sm:w-12 rounded object-cover"
                          />
                          <button
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePlayPauseAlbum(feed);
                            }}
                            disabled={loadingTrackId === feed.id.toString()}
                            className="absolute inset-0 bg-black/30 hover:bg-black/60 active:bg-black/70 rounded flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ touchAction: 'manipulation' }}
                            aria-label={isCurrentlyPlaying(feed.id.toString(), feed.title) ? 'Pause' : 'Play'}
                          >
                            {loadingTrackId === feed.id.toString() ? (
                              <div className="h-6 w-6 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : isCurrentlyPlaying(feed.id.toString(), feed.title) ? (
                              <Pause className="h-6 w-6 sm:h-4 sm:w-4 text-white drop-shadow-lg" />
                            ) : (
                              <Play className="h-6 w-6 sm:h-4 sm:w-4 text-white drop-shadow-lg" />
                            )}
                          </button>
                          {/* Mobile rank badge - positioned on image */}
                          <span className="absolute top-1 right-1 sm:hidden text-xs font-mono text-white bg-black/70 px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 sm:gap-1">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-xs sm:text-sm truncate leading-tight">{feed.title}</h5>
                              <p className="text-xs text-muted-foreground truncate">
                                {feed.author}
                              </p>
                            </div>
                            {/* Desktop rank badge */}
                            <span className="hidden sm:block text-xs font-mono text-muted-foreground bg-muted px-1 py-0 rounded">
                              #{index + 1}
                            </span>
                          </div>
                          {/* V4V split payment for track */}
                          <div className="mt-2">
                            <V4VPaymentButton 
                              valueDestinations={feed.value?.destinations} 
                              feedUrl={feed.url}
                              totalAmount={33} 
                              contentTitle={feed.title}
                              feedId={feed.id.toString()}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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