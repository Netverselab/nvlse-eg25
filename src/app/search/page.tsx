'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Search from '../components/Search';
import Link from 'next/link';
import Header from '../components/Header';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-[#1E1F24]">
      <Header />
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-8">
          <Link href="/" className="flex-shrink-0">
            <span className="text-white text-xl font-bold">NETVERSELAB</span>
          </Link>
          <div className="flex-1">
            <Search />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-6 -mb-px">
            {['All', 'Images', 'News', 'Videos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-1 py-3 text-sm border-b-2 transition-colors bg-transparent ${
                  activeTab === tab.toLowerCase()
                    ? 'text-white border-white font-medium'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading...</div>}>
          <SearchContent parentActiveTab={activeTab} />
        </Suspense>
      </div>
    </div>
  );
}

function SearchContent({ parentActiveTab }: { parentActiveTab: string }) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (typeof window !== 'undefined' && query) {
      const fetchResults = async () => {
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
      fetchResults();
    }
  }, [query]);

  return (
    <main className="px-4 py-6">
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-gray-400">
            Showing results for <span className="text-white">{query}</span>
          </div>

          {parentActiveTab === 'all' && (
            <div className="space-y-4">
              {results?.web?.results?.map((result: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-3">
                    {result.favicon && <img src={result.favicon} alt="" className="w-4 h-4" />}
                    <a href={result.url} className="text-sm text-gray-400 hover:underline truncate">{result.url}</a>
                  </div>
                  <a href={result.url} className="block text-lg text-blue-400 hover:underline">{result.title}</a>
                  <p className="text-gray-300 text-sm">{result.description}</p>
                </div>
              ))}
            </div>
          )}

          {parentActiveTab === 'images' && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {results?.images?.map((result: any, i: number) => (
                <a key={i} href={result.source_url} target="_blank" rel="noopener noreferrer" 
                   className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={result.image.url} alt={result.title} className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          )}

          {parentActiveTab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results?.videos?.map((result: any, i: number) => (
                <a key={i} href={result.url} target="_blank" rel="noopener noreferrer" 
                   className="block bg-[#2B2C32] rounded-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded">
                      {result.duration}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm line-clamp-2">{result.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{result.source}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {parentActiveTab === 'news' && results?.news && (
            <div className="space-y-4">
              {results.news.map((result: any, i: number) => (
                <div key={i} className="space-y-2">
                  <a href={result.url} className="block text-lg text-blue-400 hover:underline">
                    {result.title}
                  </a>
                  <p className="text-gray-300 text-sm">{result.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{result.source}</span>
                    <span>•</span>
                    <span>{result.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}