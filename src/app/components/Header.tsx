'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSettings, FiClock } from 'react-icons/fi';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-[#2B2C32] rounded-full hover:bg-[#34353A] transition-colors shadow-lg"
        title="Settings"
      >
        <FiSettings className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2B2C32] rounded-lg shadow-xl py-2 border border-gray-700">
          <Link
            href="/history"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#34353A] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FiClock className="w-5 h-5" />
            <span>History</span>
          </Link>
        </div>
      )}
    </div>
  );
}