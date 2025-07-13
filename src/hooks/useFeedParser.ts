import { useQuery } from '@tanstack/react-query';
import { fetchAndParseFeed, convertToPaymentRecipients, type ParsedFeed, type ValueRecipient } from '@/lib/feed-parser';
import type { ValueDestination } from '@/lib/payment-utils';

/**
 * Hook to fetch and parse an RSS feed for value recipients
 */
export function useFeedParser(feedUrl: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['feed-parser', feedUrl],
    queryFn: async () => {
      if (!feedUrl) {
        throw new Error('Feed URL is required');
      }

      console.log('Parsing feed with URL:', feedUrl);
      const parsedFeed = await fetchAndParseFeed(feedUrl);
      
      console.log('Parsed feed result:', {
        title: parsedFeed.title,
        hasValue: !!parsedFeed.value,
        recipientCount: parsedFeed.value?.recipients.length || 0,
        episodeCount: parsedFeed.episodes.length,
        episodesWithValue: parsedFeed.episodes.filter(e => e.value).length
      });

      return parsedFeed;
    },
    enabled: options.enabled !== false && !!feedUrl,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to get comprehensive feed data from Podcast Index API
 */
export function usePodcastIndexFeedData(feedUrl: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['podcast-index-feed-data', feedUrl],
    queryFn: async () => {
      if (!feedUrl) {
        throw new Error('Feed URL is required');
      }

      // Import the podcastIndexFetch function and types
      const { podcastIndexFetch } = await import('@/hooks/usePodcastIndex');
      type PodcastIndexPodcast = import('@/hooks/usePodcastIndex').PodcastIndexPodcast;
      
      try {
        // Try to find the feed by searching for the URL
        const searchResponse = await podcastIndexFetch<PodcastIndexPodcast>('/search/byterm', {
          q: feedUrl,
          max: '10',
        });

        console.log('Podcast Index API search response:', searchResponse);
        
        // Look for a feed that matches our URL
        const matchingFeed = searchResponse.feeds?.find((feed: PodcastIndexPodcast) => 
          feed.url === feedUrl || feed.originalUrl === feedUrl || feed.link === feedUrl
        );

        if (matchingFeed) {
          // If we found a matching feed, get the full details by feed ID
          const feedResponse = await podcastIndexFetch<PodcastIndexPodcast>('/podcasts/byfeedid', {
            id: matchingFeed.id.toString(),
          });
          
          console.log('Podcast Index API feed details:', feedResponse);
          return {
            ...feedResponse,
            feed: feedResponse.feeds?.[0] || null,
          };
        }

        // Return search results if no exact match found
        return {
          ...searchResponse,
          feed: null,
        };
      } catch (error) {
        console.error('Failed to fetch from Podcast Index API:', error);
        return {
          status: 'error',
          feeds: [],
          count: 0,
          query: feedUrl,
          description: 'Failed to fetch from Podcast Index API',
          feed: null,
        };
      }
    },
    enabled: options.enabled !== false && !!feedUrl,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

/**
 * Hook to get value recipients from a specific episode in a feed
 */
export function useEpisodeValueRecipients(
  feedUrl: string, 
  episodeGuid: string, 
  options: { enabled?: boolean } = {}
) {
  const { data: feed, ...queryResult } = useFeedParser(feedUrl, options);

  const episode = feed?.episodes.find(ep => ep.guid === episodeGuid);
  const recipients = episode?.value ? convertToPaymentRecipients(episode.value) : [];

  return {
    ...queryResult,
    data: recipients,
    episode,
    hasValue: !!episode?.value,
  };
}

/**
 * Hook to get channel-level value recipients from a feed
 */
export function useChannelValueRecipients(feedUrl: string, options: { enabled?: boolean } = {}) {
  const { data: feed, ...queryResult } = useFeedParser(feedUrl, options);

  const recipients = feed?.value ? convertToPaymentRecipients(feed.value) : [];

  return {
    ...queryResult,
    data: recipients,
    hasValue: !!feed?.value,
    valueBlock: feed?.value,
  };
}

/**
 * Hook to get combined value recipients (channel + episode specific)
 * This follows the Value4Value spec where episode recipients can override channel recipients
 */
export function useCombinedValueRecipients(
  feedUrl: string,
  episodeGuid?: string,
  options: { enabled?: boolean } = {}
) {
  const { data: feed, ...queryResult } = useFeedParser(feedUrl, options);

  let recipients: Array<{
    name: string;
    address: string;
    type: string;
    split: number;
  }> = [];

  if (feed) {
    // Start with channel-level recipients
    if (feed.value) {
      recipients = convertToPaymentRecipients(feed.value);
    }

    // Override with episode-specific recipients if available
    if (episodeGuid) {
      const episode = feed.episodes.find(ep => ep.guid === episodeGuid);
      if (episode?.value) {
        recipients = convertToPaymentRecipients(episode.value);
      }
    }
  }

  return {
    ...queryResult,
    data: recipients,
    isChannelLevel: !episodeGuid || !feed?.episodes.find(ep => ep.guid === episodeGuid)?.value,
    hasValue: recipients.length > 0,
  };
}

/**
 * Convert Value4Value recipients to the format expected by payment-utils
 */
export function convertToValueDestinations(recipients: ValueRecipient[]): ValueDestination[] {
  return recipients.map(recipient => ({
    name: recipient.name || 'Unknown Artist',
    address: recipient.address,
    type: recipient.type,
    split: recipient.split,
  }));
}

/**
 * Utility to validate if a feed supports Value4Value
 */
export function useValueSupport(feedUrl: string, options: { enabled?: boolean } = {}) {
  const { data: feed, isLoading, error } = useFeedParser(feedUrl, options);

  const hasChannelValue = !!feed?.value?.recipients.length;
  const hasEpisodeValue = feed?.episodes.some(ep => ep.value?.recipients.length) || false;
  const totalRecipients = (feed?.value?.recipients.length || 0) + 
    (feed?.episodes.reduce((sum, ep) => sum + (ep.value?.recipients.length || 0), 0) || 0);

  return {
    isLoading,
    error,
    hasValue: hasChannelValue || hasEpisodeValue,
    hasChannelValue,
    hasEpisodeValue,
    totalRecipients,
    supportedTypes: feed ? getSupportedRecipientTypes(feed) : [],
  };
}

/**
 * Helper to get all supported recipient types from a feed
 */
function getSupportedRecipientTypes(feed: ParsedFeed): string[] {
  const types = new Set<string>();
  
  // Channel recipients
  feed.value?.recipients.forEach(r => types.add(r.type));
  
  // Episode recipients
  feed.episodes.forEach(episode => {
    episode.value?.recipients.forEach(r => types.add(r.type));
  });

  return Array.from(types);
}