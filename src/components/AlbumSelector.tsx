import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Disc } from 'lucide-react';

const FEATURED_ALBUMS = [
  {
    id: 'bloodshot-lies',
    title: 'Bloodshot Lies - The Album',
    artist: 'The Doerfels',
    route: '/albums/bloodshot-lies',
  },
  {
    id: 'heycitizen-experience',
    title: 'The HeyCitizen Experience',
    artist: 'HeyCitizen',
    route: '/albums/heycitizen-experience',
  },
];

export function AlbumSelector() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      <Link to="/albums">
        <Button
          variant={currentPath === '/albums' ? 'default' : 'outline'}
          className="bg-red-600 hover:bg-red-500 text-white border-red-600"
        >
          <Disc className="h-4 w-4 mr-2" />
          All Albums
        </Button>
      </Link>
      
      {FEATURED_ALBUMS.map((album) => (
        <Link key={album.id} to={album.route}>
          <Button
            variant={currentPath === album.route ? 'default' : 'outline'}
            className="bg-red-600 hover:bg-red-500 text-white border-red-600"
          >
            <Disc className="h-4 w-4 mr-2" />
            {album.title}
          </Button>
        </Link>
      ))}
    </div>
  );
} 