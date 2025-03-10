require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from public directory
app.use(express.static('public'));

// Brave Search API endpoint
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';
const BRAVE_API_KEY = process.env.apiKey;

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get(BRAVE_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY
      },
      params: {
        q: q,
        count: 10 // Number of results per page
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});