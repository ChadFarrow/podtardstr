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


// Add WebLN type declaration for TypeScript
declare global {
  interface WebLN {
    enable: () => Promise<void>;
    sendPayment: (paymentRequest: string) => Promise<any>;
  }
  interface Window {
    webln?: WebLN;
  }
}

// --- SupportArtistButton ---
function SupportArtistButton({ destination, amount = 100 }: { 
  destination?: { 
    name?: string; 
    address: string; 
    type: string; 
    split: number 
  };
  amount?: number;
}) {
  const [status, setStatus] = useState('');
  
  if (!destination) return null;
  
  const isLightningAddress = destination.address?.includes('@');
  console.log('SupportArtistButton - destination:', destination, 'isLightning:', isLightningAddress);

  const handleSupport = async () => {
    if (!window.webln) {
      setStatus('Alby or a WebLN wallet is not installed.');
      return;
    }
    
    try {
      setStatus('Connecting to wallet...');
      await window.webln.enable();
      
      if (isLightningAddress) {
        // Handle Lightning address (LNURL)
        setStatus('Fetching invoice...');
        const [name, domain] = destination.address.split('@');
        const lnurlp = `https://${domain}/.well-known/lnurlp/${name}`;
        const lnurlRes = await fetch(lnurlp);
        if (!lnurlRes.ok) throw new Error('Failed to fetch LNURL-pay endpoint');
        const lnurlData = await lnurlRes.json();
        const msats = amount * 1000;
        setStatus('Requesting invoice...');
        const invoiceRes = await fetch(`${lnurlData.callback}?amount=${msats}`);
        if (!invoiceRes.ok) throw new Error('Failed to get invoice');
        const invoiceData = await invoiceRes.json();
        const invoice = invoiceData.pr;
        setStatus('Paying invoice...');
        await window.webln.sendPayment(invoice);
        setStatus('Payment sent! ⚡');
      } else {
        // Handle keysend - use a service to convert to invoice
        setStatus('Creating keysend invoice...');
        // Option 1: Use getalby.com keysend service
        const keysendUrl = `https://getalby.com/keysend/${destination.address}?amount=${amount}&memo=Podtardstr%20Music%20Payment`;
        window.open(keysendUrl, '_blank');
        setStatus('Opened Alby keysend page');
      }
    } catch (err) {
      console.error('WebLN payment error:', err);
      setStatus('Payment failed.');
    }
  };

  return (
    <Button 
      onClick={handleSupport} 
      size="sm" 
      variant="ghost" 
      className="h-6 px-2 text-xs"
      title={`Send ${amount} sats to ${destination.name || 'artist'}`}
    >
      <Zap className="h-3 w-3 mr-1" />
      {amount}
    </Button>
  );
}

// --- ValueBlockInfo Component ---
function ValueBlockInfo({ value }: { value?: PodcastIndexEpisode['value'] | PodcastIndexPodcast['value'] }) {
  console.log('ValueBlockInfo rendering with:', value);
  if (!value || !value.destinations?.length) {
    console.log('ValueBlockInfo not rendering - no value or destinations');
    return null;
  }
  const { model, destinations } = value;
  const suggestedSats = model?.suggested ? parseInt(model.suggested) : 10;
  return (
    <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
      <div className="flex items-center gap-1 mb-1">
        <Zap className="h-3 w-3" />
        <span className="font-medium">Value4Value</span>
        {model?.suggested && (
          <span className="text-muted-foreground">• {suggestedSats} sats/min</span>
        )}
      </div>
      <div className="space-y-1">
        {destinations.slice(0, 3).map((dest, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="truncate flex-1">{dest.name || 'Recipient'} ({dest.split}%)</span>
            <SupportArtistButton 
              destination={dest} 
              amount={Math.max(10, Math.floor(suggestedSats * (dest.split / 100)))}
            />
          </div>
        ))}
        {destinations.length > 3 && (
          <div className="text-muted-foreground">+{destinations.length - 3} more</div>
        )}
      </div>
    </div>
  );
}


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
    // Log the value block data for debugging
    console.log('Track value block:', {
      title: episode.title,
      value: episode.value,
      hasDestinations: episode.value?.destinations?.length > 0
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

  const handleArtistClick = (artistName: string) => {
    setSearchQuery(artistName);
    setExpandedAlbum(null); // Collapse any expanded albums
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
                            <img 
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
                              {/* SupportArtistButton for track */}
                              <ValueBlockInfo value={episode.value} />
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
                        <img 
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
                        {/* SupportArtistButton for album */}
                        <ValueBlockInfo value={feed.value} />
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
                    {/* SupportArtistButton for track */}
                    <ValueBlockInfo value={episode.value} />
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