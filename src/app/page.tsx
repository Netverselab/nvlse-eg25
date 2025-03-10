'use client';

import { useState } from 'react';

interface SearchResult {
  title: string;
  url: string;
  description: string;
  favicon?: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }

      setResults(data.web?.results || []);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Next Gen Search Engine</h1>
        <p className="text-gray-600">Powered by NetverseLab</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4 text-center">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6">
                {result.favicon ? (
                  <img
                    src={result.favicon}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-sm" />
                )}
              </div>
              <div className="flex-grow">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h2 className="text-xl font-semibold text-blue-600 hover:underline mb-2">
                    {result.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">{result.url}</p>
                  <p className="text-gray-800">{result.description}</p>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </main>
  );
}
