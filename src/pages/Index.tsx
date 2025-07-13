import { useSeoMeta } from '@unhead/react';
import { PodcastPlayer } from '@/components/PodcastPlayer';
// import { PodcastSearch } from '@/components/PodcastSearch';
// import { PodcastDiscovery } from '@/components/PodcastDiscovery';
import { NostrPodcastFeed } from '@/components/NostrPodcastFeed';
import { MusicDiscovery } from '@/components/MusicDiscovery';
import { TrendingMusic } from '@/components/TrendingMusic';
import { FeedValueParser } from '@/components/FeedValueParser';
import { PodcastValidator } from '@/components/PodcastValidator';
import { LoginArea } from '@/components/auth/LoginArea';
import { RelaySelector } from '@/components/RelaySelector';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Music, MessageSquare, Radio, Code, Star, Shield } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [activeTab, setActiveTab] = useState('top100');

  useSeoMeta({
    title: 'Podtardstr',
    description: 'Podtardstr where music meets Nostr - discover and stream music with Value4Value',
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Music className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Podtardstr</h1>
                <p className="text-xs text-muted-foreground">Music + Nostr + Value4Value</p>
              </div>
            </div>

            <div className="space-y-4">
              <LoginArea className="w-full" />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
                <div className="space-y-2">
                  <Button
                    variant={activeTab === 'music' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('music')}
                  >
                    <Radio className="h-4 w-4 mr-2" />
                    Music
                  </Button>
                  <Button
                    variant={activeTab === 'top100' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('top100')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Top 100 V4V tracks
                  </Button>
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
                  <Button
                    variant={activeTab === 'nostr' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('nostr')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Nostr Feed
                  </Button>
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


              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Relay</h3>
                <RelaySelector className="w-full" />
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Vibed with <a href="https://soapbox.pub/mkstack" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MKStack</a>
                </p>
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
                  {activeTab === 'music' && 'Music'}
                  {activeTab === 'top100' && 'Top 100 V4V tracks'}
                  {/* {activeTab === 'discover' && 'Discover'}
                  {activeTab === 'search' && 'Search'} */}
                  {activeTab === 'nostr' && 'Nostr Feed'}
                  {activeTab === 'feed-parser' && 'Feed Parser'}
                  {activeTab === 'validator' && 'RSS Validator'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  {activeTab === 'music' && 'Search and discover music with Value4Value'}
                  {activeTab === 'top100' && 'The hottest Value4Value music tracks ranked by community boosts'}
                  {/* {activeTab === 'discover' && 'Trending music and recent releases'}
                  {activeTab === 'search' && 'Find music and tracks from Podcast Index'} */}
                  {activeTab === 'nostr' && 'Music recommendations and discussions on Nostr'}
                  {activeTab === 'feed-parser' && 'Parse RSS feeds for Podcast Namespace value recipients'}
                  {activeTab === 'validator' && 'Comprehensive podcast feed validation and compliance checking'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              <TabsContent value="music" className="space-y-6">
                <MusicDiscovery />
              </TabsContent>

              <TabsContent value="top100" className="space-y-6">
                <TrendingMusic />
              </TabsContent>

              {/* <TabsContent value="discover" className="space-y-6">
                <PodcastDiscovery />
              </TabsContent>

              <TabsContent value="search" className="space-y-6">
                <PodcastSearch />
              </TabsContent> */}

              <TabsContent value="nostr" className="space-y-6">
                <NostrPodcastFeed />
              </TabsContent>

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
