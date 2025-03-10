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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const type = searchParams.get('type') || 'all';
  const cacheKey = getCacheKey(query, type);
  const cachedResult = getFromCache(cacheKey);

  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  const braveApiKey = process.env.BRAVE_API_KEY;

  if (!braveApiKey) {
    return NextResponse.json(
      { error: 'Brave API key is not configured' },
      { status: 500 }
    );
  }

  const endpoint = BRAVE_ENDPOINTS[type as keyof typeof BRAVE_ENDPOINTS];

  if (!endpoint) {
    return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
  }

  try {
    const fetchWithRateLimit = () => fetch(`${endpoint}?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': braveApiKey,
        'User-Agent': 'NetverseLab-Search/1.0'
      },
      next: { revalidate: CACHE_TTL / 1000 }
    });

    const response = await rateLimiter.executeWithRateLimit(
      `brave-api-${type}`,
      fetchWithRateLimit
    );

    if (!response.ok) {
      if (response.status === 429) {
        // Return cached results if available, otherwise return empty results
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          return NextResponse.json(cachedData);
        }
        return NextResponse.json({
          web: { results: [] },
          message: "Please try again in a moment"
        });
      }
      console.error(`API Error: ${response.status}`);
      return NextResponse.json({
        web: { results: [] },
        message: "No results found"
      });
    }

    const data = await response.json();
    let transformedData = {};

    switch (type) {
      case 'images':
        transformedData = {
          images: data.results?.map((result: any) => ({
            image: {
              url: result.thumbnail?.src || result.url,
              height: result.thumbnail?.height,
              width: result.thumbnail?.width
            },
            title: result.title,
            source_url: result.source
          })) || []
        };
        break;

      case 'videos':
        transformedData = {
          videos: data.results?.map((result: any) => ({
            title: result.title,
            url: result.url,
            thumbnail: result.thumbnail,
            duration: result.duration || 'N/A',
            source: result.provider || 'Unknown'
          })) || []
        };
        break;

      case 'news':
        transformedData = {
          news: data.results?.map((result: any) => ({
            title: result.title,
            url: result.url,
            description: result.description,
            date: result.age || 'N/A',
            source: result.source || 'Unknown'
          })) || []
        };
        break;

      default:
        transformedData = {
          web: {
            results: data.web?.results?.map((result: any) => ({
              title: result.title,
              url: result.url,
              description: result.description,
              favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(result.url).hostname)}&sz=32`
            })) || []
          }
        };
    }

    setCache(cacheKey, transformedData);
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}