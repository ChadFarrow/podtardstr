import { useSeoMeta } from '@unhead/react';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { PodcastSearch } from '@/components/PodcastSearch';
import { PodcastDiscovery } from '@/components/PodcastDiscovery';
import { NostrPodcastFeed } from '@/components/NostrPodcastFeed';
import { MusicDiscovery } from '@/components/MusicDiscovery';
import { FeedValueParser } from '@/components/FeedValueParser';
import { LoginArea } from '@/components/auth/LoginArea';
import { RelaySelector } from '@/components/RelaySelector';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Music, Search, TrendingUp, MessageSquare, Radio, Code } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [activeTab, setActiveTab] = useState('music');

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
                  </Button>
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
          <header className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h2 className="text-xl font-semibold">
                  {activeTab === 'discover' && 'Discover'}
                  {activeTab === 'search' && 'Search'}
                  {activeTab === 'music' && 'Music'}
                  {activeTab === 'nostr' && 'Nostr Feed'}
                  {activeTab === 'feed-parser' && 'Feed Parser'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'discover' && 'Trending music and recent releases'}
                  {activeTab === 'search' && 'Find music and tracks from Podcast Index'}
                  {activeTab === 'music' && 'Discover music with Value4Value and Podcasting 2.0'}
                  {activeTab === 'nostr' && 'Music recommendations and discussions on Nostr'}
                  {activeTab === 'feed-parser' && 'Parse RSS feeds for Podcast Namespace value recipients'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              <TabsContent value="discover" className="space-y-6">
                <PodcastDiscovery />
              </TabsContent>

              <TabsContent value="search" className="space-y-6">
                <PodcastSearch />
              </TabsContent>

              <TabsContent value="music" className="space-y-6">
                <MusicDiscovery />
              </TabsContent>

              <TabsContent value="nostr" className="space-y-6">
                <NostrPodcastFeed />
              </TabsContent>

              <TabsContent value="feed-parser" className="space-y-6">
                <FeedValueParser />
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
