import { useSeoMeta } from '@unhead/react';
import { AlbumViewEnhanced } from '@/components/AlbumViewEnhanced';
import { LoginArea } from '@/components/auth/LoginArea';

import { PodcastPlayer } from '@/components/PodcastPlayer';
import { VersionDisplay } from '@/components/VersionDisplay';
import { Home, Disc, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';

const Albums = () => {
  const [searchParams] = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  
  // Get feed URL from query parameters
  const feedUrlFromParams = searchParams.get('feed');

  useSeoMeta({
    title: 'Albums - Podtardstr',
    description: 'Discover and stream featured albums with Value4Value Lightning payments',
    ogTitle: 'Albums - Podtardstr',
    ogDescription: 'Discover and stream featured albums with Value4Value Lightning payments',
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
                <span className="font-medium">Albums</span>
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

      {/* Main Content */}
      <AlbumViewEnhanced feedUrl={feedUrlFromParams || undefined} />

      {/* Audio Player */}
      <PodcastPlayer />
    </div>
  );
};

export default Albums; 