// Server-side Podcast Index API proxy to avoid CORS issues
// This runs as a Vercel serverless function

import fetch from 'node-fetch';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Date, X-Auth-Key, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get the API path from the URL
  const { path } = req.query;
  
  if (!path) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  try {
    // Use environment variables for API credentials
    const API_KEY = process.env.VITE_PODCAST_INDEX_API_KEY || 'UXKCGDSYGY6UIQNRNPJ7';
    const API_SECRET = process.env.VITE_PODCAST_INDEX_API_SECRET || 'yzJtuQGBpfZp^t5V4vB^5PYg#H8&EX^kLx8EhZuP';

    // Generate authentication headers
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const data4Hash = API_KEY + API_SECRET + apiHeaderTime;
    const hash4Header = crypto.createHash('sha1').update(data4Hash).digest('hex');

    // Build the full API URL
    const apiUrl = `https://api.podcastindex.org/api/1.0/${path}`;
    
    // Forward query parameters (except 'path')
    const { path: _, ...queryParams } = req.query;
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${apiUrl}?${queryString}` : apiUrl;

    console.log('🔄 Server-side fetching from Podcast Index API:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-Auth-Date': apiHeaderTime.toString(),
        'X-Auth-Key': API_KEY,
        'Authorization': hash4Header,
        'User-Agent': 'Podtardstr/1.0 Podcast Index Client',
        'Accept': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonData = await response.json();

    console.log(`✅ Successfully fetched data from Podcast Index API`);

    // Return the JSON data
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(jsonData);

  } catch (error) {
    console.error('❌ Podcast Index API fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from Podcast Index API',
      message: error.message,
      path: path
    });
  }
}