import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SecureImage } from '@/components/SecureImage';
import { Play, Pause, Search, Zap, Heart, ExternalLink } from 'lucide-react';
import { useRecentMusicEpisodes, useMusicSearch } from '@/hooks/useMusicIndex';
import { useTrendingPodcasts } from '@/hooks/usePodcastIndex';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { usePodcastEpisodes } from '@/hooks/usePodcastIndex';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';

import { useLightningWallet } from '@/hooks/useLightningWallet';
import { 
  getLightningRecipients, 
  processMultiplePayments, 
  formatPaymentStatus, 
  getDemoRecipient,
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
    
    const finalRecipients = hasRealRecipients ? lightningRecipients : [getDemoRecipient()];

    return {
      recipients: finalRecipients,
      hasRecipients: finalRecipients.length > 0,
      isDemo: !hasRealRecipients
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
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleV4VPayment}
        disabled={!hasRecipients || isProcessing || isConnecting}
        className="text-xs"
      >
        {isProcessing || isConnecting ? (
          'Processing...'
        ) : (
          <>
            <Zap className="h-3 w-3 mr-1" />
            Split {totalAmount} sats
            {hasRecipients && ` (${recipients.length} recipients)`}
            {isDemo && ' (Demo)'}
          </>
        )}
      </Button>
      
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
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const { playPodcast, currentPodcast, isPlaying, setIsPlaying } = usePodcastPlayer();

  const { data: trendingMusic, isLoading: trendingLoading } = useTrendingPodcasts(); // Use same hook as main trending
  const { data: recentEpisodes, isLoading: recentLoading } = useRecentMusicEpisodes();
  const { data: searchResults, isLoading: searchLoading } = useMusicSearch(searchQuery, { enabled: searchQuery.length > 2 });
  const { data: episodesData } = usePodcastEpisodes(selectedFeedId || 0, { enabled: selectedFeedId !== null });



  const handlePlayPauseTrack = useCallback((episode: PodcastIndexEpisode) => {
    const episodeId = episode.id.toString();
    
    // Check if this is the currently playing track
    if (currentPodcast?.id === episodeId) {
      // Toggle play/pause for current track
      setIsPlaying(!isPlaying);
    } else {
      // Validate and clean the audio URL
      let audioUrl = episode.enclosureUrl;
      
      // Skip if no valid audio URL
      if (!audioUrl || !audioUrl.trim()) {
        console.warn('No audio URL found for episode:', episode.title);
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
    }
  }, [currentPodcast?.id, isPlaying, playPodcast, setIsPlaying]);

  const handlePlayPauseAlbum = useCallback(async (podcast: PodcastIndexPodcast) => {
    const podcastId = podcast.id.toString();
    
    // Check if any episode from this album is currently playing
    // We need to check if the current podcast's metadata indicates it's from this album
    const isThisAlbumPlaying = currentPodcast && (
      currentPodcast.author === podcast.author || 
      currentPodcast.id.startsWith(podcastId) ||
      currentPodcast.title.includes(podcast.title)
    );
    
    if (isThisAlbumPlaying && isPlaying) {
      // Toggle play/pause for current album
      setIsPlaying(!isPlaying);
    } else {
      // Play new album
      setSelectedFeedId(podcast.id);
      
      // If no episodes are found after a short delay, try to play the feed URL directly
      setTimeout(() => {
        if (selectedFeedId === podcast.id) {
          if (podcast.url) {
            // Create a mock episode from the feed data to play directly
            const mockEpisode = {
              id: `${podcastId}-album`,
              title: podcast.title,
              author: podcast.author,
              url: podcast.url,
              imageUrl: podcast.image || podcast.artwork,
              duration: 0,
            };
            
            playPodcast(mockEpisode);
          }
          
          setSelectedFeedId(null);
        }
      }, 2000); // Wait 2 seconds for episodes to load
    }
  }, [currentPodcast, isPlaying, playPodcast, setIsPlaying, selectedFeedId]);

  // Auto-play first episode when episodes are loaded
  React.useEffect(() => {
    if (episodesData && Array.isArray(episodesData.episodes) && episodesData.episodes.length > 0 && selectedFeedId) {
      const firstEpisode = episodesData.episodes[0];
      if (firstEpisode && firstEpisode.enclosureUrl) {
        // Play the first episode with album-aware ID
        playPodcast({
          id: `${selectedFeedId}-${firstEpisode.id}`,
          title: firstEpisode.title,
          author: firstEpisode.feedTitle,
          url: firstEpisode.enclosureUrl,
          imageUrl: firstEpisode.image || firstEpisode.feedImage,
          duration: firstEpisode.duration,
        });
      }
      setSelectedFeedId(null); // Reset after playing
    }
  }, [episodesData, playPodcast, selectedFeedId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const handleArtistClick = (artistName: string) => {
    setSearchQuery(artistName);
  };

  // Helper function to check if a track/album is currently playing
  const isCurrentlyPlaying = useCallback((id: string, feedTitle?: string) => {
    if (!currentPodcast || !isPlaying) return false;
    
    // For individual tracks/episodes
    if (currentPodcast.id === id) return true;
    
    // For albums, check if the current podcast is from this feed
    if (feedTitle && currentPodcast.author === feedTitle) return true;
    if (currentPodcast.id.startsWith(id) || currentPodcast.id === `${id}-album`) return true;
    
    return false;
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
              {trendingMusic.feeds.map((feed, index) => (
                <Card key={`trending-${feed.id}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group h-16 w-16 flex-shrink-0">
                        <SecureImage 
                          src={feed.image || feed.artwork} 
                          alt={feed.title}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <button
                          onClick={() => handlePlayPauseAlbum(feed)}
                          className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isCurrentlyPlaying(feed.id.toString(), feed.title) ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{feed.title}</h5>
                        <button 
                          onClick={() => handleArtistClick(feed.author)}
                          className="text-sm text-muted-foreground truncate hover:text-primary transition-colors text-left"
                        >
                          {feed.author}
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">{feed.description}</p>
                        {/* V4V split payment for album */}
                        <V4VPaymentButton 
                          valueDestinations={feed.value?.destinations} 
                          totalAmount={33} 
                          contentTitle={feed.title} 
                        />
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
              {recentEpisodes.episodes.map((episode, index) => (
                <div key={`recent-${episode.id}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted">
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {episode.duration && <span>{formatDuration(episode.duration)}</span>}
                      <span>{new Date(episode.datePublished * 1000).toLocaleDateString()}</span>
                    </div>
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