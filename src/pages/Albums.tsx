import { useSeoMeta } from '@unhead/react';
import { AlbumView } from '@/components/AlbumView';
import { LoginArea } from '@/components/auth/LoginArea';
import { WalletStatus } from '@/components/WalletStatus';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { VersionDisplay } from '@/components/VersionDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Home, Disc, Plus, Music, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Albums = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [customFeedUrl, setCustomFeedUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
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

  const handleCustomFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFeedUrl.trim()) {
      // Navigate to the album view with the custom feed URL
      navigate(`/albums?feed=${encodeURIComponent(customFeedUrl.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors">
                <Home className="h-5 w-5" />
                Podtardstr
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Disc className="h-4 w-4" />
                <span className="text-sm">Albums</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <WalletStatus />
              <LoginArea className="max-w-60" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Featured Albums</h1>
          <p className="text-muted-foreground mb-6">
            Discover and stream featured albums with Value4Value Lightning payments
          </p>
          
          {/* Custom Feed Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Load Your Own Album
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomFeedSubmit} className="flex gap-4">
                <Input
                  type="url"
                  placeholder="Enter RSS feed URL for your album..."
                  value={customFeedUrl}
                  onChange={(e) => setCustomFeedUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!customFeedUrl.trim()}>
                  Load Album
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-2">
                Paste an RSS feed URL from any podcast platform to load and stream the album
              </p>
            </CardContent>
          </Card>
        </div>
        
        <AlbumView feedUrl={feedUrlFromParams || undefined} />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <p>
                Vibed with <a href="https://soapbox.pub/mkstack" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MKStack</a>
              </p>
              <VersionDisplay />
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-primary transition-colors">
                Back to Main App
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Audio Player */}
      <PodcastPlayer />
    </div>
  );
};

export default Albums; 