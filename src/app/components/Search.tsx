'use client';

import { useState } from 'react';
import { FiSearch, FiSettings } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function Search() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Redirect to search results page with query
    router.push(`/search?q=${encodeURIComponent(query)}`);
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