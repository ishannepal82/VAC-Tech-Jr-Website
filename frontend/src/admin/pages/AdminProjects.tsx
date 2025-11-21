import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import type { Project } from "../../data/projects";
import {
  Plus,
  Check,
  X,
  Edit,
  Trash2,
  Archive,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import Tabs from "../components/Tabs";
import Modal from "../components/Modal";
import { toast } from "sonner";
import PageLoader from "../../components/common/PageLoader";
import { usePageStatus } from "../../hooks/usePageStatus";

const initialFormState = {
  title: "",
  description: "",
  points: 0,
  project_timeframe: "",
  github: "",
  required_members: 1,
  committee: "",
  members: [] as string[], // Members array for tracking
};

export default function AdminProjects() {
  // State for removing members
  const [removeIndex, setRemoveIndex] = useState<null | number>(null);

  // Project Management States
  const [approvalRequests, setApprovalRequests] = useState<Project[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [declinedProjects, setDeclinedProjects] = useState<Project[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [addFormData, setAddFormData] = useState(initialFormState);
  const [editFormData, setEditFormData] = useState(initialFormState);
  const [rejectionReason, setRejectionReason] = useState("");
  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load project data."
  );

  // Confirmation dialog state
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    color: "red" | "blue";
  } | null>(null);

  // Remove member from the local edit form
  const handleRemoveMember = (index: number) => {
    setRemoveIndex(index);
  };

  const confirmRemoveMember = () => {
    if (removeIndex !== null) {
      const removedMember = editFormData.members[removeIndex];
      setEditFormData(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== removeIndex)
      }));
      setRemoveIndex(null);
      toast.success(`${removedMember} removed from the project`);
    }
  };

  // --- DATA FETCHING ---
  const handleFetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/projects/projects", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);

      const data = await res.json();
      const projects: Project[] = data.projects;

      setApprovalRequests(
        projects.filter((p) => !p.is_approved && !p.is_declined)
      );
      setApprovedProjects(
        projects.filter((p) => p.is_approved && !p.is_completed)
      );
      setCompletedProjects(projects.filter((p) => p.is_completed));
      setDeclinedProjects(projects.filter((p) => p.is_declined));
    } catch (error) {
      console.error("Error Fetching Data:", error);
      handleError(error, "Unable to load project data.");
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  // --- FORM & ACTION HANDLERS ---
  const handleAddFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) || 0 : value,
    }));
  };

  const handleEditFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    
    // Include the updated members array in the payload
    let payload = { 
      ...editFormData,
      members: editFormData.members // This will update the backend members list
    };

    if (isApproving) {
      success = await approveProject(selectedProject.id, payload);
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

  const handleRestoreProject = (projectId: string, projectTitle: string) => {
    setConfirmAction({
      title: "Restore Project",
      message: `Are you sure you want to restore "${projectTitle}" to pending requests?`,
      onConfirm: () => {
        updateProject(projectId, { is_declined: false }).then((success) => {
          if (success) {
            toast.success(`Project "${projectTitle}" has been restored.`);
            handleFetch();
          }
        });
        setConfirmModalOpen(false);
      },
      confirmText: "Restore Project",
      color: "blue",
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
      committee: project.committee || "",
      members: project.members || [], 
    });
    setApprovalModalOpen(true);
  };

  const openRejectModal = (project: Project) => {
    setSelectedProject(project);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  if (isLoading) {
    return <PageLoader message="Loading project data..." />;
  }

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

      <Tabs
        tabNames={[
          "Pending Requests",
          "Approved Projects",
          "Completed Projects",
          "Declined Projects",
        ]}
      >
          {/* Tab 1: Approval Requests (Pending) */}
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
                    {req.committee && (
                      <p className="text-xs text-gray-500 mt-1">
                        Committee: <span className="capitalize">{req.committee}</span>
                      </p>
                    )}
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
                      title="Decline"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">
                No pending project requests.
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
                    {proj.committee && (
                      <p className="text-xs text-gray-500 mt-1">
                        Committee: <span className="capitalize">{proj.committee}</span>
                      </p>
                    )}
                    {proj.members && proj.members.length > 0 && (
                      <p className="text-xs text-blue-400 mt-1">
                        Team ({proj.members.length}): {proj.members.join(", ")}
                      </p>
                    )}
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
                    {proj.committee && (
                      <p className="text-xs text-gray-600 mt-1">
                        Committee: <span className="capitalize">{proj.committee}</span>
                      </p>
                    )}
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

          {/* Tab 4: Declined Projects */}
          <div className="space-y-4">
            {declinedProjects.length > 0 ? (
              declinedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-[#0f172a]/50 p-4 rounded-lg border border-red-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-70"
                >
                  <div>
                    <h3 className="font-bold text-red-400">{proj.title}</h3>
                    <p className="text-sm text-gray-400">
                      Submitted by:{" "}
                      <span className="font-semibold text-gray-300">
                        {proj.author}
                      </span>
                    </p>
                    {proj.rejection_reason && (
                      <p className="text-sm text-red-300 mt-2 italic">
                        Reason: {proj.rejection_reason}
                      </p>
                    )}
                    {proj.committee && (
                      <p className="text-xs text-gray-600 mt-1">
                        Committee: <span className="capitalize">{proj.committee}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 flex-shrink-0 items-center">
                    <button
                      className="text-blue-400 hover:text-blue-300"
                      title="Restore Project"
                      onClick={() => handleRestoreProject(proj.id, proj.title)}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300"
                      title="Delete Permanently"
                      onClick={() => handleDelete(proj.id, proj.title)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <XCircle size={48} className="mx-auto" />
                <p className="mt-2">No declined projects.</p>
              </div>
            )}
          </div>
      </Tabs>

      {/* --- ADD PROJECT MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Project"
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

          <div>
            <label
              htmlFor="add-committee"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Committee
            </label>
            <select
              id="add-committee"
              name="committee"
              value={addFormData.committee}
              onChange={handleAddFormChange}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            >
              <option value="" disabled>
                Select a committee
              </option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="operations">Operations</option>
            </select>
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
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT/APPROVE PROJECT MODAL --- */}
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

          <div>
            <label
              htmlFor="edit-committee"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Committee
            </label>
            <select
              id="edit-committee"
              name="committee"
              value={editFormData.committee}
              onChange={handleEditFormChange}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            >
              <option value="" disabled>
                Select a committee
              </option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="operations">Operations</option>
            </select>
          </div>

          {/* Team Members Section - Only Remove, No Add */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Team Members
              {editFormData.members.length > 0 && (
                <span className="text-gray-500 text-xs ml-2">
                  ({editFormData.members.length} member{editFormData.members.length !== 1 ? 's' : ''})
                </span>
              )}
            </label>

            <div className="bg-[#0f172a] border border-gray-600 rounded-lg py-3 px-4 text-white max-h-60 overflow-y-auto">
              {editFormData.members.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No members have joined this project yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {editFormData.members.map((member, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-[#1e293b] px-3 py-2 rounded-lg hover:bg-[#1e293b]/80 transition"
                    >
                      <span className="text-white">{member}</span>
                      <button
                        onClick={() => handleRemoveMember(i)}
                        className="text-red-400 hover:text-red-500 transition"
                        type="button"
                        title="Remove member from project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              {editFormData.members.length > 0 && (
                <p className="text-xs text-gray-500 mt-3 italic">
                  ⚠️ Removing members will update the project when you save changes.
                </p>
              )}
            </div>

            {/* Confirm Remove Member Modal */}
            {removeIndex !== null && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-[#0f172a] border border-gray-600 rounded-xl p-6 w-96 text-white shadow-lg">
                  <h2 className="text-lg font-semibold mb-3 text-red-400">Remove Team Member</h2>
                  <p className="text-sm text-gray-300 mb-4">
                    Are you sure you want to remove{" "}
                    <span className="font-semibold text-white">
                      {editFormData.members[removeIndex]}
                    </span>{" "}
                    from this project?
                  </p>
                  <p className="text-xs text-gray-400 mb-4 italic">
                    This action will take effect when you save the project changes.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setRemoveIndex(null)}
                      className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmRemoveMember}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                      type="button"
                    >
                      Remove Member
                    </button>
                  </div>
                </div>
              </div>
            )}
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

      {/* --- REJECT MODAL --- */}
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

      {/* --- CONFIRMATION MODAL --- */}
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
  return apiCall(`/create-project`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const approveProject = (projectId: string, projectData: typeof initialFormState) => {
  return apiCall(`/approve-project/${projectId}`, {
    method: "PUT",
    body: JSON.stringify({ ...projectData, is_approved: true, is_declined: false }),
  });
};

const rejectProject = (projectId: string, reason: string) => {
  return apiCall(`/decline-project/${projectId}`, {
    method: "PUT",
    body: JSON.stringify({ is_declined: true, rejection_reason: reason }),
  });
};

const updateProject = (
  projectId: string,
  updates: Partial<typeof initialFormState | { is_completed: boolean; is_declined: boolean }>
) => {
  return apiCall(`/edit-project/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
};

const deleteProject = (projectId: string) => {
  return apiCall(`/delete-project/${projectId}`, {
    method: "DELETE",
  });
};