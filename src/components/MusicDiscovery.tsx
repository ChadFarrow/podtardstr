import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SecureImage } from '@/components/SecureImage';
import { Play, Pause, Search, Zap } from 'lucide-react';
import { useMusicSearch } from '@/hooks/useMusicIndex';
import { podcastIndexFetch } from '@/hooks/usePodcastIndex';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import type { PodcastIndexEpisode } from '@/hooks/usePodcastIndex';

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

// --- V4V Split Payment Button ---
function V4VPaymentButton({ 
  valueDestinations, 
  totalAmount = 33, 
  contentTitle = 'Content' 
}: V4VPaymentButtonProps) {
  const { connectWallet, isConnecting } = useLightningWallet();
  const { processPayment, isProcessing, status, setStatus } = usePaymentProcessor();

  // Memoize recipients to avoid unnecessary recalculations
  const { recipients, hasRecipients, isDemo } = useMemo(() => {
    // Debug logging for value destinations
    console.log('V4V Payment Debug:', {
      contentTitle,
      hasValueDestinations: !!valueDestinations,
      valueDestinations: valueDestinations,
      destinationCount: valueDestinations?.length || 0
    });

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
    console.log('Parsed Lightning Recipients:', {
      originalCount: valueDestinations?.length || 0,
      parsedCount: lightningRecipients.length,
      recipients: lightningRecipients
    });
    const hasRealRecipients = lightningRecipients.length > 0;

    return {
      recipients: lightningRecipients,
      hasRecipients: hasRealRecipients,
      isDemo: false
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
      ) : (
        <div className="text-xs text-muted-foreground">
          💡 V4V payments not configured
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


export function MusicDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const { playPodcast, currentPodcast, isPlaying, setIsPlaying } = usePodcastPlayer();

  const { data: searchResults, isLoading: searchLoading } = useMusicSearch(searchQuery, { enabled: searchQuery.length > 2 });



  const handlePlayPauseTrack = useCallback(async (episode: PodcastIndexEpisode) => {
    const episodeId = episode.id.toString();
    
    console.log('Play button clicked for episode:', {
      id: episodeId,
      title: episode.title,
      enclosureUrl: episode.enclosureUrl,
      hasEnclosure: !!episode.enclosureUrl,
      feedId: episode.feedId
    });
    
    // Check if this is the currently playing track
    if (currentPodcast?.id === episodeId) {
      // Toggle play/pause for current track
      setIsPlaying(!isPlaying);
      return;
    }
    
    // If no enclosureUrl, try to fetch it from the feed
    let audioUrl = episode.enclosureUrl;
    
    if (!audioUrl || !audioUrl.trim()) {
      console.log('No audio URL in search result, trying to fetch full episode data...');
      
      // Try to get the full episode data from the feed using podcastIndexFetch
      if (episode.feedId) {
        try {
          const response = await podcastIndexFetch<PodcastIndexEpisode>('/episodes/byfeedid', {
            id: episode.feedId.toString(),
            max: '50',
          });
          
          const fullEpisode = response.items?.find((ep: PodcastIndexEpisode) => ep.id === episode.id);
          if (fullEpisode?.enclosureUrl) {
            audioUrl = fullEpisode.enclosureUrl;
            console.log('Found audio URL from feed:', audioUrl);
          }
        } catch (error) {
          console.error('Failed to fetch full episode data:', error);
        }
      }
    }
    
    // Skip if still no valid audio URL
    if (!audioUrl || !audioUrl.trim()) {
      console.warn('No audio URL found for episode after all attempts:', {
        title: episode.title,
        feedId: episode.feedId
      });
      return;
    }
    
    // Log the URL for debugging
    console.log('Attempting to play audio URL:', audioUrl);
    
    // Play new track
    playPodcast({
      id: episodeId,
      title: episode.title,
      author: episode.feedTitle,
      url: audioUrl,
      imageUrl: episode.image || episode.feedImage,
      duration: episode.duration,
    });
  }, [currentPodcast?.id, isPlaying, playPodcast, setIsPlaying]);



  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const handleArtistClick = (artistName: string) => {
    setSearchQuery(artistName);
  };

  // Helper function to check if a track is currently playing
  const isCurrentlyPlaying = useCallback((id: string) => {
    if (!currentPodcast || !isPlaying) return false;
    return currentPodcast.id === id;
  }, [currentPodcast, isPlaying]);

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
              ) : searchResults && (searchResults.episodes.length > 0 || searchResults.feeds.length > 0) ? (
                <div className="space-y-4">
                  {searchResults.episodes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tracks</h4>
                      <div className="grid gap-3">
                        {searchResults.episodes.map((episode, index) => (
                          <div key={`search-${episode.id}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted">
                            <SecureImage 
                              src={episode.image || episode.feedImage} 
                              alt={episode.title}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium truncate">{episode.title}</h5>
                              <button 
                                onClick={() => handleArtistClick(episode.feedTitle)}
                                className="text-sm text-muted-foreground truncate hover:text-primary transition-colors text-left"
                              >
                                {episode.feedTitle}
                              </button>
                              {episode.duration && (
                                <p className="text-xs text-muted-foreground">{formatDuration(episode.duration)}</p>
                              )}
                              {/* V4V split payment for track */}
                              <V4VPaymentButton 
                                valueDestinations={episode.value?.destinations} 
                                totalAmount={33} 
                                contentTitle={episode.title} 
                              />
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handlePlayPauseTrack(episode)}
                            >
                              {isCurrentlyPlaying(episode.id.toString()) ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Albums & Artists section temporarily hidden to focus on individual tracks only */}
                </div>
              ) : (
                <p className="text-muted-foreground">No music found for "{searchQuery}"</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>



    </div>
  );
}