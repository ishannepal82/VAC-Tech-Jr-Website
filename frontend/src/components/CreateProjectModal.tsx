import React, { useState } from "react";
import { X } from "lucide-react";

// Define the structure of the props this component accepts
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorName: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  authorName,
}) => {
  // State for form inputs
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState(1);
  const [committee, setCommittee] = useState("Coding");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      projectName,
      description,
      author: authorName,
      requiredMembers: teamMembers,
      committee,
    };
    console.log("New Project Submitted:", projectData); //TODO: Replace with actual submission logic and apply api call
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center font-poppins p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a2f55] rounded-xl p-8 w-full max-w-lg relative text-white"
      >
        <h2 className="text-2xl font-bold text-[#9cc9ff] mb-6">
          Create a New Project
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="committee"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Relevant Committee
              </label>
              <select
                id="committee"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
              >
                <option>Coding</option>
                <option>GD</option>
                <option>ECA</option>
                <option>PR</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="teamMembers"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Team Members Needed
              </label>
              <input
                id="teamMembers"
                type="number"
                value={teamMembers}
                onChange={(e) => setTeamMembers(parseInt(e.target.value, 10))}
                min="1"
                required
                className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Author
            </label>
            <input
              type="text"
              value={authorName}
              disabled
              className="w-full bg-[#112244] border border-[#254b80] rounded-md p-2 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-600 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-[#254b80] text-[#b3d9ff] rounded-md hover:bg-[#1f3c66] transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
