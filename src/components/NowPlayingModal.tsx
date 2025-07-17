import { useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Zap, ExternalLink } from 'lucide-react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { Switch } from '@/components/ui/switch';
import { useTop100Music } from '@/hooks/usePodcastIndex';
import { BoostModal } from '@/components/BoostModal';
import { type ValueDestination } from '@/lib/payment-utils';

interface NowPlayingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// V4V Payment Button for Now Playing Modal
interface V4VPaymentButtonProps {
  valueDestinations?: ValueDestination[];
  feedUrl?: string;
  episodeGuid?: string;
  totalAmount?: number;
  contentTitle?: string;
  feedId?: string;
  episodeId?: string;
}

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
    <div className="space-y-3">
      <Button 
        size="lg" 
        variant="outline" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Small delay to prevent any scroll jumping
          setTimeout(() => {
            setBoostModalOpen(true);
          }, 0);
        }}
        className="w-full"
      >
        <Zap className="h-4 w-4 mr-2" />
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

export function NowPlayingModal({ open, onOpenChange }: NowPlayingModalProps) {
  const { 
    currentPodcast, 
    isPlaying, 
    setIsPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    setVolume,
    setIsMuted,
    playNext,
    playPrevious,
    autoPlay,
    setAutoPlay
  } = usePodcastPlayer();

  // Get trending music data to find V4V payment info
  const { data: trendingMusic } = useTop100Music();

  // Extract feed data from current podcast ID
  const feedData = useMemo(() => {
    if (!currentPodcast || !trendingMusic?.feeds) return null;

    // Extract feedId from podcast ID (format: feedId-episodeId)
    const feedId = currentPodcast.id.split('-')[0];
    
    // Find the feed in trending music data
    const feed = trendingMusic.feeds.find(f => f.id.toString() === feedId);
    
    if (feed) {
      console.log('Found feed data for now playing:', {
        podcastId: currentPodcast.id,
        feedId,
        feedTitle: feed.title,
        hasValue: !!feed.value?.destinations?.length
      });
    }
    
    return feed || null;
  }, [currentPodcast, trendingMusic]);

  // Check if this is a Wavlake track
  const isWavlakeTrack = useMemo(() => {
    if (!currentPodcast || !feedData) return false;
    
    console.log('🎵 Checking Wavlake for:', currentPodcast.title);
    console.log('   Author:', currentPodcast.author);
    console.log('   Feed URL:', feedData.url);
    
    // Check if the feed URL or description contains wavlake
    const wavlakeIndicators = [
      feedData.url?.toLowerCase().includes('wavlake'),
      feedData.description?.toLowerCase().includes('wavlake'),
      feedData.link?.toLowerCase().includes('wavlake'),
      feedData.originalUrl?.toLowerCase().includes('wavlake'),
      currentPodcast.author?.toLowerCase().includes('via wavlake'),
      currentPodcast.title?.toLowerCase().includes('wavlake')
    ];
    
    const isWavlake = wavlakeIndicators.some(Boolean);
    console.log('   Is Wavlake track:', isWavlake);
    
    return isWavlake;
  }, [currentPodcast, feedData]);

  // All tracks are available on LNBeats
  const isLNBeatsTrack = useMemo(() => {
    // Every track is on LNBeats.com, so always return true when we have track data
    return !!(currentPodcast && feedData);
  }, [currentPodcast, feedData]);

  // Generate Wavlake URL
  const wavlakeUrl = useMemo(() => {
    if (!isWavlakeTrack || !currentPodcast || !feedData) return null;
    
    console.log('🎵 Generating Wavlake URL:', { 
      trackTitle: currentPodcast.title, 
      author: currentPodcast.author,
      feedUrl: feedData.url 
    });
    
    // Extract album ID from Wavlake feed URL
    // Format: https://wavlake.com/feed/music/[album-id] or https://www.wavlake.com/feed/[album-id]
    const wavlakeUrlPattern = /(?:www\.)?wavlake\.com\/feed\/(?:music\/)?([a-f0-9-]{36})/i;
    const match = feedData.url?.match(wavlakeUrlPattern);
    
    if (match && match[1]) {
      const albumId = match[1];
      const albumUrl = `https://wavlake.com/album/${albumId}`;
      console.log('✅ Extracted Wavlake album ID:', albumId, '→', albumUrl);
      return albumUrl;
    }
    
    console.log('❌ Could not extract Wavlake album ID from:', feedData.url);
    return null;
  }, [isWavlakeTrack, currentPodcast, feedData]);

  // Generate LNBeats URL - every track is available on LNBeats
  const lnbeatsUrl = useMemo(() => {
    if (!isLNBeatsTrack || !currentPodcast || !feedData) return null;
    
    console.log('🎵 Generating LNBeats URL for:', currentPodcast.title, 'by', currentPodcast.author);
    console.log('   Feed data:', { feedGuid: feedData.feedGuid, feedUrl: feedData.url });
    
    // Use the podcast GUID (feedGuid) if available - this is the correct LNBeats format
    if (feedData.feedGuid) {
      // For episode-specific links, include the base64-encoded audio URL
      if (currentPodcast.url) {
        try {
          const base64AudioUrl = btoa(currentPodcast.url);
          const episodeUrl = `https://lnbeats.com/album/${feedData.feedGuid}/${base64AudioUrl}`;
          console.log('✅ Generated LNBeats episode URL:', episodeUrl);
          return episodeUrl;
        } catch (error) {
          console.warn('Failed to base64 encode audio URL:', error);
        }
      }
      
      // Fallback to album-only URL
      const albumUrl = `https://lnbeats.com/album/${feedData.feedGuid}`;
      console.log('✅ Generated LNBeats album URL:', albumUrl);
      return albumUrl;
    }
    
    // Legacy fallback: try to extract from feed URL if it's actually from LNBeats
    if (feedData.url?.toLowerCase().includes('lnbeats')) {
      const lnbeatsUrlPattern = /lnbeats.com.*?([a-f0-9-]{36})/i;
      const match = feedData.url?.match(lnbeatsUrlPattern);
      
      if (match && match[1]) {
        const albumId = match[1];
        const albumUrl = `https://lnbeats.com/album/${albumId}`;
        console.log('✅ Extracted LNBeats album ID from URL:', albumId, '→', albumUrl);
        return albumUrl;
      }
    }
    
    // Final fallback to search URL using artist and track name
    const searchQuery = encodeURIComponent(`${currentPodcast.author} ${currentPodcast.title}`);
    const searchUrl = `https://lnbeats.com/search?q=${searchQuery}`;
    console.log('⚠️ Using LNBeats search URL (no feedGuid):', searchUrl);
    return searchUrl;
  }, [isLNBeatsTrack, currentPodcast, feedData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    // Get the main audio element from the PodcastPlayer component
    const mainAudio = document.querySelector('audio') as HTMLAudioElement;
    if (!mainAudio) return;

    const newTime = value[0];
    mainAudio.currentTime = newTime;
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentPodcast) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-background via-background to-muted [&>button]:hidden">
        <div className="relative p-8">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="space-y-8">
            {/* Album Artwork */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={currentPodcast.imageUrl || '/placeholder-album.png'} 
                  alt={currentPodcast.title}
                  className="w-80 h-80 rounded-xl shadow-2xl object-cover"
                />
                <div className="absolute inset-0 rounded-xl bg-black/10"></div>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold truncate">{currentPodcast.title}</h1>
              <p className="text-lg text-muted-foreground truncate">{currentPodcast.author}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-6">
              <Button variant="ghost" size="icon" onClick={playPrevious} className="h-12 w-12">
                <SkipBack className="h-6 w-6" />
              </Button>
              
              <Button onClick={handlePlayPause} size="icon" className="h-16 w-16">
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={playNext} className="h-12 w-12">
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-32"
              />
            </div>

            {/* Auto-Play Toggle */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Switch id="autoplay-modal-switch" checked={autoPlay} onCheckedChange={setAutoPlay} />
              <label htmlFor="autoplay-modal-switch" className="text-xs text-muted-foreground select-none cursor-pointer">
                Auto-Play
              </label>
            </div>

            {/* V4V Boost Button */}
            {feedData && (
              <div className="mt-6 pt-4 border-t border-border">
                <V4VPaymentButton 
                  valueDestinations={feedData.value?.destinations} 
                  feedUrl={feedData.url}
                  totalAmount={33} 
                  contentTitle={currentPodcast.title}
                  feedId={feedData.id?.toString()}
                  episodeId={currentPodcast.id}
                />
              </div>
            )}

            {/* LNBeats Link */}
            {isLNBeatsTrack && lnbeatsUrl && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(lnbeatsUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Find on LNBeats
                </Button>
              </div>
            )}

            {/* Wavlake Link */}
            {isWavlakeTrack && wavlakeUrl && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(wavlakeUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Wavlake
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}