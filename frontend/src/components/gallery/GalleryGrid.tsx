import GalleryCard from "./GalleryCard";
import type { GalleryPost } from "../../data/gallery";

interface GalleryGridProps {
  posts: GalleryPost[];
  onOpen: (post: GalleryPost) => void;
}

export default function GalleryGrid({
  posts,
  onOpen,
}: GalleryGridProps): React.ReactElement {
  if (!posts.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">
          No memories yet. Be the first to add one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
      {posts.map((p) => (
        <GalleryCard key={p.id} post={p} onOpen={() => onOpen(p)} />
      ))}
    </div>
  );
}
