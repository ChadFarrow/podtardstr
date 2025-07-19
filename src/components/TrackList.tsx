import { Play } from 'lucide-react';
import type { AlbumTrack } from '@/hooks/useAlbumFeed';

interface TrackListProps {
  tracks: AlbumTrack[];
  artist: string;
  onTrackPlay: (track: AlbumTrack) => void;
  isTrackPlaying: (track: AlbumTrack) => boolean;
}

export function TrackList({ tracks, artist, onTrackPlay, isTrackPlaying }: TrackListProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8">
      <div 
        className="max-w-4xl mx-auto backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, var(--album-primary, #000000)20 50%, rgba(0,0,0,0.6) 100%)`,
          border: `1px solid var(--album-accent, #ffffff)20`
        }}
      >
        <h3 className="text-2xl font-bold mb-6 text-center">Track List</h3>
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <div
              key={track.guid}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
              onClick={() => onTrackPlay(track)}
            >
              <div className="flex items-center space-x-6">
                <div className="w-8 text-center">
                  {isTrackPlaying(track) ? (
                    <div className="flex items-center justify-center">
                      <div 
                        className="w-4 h-4 rounded-full animate-pulse"
                        style={{ backgroundColor: `var(--album-primary, #ef4444)` }}
                      ></div>
                    </div>
                  ) : (
                    <span className="text-gray-400 group-hover:hidden text-lg">{index + 1}</span>
                  )}
                  <Play size={18} className="text-white hidden group-hover:block mx-auto" />
                </div>
                <div className="flex items-center space-x-4">
                  {/* Track artwork if available */}
                  {track.image && track.image !== track.albumArt && (
                    <img 
                      src={track.image} 
                      alt={track.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <p className="font-semibold text-white text-lg">{track.title}</p>
                    <p className="text-gray-400">{artist}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-gray-400 font-mono">{formatDuration(track.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 