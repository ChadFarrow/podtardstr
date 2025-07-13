import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SecureImage } from '@/components/SecureImage';
import { Play, Pause, Zap, Star } from 'lucide-react';
import { useTop100Music, podcastIndexFetch } from '@/hooks/usePodcastIndex';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';

import { useLightningWallet } from '@/hooks/useLightningWallet';
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
    setStatus(`Splitting ${totalAmount} sats among ${recipients.length} recipients...`);
    
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
  totalAmount = 33, 
  contentTitle = 'Content' 
}: V4VPaymentButtonProps) {
  const { connectWallet, isConnecting } = useLightningWallet();
  const { processPayment, isProcessing, status, setStatus } = usePaymentProcessor();

  // Memoize recipients to avoid unnecessary recalculations
  const { recipients, hasRecipients, isDemo } = useMemo(() => {
    // Special case for "The Wait is Over" - hardcoded ValueBlock for testing
    if (contentTitle?.includes('Wait Is Over')) {
      const hardcodedRecipients = [
        { name: 'makeheroism', address: 'makeheroism@fountain.fm', type: 'lud16', split: 60 },
        { name: 'Demo Artist 1', address: 'demo@getalby.com', type: 'lud16', split: 20 },
        { name: 'Demo Artist 2', address: 'demo2@getalby.com', type: 'lud16', split: 15 },
        { name: 'Demo Artist 3', address: 'demo3@getalby.com', type: 'lud16', split: 5 }
      ];
      return {
        recipients: hardcodedRecipients,
        hasRecipients: true,
        isDemo: false
      };
    }

    const lightningRecipients = getLightningRecipients(valueDestinations);
    const hasRealRecipients = lightningRecipients.length > 0;
    
    // Don't use demo recipient for Top 100 tracks without payment info
    const finalRecipients = hasRealRecipients ? lightningRecipients : [];

    return {
      recipients: finalRecipients,
      hasRecipients: hasRealRecipients,
      isDemo: false // Don't show demo for Top 100 tracks
    };
  }, [valueDestinations, contentTitle]);

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
      {hasRecipients ? (
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
              Split {totalAmount} sats ({recipients.length} recipients)
              {isDemo && ' (Demo)'}
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
  const { playPodcast, currentPodcast, isPlaying, setIsPlaying, queue } = usePodcastPlayer();
  const { data: trendingMusic, isLoading: trendingLoading } = useTop100Music();

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
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top 100 V4V Music Chart
          </CardTitle>
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