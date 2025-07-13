import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  // Validate URL parameter
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url parameter' });
  }

  // Basic URL validation
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    console.log(`Fetching RSS feed: ${url}`);
    
    // Fetch the RSS feed
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Podtardstr/1.0 (RSS Parser)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch RSS feed: ${response.statusText}` 
      });
    }

    const xml = await response.text();
    console.log(`Successfully fetched RSS (${xml.length} chars): ${url}`);

    // Parse the ValueBlock from the XML
    const valueBlock = parseValueBlockFromXml(xml, url);

    if (!valueBlock) {
      return res.status(404).json({ error: 'No ValueBlock found in RSS feed' });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return the parsed ValueBlock
    return res.status(200).json(valueBlock);

  } catch (error) {
    console.error(`Error processing RSS feed ${url}:`, error);
    return res.status(500).json({ 
      error: 'Internal server error while processing RSS feed' 
    });
  }
}