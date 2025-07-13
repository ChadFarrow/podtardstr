// RSS Feed Parser for Podcast Namespace value-recipient tags
// Based on https://podcasting2.org/docs/podcast-namespace/tags/value-recipient

export interface ValueRecipient {
  name?: string;
  type: string;
  address: string;
  split: number;
  customKey?: string;
  customValue?: string;
  fee?: boolean;
}

export interface ValueBlock {
  type?: string;
  method?: string;
  suggested?: string;
  recipients: ValueRecipient[];
}

export interface ParsedFeed {
  title?: string;
  description?: string;
  link?: string;
  image?: string;
  author?: string;
  value?: ValueBlock;
  episodes: ParsedEpisode[];
}

export interface ParsedEpisode {
  title?: string;
  description?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  duration?: string;
  enclosure?: {
    url: string;
    type: string;
    length?: number;
  };
  value?: ValueBlock;
}

/**
 * Parses XML text and extracts podcast namespace value recipients
 */
export function parseFeedXML(xmlText: string): ParsedFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent}`);
  }

  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('Invalid RSS feed: no channel element found');
  }

  // Parse channel-level data
  const feed: ParsedFeed = {
    title: getTextContent(channel, 'title'),
    description: getTextContent(channel, 'description'),
    link: getTextContent(channel, 'link'),
    image: getTextContent(channel, 'image url') || getTextContent(channel, 'itunes\\:image', 'href'),
    author: getTextContent(channel, 'itunes\\:author') || getTextContent(channel, 'managingEditor'),
    value: parseValueBlock(channel),
    episodes: []
  };

  // Parse episodes
  const items = channel.querySelectorAll('item');
  items.forEach(item => {
    const episode: ParsedEpisode = {
      title: getTextContent(item, 'title'),
      description: getTextContent(item, 'description'),
      link: getTextContent(item, 'link'),
      guid: getTextContent(item, 'guid'),
      pubDate: getTextContent(item, 'pubDate'),
      duration: getTextContent(item, 'itunes\\:duration'),
      value: parseValueBlock(item)
    };

    // Parse enclosure
    const enclosure = item.querySelector('enclosure');
    if (enclosure) {
      episode.enclosure = {
        url: enclosure.getAttribute('url') || '',
        type: enclosure.getAttribute('type') || '',
        length: parseInt(enclosure.getAttribute('length') || '0') || undefined
      };
    }

    feed.episodes.push(episode);
  });

  return feed;
}

/**
 * Parses a podcast:value block and its nested valueRecipient elements
 */
function parseValueBlock(element: Element): ValueBlock | undefined {
  // Look for podcast:value element (with or without namespace prefix)
  const valueElement = element.querySelector('podcast\\:value, value');
  if (!valueElement) {
    return undefined;
  }

  const valueBlock: ValueBlock = {
    type: valueElement.getAttribute('type') || undefined,
    method: valueElement.getAttribute('method') || undefined,
    suggested: valueElement.getAttribute('suggested') || undefined,
    recipients: []
  };

  // Parse all podcast:valueRecipient elements
  const recipients = valueElement.querySelectorAll('podcast\\:valueRecipient, valueRecipient');
  recipients.forEach(recipient => {
    const recipientData: ValueRecipient = {
      name: recipient.getAttribute('name') || undefined,
      type: recipient.getAttribute('type') || '',
      address: recipient.getAttribute('address') || '',
      split: parseInt(recipient.getAttribute('split') || '0') || 0,
      customKey: recipient.getAttribute('customKey') || undefined,
      customValue: recipient.getAttribute('customValue') || undefined,
      fee: recipient.getAttribute('fee') === 'true' || undefined
    };

    // Only include recipients with required fields
    if (recipientData.type && recipientData.address && recipientData.split > 0) {
      valueBlock.recipients.push(recipientData);
    }
  });

  // Only return value block if it has recipients
  return valueBlock.recipients.length > 0 ? valueBlock : undefined;
}

/**
 * Helper to safely get text content from an element using CSS selector
 */
function getTextContent(parent: Element, selector: string, attribute?: string): string | undefined {
  const element = parent.querySelector(selector);
  if (!element) return undefined;
  
  if (attribute) {
    return element.getAttribute(attribute) || undefined;
  }
  
  return element.textContent?.trim() || undefined;
}

/**
 * Fetches and parses an RSS feed from a URL
 */
export async function fetchAndParseFeed(feedUrl: string): Promise<ParsedFeed> {
  try {
    // Add cache-busting parameter to avoid stale deployments
    const urlWithCacheBust = new URL(feedUrl);
    urlWithCacheBust.searchParams.set('_cb', Date.now().toString());
    const finalFeedUrl = urlWithCacheBust.toString();
    
    console.log('Fetching RSS feed:', finalFeedUrl);
    
    // Enhanced proxy list with better options
    const proxies = [
      // Primary proxy - more reliable and less rate-limited
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      // Backup proxy - good for most feeds
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      // Alternative proxy - different service
      (url: string) => `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`,
      // Last resort proxy
      (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    ];
    
    let xmlText: string | undefined;
    let lastError: Error | null = null;
    
    // Try direct fetch first with better headers
    try {
      const response = await fetch(finalFeedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; Podtardstr/1.0; RSS Parser)',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
        mode: 'cors',
      });
      
      if (response.ok) {
        xmlText = await response.text();
        console.log('Direct fetch successful');
      } else {
        throw new Error(`Direct fetch failed: ${response.status} ${response.statusText}`);
      }
    } catch (directError) {
      console.log('Direct fetch failed, trying CORS proxies:', directError);
      lastError = directError as Error;
      
      // Try each proxy in sequence with exponential backoff
      for (let i = 0; i < proxies.length; i++) {
        try {
          const proxyFn = proxies[i];
          const proxyUrl = proxyFn(finalFeedUrl);
          console.log(`Trying proxy ${i + 1}/${proxies.length}:`, proxyUrl);
          
          // Add delay between retries to avoid rate limiting
          if (i > 0) {
            const delay = Math.min(1000 * Math.pow(2, i - 1), 5000); // Exponential backoff, max 5s
            console.log(`Waiting ${delay}ms before next proxy attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, text/xml, */*',
              'User-Agent': 'Mozilla/5.0 (compatible; Podtardstr/1.0; RSS Parser)',
            },
            redirect: 'follow',
          });
          
          if (!response.ok) {
            throw new Error(`Proxy ${i + 1} failed: ${response.status} ${response.statusText}`);
          }
          
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            // Handle JSON response from allorigins.win and codetabs
            const proxyData = await response.json();
            
            // Different proxies return different JSON structures
            if (proxyData.contents) {
              xmlText = proxyData.contents;
            } else if (proxyData.data) {
              xmlText = proxyData.data;
            } else if (proxyData.body) {
              xmlText = proxyData.body;
            } else if (typeof proxyData === 'string') {
              xmlText = proxyData;
            } else {
              throw new Error('Unexpected JSON response structure from proxy');
            }
            
            if (!xmlText) {
              throw new Error('No content received from JSON proxy');
            }
          } else {
            // Handle direct XML/text response from other proxies
            xmlText = await response.text();
          }
          
          console.log(`Proxy ${i + 1} fetch successful`);
          break;
        } catch (proxyError) {
          console.log(`Proxy ${i + 1} failed:`, proxyError);
          lastError = proxyError as Error;
          
          // If this is a rate limit error, add extra delay
          if (proxyError instanceof Error && 
              (proxyError.message.includes('429') || proxyError.message.includes('rate limit'))) {
            console.log('Rate limit detected, adding extra delay...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          continue;
        }
      }
    }
    
    if (!xmlText) {
      // Return empty feed instead of throwing for better UX
      console.warn(`All fetch methods failed for ${finalFeedUrl}. Last error: ${lastError?.message}`);
      return {
        title: 'Feed Unavailable',
        description: 'Unable to fetch feed due to CORS or network issues',
        episodes: []
      };
    }
    
    // Validate that we got XML content
    const trimmedXml = xmlText.trim();
    if (!trimmedXml.startsWith('<')) {
      console.warn('Response is not valid XML, returning empty feed');
      return {
        title: 'Invalid Feed',
        description: 'Feed returned non-XML content',
        episodes: []
      };
    }
    
    console.log('Parsing RSS feed XML...');
    
    const parsedFeed = parseFeedXML(trimmedXml);
    console.log('Parsed feed successfully');
    
    return parsedFeed;
  } catch (error) {
    console.error('Error fetching and parsing feed:', error);
    // Return empty feed instead of throwing for better UX
    return {
      title: 'Feed Error',
      description: 'Error occurred while fetching or parsing feed',
      episodes: []
    };
  }
}

/**
 * Converts parsed value recipients to payment-utils compatible format
 */
export function convertToPaymentRecipients(valueBlock?: ValueBlock): Array<{
  name: string;
  address: string;
  type: string;
  split: number;
}> {
  if (!valueBlock?.recipients) {
    return [];
  }

  return valueBlock.recipients.map(recipient => ({
    name: recipient.name || 'Unknown Artist',
    address: recipient.address,
    type: recipient.type,
    split: recipient.split
  }));
}

/**
 * Validates that a feed URL appears to be a valid RSS/XML feed
 */
export function isValidFeedUrl(url: string): boolean {
  try {
    new URL(url);
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('xml') || 
           lowerUrl.includes('rss') || 
           lowerUrl.includes('feed') ||
           lowerUrl.endsWith('.xml') ||
           lowerUrl.endsWith('.rss');
  } catch {
    return false;
  }
}

/**
 * Example usage and testing function
 */
export async function testFeedParsing(): Promise<void> {
  // Example V4V music feed for testing
  const testFeedUrl = 'https://feeds.captivate.fm/podcastindex-test/';
  
  try {
    const feed = await fetchAndParseFeed(testFeedUrl);
    console.log('Test feed parsing results:');
    console.log('Feed title:', feed.title);
    console.log('Feed value block:', feed.value);
    console.log('Episodes with value:', feed.episodes.filter(e => e.value).length);
    
    if (feed.value) {
      const recipients = convertToPaymentRecipients(feed.value);
      console.log('Payment recipients:', recipients);
    }
  } catch (error) {
    console.error('Feed parsing test failed:', error);
  }
}