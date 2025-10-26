import { useState } from "react";
import { Plus, Edit, Trash2, Clock, CheckCircle } from "lucide-react";
import Modal from "../components/Modal";

// Mock Data
const mockPolls = [
  {
    id: 1,
    title: "Next Workshop Topic?",
    description: "What should our next technical workshop focus on?",
    status: "Active",
    expiry: "2024-11-10",
    options: [
      { text: "Advanced Git", votes: 15 },
      { text: "Docker & Containers", votes: 25 },
      { text: "CI/CD Pipelines", votes: 8 },
    ],
  },
  {
    id: 2,
    title: "Preferred Day for Meetups",
    description: "Which day of the week works best for casual meetups?",
    status: "Closed",
    expiry: "2024-10-01",
    options: [
      { text: "Wednesday", votes: 10 },
      { text: "Thursday", votes: 30 },
      { text: "Friday", votes: 18 },
    ],
  },
];

export default function AdminPolls() {
  const [polls] = useState(mockPolls); //TODO: need to be modified

  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTotalVotes = (options: { votes: number }[]) =>
    options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Poll Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} /> Create Poll
        </button>
      </div>

      <div className="space-y-6">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="bg-[#0f172a] p-5 rounded-lg border border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-white">{poll.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{poll.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    poll.status === "Active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {poll.status === "Active" ? (
                    <Clock size={14} />
                  ) : (
                    <CheckCircle size={14} />
                  )}{" "}
                  {poll.status}
                </span>
                <button className="text-blue-400 hover:text-blue-300">
                  <Edit size={18} />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {poll.options.map((option, index) => {
                const totalVotes = getTotalVotes(poll.options);
                const percentage =
                  totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{option.text}</span>
                      <span className="font-semibold text-white">
                        {option.votes} votes
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-[#5ea4ff] h-2.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Poll"
      >
        //TODO: need to add form here
      </Modal>
    </div>
  );
}
