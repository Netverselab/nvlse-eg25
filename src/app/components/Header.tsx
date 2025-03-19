'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSettings, FiClock } from 'react-icons/fi';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#34353A] rounded-full transition-colors"
        title="Settings"
      >
        <FiSettings className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2B2C32] rounded-lg shadow-xl py-2">
          <Link
            href="/history"
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#34353A] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FiClock className="w-4 h-4" />
            <span>History</span>
          </Link>
        </div>
      )}
    </div>
  );
}