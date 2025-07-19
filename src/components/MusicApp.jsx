import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Search, Home, Library, Plus, Shuffle, Repeat, ExternalLink, Mic, Menu, X } from 'lucide-react';

const MusicApp = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // Featured Album - Bloodshot Lies by The Doerfels
  const featuredAlbum = {
    id: 'bloodshot-lies',
    title: "Bloodshot Lies",
    artist: "The Doerfels",
    cover: "https://www.doerfelverse.com/art/bloodshot-lies-the-album.png",
    year: "2023",
    genre: "Alternative Rock",
    description: "Featured on Adam Curry's Boostagram Ball debut episode! The Doerfels return with their most powerful album yet.",
    tracks: [
      { id: 1, title: "Bloodshot Lies", duration: "3:47" },
      { id: 2, title: "Into The Verse", duration: "4:12" },
      { id: 3, title: "Family Ties", duration: "3:29" },
      { id: 4, title: "Road Stories", duration: "4:55" },
      { id: 5, title: "Value for Value", duration: "3:33" }
    ],
    totalDuration: "19:56"
  };

  // Other Doerfel projects
  const doerfelProjects = [
    {
      id: 'dfb-volume-2',
      title: "DFB Volume 2",
      artist: "Doerfel Family Bluegrass",
      cover: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop",
      year: "2024",
      genre: "Bluegrass",
      tracks: 9
    },
    {
      id: 'citybeach-solo',
      title: "Coastal Dreams",
      artist: "CityBeach (Shredward)",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop",
      year: "2024",
      genre: "Indie Rock",
      tracks: 8
    },
    {
      id: 'kurtisdrums',
      title: "Rhythm & Soul",
      artist: "Kurtisdrums",
      cover: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&h=300&fit=crop",
      year: "2024",
      genre: "Instrumental",
      tracks: 12
    },
    {
      id: 'sir-tj-banjo',
      title: "Wrathful Strings",
      artist: "Sir TJ The Wrathful",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      year: "2023",
      genre: "Banjo/Folk",
      tracks: 10
    }
  ];

  const handlePlay = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {/* Album Art Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${featuredAlbum.cover})`,
          filter: 'brightness(0.3) blur(1px)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black/60 to-black/80" />
      
      {/* Top Navigation */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
          >
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Doerfelverse
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all w-64"
            />
          </div>
          <a 
            href="https://www.doerfelverse.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>

      {/* Slide-out Menu */}
      {showMenu && (
        <div className="absolute top-0 left-0 h-full w-80 bg-black/90 backdrop-blur-lg z-20 transform transition-transform duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Navigation</h2>
              <button onClick={() => setShowMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-2">
              {[
                { icon: Home, label: 'Browse' },
                { icon: Search, label: 'Search' },
                { icon: Mic, label: 'Podcast Feed' },
                { icon: Library, label: 'Your Library' },
                { icon: Heart, label: 'Liked Songs' }
              ].map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Album Art - Large Display */}
              <div className="flex justify-center">
                <div className="relative group cursor-pointer" onClick={() => handlePlay(featuredAlbum)}>
                  <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl shadow-2xl overflow-hidden relative">
                    <img
                      src={featuredAlbum.cover}
                      alt={featuredAlbum.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 bg-red-600 hover:bg-red-500 text-white rounded-full p-6 shadow-2xl">
                        {currentTrack?.id === featuredAlbum.id && isPlaying ? (
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
                  <h1 className="text-5xl lg:text-7xl font-black text-white mb-4 leading-tight">{featuredAlbum.title}</h1>
                  <h2 className="text-2xl lg:text-3xl text-gray-300 font-light mb-6">{featuredAlbum.artist}</h2>
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed max-w-lg">{featuredAlbum.description}</p>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-400">
                  <span className="bg-black/50 px-3 py-1 rounded-full">{featuredAlbum.year}</span>
                  <span className="bg-black/50 px-3 py-1 rounded-full">{featuredAlbum.genre}</span>
                  <span className="bg-black/50 px-3 py-1 rounded-full">{featuredAlbum.tracks.length} tracks</span>
                  <span className="bg-black/50 px-3 py-1 rounded-full">{featuredAlbum.totalDuration}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <button 
                    onClick={() => handlePlay(featuredAlbum)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-12 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center space-x-3 text-lg"
                  >
                    {currentTrack?.id === featuredAlbum.id && isPlaying ? (
                      <><Pause size={24} /><span>Pause Album</span></>
                    ) : (
                      <><Play size={24} className="ml-1" /><span>Play Album</span></>
                    )}
                  </button>
                  <button className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full transition-all duration-300 flex items-center space-x-2">
                    <Heart size={20} />
                    <span>Save</span>
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
              {featuredAlbum.tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => handlePlay({...track, albumId: featuredAlbum.id})}
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-8 text-center">
                      {currentTrack?.id === track.id && isPlaying ? (
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
                      <p className="text-gray-400">{featuredAlbum.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={18} className="text-gray-400 hover:text-red-400" />
                    </button>
                    <span className="text-gray-400 font-mono">{track.duration}</span>
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
              {doerfelProjects.map((album) => (
                <div
                  key={album.id}
                  className="flex-none group cursor-pointer"
                  onClick={() => handlePlay(album)}
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

      {/* Bottom Player */}
      {currentTrack && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/20 p-4 z-30">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Track Info */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <img
                src={currentTrack.cover || featuredAlbum.cover}
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg shadow-lg"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-white truncate">{currentTrack.title}</h4>
                <p className="text-sm text-gray-400 truncate">
                  {currentTrack.artist || featuredAlbum.artist}
                </p>
              </div>
              <button className="text-gray-400 hover:text-red-400 transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {/* Player Controls */}
            <div className="flex items-center space-x-6">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Shuffle size={20} />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipBack size={20} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white text-black rounded-full p-3 hover:scale-110 transition-transform shadow-lg"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipForward size={20} />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Repeat size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center space-x-3 min-w-0 flex-1 justify-end">
              <Volume2 size={20} className="text-gray-400" />
              <div className="w-24 h-2 bg-gray-600 rounded-full">
                <div className="w-1/2 h-full bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 max-w-6xl mx-auto">
            <div className="w-full h-1 bg-gray-600 rounded-full">
              <div className="w-1/3 h-full bg-white rounded-full transition-all duration-1000"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicApp; 