import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';

interface PublishPodcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublishPodcastDialog({ open, onOpenChange }: PublishPodcastDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    currentTag: '',
    duration: '',
    episodeNumber: '',
    seasonNumber: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useCurrentUser();
  const { mutate: createEvent } = useNostrPublish();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { toast } = useToast();

  const handleAddTag = () => {
    const tag = formData.currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        currentTag: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to publish episodes.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your episode.',
        variant: 'destructive',
      });
      return;
    }

    if (!audioFile) {
      toast({
        title: 'Audio File Required',
        description: 'Please select an audio file for your episode.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload audio file
      const audioTags = await uploadFile(audioFile);

      // Upload image file if provided
      let imageTags: string[][] = [];
      if (imageFile) {
        imageTags = await uploadFile(imageFile);
      }

      // Create event tags
      const eventTags: string[][] = [
        ['title', formData.title],
        ['t', 'podcast'],
        ['t', 'episode'],
        ...formData.tags.map(tag => ['t', tag]),
        ...audioTags, // NIP-94 file metadata tags
      ];

      // Add optional metadata
      if (formData.duration) {
        eventTags.push(['duration', formData.duration]);
      }
      if (formData.episodeNumber) {
        eventTags.push(['episode', formData.episodeNumber]);
      }
      if (formData.seasonNumber) {
        eventTags.push(['season', formData.seasonNumber]);
      }
      if (imageTags.length > 0) {
        eventTags.push(['image', imageTags[0][1]]);
      }

      // Add current timestamp as published_at
      eventTags.push(['published_at', Math.floor(Date.now() / 1000).toString()]);

      // Create the podcast episode event (using kind 1 for now, could use a custom kind)
      createEvent({
        kind: 1,
        content: formData.description,
        tags: eventTags,
      });

      toast({
        title: 'Episode Published!',
        description: 'Your podcast episode has been published on Nostr.',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        tags: [],
        currentTag: '',
        duration: '',
        episodeNumber: '',
        seasonNumber: '',
      });
      setAudioFile(null);
      setImageFile(null);
      onOpenChange(false);

    } catch (error) {
      console.error('Error publishing episode:', error);
      toast({
        title: 'Publishing Failed',
        description: 'There was an error publishing your episode. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish Podcast Episode</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Episode Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter episode title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your episode..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="episode">Episode #</Label>
              <Input
                id="episode"
                type="number"
                value={formData.episodeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, episodeNumber: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="season">Season #</Label>
              <Input
                id="season"
                type="number"
                value={formData.seasonNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, seasonNumber: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="3600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={formData.currentTag}
                onChange={(e) => setFormData(prev => ({ ...prev, currentTag: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="Add tags (press Enter)"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio">Audio File *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="audio"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">
                    {audioFile ? audioFile.name : 'Choose audio file'}
                  </span>
                  {audioFile && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(audioFile.size)}
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Episode Image (optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">
                    {imageFile ? imageFile.name : 'Choose image file'}
                  </span>
                  {imageFile && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(imageFile.size)}
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !user}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Episode'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}