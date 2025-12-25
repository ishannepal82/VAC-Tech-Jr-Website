import { Search, Filter, ArrowRight, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { useCallback, useEffect, useState } from "react";
import PageLoader from "../components/common/PageLoader";
import { usePageStatus } from "../hooks/usePageStatus";
// --- IMPORTANT: Update your Project type to match the new API response ---
// You should have this in a separate file like `src/data/projects.ts`
export interface Project {
  id: string;
  title: string; // CHANGED from 'name'
  author: string;
  description: string; // CHANGED from 'desc'
  points: number;
  members: { name: string; avatarUrl?: string }[]; // Assuming this structure for members
  is_completed?: boolean; // This field is now MISSING from your API, making it optional is a good practice
  committee: string;
  author_email: string;
  github: string;
  is_approved: boolean;
  project_timeframe: string;
  required_members: number;
}

// --- ProjectCard Component (Updated for new data structure) ---
const ProjectCard = ({ project }: { project: Project }) => {
  // A project is considered joinable if it's not explicitly marked as completed.
  const isJoinable = project.is_completed !== true;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-[#1a2f55] border-2 border-[#3a5a8a] hover:border-[#5ea4ff] rounded-xl p-6 transition-all group"
    >
      <div className="flex justify-between rounded-xl items-start gap-4">
        <div className="bg-transparent rounded-xl">
          {/* CHANGE: Use project.title instead of project.name */}
          <h3 className="text-xl font-bold text-white">{project.title}</h3>
          <p className="text-sm text-gray-400 mt-1">by {project.author}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 bg-[#0a1a33] px-3 py-1 rounded-xl border border-yellow-400/50">
          <Gem size={14} className="text-yellow-400" />
          <span className="text-sm font-bold text-yellow-300">
            <CountUp end={project.points} duration={5} /> pts
          </span>
        </div>
      </div>
      {/* CHANGE: Use project.description instead of project.desc */}
      <p className="text-gray-300 mt-4 text-base leading-relaxed">
        {project.description}
      </p>
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-3">
            {project.members.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-[#0a1a33] border-2 border-[#5ea4ff] flex items-center justify-center text-xs font-bold"
              >
                {/* Assuming members are objects with a 'name' property */}
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-[#0a1a33] border-2 border-[#5ea4ff] flex items-center justify-center text-xs font-bold">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          {/* Show member count only if there are members */}
          {project.members.length > 0 && (
            <span className="text-sm text-gray-400">
              {project.members.length} member(s)
            </span>
          )}
        </div>
        <div className="flex items-center text-[#9cc9ff] group-hover:text-white transition-colors">
          <span className="text-sm font-semibold">
            {isJoinable ? "Join Project" : "View Details"}
          </span>
          <ArrowRight
            size={18}
            className="ml-2 transform group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
};

// --- Main ProjectsSection Component ---
export default function ProjectsSection() {
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load projects."
  );

  const handleFetch = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = "http://127.0.0.1:5000";
      const res = await fetch(`${baseUrl}/api/projects/get-approved-projects`, 
        {credentials: "include"}
      );

      if (!res.ok) {
        console.error("Error Fetching Data:", res);
        const message =
          res.status === 400
            ? "You are not allowed to join the project."
            : "Failed to fetch projects data.";
        handleError(new Error(message), message);
        return;
      }
      const data = await res.json();
      // Use the updated Project type for type safety
      const projects: Project[] = data.projects;

      const completed = projects.filter(
        (project) => project.is_completed === true
      );
      const available = projects.filter(
        (project) => project.is_completed !== true
      );

      setCompletedProjects(completed);
      setAvailableProjects(available);
    } catch (error) {
      console.error("Error Fetching Data:", error);
      handleError(error, "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  if (isLoading) {
    return <PageLoader message="Loading projects..." />;
  }

  return (
    <section
      id="projects"
      className="min-h-screen w-full bg-[#0a1a33] text-white font-poppins py-20 px-4 md:px-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header and Search (No changes needed here) */}
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#9cc9ff]">
            Our Projects
          </h2>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            From concept to completion, our projects are the heart of the club.
            Explore what we're building and what we've achieved.
          </p>
        </div>
        <div className="mt-12 mb-16 max-w-2xl mx-auto">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for a project..."
              className="w-full bg-[#1a2f55] border-2 border-[#3a5a8a] focus:border-[#5ea4ff] focus:ring-0 rounded-full py-3 pl-12 pr-28 text-white placeholder-gray-400 transition"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-full font-semibold text-sm transition">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Available Projects Column */}
          <div className="bg-[#102142] border-2 border-[#3a5a8a] rounded-2xl flex flex-col h-[85vh]">
            <h3 className="text-2xl font-bold text-white p-6 border-b border-[#3a5a8a] sticky top-0 bg-[#102142] z-10">
              Available Projects
            </h3>
            <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2563eb] scrollbar-track-[#1a2f55]">
              {availableProjects.length > 0 ? (
                availableProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center py-10">
                    No available projects at the moment. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Projects Column */}
          <div className="bg-[#102142] border-2 border-[#3a5a8a] rounded-2xl flex flex-col h-[85vh]">
            <h3 className="text-2xl font-bold text-white p-6 border-b border-[#3a5a8a] sticky top-0 bg-[#102142] z-10">
              Completed Projects
            </h3>
            <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2563eb] scrollbar-track-[#1a2f55]">
              {completedProjects.length > 0 ? (
                completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center py-10">
                    No projects have been completed yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}