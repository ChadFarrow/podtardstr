import { useState, useEffect } from 'react';
import { useAlbumFeed } from '@/hooks/useAlbumFeed';
import { SecureImage } from '@/components/SecureImage';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, ExternalLink, ChevronDown, Music, Clock, Shuffle, SkipBack, SkipForward, Repeat, Volume2 } from 'lucide-react';
import { htmlToText } from '@/lib/html-utils';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { useMusicPlayback } from '@/hooks/useMusicPlayback';
import { usePlayAll } from '@/hooks/usePlayAll';
import type { AlbumTrack } from '@/hooks/useAlbumFeed';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AlbumViewEnhancedProps {
  feedUrl?: string;
}

const FEATURED_ALBUMS = [
  {
    id: 'bloodshot-lies',
    title: 'Bloodshot Lies - The Album',
    artist: 'The Doerfels',
    feedUrl: 'https://www.doerfelverse.com/feeds/bloodshot-lies-album.xml',
  },
  {
    id: 'heycitizen-experience',
    title: 'The HeyCitizen Experience',
    artist: 'HeyCitizen',
    feedUrl: 'https://files.heycitizen.xyz/Songs/Albums/The-Heycitizen-Experience/the heycitizen experience.xml',
  },
];

// More albums from the Doerfel-verse
const OTHER_ALBUMS = [
  {
    id: 'dfb-volume-2',
    title: 'DFB Volume 2',
    artist: 'Doerfel Family Bluegrass',
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop',
    year: '2024',
    genre: 'Bluegrass',
    tracks: 9,
  },
  {
    id: 'citybeach-solo',
    title: 'Coastal Dreams',
    artist: 'CityBeach (Shredward)',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
    year: '2024',
    genre: 'Indie Rock',
    tracks: 8,
  },
  {
    id: 'kurtisdrums',
    title: 'Rhythm & Soul',
    artist: 'Kurtisdrums',
    cover: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&h=300&fit=crop',
    year: '2024',
    genre: 'Instrumental',
    tracks: 12,
  },
  {
    id: 'sir-tj-banjo',
    title: 'Wrathful Strings',
    artist: 'Sir TJ The Wrathful',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    year: '2023',
    genre: 'Banjo/Folk',
    tracks: 10,
  },
];

export function AlbumViewEnhanced({ feedUrl }: AlbumViewEnhancedProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(feedUrl ? 'custom' : 'bloodshot-lies');
  const [customFeedUrl, setCustomFeedUrl] = useState(feedUrl || '');
  
  const currentFeedUrl = selectedAlbumId === 'custom' ? customFeedUrl : 
    FEATURED_ALBUMS.find(album => album.id === selectedAlbumId)?.feedUrl || 
    FEATURED_ALBUMS[0].feedUrl;
  
  const { data: albumData, isLoading, error } = useAlbumFeed(currentFeedUrl);
  const { currentPodcast, isPlaying, playPodcast, setIsPlaying } = usePodcastPlayer();
  const { loadingTrackId, handleMusicPlay } = useMusicPlayback();
  const { handlePlayAll } = usePlayAll();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTrackPlay = (track: AlbumTrack) => {
    const trackData = {
      id: track.id.toString(),
      title: track.title,
      artist: track.albumArtist || albumData?.artist || '',
      enclosureUrl: track.enclosureUrl,
      imageUrl: track.albumArt || track.image || albumData?.artwork || '',
      podcastTitle: albumData?.title || '',
      description: track.description || '',
      value: track.value || albumData?.value,
    };
    
    handleMusicPlay(trackData);
  };

  const handleAlbumPlay = () => {
    if (!albumData?.tracks || albumData.tracks.length === 0) return;
    
    const tracksData = albumData.tracks.map(track => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.albumArtist || albumData.artist,
      enclosureUrl: track.enclosureUrl,
      imageUrl: track.albumArt || track.image || albumData.artwork,
      podcastTitle: albumData.title,
      description: track.description || '',
      value: track.value || albumData.value,
    }));
    
    handlePlayAll(tracksData);
  };

  const isTrackPlaying = (track: AlbumTrack) => {
    return isPlaying && currentPodcast?.id === track.id.toString();
  };

  const isAlbumPlaying = () => {
    return isPlaying && albumData?.tracks.some(track => currentPodcast?.id === track.id.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black/60 to-black/80" />
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-center">
            <Skeleton className="w-96 h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !albumData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="max-w-md w-full bg-black/60 backdrop-blur-lg border-gray-800">
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Album</h3>
            <p className="text-gray-400 text-sm">
              {error?.message || 'Unable to load album data'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedAlbum = FEATURED_ALBUMS.find(album => album.id === selectedAlbumId);
  const totalDuration = albumData.tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Album Art Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${albumData.artwork})`,
          filter: 'brightness(0.3) blur(1px)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black/60 to-black/80" />
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">


        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Album Art - Large Display */}
              <div className="flex justify-center">
                <div className="relative group cursor-pointer" onClick={handleAlbumPlay}>
                  <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl shadow-2xl overflow-hidden relative">
                    <SecureImage
                      src={albumData.artwork}
                      alt={albumData.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 bg-red-600 hover:bg-red-500 text-white rounded-full p-6 shadow-2xl">
                        {isAlbumPlaying() ? (
                          <Pause size={40} />
                        ) : (
                          <Play size={40} className="ml-2" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Vinyl Record Effect */}
                  <div className="absolute -right-4 top-4 w-32 h-32 bg-black rounded-full border-8 border-gray-800 opacity-70 group-hover:rotate-180 transition-transform duration-1000">
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Album Details */}
              <div className="text-center lg:text-left space-y-6">
                <div>
                  <p className="text-red-400 font-semibold tracking-wider uppercase text-sm mb-2">Featured Album</p>
                  <h1 className="text-5xl lg:text-7xl font-black text-white mb-4 leading-tight">{albumData.title}</h1>
                  <h2 className="text-2xl lg:text-3xl text-gray-300 font-light mb-6">{albumData.artist}</h2>
                </div>
                
                {albumData.description && (
                  <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                    {htmlToText(albumData.description)}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-400">
                  <span className="bg-black/50 px-3 py-1 rounded-full">{currentYear}</span>
                  <span className="bg-black/50 px-3 py-1 rounded-full">{albumData.tracks.length} tracks</span>
                  <span className="bg-black/50 px-3 py-1 rounded-full">{formatDuration(totalDuration)}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <button 
                    onClick={handleAlbumPlay}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-12 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center space-x-3 text-lg"
                  >
                    {isAlbumPlaying() ? (
                      <><Pause size={24} /><span>Pause Album</span></>
                    ) : (
                      <><Play size={24} className="ml-1" /><span>Play Album</span></>
                    )}
                  </button>
                  

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Track List - Floating Card */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center">Track List</h3>
            <div className="space-y-1">
              {albumData.tracks.map((track, index) => (
                <div
                  key={track.guid}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => handleTrackPlay(track)}
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
                      <p className="text-gray-400">{albumData.artist}</p>
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

        {/* Other Projects - Horizontal Scroll */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">More from The Doerfel-Verse</h3>
            <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
              {OTHER_ALBUMS.map((album) => (
                <div
                  key={album.id}
                  className="flex-none group cursor-pointer"
                >
                  <div className="relative w-48">
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 bg-red-600 hover:bg-red-500 text-white rounded-full p-3 shadow-lg">
                        <Play size={20} className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                      {album.title}
                    </h4>
                    <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                    <p className="text-xs text-gray-500">{album.year} • {album.tracks} tracks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}