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
  const [isIOS, setIsIOS] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Detect iOS and initialize audio context for autoplay
  useEffect(() => {
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent;
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
      setIsIOS(isIOSDevice);
      
      if (isIOSDevice) {
        console.log('iOS device detected - implementing autoplay workarounds');
      }
    };
    
    detectIOS();
  }, []);

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

    // Error handler for media loading issues
    const handleError = (event: Event) => {
      const audio = event.target as HTMLAudioElement;
      const error = audio.error;
      
      if (error) {
        console.error('Audio element error:', {
          code: error.code,
          message: error.message,
          src: audio.src
        });
        
        // Handle different media error types
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            console.log('Media loading aborted by user');
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            console.error('Network error while loading media');
            setIsPlaying(false);
            break;
          case MediaError.MEDIA_ERR_DECODE:
            console.error('Media decoding error');
            setIsPlaying(false);
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            console.error('Media format not supported');
            setIsPlaying(false);
            break;
          default:
            console.error('Unknown media error');
            setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('error', handleError);
    
    // Auto-play next track when ended, if enabled
    const handleEnded = () => {
      console.log('🎵 Track ended, autoPlay enabled:', autoPlay);
      if (autoPlay) {
        console.log('🎵 Calling playNext() for autoplay');
        playNext();
        
        // iOS-specific: Additional attempt with user interaction context
        setTimeout(() => {
          const audioElement = audioRef.current;
          if (audioElement && audioElement.paused) {
            console.log('🎵 Audio still paused after playNext, attempting direct play');
            
            // For iOS, we need to be more aggressive about autoplay
            if (isIOS && hasUserInteracted) {
              console.log('🎵 iOS: Using user interaction context for autoplay');
              audioElement.play().catch(error => {
                console.log('🎵 iOS autoplay failed:', error.name, error.message);
                // On iOS, if autoplay fails, we might need to show a play button
                if (error.name === 'NotAllowedError') {
                  console.log('🎵 iOS: Autoplay blocked, user will need to tap play');
                }
              });
            } else {
              audioElement.play().catch(error => {
                console.log('🎵 Direct autoplay failed:', error.name, error.message);
              });
            }
          }
        }, 100);
      } else {
        console.log('🎵 Autoplay disabled, not playing next track');
      }
    };
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentTime, setDuration, playNext, autoPlay]);

  // Enhanced play effect with autoplay support and user interaction tracking
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
        
        // iOS-specific: Load the audio before attempting to play
        if (isIOS && !hasUserInteracted) {
          console.log('iOS: Loading audio before play attempt');
          audio.load();
        }
        
        audio.play().then(() => {
          console.log('Audio play successful');
        }).catch((error) => {
          console.error('Play effect error:', error);
          
          // Handle different types of errors gracefully
          if (error.name === 'NotAllowedError') {
            console.log('Autoplay blocked by browser - user interaction required');
            setAutoplayBlocked(true);
            
            // iOS-specific handling
            if (isIOS) {
              console.log('iOS: Autoplay blocked, keeping UI in "ready to play" state');
              // On iOS, don't immediately set isPlaying to false
              // This allows the user to see the track is selected and ready
              if (hasUserInteracted) {
                setIsPlaying(false);
              }
            } else {
              // Non-iOS browsers
              if (hasUserInteracted) {
                setIsPlaying(false);
              }
            }
          } else if (error.name === 'AbortError' || error.message.includes('aborted')) {
            // Handle fetch aborted errors - this is often normal when switching tracks
            console.log('Audio fetch was aborted (likely due to track switching)');
            // Don't change playing state for abort errors as they're usually intentional
          } else if (error.name === 'NetworkError' || error.message.includes('network')) {
            console.error('Network error loading audio:', error.message);
            setIsPlaying(false);
            // Could show a toast notification here
          } else if (error.name === 'NotSupportedError') {
            console.error('Audio format not supported:', error.message);
            setIsPlaying(false);
            // Could show a toast notification here
          } else {
            console.error('Unexpected audio error:', error.name, error.message);
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
    console.log('🎵 Setting audio src:', currentPodcast.url);
    audio.src = currentPodcast.url;
    
    // Track which podcast is now loaded
    setLoadedPodcastId(currentPodcast.id);
    
    // If this track change was triggered by autoplay, log it
    console.log('🎵 Track loaded for autoplay. isPlaying state:', isPlaying);

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
    setAutoplayBlocked(false); // Reset autoplay blocked state on user interaction

    // iOS-specific: Attempt to unlock audio context immediately on user interaction
    if (isIOS && !isPlaying && audio.paused) {
      console.log('iOS: User interaction detected, unlocking audio context');
      
      // Create a brief silent audio to unlock the audio context
      const unlockAudio = new Audio();
      unlockAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQEAAAC0';
      unlockAudio.volume = 0;
      unlockAudio.play().catch(() => {
        console.log('iOS: Silent audio unlock failed, but continuing');
      });
    }

    // If autoplay was blocked and user clicks play, try to resume autoplay capability
    if (!isPlaying && audio.paused) {
      console.log('User manually starting playback - this may enable future autoplay');
    }

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
      <Card className="border-t border-gray-800 rounded-none fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg z-50 safe-area-bottom">
        <div className="p-3 sm:p-4 text-center text-gray-400 text-sm">
          No track selected. Click play on any track to start listening.
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-t border-gray-800 rounded-none fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg z-50 safe-area-bottom">
      <div className="p-3 sm:p-4">
        <audio
          ref={audioRef}
          src={currentPodcast.url}
          preload={isIOS ? "none" : "metadata"}
          playsInline
          controls={false}
        />
        
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Episode Info - Clickable */}
          <button 
            onClick={() => setShowNowPlaying(true)}
            className="flex items-center gap-3 min-w-0 flex-1 hover:bg-white/10 active:bg-white/20 -m-2 p-2 rounded-lg transition-colors touch-manipulation"
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
              <h4 className="font-medium text-sm sm:text-sm truncate text-white">{currentPodcast.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentPodcast.author}</p>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={playPrevious} className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation text-gray-400 hover:text-white hover:bg-white/10">
              <SkipBack className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            
            <Button 
              onClick={handlePlayPause} 
              size="icon" 
              className={`h-10 w-10 sm:h-9 sm:w-9 touch-manipulation ${
                isIOS && autoplayBlocked && !hasUserInteracted ? 'animate-pulse bg-red-600 hover:bg-red-500' : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-5 w-5 sm:h-4 sm:w-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={playNext} className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation text-gray-400 hover:text-white hover:bg-white/10">
              <SkipForward className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 flex-1 max-w-md group">
            <button 
              onClick={() => setShowNowPlaying(true)}
              className="text-xs text-gray-400 w-8 sm:w-10 text-right hover:text-white transition-colors touch-manipulation"
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
            </div>
            <button 
              onClick={() => setShowNowPlaying(true)}
              className="text-xs text-gray-400 w-8 sm:w-10 hover:text-white transition-colors touch-manipulation"
            >
              {formatTime(duration)}
            </button>
          </div>

          {/* Volume - Hidden on mobile to save space */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleMute} className="text-gray-400 hover:text-white hover:bg-white/10">
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
            <Switch 
              id="autoplay-switch" 
              checked={autoPlay} 
              onCheckedChange={(checked) => {
                console.log('🎵 Autoplay toggle changed to:', checked);
                setAutoPlay(checked);
              }} 
            />
            <label htmlFor="autoplay-switch" className="text-xs text-gray-400 select-none cursor-pointer">
              Auto-Play {autoPlay ? '✓' : '✗'}
            </label>
          </div>
          
          {/* Mobile volume button only */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={handleMute} className="h-10 w-10 touch-manipulation text-gray-400 hover:text-white hover:bg-white/10">
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