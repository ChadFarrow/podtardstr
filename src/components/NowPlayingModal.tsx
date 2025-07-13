import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { Switch } from '@/components/ui/switch';

interface NowPlayingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
      <DialogContent className="max-w-2xl p-0 bg-gradient-to-br from-background via-background to-muted [&>button]:hidden">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}