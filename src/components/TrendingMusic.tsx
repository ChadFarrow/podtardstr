import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SecureImage } from '@/components/SecureImage';
import { Play, Pause, Zap, Star, ListMusic } from 'lucide-react';
import { useTop100Music, podcastIndexFetch } from '@/hooks/usePodcastIndex';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';

import { useLightningWallet } from '@/hooks/useLightningWallet';
import { useValue4ValueData } from '@/hooks/useValueBlockFromRss';
import { 
  getLightningRecipients, 
  processMultiplePayments, 
  formatPaymentStatus,
  type ValueDestination,
  type PaymentRecipient,
  LightningProvider
} from '@/lib/payment-utils';

interface V4VPaymentButtonProps {
  valueDestinations?: ValueDestination[];
  feedUrl?: string;
  episodeGuid?: string;
  totalAmount?: number;
  contentTitle?: string;
}

// Custom hook for payment processing
function usePaymentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');

  const processPayment = useCallback(async (
    provider: unknown,
    recipients: PaymentRecipient[],
    totalAmount: number
  ) => {
    setIsProcessing(true);
    setStatus(`Boosting ${totalAmount} sats among ${recipients.length} recipients...`);
    
    try {
      const result = await processMultiplePayments(provider as LightningProvider, recipients, totalAmount);
      const statusMessage = formatPaymentStatus(result);
      setStatus(statusMessage);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setStatus(`❌ ${errorMessage}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processPayment, isProcessing, status, setStatus };
}

// V4V Split Payment Button
function V4VPaymentButton({ 
  valueDestinations, 
  feedUrl,
  episodeGuid,
  totalAmount = 33, 
  contentTitle = 'Content' 
}: V4VPaymentButtonProps) {
  const { connectWallet, isConnecting } = useLightningWallet();
  const { processPayment, isProcessing, status, setStatus } = usePaymentProcessor();

  // Use the new Value4Value hook to get complete data
  const { 
    recipients: v4vRecipients, 
    hasValue: hasV4VData, 
    dataSource, 
    isLoading: v4vLoading 
  } = useValue4ValueData(feedUrl, episodeGuid, valueDestinations);

  // Memoize recipients to avoid unnecessary recalculations
  const { recipients, hasRecipients } = useMemo(() => {
    // Debug: Log the incoming valueDestinations
    console.log(`🔍 V4V Payment Button for "${contentTitle}":`, {
      valueDestinations,
      destinationsCount: valueDestinations?.length || 0,
      feedUrl,
      episodeGuid,
      hasV4VData,
      dataSource,
      v4vRecipients: v4vRecipients
    });

    // Special case for "The Wait is Over" - use only real V4V recipient
    if (contentTitle?.includes('Wait Is Over')) {
      const realRecipient = [
        { name: 'makeheroism', address: 'makeheroism@fountain.fm', type: 'lud16', split: 100 }
      ];
      return {
        recipients: realRecipient,
        hasRecipients: true
      };
    }

    // Use the enhanced Value4Value data if available
    if (hasV4VData && v4vRecipients.length > 0) {
      const lightningRecipients = getLightningRecipients(v4vRecipients);
      console.log('Using enhanced V4V data:', {
        dataSource,
        originalCount: valueDestinations?.length || 0,
        enhancedCount: v4vRecipients.length,
        parsedCount: lightningRecipients.length,
        recipients: lightningRecipients
      });
      return {
        recipients: lightningRecipients,
        hasRecipients: lightningRecipients.length > 0
      };
    }

    // Fallback to original Podcast Index data
    const lightningRecipients = getLightningRecipients(valueDestinations);
    const hasRealRecipients = lightningRecipients.length > 0;
    
    console.log(`⚡ Lightning recipients for "${contentTitle}":`, {
      recipients: lightningRecipients,
      hasRecipients: hasRealRecipients
    });

    return {
      recipients: lightningRecipients,
      hasRecipients: hasRealRecipients
    };
  }, [valueDestinations, contentTitle, feedUrl, episodeGuid, hasV4VData, v4vRecipients, dataSource]);

  const handleV4VPayment = useCallback(async () => {
    if (!hasRecipients) {
      setStatus('No payment recipients available.');
      return;
    }

    try {
      setStatus('Connecting to Lightning wallet...');
      const provider = await connectWallet();
      
      if (!provider) {
        setStatus('No Lightning wallet connected.');
        return;
      }

      await processPayment(provider as LightningProvider, recipients, totalAmount);
      
    } catch (error) {
      console.error('V4V payment error:', error);
      setStatus(error instanceof Error ? error.message : 'Payment failed or cancelled.');
    }
  }, [hasRecipients, connectWallet, processPayment, recipients, totalAmount, setStatus]);

  return (
    <div className="mt-2">
      {v4vLoading ? (
        <div className="text-xs text-muted-foreground">
          ⚡ Loading V4V data...
        </div>
      ) : hasRecipients ? (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleV4VPayment}
          disabled={isProcessing || isConnecting}
          className="text-xs"
        >
          {isProcessing || isConnecting ? (
            'Processing...'
          ) : (
            <>
              <Zap className="h-3 w-3 mr-1" />
              Boost {totalAmount} sats ({recipients.length})
            </>
          )}
        </Button>
      ) : valueDestinations && valueDestinations.length > 0 ? (
        <div className="text-xs text-muted-foreground">
          ⚡ V4V enabled - loading recipients...
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          💰 V4V payment not configured
        </div>
      )}
      
      {status && (
        <p className="text-xs text-muted-foreground mt-1">{status}</p>
      )}
      
      {hasRecipients && (
        <div className="text-xs text-muted-foreground mt-1">
          Recipients: {recipients.map(r => r.name).join(', ')}
        </div>
      )}
    </div>
  );
}

export function TrendingMusic() {
  const { playPodcast, currentPodcast, isPlaying, setIsPlaying, addToQueue, clearQueue } = usePodcastPlayer();
  const { data: trendingMusic, isLoading: trendingLoading } = useTop100Music();
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);

  const handlePlayPauseAlbum = useCallback(async (podcast: PodcastIndexPodcast) => {
    const podcastId = podcast.id.toString();
    
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
    
    // Try to fetch episodes first, then play the first one
    try {
      const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
        id: podcast.id.toString(),
        max: '10', // Fetch more episodes for queue
      });
      
      const episodes = (response.items || []).filter(ep => ep.enclosureUrl);
      const firstEpisode = episodes.find(ep => ep.enclosureUrl);
      
      if (firstEpisode) {
        // Play the first episode with a valid audio URL
        playPodcast({
          id: `${podcastId}-${firstEpisode.id}`,
          title: firstEpisode.title,
          author: firstEpisode.feedTitle || podcast.author,
          url: firstEpisode.enclosureUrl,
          imageUrl: firstEpisode.image || firstEpisode.feedImage || podcast.image || podcast.artwork,
          duration: firstEpisode.duration,
        });
      } else {
        console.warn('No playable episodes found in album:', podcast.title);
      }
    } catch (error) {
      console.error('Failed to fetch album episodes:', error);
    }
  }, [currentPodcast, isPlaying, playPodcast, setIsPlaying]);

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
                            onClick={() => handlePlayPauseAlbum(feed)}
                            className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity touch-manipulation"
                          >
                            {isCurrentlyPlaying(feed.id.toString(), feed.title) ? <Pause className="h-6 w-6 sm:h-4 sm:w-4 text-white" /> : <Play className="h-6 w-6 sm:h-4 sm:w-4 text-white" />}
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