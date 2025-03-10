import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_SEARCH_API = 'https://api.search.brave.com/res/v1/web/search';

app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await axios.get(BRAVE_SEARCH_API, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      },
      params: {
        q: query
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Search API Error:', error.response?.data || error.message);
    const errorData = error.response?.data;
    if (errorData?.error?.code === 'RATE_LIMITED') {
      res.status(429).json({
        error: 'Rate limit exceeded. Please try again in a few seconds.',
        details: errorData.error.detail
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch search results' });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});