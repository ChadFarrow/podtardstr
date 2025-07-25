import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Zap, Users, Podcast, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFeedParser, useChannelValueRecipients, useValueSupport, usePodcastIndexFeedData } from '@/hooks/useFeedParser';
import { getLightningRecipients } from '@/lib/payment-utils';
import { isValidFeedUrl } from '@/lib/feed-parser';
import { formatEpisodeDescription } from '@/lib/utils';

export function FeedValueParser() {
  const [feedUrl, setFeedUrl] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedUrl.trim() && isValidFeedUrl(feedUrl.trim())) {
      setSubmittedUrl(feedUrl.trim());
    }
  };

  const {
    data: recipients,
    isLoading: isLoadingRecipients,
    error: recipientsError,
    hasValue,
    valueBlock
  } = useChannelValueRecipients(submittedUrl, { enabled: !!submittedUrl });

  const {
    data: feed,
    isLoading: isLoadingFeed,
    error: feedError
  } = useFeedParser(submittedUrl, { enabled: !!submittedUrl });

  const {
    hasChannelValue,
    hasEpisodeValue,
    totalRecipients,
    supportedTypes
  } = useValueSupport(submittedUrl, { enabled: !!submittedUrl });

  const {
    data: podcastIndexData,
    isLoading: isLoadingPodcastIndex,
    error: podcastIndexError
  } = usePodcastIndexFeedData(submittedUrl, { enabled: !!submittedUrl });

  const isLoading = isLoadingRecipients || isLoadingFeed;
  const error = recipientsError || feedError;

  // Get payable recipients (filtered for Lightning support)
  const payableRecipients = recipients ? getLightningRecipients(recipients) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Podcast className="h-5 w-5" />
            RSS Feed Value Recipient Parser
          </CardTitle>
          <CardDescription>
            Parse Podcast Namespace value-recipient tags from RSS feeds to extract Lightning payment splits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedUrl">RSS Feed URL</Label>
              <div className="flex gap-2">
                <Input
                  id="feedUrl"
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!feedUrl.trim() || !isValidFeedUrl(feedUrl.trim())}
                >
                  Parse Feed
                </Button>
              </div>
              {feedUrl && !isValidFeedUrl(feedUrl) && (
                <p className="text-sm text-muted-foreground">
                  Enter a valid RSS/XML feed URL
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {submittedUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Feed Analysis
            </CardTitle>
            <CardDescription>
              Value4Value support and recipient information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to parse feed: {error.message}
                </AlertDescription>
              </Alert>
            )}

            {feed && !isLoading && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Basic Feed Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p><strong>Title:</strong> {feed.title || 'Not specified'}</p>
                      <p><strong>Author:</strong> {feed.author || 'Not specified'}</p>
                      <p><strong>Description:</strong> {feed.description ? formatEpisodeDescription(feed.description, 100) : 'Not specified'}</p>
                      <p><strong>Link:</strong> {feed.link ? (
                        <a href={feed.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">
                          {feed.link}
                        </a>
                      ) : 'Not specified'}</p>
                      <p><strong>Episodes:</strong> {feed.episodes.length}</p>
                      <p><strong>Image:</strong> {feed.image ? (
                        <a href={feed.image} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">
                          View Image
                        </a>
                      ) : 'Not specified'}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Episodes Found:</strong> {feed.episodes.length}</p>
                      <p><strong>Feed URL:</strong> 
                        <a 
                          href={submittedUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
                        >
                          {submittedUrl.length > 40 ? submittedUrl.substring(0, 40) + '...' : submittedUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show episodes if found */}
                {feed.episodes && feed.episodes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Episodes ({feed.episodes.length})</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {feed.episodes.slice(0, 10).map((episode, index) => (
                        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h5 className="font-semibold text-sm leading-tight flex-1">{episode.title}</h5>
                              {episode.pubDate && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                                  {new Date(episode.pubDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {episode.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {formatEpisodeDescription(episode.description, 200)}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs">
                              {episode.link && (
                                <a href={episode.link} target="_blank" rel="noopener noreferrer" 
                                   className="text-cyan-400 hover:text-cyan-300 hover:underline bg-cyan-50 dark:bg-cyan-950/30 px-2 py-1 rounded">
                                  Episode Link
                                </a>
                              )}
                              {episode.enclosure?.url && (
                                <a href={episode.enclosure.url} target="_blank" rel="noopener noreferrer" 
                                   className="text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
                                  Audio File
                                </a>
                              )}
                              {episode.duration && (
                                <span className="text-muted-foreground bg-muted px-2 py-1 rounded">
                                  Duration: {episode.duration}
                                </span>
                              )}
                            </div>
                            {episode.value && episode.value.recipients && episode.value.recipients.length > 0 && (
                              <div className="text-xs bg-muted dark:bg-muted/30 p-2 rounded border-l-2 border-muted">
                                <span className="font-medium text-foreground dark:text-foreground">Episode V4V Recipients:</span>
                                <div className="mt-1 text-muted-foreground dark:text-muted-foreground">
                                  {episode.value.recipients.map(r => r.name).join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                      {feed.episodes.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center">
                          Showing first 10 of {feed.episodes.length} episodes
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Value4Value Support</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={hasValue ? 'default' : 'secondary'}>
                      {hasValue ? 'V4V Enabled' : 'No V4V'}
                    </Badge>
                    {hasChannelValue && (
                      <Badge variant="outline">Channel Recipients</Badge>
                    )}
                    {hasEpisodeValue && (
                      <Badge variant="outline">Episode Recipients</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Total Recipients:</strong> {totalRecipients}</p>
                    <p><strong>Payable Recipients:</strong> {payableRecipients.length}</p>
                    {supportedTypes.length > 0 && (
                      <p><strong>Recipient Types:</strong> {supportedTypes.join(', ')}</p>
                    )}
                  </div>
                </div>

                {valueBlock && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Value Block Configuration</h4>
                      <div className="text-sm space-y-1">
                        {valueBlock.type && <p><strong>Type:</strong> {valueBlock.type}</p>}
                        {valueBlock.method && <p><strong>Method:</strong> {valueBlock.method}</p>}
                        {valueBlock.suggested && <p><strong>Suggested:</strong> {valueBlock.suggested}</p>}
                      </div>
                    </div>
                  </>
                )}

                {recipients && recipients.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Value Recipients ({recipients.length})
                      </h4>
                      <div className="space-y-3">
                        {recipients.map((recipient, index) => (
                          <Card key={index} className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{recipient.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Split: {recipient.split}%
                                  </p>
                                </div>
                                <Badge 
                                  variant={
                                    ['lud16', 'lud06'].includes(recipient.type) ? 'default' : 
                                    ['node', 'keysend'].includes(recipient.type) ? 'secondary' : 
                                    'destructive'
                                  }
                                >
                                  {recipient.type}
                                </Badge>
                              </div>
                              <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                                {recipient.address}
                              </div>
                              {!payableRecipients.some(p => p.address === recipient.address) && (
                                <p className="text-xs text-yellow-600">
                                  ⚠️ Not currently payable (unsupported type or invalid address)
                                </p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {recipients && recipients.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No value recipients found in this feed. The feed may not support Value4Value payments.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Podcast Index API Data */}
      {submittedUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Podcast className="h-5 w-5" />
              Podcast Index API Data
            </CardTitle>
            <CardDescription>
              Complete metadata and information from the Podcast Index API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPodcastIndex && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {podcastIndexError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Could not fetch data from Podcast Index API: {String(podcastIndexError.message || 'Unknown error')}
                </AlertDescription>
              </Alert>
            )}

            {podcastIndexData && !isLoadingPodcastIndex && (
              <div className="space-y-4">
                {podcastIndexData.feed ? (
                  <div>
                    <h4 className="font-semibold mb-3">Complete Feed Metadata</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-xs overflow-auto max-h-96">
                        {JSON.stringify(podcastIndexData.feed, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This feed was not found in the Podcast Index API database. It may be a new feed or not yet indexed.
                    </AlertDescription>
                  </Alert>
                )}

                {podcastIndexData.query && (
                  <div>
                    <h4 className="font-semibold mb-2">API Query Info</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Status:</strong> {String(podcastIndexData.status || 'Unknown')}</p>
                      <p><strong>Query:</strong> {String(podcastIndexData.query || 'Unknown')}</p>
                      {podcastIndexData.description && (
                        <p><strong>Description:</strong> {String(podcastIndexData.description)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}