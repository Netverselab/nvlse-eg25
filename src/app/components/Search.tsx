'use client';

import { useState } from 'react';

interface SearchResult {
  web?: {
    results: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  };
  images?: Array<{
    image: {
      url: string;
      height?: number;
      width?: number;
    };
    title: string;
    source_url: string;
  }>;
  videos?: Array<{
    title: string;
    url: string;
    thumbnail: string;
    duration: string;
    source: string;
  }>;
  news?: Array<{
    title: string;
    url: string;
    description: string;
    date: string;
    source: string;
  }>;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </form>

      {results && (
        <div className="flex gap-4 mb-4">
          {['all', 'images', 'videos', 'news'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'all' && results?.web?.results?.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600">{result.title}</h3>
              <a href={result.url} target="_blank" rel="noopener noreferrer" 
                className="text-green-700 text-sm block mb-2 hover:underline">{result.url}</a>
              <p className="text-gray-600">{result.description}</p>
            </div>
          ))}

          {activeTab === 'images' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results?.images?.map((image, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden">
                  <img 
                    src={image.image.url} 
                    alt={image.title}
                    className="w-full h-48 object-cover"
                  />
                  <a href={image.source_url} target="_blank" rel="noopener noreferrer"
                    className="absolute inset-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    {image.title}
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results?.videos?.map((video, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="relative">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover"/>
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{video.source}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-4">
              {results?.news?.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" 
                    className="block hover:no-underline">
                    <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-blue-500">{item.source}</span>
                      <span className="text-gray-500">{item.date}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}