import { useState } from "react";
import {
  Plus,
  Check,
  X,
  Edit,
  Trash2,
  Archive,
  Eye,
  EyeOff,
} from "lucide-react";
import Tabs from "../components/Tabs";
import Modal from "../components/Modal";

// Mock Data
const mockRequests = [
  {
    id: 1,
    title: "Club Website V2",
    memberName: "Jane Doe",
    description:
      "A complete overhaul of the current club website with new features.",
    date: "2023-10-25",
  },
  {
    id: 2,
    title: "Attendance Tracker App",
    memberName: "John Smith",
    description: "A mobile app to track member attendance at events.",
    date: "2023-10-24",
  },
];
const mockApproved = [
  {
    id: 3,
    title: "AI Chatbot for Discord",
    memberName: "Sam Wilson",
    description:
      "Integrate an AI-powered chatbot to answer FAQs on our Discord server.",
    isVisible: true,
  },
];

export default function AdminProjects() {
  const [requests] = useState(mockRequests);
  const [approved] = useState(mockApproved);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);

  const handleApprove = (id: number) => {
    console.log(`Approving project ${id}`);
    // Logic to move from requests to approved
  };

  const handleReject = () => {
    // Logic to reject with reason
    console.log("Rejecting project with reason...");
    setRejectModalOpen(false);
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Project Management</h2>
        <button className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition">
          <Plus size={18} /> Add Manual Project
        </button>
      </div>

      <Tabs
        tabNames={[
          "Approval Requests",
          "Approved Projects",
          "Completed Projects",
        ]}
      >
        {/* Tab 1: Approval Requests */}
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <h3 className="font-bold text-white">{req.title}</h3>
                <p className="text-sm text-gray-400">
                  Submitted by{" "}
                  <span className="font-semibold text-gray-300">
                    {req.memberName}
                  </span>{" "}
                  on {req.date}
                </p>
                <p className="text-sm text-gray-300 mt-2">{req.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tab 2: Approved Projects */}
        <div className="space-y-4">
          {approved.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <h3 className="font-bold text-white">{proj.title}</h3>
                <p className="text-sm text-gray-400">
                  Managed by{" "}
                  <span className="font-semibold text-gray-300">
                    {proj.memberName}
                  </span>
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0 items-center">
                <button className="text-gray-400 hover:text-white">
                  {proj.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button className="text-blue-400 hover:text-blue-300">
                  <Edit size={18} />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
                <button className="flex items-center gap-1 text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg transition">
                  <Archive size={14} /> Mark Completed
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tab 3: Completed Projects */}
        <div className="text-center text-gray-500 py-10">
          <Archive size={48} className="mx-auto" />
          <p className="mt-2">No completed projects yet.</p>
        </div>
      </Tabs>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reason for Rejection"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleReject();
          }}
        >
          <textarea
            placeholder="Provide a reason for rejecting this project submission..."
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white min-h-[120px]"
            required
          />
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
            >
              Send Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
