import { Play, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

interface PodRollItem {
  feedGuid?: string;
  feedUrl?: string;
  title: string;
  description?: string;
  image?: string;
  author?: string;
}

interface AlbumRecommendationsProps {
  podroll?: PodRollItem[];
  currentFeedUrl: string;
}

export function AlbumRecommendations({ podroll, currentFeedUrl }: AlbumRecommendationsProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const hasPodroll = podroll && podroll.length > 0;
  
  console.log('🎯 AlbumRecommendations: Received props:', {
    currentFeedUrl,
    hasPodroll,
    podrollLength: podroll?.length || 0,
    podrollItems: podroll
  });

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Update scroll position on mount and when podroll changes
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [podroll]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -240, // Width of one album card plus gap
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 240, // Width of one album card plus gap
        behavior: 'smooth'
      });
    }
  };

  // Don't render anything if there's no PodRoll data
  if (!hasPodroll) {
    console.log('🎯 AlbumRecommendations: No PodRoll data found, hiding recommendations section');
    return null;
  }

  // Map feed URLs to individual album routes
  const getAlbumRoute = (feedUrl: string): string => {
    // Create a mapping of feed URLs to clean routes
    const urlMappings: Record<string, string> = {
      'https://www.doerfelverse.com/feeds/bloodshot-lies-album.xml': '/albums/bloodshot-lies',
      'https://files.heycitizen.xyz/Songs/Albums/The-Heycitizen-Experience/the heycitizen experience.xml': '/albums/heycitizen-experience',
      'https://www.doerfelverse.com/feeds/think-ep.xml': '/albums/think-ep',
      'https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml': '/albums/music-from-the-doerfelverse',
      'https://ableandthewolf.com/static/media/feed.xml': '/albums/stay-awhile',
      'https://zine.bitpunk.fm/feeds/spectral-hiding.xml': '/albums/spectral-hiding',
      'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/rss/videofeed/feed.xml': '/albums/polar-embrace',
      'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml': '/albums/autumn-rust',
      'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/the_satellite_skirmish_album.xml': '/albums/the-satellite-skirmish',
      'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/lofi.xml': '/albums/lofi-experience',
      'https://wavlake.com/feed/music/d677db67-0310-4813-970e-e65927c689f1': '/albums/tinderbox',
      'https://static.staticsave.com/mspfiles/deathdreams.xml': '/albums/deathdreams',
      'https://music.behindthesch3m3s.com/wp-content/uploads/Mike_Epting/$2Holla/pony%20up%20daddy.xml': '/albums/pony-up-daddy',
      'https://whiterabbitrecords.org/wp-content/uploads/2023/04/Empty-Passenger-Seat.xml': '/albums/empty-passenger-seat',
      'https://www.doerfelverse.com/feeds/ben-doerfel.xml': '/albums/ben-doerfel',
      'https://www.doerfelverse.com/feeds/intothedoerfelverse.xml': '/albums/into-the-doerfelverse',
      'https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Kurtisdrums-V1.xml': '/albums/kurtisdrums-v1',
      'https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/Nostalgic.xml': '/albums/nostalgic',
      'https://www.sirtjthewrathful.com/wp-content/uploads/2023/08/CityBeach.xml': '/albums/citybeach',
      'https://www.doerfelverse.com/feeds/wrath-of-banjo.xml': '/albums/wrath-of-banjo',
      'https://www.thisisjdog.com/media/ring-that-bell.xml': '/albums/ring-that-bell',
      'https://wavlake.com/feed/music/997060e3-9dc1-4cd8-b3c1-3ae06d54bb03': '/albums/wavlake-album',
      'https://music.behindthesch3m3s.com/wp-content/uploads/Delta_OG/Aged_Friends_and_Old_Whiskey/aged_friends_old_whiskey.xml': '/albums/aged-friends-old-whiskey',
      'https://feed.falsefinish.club/Temples/Temples - Cosmodrome/cosmodrome.xml': '/albums/cosmodrome'
    };

    // Return clean route if found, otherwise fall back to query parameter
    return urlMappings[feedUrl] || `/albums?feed=${encodeURIComponent(feedUrl)}`;
  };

  return (
    <div 
      className="py-8 pb-16"
      style={{
        paddingLeft: `max(2rem, env(safe-area-inset-left))`,
        paddingRight: `max(2rem, env(safe-area-inset-right))`
      }}
    >
      <div className="max-w-6xl mx-auto relative">
        
        {/* Left scroll arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right scroll arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
          onScroll={checkScrollPosition}
        >
          {podroll.map((recommendation, index) => (
            <div
              key={recommendation.feedGuid || recommendation.feedUrl || index}
              className="flex-none group cursor-pointer"
              onClick={() => {
                if (recommendation.feedUrl) {
                  const route = getAlbumRoute(recommendation.feedUrl);
                  navigate(route);
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
              {(recommendation.title || recommendation.author || recommendation.description) && (
                <div className="mt-3 space-y-1">
                  {recommendation.title && (
                    <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                      {recommendation.title}
                    </h4>
                  )}
                  {recommendation.author && (
                    <p className="text-sm text-gray-400 truncate">{recommendation.author}</p>
                  )}
                  {recommendation.description && (
                    <p className="text-xs text-gray-500 truncate">{recommendation.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 