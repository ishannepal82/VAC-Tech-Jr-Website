import { Plus, Edit, Trash2 } from "lucide-react";

// Mock Data
const mockFeaturedEvents = [
  {
    id: 1,
    title: "Annual Tech Fair",
    date: "Dec 10",
    description: "Showcasing member projects to the public.",
    image: "https://placehold.co/600x400/0a1a33/9cc9ff?text=Tech+Fair",
  },
  {
    id: 2,
    title: "Charity Code-a-Thon",
    date: "Jan 22",
    description: "Coding for a cause to help local charities.",
    image: "https://placehold.co/600x400/0a1a33/9cc9ff?text=Code-a-Thon",
  },
];
const mockNews = [
  {
    id: 1,
    title: "Club Wins National Award",
    summary: "Our team was awarded for innovation in student projects.",
    date: "Oct 20, 2023",
  },
  {
    id: 2,
    title: "Partnership with TechGiant Inc.",
    summary:
      "A new partnership to provide members with exclusive internship opportunities.",
    date: "Oct 15, 2023",
  },
];

export default function AdminCommunity() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Main Events Section */}
      <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Featured Community Events
          </h2>
          <button className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition">
            <Plus size={18} /> Add Event
          </button>
        </div>
        <div className="space-y-4">
          {mockFeaturedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-[#0f172a] p-3 rounded-lg border border-gray-700 flex items-center gap-4"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-24 h-16 object-cover rounded-md"
              />
              <div className="flex-grow">
                <h3 className="font-bold text-white">{event.title}</h3>
                <p className="text-sm text-gray-400">{event.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="text-blue-400 hover:text-blue-300">
                  <Edit size={18} />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current News Section */}
      <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Current News Updates</h2>
          <button className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition">
            <Plus size={18} /> Add News
          </button>
        </div>
        <div className="space-y-4">
          {mockNews.map((item) => (
            <div
              key={item.id}
              className="bg-[#0f172a] p-3 rounded-lg border border-gray-700 flex items-center gap-4"
            >
              <div className="flex-grow">
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.summary}</p>
                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="text-blue-400 hover:text-blue-300">
                  <Edit size={18} />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
