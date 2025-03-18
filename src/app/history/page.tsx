'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';

interface HistoryItem {
  search_query: string;
  search_time: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1F24]">
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-8">
          <Link href="/" className="flex-shrink-0">
            <span className="text-white text-xl font-bold">NETVERSELAB</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Search History</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="bg-[#2B2C32] rounded-lg p-4 flex items-center gap-4">
                <FiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <Link 
                    href={`/search?q=${encodeURIComponent(item.search_query)}`}
                    className="text-white hover:text-blue-400 transition-colors block mb-1"
                  >
                    {item.search_query}
                  </Link>
                  <time className="text-sm text-gray-400">
                    {new Date(item.search_time).toLocaleString()}
                  </time>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No search history found</p>
          </div>
        )}
      </main>
    </div>
  );
}