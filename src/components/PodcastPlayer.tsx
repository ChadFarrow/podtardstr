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
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime;
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

  // HARD-CODED FIX: Remove the play effect entirely - handle everything in handlePlayPause
  // This prevents race conditions between the effect and the button click

  // Handle new track loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentPodcast) return;

    // Abort any existing loading to prevent conflicts
    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    // Reset time when a new track is loaded
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);

    // Add error handling for media loading
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      // HARD-CODED FIX: Only auto-play if user has interacted and state says playing
      if (isPlaying && hasUserInteracted) {
        audio.play().catch((error) => {
          console.error('Auto-play error:', error);
          // Don't change state on auto-play errors
        });
      }
    };
    const handleLoadedData = () => {
      // Audio is ready to play
      setIsLoading(false);
    };
    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const errorCode = target?.error?.code;
      const errorMessage = target?.error?.message;
      
      console.warn('Audio loading error:', {
        url: target?.src,
        error: target?.error,
        errorCode,
        errorMessage,
        networkState: target?.networkState,
        readyState: target?.readyState
      });
      
      // Handle CORS and network errors gracefully
      if (errorCode === 2 || errorMessage?.includes('CORS') || errorMessage?.includes('network')) {
        console.warn('Skipping track due to CORS/network restriction:', target?.src);
        // Auto-skip to next track if autoPlay is enabled
        if (autoPlay) {
          setTimeout(() => {
            playNext();
          }, 1000);
        }
      }
      
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    // Set the new audio source and load
    audio.src = currentPodcast.url;
    audio.load();

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [currentPodcast, setCurrentTime, setDuration, isPlaying, setIsPlaying]);

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

    // HARD-CODED FIX: Always try to play immediately, regardless of state
    if (!isPlaying) {
      // Force play attempt - let browser handle any issues
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Play failed:', error);
        // If it's a user interaction error, try again on next click
        if (error.name === 'NotAllowedError') {
          // Don't change state, let user try again
          return;
        }
        // For other errors, set to false
        setIsPlaying(false);
      });
    } else {
      // Pause immediately
      audio.pause();
      setIsPlaying(false);
    }
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