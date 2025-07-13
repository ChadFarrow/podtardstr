import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url);
    
    // Only allow RSS/XML feeds
    if (!parsedUrl.pathname.includes('.xml') && !parsedUrl.pathname.includes('feed')) {
      return res.status(400).json({ error: 'Only RSS/XML feeds are allowed' });
    }

    // Fetch the RSS feed
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Podtardstr/1.0 (RSS Proxy)',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch RSS feed: ${response.statusText}` 
      });
    }

    const xml = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/xml');

    // Return the XML content
    res.status(200).send(xml);

  } catch (error) {
    console.error('RSS proxy error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return res.status(408).json({ error: 'Request timeout' });
      }
      if (error.message.includes('Invalid URL')) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
} 