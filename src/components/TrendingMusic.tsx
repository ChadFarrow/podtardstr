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
import { useValue4ValueData } from '@/hooks/useValueBlockFromRss';

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
  
  // Use the same enhanced V4V data that the modal uses
  const { 
    recipients: v4vRecipients, 
    hasValue: hasV4VData 
  } = useValue4ValueData(feedUrl, episodeGuid, valueDestinations);
  
  // Calculate split count using enhanced data when available
  const splitCount = hasV4VData && v4vRecipients.length > 0 
    ? v4vRecipients.length 
    : (valueDestinations?.length || 0);

  return (
    <div className="space-y-1.5 flex flex-col items-center">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setBoostModalOpen(true)}
        className="text-xs w-full h-8"
      >
        <Zap className="h-3 w-3 mr-1" />
        Boost {totalAmount} sats
      </Button>
      <p className="text-xs text-center text-muted-foreground leading-tight">
        {splitCount > 0 ? `${splitCount} ${splitCount === 1 ? 'recipient' : 'recipients'}` : 'No recipients'}
      </p>
      
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
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {trendingMusic.feeds.map((feed, index) => (
                  <Card key={`trending-${feed.id}-${index}`} className="relative w-full max-w-70 mx-auto hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                      {/* Rank badge - top right corner */}
                      <span className="absolute top-3 right-3 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border">
                        #{index + 1}
                      </span>

                      {/* Hero Album Art - 80x80 with enhanced styling */}
                      <div className="relative group">
                        <div className="relative w-20 h-20 mx-auto">
                          <SecureImage 
                            src={feed.image || feed.artwork} 
                            alt={feed.title}
                            className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300"
                            style={{
                              boxShadow: '0 12px 24px rgba(0,0,0,0.25), 0 0 24px rgba(139,69,19,0.15)'
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePlayPauseAlbum(feed);
                            }}
                            disabled={loadingTrackId === feed.id.toString()}
                            className="absolute inset-0 bg-black/30 hover:bg-black/50 active:bg-black/60 rounded-2xl flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ touchAction: 'manipulation' }}
                            aria-label={isCurrentlyPlaying(feed.id.toString(), feed.title) ? 'Pause' : 'Play'}
                          >
                            {loadingTrackId === feed.id.toString() ? (
                              <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : isCurrentlyPlaying(feed.id.toString(), feed.title) ? (
                              <Pause className="h-8 w-8 text-white drop-shadow-lg" />
                            ) : (
                              <Play className="h-8 w-8 text-white drop-shadow-lg ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Song Title - Primary text */}
                      <div className="space-y-0.5 min-w-0 w-full">
                        <h3 className="font-bold text-sm leading-tight line-clamp-2 text-foreground">
                          {feed.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {feed.author}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="w-full">
                        <V4VPaymentButton 
                          valueDestinations={feed.value?.destinations} 
                          feedUrl={feed.url}
                          totalAmount={33} 
                          contentTitle={feed.title}
                          feedId={feed.id.toString()}
                        />
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