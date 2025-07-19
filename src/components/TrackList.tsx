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
      <div className="max-w-4xl mx-auto bg-black/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
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
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <span className="text-gray-400 group-hover:hidden text-lg">{index + 1}</span>
                  )}
                  <Play size={18} className="text-white hidden group-hover:block mx-auto" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{track.title}</p>
                  <p className="text-gray-400">{artist}</p>
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