import { useState } from "react";
import StatCard from "../components/StatCard";
import {
  Users,
  Calendar,
  Lightbulb,
  BarChart3,
  Plus,
  CheckCircle,
} from "lucide-react";
import { useAdminData } from "../context/AdminDataContext";
import Modal from "../components/Modal";
import CountUp from "react-countup";

export default function AdminDashboard() {
  const { members } = useAdminData();

  const totalMembers = members.length;

  const activeEventsCount = 3;
  const pendingProjectsCount = 5;
  const activePollsCount = 2;

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [_isProjectModalOpen, _setIsProjectModalOpen] = useState(false); //TODO:need to make it functional
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Adding new event...");
    setIsEventModalOpen(false);
  };

  const handleApproveProject = () => {
    console.log("Opening project approval screen...");
  };

  const handleAddPoll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Adding new poll...");
    setIsPollModalOpen(false);
  };

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#1e293b] p-6 rounded-lg">
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

        <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-lg"></div>
      </div>

      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Add New Event"
      >
        <form onSubmit={handleAddEvent} className="space-y-4">
          <input
            type="text"
            placeholder="Event Name"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            required
          />
          <input
            type="date"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          />
          <textarea
            placeholder="Description"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white min-h-[100px]"
          />
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

      <Modal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        title="Create New Poll"
      >
        <form onSubmit={handleAddPoll} className="space-y-4">
          <input
            type="text"
            placeholder="Poll Question"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            required
          />
          <p className="text-sm text-gray-400">
            Add options (e.g., "Option 1, Option 2, ...")
          </p>
          <input
            type="text"
            placeholder="Option 1, Option 2, Option 3"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          />
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
