import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get random page number between 1 and 5 for variety
    const page = Math.floor(Math.random() * 5) + 1;
    
    const response = await fetch('https://newsapi.org/v2/everything?' + new URLSearchParams({
      q: '(india OR technology OR business OR sports)',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '12', // Fetch more articles to allow for randomization
      page: page.toString(),
      apiKey: '687949dfa7ce4bceba2d45f2da1586c8',
    }), {
      headers: {
        'X-Api-Key': '687949dfa7ce4bceba2d45f2da1586c8'
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (data.status === 'ok' && data.articles?.length > 0) {
      // Shuffle articles for variety
      const shuffledArticles = data.articles
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      
      return NextResponse.json(shuffledArticles);
    }

    throw new Error('No articles found');
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json([]);
  }
}