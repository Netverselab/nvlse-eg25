'use client';

import { useState } from 'react';
import Link from 'next/link';
import Search from './components/Search';
import Header from './components/Header';
import LatestNews from './components/LatestNews';
import AuthForm from './components/AuthForm';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const mainContent = (
    <main 
      className="min-h-screen bg-[#1E1F24] flex flex-col items-center pt-20 relative"
      style={{
        backgroundImage: 'url(/assets/nightbackground.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header />
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

        {/* Latest News Section */}
        <div className="mt-8 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg">Latest News</h2>
            <span className="text-gray-400 text-sm">Latest Updates</span>
          </div>
          <LatestNews />
        </div>
      </div>
    </main>
  );

  return (
    <>
      {!isAuthenticated && <AuthForm onAuthenticated={() => setIsAuthenticated(true)} />}
      {mainContent}
    </>
  );
}

function QuickLink({ icon, title }: { icon: string; title: string }) {
  return (
    <button className="flex items-center gap-3 p-4 rounded-lg bg-[#2B2C32]/80 hover:bg-[#34353A]/80 transition-colors text-left">
      <span className="text-xl">{icon}</span>
      <span className="text-white text-sm line-clamp-2">{title}</span>
    </button>
  );
}
