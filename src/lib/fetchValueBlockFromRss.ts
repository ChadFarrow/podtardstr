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

// More reliable CORS proxy
const CORS_PROXY = 'https://api.allorigins.win/raw';

// Request throttling - delay between requests
let lastRequestTime = 0;
const REQUEST_DELAY = 2000; // 2 seconds between requests

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
    
    // First try server-side API route (bypasses CORS)
    try {
      const apiUrl = `/api/rss-proxy?url=${encodeURIComponent(rssUrl)}`;
      console.log(`Trying server-side API for: ${rssUrl}`);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const valueBlock = await response.json();
        console.log(`Successfully fetched ValueBlock via API:`, valueBlock);
        return valueBlock;
      } else {
        console.warn(`Server-side API failed with status: ${response.status}`);
      }
    } catch (apiError) {
      console.warn(`Server-side API error:`, apiError);
    }
    
    // Fallback to CORS proxy with throttling (less reliable)
    const proxyUrl = `${CORS_PROXY}?url=${encodeURIComponent(rssUrl)}`;
    const response = await throttledFetch(proxyUrl);
    
    if (!response.ok) {
      console.warn(`CORS proxy failed with status: ${response.status} for ${rssUrl}`);
      return null;
    }
    
    const xml = await response.text();
    console.log(`Successfully fetched RSS (${xml.length} chars): ${rssUrl}`);
    
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