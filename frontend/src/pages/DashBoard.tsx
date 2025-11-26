// src/pages/DashboardPage.tsx (Updated)

import React, { useState, useEffect, useCallback } from "react";
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
import WorkshopModal from "../components/WorkshopModal";
import type { Workshop } from "../components/WorkshopModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal.tsx";
import WorkshopCard from "../components/WorkshopCard";
import PageLoader from "../components/common/PageLoader";
import { usePageStatus } from "../hooks/usePageStatus";

// ============ TypeScript Interfaces ============

interface UserInfo {
  name: string;
  role: string;
  committee: string;
  points: number;
  memo_tokens: number;
}

interface Contribution {
  id: string;
  title: string;
  date: string;
  description?: string;
}

interface MeetingAttendance {
  attended: number;
  total: number;
}

interface DashboardState {
  userInfo: UserInfo;
  contributions: Contribution[];
  workshops: Workshop[];
  meetingAttendance: MeetingAttendance;
}

// API Response type matching your Flask endpoint
interface DashboardApiResponse {
  msg: string;
  user_info: {
    name?: string;
    role?: string;
    committee?: string;
    points?: number;
    memo_tokens?: number;
  };
  contributions: Array<{
    id: string;
    title: string;
    date: string;
    description?: string;
  }>;
  workshops?: Workshop[];
}

// ============ Sub-Components ============

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  colorClass,
}) => (
  <div className="bg-[#1a2f55] p-4 rounded-xl flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#254b80]">
      <Icon className={colorClass} size={24} />
    </div>
    <p className="text-2xl font-bold text-white">
      {typeof value === "number" ? (
        <CountUp end={value} duration={2.5} />
      ) : (
        value || "N/A"
      )}
    </p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className = "",
  action,
}) => (
  <div className={`bg-[#1a2f55] rounded-xl p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-[#b3d9ff]">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ============ Default/Initial State ============

const initialDashboardState: DashboardState = {
  userInfo: {
    name: "",
    role: "Member",
    committee: "N/A",
    points: 0,
    memo_tokens: 0,
  },
  contributions: [],
  workshops: [],
  meetingAttendance: { attended: 0, total: 0 },
};

// ============ Main Component ============

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<DashboardState>(initialDashboardState);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] =
    useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load dashboard data."
  );

  // Memoized fetch function to avoid dependency issues
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/dashboard/dashboard",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: DashboardApiResponse = await response.json();

      // Map API response to component state with proper defaults
      const userInfoFromApi = result.user_info;

      setDashboardData({
        userInfo: {
          name: userInfoFromApi?.name ?? "",
          role: userInfoFromApi?.role ?? "Member",
          committee: userInfoFromApi?.committee ?? "N/A",
          points: userInfoFromApi?.points ?? 0,
          memo_tokens: userInfoFromApi?.memo_tokens ?? 0,
        },
        contributions: result.contributions ?? [],
        workshops: result.workshops ?? [],
        meetingAttendance: initialDashboardState.meetingAttendance,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      if (error instanceof Error) {
        handleError(error, "Unable to load your dashboard.");
      } else {
        handleError(
          new Error("Unknown error occurred"),
          "Unable to load your dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, handleError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format date helper
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Generate unique ID
  const generateId = (): string => {
    return `workshop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle workshop creation
  const handleCreateWorkshop = async (
    workshopData: Omit<Workshop, "id">
  ): Promise<void> => {
    setIsSubmitting(true);

    try {
      // API call to create workshop
      const response = await fetch(
        "http://127.0.0.1:5000/api/workshops/create",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workshopData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create workshop: ${response.status}`);
      }

      const result = await response.json();

      // Add to local state
      const newWorkshop: Workshop = {
        ...workshopData,
        id: result.id || generateId(),
      };

      setDashboardData((prev) => ({
        ...prev,
        workshops: [newWorkshop, ...prev.workshops],
      }));

      setIsWorkshopModalOpen(false);
    } catch (error) {
      console.error("Error creating workshop:", error);

      // For demo: Add locally even if API fails
      const newWorkshop: Workshop = {
        ...workshopData,
        id: generateId(),
      };

      setDashboardData((prev) => ({
        ...prev,
        workshops: [newWorkshop, ...prev.workshops],
      }));

      setIsWorkshopModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle workshop deletion request
  const handleDeleteRequest = (workshop: Workshop): void => {
    setWorkshopToDelete(workshop);
    setIsDeleteModalOpen(true);
  };

  // Handle workshop deletion confirmation
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!workshopToDelete) return;

    setIsDeleting(true);

    try {
      // API call to delete workshop
      const response = await fetch(
        `http://127.0.0.1:5000/api/workshops/${workshopToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete workshop: ${response.status}`);
      }

      // Remove from local state
      setDashboardData((prev) => ({
        ...prev,
        workshops: prev.workshops.filter((w) => w.id !== workshopToDelete.id),
      }));
    } catch (error) {
      console.error("Error deleting workshop:", error);

      // For demo: Remove locally even if API fails
      setDashboardData((prev) => ({
        ...prev,
        workshops: prev.workshops.filter((w) => w.id !== workshopToDelete?.id),
      }));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setWorkshopToDelete(null);
    }
  };

  // Modal handlers
  const openProjectModal = (): void => setIsProjectModalOpen(true);
  const closeProjectModal = (): void => setIsProjectModalOpen(false);
  const openWorkshopModal = (): void => setIsWorkshopModalOpen(true);
  const closeWorkshopModal = (): void => {
    if (!isSubmitting) {
      setIsWorkshopModalOpen(false);
    }
  };
  const closeDeleteModal = (): void => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setWorkshopToDelete(null);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading Dashboard..." />;
  }

  const { userInfo, contributions, workshops, meetingAttendance } =
    dashboardData;

  return (
    <>
      <main className="min-h-screen bg-[#0a1a33] p-4 sm:p-6 lg:p-8 font-poppins">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Profile & Workshops */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Profile Card */}
            <div className="relative h-96 lg:h-auto lg:aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg bg-gray-800">
              <img
                src="/assets/hod&ch/rishab.jpg"
                alt={userInfo.name || "User Profile"}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/default-avatar.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h2 className="text-3xl font-bold">
                  Welcome, {userInfo.name || "Member"}!
                </h2>
                <p className="text-md text-gray-200">{userInfo.role}</p>
              </div>
            </div>

            {/* Workshops Card with Create Button */}
            <DashboardCard
              title="Workshops"
              action={
                <button
                  type="button"
                  onClick={openWorkshopModal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#4a90d9] hover:bg-[#3a7bc8] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Create
                </button>
              }
            >
              <div className="flex flex-col space-y-3 max-h-96 overflow-y-auto">
                {workshops.length > 0 ? (
                  workshops.map((workshop) => (
                    <WorkshopCard
                      key={workshop.id}
                      workshop={workshop}
                      onDelete={handleDeleteRequest}
                      canDelete={true}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto text-gray-500 mb-3" size={40} />
                    <p className="text-gray-400 text-sm">
                      No workshops created yet.
                    </p>
                    <button
                      type="button"
                      onClick={openWorkshopModal}
                      className="mt-3 text-[#4a90d9] hover:text-[#3a7bc8] text-sm font-medium"
                    >
                      Create your first workshop
                    </button>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={User}
                label="Role"
                value={userInfo.role}
                colorClass="text-blue-300"
              />
              <StatCard
                icon={Star}
                label="Points"
                value={userInfo.points}
                colorClass="text-yellow-300"
              />
              <StatCard
                icon={Users}
                label="Committee"
                value={userInfo.committee}
                colorClass="text-green-300"
              />
              <StatCard
                icon={Coins}
                label="Memo Tokens"
                value={userInfo.memo_tokens}
                colorClass="text-amber-400"
              />
            </div>

            {/* Contributions Card */}
            <DashboardCard title="Recent Contributions">
              <ul className="space-y-4">
                {contributions.length > 0 ? (
                  contributions.map((item) => (
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
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(item.date)}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-300 mt-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No contributions yet. Start contributing!
                  </p>
                )}
              </ul>
            </DashboardCard>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meeting Attendance */}
              <DashboardCard
                title="Meeting Attendance"
                className="flex flex-col justify-center items-center"
              >
                <div className="flex items-center gap-4">
                  <CalendarCheck className="text-green-400" size={40} />
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {meetingAttendance.attended} / {meetingAttendance.total}
                    </p>
                    <p className="text-sm text-gray-400">Meetings Attended</p>
                  </div>
                </div>
              </DashboardCard>

              {/* Start Project Button */}
              <button
                type="button"
                onClick={openProjectModal}
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

      {/* Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={closeProjectModal}
        userName={userInfo.name}
      />

      {/* Workshop Modal */}
      <WorkshopModal
        isOpen={isWorkshopModalOpen}
        onClose={closeWorkshopModal}
        onSubmit={handleCreateWorkshop}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Workshop"
        message="Are you sure you want to delete this workshop?"
        itemName={workshopToDelete?.title ?? ""}
        isDeleting={isDeleting}
      />
    </>
  );
}