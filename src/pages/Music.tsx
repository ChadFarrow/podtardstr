import { useSeoMeta } from '@unhead/react';
import { AlbumGallery } from '@/components/AlbumGallery';
import { LoginArea } from '@/components/auth/LoginArea';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { VersionDisplay } from '@/components/VersionDisplay';
import { Home, Disc, Menu, X, Music as MusicIcon, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const Music = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  useSeoMeta({
    title: 'Music - Podtardstr',
    description: 'Discover and stream featured music with Value4Value Lightning payments on Podtardstr',
    ogTitle: 'Music - Podtardstr',
    ogDescription: 'Discover and stream featured music with Value4Value Lightning payments on Podtardstr',
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
                to="/music"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  theme === 'dark'
                    ? 'text-white bg-white/10'
                    : 'text-blue-600 bg-blue-50 border border-blue-200'
                }`}
              >
                <MusicIcon size={20} />
                <span className="font-medium">Music</span>
              </Link>
              
              <Link
                to="/albums"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Disc size={20} />
                <span className="font-medium">Albums</span>
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

      {/* Hero Section */}
      <div className="relative z-10 pt-16">
        <div className={`text-center py-16 px-4 ${
          theme === 'dark' ? '' : 'bg-gradient-to-b from-white via-gray-50 to-gray-100'
        }`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
              }`}>
                <MusicIcon size={48} className="text-white" />
              </div>
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Discover Music
            </h1>
            <p className={`text-xl md:text-2xl mb-8 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Stream and support independent artists with Value4Value Lightning payments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/albums/bloodshot-lies"
                className={`px-8 py-3 text-white font-semibold rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                }`}
              >
                Featured Album
              </Link>
              <Link
                to="/albums"
                className={`px-8 py-3 font-semibold rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'border border-white/20 text-white hover:bg-white/10'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 shadow-sm'
                }`}
              >
                Browse All Albums
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Albums */}
        <div className={theme === 'dark' ? '' : 'bg-white'}>
          <AlbumGallery albums={FEATURED_ALBUMS_WITH_DETAILS} />
        </div>
      </div>

      {/* Audio Player */}
      <PodcastPlayer />
    </div>
  );
};

export default Music;