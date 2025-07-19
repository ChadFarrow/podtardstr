import { useState } from 'react';
import { useAlbumFeed } from '@/hooks/useAlbumFeed';
import { usePinnedAlbums } from '@/hooks/usePinnedAlbums';
import { SecureImage } from '@/components/SecureImage';
import { useAlbumControls } from '@/components/AlbumControls';

import { AlbumTrackList } from '@/components/AlbumTrackList';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Music, Pin, PinOff, Disc, Play, Pause } from 'lucide-react';
import { htmlToText } from '@/lib/html-utils';

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
  {
    id: 'think-ep',
    title: 'Think EP',
    artist: 'The Doerfels',
    feedUrl: 'https://www.doerfelverse.com/feeds/think-ep.xml',
  },
  {
    id: 'music-from-the-doerfelverse',
    title: 'Music From The Doerfel-Verse',
    artist: 'The Doerfels',
    feedUrl: 'https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml',
  },
  {
    id: 'stay-awhile',
    title: 'Stay Awhile',
    artist: 'Able and The Wolf',
    feedUrl: 'https://ableandthewolf.com/static/media/feed.xml',
  },
  {
    id: 'spectral-hiding',
    title: 'Spectral Hiding',
    artist: 'Bitpunk.fm',
    feedUrl: 'https://zine.bitpunk.fm/feeds/spectral-hiding.xml',
  },
  {
    id: 'polar-embrace',
    title: 'Polar Embrace',
    artist: 'The Satellite Skirmish',
    feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/rss/videofeed/feed.xml',
  },
  {
    id: 'autumn-rust',
    title: 'Autumn Rust',
    artist: 'The Satellite Skirmish',
    feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml',
  },
  {
    id: 'the-satellite-skirmish-album',
    title: 'The Satellite Skirmish',
    artist: 'Various Artists',
    feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/the_satellite_skirmish_album.xml',
  },
];

export function AlbumView({ feedUrl }: AlbumViewProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(feedUrl ? 'custom' : 'bloodshot-lies');
  const [_customFeedUrl, _setCustomFeedUrl] = useState(feedUrl || '');
  
  const currentFeedUrl = selectedAlbumId === 'custom' ? _customFeedUrl : 
    FEATURED_ALBUMS.find(album => album.id === selectedAlbumId)?.feedUrl || 
    FEATURED_ALBUMS[0].feedUrl;
  
  const { data: albumData, isLoading, error } = useAlbumFeed(currentFeedUrl);
  const { pinAlbum, unpinAlbum, isPinned } = usePinnedAlbums();
  
  // Use album controls for play functionality
  const controls = useAlbumControls({ albumData: albumData || { tracks: [], artist: '', artwork: '' } });

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

  const _selectedAlbum = FEATURED_ALBUMS.find(album => album.id === selectedAlbumId);

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">

      {/* Header Section with All Albums and Album Buttons */}
      {!feedUrl && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">All Albums</h1>
          <div className="flex flex-wrap gap-3">
            {FEATURED_ALBUMS.map((album) => (
              <Button
                key={album.id}
                variant={selectedAlbumId === album.id ? "default" : "outline"}
                onClick={() => setSelectedAlbumId(album.id)}
                className="flex items-center gap-2"
              >
                <Disc className="h-4 w-4" />
                <span className="truncate max-w-32">{album.title}</span>
              </Button>
            ))}
          </div>
        </div>
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
              <div className="relative group cursor-pointer" onClick={controls.handleAlbumPlay}>
                <div 
                  className="w-64 h-64 rounded-lg shadow-2xl object-cover overflow-hidden"
                  style={{
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 40px rgba(139,69,19,0.2)'
                  }}
                >
                  <SecureImage
                    src={albumData.artwork}
                    alt={albumData.title}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center rounded-lg">
                  <button 
                    className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 text-white rounded-full p-4 shadow-2xl bg-red-600 hover:bg-red-500"
                  >
                    {controls.isAlbumPlaying() ? (
                      <Pause size={32} />
                    ) : (
                      <Play size={32} className="ml-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Album Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{albumData.title}</h1>
                  <p className="text-xl text-muted-foreground">{albumData.artist}</p>
                </div>
                <Button
                  variant={isPinned(selectedAlbumId) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isPinned(selectedAlbumId)) {
                      unpinAlbum(selectedAlbumId);
                    } else {
                      pinAlbum({
                        id: selectedAlbumId,
                        title: albumData.title,
                        artist: albumData.artist,
                        artwork: albumData.artwork,
                        feedUrl: currentFeedUrl,
                      });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {isPinned(selectedAlbumId) ? (
                    <>
                      <PinOff className="h-4 w-4" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4" />
                      Pin
                    </>
                  )}
                </Button>
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
        albumArtist={albumData.artist}
      />
    </div>
  );
}