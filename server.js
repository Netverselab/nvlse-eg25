import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
if (!BRAVE_API_KEY) {
  console.error('BRAVE_API_KEY is not set in environment variables');
  process.exit(1);
}

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
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        details: 'Please check your Brave API key configuration'
      });
    }
    
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