import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Clock, Calendar, User } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import type { NostrEvent } from '@nostrify/nostrify';

interface PodcastCardProps {
  event: NostrEvent;
}

export function PodcastCard({ event }: PodcastCardProps) {
  const author = useAuthor(event.pubkey);
  const { playPodcast } = usePodcastPlayer();
  
  // Extract metadata from tags
  const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Episode';
  const duration = event.tags.find(([name]) => name === 'duration')?.[1];
  const publishedAt = event.tags.find(([name]) => name === 'published_at')?.[1];
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);
  
  // Extract audio/video URL from imeta tag
  const imetaTag = event.tags.find(([name]) => name === 'imeta');
  const audioUrl = imetaTag?.find(attr => attr.startsWith('url '))?.split(' ')[1];
  const mimeType = imetaTag?.find(attr => attr.startsWith('m '))?.split(' ')[1];
  const imageUrl = imetaTag?.find(attr => attr.startsWith('image '))?.split(' ')[1];
  
  const displayName = author.data?.metadata?.name ?? genUserName(event.pubkey);
  const profileImage = author.data?.metadata?.picture;
  
  const formatDuration = (seconds: string | undefined) => {
    if (!seconds) return null;
    const mins = Math.floor(parseInt(seconds) / 60);
    const secs = parseInt(seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return null;
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const handlePlay = () => {
    if (audioUrl) {
      playPodcast({
        id: event.id,
        title,
        author: displayName,
        url: audioUrl,
        imageUrl,
        duration: duration ? parseInt(duration) : undefined,
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="relative">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Play className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
              {title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Avatar className="h-4 w-4">
                <AvatarImage src={profileImage} />
                <AvatarFallback>
                  <User className="h-2 w-2" />
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{displayName}</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(duration)}</span>
                </div>
              )}
              {publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(publishedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {event.content && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {event.content}
          </p>
        )}
        
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hashtags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {hashtags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{hashtags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <Button 
          onClick={handlePlay}
          disabled={!audioUrl}
          className="w-full"
          size="sm"
        >
          <Play className="h-4 w-4 mr-2" />
          Play Episode
        </Button>
        
        {mimeType && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {mimeType.includes('audio') ? 'Audio' : 'Video'} • {mimeType}
          </p>
        )}
      </CardContent>
    </Card>
  );
}