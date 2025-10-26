import { Newspaper } from "lucide-react";

const recentEvent = {
  title: "Live Demo Day: Project Showcase",
  description:
    "Our top teams presented their innovative solutions to a panel of industry experts. The energy was electric!",
  imageUrl:
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop", // Replace with a real image
};

const otherNews = [
  {
    title: "New Partnership with TechCorp",
    excerpt: "We're excited to announce a new collaboration...",
  },
  {
    title: "Workshop: Intro to Docker",
    excerpt: "Join us next Saturday for a hands-on session...",
  },
  {
    title: " Hackathon Winners Announced",
    excerpt: "Congratulations to all the teams who participated...",
  },
  {
    title: " Hackathon Winners Announced",
    excerpt: "Congratulations to all the teams who participated...",
  },
];

export default function NewsAndEvents() {
  return (
    <section className="min-h-screen flex flex-col items-center p-5  bg-[#102a4e]/50">
      <div className="my-5 items-center text-center">
        <h2 className="text-6xl mb-2 font-bold text-[#9cc9ff]">
          Community Hub
        </h2>
        <p className="text-gray-400 w-[75%] m-auto ">
          A collaborative space where students, creators, and tech enthusiasts
          come together to share ideas, work on projects, and grow as a
          community
        </p>
      </div>
      <div className="max-w-7xl w-full p-2 mx-auto">
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 group rounded-2xl overflow-hidden shadow-2xl shadow-[#051122] transform hover:-translate-y-2 transition-all duration-300">
            <div className="relative">
              <img
                src={recentEvent.imageUrl}
                alt="Recent Event"
                className="w-full h-108 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="inline-block bg-[#2563eb] text-xs font-semibold px-3 py-1 rounded-full mb-1">
                  RECENT EVENT
                </span>
                <h3 className="text-3xl font-bold">{recentEvent.title}</h3>
                <p className=" text-gray-200 max-w-2xl">
                  {recentEvent.description}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl  mb-5 font-bold text-[#9cc9ff]">
              More News
            </h1>
            <div className="h-95 overflow-scroll noScroll overflow-x-hidden">
              <div className="flex flex-col gap-2 overflow-y-scroll noScroll  scroll-smooth ">
                {otherNews.map((news, index) => (
                  <div
                    key={index}
                    className="bg-[#1a2f55] p-6 rounded-2xl flex items-start gap-4 hover:bg-[#254272] hover:scale-101 transform transition-all duration-300"
                  >
                    <div className="bg-[#2563eb] p-3 rounded-lg">
                      <Newspaper className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">
                        {news.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {news.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
