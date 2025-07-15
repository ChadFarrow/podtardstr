import React, { useState, useCallback } from 'react';
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



// --- V4V Split Payment Button ---
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
  const splitCount = valueDestinations?.length || 0;

  return (
    <div className="mt-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setBoostModalOpen(true)}
        className="text-xs"
      >
        <Zap className="h-3 w-3 mr-1" />
        Boost {totalAmount} sats {splitCount > 0 && `(${splitCount} splits)`}
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
                                feedUrl={episode.feedUrl}
                                episodeGuid={episode.guid}
                                totalAmount={33} 
                                contentTitle={episode.title}
                                feedId={episode.feedId?.toString()}
                                episodeId={episode.id.toString()}
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