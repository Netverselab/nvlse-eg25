'use client';

import { useState } from 'react';

import Image from 'next/image';
import Search from './components/Search';
import Header from './components/Header';

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
        if (response.status === 429) {
          setError('Search rate limit reached. Please wait a moment before trying again.');
          return;
        }
        throw new Error(data.error || 'Failed to fetch results');
      }

      // Update all states at once
      setResults(data.web?.results || []);
      setImageResults(data.images || []);
      setVideoResults(data.videos || []);
      setNewsResults(data.news || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to fetch search results. Please try again.');
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
    <main 
      className="min-h-screen bg-[#1E1F24] flex flex-col items-center pt-20 relative"
      style={{
        backgroundImage: 'url(/assets/nightbackground.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header />  {/* Make sure this is here */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Logo */}
        <div className="mb-12">
          <span className="text-white text-4xl font-bold">NETVERSELAB</span>
        </div>

        {/* Search Component */}
        <div className="w-full max-w-2xl px-4">
          <Search />
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl px-4">
          <QuickLink
            icon="🛒"
            title="How to save money on groceries"
          />
          <QuickLink
            icon="💻"
            title="How to learn to code"
          />
          <QuickLink
            icon="🔄"
            title="How to import browser settings"
          />
          <QuickLink
            icon="🏀"
            title="NBA schedule"
          />
        </div>

        {/* Browser Download Section */}
        <div className="mt-16 flex items-center gap-4 bg-[#2B2C32]/80 rounded-lg p-4 max-w-2xl mx-4">
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Next Gen Browser</h3>
            <p className="text-gray-400 text-sm">Enjoying private search? Try our secure browser.</p>
          </div>
          <button className="bg-[#FB542B] text-white px-4 py-2 rounded hover:bg-[#EA431A] transition-colors">
            Download
          </button>
        </div>
      </div>
    </main>
  );
}

function QuickLink({ icon, title }: { icon: string; title: string }) {
  return (
    <button className="flex items-center gap-3 p-4 rounded-lg bg-[#2B2C32] hover:bg-[#34353A] transition-colors text-left">
      <span className="text-xl">{icon}</span>
      <span className="text-white text-sm line-clamp-2">{title}</span>
    </button>
  );
}
