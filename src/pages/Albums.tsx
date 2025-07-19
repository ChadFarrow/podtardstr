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
  const [showFriends, setShowFriends] = useState(false);
  const [showDoerfels, setShowDoerfels] = useState(false);
  const [showMikeNeumann, setShowMikeNeumann] = useState(false);
  const [showSaltyCrayon, setShowSaltyCrayon] = useState(false);
  const [showBooBury, setShowBooBury] = useState(false);
  const [showTJ, setShowTJ] = useState(false);
  const [showDuhlaurien, setShowDuhlaurien] = useState(false);
  const [showMatyKateUltra, setShowMatyKateUltra] = useState(false);
  const [showSirSpencer, setShowSirSpencer] = useState(false);
  const [showEricpp, setShowEricpp] = useState(false);
  const [showCottongin, setShowCottongin] = useState(false);
  const [showLavish, setShowLavish] = useState(false);
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

  // Friends folder albums
  const FRIENDS_ALBUMS = [
    'stay-awhile',
    'lofi-experience',
    'heycitizen-experience'
  ];

  // The Doerfels folder albums
  const DOERFELS_ALBUMS = [
    'bloodshot-lies',
    'music-from-the-doerfelverse',
    'think-ep'
  ];

  // Get albums that belong to ChadF folder
  const chadFAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    CHADF_ALBUMS.includes(album.id)
  );

  // Get albums that belong to Live Concerts section
  const liveConcertsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    LIVE_CONCERTS_ALBUMS.includes(album.id)
  );

  // Get albums that belong to Friends section
  const friendsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    FRIENDS_ALBUMS.includes(album.id)
  );

  // Get albums that belong to The Doerfels section
  const doerfelsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    DOERFELS_ALBUMS.includes(album.id)
  );

  // Create complete album list including all sidebar navigation items
  const getAllNavigationAlbums = () => {
    // Start with featured albums
    const allAlbums = [...FEATURED_ALBUMS_WITH_DETAILS];
    
    // Add albums from sidebar navigation that aren't in featured albums
    const sidebarAlbums = [
      // Additional Doerfels albums from podroll
      {
        id: 'ben-doerfel',
        title: 'Ben Doerfel',
        artist: 'Ben Doerfel',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://www.doerfelverse.com/feeds/ben-doerfel.xml',
        description: 'Solo work from Ben Doerfel'
      },
      {
        id: 'into-the-doerfelverse',
        title: 'Into the Doerfelverse',
        artist: 'The Doerfels',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://www.doerfelverse.com/feeds/intothedoerfelverse.xml',
        description: 'Journey into the Doerfelverse'
      },
      {
        id: 'kurtisdrums-v1',
        title: 'Kurtisdrums V1',
        artist: 'Kurtis',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Kurtisdrums-V1.xml',
        description: 'Drum compositions by Kurtis'
      },
      {
        id: 'nostalgic',
        title: 'Nostalgic',
        artist: 'Various',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Nostalgic.xml',
        description: 'Nostalgic musical journey'
      },
      {
        id: 'citybeach',
        title: 'CityBeach',
        artist: 'Various',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/CityBeach.xml',
        description: 'Urban beach vibes'
      },
      {
        id: 'wrath-of-banjo',
        title: 'Wrath of Banjo',
        artist: 'The Doerfels',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://www.doerfelverse.com/feeds/wrath-of-banjo.xml',
        description: 'Banjo-driven compositions'
      },
      {
        id: 'ring-that-bell',
        title: 'Ring That Bell',
        artist: 'J-Dog',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://www.thisisjdog.com/media/ring-that-bell.xml',
        description: 'Bell-themed musical collection'
      },
      {
        id: 'wavlake-album',
        title: 'Wavlake Album',
        artist: 'ChadF',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://wavlake.com/feed/music/997060e3-9dc1-4cd8-b3c1-3ae06d54bb03',
        description: 'Album from Wavlake platform'
      }
    ];

    // Filter out sidebar albums that are already in featured albums
    const newSidebarAlbums = sidebarAlbums.filter(sidebarAlbum => 
      !allAlbums.some(featuredAlbum => featuredAlbum.feedUrl === sidebarAlbum.feedUrl)
    );

    // Combine all albums
    const combinedAlbums = [...allAlbums, ...newSidebarAlbums];
    
    // Separate Doerfels and related albums (includes podroll items)
    const doerfelsAndRelated = combinedAlbums.filter(album => {
      // Direct Doerfels albums
      if (DOERFELS_ALBUMS.includes(album.id)) return true;
      
      // Check if feedUrl contains doerfelverse domains or specific podroll items
      if (album.feedUrl?.includes('doerfelverse.com')) return true;
      if (album.feedUrl?.includes('sirtjthewrathful.com')) return true;
      if (album.feedUrl?.includes('thisisjdog.com')) return true;
      
      // Specific podroll album IDs that might not be caught by URL
      const podrollIds = ['ben-doerfel', 'into-the-doerfelverse', 'kurtisdrums-v1', 'nostalgic', 'citybeach', 'wrath-of-banjo', 'ring-that-bell'];
      return podrollIds.some(id => album.id.includes(id) || album.feedUrl?.includes(id));
    });
    
    // Get remaining albums
    const otherAlbums = combinedAlbums.filter(album => !doerfelsAndRelated.includes(album));
    
    // Ensure Bloodshot Lies is first among Doerfels albums
    const bloodshotLies = doerfelsAndRelated.find(album => album.id === 'bloodshot-lies');
    const otherDoerfelsAlbums = doerfelsAndRelated.filter(album => album.id !== 'bloodshot-lies');
    
    // Return prioritized order: Bloodshot Lies first, then other Doerfels, then everything else
    return [
      ...(bloodshotLies ? [bloodshotLies] : []),
      ...otherDoerfelsAlbums,
      ...otherAlbums
    ];
  };

  // Auto-pin all navigation albums if not already pinned
  useEffect(() => {
    const albumsToPin = getAllNavigationAlbums().map(album => ({
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
              
              {/* The Doerfels Folder */}
              <div>
                <button
                  onClick={() => setShowDoerfels(!showDoerfels)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Folder size={20} />
                  <span className="font-medium flex-1">The Doerfels</span>
                  {showDoerfels ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                
                {showDoerfels && (
                  <div className="ml-4 space-y-1 mt-1">
                    {doerfelsAlbums.map((album) => (
                      <Link
                        key={album.id}
                        to={album.id === 'bloodshot-lies' ? `/albums/bloodshot-lies` : `/albums?feed=${encodeURIComponent(album.feedUrl)}`}
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
                    
                    {/* Additional Doerfels albums from podroll */}
                    <Link
                      to="/albums?feed=https://www.doerfelverse.com/feeds/ben-doerfel.xml"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">Ben Doerfel</span>
                    </Link>

                    <Link
                      to="/albums?feed=https://www.doerfelverse.com/feeds/intothedoerfelverse.xml"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">Into the Doerfelverse</span>
                    </Link>

                    <Link
                      to="/albums?feed=https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Kurtisdrums-V1.xml"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">Kurtisdrums V1</span>
                    </Link>

                    <Link
                      to="/albums?feed=https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Nostalgic.xml"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">Nostalgic</span>
                    </Link>

                    <Link
                      to="/albums?feed=https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/CityBeach.xml"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">CityBeach</span>
                    </Link>

                    <Link
                      to="/albums?feed=https://www.doerfelverse.com/feeds/wrath-of-banjo.xml"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">Wrath of Banjo</span>
                    </Link>

                    <Link
                      to="/albums?feed=https://www.thisisjdog.com/media/ring-that-bell.xml"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">Ring That Bell</span>
                    </Link>
                  </div>
                )}
              </div>

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
                    
                    {/* Additional ChadF album */}
                    <Link
                      to="/albums?feed=https://wavlake.com/feed/music/997060e3-9dc1-4cd8-b3c1-3ae06d54bb03"
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-500 hover:text-white hover:bg-white/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Disc size={16} />
                      <span className="font-medium text-sm">Wavlake Album</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Friends Folder */}
              <div>
                <button
                  onClick={() => setShowFriends(!showFriends)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Folder size={20} />
                  <span className="font-medium flex-1">Friends</span>
                  {showFriends ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                
                {showFriends && (
                  <div className="ml-4 space-y-1 mt-1">
                    {friendsAlbums.map((album) => (
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

              {/* Pinned Albums (excluding ChadF, Live Concerts, Friends, and Doerfels albums) */}
              {pinnedAlbums.filter(album => !CHADF_ALBUMS.includes(album.id) && !LIVE_CONCERTS_ALBUMS.includes(album.id) && !FRIENDS_ALBUMS.includes(album.id) && !DOERFELS_ALBUMS.includes(album.id)).map((album) => (
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

              {/* Individual Artist Folders */}
              <div className="mt-4 space-y-2">
                {/* Mike Neumann */}
                <div>
                  <button
                    onClick={() => setShowMikeNeumann(!showMikeNeumann)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">Mike Neumann</span>
                    {showMikeNeumann ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showMikeNeumann && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Salty Crayon */}
                <div>
                  <button
                    onClick={() => setShowSaltyCrayon(!showSaltyCrayon)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">Salty Crayon</span>
                    {showSaltyCrayon ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showSaltyCrayon && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Boo-Bury */}
                <div>
                  <button
                    onClick={() => setShowBooBury(!showBooBury)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">Boo-Bury</span>
                    {showBooBury ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showBooBury && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* TJ */}
                <div>
                  <button
                    onClick={() => setShowTJ(!showTJ)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">TJ</span>
                    {showTJ ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showTJ && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Duhlaurien */}
                <div>
                  <button
                    onClick={() => setShowDuhlaurien(!showDuhlaurien)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">Duhlaurien</span>
                    {showDuhlaurien ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showDuhlaurien && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* MatyKateUltra */}
                <div>
                  <button
                    onClick={() => setShowMatyKateUltra(!showMatyKateUltra)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">MatyKateUltra</span>
                    {showMatyKateUltra ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showMatyKateUltra && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* SirSpencer */}
                <div>
                  <button
                    onClick={() => setShowSirSpencer(!showSirSpencer)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">SirSpencer</span>
                    {showSirSpencer ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showSirSpencer && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* ericpp */}
                <div>
                  <button
                    onClick={() => setShowEricpp(!showEricpp)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">ericpp</span>
                    {showEricpp ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showEricpp && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* cottongin */}
                <div>
                  <button
                    onClick={() => setShowCottongin(!showCottongin)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">cottongin</span>
                    {showCottongin ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showCottongin && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* lavish */}
                <div>
                  <button
                    onClick={() => setShowLavish(!showLavish)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 w-full ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Folder size={18} />
                    <span className="font-medium flex-1 text-sm">lavish</span>
                    {showLavish ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {showLavish && (
                    <div className="ml-6 mt-1">
                      <p className={`text-xs px-4 py-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        No albums added yet
                      </p>
                    </div>
                  )}
                </div>
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
            <AlbumGallery albums={getAllNavigationAlbums()} />
          </div>
        )}
      </div>

      {/* Audio Player */}
      <PodcastPlayer />
    </div>
  );
};

export default Albums; 