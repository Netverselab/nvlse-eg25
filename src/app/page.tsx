'use client';

import { useState } from 'react';

interface SearchResult {
  title: string;
  url: string;
  description: string;
  favicon?: string;
}

interface ImageResult {
  image: {
    url: string;
    height: number;
    width: number;
  };
  title: string;
  source_url: string;
}

interface VideoResult {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  source: string;
}

interface NewsResult {
  title: string;
  url: string;
  description: string;
  date: string;
  source: string;
}

type SearchType = 'all' | 'images' | 'videos' | 'news';

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  const [newsResults, setNewsResults] = useState<NewsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }

      // Update all states at once
      setResults(data.web?.results || []);
      setImageResults(data.images || []);
      setVideoResults(data.videos || []);
      setNewsResults(data.news || []);
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        setError('Search rate limit reached. Please wait a moment before trying again.');
      } else {
        setError('Failed to fetch search results. Please try again.');
      }
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchTabs = () => {
    if (!hasSearched) return null;

    return (
      <div className="flex gap-4 mb-8 justify-center">
        {(['all', 'images', 'videos', 'news'] as SearchType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${searchType === type ? 'bg-blue-700 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
          >
            {type}
          </button>
        ))}
      </div>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 mb-4 text-center">
          {error}
        </div>
      );
    }

    if (!hasSearched) {
      return null;
    }

    switch (searchType) {
      case 'images':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageResults.map((result, index) => (
              <a
                key={index}
                href={result.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg hover:shadow-lg transition-shadow"
              >
                <img
                  src={result.image.url}
                  alt={result.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-2 bg-white">
                  <p className="text-sm text-gray-800 truncate">{result.title}</p>
                </div>
              </a>
            ))}
          </div>
        );

      case 'videos':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoResults.map((result, index) => (
              <a
                key={index}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 text-sm rounded">
                    {result.duration}
                  </span>
                </div>
                <div className="p-3 bg-white">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-2">{result.title}</h3>
                  <p className="text-sm text-gray-600">{result.source}</p>
                </div>
              </a>
            ))}
          </div>
        );

      case 'news':
        return (
          <div className="space-y-6">
            {newsResults.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h2 className="text-xl font-semibold text-blue-600 hover:underline mb-2">
                    {result.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">{result.source} • {result.date}</p>
                  <p className="text-gray-800">{result.description}</p>
                </a>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {result.favicon && (
                      <img
                        src={result.favicon}
                        alt=""
                        className="w-4 h-4"
                        loading="lazy"
                      />
                    )}
                    <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                      {result.title}
                    </h2>
                  </div>
                  <p className="text-green-700 text-sm mb-2">{result.url}</p>
                  <p className="text-gray-800">{result.description}</p>
                </a>
              </div>
            ))}
          </div>
        );
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

      {renderSearchTabs()}
      {renderResults()}
    </main>
  );
}
