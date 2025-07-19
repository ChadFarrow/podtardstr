import { useSeoMeta } from '@unhead/react';
import { AlbumGallery } from '@/components/AlbumGallery';
import { LoginArea } from '@/components/auth/LoginArea';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { VersionDisplay } from '@/components/VersionDisplay';
import { Home, Disc, Menu, X, Music as MusicIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Music = () => {
  const [showMenu, setShowMenu] = useState(false);

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
    <div className="min-h-screen bg-black relative">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
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
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Home size={20} />
                <span className="font-medium">Back to Main App</span>
              </Link>
              
              <Link
                to="/music"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white bg-white/10"
              >
                <MusicIcon size={20} />
                <span className="font-medium">Music</span>
              </Link>
              
              <Link
                to="/albums"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Disc size={20} />
                <span className="font-medium">Albums</span>
              </Link>
              
              <Link
                to="/albums/bloodshot-lies"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Disc size={20} />
                <span className="font-medium">Bloodshot Lies</span>
              </Link>
              
              <Link
                to="/albums/heycitizen-experience"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Disc size={20} />
                <span className="font-medium">HeyCitizen Experience</span>
              </Link>
            </nav>
            
            <div className="absolute bottom-6 left-6 right-6">
              <VersionDisplay />
              <p className="text-xs text-gray-500 mt-2">
                Vibed with <a href="https://soapbox.pub/mkstack" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MKStack</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 pt-16">
        <div className="text-center py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <MusicIcon size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Music
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Stream and support independent artists with Value4Value Lightning payments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/albums/bloodshot-lies"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Featured Album
              </Link>
              <Link
                to="/albums"
                className="px-8 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
              >
                Browse All Albums
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Albums */}
        <AlbumGallery albums={FEATURED_ALBUMS_WITH_DETAILS} />
      </div>

      {/* Audio Player */}
      <PodcastPlayer />
    </div>
  );
};

export default Music;