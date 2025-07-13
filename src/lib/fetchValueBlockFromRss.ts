import { XMLParser } from 'fast-xml-parser';

export interface ValueRecipient {
  name?: string;
  type?: string;
  address?: string;
  split?: string;
  customKey?: string;
  customValue?: string;
  fee?: string;
}

export interface ValueBlock {
  type?: string;
  method?: string;
  suggested?: string;
  valueRecipients: ValueRecipient[];
}

// CORS proxy services with fallbacks
const CORS_PROXIES = [
  'https://api.allorigins.win/raw',
  'https://cors-anywhere.herokuapp.com',
  'https://thingproxy.freeboard.io/fetch',
];

// Request throttling - delay between requests
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 second between requests

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await delay(REQUEST_DELAY - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  return fetch(url);
}

/**
 * Fetches and parses the <value> block from a podcast RSS feed URL.
 * Returns the ValueBlock with all recipients, or null if not found.
 */
export async function fetchValueBlockFromRss(rssUrl: string): Promise<ValueBlock | null> {
  try {
    // First try server-side API route (if available)
    try {
      const apiUrl = `/api/rss-proxy?url=${encodeURIComponent(rssUrl)}`;
      console.log(`Trying server-side API for: ${rssUrl}`);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const xml = await response.text();
        return parseValueBlockFromXml(xml, rssUrl);
      }
    } catch (error) {
      console.log('Server-side API not available, falling back to CORS proxies');
    }
    
    // Fallback to CORS proxies
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    for (const proxyBase of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxyBase}?url=${encodeURIComponent(rssUrl)}`;
        console.log(`Trying proxy: ${proxyBase} for ${rssUrl}`);
        
        response = await throttledFetch(proxyUrl);
        
        if (response.ok) {
          console.log(`Success with proxy: ${proxyBase}`);
          break;
        } else if (response.status === 429) {
          console.warn(`Rate limited by ${proxyBase}, trying next proxy...`);
          continue;
        } else {
          console.warn(`Proxy ${proxyBase} failed with status: ${response.status}`);
          continue;
        }
      } catch (error) {
        console.warn(`Proxy ${proxyBase} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }
    
    if (!response || !response.ok) {
      console.warn(`All methods failed for ${rssUrl}. Last error:`, lastError);
      return null;
    }
    
    const xml = await response.text();
    return parseValueBlockFromXml(xml, rssUrl);
    
  } catch (error) {
    console.error(`Error fetching RSS feed ${rssUrl}:`, error);
    return null;
  }
}

/**
 * Parse ValueBlock from XML string
 */
function parseValueBlockFromXml(xml: string, rssUrl: string): ValueBlock | null {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const json = parser.parse(xml);

    // Try to find the <value> block (usually under rss.channel.value)
    const value = json?.rss?.channel?.value;
    if (!value) {
      console.log(`No <value> block found in RSS feed: ${rssUrl}`);
      return null;
    }

    // Extract model info from <value>
    const type = value.type;
    const method = value.method;
    const suggested = value.suggested;

    // Extract <valueRecipient> array (may be a single object or array)
    let valueRecipients: ValueRecipient[] = [];
    if (value.valueRecipient) {
      if (Array.isArray(value.valueRecipient)) {
        valueRecipients = value.valueRecipient;
      } else {
        valueRecipients = [value.valueRecipient];
      }
    }

    console.log(`Found ValueBlock in RSS:`, { type, method, suggested, recipients: valueRecipients.length });

    return {
      type,
      method,
      suggested,
      valueRecipients,
    };
  } catch (error) {
    console.error(`Error parsing XML from ${rssUrl}:`, error);
    return null;
  }
} 