'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiSettings, FiClock, FiSliders } from 'react-icons/fi';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#34353A] rounded-full transition-colors"
        title="Settings"
      >
        <FiSettings className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2B2C32] rounded-lg shadow-xl py-2 border border-gray-700">
          <Link
            href="/history"
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#34353A] transition-colors"
          >
            <FiClock className="w-4 h-4" />
            <span>History</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#34353A] transition-colors"
          >
            <FiSliders className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      )}
    </div>
  );
}