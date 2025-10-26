// src/components/CommunityFeed.jsx

import { useState } from "react"; // NEW: Import useState
import {
  Plus,
  MessageCircle,
  ThumbsUp,
  Image,
  BarChart3,
  Trophy,
  X, // NEW: Import the 'X' icon for the close button
} from "lucide-react";
import { Link } from "react-router-dom";

// NEW: Moved the initial feed items to a constant outside the component
const initialFeedItems = [
  {
    // NOTE: I made this ID unique. Using duplicate keys in React lists is an anti-pattern.
    id: 1,
    author: "Jane Doe",
    avatar: "/avatars/jane.png",
    time: "2h ago",
    content:
      "Just pushed the latest updates for the 'CodeStream' project. Check out the new dashboard feature!",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "John Smith",
    avatar: "/avatars/john.png",
    time: "5h ago",
    content:
      "Who's excited for the upcoming hackathon? I've got my thinking cap on! 💡",
    likes: 25,
    comments: 8,
  },
  {
    id: 3,
    author: "Alex Ray",
    avatar: "/avatars/alex.png",
    time: "1d ago",
    content:
      "Struggling with a React hook bug. Can anyone with experience in custom hooks take a look? #help",
    likes: 5,
    comments: 15,
  },
];
//model for posting status ui
const PostModal = ({ isOpen, onClose, onPostSubmit }: any) => {
  const [postContent, setPostContent] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim()) {
      onPostSubmit(postContent);
      setPostContent("");
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
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share something with your community..."
            className="w-full h-40 bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] resize-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!postContent.trim()}
            className="w-full mt-6 bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-3 rounded-full font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default function CommunityFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [feedItems, setFeedItems] = useState(initialFeedItems);

  const handleAddPost = (content: string) => {
    const newPost = {
      id: Date.now(),
      author: "Your Name", //TODO: Replace it with actual username from data base
      avatar: "/avatars/you.png", //TODO: Replace it with actual user avatar from data base
      time: "Just now", //TODO:replace it with actual time from data base
      content,
      likes: 0, //TODO:replace it with actual likes from data base
      comments: 0, //TODO:replace it with actual comments from data base
    };
    // Add the new post to the beginning of the feed
    setFeedItems([newPost, ...feedItems]);
  };

  return (
    <>
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostSubmit={handleAddPost}
      />

      <section className="min-h-screen flex flex-col justify-center items-center my-15 px-4 sm:px-5">
        <div className=" flex flex-col my-6 items-center">
          <h2 className="text-6xl  font-bold text-[#9cc9ff]">
            Where Members Connect
          </h2>
          <p className="text-gray-400 w-[70%] text-center">
            Connect, share, explore, and engage — where every member’s voice and
            creativity come together.
          </p>
        </div>

        <div className="max-w-7xl w-full mx-auto mt-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div>
            <aside className="lg:col-span-1 flex flex-col gap-6">
              <Link to="/GalleryPage">
                <button className="w-full h-[15%] md:h-[50%]  flex flex-row  md:flex-col justify-center items-center gap-4 text-2xl font-md  bg-[#1a2f55] hover:bg-[#254272] px-6 py-4 rounded-xl font-semibold transition transform hover:scale-105">
                  <Image className="text-[#9cc9ff] " size={30} /> Gallery
                </button>
              </Link>
              <Link to="/PollsPage">
                <button className="w-full h-[15%] md:h-[50%] flex flex-row md:flex-col justify-center items-center gap-4 text-2xl font-md  bg-[#1a2f55] hover:bg-[#254272] px-6 py-4 rounded-xl font-semibold transition transform hover:scale-105">
                  <BarChart3 className="text-[#9cc9ff] " size={30} /> Polls
                </button>
              </Link>
              <Link to="/WallOfLegends">
                <button className="w-full h-[15%] md:h-[50%] flex flex-row md:flex-col justify-center items-center gap-4 text-2xl font-md bg-[#1a2f55] hover:bg-[#254272] px-6 py-4 rounded-xl font-semibold transition transform hover:scale-105">
                  <Trophy className="text-[#9cc9ff] " size={30} /> Leaderboard
                </button>
              </Link>
            </aside>
          </div>
          <div className="lg:col-span-3">
            {/* Share Box */}
            <div className="bg-[#102a4e] p-4 rounded-2xl flex items-center gap-4 mb-8 shadow-lg">
              <img
                src="/avatars/you.png" //TODO: Using a real data
                alt="Your Avatar"
                className="w-12 h-12 rounded-full"
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
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 overflow-scroll overflow-x-hidden noScroll h-[550px] pr-2">
              {feedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#102a4e] rounded-2xl p-6 shadow-lg animate-fade-in-up"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{item.author}</p>
                        <span className="text-gray-500 text-sm">
                          · {item.time}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-300">{item.content}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#1a2f55] flex justify-around items-center text-gray-400">
                    <button className="flex items-center gap-2 hover:text-[#5ea4ff] transition">
                      <ThumbsUp size={18} /> {item.likes} Likes
                    </button>
                    <button className="flex items-center gap-2 hover:text-[#5ea4ff] transition">
                      <MessageCircle size={18} /> {item.comments} Comments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
