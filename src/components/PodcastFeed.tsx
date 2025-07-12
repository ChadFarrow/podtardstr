import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PodcastCard } from './PodcastCard';
import { RelaySelector } from './RelaySelector';
import type { NostrEvent } from '@nostrify/nostrify';

// Validator function for podcast events
function validatePodcastEvent(event: NostrEvent): boolean {
  // Check if it's a video event kind (we'll use this for audio too)
  if (![21, 1689].includes(event.kind)) return false;

  // Check for required tags
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const imeta = event.tags.find(([name]) => name === 'imeta');

  // All podcast events require 'title' and 'imeta' tags
  if (!title || !imeta) return false;

  // Check if imeta contains audio content
  const mimeType = imeta.find(attr => attr.startsWith('m '))?.split(' ')[1];
  if (mimeType && !mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) return false;

  return true;
}

export function PodcastFeed() {
  const { nostr } = useNostr();

  const { data: podcasts, isLoading, error } = useQuery({
    queryKey: ['podcasts'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Query both video events (kind 21) and our custom podcast events (kind 1689)
      // Also include events tagged with podcast-related hashtags
      const events = await nostr.query([
        { 
          kinds: [21, 1689], 
          '#t': ['podcast', 'audio', 'interview', 'talk', 'show'],
          limit: 50 
        }
      ], { signal });
      
      // Filter events through validator to ensure they meet podcast requirements
      return events.filter(validatePodcastEvent);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full">
        <Card className="border-dashed">
          <CardContent className="py-12 px-8 text-center">
            <div className="max-w-sm mx-auto space-y-6">
              <p className="text-muted-foreground">
                Failed to load podcasts. Try another relay?
              </p>
              <RelaySelector className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!podcasts || podcasts.length === 0) {
    return (
      <div className="col-span-full">
        <Card className="border-dashed">
          <CardContent className="py-12 px-8 text-center">
            <div className="max-w-sm mx-auto space-y-6">
              <p className="text-muted-foreground">
                No podcasts found. Try another relay?
              </p>
              <RelaySelector className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Latest Episodes</h3>
        <span className="text-sm text-muted-foreground">
          {podcasts.length} episode{podcasts.length !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <PodcastCard key={podcast.id} event={podcast} />
        ))}
      </div>
    </div>
  );
}