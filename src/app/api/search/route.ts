import { NextResponse } from 'next/server';

const BRAVE_API_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';

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
    const response = await fetch(`${BRAVE_API_ENDPOINT}?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': braveApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Brave API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to include favicons
    const transformedResults = data.web?.results?.map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.description,
      favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(result.url).hostname)}&sz=32`
    })) || [];

    return NextResponse.json({ web: { results: transformedResults } });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}