import { Search, Filter, ArrowRight, Gem } from "lucide-react";
import type { Project } from "../data/projects";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { useEffect, useState } from "react";

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-[#1a2f55] border-2 border-[#3a5a8a] hover:border-[#5ea4ff] rounded-xl p-6 transition-all group"
    >
      <div className="flex justify-between rounded-xl items-start gap-4">
        <div className="bg-transparent rounded-xl">
          <h3 className="text-xl font-bold text-white">{project.name}</h3>
          <p className="text-sm text-gray-400 mt-1">by {project.author}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 bg-[#0a1a33] px-3 py-1 rounded-xl border border-yellow-400/50">
          <Gem size={14} className="text-yellow-400" />
          <span className="text-sm font-bold text-yellow-300">
            <CountUp end={project.points} duration={5} /> pts
          </span>
        </div>
      </div>
      <p className="text-gray-300 mt-4 text-base leading-relaxed">
        {project.desc}
      </p>
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-3">
            {project.members.slice(0, 1).map((member, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-[#0a1a33] border-2 border-[#5ea4ff] flex items-center justify-center text-xs font-bold"
              >
                {member.charAt(0)}
              </div>
            ))}
            {project.members.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-[#0a1a33] border-2 border-[#5ea4ff] flex items-center justify-center text-xs font-bold">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-400">
            {project.members.length} member(s)
          </span>
        </div>
        <div className="flex items-center text-[#9cc9ff] group-hover:text-white transition-colors">
          <span className="text-sm font-semibold">
            {project.is_completed ? "Join Project" : "View Details"}
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

export default function ProjectsSection() {
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  const handleFetch = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/projects/projects");
      if (!res.ok) {
        console.log('Error Fetching Data:', res);
        return;
      }
      const data = await res.json();
      console.log(data);
      const projects = data.projects;
      const completed_projects = projects.filter(
      (project: Project) => project.is_completed === true
    );
    setCompletedProjects(completed_projects);
    const available_projects = projects.filter(
      (project: Project) => project.is_completed === false
    );
    setAvailableProjects(available_projects);
    } catch (error) {
      console.log('Error Fetching Data:', error);
    }
  }

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <section
      id="projects"
      className="min-h-screen w-full bg-[#0a1a33] text-white font-poppins py-20 px-4 md:px-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* ---------- HEADER AND SEARCH ---------- */}
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

        {/* ---------- PROJECTS GRID ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-[#102142] border-2 border-[#3a5a8a] rounded-2xl flex flex-col h-[85vh]">
            <h3 className="text-2xl font-bold text-white p-6 border-b border-[#3a5a8a] sticky top-0  z-10">
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
            <h3 className="text-2xl font-bold text-white p-6 border-b border-[#3a5a8a] sticky top-0  z-10">
              Completed Projects
            </h3>
            <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2563eb] scrollbar-track-[#1a2f55]">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
