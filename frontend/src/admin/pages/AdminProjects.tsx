import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import type { Project } from "../../data/projects";
import {
  Plus,
  Check,
  X,
  Edit,
  Trash2,
  Archive,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Tabs from "../components/Tabs";
import Modal from "../components/Modal";
import { toast } from "sonner";

// Define the shape of our form data and its initial state
const initialFormState = {
  title: "",
  description: "",
  points: 0,
  project_timeframe: "",
  github: "",
  required_members: 1,
};

// --- MAIN COMPONENT ---
export default function AdminProjects() {
  // State for project lists
  const [approvalRequests, setApprovalRequests] = useState<Project[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);

  // State for modals and selected project
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // State for form inputs
  const [addFormData, setAddFormData] = useState(initialFormState);
  const [editFormData, setEditFormData] = useState(initialFormState);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State for the custom confirmation dialog
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    color: "red" | "blue";
  } | null>(null);

  // --- DATA FETCHING ---
  const handleFetch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/projects/projects", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);

      const data = await res.json();
      const projects: Project[] = data.projects;

      setApprovalRequests(projects.filter((p) => !p.is_approved));
      setApprovedProjects(
        projects.filter((p) => p.is_approved && !p.is_completed)
      );
      setCompletedProjects(projects.filter((p) => p.is_completed));
    } catch (error) {
      console.error("Error Fetching Data:", error);
      toast.error("Failed to fetch project data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  // --- FORM & ACTION HANDLERS ---
  const handleAddFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) || 0 : value,
    }));
  };

  const handleEditFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) || 0 : value,
    }));
  };

  const handleAddProjectForm = async (e: FormEvent) => {
    e.preventDefault();
    const success = await addProject(addFormData);
    if (success) {
      toast.success(`Project "${addFormData.title}" created successfully.`);
      setIsAddModalOpen(false);
      handleFetch();
    }
  };

  const handleSaveProjectForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const isApproving = !selectedProject.is_approved;
    let success = false;
    let payload = { ...editFormData };

    if (isApproving) {
      success = await approveProject(selectedProject.id, payload.points);
    } else {
      success = await updateProject(selectedProject.id, payload);
    }

    if (success) {
      toast.success(`Project "${payload.title}" saved successfully.`);
      setApprovalModalOpen(false);
      handleFetch();
    }
  };

  const handleRejectionFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const success = await rejectProject(selectedProject.id, rejectionReason);
    if (success) {
      toast.success(`Project "${selectedProject.title}" has been rejected.`);
      setRejectModalOpen(false);
      handleFetch();
    }
  };

  const handleMarkCompleted = (projectId: string, projectTitle: string) => {
    setConfirmAction({
      title: "Mark as Completed",
      message: `Are you sure you want to move "${projectTitle}" to the completed list?`,
      onConfirm: () => {
        updateProject(projectId, { is_completed: true }).then((success) => {
          if (success) {
            toast.success(`Project "${projectTitle}" marked as completed.`);
            handleFetch();
          }
        });
        setConfirmModalOpen(false);
      },
      confirmText: "Mark Completed",
      color: "blue",
    });
    setConfirmModalOpen(true);
  };

  const handleDelete = (projectId: string, projectTitle: string) => {
    setConfirmAction({
      title: "Delete Project",
      message: `Are you sure you want to permanently delete "${projectTitle}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteProject(projectId).then((success) => {
          if (success) {
            toast.success(`Project "${projectTitle}" has been deleted.`);
            handleFetch();
          }
        });
        setConfirmModalOpen(false);
      },
      confirmText: "Delete Permanently",
      color: "red",
    });
    setConfirmModalOpen(true);
  };

  // --- MODAL OPENER HELPERS ---
  const openAddModal = () => {
    setAddFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  const openApprovalModal = (project: Project) => {
    setSelectedProject(project);
    setEditFormData({
      title: project.title || "",
      description: project.description || "",
      points: project.points || 0,
      project_timeframe: project.project_timeframe?.split("T")[0] || "",
      github: project.github || "",
      required_members: project.required_members || 1,
    });
    setApprovalModalOpen(true);
  };

  const openRejectModal = (project: Project) => {
    setSelectedProject(project);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Project Management</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} /> Add Manual Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={48} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <Tabs
          tabNames={[
            "Approval Requests",
            "Approved Projects",
            "Completed Projects",
          ]}
        >
          {/* Tab 1: Approval Requests */}
          <div className="space-y-4">
            {approvalRequests.length > 0 ? (
              approvalRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h3 className="font-bold">{req.title}</h3>
                    <p className="text-sm text-gray-400">
                      Submitted by{" "}
                      <span className="font-semibold text-gray-300">
                        {req.author}
                      </span>
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      {req.description}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openApprovalModal(req)}
                      className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition"
                      title="Approve & Edit"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => openRejectModal(req)}
                      className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">
                No new project requests.
              </p>
            )}
          </div>

          {/* Tab 2: Approved Projects */}
          <div className="space-y-4">
            {approvedProjects.length > 0 ? (
              approvedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h3 className="font-bold">{proj.title}</h3>
                    <p className="text-sm text-gray-400">
                      Author:{" "}
                      <span className="font-semibold text-gray-300">
                        {proj.author}
                      </span>{" "}
                      | Points:{" "}
                      <span className="font-bold text-yellow-400">
                        {proj.points}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0 items-center">
                    <button
                      className="text-blue-400 hover:text-blue-300"
                      title="Edit Project"
                      onClick={() => openApprovalModal(proj)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300"
                      title="Delete Project"
                      onClick={() => handleDelete(proj.id, proj.title)}
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleMarkCompleted(proj.id, proj.title)}
                      className="flex items-center gap-1 text-sm bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-lg transition"
                    >
                      <Archive size={14} /> Mark Completed
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">
                No approved projects.
              </p>
            )}
          </div>

          {/* Tab 3: Completed Projects */}
          <div className="space-y-4">
            {completedProjects.length > 0 ? (
              completedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-[#0f172a]/50 p-4 rounded-lg border border-gray-800 flex justify-between items-center opacity-70"
                >
                  <div>
                    <h3 className="font-bold text-gray-400 line-through">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Author:{" "}
                      <span className="font-semibold text-gray-400">
                        {proj.author}
                      </span>{" "}
                      | Points Awarded:{" "}
                      <span className="font-bold text-yellow-500">
                        {proj.points}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <Archive size={48} className="mx-auto" />
                <p className="mt-2">No completed projects yet.</p>
              </div>
            )}
          </div>
        </Tabs>
      )}

      {/* --- MODALS --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Manual Project"
      >
        <form onSubmit={handleAddProjectForm} className="space-y-4">
          <div>
            <label
              htmlFor="add-title"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Project Title
            </label>
            <input
              id="add-title"
              name="title"
              type="text"
              value={addFormData.title}
              onChange={handleAddFormChange}
              required
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="add-description"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Description
            </label>
            <textarea
              id="add-description"
              name="description"
              value={addFormData.description}
              onChange={handleAddFormChange}
              required
              rows={4}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="add-points"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Points
              </label>
              <input
                id="add-points"
                name="points"
                type="number"
                value={addFormData.points}
                onChange={handleAddFormChange}
                required
                min="0"
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
            <div>
              <label
                htmlFor="add-required_members"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Required Members
              </label>
              <input
                id="add-required_members"
                name="required_members"
                type="number"
                value={addFormData.required_members}
                onChange={handleAddFormChange}
                required
                min="1"
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="add-project_timeframe"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Deadline
              </label>
              <input
                id="add-project_timeframe"
                name="project_timeframe"
                type="date"
                value={addFormData.project_timeframe}
                onChange={handleAddFormChange}
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
            <div>
              <label
                htmlFor="add-github"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                GitHub Link (Optional)
              </label>
              <input
                id="add-github"
                name="github"
                type="url"
                value={addFormData.github}
                onChange={handleAddFormChange}
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
            >
              Add Project
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title={
          selectedProject?.is_approved ? "Edit Project" : "Approve Project"
        }
      >
        <form onSubmit={handleSaveProjectForm} className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Project Title
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              value={editFormData.title}
              onChange={handleEditFormChange}
              required
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              value={editFormData.description}
              onChange={handleEditFormChange}
              required
              rows={4}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-points"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Points
              </label>
              <input
                id="edit-points"
                name="points"
                type="number"
                value={editFormData.points}
                onChange={handleEditFormChange}
                required
                min="0"
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
            <div>
              <label
                htmlFor="edit-required_members"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Required Members
              </label>
              <input
                id="edit-required_members"
                name="required_members"
                type="number"
                value={editFormData.required_members}
                onChange={handleEditFormChange}
                required
                min="1"
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-project_timeframe"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Deadline
              </label>
              <input
                id="edit-project_timeframe"
                name="project_timeframe"
                type="date"
                value={editFormData.project_timeframe}
                onChange={handleEditFormChange}
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
            <div>
              <label
                htmlFor="edit-github"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                GitHub Link (Optional)
              </label>
              <input
                id="edit-github"
                name="github"
                type="url"
                value={editFormData.github}
                onChange={handleEditFormChange}
                className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => setApprovalModalOpen(false)}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition"
            >
              {selectedProject?.is_approved ? "Save Changes" : "Approve & Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reason for Rejection"
      >
        <form onSubmit={handleRejectionFormSubmit}>
          <textarea
            placeholder="Optional: Provide a reason for rejecting this project..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white min-h-[120px]"
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
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold transition"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

      {confirmAction && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title=""
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                confirmAction.color === "red" ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold text-white">
                {confirmAction.title}
              </h3>
              <p className="mt-2 text-base text-gray-300">
                {confirmAction.message}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-4">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="mt-3 w-full rounded-lg px-6 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 sm:mt-0 sm:w-auto transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmAction.onConfirm}
              className={`w-full rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto transition ${
                confirmAction.color === "red"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmAction.confirmText}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- API HELPER FUNCTIONS ---
const apiCall = async (endpoint: string, options: RequestInit) => {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/projects${endpoint}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ msg: "An unknown server error occurred" }));
      console.error(`API call to ${endpoint} failed:`, errorData);
      toast.error(`Action failed: ${errorData.msg}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Network error on API call to ${endpoint}:`, error);
    toast.error("A network error occurred. Please check your connection.");
    return false;
  }
};

const addProject = (projectData: typeof initialFormState) => {
  const payload = { ...projectData, is_approved: true };
  return apiCall(`/add-project`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const approveProject = (projectId: string, points: number) => {
  return apiCall(`/approve-project/${projectId}`, {
    method: "PUT",
    body: JSON.stringify({ points }),
  });
};

const rejectProject = (projectId: string, reason: string) => {
  return apiCall(`/decline-project/${projectId}`, {
    method: "DELETE",
    body: JSON.stringify({ reason }),
  });
};

const updateProject = (
  projectId: string,
  updates: Partial<typeof initialFormState | { is_completed: boolean }>
) => {
  return apiCall(`/update/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
};

const deleteProject = (projectId: string) => {
  return apiCall(`/delete/${projectId}`, { method: "DELETE" });
};
