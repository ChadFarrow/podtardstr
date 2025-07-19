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

interface AlbumRecommendationsProps {
  podroll?: PodRollItem[];
  currentFeedUrl: string;
}

export function AlbumRecommendations({ podroll, currentFeedUrl }: AlbumRecommendationsProps) {
  const navigate = useNavigate();
  const hasPodroll = podroll && podroll.length > 0;
  
  console.log('🎯 AlbumRecommendations: Received props:', {
    currentFeedUrl,
    hasPodroll,
    podrollLength: podroll?.length || 0,
    podrollItems: podroll
  });

  // Don't render anything if there's no PodRoll data
  if (!hasPodroll) {
    console.log('🎯 AlbumRecommendations: No PodRoll data found, hiding recommendations section');
    return null;
  }

  return (
    <div className="p-8 pb-16">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Recommended
        </h3>
        
        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {podroll.map((recommendation, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
} 