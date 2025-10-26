import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { GalleryPost } from "../../data/gallery";

interface LightboxModalProps {
  isOpen: boolean;
  post: GalleryPost | null;
  onClose: () => void;
}

export default function LightboxModal({
  isOpen,
  post,
  onClose,
}: LightboxModalProps): React.ReactElement | null {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "scroll";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
    >
      <div className="max-w-5xl w-full max-h-[90vh] bg-[#0f2444] border border-[#1a2f55] rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="px-6 py-4 bg-[#102a4e] border-b border-[#1a2f55] flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{post.title}</p>
            <p className="text-gray-400 text-sm truncate">
              by {post.author} • {post.createdAt} • {post.photos.length} photos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1a2f55] text-gray-300 hover:text-white hover:bg-[#254272] transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {post.photos.map((src, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden border border-[#1a2f55] bg-[#0b1e3a]"
              >
                <img
                  src={src}
                  alt={`photo-${idx}`}
                  className="w-full h-56 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
