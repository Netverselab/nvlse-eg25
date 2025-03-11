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
    // Fetch all types of results in parallel
    const fetchResults = async (type: string) => {
      const endpoint = BRAVE_ENDPOINTS[type as keyof typeof BRAVE_ENDPOINTS];
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
          console.warn(`Rate limit hit for ${type}, will retry with exponential backoff`);
          // Let the rate limiter handle the retry
          throw new Error('rate limit');
        } else {
          console.error(`API Error for ${type}: ${response.status}`);
          return null;
        }
      }

      return response.json();
    };

    const [webData, imagesData, videosData, newsData] = await Promise.all([
      fetchResults('all'),
      fetchResults('images'),
      fetchResults('videos'),
      fetchResults('news')
    ]);

    const transformedData = {
      web: {
        results: webData?.web?.results?.map((result: any) => ({
          title: sanitizeText(result.title),
          url: result.url,
          description: sanitizeText(result.description),
          favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(result.url).hostname)}&sz=32`
        })) || []
      },
      images: imagesData?.results?.map((result: any) => ({
        image: {
          url: result.thumbnail?.src || result.url,
          height: result.thumbnail?.height,
          width: result.thumbnail?.width
        },
        title: sanitizeText(result.title),
        source_url: result.source
      })) || [],
      videos: videosData?.results?.map((result: any) => ({
        title: sanitizeText(result.title),
        url: result.url,
        thumbnail: result.thumbnail,
        duration: result.duration || 'N/A',
        source: sanitizeText(result.provider) || 'Unknown'
      })) || [],
      news: newsData?.results?.map((result: any) => ({
        title: sanitizeText(result.title),
        url: result.url,
        description: sanitizeText(result.description),
        date: result.age || 'N/A',
        source: sanitizeText(result.source) || 'Unknown'
      })) || []
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