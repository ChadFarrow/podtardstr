import { useSeoMeta } from '@unhead/react';
import { AlbumViewEnhanced } from '@/components/AlbumViewEnhanced';
import { LoginArea } from '@/components/auth/LoginArea';

import { PodcastPlayer } from '@/components/PodcastPlayer';
import { VersionDisplay } from '@/components/VersionDisplay';
import { Home, Disc, Menu, X, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePinnedAlbums } from '@/hooks/usePinnedAlbums';
import { SecureImage } from '@/components/SecureImage';

interface AlbumsProps {
  feedUrl?: string;
}

const Albums = ({ feedUrl }: AlbumsProps) => {
  const [searchParams] = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const { pinnedAlbums, unpinAlbum, pinAlbum, isPinned } = usePinnedAlbums();
  
  // Get feed URL from props first, then from query parameters
  const feedUrlFromParams = searchParams.get('feed');
  const currentFeedUrl = feedUrl || feedUrlFromParams || undefined;

  // Determine current album info for SEO
  const getAlbumInfo = () => {
    if (currentFeedUrl?.includes('bloodshot-lies')) {
      return {
        title: 'Bloodshot Lies - The Album - Podtardstr',
        description: 'Stream Bloodshot Lies by The Doerfels with Value4Value Lightning payments',
        artist: 'The Doerfels'
      };
    }
    if (currentFeedUrl?.includes('heycitizen-experience')) {
      return {
        title: 'The HeyCitizen Experience - Podtardstr',
        description: 'Stream The HeyCitizen Experience with Value4Value Lightning payments',
        artist: 'HeyCitizen'
      };
    }
    return {
      title: 'Albums - Podtardstr',
      description: 'Discover and stream featured albums with Value4Value Lightning payments',
      artist: ''
    };
  };

  const albumInfo = getAlbumInfo();

  // Auto-pin featured albums if not already pinned
  useEffect(() => {
    const albumsToPin = [
      {
        id: 'think-ep',
        title: 'Think EP',
        artist: 'The Doerfels',
        artwork: 'https://www.doerfelverse.com/art/think-ep.png',
        feedUrl: 'https://www.doerfelverse.com/feeds/think-ep.xml',
      },
      {
        id: 'music-from-the-doerfelverse',
        title: 'Music From The Doerfel-Verse',
        artist: 'The Doerfels',
        artwork: 'https://www.doerfelverse.com/art/carol-of-the-bells.png',
        feedUrl: 'https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml',
      },
      {
        id: 'stay-awhile',
        title: 'Stay Awhile',
        artist: 'Able and The Wolf',
        artwork: 'https://ableandthewolf.com/static/media/01_MakinBeans.6dfb9c8e18b0f28adf4d.jpg',
        feedUrl: 'https://ableandthewolf.com/static/media/feed.xml',
      },
      {
        id: 'spectral-hiding',
        title: 'Spectral Hiding',
        artist: 'Bitpunk.fm',
        artwork: 'https://files.bitpunk.fm/spectral_hiding.png',
        feedUrl: 'https://zine.bitpunk.fm/feeds/spectral-hiding.xml',
      },
      {
        id: 'polar-embrace',
        title: 'Polar Embrace',
        artist: 'The Satellite Skirmish',
        artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/art/Polar-Embrace-Feed-art-hires.gif',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/rss/videofeed/feed.xml',
      },
      {
        id: 'autumn-rust',
        title: 'Autumn Rust',
        artist: 'The Satellite Skirmish',
        artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/art/Autumn-Rust-Feed-Art.gif',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml',
      },
      {
        id: 'the-satellite-skirmish-album',
        title: 'The Satellite Skirmish',
        artist: 'Various Artists',
        artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/art/the%20satellite%20skirmish%20mku.gif',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/the_satellite_skirmish_album.xml',
      },
      {
        id: 'lofi-experience',
        title: 'HeyCitizen\'s Lo-Fi Hip-Hop Beats to Study and Relax to',
        artist: 'HeyCitizen',
        artwork: 'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/Lofi-Experience.png',
        feedUrl: 'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/lofi.xml',
      },
      {
        id: 'tinderbox',
        title: 'Tinderbox',
        artist: 'Nate Johnivan',
        artwork: 'https://d12wklypp119aj.cloudfront.net/image/d677db67-0310-4813-970e-e65927c689f1.jpg',
        feedUrl: 'https://wavlake.com/feed/music/d677db67-0310-4813-970e-e65927c689f1',
      },
      {
        id: 'deathdreams',
        title: 'deathdreams',
        artist: 'Survival Guide (Emily Whitehurst)',
        artwork: 'https://static.wixstatic.com/media/484406_9138bd56c7b64a388da3b927a5bb2220~mv2.png',
        feedUrl: 'https://static.staticsave.com/mspfiles/deathdreams.xml',
      },
      {
        id: 'pony-up-daddy',
        title: 'Pony Up Daddy',
        artist: '$2 Holla',
        artwork: 'https://f4.bcbits.com/img/a1480089316_16.jpg',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Mike_Epting/$2Holla/pony%20up%20daddy.xml',
      },
      {
        id: 'empty-passenger-seat',
        title: 'Empty Passenger Seat',
        artist: 'White Rabbit Records',
        artwork: '', // Placeholder - will be extracted from feed when accessible
        feedUrl: 'https://whiterabbitrecords.org/wp-content/uploads/2023/04/Empty-Passenger-Seat.xml',
      },
    ];

    albumsToPin.forEach(album => {
      if (!isPinned(album.id)) {
        pinAlbum(album);
      }
    });
  }, [pinAlbum, isPinned]);

  useSeoMeta({
    title: albumInfo.title,
    description: albumInfo.description,
    ogTitle: albumInfo.title,
    ogDescription: albumInfo.description,
    ogImage: '/icon-512.png',
    twitterCard: 'summary_large_image',
  });

  return (
    <div className="min-h-screen bg-black relative">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
          >
            {showMenu ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>

        </div>
        
        <div className="flex items-center gap-4">
          <LoginArea className="max-w-60" />
        </div>
      </div>

      {/* Slide-out Menu */}
      {showMenu && (
        <div className="absolute top-0 left-0 h-full w-80 bg-black/90 backdrop-blur-lg z-30 transform transition-transform duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Navigation</h2>
              <button onClick={() => setShowMenu(false)}>
                <X size={20} className="text-white" />
              </button>
            </div>
            <nav className="space-y-2">
              <Link
                to="/"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Home size={20} />
                <span className="font-medium">Back to Main App</span>
              </Link>
              <Link
                to="/albums"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white bg-white/10"
              >
                <Disc size={20} />
                <span className="font-medium">All Albums</span>
              </Link>
              <Link
                to="/albums/bloodshot-lies"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Disc size={20} />
                <span className="font-medium">Bloodshot Lies</span>
              </Link>
              <Link
                to="/albums/heycitizen-experience"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Disc size={20} />
                <span className="font-medium">HeyCitizen Experience</span>
              </Link>
            </nav>

            {/* Pinned Albums Section */}
            {pinnedAlbums.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2 px-4">
                  <Pin size={16} />
                  Pinned Albums
                </h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {pinnedAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0">
                        <SecureImage
                          src={album.artwork}
                          alt={album.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{album.title}</p>
                        <p className="text-xs text-gray-500 truncate">{album.artist}</p>
                      </div>
                      <button
                        onClick={() => unpinAlbum(album.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                      >
                        <X size={12} className="text-gray-500 hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="absolute bottom-6 left-6 right-6">
              <VersionDisplay />
              <p className="text-xs text-gray-500 mt-2">
                Vibed with <a href="https://soapbox.pub/mkstack" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MKStack</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 pt-24">
        <AlbumViewEnhanced feedUrl={currentFeedUrl} />
      </div>

      {/* Audio Player */}
      <PodcastPlayer />
    </div>
  );
};

export default Albums; 