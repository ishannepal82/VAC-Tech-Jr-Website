import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import PageLoader from "../../components/common/PageLoader";
import { usePageStatus } from "../../hooks/usePageStatus";

interface ToastState {
  isVisible: boolean;
  message: string;
  isError: boolean;
}

interface Member {
  id: string;
  name: string;
  role: string;
  comittee: string;
  image?: string;
}

interface ToastProps {
  message: string;
  isVisible: boolean;
  isError: boolean;
}

const Toast = ({ message, isVisible, isError }: ToastProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 ${
        isError ? "bg-red-500" : "bg-green-500"
      } text-white px-6 py-3 rounded-lg shadow-lg z-50`}
    >
      {message}
    </div>
  );
};

export default function AdminAbout() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: "",
    isError: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load board members."
  );

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/api/bod/bod", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch board members");

      const data: { bod: Member[] } = await response.json();

      setMembers(Array.isArray(data.bod) ? data.bod : []);
    } catch (error: unknown) {
      console.error("Fetch error:", error);

      const message =
        error instanceof Error ? error.message : "Unknown fetch error";

      setMembers([]);
      handleError(message, "Unable to load board members.");
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleOpenModal = (member: Member | null = null) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleSaveMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      setIsSaving(true);
      showToast("Saving member...");

      const url = editingMember
        ? `http://127.0.0.1:5000/api/bod/edit-bod/${editingMember.id}`
        : "http://127.0.0.1:5000/api/bod/add-bod";

      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unknown error");
      }

      showToast(
        editingMember
          ? "Member updated successfully!"
          : "Member added successfully!"
      );
      handleCloseModal();
      await fetchMembers();
    } catch (error: unknown) {
      console.error("Save error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to save member";

      showToast(message, true);
    } finally {
      setIsSaving(false);
    }
  };

  // Open the delete confirmation modal
  const openDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Close the delete confirmation modal
  const closeDeleteModal = () => {
    setMemberToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Confirm deletion
  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/bod/delete-bod/${memberToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete member");

      showToast("Member deleted successfully!");
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      closeDeleteModal();
    } catch (error: unknown) {
      console.error("Delete error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to delete member";

      showToast(message, true);
      closeDeleteModal();
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        isError={toast.isError}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">
            Board of Directors
          </h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add BOD
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl">
            <p className="text-gray-400 text-lg">
              No board members found. Add your first member!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition shadow-lg"
              >
                <img
                  src={member.image || "https://i.pravatar.cc/150?u=default"}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://i.pravatar.cc/150?u=placeholder")
                  }
                />
                <h3 className="text-xl font-semibold text-center mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-400 text-center mb-2">{member.role}</p>
                <p className="text-gray-400 text-center text-sm mb-4">
                  Committee: {member.comittee || "N/A"}
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(member)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMember ? "Edit Member" : "Add New Member"}
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={editingMember?.name || ""}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              name="role"
              defaultValue={editingMember?.role || ""}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="">Select Role</option>
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Tech Lead">Tech Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Committee</label>
            <select
              name="comittee"
              defaultValue={editingMember?.comittee || ""}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="">Select Committee</option>
              <option value="BOD">BOD</option>
              <option value="coding">Coding</option>
              <option value="eca">ECA</option>
              <option value="gd">GD</option>
              <option value="pr">PR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 px-4 py-2 rounded-lg transition ${
                isSaving
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete{" "}
            <strong>{memberToDelete?.name}</strong> from the Board of Directors?
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={closeDeleteModal}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteMember}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
