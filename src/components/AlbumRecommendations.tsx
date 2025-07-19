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
    // Check if it's one of our featured albums
    if (feedUrl.includes('bloodshot-lies-album.xml')) {
      return '/albums/bloodshot-lies';
    }
    if (feedUrl.includes('heycitizen-experience')) {
      return '/albums/heycitizen-experience';
    }
    // For other albums, use query parameter approach
    return `/albums?feed=${encodeURIComponent(feedUrl)}`;
  };

  return (
    <div className="p-8 pb-16">
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
          ))}
        </div>
      </div>
    </div>
  );
} 