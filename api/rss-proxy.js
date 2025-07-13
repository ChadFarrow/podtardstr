// Server-side RSS proxy to avoid CORS issues
// This runs as a Vercel serverless function

import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  try {
    console.log('🔄 Server-side fetching RSS feed:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Podtardstr/1.0 RSS Parser',
        'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const xmlText = await response.text();

    console.log(`✅ Successfully fetched ${xmlText.length} chars from ${url}`);

    // Return the XML content with proper content type
    res.setHeader('Content-Type', contentType.includes('xml') ? contentType : 'application/xml');
    res.status(200).send(xmlText);

  } catch (error) {
    console.error('❌ RSS fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch RSS feed',
      message: error.message,
      url: url
    });
  }
}