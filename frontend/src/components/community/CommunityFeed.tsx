// src/components/CommunityFeed.tsx

import { useState, useEffect } from "react";
import {
  Plus,
  MessageCircle,
  ThumbsUp,
  Image,
  BarChart3,
  Trophy,
  X,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// Type definitions for Comment data structure
interface Comment {
  id: number;
  backendId: number | string | undefined; // Fixed: explicitly typed
  author: string;
  avatar: string;
  content: string;
  time: string;
}

// Type definitions for Post data structure
interface Post {
  id: number;
  backendId: number | string | undefined; // Fixed: explicitly typed
  author: string;
  avatar: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
}

// Props interface for PostModal component
interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSubmit: (title: string, content: string) => Promise<void>;
}

// Props interface for CommentsModal component
interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | string; // Accept both number and string
  postAuthor: string;
  postTitle: string;
}

// Type for API response data - using unknown for flexible arrays
type ApiResponse = 
  | unknown[]
  | {
      comments?: unknown[];
      posts?: unknown[];
      data?: unknown[];
      [key: string]: unknown;
    };

// Type for potential object values in API responses
interface PotentialObject {
  text?: unknown;
  name?: unknown;
  username?: unknown;
  [key: string]: unknown;
}

/**
 * Utility function to safely extract string from any value
 */
const extractString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const obj = value as PotentialObject;
    // Handle objects with text, user, or other common fields
    if ('text' in obj && obj.text) return String(obj.text);
    if ('name' in obj && obj.name) return String(obj.name);
    if ('username' in obj && obj.username) return String(obj.username);
  }
  return String(value || '');
};

/**
 * Utility function to safely extract backend ID from unknown value
 */
const extractBackendId = (value: unknown): number | string | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value;
  return undefined;
};

/**
 * Utility function to normalize comment data from API
 */
const normalizeComment = (comment: unknown): Comment => {
  const obj = (comment as Record<string, unknown>) || {};
  
  // Helper function to safely convert to number
  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Get the original backend ID (could be string or number)
  const backendId = extractBackendId(obj.id || obj._id);
  
  // Generate a unique display ID if backend doesn't provide one
  const generateDisplayId = (): number => {
    const id = toNumber(backendId);
    // If ID is 0 or invalid, generate a unique timestamp-based ID for React keys
    return id !== 0 ? id : Date.now() + Math.random() * 1000;
  };

  return {
    id: generateDisplayId(), // For React keys
    backendId: backendId, // Original backend ID for API calls
    author: extractString(obj.author || obj.user || obj.username || 'Anonymous'),
    avatar: extractString(obj.avatar || obj.user_avatar || obj.profile_picture || '/avatars/default.png'),
    content: extractString(obj.content || obj.text || obj.comment || ''),
    time: extractString(obj.time || obj.created_at || obj.timestamp || 'Just now'),
  };
};

/**
 * Utility function to normalize post data from API
 */
const normalizePost = (post: unknown): Post => {
  const obj = (post as Record<string, unknown>) || {};
  
  // Helper function to safely convert to number
  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Get the original backend ID (could be string or number)
  const backendId = extractBackendId(obj.id || obj._id);
  
  // Generate a unique display ID if backend doesn't provide one
  const generateDisplayId = (): number => {
    const id = toNumber(backendId);
    // If ID is 0 or invalid, generate a unique timestamp-based ID for React keys
    return id !== 0 ? id : Date.now() + Math.random() * 1000;
  };

  // Log if backend doesn't provide a valid ID
  if (!backendId) {
    console.warn('⚠️ Post missing ID from backend:', obj);
  }

  return {
    id: generateDisplayId(), // For React keys
    backendId: backendId, // Original backend ID for API calls
    author: extractString(obj.author || obj.user || obj.username || 'Anonymous'),
    avatar: extractString(obj.avatar || obj.user_avatar || obj.profile_picture || '/avatars/default.png'),
    time: extractString(obj.time || obj.created_at || obj.timestamp || 'Just now'),
    title: extractString(obj.title || ''),
    content: extractString(obj.content || obj.text || obj.body || ''),
    likes: toNumber(obj.likes || obj.like_count || obj.likes_count || 0),
    comments: toNumber(obj.comments || obj.comment_count || obj.comments_count || 0),
  };
};

/**
 * PostModal Component
 * Modal dialog for creating new posts with title and content
 */
const PostModal = ({ isOpen, onClose, onPostSubmit }: PostModalProps) => {
  const [postTitle, setPostTitle] = useState<string>("");
  const [postContent, setPostContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (postTitle.trim() && postContent.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await onPostSubmit(postTitle, postContent);
      setPostTitle("");
      setPostContent("");
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#102a4e] rounded-2xl p-8 shadow-lg w-full max-w-lg relative transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Create a Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] mb-4"
            disabled={isSubmitting}
            maxLength={100}
          />
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share something with your community..."
            className="w-full h-40 bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] resize-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}
            className="w-full mt-6 bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-3 rounded-full font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * CommentsModal Component
 * Modal dialog for viewing and adding comments to a post
 */
const CommentsModal = ({
  isOpen,
  onClose,
  postId,
  postAuthor,
  postTitle,
}: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  /**
   * Handles image load errors
   */
  const handleImageError = (src: string) => {
    setImageErrors((prev) => new Set(prev).add(src));
  };

  /**
   * Fetches comments for the specific post
   */
  const fetchComments = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`Fetching comments for post ${postId}`);

      const response = await fetch(
        `http://127.0.0.1:5000/api/posts/comments/${postId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("Received comments data:", data);

      // Handle different response formats and normalize
      let commentsArray: unknown[] = [];
      
      if (Array.isArray(data)) {
        commentsArray = data;
      } else if (typeof data === 'object' && data !== null) {
        const objData = data as Record<string, unknown>;
        if (objData.comments && Array.isArray(objData.comments)) {
          commentsArray = objData.comments;
        } else if (objData.data && Array.isArray(objData.data)) {
          commentsArray = objData.data;
        }
      }

      if (commentsArray.length === 0) {
        console.warn("Unexpected data format:", data);
      }

      // Normalize all comments
      const normalizedComments = commentsArray.map(normalizeComment);
      setComments(normalizedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments.");
      toast.error("Failed to load comments");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments when modal opens or postId changes
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
      setImageErrors(new Set()); // Reset image errors when modal opens
    }
    // Reset state when modal closes
    if (!isOpen) {
      setComments([]);
      setNewComment("");
      setError(null);
      setImageErrors(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]);

  /**
   * Handles submitting a new comment
   */
  const handleSubmitComment = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!newComment.trim() || isSubmitting) return;

    const loadingToast = toast.loading("Posting comment...");

    try {
      setIsSubmitting(true);

      console.log(`Posting comment to post ${postId}:`, newComment);

      const response = await fetch(
        `http://127.0.0.1:5000/api/posts/posts/${postId}/comment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            comment: newComment,
          }),
        }
      );

      console.log("Comment post response status:", response.status);

      if (!response.ok) {
        const errorData: { message?: string } = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(
          errorData.message || 
          `HTTP error! status: ${response.status}`
        );
      }

      const newCommentData: unknown = await response.json();
      console.log("New comment created:", newCommentData);

      // Normalize the comment before adding
      const normalizedComment = normalizeComment(newCommentData);
      setComments([normalizedComment, ...comments]);
      setNewComment("");
      
      toast.success("Comment posted successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Error submitting comment:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to post comment";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles keyboard shortcuts for comment submission
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#102a4e] rounded-2xl p-8 shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col relative transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">Comments</h3>
            <p className="text-gray-400 text-sm mt-1">
              {postTitle} by {postAuthor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 noScroll">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-pulse">Loading comments...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchComments}
                className="text-[#5ea4ff] hover:underline"
              >
                Retry
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle className="mx-auto mb-3 opacity-50" size={48} />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[#1a2f55] rounded-xl p-4 hover:bg-[#1f3660] transition animate-fade-in-up"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={imageErrors.has(comment.avatar) ? "/avatars/default.png" : comment.avatar}
                      alt={`${comment.author}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={() => handleImageError(comment.avatar)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white text-sm">
                          {comment.author}
                        </p>
                        <span className="text-gray-500 text-xs">
                          · {comment.time}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input Form */}
        <form
          onSubmit={handleSubmitComment}
          className="border-t border-[#1a2f55] pt-4"
        >
          <div className="flex items-end gap-3">
            <img
              src="/avatars/you.png"
              alt="Your Avatar"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = "/avatars/default.png";
              }}
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] resize-none"
                rows={2}
                disabled={isSubmitting}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              aria-label="Send comment"
            >
              {isSubmitting ? (
                <div className="animate-spin">⏳</div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Press Ctrl+Enter to submit
          </p>
        </form>
      </div>
    </div>
  );
};

/**
 * CommunityFeed Component
 * Main component for displaying and managing community posts
 */
export default function CommunityFeed() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [commentsModalState, setCommentsModalState] = useState<{
    isOpen: boolean;
    postId: number | string | null;
    postAuthor: string;
    postTitle: string;
  }>({
    isOpen: false,
    postId: null,
    postAuthor: "",
    postTitle: "",
  });
  const [feedItems, setFeedItems] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  /**
   * Handles image load errors for posts
   */
  const handleImageError = (src: string) => {
    setImageErrors((prev) => new Set(prev).add(src));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /**
   * Fetches all posts from the API
   */
  const fetchPosts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("http://127.0.0.1:5000/api/posts/posts", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("Received posts data:", data);

      // Handle different response formats
      let postsArray: unknown[] = [];
      
      if (Array.isArray(data)) {
        postsArray = data;
      } else if (typeof data === 'object' && data !== null) {
        const objData = data as Record<string, unknown>;
        if (objData.posts && Array.isArray(objData.posts)) {
          postsArray = objData.posts;
        } else if (objData.data && Array.isArray(objData.data)) {
          postsArray = objData.data;
        }
      }

      if (postsArray.length === 0) {
        console.warn("API response is not an array:", data);
      }

      // Normalize all posts
      const normalizedPosts = postsArray.map(normalizePost);
      console.log("Normalized posts with backend IDs:", normalizedPosts.map(p => ({ displayId: p.id, backendId: p.backendId })));
      setFeedItems(normalizedPosts);
      setImageErrors(new Set()); // Reset image errors on new fetch
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
      toast.error("Failed to load posts");
      setFeedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Creates a new post via API
   */
  const handleAddPost = async (
    title: string,
    content: string
  ): Promise<void> => {
    const loadingToast = toast.loading("Creating post...");
    
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/posts/create-post",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            title: title,
            content: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPostData: unknown = await response.json();
      const newPost = normalizePost(newPostData);
      setFeedItems([newPost, ...feedItems]);
      
      toast.success("Post created successfully!", { id: loadingToast });
    } catch (err) {
      console.error("Error creating post:", err);
      toast.error("Failed to create post. Please try again.", { id: loadingToast });
    }
  };

  /**
   * Handles liking a post
   * Uses backendId if available, otherwise falls back to id
   */
  const handleLike = async (post: Post): Promise<void> => {
    const apiId = post.backendId || post.id;
    console.log(`Liking post with backend ID: ${apiId}`);
    
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/posts/posts/${apiId}/like`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistic update - use display id for state update
      setFeedItems(
        feedItems.map((p) =>
          p.id === post.id ? { ...p, likes: p.likes + 1 } : p
        )
      );
      
      toast.success("Post liked!");
    } catch (err) {
      console.error("Error liking post:", err);
      toast.error("Failed to like post");
      // Revert on error
      await fetchPosts();
    }
  };

  /**
   * Opens the comments modal for a specific post
   * Uses backendId for API calls
   */
  const openCommentsModal = (post: Post): void => {
    const apiId = post.backendId || post.id;
    console.log("Opening comments modal for post with backend ID:", apiId);
    
    setCommentsModalState({
      isOpen: true,
      postId: apiId, // Use backend ID for API calls
      postAuthor: post.author,
      postTitle: post.title,
    });
  };

  /**
   * Closes the comments modal
   */
  const closeCommentsModal = (): void => {
    setCommentsModalState({
      isOpen: false,
      postId: null,
      postAuthor: "",
      postTitle: "",
    });
    // Refresh posts to update comment count
    fetchPosts();
  };

  return (
    <>
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a2f55',
            color: '#fff',
            border: '1px solid #3e5a8a',
          },
          success: {
            iconTheme: {
              primary: '#5ea4ff',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Post Creation Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostSubmit={handleAddPost}
      />

      {/* Comments Modal - Only render when we have a valid postId */}
      {commentsModalState.postId !== null && (
        <CommentsModal
          isOpen={commentsModalState.isOpen}
          onClose={closeCommentsModal}
          postId={commentsModalState.postId}
          postAuthor={commentsModalState.postAuthor}
          postTitle={commentsModalState.postTitle}
        />
      )}

      <section className="min-h-screen flex flex-col justify-center items-center my-15 px-4 sm:px-5">
        {/* Header Section */}
        <div className="flex flex-col my-6 items-center">
          <h2 className="text-6xl font-bold text-[#9cc9ff]">
            Where Members Connect
          </h2>
          <p className="text-gray-400 w-[70%] text-center">
            Connect, share, explore, and engage — where every member's voice and
            creativity come together.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl w-full mx-auto mt-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Navigation */}
          <div>
            <aside className="lg:col-span-1 flex flex-col gap-6">
              <Link to="/GalleryPage">
                <button className="w-full h-[15%] md:h-[50%] flex flex-row md:flex-col justify-center items-center gap-4 text-2xl font-md bg-[#1a2f55] hover:bg-[#254272] px-6 py-4 rounded-xl font-semibold transition transform hover:scale-105">
                  <Image className="text-[#9cc9ff]" size={30} /> Gallery
                </button>
              </Link>
              <Link to="/PollsPage">
                <button className="w-full h-[15%] md:h-[50%] flex flex-row md:flex-col justify-center items-center gap-4 text-2xl font-md bg-[#1a2f55] hover:bg-[#254272] px-6 py-4 rounded-xl font-semibold transition transform hover:scale-105">
                  <BarChart3 className="text-[#9cc9ff]" size={30} /> Polls
                </button>
              </Link>
              <Link to="/WallOfLegends">
                <button className="w-full h-[15%] md:h-[50%] flex flex-row md:flex-col justify-center items-center gap-4 text-2xl font-md bg-[#1a2f55] hover:bg-[#254272] px-6 py-4 rounded-xl font-semibold transition transform hover:scale-105">
                  <Trophy className="text-[#9cc9ff]" size={30} /> Leaderboard
                </button>
              </Link>
            </aside>
          </div>

          {/* Main Feed Section */}
          <div className="lg:col-span-3">
            {/* Post Creation Input Box */}
            <div className="bg-[#102a4e] p-4 rounded-2xl flex items-center gap-4 mb-8 shadow-lg">
              <img
                src="/avatars/you.png"
                alt="Your Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <input
                type="text"
                placeholder="Share something with your community..."
                className="w-full bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
                onFocus={() => setIsModalOpen(true)}
                readOnly
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-3 rounded-full transition"
                aria-label="Create new post"
              >
                <Plus size={24} />
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-pulse">Loading posts...</div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center text-red-400 py-8 bg-[#102a4e] rounded-2xl">
                {error}
                <button
                  onClick={fetchPosts}
                  className="ml-4 text-[#5ea4ff] hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Posts Feed */}
            {!isLoading && !error && (
              <div className="flex flex-col gap-6 overflow-scroll overflow-x-hidden noScroll h-[550px] pr-2">
                {feedItems.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 bg-[#102a4e] rounded-2xl">
                    No posts yet. Be the first to share something!
                  </div>
                ) : (
                  feedItems.map((item: Post) => (
                    <div
                      key={item.id}
                      className="bg-[#102a4e] rounded-2xl p-6 shadow-lg animate-fade-in-up"
                    >
                      {/* Post Header */}
                      <div className="flex items-start gap-4">
                        <img
                          src={imageErrors.has(item.avatar) ? "../../assets/user.png" : item.avatar}
                          alt={`${item.author}'s avatar`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={() => handleImageError(item.avatar)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">{item.author}</p>
                            <span className="text-gray-500 text-sm">
                              · {item.time}
                            </span>
                          </div>
                          {item.title && (
                            <h4 className="mt-2 text-lg font-semibold text-white">
                              {item.title}
                            </h4>
                          )}
                          <p className="mt-2 text-gray-300 whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="mt-4 pt-4 border-t border-[#1a2f55] flex justify-around items-center text-gray-400">
                        <button
                          onClick={() => handleLike(item)}
                          className="flex items-center gap-2 hover:text-[#5ea4ff] transition"
                          aria-label={`Like post by ${item.author}`}
                        >
                          <ThumbsUp size={18} /> {item.likes} Likes
                        </button>
                        <button
                          onClick={() => openCommentsModal(item)}
                          className="flex items-center gap-2 hover:text-[#5ea4ff] transition"
                          aria-label={`View comments on post by ${item.author}`}
                        >
                          <MessageCircle size={18} /> 
                          {item.comments > 0 ? `${item.comments} Comments` : 'Comment'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}