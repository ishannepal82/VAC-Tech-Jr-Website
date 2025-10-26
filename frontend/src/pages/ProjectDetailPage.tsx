// src/pages/ProjectDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // ✨ CHANGED: Import hooks and Link
import type { Project } from "../data/projects";
import { Github, Calendar, Award, ChevronLeft } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);

  const fetchEventsById = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/projects/get-project/${id}`);
      if (!res.ok) {
        console.log('Error Fetching Data:', res);
        return;
      }
      const data = await res.json();
      console.log(data);
      setProject(data.project);
    }
    catch (e) {
      console.log(e);
      return;
    }
  }
  useEffect(() => {
    fetchEventsById(id);
  }, []);
  
  if (!project) {
    return (
      <div className="h-screen w-full bg-[#0a1a33] text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">Project Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a1a33] text-white font-poppins py-12 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/ProjectsSection"
          className="inline-flex items-center gap-2 text-[#9cc9ff] hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          Back to All Projects
        </Link>

        <div className="bg-[#102142] border-2 border-[#3a5a8a] rounded-2xl flex flex-col justify-between overflow-hidden min-h-[75vh]">
          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#9cc9ff] leading-tight">
              {project.name}
            </h1>
            <p className="text-gray-400 mt-2 text-lg">by {project.author}</p>

            <div className="flex flex-wrap gap-x-8 gap-y-4 my-8 border-y border-[#3a5a8a] py-6">
              <div className="flex items-center gap-3">
                <Calendar className="text-[#b3d9ff]" size={24} />
                <div>
                  <p className="text-gray-400 text-sm">Timeframe</p>
                  <p className="text-white font-semibold">
                    {project.timeframe}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="text-yellow-400" size={24} />
                <div>
                  <p className="text-gray-400 text-sm">Reward</p>
                  <p className="text-white font-semibold">
                    {project.points} Points
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              About the Project
            </h2>
            <p className="text-gray-300 leading-relaxed text-base">
              {project.desc}
            </p>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-3">
              {project.technologies?.map((tech) => (
                <span
                  key={tech}
                  className="bg-[#253961] text-[#9cc9ff] px-4 py-2 rounded-full font-medium text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#0a1a33]/60 p-6 border-t-2 border-[#3a5a8a] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-semibold text-lg flex-shrink-0">
                Team:
              </span>
              <div className="flex -space-x-4">
                {project.members.length > 0 ? (
                  project.members.slice(0, 5).map((member, index) => (
                    <div
                      key={index}
                      title={member.name}
                      className="w-12 h-12 rounded-full bg-[#1a2f55] border-2 border-[#5ea4ff] flex items-center justify-center text-lg font-bold"
                    >
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="rounded-full"
                        />
                      ) : (
                        member.charAt(0)
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 italic pl-4">
                    Recruiting members...
                  </span>
                )}
                {project.members.length > 5 && (
                  <div className="w-12 h-12 rounded-full bg-[#0a1a33] border-2 border-[#5ea4ff] flex items-center justify-center text-sm font-bold">
                    +{project.members.length - 5}
                  </div>
                )}
              </div>
            </div>

            <div>
              {!project.is_completed ? (
                <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-full font-semibold text-lg transition w-full sm:w-auto">
                  Join Project
                </button>
              ) : (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border border-[#b3d9ff] text-[#b3d9ff] hover:bg-[#1a2f55] px-8 py-3 rounded-full font-semibold text-lg transition w-full sm:w-auto"
                >
                  <Github size={20} className="mr-3" />
                  View on GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
