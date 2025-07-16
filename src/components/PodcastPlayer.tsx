import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { NowPlayingModal } from '@/components/NowPlayingModal';
import { Switch } from '@/components/ui/switch';

export function PodcastPlayer() {
  const { 
    currentPodcast, 
    isPlaying, 
    setIsPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    playNext,
    playPrevious,
    autoPlay,
    setAutoPlay
  } = usePodcastPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [loadedPodcastId, setLoadedPodcastId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debug logging for component state
  console.log('PodcastPlayer render:', {
    hasCurrentPodcast: !!currentPodcast,
    currentPodcastId: currentPodcast?.id,
    currentPodcastTitle: currentPodcast?.title,
    currentPodcastUrl: currentPodcast?.url,
    isPlaying,
    hasUserInteracted
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime;
      console.log('Time update:', time, 'Duration:', audio.duration);
      setCurrentTime(time);
    };
    const updateDuration = () => {
      const dur = audio.duration;
      setDuration(dur);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    // Auto-play next track when ended, if enabled
    const handleEnded = () => {
      if (autoPlay) playNext();
    };
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentTime, setDuration, playNext, autoPlay]);

  // FIXED: Simplified play effect that handles user interaction properly
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('Play effect triggered:', {
      isPlaying,
      audioPaused: audio.paused,
      audioSrc: audio.src,
      audioReadyState: audio.readyState,
      audioCurrentTime: audio.currentTime,
      audioDuration: audio.duration,
      hasUserInteracted
    });

    if (isPlaying) {
      // Mark user interaction when play is triggered from album buttons
      if (!hasUserInteracted) {
        console.log('Marking user interaction from play state');
        setHasUserInteracted(true);
      }
      
      // Only try to play if we haven't already started playing
      if (audio.paused) {
        console.log('Attempting to play audio');
        audio.play().then(() => {
          console.log('Audio play successful');
        }).catch((error) => {
          console.error('Play effect error:', error);
          // Only set playing to false if it's not an abort error
          if (!error.message.includes('aborted')) {
            setIsPlaying(false);
          }
        });
      } else {
        console.log('Audio already playing, skipping play() call');
      }
    } else {
      console.log('Pausing audio');
      audio.pause();
    }
  }, [isPlaying, setIsPlaying, hasUserInteracted]);

  // Handle new track loading - COMPLETELY SIMPLIFIED: Let audio.play() handle loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Reset loaded podcast ID if no current podcast
    if (!currentPodcast) {
      setLoadedPodcastId(null);
      return;
    }

    // Check if this is actually a different track by comparing podcast IDs
    if (loadedPodcastId === currentPodcast.id) {
      console.log('Same podcast already loaded, skipping reload:', {
        podcastId: currentPodcast.id,
        title: currentPodcast.title
      });
      return;
    }

    console.log('Loading new track:', {
      oldPodcastId: loadedPodcastId,
      newPodcastId: currentPodcast.id,
      title: currentPodcast.title,
      url: currentPodcast.url
    });

    // Abort any previous loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this load
    abortControllerRef.current = new AbortController();

    // Reset time when a new track is loaded
    setCurrentTime(0);
    setDuration(0);

    // MINIMAL APPROACH: Just set the source, don't force any loading
    // Let audio.play() handle the loading when it's actually needed
    console.log('Setting audio src:', currentPodcast.url);
    audio.src = currentPodcast.url;
    
    // Track which podcast is now loaded
    setLoadedPodcastId(currentPodcast.id);

  }, [currentPodcast?.id, currentPodcast?.url, setCurrentTime, setDuration, loadedPodcastId, currentPodcast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Mark that user has interacted
    setHasUserInteracted(true);

    // HARD-CODED FIX: Simply toggle the state, let the effect handle audio
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
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
    return (
      <Card className="border-t rounded-none fixed bottom-0 left-0 right-0 bg-background z-50">
        <div className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
          No track selected. Click play on any track to start listening.
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-t rounded-none fixed bottom-0 left-0 right-0 bg-background z-50">
      <div className="p-3 sm:p-4">
        <audio
          ref={audioRef}
          src={currentPodcast.url}
          preload="metadata"
        />
        
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Episode Info - Clickable */}
          <button 
            onClick={() => setShowNowPlaying(true)}
            className="flex items-center gap-3 min-w-0 flex-1 hover:bg-muted/50 active:bg-muted/70 -m-2 p-2 rounded-lg transition-colors touch-manipulation"
          >
            {currentPodcast.imageUrl && (
              <div className="h-12 w-12 sm:h-12 sm:w-12 rounded object-cover flex-shrink-0">
                <img 
                  src={currentPodcast.imageUrl} 
                  alt={currentPodcast.title}
                  className="h-12 w-12 sm:h-12 sm:w-12 rounded object-cover"
                />
              </div>
            )}
            <div className="min-w-0 text-left">
              <h4 className="font-medium text-sm sm:text-sm truncate">{currentPodcast.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentPodcast.author}</p>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={playPrevious} className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation">
              <SkipBack className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            
            <Button onClick={handlePlayPause} size="icon" className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation">
              {isPlaying ? (
                <Pause className="h-5 w-5 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-5 w-5 sm:h-4 sm:w-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={playNext} className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation">
              <SkipForward className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 flex-1 max-w-md group">
            <button 
              onClick={() => setShowNowPlaying(true)}
              className="text-xs text-muted-foreground w-8 sm:w-10 text-right hover:text-foreground transition-colors touch-manipulation"
            >
              {formatTime(currentTime)}
            </button>
            <div className="flex-1 relative">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1 [&_.slider-thumb]:h-5 [&_.slider-thumb]:w-5 sm:[&_.slider-thumb]:h-4 sm:[&_.slider-thumb]:w-4 [&_.slider-track]:h-2 sm:[&_.slider-track]:h-1.5"
              />
              <button 
                onClick={() => setShowNowPlaying(true)}
                className="absolute inset-0 w-full opacity-0 hover:opacity-5 bg-primary transition-opacity rounded touch-manipulation"
                aria-label="Open Now Playing"
              />
            </div>
            <button 
              onClick={() => setShowNowPlaying(true)}
              className="text-xs text-muted-foreground w-8 sm:w-10 hover:text-foreground transition-colors touch-manipulation"
            >
              {formatTime(duration)}
            </button>
          </div>

          {/* Volume - Hidden on mobile to save space */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleMute}>
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          {/* Auto-Play Toggle */}
          <div className="hidden sm:flex items-center gap-2">
            <Switch id="autoplay-switch" checked={autoPlay} onCheckedChange={setAutoPlay} />
            <label htmlFor="autoplay-switch" className="text-xs text-muted-foreground select-none cursor-pointer">
              Auto-Play
            </label>
          </div>
          
          {/* Mobile volume button only */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={handleMute} className="h-10 w-10 touch-manipulation">
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <NowPlayingModal 
        open={showNowPlaying} 
        onOpenChange={setShowNowPlaying} 
      />
    </Card>
  );
}