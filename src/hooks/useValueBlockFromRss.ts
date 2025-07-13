import { useQuery } from '@tanstack/react-query';
import { fetchAndParseFeed, convertToPaymentRecipients } from '@/lib/feed-parser';
import type { ValueDestination } from '@/lib/payment-utils';

/**
 * Hook to fetch Value4Value data from RSS feeds
 * This complements Podcast Index API data which may be incomplete
 */
export function useValueBlockFromRss(
  feedUrl?: string, 
  episodeGuid?: string,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: ['value-block-rss', feedUrl, episodeGuid],
    queryFn: async () => {
      if (!feedUrl) {
        throw new Error('Feed URL is required');
      }

      console.log('Fetching Value4Value data from RSS:', { feedUrl, episodeGuid });
      
      try {
        const parsedFeed = await fetchAndParseFeed(feedUrl);
        
        let recipients: ValueDestination[] = [];
        
        if (episodeGuid) {
          // Get episode-specific Value4Value data
          const episode = parsedFeed.episodes.find(ep => ep.guid === episodeGuid);
          if (episode?.value) {
            recipients = convertToPaymentRecipients(episode.value);
            console.log('Found episode-specific Value4Value data:', {
              episodeTitle: episode.title,
              recipientCount: recipients.length,
              recipients
            });
          }
        }
        
        // Fallback to channel-level Value4Value data if no episode-specific data
        if (recipients.length === 0 && parsedFeed.value) {
          recipients = convertToPaymentRecipients(parsedFeed.value);
          console.log('Using channel-level Value4Value data:', {
            feedTitle: parsedFeed.title,
            recipientCount: recipients.length,
            recipients
          });
        }

        return {
          recipients,
          hasValue: recipients.length > 0,
          feedTitle: parsedFeed.title,
          episodeTitle: episodeGuid ? parsedFeed.episodes.find(ep => ep.guid === episodeGuid)?.title : undefined,
          isEpisodeSpecific: episodeGuid && recipients.length > 0
        };
      } catch (error) {
        console.warn('Failed to fetch RSS feed:', feedUrl, error);
        // Return empty result instead of throwing to prevent UI errors
        return {
          recipients: [],
          hasValue: false,
          feedTitle: undefined,
          episodeTitle: undefined,
          isEpisodeSpecific: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    enabled: options.enabled !== false && !!feedUrl,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Reduce retries to avoid overwhelming proxies
    retryDelay: 2000, // Add delay between retries
  });
}

/**
 * Hook to get Value4Value data with fallback strategy:
 * 1. Try RSS feed parsing first (most complete)
 * 2. Fallback to Podcast Index API data
 */
export function useValue4ValueData(
  feedUrl?: string,
  episodeGuid?: string,
  podcastIndexData?: ValueDestination[],
  options: { enabled?: boolean } = {}
) {
  const { 
    data: rssData, 
    isLoading: rssLoading, 
    error: rssError 
  } = useValueBlockFromRss(feedUrl, episodeGuid, {
    enabled: options.enabled !== false && !!feedUrl
  });

  // Determine which data source to use
  const hasRssData = rssData?.hasValue && rssData.recipients.length > 0;
  const hasPodcastIndexData = podcastIndexData && podcastIndexData.length > 0;
  
  let finalRecipients: ValueDestination[] = [];
  let dataSource = 'none';
  
  if (hasRssData) {
    finalRecipients = rssData.recipients;
    dataSource = 'rss';
  } else if (hasPodcastIndexData) {
    finalRecipients = podcastIndexData;
    dataSource = 'podcast-index';
  }

  console.log('Value4Value data resolution:', {
    feedUrl,
    episodeGuid,
    hasRssData,
    hasPodcastIndexData,
    dataSource,
    recipientCount: finalRecipients.length,
    rssError: rssError?.message,
    rssDataError: rssData?.error
  });

  return {
    recipients: finalRecipients,
    hasValue: finalRecipients.length > 0,
    dataSource,
    isLoading: rssLoading,
    error: rssError || (rssData?.error ? new Error(rssData.error) : undefined),
    rssData,
    podcastIndexData
  };
} 