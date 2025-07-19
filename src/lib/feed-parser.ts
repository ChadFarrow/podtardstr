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

export interface PodRollItem {
  feedGuid?: string;
  feedUrl?: string;
  title: string;
  description?: string;
  image?: string;
  author?: string;
}

export interface ParsedFeed {
  title?: string;
  description?: string;
  link?: string;
  image?: string;
  author?: string;
  value?: ValueBlock;
  podroll?: PodRollItem[];
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
 * Fetches artwork from a PodRoll RSS feed URL
 */
async function fetchPodRollArtwork(feedUrl: string): Promise<string | undefined> {
  try {
    console.log(`🎨 fetchPodRollArtwork: Fetching ${feedUrl}`);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Use our existing RSS proxy to fetch the feed
    const proxyUrl = `/api/rss-proxy?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(proxyUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // Parse the XML to extract iTunes image
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    const channel = doc.querySelector('channel');
    if (!channel) {
      throw new Error('No channel element found');
    }
    
    // Use our existing getChannelImage function
    const artwork = getChannelImage(channel);
    
    if (artwork) {
      console.log(`🎨 Found artwork: ${artwork}`);
      return artwork;
    } else {
      console.log(`🎨 No artwork found in feed`);
      return undefined;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`🎨 Timeout fetching artwork from ${feedUrl}`);
    } else {
      console.error(`🎨 Error fetching PodRoll artwork from ${feedUrl}:`, error);
    }
    return undefined;
  }
}

/**
 * Parses XML text and extracts podcast namespace value recipients
 */
export async function parseFeedXML(xmlText: string): Promise<ParsedFeed> {
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
    image: getChannelImage(channel),
    author: getTextContent(channel, 'itunes\\:author') || getTextContent(channel, 'managingEditor'),
    value: parseValueBlock(channel),
    podroll: await parsePodRoll(channel),
    episodes: []
  };

  // Parse episodes
  const items = channel.querySelectorAll('item');
  items.forEach((item, index) => {
    const duration = getTextContent(item, 'itunes\\:duration');
    console.log(`Feed parser: Track ${index + 1} duration extracted: "${duration}"`);
    
    const episode: ParsedEpisode = {
      title: getTextContent(item, 'title'),
      description: getTextContent(item, 'description'),
      link: getTextContent(item, 'link'),
      guid: getTextContent(item, 'guid'),
      pubDate: getTextContent(item, 'pubDate'),
      duration: duration,
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
 * Parses podcast:podroll elements and extracts podcast recommendations
 */
async function parsePodRoll(element: Element): Promise<PodRollItem[] | undefined> {
  console.log('🎯 parsePodRoll: Starting PodRoll parsing...');
  
  // Look for podcast:podroll element (with or without namespace prefix)
  const podrollElement = element.querySelector('podcast\\:podroll, podroll');
  console.log('🎯 parsePodRoll: PodRoll element found:', !!podrollElement);
  
  let actualPodrollElement = podrollElement;
  
  if (!podrollElement) {
    // Try alternative approaches to find the podroll element
    const allElements = element.querySelectorAll('*');
    let foundPodroll = null;
    for (const el of Array.from(allElements)) {
      if (el.tagName.toLowerCase().includes('podroll')) {
        console.log('🎯 parsePodRoll: Found podroll via tagName search:', el.tagName);
        foundPodroll = el;
        break;
      }
    }
    if (!foundPodroll) {
      console.log('❌ parsePodRoll: No podcast:podroll element found');
      return undefined;
    } else {
      // Use the found element
      console.log('✅ parsePodRoll: Using fallback podroll element');
      actualPodrollElement = foundPodroll;
    }
  }

  const podrollItems: PodRollItem[] = [];

  // Parse all podcast:remoteItem elements within the podroll
  const remoteItems = actualPodrollElement.querySelectorAll('podcast\\:remoteItem, remoteItem');
  console.log('🎯 parsePodRoll: Found', remoteItems.length, 'remoteItem elements');
  
  // Prepare all items first
  const itemsToProcess: Array<{
    index: number;
    feedGuid?: string;
    feedUrl?: string;
    title: string;
    description?: string;
    image?: string;
    author?: string;
  }> = [];
  
  Array.from(remoteItems).forEach((item, index) => {
    const feedGuid = item.getAttribute('feedGuid') || undefined;
    const feedUrl = item.getAttribute('feedUrl') || undefined;
    const title = item.textContent?.trim() || item.getAttribute('title') || '';
    
    // Additional attributes that might be present
    const description = item.getAttribute('description') || undefined;
    const image = item.getAttribute('image') || undefined;
    const author = item.getAttribute('author') || undefined;
    
    console.log(`🎯 parsePodRoll: Processing remoteItem ${index + 1}:`, {
      feedGuid: feedGuid?.substring(0, 20) + '...',
      feedUrl: feedUrl?.substring(0, 50) + '...',
      title,
      hasTextContent: !!item.textContent?.trim(),
      tagName: item.tagName,
      image: image || 'none',
      description: description || 'none',
      author: author || 'none'
    });

    // Include items with either feedGuid or feedUrl
    if (feedGuid || feedUrl) {
      itemsToProcess.push({
        index,
        feedGuid,
        feedUrl,
        title: title || `Recommended Podcast ${index + 1}`,
        description,
        image,
        author
      });
    } else {
      console.log(`❌ parsePodRoll: Skipping item ${index + 1} - no feedGuid or feedUrl`);
    }
  });

  // Fetch artwork for all items in parallel with Promise.allSettled
  const artworkPromises = itemsToProcess.map(async (item) => {
    if (item.feedUrl && !item.image) {
      console.log(`🎯 Attempting to fetch iTunes artwork for: "${item.title}" from ${item.feedUrl}`);
      return await fetchPodRollArtwork(item.feedUrl);
    }
    return item.image;
  });

  const artworkResults = await Promise.allSettled(artworkPromises);
  
  // Process results and build final items array
  itemsToProcess.forEach((item, index) => {
    let finalImage = item.image;
    
    // Get artwork result
    const artworkResult = artworkResults[index];
    if (artworkResult.status === 'fulfilled' && artworkResult.value) {
      finalImage = artworkResult.value;
      console.log(`✅ Found iTunes artwork for "${item.title}": ${artworkResult.value}`);
    } else if (artworkResult.status === 'rejected') {
      console.log(`❌ Failed to fetch artwork for "${item.title}":`, artworkResult.reason);
    }
    
    // Generate fallback artwork if still no image
    if (!finalImage) {
      const fallbackImages = [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&auto=format', // Banjo
        'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&h=300&fit=crop&auto=format', // Drums
        'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop&auto=format', // Guitar
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&auto=format', // Beach/indie
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&auto=format', // String instrument
        'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop&auto=format'  // Microphone
      ];
      finalImage = fallbackImages[item.index % fallbackImages.length];
      console.log(`🎵 Using fallback image ${item.index % fallbackImages.length + 1} for: "${item.title}"`);
    }
    
    console.log(`✅ parsePodRoll: Adding item ${item.index + 1} with title: "${item.title}"`);
    podrollItems.push({
      feedGuid: item.feedGuid,
      feedUrl: item.feedUrl,
      title: item.title,
      description: item.description,
      image: finalImage,
      author: item.author
    });
  });

  console.log(`🎯 PodRoll parsing result: Found ${podrollItems.length} items`);
  if (podrollItems.length > 0) {
    console.log('🎯 PodRoll items:', podrollItems);
  } else {
    console.log('❌ No PodRoll items found - check if podcast:podroll exists or if remoteItems have required attributes');
  }
  
  return podrollItems.length > 0 ? podrollItems : undefined;
}

/**
 * Helper to safely get text content from an element using CSS selector
 */
function getTextContent(parent: Element, selector: string, attribute?: string): string | undefined {
  const element = parent.querySelector(selector);
  if (!element) {
    if (selector.includes('duration')) {
      console.log(`getTextContent: No element found for selector "${selector}"`);
      // Try alternative selectors for duration
      const altSelectors = ['duration', 'itunes:duration', '*[class*="duration"]'];
      for (const altSelector of altSelectors) {
        const altElement = parent.querySelector(altSelector);
        if (altElement) {
          console.log(`getTextContent: Found duration with alternative selector "${altSelector}": "${altElement.textContent?.trim()}"`);
          return altElement.textContent?.trim() || undefined;
        }
      }
    }
    return undefined;
  }
  
  if (attribute) {
    return element.getAttribute(attribute) || undefined;
  }
  
  const result = element.textContent?.trim() || undefined;
  if (selector.includes('duration')) {
    console.log(`getTextContent: Found duration with selector "${selector}": "${result}"`);
  }
  return result;
}

/**
 * Helper to extract channel image with better fallback handling
 */
function getChannelImage(channel: Element): string | undefined {
  // Try multiple image sources in order of preference
  const imageSources = [
    // Standard RSS image with url child element
    () => getTextContent(channel, 'image url'),
    // iTunes image with href attribute - try multiple selector formats
    () => getTextContent(channel, 'itunes\\:image', 'href'),
    () => {
      // Alternative iTunes selector approach for better namespace handling
      const itunesImage = channel.querySelector('[href]');
      if (itunesImage && itunesImage.tagName.includes('image')) {
        return itunesImage.getAttribute('href') || undefined;
      }
      return undefined;
    },
    () => {
      // Direct search for any element with iTunes namespace
      const allElements = channel.querySelectorAll('*');
      for (const element of Array.from(allElements)) {
        if (element.tagName.toLowerCase().includes('image') && element.hasAttribute('href')) {
          const href = element.getAttribute('href');
          if (href && (href.includes('http') || href.includes('.jpg') || href.includes('.png'))) {
            console.log('Found iTunes image via fallback method:', href);
            return href;
          }
        }
      }
      return undefined;
    },
    // Image element with href attribute
    () => getTextContent(channel, 'image', 'href'),
    // Direct image element content
    () => getTextContent(channel, 'image'),
    // Artwork element
    () => getTextContent(channel, 'artwork'),
    // Check for any image-related element without namespace
    () => {
      const imageEl = channel.querySelector('image');
      if (imageEl) {
        // Try common attributes
        const attrs = ['href', 'url', 'src'];
        for (const attr of attrs) {
          const value = imageEl.getAttribute(attr);
          if (value) return value;
        }
        // Try text content
        const text = imageEl.textContent?.trim();
        if (text && (text.includes('http') || text.includes('.jpg') || text.includes('.png'))) {
          return text;
        }
      }
      return undefined;
    }
  ];

  for (const getImageFn of imageSources) {
    const image = getImageFn();
    if (image) {
      console.log('Found channel image:', image);
      // Special logging for HeyCitizen feeds
      if (image.includes('heycitizen')) {
        console.log('HeyCitizen artwork found:', image);
      }
      return image;
    }
  }

  console.log('No channel image found');
  return undefined;
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
    
    console.log('🔍 Attempting to fetch RSS feed:', finalFeedUrl);
    
    // Use server-side RSS proxy to completely avoid CORS issues
    const proxies = [
      // Primary: Use our server-side RSS proxy
      (url: string) => `/api/rss-proxy?url=${encodeURIComponent(url)}`,
      // Fallback: External proxy if server is down
      (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    ];
    
    let xmlText: string | undefined;
    let lastError: Error | null = null;
    
    // Skipping direct fetch - using CORS proxies
    console.log('Skipping direct fetch - using CORS proxies');
    
    // Skip no-cors mode, go straight to proxies
    // Skipping no-cors mode, go straight to proxies
    
    if (!xmlText) {
      // Try each proxy in sequence with exponential backoff
      for (let i = 0; i < proxies.length; i++) {
        try {
          const proxyFn = proxies[i];
          const proxyUrl = proxyFn(finalFeedUrl);
          console.log(`🌐 Trying proxy ${i + 1}/${proxies.length}:`, proxyUrl);
          
          // Add delay between retries to avoid rate limiting
          if (i > 0) {
            const delay = Math.min(1000 * Math.pow(2, i - 1), 5000); // Exponential backoff, max 5s
            console.log(`Waiting ${delay}ms before next proxy attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            // Only use CORS-safelisted headers
            headers: {
              'Accept': 'application/json, text/plain, text/xml, */*',
            },
            redirect: 'follow',
          });
          
          if (!response.ok) {
            throw new Error(`Proxy ${i + 1} failed: ${response.status} ${response.statusText}`);
          }
          
          const contentType = response.headers.get('content-type') || '';
          
          if (proxyUrl.startsWith('/api/rss-proxy')) {
            // Our server-side proxy returns XML directly
            xmlText = await response.text();
            console.log(`📡 Server-side proxy returned ${xmlText.length} chars`);
          } else if (contentType.includes('application/json')) {
            // Handle JSON response from external proxies
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
          
          console.log(`✅ Proxy ${i + 1} fetch successful - got ${xmlText?.length || 0} chars`);
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
    
    console.log('📋 Parsing RSS feed XML...', trimmedXml.substring(0, 200) + '...');
    
    const parsedFeed = await parseFeedXML(trimmedXml);
    console.log('✅ Parsed feed successfully:', {
      title: parsedFeed.title,
      hasValue: !!parsedFeed.value,
      recipientCount: parsedFeed.value?.recipients.length || 0,
      episodeCount: parsedFeed.episodes.length
    });
    
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