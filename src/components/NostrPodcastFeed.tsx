import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Repeat2, ExternalLink, User } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';

import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { RelaySelector } from '@/components/RelaySelector';
import { cn } from '@/lib/utils';
import type { NostrEvent } from '@nostrify/nostrify';

interface NostrPodcastFeedProps {
  className?: string;
}

function PodcastPost({ event }: { event: NostrEvent }) {
  const author = useAuthor(event.pubkey);
  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();

  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(event.pubkey);
  const profileImage = metadata?.picture;

  // Extract podcast-related tags
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const podcastTitle = event.tags.find(([name]) => name === 'podcast-title')?.[1];
  const url = event.tags.find(([name]) => name === 'r')?.[1];
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  const isRecommendation = hashtags.includes('recommendation');
  const isEpisode = hashtags.includes('episode');
  const isTrending = hashtags.includes('trending');
  const isFresh = hashtags.includes('fresh');

  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like posts.',
        variant: 'destructive',
      });
      return;
    }

    createEvent({
      kind: 7,
      content: '+',
      tags: [
        ['e', event.id],
        ['p', event.pubkey],
      ],
    });

    toast({
      title: 'Liked!',
      description: 'Your reaction has been posted.',
    });
  };

  const handleRepost = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to repost.',
        variant: 'destructive',
      });
      return;
    }

    createEvent({
      kind: 6,
      content: '',
      tags: [
        ['e', event.id],
        ['p', event.pubkey],
      ],
    });

    toast({
      title: 'Reposted!',
      description: 'The post has been shared to your followers.',
    });
  };

  const handleReply = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to reply.',
        variant: 'destructive',
      });
      return;
    }

    // For now, just show a toast. In a full implementation, this would open a reply dialog
    toast({
      title: 'Reply Feature',
      description: 'Reply functionality would be implemented here.',
    });
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImage} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{displayName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(event.created_at)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {isRecommendation && (
                <Badge variant="secondary" className="text-xs">
                  Recommendation
                </Badge>
              )}
              {isTrending && (
                <Badge variant="default" className="text-xs">
                  Trending
                </Badge>
              )}
              {isFresh && (
                <Badge variant="outline" className="text-xs">
                  Fresh
                </Badge>
              )}
              {isEpisode && (
                <Badge variant="outline" className="text-xs">
                  Episode
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="whitespace-pre-wrap break-words mb-4">
          <NoteContent event={event} className="text-sm" />
        </div>

        {(title || podcastTitle) && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            {title && (
              <h4 className="font-medium text-sm mb-1">{title}</h4>
            )}
            {podcastTitle && title !== podcastTitle && (
              <p className="text-xs text-muted-foreground mb-2">
                From: {podcastTitle}
              </p>
            )}
            {url && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.open(url, '_blank')}
                  variant="outline"
                  size="sm"
                  className="h-7"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleLike}
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <Heart className="h-4 w-4 mr-1" />
              Like
            </Button>

            <Button
              onClick={handleReply}
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply
            </Button>

            <Button
              onClick={handleRepost}
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <Repeat2 className="h-4 w-4 mr-1" />
              Repost
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {hashtags.filter(tag => !['recommendation', 'episode', 'trending', 'fresh', 'podcast'].includes(tag)).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NostrPodcastFeed({ className }: NostrPodcastFeedProps) {
  const { nostr } = useNostr();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['nostr-podcast-feed'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for podcast-related posts
      const events = await nostr.query([
        {
          kinds: [1], // Text notes
          '#t': ['podcast'], // Posts tagged with 'podcast'
          limit: 50,
        },
      ], { signal });

      // Sort by creation time (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={cn('', className)}>
        <Card className="border-dashed">
          <CardContent className="py-12 px-8 text-center">
            <div className="max-w-sm mx-auto space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Podcast Discussions Yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share a podcast recommendation or start a discussion!
                </p>
              </div>
              <RelaySelector className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {posts.map((post) => (
        <PodcastPost key={post.id} event={post} />
      ))}
    </div>
  );
}