import axios from 'axios';

const BRAVE_SEARCH_API = 'https://api.search.brave.com/res/v1/web/search';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query } = JSON.parse(event.body);
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    const response = await axios.get(BRAVE_SEARCH_API, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY
      },
      params: {
        q: query
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Search API Error:', error.response?.data || error.message);
    const errorData = error.response?.data;
    
    if (errorData?.error?.code === 'RATE_LIMITED') {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: 'Rate limit exceeded. Please try again in a few seconds.',
          details: errorData.error.detail
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch search results' })
    };
  }
};