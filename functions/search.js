const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    const { q } = event.queryStringParameters;
    if (!q) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';
    const response = await axios.get(BRAVE_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': process.env.apiKey
      },
      params: {
        q: q,
        count: 10
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch search results' })
    };
  }
};