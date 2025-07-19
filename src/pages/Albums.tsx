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
import { usePodcastByFeedId } from '@/hooks/usePodcastIndex';

interface AlbumsProps {
  feedUrl?: string;
}

const Albums = ({ feedUrl }: AlbumsProps) => {
  const [searchParams] = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const [showListenerSuggestions, setShowListenerSuggestions] = useState(false);
  const [showLiveConcerts, setShowLiveConcerts] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showDoerfels, setShowDoerfels] = useState(false);
  const { pinnedAlbums, pinAlbum, isPinned } = usePinnedAlbums();
  const { theme, toggleTheme } = useTheme();
  
  // Temporary: Look up podcast with ID 4630863
  const { data: podcastData } = usePodcastByFeedId(4630863);
  
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
      artwork: '/placeholder-album.png',
      feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/mp3s/album_feed/feed.xml',
      description: 'Ambient soundscapes inspired by arctic solitude and cosmic wonder.'
    },
    {
      id: 'autumn-rust',
      title: 'Autumn Rust',
      artist: 'The Satellite Skirmish',
      artwork: '/placeholder-album.png',
      feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml',
      description: 'Melancholic melodies capturing the beauty of seasonal transformation.'
    },
    {
      id: 'the-satellite-skirmish-album',
      title: 'The Satellite Skirmish',
      artist: 'Various Artists',
      artwork: '/placeholder-album.png',
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
    },
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
    }
  ];

  // The Doerfels albums (main band)
  const DOERFELS_ALBUMS = [
    'bloodshot-lies',
    'music-from-the-doerfelverse',
    'think-ep',
    'ben-doerfel',
    'into-the-doerfelverse',
    'wrath-of-banjo',
    'kurtisdrums-v1',
    'nostalgic',
    'citybeach',
    'ring-that-bell'
  ];

  // Artist that are friends of the band
  const FRIENDS_ALBUMS = [
    'stay-awhile',
    'lofi-experience',
    'heycitizen-experience'
  ];

  // Listeners suggestions (curated by listeners)
  const LISTENER_SUGGESTIONS_ALBUMS = [
    'empty-passenger-seat',
    'pony-up-daddy', 
    'deathdreams',
    'spectral-hiding',
    'tinderbox',
    'wavlake-album'
  ];

  // Live concert folder (audio-only, optimized for performance)
  const LIVE_CONCERTS_ALBUMS: string[] = [
    'the-satellite-skirmish-album',
    'autumn-rust',
    'polar-embrace'
  ];

  // Get albums that belong to The Doerfels section
  const doerfelsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    DOERFELS_ALBUMS.includes(album.id)
  );

  // Get albums that belong to Friends section
  const friendsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    FRIENDS_ALBUMS.includes(album.id)
  );

  // Get albums that belong to Listener Suggestions section
  const listenerSuggestionsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    LISTENER_SUGGESTIONS_ALBUMS.includes(album.id)
  );

  // Get albums that belong to Live Concerts section
  const liveConcertsAlbums = FEATURED_ALBUMS_WITH_DETAILS.filter(album => 
    LIVE_CONCERTS_ALBUMS.includes(album.id)
  );

  // Create complete album list including all sidebar navigation items
  const getAllNavigationAlbums = () => {
    // Start with featured albums
    const allAlbums = [...FEATURED_ALBUMS_WITH_DETAILS];
    
    // Add albums from sidebar navigation that aren't in featured albums
    const sidebarAlbums = [
      {
        id: 'wavlake-album',
        title: 'THEY RIDE',
        artist: 'IROH',
        artwork: '/placeholder-album.png',
        feedUrl: 'https://wavlake.com/feed/music/997060e3-9dc1-4cd8-b3c1-3ae06d54bb03',
        description: 'A literal ride in a 1972 Dodge Demon, presented as a Post Pandemic Zombie Rock Opera through a car radio'
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
      {/* Temporary: Display podcast info for ID 4630863 */}
      {podcastData?.podcast && (
        <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-md">
          <h3 className="font-bold text-lg mb-2">Podcast ID 4630863:</h3>
          <p><strong>Title:</strong> {podcastData.podcast.title}</p>
          <p><strong>Author:</strong> {podcastData.podcast.author}</p>
          <p><strong>Feed URL:</strong> {podcastData.podcast.url}</p>
          <p><strong>Image:</strong> {podcastData.podcast.image}</p>
          <p><strong>Artwork:</strong> {podcastData.podcast.artwork}</p>
          <p><strong>Description:</strong> {podcastData.podcast.description?.substring(0, 100)}...</p>
        </div>
      )}
      {/* Top Navigation Bar - Only show when not viewing individual album */}
      {!currentFeedUrl && (
        <div 
          className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 backdrop-blur-lg transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-b from-black/80 to-transparent' 
              : 'bg-gradient-to-b from-white/95 to-white/60 backdrop-blur-sm shadow-sm'
          }`}
        >
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
      )}

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
                        to={`/albums/${album.id}`}
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

              {/* Listeners Suggestions */}
              <div>
                <button
                  onClick={() => setShowListenerSuggestions(!showListenerSuggestions)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Folder size={20} />
                  <span className="font-medium flex-1">Listeners Suggestions</span>
                  {showListenerSuggestions ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                
                {showListenerSuggestions && (
                  <div className="ml-4 space-y-1 mt-1">
                    {listenerSuggestionsAlbums.map((album) => (
                      <Link
                        key={album.id}
                        to={`/albums/${album.id}`}
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
                        to={`/albums/${album.id}`}
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

              {/* Pinned Albums (excluding organized folders) */}
              {pinnedAlbums.filter(album => !LISTENER_SUGGESTIONS_ALBUMS.includes(album.id) && !LIVE_CONCERTS_ALBUMS.includes(album.id) && !FRIENDS_ALBUMS.includes(album.id) && !DOERFELS_ALBUMS.includes(album.id)).map((album) => (
                <Link
                  key={album.id}
                  to={`/albums/${album.id}`}
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
                        to={`/albums/${album.id}`}
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
      <div className={`relative z-10 ${currentFeedUrl ? '' : 'pt-16'}`}>
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