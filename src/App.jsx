import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(import.meta.env.PROD ? '/.netlify/functions/api' : '/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Search request failed');
          }

          const data = await response.json();
          setResults(data.web?.results || []);
        } catch (err) {
          setError('Failed to fetch search results');
          console.error('Search error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300); // Debounce delay

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return (
    <div className="app-container">
      <h1>Brave Search Engine</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything..."
          className="search-input"
        />
      </div>

      {loading && <div className="loading">Searching...</div>}
      {error && <div className="error">{error}</div>}

      <div className="results-container">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <h2>
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.title}
              </a>
            </h2>
            <p className="result-description">{result.description}</p>
            <span className="result-url">{result.url}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
