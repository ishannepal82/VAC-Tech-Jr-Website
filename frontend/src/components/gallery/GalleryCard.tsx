import { Image as ImageIcon, ChevronRight } from "lucide-react";
import type { GalleryPost } from "../../data/gallery";

interface GalleryCardProps {
  post: GalleryPost;
  onOpen: () => void;
}

export default function GalleryCard({
  post,
  onOpen,
}: GalleryCardProps): React.ReactElement {
  const { title, author, createdAt, photos } = post;
  const total = photos.length;
  const firstTwo = photos.slice(0, 2);

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer bg-[#102a4e] border border-[#1a2f55] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 animate-fade-in-up"
    >
      {/* Thumbs */}
      <div className="relative">
        <div
          className={`grid ${
            firstTwo.length === 1 ? "grid-cols-1" : "grid-cols-2"
          } gap-0`}
        >
          {firstTwo.map((src, idx) => (
            <div key={idx} className="h-40 bg-[#0b1e3a] overflow-hidden">
              <img
                src={src}
                alt={`${title}-${idx}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {total > 2 && (
          <div className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-full bg-black/60 text-white text-xs">
            +{total - 2} more
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-semibold leading-tight">{title}</p>
            <p className="text-gray-400 text-sm">
              by {author} • {createdAt}
            </p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-lg bg-[#1a2f55] text-[#9cc9ff] flex items-center justify-center">
            <ImageIcon size={18} />
          </div>
        </div>

        <button
          className="mt-3 inline-flex items-center gap-1 text-[#9cc9ff] hover:text-white transition"
          type="button"
        >
          View all photos <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
