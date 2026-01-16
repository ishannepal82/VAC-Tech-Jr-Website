import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Image, Plus, Loader2, X, Upload, AlertCircle, ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import TokenGate from "./TokenGate";

// ==================== TYPE DEFINITIONS ====================
type GalleryPost = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  photos: string[];
};

type MemoryResponse = {
  id: string;
  title?: string;
  author?: string;
  created_at: string;
  photos: string[];
};

type ApiError = {
  message?: string;
  msg?: string;
};

// ==================== MAIN COMPONENT ====================
export default function GalleryPage(): React.ReactElement {
  const [memoTokens, setMemoTokens] = useState<number>(0);
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingMemories, setIsFetchingMemories] = useState<boolean>(true);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);

  const canCreate = useMemo(() => memoTokens > 0, [memoTokens]);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setIsFetchingMemories(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/gallery/memories", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch memories");
      const data = await res.json();

      console.log("Fetched data:", data);

      // Set memo tokens from response
      if (typeof data.memo_tokens === 'number') {
        setMemoTokens(data.memo_tokens);
      }

      const transformed: GalleryPost[] = (data.memories || []).map((m: MemoryResponse) => ({
        id: m.id,
        title: m.title || "Untitled Memory",
        author: m.author || "Anonymous",
        createdAt: formatDate(m.created_at),
        photos: Array.isArray(m.photos) ? m.photos : [],
      }));

      setPosts(transformed);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load memories");
      setPosts([]);
      setMemoTokens(0);
    } finally {
      setIsFetchingMemories(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const openForm = (): void => {
    if (!canCreate) {
      toast.error("No memo tokens available");
      return;
    }
    setIsFormOpen(true);
  };

  const closeForm = (): void => setIsFormOpen(false);

  const openGalleryModal = (post: GalleryPost): void => {
    console.log("Opening gallery for post:", post);
    setSelectedPost(post);
  };

  const closeGalleryModal = (): void => {
    setSelectedPost(null);
  };

  const handleCreateMemory = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/gallery/create-memory", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to create memory");

      const createdPost: GalleryPost = {
        id: data.memory?.id || `temp_${Date.now()}`,
        title: data.memory?.title || formData.get('title') as string,
        author: data.memory?.author || formData.get('author') as string,
        createdAt: "Just now",
        photos: data.memory?.photos || [],
      };

      setPosts((prev) => [createdPost, ...prev]);
      
      // Update memo tokens from response
      if (typeof data.memo_tokens === 'number') {
        setMemoTokens(data.memo_tokens);
      }
      
      if (data.total_size_mb) {
        toast.success(`Memory created! Total size: ${data.total_size_mb}MB`);
      } else {
        toast.success("Memory created successfully!");
      }
      
      closeForm();
      setTimeout(fetchMemories, 800);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.message || "Failed to create memory");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="h-screen w-full flex flex-col bg-[#0b1e3a]">
      <div className="shrink-0 px-4 sm:px-5 pt-8">
        <div className="max-w-7xl w-full mx-auto flex flex-col items-center gap-3">
          <h2 className="text-5xl sm:text-6xl font-bold text-[#9cc9ff] text-center">
            Gallery
          </h2>
          <p className="text-gray-400 text-center max-w-3xl">
            Share our Tech and events memories in one place. Create, explore,
            and relive the moments that define us.
          </p>
        </div>

        <div className="max-w-7xl w-full mx-auto mt-6 justify-center flex items-center gap-4">
          <TokenGate memoTokens={memoTokens} />
          <button
            onClick={openForm}
            disabled={!canCreate || isLoading}
            className={`flex items-center gap-3 text-lg font-semibold px-5 py-3 rounded-xl transition transform hover:scale-[1.02] shadow-lg
              ${
                canCreate && !isLoading
                  ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                  : "bg-[#1a2f55] text-gray-500 cursor-not-allowed"
              }`}
            title={canCreate ? "Create a new memory" : "No Memo Tokens left"}
          >
            <Plus size={20} />
            {isLoading ? "Creating..." : "Create new Memory"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-scroll overflow-x-hidden">
        <div className="h-full max-w-7xl w-full mx-auto px-4 sm:px-5">
          <div className="h-full flex flex-col">
            <div className="shrink-0 mt-6 bg-[#102a4e] border border-[#1a2f55] rounded-2xl p-5 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#1a2f55] text-[#9cc9ff] flex items-center justify-center">
                <Image size={26} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Create a Memory</p>
                <p className="text-gray-400 text-sm">
                  Each member has 1 Memo Token. Upload multiple photos (up to 10) to create a memory album. Click on any memory to view all photos.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-6">
              {isFetchingMemories ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-400">Loading memories...</span>
                </div>
              ) : posts.length > 0 ? (
                posts.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => openGalleryModal(p)}
                    className="bg-[#102a4e] border border-[#1a2f55] rounded-xl overflow-hidden hover:border-[#2563eb] transition-all hover:shadow-lg cursor-pointer transform hover:scale-[1.02]"
                  >
                    {p.photos?.[0] ? (
                      <div className="relative">
                        <img
                          src={p.photos[0]}
                          alt={p.title}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                          crossOrigin="anonymous"
                          onLoad={() => console.log("Image loaded:", p.photos[0])}
                          onError={(e) => {
                            console.error("Image failed to load:", p.photos[0]);
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%231a2f55' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239cc9ff' font-size='16'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        {p.photos.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <span className="text-xs text-white font-medium">+{p.photos.length - 1}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-[#1a2f55] flex items-center justify-center">
                        <Image size={32} className="text-gray-500" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-white font-semibold truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">
                        {p.author} • {p.createdAt}
                      </p>
                      {p.photos.length > 1 && (
                        <p className="text-xs text-blue-300 mt-1">{p.photos.length} photos</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 mt-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-[#1a2f55] text-[#9cc9ff] flex items-center justify-center">
                    <Image size={40} />
                  </div>
                  <p className="text-lg font-medium">No memories yet</p>
                  <p className="text-sm mt-2">Be the first to create a memory!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <FileMemoryForm
          onClose={closeForm}
          onSubmit={(formData) => handleCreateMemory(formData)}
          isSubmitting={isLoading}
          defaultAuthor="Anonymous"
        />
      )}

      {selectedPost && (
        <GalleryViewerModal
          post={selectedPost}
          onClose={closeGalleryModal}
        />
      )}
    </section>
  );
}

// ==================== GALLERY VIEWER MODAL ====================
function GalleryViewerModal({
  post,
  onClose
}: {
  post: GalleryPost;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? post.photos.length - 1 : prev - 1));
  }, [post.photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === post.photos.length - 1 ? 0 : prev + 1));
  }, [post.photos.length]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = post.photos[currentIndex];
    link.download = `${post.title}_${currentIndex + 1}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  }, [currentIndex, post.photos, post.title]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, isFullscreen, onClose]);

  console.log("GalleryViewerModal - Current photo:", post.photos[currentIndex]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`relative w-full ${isFullscreen ? 'h-full' : 'max-w-6xl max-h-[90vh]'} flex flex-col`}>
        
        {/* Header */}
        <div className="shrink-0 bg-[#0f172a]/90 backdrop-blur-sm border-b border-[#1a2f55] p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{post.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {post.author} • {post.createdAt} • Photo {currentIndex + 1} of {post.photos.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-[#1a2f55] hover:bg-[#2563eb] text-white transition"
                title="Download"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-[#1a2f55] hover:bg-[#2563eb] text-white transition"
                title="Toggle fullscreen"
              >
                <Maximize2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#1a2f55] hover:bg-red-500 text-white transition"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Image viewer */}
        <div className="flex-1 relative bg-[#0f172a] overflow-hidden rounded-b-xl min-h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {post.photos[currentIndex] ? (
              <img
                key={currentIndex}
                src={post.photos[currentIndex]}
                alt={`${post.title} - Photo ${currentIndex + 1}`}
                className={`${isFullscreen ? 'w-full h-full object-contain' : 'max-w-full max-h-full object-contain'}`}
                loading="eager"
                crossOrigin="anonymous"
                onLoad={() => console.log("Modal image loaded:", post.photos[currentIndex])}
                onError={(e) => {
                  console.error("Modal image failed to load:", post.photos[currentIndex]);
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%231a2f55' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239cc9ff' font-size='20'%3EImage not available%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="text-center text-gray-400">
                <Image size={64} className="mx-auto mb-4 text-gray-500" />
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          {post.photos.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition backdrop-blur-sm z-10"
                title="Previous photo (←)"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition backdrop-blur-sm z-10"
                title="Next photo (→)"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {post.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-black/50 backdrop-blur-sm rounded-lg max-w-[90%] overflow-x-auto z-10">
              {post.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    index === currentIndex 
                      ? 'border-[#2563eb] scale-110' 
                      : 'border-transparent hover:border-gray-500'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== FILE MEMORY FORM ====================
function FileMemoryForm({
  onClose,
  onSubmit,
  isSubmitting,
  defaultAuthor,
}: {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
  defaultAuthor?: string;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(defaultAuthor || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const currentCount = selectedFiles.length;
    const remainingSlots = MAX_FILES - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_FILES} photos allowed`);
      return;
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const validFiles: File[] = [];
    const errors: string[] = [];

    filesToAdd.forEach(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp'];
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(errors[0]);
    }

    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);

      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newUrls]);

      if (filesToAdd.length > validFiles.length) {
        toast.info(`${validFiles.length} of ${filesToAdd.length} files added`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalSize = (): string => {
    const total = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(total);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      return toast.error("Please select at least one photo");
    }

    const formData = new FormData();
    formData.append('title', title || "Untitled Memory");
    formData.append('author', author || "Anonymous");
    
    selectedFiles.forEach((file) => {
      formData.append('photos', file);
    });

    onSubmit(formData);
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0f172a] border border-[#1a2f55] p-6 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Create Memory</h3>
            <p className="text-sm text-gray-400 mt-1">Upload up to {MAX_FILES} photos</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-300">Title</label>
              <input
                className="w-full rounded-lg bg-[#0b1e3a] border border-[#1a2f55] px-3 py-2 text-white outline-none focus:border-[#2563eb] transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Hackathon 2024"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-300">Author</label>
              <input
                className="w-full rounded-lg bg-[#0b1e3a] border border-[#1a2f55] px-3 py-2 text-white outline-none focus:border-[#2563eb] transition"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Photos</label>
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <label 
                className={`flex items-center justify-center w-full rounded-xl bg-[#0b1e3a] border-2 border-dashed px-4 py-8 cursor-pointer transition-all
                  ${isDragging 
                    ? 'border-[#2563eb] bg-[#1a2f55]' 
                    : 'border-[#1a2f55] hover:border-[#2563eb]'
                  }
                  ${selectedFiles.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <Upload size={40} className="text-[#9cc9ff] mb-3" />
                  <span className="text-sm text-gray-300 font-medium">
                    {isDragging ? 'Drop photos here' : 'Click or drag photos here'}
                  </span>
                  <span className="text-xs text-gray-400 mt-2">
                    PNG, JPG, GIF, WEBP (max 10MB each)
                  </span>
                  {selectedFiles.length > 0 && (
                    <span className="text-xs text-blue-300 mt-2">
                      {selectedFiles.length}/{MAX_FILES} photos selected • {getTotalSize()}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= MAX_FILES}
                />
              </label>

              {selectedFiles.length > 0 && (
                <div className="bg-[#0b1e3a] rounded-xl p-3">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-[#1a2f55]">
                          <img
                            src={previewUrls[index]}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <X size={14} />
                        </button>
                        <div className="mt-1">
                          <p className="text-xs text-gray-400 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">
                  Photos will be automatically optimized for better performance using Cloudinary.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#1a2f55]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0}
              className="px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Create Memory
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}