'use client';

import { useState } from 'react';
import { FiSearch, FiSettings, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';  // Added Link import

export default function Search() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;  // Changed from searchQuery to query

    // Save to history
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery: query.trim() }),  // Changed from searchQuery to query
      });
    } catch (error) {
      console.error('Failed to save history:', error);
    }

    // Redirect to search results page
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);  // Changed from searchQuery to query
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search the web privately..."
          className="w-full px-4 py-3 pr-24 bg-[#343546] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB542B] placeholder-gray-400"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Link

            href="/history"
            className="p-2 hover:bg-[#2B2C32] rounded-full transition-colors"
            title="History"
          >
            <FiClock className="w-5 h-5 text-gray-400" />
          </Link>
          <button
            type="button"
            className="p-2 hover:bg-[#2B2C32] rounded-full transition-colors"
            title="Settings"
          >
            <FiSettings className="w-5 h-5 text-gray-400" />
          </button>
          <button
            type="submit"
            className="p-2 hover:bg-[#2B2C32] rounded-full transition-colors"
          >
            <FiSearch className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </form>
  );
}