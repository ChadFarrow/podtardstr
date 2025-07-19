import { Play, Pause } from 'lucide-react';
import { SecureImage } from '@/components/SecureImage';
import { htmlToText } from '@/lib/html-utils';
import { FundingButton } from '@/components/FundingButton';

interface FundingInfo {
  url: string;
  message: string;
}

interface AlbumHeroProps {
  title: string;
  artist: string;
  artwork: string;
  description?: string;
  trackCount: number;
  totalDuration: number;
  currentYear: number;
  isPlaying: boolean;
  funding?: FundingInfo;
  onPlayAlbum: () => void;
}

export function AlbumHero({
  title,
  artist,
  artwork,
  description,
  trackCount,
  totalDuration,
  currentYear,
  isPlaying,
  funding,
  onPlayAlbum
}: AlbumHeroProps) {
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Album Art - Large Display */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer" onClick={onPlayAlbum}>
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl shadow-2xl overflow-hidden relative">
                <SecureImage
                  src={artwork}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 bg-red-600 hover:bg-red-500 text-white rounded-full p-6 shadow-2xl">
                    {isPlaying ? (
                      <Pause size={40} />
                    ) : (
                      <Play size={40} className="ml-2" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Album Details */}
          <div className="text-center lg:text-left space-y-6">
            <div>
              <p className="text-red-400 font-semibold tracking-wider uppercase text-sm mb-2">Featured Album</p>
              <h1 className="text-5xl lg:text-7xl font-black text-white mb-4 leading-tight">{title}</h1>
              <h2 className="text-2xl lg:text-3xl text-gray-300 font-light mb-6">{artist}</h2>
            </div>
            
            {description && (
              <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                {htmlToText(description)}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-400">
              <span className="bg-black/50 px-3 py-1 rounded-full">{currentYear}</span>
              <span className="bg-black/50 px-3 py-1 rounded-full">{trackCount} tracks</span>
              <span className="bg-black/50 px-3 py-1 rounded-full">{formatTotalDuration(totalDuration)}</span>
            </div>
            
            {funding && (
              <div className="flex justify-center lg:justify-start pt-4">
                <FundingButton funding={funding} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 