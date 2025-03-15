import { NextResponse } from 'next/server';
import rateLimiter from '@/utils/rateLimiter';

const BRAVE_API_BASE = 'https://api.search.brave.com/res/v1';
const BRAVE_ENDPOINTS = {
  all: `${BRAVE_API_BASE}/web/search`,
  images: `${BRAVE_API_BASE}/images/search`,
  videos: `${BRAVE_API_BASE}/videos/search`,
  news: `${BRAVE_API_BASE}/news/search`
};

// Simple in-memory cache with expiration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(query: string, type: string): string {
  return `${type}:${query}`;
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Utility function to remove HTML tags and decode entities
function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const braveApiKey = process.env.BRAVE_API_KEY;

  if (!braveApiKey) {
    return NextResponse.json(
      { error: 'Brave API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const fetchResults = async (searchType: string) => {
      const endpoint = BRAVE_ENDPOINTS[searchType as keyof typeof BRAVE_ENDPOINTS];
      const cacheKey = getCacheKey(query, searchType);
      const cachedData = getFromCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&count=10`, {
          headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': braveApiKey,
            'User-Agent': 'NetverseLab-Search/1.0'
          }
        });

        if (response.status === 429) {
          await delay(1000); // Wait 1 second before retrying
          return fetchResults(searchType); // Retry the request
        }

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error(`Error fetching ${searchType} results:`, error);
        return { results: [] }; // Return empty results instead of null
      }
    };

    // Fetch results sequentially without delays
    const webData = await fetchResults('all');
    const imagesData = await fetchResults('images');
    const videosData = await fetchResults('videos');
    const newsData = await fetchResults('news');

    // Transform all results at once
    const transformedData = {
      web: {
        results: webData?.web?.results?.map((result: any) => ({
          title: sanitizeText(result.title || ''),
          url: result.url || '',
          description: sanitizeText(result.description || ''),
          favicon: result.url ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(result.url).hostname)}&sz=32` : ''
        })) || []
      },
      images: (imagesData?.results || []).map((result: any) => ({
        image: {
          url: result.thumbnail?.src || result.image?.url || result.url || result.link || '',
          height: result.thumbnail?.height || result.image?.height || 300,
          width: result.thumbnail?.width || result.image?.width || 300
        },
        title: sanitizeText(result.title || ''),
        source_url: result.source || result.url || ''
      })),
      videos: (videosData?.results || []).map((result: any) => ({
        title: sanitizeText(result.title || ''),
        url: result.url || '',
        thumbnail: result.thumbnail?.src || result.image?.url || result.thumbnails?.[0]?.src || result.url || '',
        duration: result.duration || result.length || 'N/A',
        source: sanitizeText(result.provider || result.source || 'Unknown')
      })),
      news: (newsData?.results || []).map((result: any) => ({
        title: sanitizeText(result.title || ''),
        url: result.url || '',
        description: sanitizeText(result.description || result.snippet || ''),
        date: result.date || result.age || result.published || 'N/A',
        source: sanitizeText(result.source || result.publisher || 'Unknown')
      }))
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
