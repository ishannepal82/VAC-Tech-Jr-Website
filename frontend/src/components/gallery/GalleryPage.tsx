import { useMemo, useState } from "react";
import { Image, Plus } from "lucide-react";
import MemoryLaneForm from "./MemoryLaneForm";
import GalleryGrid from "./GalleryGrid";
import LightboxModal from "./LightboxModal";
import TokenGate from "./TokenGate";
import type { GalleryPost } from "../../data/gallery";

const seedPosts: GalleryPost[] = [
  {
    id: "g1",
    title: "Hackathon 2024 — Day 1",
    author: "Jane Doe",
    createdAt: "2h ago",
    photos: [
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521737604893-0f551eb73d83?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "g2",
    title: "Team Offsite — Memory Lane",
    author: "John Smith",
    createdAt: "1d ago",
    photos: [
      "https://images.unsplash.com/photo-1520975922324-5f9b1d4c4c10?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542831371-32f555c86880?q=80&w=1200&auto=format&fit=crop",
    ],
  },
];

export default function GalleryPage(): React.ReactElement {
  // Simulated Memo Token balance
  const [memoTokens, setMemoTokens] = useState<number>(1);

  const [posts, setPosts] = useState<GalleryPost[]>(seedPosts);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [lightboxPost, setLightboxPost] = useState<GalleryPost | null>(null);

  const canCreate = useMemo(() => memoTokens > 0, [memoTokens]);

  const openForm = (): void => {
    if (!canCreate) return;
    setIsFormOpen(true);
  };

  const closeForm = (): void => setIsFormOpen(false);

  const handleCreateMemory = (newPost: GalleryPost): void => {
    // TODO: Send to backend and replace optimistic state with server response
    setPosts((prev) => [newPost, ...prev]);
    setMemoTokens((prev) => Math.max(prev - 1, 0));
    closeForm();
  };

  return (
    <section className="h-screen w-full flex flex-col bg-[#0b1e3a]">
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-5 pt-8">
        <div className="max-w-7xl w-full mx-auto flex flex-col items-center gap-3">
          <h2 className="text-5xl sm:text-6xlgit font-bold text-[#9cc9ff] text-center">
            Gallery
          </h2>
          <p className="text-gray-400 text-center max-w-3xl">
            Share our Tech and events memories in one place. Create, explore,
            and relive the moments that define us.
          </p>
        </div>

        {/* Controls */}
        <div className="max-w-7xl w-full mx-auto 0 mt-6 justify-center flex items-center  gap-4">
          <TokenGate memoTokens={memoTokens} />
          <button
            onClick={openForm}
            disabled={!canCreate}
            className={`flex items-center gap-3 text-lg font-semibold px-5 py-3 rounded-xl transition transform hover:scale-[1.02] shadow-lg
              ${
                canCreate
                  ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                  : "bg-[#1a2f55] text-gray-500 cursor-not-allowed"
              }`}
            title={canCreate ? "Create a new memory" : "No Memo Tokens left"}
          >
            <Plus size={20} />
            Create new Memory
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-scroll overflow-x-hidden">
        <div className="h-full max-w-7xl w-full mx-auto px-4 sm:px-5">
          <div className="h-full flex flex-col">
            {/* Info card */}
            <div className="shrink-0 mt-6 bg-[#102a4e] border border-[#1a2f55] rounded-2xl p-5 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#1a2f55] text-[#9cc9ff] flex items-center justify-center">
                <Image size={26} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Create a Memory</p>
                <p className="text-gray-400 text-sm">
                  Each member has 1 Memo Token. Creating a memory consumes 1
                  token. Max 20 photos per memory.
                </p>
              </div>
            </div>

            {/* Gallery feed */}
            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <GalleryGrid
                posts={posts}
                onOpen={(post) => setLightboxPost(post)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <MemoryLaneForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onCreate={handleCreateMemory}
        maxPhotos={20}
        willSpendToken={canCreate}
      />

      {/* Lightbox */}
      <LightboxModal
        isOpen={!!lightboxPost}
        post={lightboxPost}
        onClose={() => setLightboxPost(null)}
      />
    </section>
  );
}
