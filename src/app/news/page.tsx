'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';

interface NewsItem {
  title: string;
  url: string;
  description: string;
  source: string;
  publishedAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/latest-news');
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1F24]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-white text-2xl font-bold mb-8">Latest News</h1>
        
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#2B2C32] p-6 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-600 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {news.map((item, index) => (
              <article key={index} className="bg-[#2B2C32] p-6 rounded-lg">
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h2 className="text-xl text-blue-400 hover:underline mb-2">{item.title}</h2>
                  <p className="text-gray-300 mb-3">{item.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}