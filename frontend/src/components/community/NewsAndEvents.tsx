import React, { useState, useEffect } from 'react';
import { Newspaper } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  created_at: {
    _seconds: number;
    _nanoseconds?: number;
  };
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: {
    _seconds: number;
    _nanoseconds?: number;
  };
}

interface NewsApiResponse {
  news: NewsItem[];
}

interface CommunityEventApiResponse {
  events: CommunityEvent[];
}

export default function NewsAndEvents() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [recentEvent, setRecentEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch news
        const newsResponse = await fetch('http://127.0.0.1:5000/api/news/news', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!newsResponse.ok) {
          throw new Error('Failed to fetch news');
        }

        const newsData: NewsApiResponse = await newsResponse.json();
        
        // Sort news by created_at date and set all news items
        const sortedNews = newsData.news.sort((a, b) => 
          b.created_at._seconds - a.created_at._seconds
        );
        setNews(sortedNews);

        // Fetch community events
        const eventsResponse = await fetch('http://127.0.0.1:5000/api/community/events', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (eventsResponse.ok) {
          const eventsData: CommunityEventApiResponse = await eventsResponse.json();
          
          // Sort events by created_at date and get the most recent one
          if (eventsData.events && eventsData.events.length > 0) {
            const sortedEvents = eventsData.events.sort((a, b) => 
              b.created_at._seconds - a.created_at._seconds
            );
            setRecentEvent(sortedEvents[0]);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load news and events');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="flex justify-center items-center min-h-screen text-red-500">
      {error}
    </div>
  );

  return (
    <section className="min-h-screen flex flex-col items-center p-5 bg-[#102a4e]/50">
      <div className="my-5 items-center text-center">
        <h2 className="text-6xl mb-2 font-bold text-[#9cc9ff]">
          Community Hub
        </h2>
        <p className="text-gray-400 w-[75%] m-auto">
          A collaborative space where students, creators, and tech enthusiasts
          come together to share ideas, work on projects, and grow as a
          community
        </p>
      </div>
      <div className="max-w-7xl w-full p-2 mx-auto">
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {recentEvent && (
            <div className="lg:col-span-2 group rounded-2xl overflow-hidden shadow-2xl shadow-[#051122] transform hover:-translate-y-2 transition-all duration-300">
              <div className="relative">
                <img
                  src={recentEvent.image_url || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"}
                  alt={recentEvent.title}
                  className="w-full h-108 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <span className="inline-block bg-[#2563eb] text-xs font-semibold px-3 py-1 rounded-full mb-1">
                    RECENT EVENT
                  </span>
                  <h3 className="text-3xl font-bold">{recentEvent.title}</h3>
                  <p className="text-gray-200 max-w-2xl">
                    {recentEvent.description}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div>
            <h1 className="text-2xl mb-5 font-bold text-[#9cc9ff]">
              More News
            </h1>
            <div className="h-95 overflow-scroll noScroll overflow-x-hidden">
              <div className="flex flex-col gap-2 overflow-y-scroll noScroll scroll-smooth">
                {news.map((newsItem) => (
                  <div
                    key={newsItem.id}
                    className="bg-[#1a2f55] p-6 rounded-2xl flex items-start gap-4 hover:bg-[#254272] hover:scale-101 transform transition-all duration-300"
                  >
                    <div className="bg-[#2563eb] p-3 rounded-lg">
                      <Newspaper className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">
                        {newsItem.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {newsItem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}