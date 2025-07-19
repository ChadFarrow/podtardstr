import { useState } from 'react';
import { useAlbumFeed } from '@/hooks/useAlbumFeed';
import { SecureImage } from '@/components/SecureImage';
import { V4VPaymentButton } from '@/components/V4VPaymentButton';
import { AlbumTrackList } from '@/components/AlbumTrackList';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Music, ExternalLink, ChevronDown } from 'lucide-react';
import { htmlToText } from '@/lib/html-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AlbumViewProps {
  feedUrl?: string;
}

const FEATURED_ALBUMS = [
  {
    id: 'bloodshot-lies',
    title: 'Bloodshot Lies - The Album',
    artist: 'The Doerfels',
    feedUrl: 'https://www.doerfelverse.com/feeds/bloodshot-lies-album.xml',
  },
];

export function AlbumView({ feedUrl }: AlbumViewProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(feedUrl ? 'custom' : 'bloodshot-lies');
  const [customFeedUrl, setCustomFeedUrl] = useState(feedUrl || '');
  
  const currentFeedUrl = selectedAlbumId === 'custom' ? customFeedUrl : 
    FEATURED_ALBUMS.find(album => album.id === selectedAlbumId)?.feedUrl || 
    FEATURED_ALBUMS[0].feedUrl;
  
  const { data: albumData, isLoading, error } = useAlbumFeed(currentFeedUrl);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 max-w-6xl mx-auto">
        <Card className="border-0 shadow-xl bg-gradient-to-b from-background to-muted/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="w-64 h-64 rounded-lg" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !albumData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Album</h3>
            <p className="text-muted-foreground text-sm">
              {error?.message || 'Unable to load album data'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedAlbum = FEATURED_ALBUMS.find(album => album.id === selectedAlbumId);

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      {/* Album Selector - Only show if not loading a custom feed */}
      {!feedUrl && (
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Featured Albums</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[200px] justify-between">
                    {selectedAlbum ? `${selectedAlbum.title}` : 'Select Album'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  {FEATURED_ALBUMS.map((album) => (
                    <DropdownMenuItem
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="flex flex-col items-start gap-1"
                    >
                      <span className="font-medium">{album.title}</span>
                      <span className="text-sm text-muted-foreground">{album.artist}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Feed Info */}
      {feedUrl && (
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Custom Album</h2>
                <p className="text-sm text-muted-foreground">Loaded from RSS feed</p>
              </div>
              <a
                href="/albums"
                className="text-sm text-primary hover:underline"
              >
                Back to Featured Albums
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Album Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-b from-background to-muted/20 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Album Artwork */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <SecureImage
                  src={albumData.artwork}
                  alt={albumData.title}
                  className="w-64 h-64 rounded-lg shadow-2xl object-cover"
                  style={{
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 40px rgba(139,69,19,0.2)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </div>
            </div>

            {/* Album Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{albumData.title}</h1>
                <p className="text-xl text-muted-foreground">{albumData.artist}</p>
              </div>

              {albumData.description && (() => {
                const cleanDescription = htmlToText(albumData.description);
                // Skip displaying description if it's just metadata like "By [Artist]" or "Song Lyrics"
                const isJustMetadata = cleanDescription.match(/^(By .+?)?\s*(Song Lyrics)?\s*$/i);
                
                if (isJustMetadata) {
                  return null;
                }
                
                return (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {cleanDescription}
                  </p>
                );
              })()}

              <div className="flex flex-wrap gap-3 pt-4">
                {/* V4V Payment Button */}
                {albumData.value?.destinations && (
                  <div className="flex-1 sm:flex-initial">
                    <V4VPaymentButton
                      valueDestinations={albumData.value.destinations}
                      feedUrl={feedUrl}
                      totalAmount={100}
                      contentTitle={albumData.title}
                      feedId={`album-${albumData.title}`}
                    />
                  </div>
                )}

                {/* Funding Link */}
                {albumData.funding?.url && (
                  <a
                    href={albumData.funding.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Support Artist
                  </a>
                )}
              </div>

              {/* Album Stats */}
              <div className="flex gap-6 text-sm text-muted-foreground pt-2">
                <span>{albumData.tracks.length} tracks</span>
                {albumData.tracks.length > 0 && (
                  <span>
                    {Math.floor(
                      albumData.tracks.reduce((acc, track) => acc + (track.duration || 0), 0) / 60
                    )} minutes
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Track List */}
      <AlbumTrackList 
        tracks={albumData.tracks} 
        albumTitle={albumData.title}
        albumArtist={albumData.artist}
        defaultValue={albumData.value}
      />
    </div>
  );
}