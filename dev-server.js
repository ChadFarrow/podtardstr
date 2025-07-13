// Simple development server for RSS proxy
// Run this with: node dev-server.js

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// RSS Proxy endpoint
app.get('/api/rss-proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    console.log('🔄 Development server fetching RSS feed:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Podtardstr/1.0 RSS Parser (Development)',
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

    console.log(`✅ Development server successfully fetched ${xmlText.length} chars from ${url}`);

    // Return the XML content with proper content type
    res.setHeader('Content-Type', contentType.includes('xml') ? contentType : 'application/xml');
    res.status(200).send(xmlText);

  } catch (error) {
    console.error('❌ Development server RSS fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch RSS feed',
      message: error.message,
      url: url
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RSS Proxy development server running on http://localhost:${PORT}`);
  console.log(`📡 RSS endpoint: http://localhost:${PORT}/api/rss-proxy?url=<RSS_URL>`);
});