import React, { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Upload, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import PageLoader from "../../components/common/PageLoader";
import { usePageStatus } from "../../hooks/usePageStatus";

// Type definitions
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  imageUrl?: string;
}

interface NewsApiItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: {
    _seconds: number;
    _nanoseconds?: number;
  }
}

interface NewsApiResponse {
  news: NewsApiItem[];
}

interface NewsFormData {
  title: string;
  description: string;
}

// Community Events Types
interface CommunityEvent {
  id: string;
  title: string;
  summary: string;
  date: string;
  imageUrl?: string;
}

interface CommunityEventApiItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: {
    _seconds: number;
    _nanoseconds?: number;
  }
}

interface CommunityEventApiResponse {
  events: CommunityEventApiItem[];
}

interface CommunityEventFormData {
  title: string;
  description: string;
  image: File | null;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export default function AdminCommunity() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load community management data."
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal states
  const [isNewsModalOpen, setIsNewsModalOpen] = useState<boolean>(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [isEditNewsModalOpen, setIsEditNewsModalOpen] = useState<boolean>(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'news' | 'event' | null;
    id: string | null;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    title: ''
  });
  
  // Edit states
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // Image preview states
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  
  // Form data states
  const [newsFormData, setNewsFormData] = useState<NewsFormData>({
    title: '',
    description: ''
  });
  
  const [eventFormData, setEventFormData] = useState<CommunityEventFormData>({
    title: '',
    description: '',
    image: null
  });

  // Toast notification function
  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Remove toast manually
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [newsResponse, eventsResponse] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/news/news", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }),
        fetch("http://127.0.0.1:5000/api/community/events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }),
      ]);

      if (!newsResponse.ok) {
        throw new Error("Failed to fetch news");
      }

      const newsPayload: NewsApiResponse = await newsResponse.json();
      const transformedNews: NewsItem[] = newsPayload.news.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.description,
        imageUrl: item.image_url,
        date: new Date(item.created_at._seconds * 1000).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        ),
      }));
      setNews(transformedNews);

      if (eventsResponse.status === 404) {
        setCommunityEvents([]);
      } else {
        if (!eventsResponse.ok) {
          throw new Error("Failed to fetch community events");
        }

        const eventsPayload: CommunityEventApiResponse = await eventsResponse.json();
        const eventsList = Array.isArray(eventsPayload.events)
          ? eventsPayload.events
          : [];

        const transformedEvents: CommunityEvent[] = eventsList.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.description,
          imageUrl: item.image_url,
          date: new Date(item.created_at._seconds * 1000).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          ),
        }));

        setCommunityEvents(transformedEvents);
      }
    } catch (err) {
      console.error("Error loading community data:", err);
      setNews([]);
      setCommunityEvents([]);
      handleError(err, "Unable to load community management data.");
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle form input changes
  const handleNewsInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewsFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image changes
  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setEventImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Open edit modals
  const openEditNewsModal = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsFormData({
      title: item.title,
      description: item.summary
    });
    setIsEditNewsModalOpen(true);
  };

  const openEditEventModal = (event: CommunityEvent) => {
    setEditingEventId(event.id);
    setEventFormData({
      title: event.title,
      description: event.summary,
      image: null
    });
    if (event.imageUrl) {
      setEventImagePreview(event.imageUrl);
    }
    setIsEditEventModalOpen(true);
  };

  // Add News Handler
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsFormData.title.trim() || !newsFormData.description.trim()) {
      showToast('warning', 'Title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', newsFormData.title);
      formData.append('description', newsFormData.description);
      formData.append('is_published', 'true');

      const response = await fetch('http://127.0.0.1:5000/api/news/create-news', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to add news');

      const updatedResponse = await fetch('http://127.0.0.1:5000/api/news/news', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const updatedData: NewsApiResponse = await updatedResponse.json();
      const transformedNews: NewsItem[] = updatedData.news.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.description,
        imageUrl: item.image_url,
        date: new Date(item.created_at._seconds * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }));

      setNews(transformedNews);
      setNewsFormData({ title: '', description: '' });
      setIsNewsModalOpen(false);
      showToast('success', 'News added successfully!');
    } catch (err) {
      console.error('Failed to add news', err);
      showToast('error', 'Failed to add news');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit News Handler
  const handleEditNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsFormData.title.trim() || !newsFormData.description.trim()) {
      showToast('warning', 'Title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', newsFormData.title);
      formData.append('description', newsFormData.description);
      formData.append('is_published', 'true');

      const response = await fetch(`http://127.0.0.1:5000/api/news/update/${editingNewsId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update news');

      // Refetch news
      const updatedResponse = await fetch('http://127.0.0.1:5000/api/news/news', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const updatedData: NewsApiResponse = await updatedResponse.json();
      const transformedNews: NewsItem[] = updatedData.news.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.description,
        imageUrl: item.image_url,
        date: new Date(item.created_at._seconds * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }));

      setNews(transformedNews);
      setNewsFormData({ title: '', description: '' });
      setIsEditNewsModalOpen(false);
      setEditingNewsId(null);
      showToast('success', 'News updated successfully!');
    } catch (err) {
      console.error('Failed to update news', err);
      showToast('error', 'Failed to update news');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete News Handler
  const handleDeleteNews = async () => {
    if (!deleteConfirmation.id) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`http://127.0.0.1:5000/api/news/delete/${deleteConfirmation.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete news');

      setNews(news.filter(item => item.id !== deleteConfirmation.id));
      showToast('success', 'News deleted successfully!');
      setDeleteConfirmation({ isOpen: false, type: null, id: null, title: '' });
    } catch (err) {
      console.error('Failed to delete news', err);
      showToast('error', 'Failed to delete news');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add Community Event Handler
  const handleAddCommunityEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventFormData.title.trim() || !eventFormData.description.trim()) {
      showToast('warning', 'Title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', eventFormData.title);
      formData.append('description', eventFormData.description);
      formData.append('is_published', 'true');
      
      if (eventFormData.image) {
        formData.append('image', eventFormData.image);
      }

      const response = await fetch('http://127.0.0.1:5000/api/community/add-community', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to add community event');

      const updatedResponse = await fetch('http://127.0.0.1:5000/api/community/events', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (updatedResponse.ok) {
        const updatedData: CommunityEventApiResponse = await updatedResponse.json();
        
        if (updatedData.events && updatedData.events.length > 0) {
          const transformedEvents: CommunityEvent[] = updatedData.events.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.description,
            imageUrl: item.image_url,
            date: new Date(item.created_at._seconds * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          }));
          setCommunityEvents(transformedEvents);
        }
      }

      setEventFormData({ title: '', description: '', image: null });
      setEventImagePreview(null);
      setIsEventModalOpen(false);
      showToast('success', 'Event added successfully!');
    } catch (err) {
      console.error('Failed to add community event', err);
      showToast('error', 'Failed to add community event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Community Event Handler
  const handleEditCommunityEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventFormData.title.trim() || !eventFormData.description.trim()) {
      showToast('warning', 'Title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', eventFormData.title);
      formData.append('description', eventFormData.description);
      formData.append('is_published', 'true');
      
      if (eventFormData.image) {
        formData.append('image', eventFormData.image);
      }

      const response = await fetch(`http://127.0.0.1:5000/api/community/update/${editingEventId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update community event');

      const updatedResponse = await fetch('http://127.0.0.1:5000/api/community/events', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (updatedResponse.ok) {
        const updatedData: CommunityEventApiResponse = await updatedResponse.json();
        
        if (updatedData.events && updatedData.events.length > 0) {
          const transformedEvents: CommunityEvent[] = updatedData.events.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.description,
            imageUrl: item.image_url,
            date: new Date(item.created_at._seconds * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          }));
          setCommunityEvents(transformedEvents);
        }
      }

      setEventFormData({ title: '', description: '', image: null });
      setEventImagePreview(null);
      setIsEditEventModalOpen(false);
      setEditingEventId(null);
      showToast('success', 'Event updated successfully!');
    } catch (err) {
      console.error('Failed to update community event', err);
      showToast('error', 'Failed to update community event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Community Event Handler
  const handleDeleteCommunityEvent = async () => {
    if (!deleteConfirmation.id) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`http://127.0.0.1:5000/api/community/delete/${deleteConfirmation.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"
      });

      if (!response.ok) throw new Error('Failed to delete community event');

      setCommunityEvents(communityEvents.filter(event => event.id !== deleteConfirmation.id));
      showToast('success', 'Event deleted successfully!');
      setDeleteConfirmation({ isOpen: false, type: null, id: null, title: '' });
    } catch (err) {
      console.error('Failed to delete community event', err);
      showToast('error', 'Failed to delete community event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isLoading) {
    return <PageLoader message="Loading community manager..." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative bg-[#0f172a] min-h-screen p-8">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-2xl border animate-slideIn ${
              toast.type === 'success' ? 'bg-green-900/90 border-green-700' :
              toast.type === 'error' ? 'bg-red-900/90 border-red-700' :
              'bg-yellow-900/90 border-yellow-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="text-green-400" size={20} />}
            {toast.type === 'error' && <XCircle className="text-red-400" size={20} />}
            {toast.type === 'warning' && <AlertTriangle className="text-yellow-400" size={20} />}
            <p className="flex-grow text-white font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-300 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/30 p-3 rounded-full">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-100">Confirm Delete</h2>
            </div>
            <p className="text-gray-300 mb-2">Are you sure you want to delete this {deleteConfirmation.type}?</p>
            <p className="text-gray-400 text-sm mb-6 italic">"{deleteConfirmation.title}"</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, type: null, id: null, title: '' })}
                disabled={isSubmitting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteConfirmation.type === 'news' ? handleDeleteNews : handleDeleteCommunityEvent}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Section */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Current News Updates</h2>
          <button 
            onClick={() => setIsNewsModalOpen(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} /> Add News
          </button>
        </div>
        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {news.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No news updates yet. Add your first news!</p>
            </div>
          ) : (
            news.map((item) => (
              <div
                key={item.id}
                className="bg-[#0f172a] p-5 rounded-xl border border-gray-800 flex items-center gap-4 hover:bg-gray-900 transition"
              >
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-100 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.summary}</p>
                  <p className="text-xs text-gray-500 mt-2">{item.date}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => openEditNewsModal(item)}
                    className="text-blue-500 hover:text-blue-400 transition p-2 hover:bg-blue-950 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmation({ 
                      isOpen: true, 
                      type: 'news', 
                      id: item.id, 
                      title: item.title 
                    })}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-400 disabled:opacity-50 transition p-2 hover:bg-red-950 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Community Events Section */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Community Events</h2>
          <button 
            onClick={() => setIsEventModalOpen(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} /> Add Event
          </button>
        </div>
        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {communityEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No community events yet. Add your first event!</p>
            </div>
          ) : (
            communityEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#0f172a] p-5 rounded-xl border border-gray-800 flex items-center gap-4 hover:bg-gray-900 transition"
              >
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-100 text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{event.summary}</p>
                  <p className="text-xs text-gray-500 mt-2">{event.date}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => openEditEventModal(event)}
                    className="text-blue-500 hover:text-blue-400 transition p-2 hover:bg-blue-950 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmation({ 
                      isOpen: true, 
                      type: 'event', 
                      id: event.id, 
                      title: event.title 
                    })}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-400 disabled:opacity-50 transition p-2 hover:bg-red-950 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add News Modal */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Add News</h2>
              <button 
                onClick={() => {
                  setIsNewsModalOpen(false);
                  setNewsFormData({ title: '', description: '' });
                }}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-200 transition hover:bg-gray-800 p-2 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddNews} className="space-y-5">
              <div>
                <label htmlFor="news-title" className="block mb-2 text-gray-300 font-medium">Title</label>
                <input
                  type="text"
                  id="news-title"
                  name="title"
                  value={newsFormData.title}
                  onChange={handleNewsInputChange}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition"
                  placeholder="Enter news title..."
                  required
                />
              </div>
              <div>
                <label htmlFor="news-description" className="block mb-2 text-gray-300 font-medium">Description</label>
                <textarea
                  id="news-description"
                  name="description"
                  value={newsFormData.description}
                  onChange={handleNewsInputChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition resize-none"
                  placeholder="Enter news description..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Adding News...' : 'Add News'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit News Modal */}
      {isEditNewsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Edit News</h2>
              <button 
                onClick={() => {
                  setIsEditNewsModalOpen(false);
                  setNewsFormData({ title: '', description: '' });
                  setEditingNewsId(null);
                }}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-200 transition hover:bg-gray-800 p-2 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditNews} className="space-y-5">
              <div>
                <label htmlFor="edit-news-title" className="block mb-2 text-gray-300 font-medium">Title</label>
                <input
                  type="text"
                  id="edit-news-title"
                  name="title"
                  value={newsFormData.title}
                  onChange={handleNewsInputChange}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition"
                  placeholder="Enter news title..."
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-news-description" className="block mb-2 text-gray-300 font-medium">Description</label>
                <textarea
                  id="edit-news-description"
                  name="description"
                  value={newsFormData.description}
                  onChange={handleNewsInputChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition resize-none"
                  placeholder="Enter news description..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Updating News...' : 'Update News'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Add Community Event</h2>
              <button 
                onClick={() => {
                  setIsEventModalOpen(false);
                  setEventFormData({ title: '', description: '', image: null });
                  setEventImagePreview(null);
                }}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-200 transition hover:bg-gray-800 p-2 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddCommunityEvent} className="space-y-5">
              <div>
                <label htmlFor="event-title" className="block mb-2 text-gray-300 font-medium">Event Title</label>
                <input
                  type="text"
                  id="event-title"
                  name="title"
                  value={eventFormData.title}
                  onChange={handleEventInputChange}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition"
                  placeholder="Enter event title..."
                  required
                />
              </div>
              <div>
                <label htmlFor="event-description" className="block mb-2 text-gray-300 font-medium">Event Description</label>
                <textarea
                  id="event-description"
                  name="description"
                  value={eventFormData.description}
                  onChange={handleEventInputChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition resize-none"
                  placeholder="Enter event description..."
                  required
                />
              </div>
              <div>
                <label htmlFor="event-image" className="block mb-2 text-gray-300 font-medium">Image (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    id="event-image"
                    accept="image/*"
                    onChange={handleEventImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                  <label
                    htmlFor="event-image"
                    className="flex items-center justify-center gap-2 w-full p-3 bg-[#0f172a] text-gray-400 border border-gray-700 rounded-xl hover:border-blue-600 cursor-pointer transition"
                  >
                    <Upload size={20} />
                    <span>{eventFormData.image ? eventFormData.image.name : 'Choose an image'}</span>
                  </label>
                </div>
                {eventImagePreview && (
                  <div className="mt-3 relative">
                    <img 
                      src={eventImagePreview} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEventFormData(prev => ({ ...prev, image: null }));
                        setEventImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Adding Event...' : 'Add Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEditEventModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Edit Community Event</h2>
              <button 
                onClick={() => {
                  setIsEditEventModalOpen(false);
                  setEventFormData({ title: '', description: '', image: null });
                  setEventImagePreview(null);
                  setEditingEventId(null);
                }}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-200 transition hover:bg-gray-800 p-2 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditCommunityEvent} className="space-y-5">
              <div>
                <label htmlFor="edit-event-title" className="block mb-2 text-gray-300 font-medium">Event Title</label>
                <input
                  type="text"
                  id="edit-event-title"
                  name="title"
                  value={eventFormData.title}
                  onChange={handleEventInputChange}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition"
                  placeholder="Enter event title..."
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-event-description" className="block mb-2 text-gray-300 font-medium">Event Description</label>
                <textarea
                  id="edit-event-description"
                  name="description"
                  value={eventFormData.description}
                  onChange={handleEventInputChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full p-3 bg-[#0f172a] text-gray-100 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 transition resize-none"
                  placeholder="Enter event description..."
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-event-image" className="block mb-2 text-gray-300 font-medium">Image (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    id="edit-event-image"
                    accept="image/*"
                    onChange={handleEventImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-event-image"
                    className="flex items-center justify-center gap-2 w-full p-3 bg-[#0f172a] text-gray-400 border border-gray-700 rounded-xl hover:border-blue-600 cursor-pointer transition"
                  >
                    <Upload size={20} />
                    <span>{eventFormData.image ? eventFormData.image.name : 'Choose a new image'}</span>
                  </label>
                </div>
                {eventImagePreview && (
                  <div className="mt-3 relative">
                    <img 
                      src={eventImagePreview} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEventFormData(prev => ({ ...prev, image: null }));
                        setEventImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Updating Event...' : 'Update Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}