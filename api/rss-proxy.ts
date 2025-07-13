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
    console.log(`[RSS-PROXY] Parsing XML for ${rssUrl}`);
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
      trimValues: true,
    });
    
    const json = parser.parse(xml);
    console.log(`[RSS-PROXY] Parsed JSON structure:`, JSON.stringify(json, null, 2).substring(0, 1000));

    // Try to find the <value> block (usually under rss.channel.value)
    const value = json?.rss?.channel?.value;
    if (!value) {
      console.log(`[RSS-PROXY] No <value> block found in RSS feed: ${rssUrl}`);
      console.log(`[RSS-PROXY] Available channel keys:`, Object.keys(json?.rss?.channel || {}));
      return null;
    }

    console.log(`[RSS-PROXY] Found value block:`, value);

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

    console.log(`[RSS-PROXY] Found ValueBlock in RSS:`, { type, method, suggested, recipients: valueRecipients.length });
    console.log(`[RSS-PROXY] Recipients:`, valueRecipients);

    return {
      type,
      method,
      suggested,
      valueRecipients,
    };
  } catch (error) {
    console.error(`[RSS-PROXY] Error parsing XML from ${rssUrl}:`, error);
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
    console.log(`[RSS-PROXY] Fetching RSS feed: ${url}`);
    
    // Set CORS headers early
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Fetch the RSS feed with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Podtardstr/1.0 (RSS Parser)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    
    clearTimeout(timeoutId);

    console.log(`[RSS-PROXY] Response status: ${response.status} for ${url}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`[RSS-PROXY] Failed to fetch RSS feed: ${response.status} ${response.statusText}`, errorText);
      return res.status(500).json({ 
        error: `Failed to fetch RSS feed: ${response.status} ${response.statusText}`,
        details: errorText.substring(0, 200) // First 200 chars of error
      });
    }

    const xml = await response.text();
    console.log(`[RSS-PROXY] Successfully fetched RSS (${xml.length} chars): ${url}`);
    
    // Log first 500 chars of XML for debugging
    console.log(`[RSS-PROXY] XML preview:`, xml.substring(0, 500));

    // Parse the ValueBlock from the XML
    const valueBlock = parseValueBlockFromXml(xml, url);

    if (!valueBlock) {
      console.log(`[RSS-PROXY] No ValueBlock found in RSS feed: ${url}`);
      return res.status(200).json({ 
        type: null,
        method: null,
        suggested: null,
        valueRecipients: []
      });
    }

    console.log(`[RSS-PROXY] Found ValueBlock:`, valueBlock);

    // Return the parsed ValueBlock
    return res.status(200).json(valueBlock);

  } catch (error) {
    console.error(`[RSS-PROXY] Error processing RSS feed ${url}:`, error);
    
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout while fetching RSS feed' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error while processing RSS feed',
      details: error.message
    });
  }
}