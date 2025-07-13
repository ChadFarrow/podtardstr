import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, AlertTriangle, Info, ExternalLink, Shield, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validatePodcastFeed, type ValidationResult, type ValidationError } from '@/lib/podcast-validator';
import { isValidFeedUrl } from '@/lib/feed-parser';

export function PodcastValidator() {
  const [feedUrl, setFeedUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim() || !isValidFeedUrl(feedUrl.trim())) return;

    setIsValidating(true);
    try {
      const validationResult = await validatePodcastFeed(feedUrl.trim());
      setResult(validationResult);
    } catch (error) {
      setResult({
        isValid: false,
        errors: [{
          level: 'error',
          code: 'VALIDATION_FAILED',
          message: error instanceof Error ? error.message : 'Validation failed',
        }],
        warnings: [],
        info: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getErrorIcon = (level: ValidationError['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getErrorVariant = (level: ValidationError['level']) => {
    switch (level) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      case 'info':
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Podcast Namespace Validator
          </CardTitle>
          <CardDescription>
            Comprehensive validation for RSS feeds and Podcast Namespace compliance (inspired by RSS Blue)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleValidate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="validatorUrl">RSS Feed URL</Label>
              <div className="flex gap-2">
                <Input
                  id="validatorUrl"
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!feedUrl.trim() || !isValidFeedUrl(feedUrl.trim()) || isValidating}
                >
                  {isValidating ? 'Validating...' : 'Validate Feed'}
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

      {/* External RSS Blue Link */}
      <Card className="border-dashed">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Official RSS Blue Validator</h4>
              <p className="text-sm text-muted-foreground">
                The original gold standard validator (external service)
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('https://tools.rssblue.com', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open RSS Blue
            </Button>
          </div>
        </CardContent>
      </Card>

      {isValidating && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      )}

      {result && !isValidating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Validation Results
            </CardTitle>
            <CardDescription>
              {result.isValid 
                ? 'Feed passed validation with no errors' 
                : `Found ${result.errors.length} error(s) and ${result.warnings.length} warning(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feed Information */}
            {result.feedInfo && (
              <div>
                <h4 className="font-semibold mb-3">Feed Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Title:</strong> {result.feedInfo.title || 'Not specified'}</p>
                    <p><strong>Author:</strong> {result.feedInfo.author || 'Not specified'}</p>
                    <p><strong>Language:</strong> {result.feedInfo.language || 'Not specified'}</p>
                  </div>
                  <div>
                    <p><strong>Episodes:</strong> {result.feedInfo.episodeCount}</p>
                    <p><strong>Categories:</strong> {result.feedInfo.categories?.join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Namespace Support */}
            {result.namespaceSupport && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Podcast Namespace Support</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={result.namespaceSupport.podcastNamespace ? 'default' : 'secondary'}>
                      {result.namespaceSupport.podcastNamespace ? '✓' : '✗'} Podcast Namespace
                    </Badge>
                    <Badge variant={result.namespaceSupport.valueSupport ? 'default' : 'secondary'}>
                      <Zap className="h-3 w-3 mr-1" />
                      {result.namespaceSupport.valueSupport ? '✓' : '✗'} Value4Value
                    </Badge>
                    <Badge variant={result.namespaceSupport.chaptersSupport ? 'default' : 'secondary'}>
                      {result.namespaceSupport.chaptersSupport ? '✓' : '✗'} Chapters
                    </Badge>
                    <Badge variant={result.namespaceSupport.transcriptSupport ? 'default' : 'secondary'}>
                      {result.namespaceSupport.transcriptSupport ? '✓' : '✗'} Transcripts
                    </Badge>
                    <Badge variant={result.namespaceSupport.socialInteract ? 'default' : 'secondary'}>
                      {result.namespaceSupport.socialInteract ? '✓' : '✗'} Social Interact
                    </Badge>
                    <Badge variant={result.namespaceSupport.alternateEnclosure ? 'default' : 'secondary'}>
                      {result.namespaceSupport.alternateEnclosure ? '✓' : '✗'} Alt Enclosures
                    </Badge>
                  </div>
                </div>
              </>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Errors ({result.errors.length})</h4>
                  <div className="space-y-2">
                    {result.errors.map((error, index) => (
                      <Alert key={index} variant={getErrorVariant(error.level)}>
                        {getErrorIcon(error.level)}
                        <AlertDescription>
                          <strong>{error.code}:</strong> {error.message}
                          {error.element && <span className="block text-xs mt-1">Element: {error.element}</span>}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-yellow-600">Warnings ({result.warnings.length})</h4>
                  <div className="space-y-2">
                    {result.warnings.map((warning, index) => (
                      <Alert key={index} variant={getErrorVariant(warning.level)}>
                        {getErrorIcon(warning.level)}
                        <AlertDescription>
                          <strong>{warning.code}:</strong> {warning.message}
                          {warning.element && <span className="block text-xs mt-1">Element: {warning.element}</span>}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Info */}
            {result.info.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">Information ({result.info.length})</h4>
                  <div className="space-y-2">
                    {result.info.map((info, index) => (
                      <Alert key={index} variant={getErrorVariant(info.level)}>
                        {getErrorIcon(info.level)}
                        <AlertDescription>
                          <strong>{info.code}:</strong> {info.message}
                          {info.element && <span className="block text-xs mt-1">Element: {info.element}</span>}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}