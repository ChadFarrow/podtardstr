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

// More reliable CORS proxy options
const CORS_PROXIES = [
  'https://api.allorigins.win/raw',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
];

// Request throttling - delay between requests
let lastRequestTime = 0;
const REQUEST_DELAY = 3000; // 3 seconds between requests

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
    console.log(`Attempting to fetch RSS: ${rssUrl}`);
    
    // Try each CORS proxy until one works
    for (const proxyBase of CORS_PROXIES) {
      try {
        let proxyUrl: string;
        if (proxyBase === 'https://corsproxy.io/?') {
          proxyUrl = `${proxyBase}${encodeURIComponent(rssUrl)}`;
        } else {
          proxyUrl = `${proxyBase}?url=${encodeURIComponent(rssUrl)}`;
        }
        
        console.log(`Trying proxy: ${proxyBase}`);
        const response = await throttledFetch(proxyUrl);
        
        if (response.ok) {
          const xml = await response.text();
          console.log(`Successfully fetched RSS (${xml.length} chars) via ${proxyBase}: ${rssUrl}`);
          return parseValueBlockFromXml(xml, rssUrl);
        } else if (response.status === 429) {
          console.warn(`Rate limited by ${proxyBase}, trying next proxy...`);
          continue;
        } else {
          console.warn(`Proxy ${proxyBase} failed with status: ${response.status}`);
          continue;
        }
      } catch (error) {
        console.warn(`Proxy ${proxyBase} failed:`, error);
        continue;
      }
    }
    
    console.warn(`All CORS proxies failed for ${rssUrl}`);
    return null;
    
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