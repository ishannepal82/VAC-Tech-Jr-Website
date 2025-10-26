import React, { useEffect, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import type { GalleryPost } from "../../data/gallery";

interface MemoryLaneFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (post: GalleryPost) => void;
  maxPhotos?: number;
  willSpendToken: boolean;
}

export default function MemoryLaneForm({
  isOpen,
  onClose,
  onCreate,
  maxPhotos = 20,
  willSpendToken,
}: MemoryLaneFormProps): React.ReactElement | null {
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setAuthor("");
      setFiles([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    const next = [...files, ...selected].slice(0, maxPhotos);
    setFiles(next);
  };

  const removeFileAt = (idx: number): void => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = (): void => {
    if (!title.trim() || !author.trim() || files.length === 0) return;

    // NOTE: Replace with your upload flow. These object URLs are for preview/demo only.
    const photos: string[] = files.map((f) => URL.createObjectURL(f));
    const newPost: GalleryPost = {
      id: `g_${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      createdAt: "Just now",
      photos,
    };
    onCreate(newPost);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-101 max-h-[500vh] bg-black/60 flex items-center overflow-scroll overflow-x-hidden justify-center px-4"
    >
      <div className="w-full max-h-[200vh] max-w-2xl bg-[#0f2444] border border-[#1a2f55] rounded-2xl shadow-2xl overflow-scroll overflow-x-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-[#102a4e] border-b border-[#1a2f55]">
          <div>
            <p className="text-white font-semibold text-lg">New Memory</p>
            <p className="text-gray-400 text-sm">
              This will spend 1 Memo Token • Max {maxPhotos} photos
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

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Gallery Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Hackathon Highlights"
                className="w-full bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Author</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
              />
            </div>
          </div>

          {/* Upload */}
          <div className="bg-[#102a4e] border border-[#1a2f55] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a2f55] text-[#9cc9ff] flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold">Add Photos</p>
                  <p className="text-gray-400 text-sm">
                    {files.length}/{maxPhotos} selected
                  </p>
                </div>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition">
                <Upload size={18} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onSelectFiles}
                />
              </label>
            </div>

            {/* Progress */}
            <div className="mt-3 h-2 w-full bg-[#0b1e3a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5ea4ff]"
                style={{
                  width: `${Math.min((files.length / maxPhotos) * 100, 100)}%`,
                }}
              />
            </div>

            {/* Thumbnails */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {files.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div
                      key={idx}
                      className="group relative rounded-xl overflow-hidden border border-[#1a2f55] bg-[#0b1e3a]"
                    >
                      <img
                        src={url}
                        alt={`preview-${idx}`}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        title="Remove"
                        onClick={() => removeFileAt(idx)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
                        aria-label="Remove photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#102a4e] border-t border-[#1a2f55] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1a2f55] text-gray-300 hover:text-white hover:bg-[#254272] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={
              !willSpendToken ||
              !title.trim() ||
              !author.trim() ||
              files.length === 0
            }
            className={`px-4 py-2 rounded-xl font-semibold transition 
              ${
                willSpendToken &&
                title.trim() &&
                author.trim() &&
                files.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-[#1a2f55] text-gray-500 cursor-not-allowed"
              }`}
          >
            Create Memory
          </button>
        </div>
      </div>
    </div>
  );
}
