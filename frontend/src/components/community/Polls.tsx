import { BarChart3 } from "lucide-react";

export default function PollsPage() {
  return (
    <section className="min-h-screen w-full bg-[#0a192f] text-white flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="mb-6 p-6 bg-[#102a4e] rounded-full">
          <BarChart3 className="text-[#9cc9ff]" size={80} />
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold text-[#9cc9ff] mb-4">
          Community Polls
        </h2>
        
        <div className="bg-[#102a4e] border-2 border-[#3e5a8a] rounded-2xl p-8 mt-6">
          <p className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Coming Soon
          </p>
          <p className="text-gray-400 text-lg">
            We're working hard to bring you an interactive polling feature where you can voice your opinions and see what the community thinks.
          </p>
        </div>

        <div className="mt-8 flex gap-2 items-center text-gray-500">
          <div className="w-2 h-2 bg-[#9cc9ff] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#9cc9ff] rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-[#9cc9ff] rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </section>
  );
}