import { useSeoMeta } from '@unhead/react';
import { PodcastPlayer } from '@/components/PodcastPlayer';
// import { PodcastSearch } from '@/components/PodcastSearch';
// import { PodcastDiscovery } from '@/components/PodcastDiscovery';
// import { NostrPodcastFeed } from '@/components/NostrPodcastFeed';
// import { MusicDiscovery } from '@/components/MusicDiscovery';
import { TrendingMusic } from '@/components/TrendingMusic';
import { FeedValueParser } from '@/components/FeedValueParser';
import { PodcastValidator } from '@/components/PodcastValidator';
import { AlbumView } from '@/components/AlbumView';
import { LoginArea } from '@/components/auth/LoginArea';
import { UserNameInput } from '@/components/UserNameInput';
import { WalletStatus } from '@/components/WalletStatus';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Code, Star, Shield, Disc, Pin, X } from 'lucide-react';
import { usePinnedAlbums } from '@/hooks/usePinnedAlbums';
import { SecureImage } from '@/components/SecureImage';
import { useState, useEffect } from 'react';
import { VersionDisplay } from '@/components/VersionDisplay';
import { usePrefetchAlbums } from '@/hooks/useAlbumFeed';

const Index = () => {
  const [activeTab, setActiveTab] = useState('top100');
  const { pinnedAlbums, unpinAlbum, pinAlbum, isPinned } = usePinnedAlbums();

  // Prefetch albums for better performance
  usePrefetchAlbums();

  // Auto-pin featured albums if not already pinned
  useEffect(() => {
    const albumsToPin = [
      {
        id: 'think-ep',
        title: 'Think EP',
        artist: 'The Doerfels',
        artwork: 'https://www.doerfelverse.com/art/think-ep.png',
        feedUrl: 'https://www.doerfelverse.com/feeds/think-ep.xml',
      },
      {
        id: 'music-from-the-doerfelverse',
        title: 'Music From The Doerfel-Verse',
        artist: 'The Doerfels',
        artwork: 'https://www.doerfelverse.com/art/carol-of-the-bells.png',
        feedUrl: 'https://www.doerfelverse.com/feeds/music-from-the-doerfelverse.xml',
      },
      {
        id: 'stay-awhile',
        title: 'Stay Awhile',
        artist: 'Able and The Wolf',
        artwork: 'https://ableandthewolf.com/static/media/01_MakinBeans.6dfb9c8e18b0f28adf4d.jpg',
        feedUrl: 'https://ableandthewolf.com/static/media/feed.xml',
      },
      {
        id: 'spectral-hiding',
        title: 'Spectral Hiding',
        artist: 'Bitpunk.fm',
        artwork: 'https://files.bitpunk.fm/spectral_hiding.png',
        feedUrl: 'https://zine.bitpunk.fm/feeds/spectral-hiding.xml',
      },
      {
        id: 'polar-embrace',
        title: 'Polar Embrace',
        artist: 'The Satellite Skirmish',
        artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/art/Polar-Embrace-Feed-art-hires.gif',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/polarembrace/rss/videofeed/feed.xml',
      },
      {
        id: 'autumn-rust',
        title: 'Autumn Rust',
        artist: 'The Satellite Skirmish',
        artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/art/Autumn-Rust-Feed-Art.gif',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/autumnrust/mp3s/album_feed/feed.xml',
      },
      {
        id: 'the-satellite-skirmish-album',
        title: 'The Satellite Skirmish',
        artist: 'Various Artists',
        artwork: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/art/the%20satellite%20skirmish%20mku.gif',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Sat_Skirmish/the_satellite_skirmish_album.xml',
      },
      {
        id: 'lofi-experience',
        title: 'HeyCitizen\'s Lo-Fi Hip-Hop Beats to Study and Relax to',
        artist: 'HeyCitizen',
        artwork: 'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/Lofi-Experience.png',
        feedUrl: 'https://files.heycitizen.xyz/Songs/Albums/Lofi-Experience/lofi.xml',
      },
      {
        id: 'tinderbox',
        title: 'Tinderbox',
        artist: 'Nate Johnivan',
        artwork: 'https://d12wklypp119aj.cloudfront.net/image/d677db67-0310-4813-970e-e65927c689f1.jpg',
        feedUrl: 'https://wavlake.com/feed/music/d677db67-0310-4813-970e-e65927c689f1',
      },
      {
        id: 'deathdreams',
        title: 'deathdreams',
        artist: 'Survival Guide (Emily Whitehurst)',
        artwork: 'https://static.wixstatic.com/media/484406_9138bd56c7b64a388da3b927a5bb2220~mv2.png',
        feedUrl: 'https://static.staticsave.com/mspfiles/deathdreams.xml',
      },
      {
        id: 'pony-up-daddy',
        title: 'Pony Up Daddy',
        artist: '$2 Holla',
        artwork: 'https://f4.bcbits.com/img/a1480089316_16.jpg',
        feedUrl: 'https://music.behindthesch3m3s.com/wp-content/uploads/Mike_Epting/$2Holla/pony%20up%20daddy.xml',
      },
      {
        id: 'empty-passenger-seat',
        title: 'Empty Passenger Seat',
        artist: 'White Rabbit Records',
        artwork: '', // Placeholder - will be extracted from feed when accessible
        feedUrl: 'https://whiterabbitrecords.org/wp-content/uploads/2023/04/Empty-Passenger-Seat.xml',
      },
    ];

    albumsToPin.forEach(album => {
      if (!isPinned(album.id)) {
        pinAlbum(album);
      }
    });
  }, [pinAlbum, isPinned]);

  useSeoMeta({
    title: 'Podtardstr',
    description: 'Podtardstr where music meets Nostr - discover and stream music with Value4Value',
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full safe-area-all">
        <Sidebar className="border-r">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <img src="/favicon-32x32.png" alt="Podtardstr Logo" className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Podtardstr</h1>
                <p className="text-xs text-muted-foreground">Music + Nostr + Value4Value</p>
              </div>
            </div>

            <div className="space-y-4">
              <LoginArea className="w-full" />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-6 pb-28 sm:pb-24">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
                <div className="space-y-2">
                  {/* <Button
                    variant={activeTab === 'music' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('music')}
                  >
                    <Radio className="h-4 w-4 mr-2" />
                    Music
                  </Button> */}
                  <Button
                    variant={activeTab === 'top100' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('top100')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Top 100 V4V tracks
                  </Button>
                  <Button
                    variant={activeTab === 'albums' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('albums')}
                  >
                    <Disc className="h-4 w-4 mr-2" />
                    Albums
                  </Button>
                  <a
                    href="/albums/bloodshot-lies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent"
                  >
                    <Disc className="h-4 w-4" />
                    Bloodshot Lies Album
                  </a>
                  {/* <Button
                    variant={activeTab === 'discover' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('discover')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Discover
                  </Button>
                  <Button
                    variant={activeTab === 'search' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('search')}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button> */}
                  {/* <Button
                    variant={activeTab === 'nostr' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('nostr')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Nostr Feed
                  </Button> */}
                  <Button
                    variant={activeTab === 'feed-parser' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('feed-parser')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Feed Parser
                  </Button>
                  <Button
                    variant={activeTab === 'validator' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('validator')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    RSS Validator
                  </Button>
                </div>
              </div>

              {/* Pinned Albums */}
              {pinnedAlbums.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    Pinned Albums
                  </h3>
                  <div className="space-y-2">
                    {pinnedAlbums.map((album) => (
                      <div
                        key={album.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors group"
                      >
                        <div className="flex-shrink-0">
                          <SecureImage
                            src={album.artwork}
                            alt={album.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{album.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unpinAlbum(album.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <UserNameInput />
              </div>

              <div>
                <WalletStatus />
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Vibed with <a href="https://soapbox.pub/mkstack" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MKStack</a>
                </p>
                <VersionDisplay />
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b p-3 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <SidebarTrigger className="h-8 w-8 sm:h-6 sm:w-6" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-semibold truncate">
                  {/* {activeTab === 'music' && 'Music'} */}
                  {activeTab === 'top100' && 'Top 100 V4V tracks'}
                  {activeTab === 'albums' && 'Albums'}
                  {/* {activeTab === 'discover' && 'Discover'}
                  {activeTab === 'search' && 'Search'} */}
                  {/* {activeTab === 'nostr' && 'Nostr Feed'} */}
                  {activeTab === 'feed-parser' && 'Feed Parser'}
                  {activeTab === 'validator' && 'RSS Validator'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  {/* {activeTab === 'music' && 'Search and discover music with Value4Value'} */}
                  {activeTab === 'top100' && 'The hottest Value4Value music tracks ranked by community boosts'}
                  {activeTab === 'albums' && 'Explore full albums with Value4Value support'}
                  {/* {activeTab === 'discover' && 'Trending music and recent releases'}
                  {activeTab === 'search' && 'Find music and tracks from Podcast Index'} */}
                  {/* {activeTab === 'nostr' && 'Music recommendations and discussions on Nostr'} */}
                  {activeTab === 'feed-parser' && 'Parse RSS feeds for Podcast Namespace value recipients'}
                  {activeTab === 'validator' && 'Comprehensive podcast feed validation and compliance checking'}
                </p>
              </div>
            </div>

          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto pb-24 sm:pb-20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              {/* <TabsContent value="music" className="space-y-6">
                <MusicDiscovery />
              </TabsContent> */}

              <TabsContent value="top100" className="space-y-6">
                <TrendingMusic />
              </TabsContent>

              <TabsContent value="albums" className="space-y-6">
                <AlbumView />
              </TabsContent>

              {/* <TabsContent value="discover" className="space-y-6">
                <PodcastDiscovery />
              </TabsContent>

              <TabsContent value="search" className="space-y-6">
                <PodcastSearch />
              </TabsContent> */}

              {/* <TabsContent value="nostr" className="space-y-6">
                <NostrPodcastFeed />
              </TabsContent> */}

              <TabsContent value="feed-parser" className="space-y-6">
                <FeedValueParser />
              </TabsContent>

              <TabsContent value="validator" className="space-y-6">
                <PodcastValidator />
              </TabsContent>

            </Tabs>
          </main>

          <PodcastPlayer />
        </div>
      </div>

    </SidebarProvider>
  );
};

export default Index;
