import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause } from 'lucide-react';
import { SecureImage } from '@/components/SecureImage';
import { V4VPaymentButton } from '@/components/V4VPaymentButton';
import type { PodcastIndexPodcast } from '@/hooks/usePodcastIndex';

interface MusicCardProps {
  feed: PodcastIndexPodcast;
  index: number;
  loadingTrackId: string | null;
  onPlayPause: (podcast: PodcastIndexPodcast) => void;
  isCurrentlyPlaying: (id: string, feedTitle?: string) => boolean;
}

export function MusicCard({ 
  feed, 
  index, 
  loadingTrackId, 
  onPlayPause, 
  isCurrentlyPlaying 
}: MusicCardProps) {
  const isPlaying = isCurrentlyPlaying(feed.id.toString(), feed.title);
  const isLoading = loadingTrackId === feed.id.toString();

  return (
    <Card 
      className="relative w-full max-w-70 mx-auto hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
    >
      <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
        {/* Rank badge - top right corner */}
        <span className="absolute top-3 right-3 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border">
          #{index + 1}
        </span>

        {/* Hero Album Art - 80x80 with enhanced styling */}
        <div className="relative group">
          <div className="relative w-20 h-20 mx-auto">
            <SecureImage 
              src={feed.image || feed.artwork} 
              alt={feed.title}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 pointer-events-none"
              style={{
                boxShadow: '0 12px 24px rgba(0,0,0,0.25), 0 0 24px rgba(139,69,19,0.15)'
              }}
            />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlayPause(feed);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlayPause(feed);
              }}
              onClick={(e) => {
                // Keep as backup but don't execute play to avoid double-execution
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={isLoading}
              className="absolute inset-0 bg-black/30 hover:bg-black/50 active:bg-black/60 rounded-2xl flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                touchAction: 'manipulation', 
                zIndex: 10,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              data-testid={`play-button-${feed.id}`}
            >
              {isLoading ? (
                <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-8 w-8 text-white drop-shadow-lg" />
              ) : (
                <Play className="h-8 w-8 text-white drop-shadow-lg ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Song Title - Primary text */}
        <div className="space-y-0.5 min-w-0 w-full">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 text-foreground">
            {feed.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {feed.author}
          </p>
        </div>

        {/* Action buttons */}
        <div className="w-full">
          <V4VPaymentButton 
            valueDestinations={feed.value?.destinations} 
            feedUrl={feed.url}
            totalAmount={33} 
            contentTitle={feed.title}
            feedId={feed.id.toString()}
          />
        </div>
      </CardContent>
    </Card>
  );
} 