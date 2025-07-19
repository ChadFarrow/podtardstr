import { useSeoMeta } from '@unhead/react';
import { AlbumViewEnhanced } from '@/components/AlbumViewEnhanced';
import { AlbumGallery } from '@/components/AlbumGallery';
import { LoginArea } from '@/components/auth/LoginArea';

import { PodcastPlayer } from '@/components/PodcastPlayer';
import { VersionDisplay } from '@/components/VersionDisplay';
import { Home, Disc, Menu, X, Sun, Moon, ChevronDown, ChevronRight, Folder, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePinnedAlbums } from '@/hooks/usePinnedAlbums';
import { useTheme } from '@/contexts/ThemeContext';

interface AlbumsProps {
  feedUrl?: string;
}

const Albums = ({ feedUrl }: AlbumsProps) => {
  const [searchParams] = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const [showChadFFolder, setShowChadFFolder] = useState(false);
  const [showLiveConcerts, setShowLiveConcerts] = useState(false);
  const { pinnedAlbums, pinAlbum, isPinned } = usePinnedAlbums();
  const { theme, toggleTheme } = useTheme();
  
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

  // Featured albums data with descriptions
  const FEATURED_ALBUMS_WITH_DETAILS = [
    {
      id: 'bloodshot-lies',
      title: 'Bloodshot Lies - The Album',
      artist: 'The Doerfels',
      artwork: 'https://www.doerfelverse.com/art/bloodshot-lies-the-album.png',
      feedUrl: 'https://www.doerfelverse.com/feeds/bloodshot-lies-album.xml',
      description: 'A powerful collection of rock anthems exploring themes of deception and resilience.'
    },
    {
      id: 'heycitizen-experience',
      title: 'The HeyCitizen Experience',
      artist: 'HeyCitizen',
      artwork: 'https://files.heycitizen.xyz/Songs/Albums/The-Heycitizen-Experience/The-HEYCitizen-Experience-3000x3000.jpg',
      feedUrl: 'https://files.heycitizen.xyz/Songs/Albums/The-Heycitizen-Experience/the heycitizen experience.xml',
      description: 'An experimental journey through electronic soundscapes and indie vibes.'
    },
    {
      id: 'think-ep',
      title: 'Think EP',
      artist: 'The Doerfels',
      artwork: 'https://www.doerfelverse.com/art/think-ep.png',
      feedUrl: 'https://www.doerfelverse.com/feeds/think-ep.xml',
      description: 'A contemplative EP that challenges conventional thinking through melodic storytelling.'
    },
    {
      id: 'music-from-the-doerfelverse',
      title: 'Music From The Doerfel-Verse',
      artist: 'The Doerfels',
      artwork: 'https://www.doerfelverse.com/art/carol-of-the-bells.png',
      feedUrl: 'https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml',
      description: 'A diverse collection spanning the musical universe of The Doerfels.'
    },
    {
      id: 'stay-awhile',
      title: 'Stay Awhile',
      artist: 'Able and The Wolf',
      artwork: 'https://ableandthewolf.com/static/media/01_MakinBeans.6dfb9c8e18b0f28adf4d.jpg',
      feedUrl: 'https://ableandthewolf.com/static/media/feed.xml',
      description: 'Intimate acoustic sessions that invite listeners to pause and reflect.'
    },
    {
      id: 'spectral-hiding',
      title: 'Spectral Hiding',
      artist: 'Bitpunk.fm',
      artwork: 'https://files.bitpunk.fm/spectral_hiding.png',
      feedUrl: 'https://zine.bitpunk.fm/feeds/spectral-hiding.xml',
      description: 'Ethereal electronic compositions that blur the line between digital and organic.'
    },
    {
      id: 'polar-embrace',
      title: 'Polar Embrace',
      artist: 'The Satellite Skirmish',
      artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/art/Polar-Embrace-Feed-art-hires.gif',
      feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/rss/videofeed/feed.xml',
      description: 'Ambient soundscapes inspired by arctic solitude and cosmic wonder.'
    },
    {
      id: 'autumn-rust',
      title: 'Autumn Rust',
      artist: 'The Satellite Skirmish',
      artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/art/Autumn-Rust-Feed-Art.gif',
      feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml',
      description: 'Melancholic melodies capturing the beauty of seasonal transformation.'
    },
    {
      id: 'the-satellite-skirmish-album',
      title: 'The Satellite Skirmish',
      artist: 'Various Artists',
      artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/art/the%20satellite%20skirmish%20mku.gif',
      feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/the_satellite_skirmish_album.xml',
      description: 'A collaborative collection featuring diverse artists from the Satellite Skirmish collective.'
    },
    {
      id: 'lofi-experience',
      title: 'HeyCitizen\'s Lo-Fi Hip-Hop Beats to Study and Relax to',
      artist: 'HeyCitizen',
      artwork: 'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/Lofi-Experience.png',
      feedUrl: 'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/lofi.xml',
      description: 'Chill beats perfect for focus, relaxation, and late-night coding sessions.'
    },
    {
      id: 'tinderbox',
      title: 'Tinderbox',
      artist: 'Nate Johnivan',
      artwork: 'https://d12wklypp119aj.cloudfront.net/image/d677db67-0310-4813-970e-e65927c689f1.jpg',
      feedUrl: 'https://wavlake.com/feed/music/d677db67-0310-4813-970e-e65927c689f1',
      description: 'Raw, emotional tracks that ignite the soul and challenge conventions.'
    },
    {
      id: 'deathdreams',
      title: 'deathdreams',
      artist: 'Survival Guide (Emily Whitehurst)',
      artwork: 'https://static.wixstatic.com/media/484406_9138bd56c7b64a388da3b927a5bb2220~mv2.png',
      feedUrl: 'https://static.staticsave.com/mspfiles/deathdreams.xml',
      description: 'Haunting melodies exploring the darker corners of the human experience.'
    },
    {
      id: 'pony-up-daddy',
      title: 'Pony Up Daddy',
      artist: '$2 Holla',
      artwork: 'https://f4.bcbits.com/img/a1480089316_16.jpg',
      feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Mike_Epting/$2Holla/pony%20up%20daddy.xml',
      description: 'High-energy beats and clever wordplay that demand attention.'
    },
    {
      id: 'empty-passenger-seat',
      title: 'Empty Passenger Seat',
      artist: 'White Rabbit Records',
      artwork: 'https://whiterabbitrecords.org/wp-content/uploads/2023/04/empty-passenger-seat-artwork.jpg',
      feedUrl: 'https://whiterabbitrecords.org/wp-content/uploads/2023/04/Empty-Passenger-Seat.xml',
      description: 'Indie rock journeys through solitude and self-discovery.'
    }
  ];

  // ChadF folder albums
  const CHADF_ALBUMS = [
    'empty-passenger-seat',
    'pony-up-daddy', 
    'deathdreams',
    'spectral-hiding',
    'tinderbox'
  ];

  // Live Concerts albums
  const LIVE_CONCERTS_ALBUMS = [
    'the-satellite-skirmish-album',
    'autumn-rust',
    'polar-embrace'
  ];

  // Get albums that belong to ChadF folder
  const chadFAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    CHADF_ALBUMS.includes(album.id)
  );

  // Get albums that belong to Live Concerts section
  const liveConcertsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    LIVE_CONCERTS_ALBUMS.includes(album.id)
  );

  // Auto-pin featured albums if not already pinned
  useEffect(() => {
    const albumsToPin = FEATURED_ALBUMS_WITH_DETAILS.map(album => ({
      id: album.id,
      title: album.title,
      artist: album.artist,
      artwork: album.artwork,
      feedUrl: album.feedUrl
    }));

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
    <div className={`min-h-screen relative ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Top Navigation Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-black/80 to-transparent' 
          : 'bg-gradient-to-b from-white/95 to-white/60 backdrop-blur-sm shadow-sm'
      }`}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-black/50 hover:bg-black/70'
                : 'bg-white/80 hover:bg-white/95 shadow-sm border border-gray-200'
            }`}
          >
            {showMenu ? (
              <X size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
            ) : (
              <Menu size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
            )}
          </button>

        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-black/50 hover:bg-black/70'
                : 'bg-white/80 hover:bg-white/95 shadow-sm border border-gray-200'
            }`}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-white" />
            ) : (
              <Moon size={20} className="text-gray-700" />
            )}
          </button>
          <LoginArea className="max-w-60" />
        </div>
      </div>

      {/* Slide-out Menu */}
      {showMenu && (
        <div className={`absolute top-0 left-0 h-full w-80 backdrop-blur-lg z-30 transform transition-transform duration-300 ${
          theme === 'dark' 
            ? 'bg-black/90' 
            : 'bg-white/95 shadow-xl border-r border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Navigation
              </h2>
              <button onClick={() => setShowMenu(false)}>
                <X size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-600'} />
              </button>
            </div>
            <nav className="space-y-2">
              <Link
                to="/"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home size={20} />
                <span className="font-medium">Back to Main App</span>
              </Link>
              
              <Link
                to="/albums"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  theme === 'dark'
                    ? 'text-white bg-white/10'
                    : 'text-blue-600 bg-blue-50 border border-blue-200'
                }`}
              >
                <Disc size={20} />
                <span className="font-medium">All Albums</span>
              </Link>
              
              <Link
                to="/albums/bloodshot-lies"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Disc size={20} />
                <span className="font-medium">Bloodshot Lies</span>
              </Link>
              
              <Link
                to="/albums?feed=https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Disc size={20} />
                <span className="font-medium">Music From The Doerfel-Verse</span>
              </Link>
              
              <Link
                to="/albums?feed=https://www.doerfelverse.com/feeds/think-ep.xml"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Disc size={20} />
                <span className="font-medium">Think EP</span>
              </Link>

              {/* ChadF Folder */}
              <div>
                <button
                  onClick={() => setShowChadFFolder(!showChadFFolder)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Folder size={20} />
                  <span className="font-medium flex-1">ChadF</span>
                  {showChadFFolder ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                
                {showChadFFolder && (
                  <div className="ml-4 space-y-1 mt-1">
                    {chadFAlbums.map((album) => (
                      <Link
                        key={album.id}
                        to={`/albums?feed=${encodeURIComponent(album.feedUrl)}`}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                          theme === 'dark'
                            ? 'text-gray-500 hover:text-white hover:bg-white/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Disc size={16} />
                        <span className="font-medium text-sm">{album.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Pinned Albums (excluding ChadF and Live Concerts albums) */}
              {pinnedAlbums.filter(album => !CHADF_ALBUMS.includes(album.id) && !LIVE_CONCERTS_ALBUMS.includes(album.id)).map((album) => (
                <Link
                  key={album.id}
                  to={`/albums?feed=${encodeURIComponent(album.feedUrl)}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Disc size={20} />
                  <span className="font-medium">{album.title}</span>
                </Link>
              ))}

              {/* Live Concerts Section */}
              <div className="mt-6">
                <button
                  onClick={() => setShowLiveConcerts(!showLiveConcerts)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Music size={20} />
                  <span className="font-medium flex-1">Live Concerts</span>
                  {showLiveConcerts ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                
                {showLiveConcerts && (
                  <div className="ml-4 space-y-1 mt-1">
                    {liveConcertsAlbums.map((album) => (
                      <Link
                        key={album.id}
                        to={`/albums?feed=${encodeURIComponent(album.feedUrl)}`}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                          theme === 'dark'
                            ? 'text-gray-500 hover:text-white hover:bg-white/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Disc size={16} />
                        <span className="font-medium text-sm">{album.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
            
            <div className="absolute bottom-6 left-6 right-6">
              <VersionDisplay />
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Vibed with <a 
                  href="https://soapbox.pub/mkstack" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`hover:underline ${
                    theme === 'dark' ? 'text-primary' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  MKStack
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 pt-16">
        {currentFeedUrl ? (
          <AlbumViewEnhanced feedUrl={currentFeedUrl} />
        ) : (
          <div className={theme === 'dark' ? '' : 'bg-white'}>
            <AlbumGallery albums={FEATURED_ALBUMS_WITH_DETAILS} />
          </div>
        )}
      </div>

      {/* Audio Player */}
      <PodcastPlayer />
    </div>
  );
};

export default Albums; 