import React, { useState, useEffect } from "react";
import { X, Loader, AlertTriangle } from "lucide-react"; // Import AlertTriangle
import { toast } from "sonner";

// Define the structure of the props this component accepts
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string; 
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  // --- STATE MANAGEMENT ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [required_members, setRequiredMembers] = useState(1);
  const [committee, setCommittee] = useState("Any");
  const [project_timeframe, setProjectTimeframe] = useState("");
  const [github, setGithubLink] = useState(""); // Renamed for consistency

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✨ 1. Add state to control the confirmation dialog
  const [isConfirming, setIsConfirming] = useState(false);

  // Effect to reset the form when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setRequiredMembers(1);
        setCommittee("Any");
        setProjectTimeframe("");
        setGithubLink("");
        setError(null);
        setIsSubmitting(false);
        setIsConfirming(false); // Also reset confirmation state
      }, 300); // Delay to allow for closing animation
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ✨ 2. The form's submit handler now just opens the confirmation dialog
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation can be added here if needed before confirming
    if (!title || !description || !project_timeframe) {
      toast.warning("Please fill out all required fields.");
      return;
    }
    setIsConfirming(true); // Open the confirmation dialog
  };

  // ✨ 3. This new function contains the actual API call logic
  const handleFinalSubmit = async () => {
    setIsConfirming(false); // Close confirmation dialog immediately
    setIsSubmitting(true);
    setError(null);

    const projectData = {
      title,
      description,
      required_members,
      project_timeframe,
      committee,
      github, // Include github link in the submission
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/projects/create-project",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(projectData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create project.");
      }

      toast.success("Project submitted for approval!");

      setTimeout(() => {
        onClose(); // Close the entire modal after a short delay
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

        {/* ✨ 4. The form now calls handleInitialSubmit */}
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Project Name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                htmlFor="project_timeframe"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Time Frame
              </label>
              <input
                id="project_timeframe"
                type="date"
                value={project_timeframe}
                onChange={(e) => setProjectTimeframe(e.target.value)}
                required
                className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="required_members"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Members Needed
              </label>
              <input
                id="required_members"
                type="number"
                value={required_members}
                onChange={(e) =>
                  setRequiredMembers(parseInt(e.target.value, 10))
                }
                min="1"
                required
                className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="committee"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Relevant committee
            </label>
            <select
              id="committee"
              value={committee}
              onChange={(e) => setCommittee(e.target.value)}
              className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
            >
              <option>Any</option>
              <option>GD</option>
              <option>ECA</option>
              <option>PR</option>
              <option>Coding</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="github_link"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              GitHub Repo link (optional)
            </label>
            <input
              id="github_link"
              type="text"
              value={github}
              onChange={(e) => setGithubLink(e.target.value)}
              className="w-full bg-[#0a1a33] border border-[#254b80] rounded-md p-2 focus:ring-2 focus:ring-[#9cc9ff] focus:outline-none"
            />
          </div>
          <div className="h-5 mt-2 text-center">
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-600 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-6 bg-[#254b80] text-[#b3d9ff] rounded-md hover:bg-[#1f3c66] transition-colors disabled:bg-[#1f3c66]/50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>

        {/* ✨ 5. The Confirmation Dialog Overlay */}
        {isConfirming && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
            <div className="bg-[#0f172a] p-8 rounded-lg shadow-xl text-center max-w-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mt-4">
                Confirm Submission
              </h3>
              <p className="mt-2 text-sm text-gray-300">
                Are you sure all the project information is correct? This will
                be sent for admin approval.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    "Yes, Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectModal;
