import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SecureImage } from '@/components/SecureImage';
import { Play, Search, Zap, Bitcoin, Heart, ExternalLink, ChevronDown, ChevronRight, Album } from 'lucide-react';
import { useRecentMusicEpisodes, useMusicSearch } from '@/hooks/useMusicIndex';
import { useTrendingPodcasts } from '@/hooks/usePodcastIndex';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { usePodcastEpisodes } from '@/hooks/usePodcastIndex';
import type { PodcastIndexPodcast, PodcastIndexEpisode } from '@/hooks/usePodcastIndex';
import { useValueBlockFromRss } from '@/hooks/useValueBlockFromRss';
import { requestProvider, launchModal } from '@getalby/bitcoin-connect';


// --- V4V Split Payment Button ---
function V4VPaymentButton({ 
  valueDestinations, 
  totalAmount = 33, 
  contentTitle = 'Content' 
}: { 
  valueDestinations?: Array<{name: string; address: string; type: string; split: number}>;
  totalAmount?: number;
  contentTitle?: string;
}) {
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleV4VPayment = async () => {
    if (!valueDestinations || valueDestinations.length === 0) {
      setStatus('No payment recipients available.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setStatus('Connecting to Lightning wallet...');
      
      // Get or request Lightning wallet connection
      let provider;
      try {
        provider = await requestProvider();
      } catch {
        // No provider connected, launch connection modal
        await launchModal();
        provider = await requestProvider();
      }

      if (!provider) {
        setStatus('No Lightning wallet connected.');
        setIsProcessing(false);
        return;
      }

      // Get Lightning address recipients only
      const lightningRecipients = valueDestinations.filter(d => d.type === 'lud16' && d.address);
      
      if (lightningRecipients.length === 0) {
        setStatus('No Lightning addresses found.');
        setIsProcessing(false);
        return;
      }

      setStatus(`Splitting ${totalAmount} sats among ${lightningRecipients.length} recipients...`);
      console.log('V4V Payment - Recipients:', lightningRecipients);
      
      // Calculate total splits
      const totalSplits = lightningRecipients.reduce((sum, r) => sum + r.split, 0);
      
      // Process each payment
      let successCount = 0;
      for (const recipient of lightningRecipients) {
        try {
          // Calculate this recipient's amount based on their split percentage
          const recipientAmount = Math.floor((recipient.split / totalSplits) * totalAmount);
          
          if (recipientAmount > 0) {
            console.log(`Sending ${recipientAmount} sats to ${recipient.name} (${recipient.address}) - ${recipient.split}% split`);
            
            // Convert lightning address to LNURL endpoint
            const [name, domain] = recipient.address.split('@');
            const lnurlp = `https://${domain}/.well-known/lnurlp/${name}`;
            const lnurlRes = await fetch(lnurlp);
            const lnurlData = await lnurlRes.json();
            
            // Create invoice
            const invoiceRes = await fetch(lnurlData.callback + `?amount=${recipientAmount * 1000}`);
            const invoiceData = await invoiceRes.json();
            
            // Send payment using Bitcoin Connect provider
            await provider.sendPayment(invoiceData.pr);
            successCount++;
            
            setStatus(`Sent to ${successCount}/${lightningRecipients.length} recipients...`);
          }
        } catch (err) {
          console.error(`Payment failed to ${recipient.name}:`, err);
          // Continue with other recipients
        }
      }

      if (successCount > 0) {
        setStatus(`✅ Split ${totalAmount} sats among ${successCount} recipients! ⚡`);
      } else {
        setStatus('❌ All payments failed');
      }
    } catch (err) {
      console.error('V4V payment error:', err);
      setStatus('Payment failed or cancelled.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Count valid Lightning recipients
  const lightningRecipients = valueDestinations?.filter(d => d.type === 'lud16' && d.address) || [];
  const hasRecipients = lightningRecipients.length > 0;

  return (
    <div className="mt-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleV4VPayment}
        disabled={!hasRecipients || isProcessing}
        className="text-xs"
      >
        {isProcessing ? (
          'Processing...'
        ) : (
          <>
            <Zap className="h-3 w-3 mr-1" />
            Split {totalAmount} sats
            {hasRecipients && ` (${lightningRecipients.length} recipients)`}
          </>
        )}
      </Button>
      {status && (
        <p className="text-xs text-muted-foreground mt-1">{status}</p>
      )}
      {hasRecipients && (
        <div className="text-xs text-muted-foreground mt-1">
          Recipients: {lightningRecipients.map(r => r.name).join(', ')}
        </div>
      )}
    </div>
  );
}


export function MusicDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const { playPodcast } = usePodcastPlayer();

  const { data: trendingMusic, isLoading: trendingLoading } = useTrendingPodcasts(); // Use same hook as main trending
  const { data: recentEpisodes, isLoading: recentLoading } = useRecentMusicEpisodes();
  const { data: searchResults, isLoading: searchLoading } = useMusicSearch(searchQuery, { enabled: searchQuery.length > 2 });
  const { data: episodesData } = usePodcastEpisodes(selectedFeedId || 0, { enabled: selectedFeedId !== null });

  const handlePlayTrack = (episode: PodcastIndexEpisode) => {
    // Log the value block data for debugging
    console.log('🎵 TRACK CLICKED:', episode.title);
    console.log('🎵 Track value block:', {
      title: episode.title,
      value: episode.value,
      hasDestinations: episode.value?.destinations && episode.value.destinations.length > 0
    });
    
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
    console.log('Album value block:', podcast.value);
    
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
    if (episodesData && Array.isArray(episodesData.episodes) && episodesData.episodes.length > 0) {
      const firstEpisode = episodesData.episodes[0];
      console.log('Episodes loaded for feed:', selectedFeedId, episodesData.episodes);
      console.log('First episode value block:', firstEpisode.value);
      console.log('First episode:', firstEpisode);
      if (firstEpisode && firstEpisode.enclosureUrl) {
        console.log('Playing episode:', firstEpisode.title, firstEpisode.enclosureUrl);
        handlePlayTrack(firstEpisode);
      } else if (firstEpisode) {
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


  const handleArtistClick = (artistName: string) => {
    setSearchQuery(artistName);
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
              ) : searchResults && (searchResults.episodes.length > 0 || searchResults.feeds.length > 0) ? (
                <div className="space-y-4">
                  {searchResults.episodes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tracks</h4>
                      <div className="grid gap-3">
                        {searchResults.episodes.map((episode) => (
                          <div key={episode.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted">
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
                                totalAmount={21} 
                                contentTitle={episode.title} 
                              />
                            </div>
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
              {trendingMusic.feeds.map((feed) => (
                <Card key={feed.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group h-16 w-16 flex-shrink-0">
                        <SecureImage 
                          src={feed.image || feed.artwork} 
                          alt={feed.title}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <button
                          onClick={() => handlePlayAlbum(feed)}
                          className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="h-6 w-6 text-white" />
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
              {recentEpisodes.episodes.map((episode) => (
                <div key={episode.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted">
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
                      totalAmount={21} 
                      contentTitle={episode.title} 
                    />
                  </div>
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