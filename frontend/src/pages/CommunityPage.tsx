import CommunityFeed from "../components/community/CommunityFeed";
import NewsAndEvents from "../components/community/NewsAndEvents";

export default function CommunityPage() {
  return (
    <main className="w-full m-0 p-0 bg-[#0a1a33] text-white font-poppins">
      <NewsAndEvents />
      <CommunityFeed />
    </main>
  );
}
