import { useQuery } from '@tanstack/react-query';
import { fetchValueBlockFromRss, type ValueBlock } from '@/lib/fetchValueBlockFromRss';

/**
 * Hook to fetch Value4Value block from a podcast's RSS feed
 */
export function useValueBlockFromRss(rssUrl?: string) {
  return useQuery({
    queryKey: ['valueBlock', rssUrl],
    queryFn: async () => {
      if (!rssUrl) return null;
      return await fetchValueBlockFromRss(rssUrl);
    },
    enabled: !!rssUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 