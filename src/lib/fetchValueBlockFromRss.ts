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

/**
 * Fetches and parses the <value> block from a podcast RSS feed URL.
 * Returns the ValueBlock with all recipients, or null if not found.
 */
export async function fetchValueBlockFromRss(rssUrl: string): Promise<ValueBlock | null> {
  try {
    // Use a CORS proxy to bypass cross-origin restrictions
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(proxyUrl);
    
    if (!res.ok) {
      console.warn(`Failed to fetch RSS via proxy: ${res.status} for ${rssUrl}`);
      return null;
    }
    
    const xml = await res.text();
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
    console.error(`Error fetching RSS feed ${rssUrl}:`, error);
    return null;
  }
} 