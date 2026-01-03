import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import {
  Users,
  Calendar,
  Lightbulb,
  BarChart3,
  Plus,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Modal from "../components/Modal";
import CountUp from "react-countup";
import { toast } from "sonner";
import PageLoader from "../../components/common/PageLoader";

interface DashboardStats {
  total_members: number;
  active_events: number;
  pending_projects: number;
  active_polls: number;
}

interface DashboardData {
  msg: string;
  is_admin: boolean;
  user_name: string;
  stats: DashboardStats;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://127.0.0.1:5000/api/dashboard/admin-dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Access denied. Admin privileges required.");
          }
          throw new Error("Failed to fetch dashboard data");
        }

        const data: DashboardData = await response.json();
        setDashboardData(data);
        setIsAdmin(data.is_admin);


      } catch (error) {
        console.error("Dashboard fetch error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard";
        toast.error(errorMessage);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Adding new event...");
    toast.success("Event added successfully!");
    setIsEventModalOpen(false);
  };

  const handleApproveProject = () => {
    console.log("Opening project approval screen...");
    toast.info("Navigating to project approvals...");
  };

  const handleAddPoll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Adding new poll...");
    toast.success("Poll created successfully!");
    setIsPollModalOpen(false);
  };

  // Loading state
  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  // Not admin - Show error
  if (!isAdmin) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="max-w-md w-full bg-[#1e293b] p-8 rounded-2xl border-2 border-red-500/30 text-center">
          <div className="mb-6 p-4 bg-red-500/20 rounded-full inline-block">
            <AlertTriangle className="text-red-400" size={64} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have administrator privileges to access this dashboard.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            If you believe this is an error, please contact the system administrator.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get stats from API data
  const totalMembers = dashboardData?.stats?.total_members ?? 0;
  const activeEventsCount = dashboardData?.stats?.active_events ?? 0;
  const pendingProjectsCount = dashboardData?.stats?.pending_projects ?? 0;
  const activePollsCount = dashboardData?.stats?.active_polls ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      {dashboardData?.user_name && (
        <div className="bg-gradient-to-r from-[#2563eb] to-[#5ea4ff] p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {dashboardData.user_name}! 👋
          </h2>
          <p className="text-white/80 mt-2">
            Here's what's happening with your club today.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={<CountUp end={totalMembers} duration={5} />}
          icon={Users}
          color="#5ea4ff"
        />
        <StatCard
          title="Active Events"
          value={<CountUp end={activeEventsCount} duration={5} />}
          icon={Calendar}
          color="#34d399"
        />
        <StatCard
          title="Pending Projects"
          value={<CountUp end={pendingProjectsCount} duration={5} />}
          icon={Lightbulb}
          color="#f59e0b"
        />
        <StatCard
          title="Active Polls"
          value={<CountUp end={activePollsCount} duration={5} />}
          icon={BarChart3}
          color="#a78bfa"
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#1e293b] p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-[#9cc9ff] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-3 rounded-lg font-semibold transition"
            >
              <Plus size={18} /> Add Event
            </button>
            <button
              onClick={handleApproveProject}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
            >
              <CheckCircle size={18} /> Approve Project
            </button>
            <button
              onClick={() => setIsPollModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition"
            >
              <Plus size={18} /> Create Poll
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-[#9cc9ff] mb-4">
            Recent Activity
          </h3>
          <div className="text-gray-400 text-center py-8">
            <p>Activity feed will appear here...</p>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Add New Event"
      >
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              placeholder="Enter event name"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Event Date *
            </label>
            <input
              type="date"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter event description"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold transition"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Poll Modal */}
      <Modal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        title="Create New Poll"
      >
        <form onSubmit={handleAddPoll} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Poll Question *
            </label>
            <input
              type="text"
              placeholder="What's your question?"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Options *
            </label>
            <p className="text-sm text-gray-400 mb-2">
              Separate options with commas
            </p>
            <input
              type="text"
              placeholder="Option 1, Option 2, Option 3"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
              required
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsPollModalOpen(false)}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold transition"
            >
              Create Poll
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}