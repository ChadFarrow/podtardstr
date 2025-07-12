import { useSeoMeta } from '@unhead/react';
import { PodcastFeed } from '@/components/PodcastFeed';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { PodcastSearch } from '@/components/PodcastSearch';
import { PodcastDiscovery } from '@/components/PodcastDiscovery';
import { NostrPodcastFeed } from '@/components/NostrPodcastFeed';
import { LoginArea } from '@/components/auth/LoginArea';
import { RelaySelector } from '@/components/RelaySelector';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Radio, Upload, Search, TrendingUp, MessageSquare, Rss } from 'lucide-react';
import { useState } from 'react';
import { PublishPodcastDialog } from '@/components/PublishPodcastDialog';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useSeoMeta({
    title: 'NostrCast - Decentralized Podcasting',
    description: 'Discover podcasts from Podcast Index and share recommendations on Nostr. A decentralized podcasting platform built with React and Nostrify.',
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Radio className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">NostrCast</h1>
                <p className="text-xs text-muted-foreground">Podcast Index + Nostr</p>
              </div>
            </div>

            <div className="space-y-4">
              <LoginArea className="w-full" />

              <Button
                onClick={() => setShowPublishDialog(true)}
                className="w-full"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Publish Episode
              </Button>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Relay</h3>
                <RelaySelector className="w-full" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
                <div className="space-y-2">
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
                    variant={activeTab === 'published' ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('published')}
                  >
                    <Rss className="h-4 w-4 mr-2" />
                    Published
                  </Button>
                </div>
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
                  {activeTab === 'discover' && 'Discover Podcasts'}
                  {activeTab === 'search' && 'Search Podcast Index'}
                  {activeTab === 'nostr' && 'Nostr Discussions'}
                  {activeTab === 'published' && 'Published Episodes'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'discover' && 'Trending podcasts and recent episodes'}
                  {activeTab === 'search' && 'Find podcasts and episodes from Podcast Index'}
                  {activeTab === 'nostr' && 'Podcast recommendations and discussions on Nostr'}
                  {activeTab === 'published' && 'Episodes published on Nostr'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="discover" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="nostr" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Nostr
                </TabsTrigger>
                <TabsTrigger value="published" className="flex items-center gap-2">
                  <Rss className="h-4 w-4" />
                  Published
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="space-y-6">
                <PodcastDiscovery />
              </TabsContent>

              <TabsContent value="search" className="space-y-6">
                <PodcastSearch />
              </TabsContent>

              <TabsContent value="nostr" className="space-y-6">
                <NostrPodcastFeed />
              </TabsContent>

              <TabsContent value="published" className="space-y-6">
                <PodcastFeed />
              </TabsContent>
            </Tabs>
          </main>

          <PodcastPlayer />
        </div>
      </div>

      <PublishPodcastDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
      />
    </SidebarProvider>
  );
};

export default Index;
