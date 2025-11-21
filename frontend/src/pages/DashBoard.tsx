// src/pages/DashboardPage.tsx

import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  User,
  Star,
  Users,
  Coins,
  GitCommit,
  BookOpen,
  CalendarCheck,
  Plus,
} from "lucide-react";
import CreateProjectModal from "../components/CreateProjectModal";
import PageLoader from "../components/common/PageLoader";
import { usePageStatus } from "../hooks/usePageStatus";

export default function DashboardPage() {
  // FIX 1: Change type to `any` to allow for numbers (points, etc.) and strings from API.
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load dashboard data."
  );

  // This static data is fine for parts of the UI not driven by the API (like workshops, contributions)
  const memberData = {
    profileImage: "./src/assets/hod&ch/rishab.jpg",
    contributions: [
      {
        id: 1,
        title: "Auth flow for the new club website",
        date: "2024-07-15",
      },
      { id: 2, title: "Led the 'Intro to React' workshop", date: "2024-07-10" },
      {
        id: 3,
        title: "Designed the event banner for 'CodeFest'",
        date: "2024-06-28",
      },
    ],
    workshopsTaken: ["React Basics", "Figma for Devs", "Node.js Essentials"],
    meetingAttendance: { attended: 12, total: 15 },
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    colorClass,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    colorClass: string;
  }) => (
    <div className="bg-[#1a2f55] p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#254b80]`}
      >
        <Icon className={colorClass} size={24} />
      </div>
      <p className="text-2xl font-bold text-white">
        {typeof value === "number" ? (
          <CountUp end={value} duration={5} />
        ) : (
          value || "N/A"
        )}
      </p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );

  const DashboardCard = ({
    title,
    children,
    className = "",
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`bg-[#1a2f55] rounded-xl p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-[#b3d9ff] mb-4">{title}</h3>
      {children}
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://127.0.0.1:5000/api/dashboard/dashboard",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const jsonData = await response.json();
        const userData = jsonData?.user_info;
        setData(userData || {}); // Use empty object as fallback
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        handleError(error, "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [handleError, setLoading]);

  // Show a loading screen while data is being fetched to prevent errors
  if (isLoading) {
    return <PageLoader message="Loading Dashboard..." />;
  }

  return (
    <>
      <main className="min-h-screen bg-[#0a1a33] p-4 sm:p-6 lg:p-8 font-poppins">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="relative h-96 lg:h-auto lg:aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg">
              <img
                src={memberData.profileImage}
                alt={data.name || "User Profile"}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h2 className="text-3xl font-bold text-shadow-md">
                  Welcome, {data.name}!
                </h2>
                <p className="text-md text-gray-200">{data.role}</p>
              </div>
            </div>

            <DashboardCard title="Workshops Taken">
              <div className="flex flex-col space-y-3">
                {memberData.workshopsTaken.map((workshop, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-[#0a1a33] p-3 rounded-lg"
                  >
                    <div className="bg-[#254b80] p-2 rounded-md mr-3">
                      <BookOpen className="text-[#b3d9ff]" size={20} />
                    </div>
                    <span className="text-gray-200">{workshop}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={User}
                label="Role"
                value={data.role}
                colorClass="text-blue-300"
              />
              <StatCard
                icon={Star}
                label="Points"
                value={data.points}
                colorClass="text-yellow-300"
              />
              <StatCard
                icon={Users}
                label="Committee"
                value={data.committee}
                colorClass="text-green-300"
              />
              <StatCard
                icon={Coins}
                label="Memo Tokens"
                value={data.memo_tokens}
                colorClass="text-amber-400"
              />
            </div>

            <DashboardCard title="Recent Contributions">
              <ul className="space-y-4">
                {memberData.contributions.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-4 p-4 bg-[#0a1a33] rounded-lg transition-colors hover:bg-[#112244]"
                  >
                    <GitCommit
                      className="text-[#9cc9ff] mt-1 flex-shrink-0"
                      size={20}
                    />
                    <div>
                      <p className="font-medium text-gray-200">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </DashboardCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard
                title="Meeting Aspects"
                className="flex flex-col justify-center items-center"
              >
                <div className="flex items-center gap-4">
                  <CalendarCheck className="text-green-400" size={40} />
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {memberData.meetingAttendance.attended} /{" "}
                      {memberData.meetingAttendance.total}
                    </p>
                    <p className="text-sm text-gray-400">Meetings Attended</p>
                  </div>
                </div>
              </DashboardCard>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#254b80] rounded-xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-[#1f3c66] duration-300 hover:scale-105 transition-transform"
              >
                <div className="w-20 h-20 bg-[#1a2f55] rounded-full flex items-center justify-center mb-4">
                  <Plus className="text-[#b3d9ff]" size={40} />
                </div>
                <h4 className="font-semibold text-lg text-[#b3d9ff]">
                  Start a Project
                </h4>
                <p className="text-sm text-gray-300 mt-1">
                  Have an idea? Bring it to life.
                </p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FIX #2: Pass the DYNAMIC user name from the fetched `data` state ===== */}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
