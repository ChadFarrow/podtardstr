import { Link } from 'react-router-dom';
import { SecureImage } from '@/components/SecureImage';
import { Disc } from 'lucide-react';

interface Album {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  feedUrl: string;
  description?: string;
}

interface AlbumGalleryProps {
  albums: Album[];
}

export function AlbumGallery({ albums }: AlbumGalleryProps) {
  return (
    <div 
      className="min-h-screen bg-black text-white py-8 pt-12 pb-32"
      style={{
        paddingLeft: `max(2rem, env(safe-area-inset-left))`,
        paddingRight: `max(2rem, env(safe-area-inset-right))`,
        paddingBottom: `max(8rem, env(safe-area-inset-bottom) + 6rem)`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">All Albums</h1>
        <p className="text-lg text-gray-300 mb-8 text-center max-w-3xl mx-auto">
          A collection of V4V albums from The Doerfels, Friends of the band and albums our producers enjoy
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/albums/${album.id}`}
              className="group relative overflow-hidden rounded-lg bg-gray-900 hover:bg-gray-800 transition-all duration-300 hover:scale-105"
            >
              <div className="aspect-square relative overflow-hidden">
                {album.artwork ? (
                  <SecureImage
                    src={album.artwork}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Disc size={80} className="text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{album.title}</h3>
                <p className="text-sm text-gray-300 mb-2">{album.artist}</p>
                {album.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">{album.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}