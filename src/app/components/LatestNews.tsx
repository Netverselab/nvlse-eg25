'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  urlToImage?: string;
}

export default function LatestNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  
  const fetchNews = async () => {
    try {
      const response = await fetch('/api/latest-news?' + new URLSearchParams({
        t: Date.now().toString(), // Add timestamp to prevent caching
        r: Math.random().toString() // Add random parameter for variety
      }), {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Shuffle the news array for variety
        const shuffledNews = [...data].sort(() => Math.random() - 0.5);
        setNews(shuffledNews.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh news every minute
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#2B2C32]/80 p-4 rounded-lg animate-pulse">
            <div className="h-40 bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {news.map((item, index) => (
        <a
          key={index}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#2B2C32]/80 p-4 rounded-lg hover:bg-[#34353A]/80 transition-colors"
        >
          {item.urlToImage && (
            <div className="mb-4 h-40 overflow-hidden rounded">
              <img 
                src={item.urlToImage} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h3 className="text-white text-sm font-medium line-clamp-2 mb-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{item.source.name}</span>
            <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
          </div>
        </a>
      ))}
    </div>
  );
}