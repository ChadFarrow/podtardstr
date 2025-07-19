import { Play, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PodRollItem {
  feedGuid?: string;
  feedUrl?: string;
  title: string;
  description?: string;
  image?: string;
  author?: string;
}

interface StaticAlbum {
  id: string;
  title: string;
  artist: string;
  cover: string;
  year: string;
  genre: string;
  tracks: number;
}

interface AlbumRecommendationsProps {
  podroll?: PodRollItem[];
  currentFeedUrl: string;
}

// Static albums fallback
const OTHER_ALBUMS: StaticAlbum[] = [
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

export function AlbumRecommendations({ podroll, currentFeedUrl }: AlbumRecommendationsProps) {
  const navigate = useNavigate();
  const hasPodroll = podroll && podroll.length > 0;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">
          {hasPodroll ? 'Recommended' : 'More from The Doerfel-Verse'}
        </h3>
        
        
        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {/* Show PodRoll recommendations if available */}
          {hasPodroll ? (
            podroll.map((recommendation, index) => (
              <div
                key={recommendation.feedGuid || recommendation.feedUrl || index}
                className="flex-none group cursor-pointer"
                onClick={() => {
                  if (recommendation.feedUrl) {
                    navigate(`/albums?feed=${encodeURIComponent(recommendation.feedUrl)}`);
                  }
                }}
              >
                <div className="relative w-48">
                  <div className="w-48 h-48 bg-gray-800 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
                    {recommendation.image ? (
                      <img
                        src={recommendation.image}
                        alt={recommendation.title}
                        className="w-full h-full object-cover rounded-xl"
                        onLoad={() => console.log('🖼️ Image loaded:', recommendation.title, recommendation.image)}
                        onError={(e) => console.log('❌ Image failed:', recommendation.title, recommendation.image, e)}
                      />
                    ) : (
                      <Music className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 bg-red-600 hover:bg-red-500 text-white rounded-full p-3 shadow-lg">
                      <Play size={20} className="ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                    {recommendation.title}
                  </h4>
                  {recommendation.author && (
                    <p className="text-sm text-gray-400 truncate">{recommendation.author}</p>
                  )}
                  {recommendation.description && (
                    <p className="text-xs text-gray-500 truncate">{recommendation.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Fallback to static albums if no PodRoll */
            OTHER_ALBUMS.map((album) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
} 