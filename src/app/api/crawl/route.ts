import { NextResponse } from 'next/server';
import Crawler from '@/services/crawler';

export async function POST(request: Request) {
  try {
    const { url, maxDepth = 2, maxPages = 100 } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const crawler = new Crawler(maxDepth, maxPages);
    const results = await crawler.crawl(url);

    // Convert Map to Array for JSON serialization
    const crawlResults = Array.from(results.values());

    return NextResponse.json({
      success: true,
      results: crawlResults,
      totalPages: crawlResults.length
    });
  } catch (error) {
    console.error('Crawl API error:', error);
    return NextResponse.json(
      { error: 'Failed to crawl the specified URL' },
      { status: 500 }
    );
  }
}