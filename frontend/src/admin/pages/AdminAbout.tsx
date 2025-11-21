import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import PageLoader from "../../components/common/PageLoader";
import { usePageStatus } from "../../hooks/usePageStatus";

// Define type for better safety
interface BoardMember {
  id: number;
  name: string;
  role: string;
  // description removed
  image: string;
  email: string;
  is_admin?: boolean; // admin flag
}

// Minimal Toast Component
const Toast = ({
  message,
  isVisible,
  isError,
}: {
  message: string;
  isVisible: boolean;
  isError: boolean;
}) => {
  if (!isVisible) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white font-medium ${
        isError ? "bg-red-500" : "bg-green-500"
      }`}
    >
      {message}
    </div>
  );
};

export default function AdminAbout() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [toast, setToast] = useState({ isVisible: false, message: "", isError: false });
  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load board members."
  );

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError, isVisible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/api/bod/bod", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch board members");
      const data = await response.json();
      setMembers(Array.isArray(data.bod) ? data.bod : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setMembers([]);
      handleError(error, "Unable to load board members.");
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleOpenModal = (member: BoardMember | null = null) => {
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
      const url = editingMember
        ? `http://127.0.0.1:5000/api/bod/edit-bod/${editingMember.id}`
        : "http://127.0.0.1:5000/api/bod/add-bod";

      const method = editingMember ? "PUT" : "POST";

      // Convert is_admin from 'true'/'false' string to boolean in backend as needed
      // Here we send it as string for API to handle

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unknown error");
      }

      showToast(editingMember ? "Member updated successfully!" : "Member added successfully!");
      handleCloseModal();
      await fetchMembers();
    } catch (error: any) {
      console.error("Save error:", error);
      showToast(`Failed to save member: ${error.message}`, true);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/bod/delete-bod/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete member");

      showToast("Member deleted successfully!");
      setMembers(members.filter((m) => m.id !== id));
    } catch (error: any) {
      console.error("Delete error:", error);
      showToast(`Failed to delete member: ${error.message}`, true);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading board members..." />;
  }

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg relative">
      <Toast message={toast.message} isVisible={toast.isVisible} isError={toast.isError} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Board of Directors</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No board members found. Add your first member!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-[#0f172a] rounded-lg p-4 flex flex-col items-center text-center border border-gray-700"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full mb-4 border-2 border-[#5ea4ff]"
                onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/150?u=placeholder")}
              />
              <h3 className="font-bold text-lg text-white">{member.name}</h3>
              <p className="text-[#5ea4ff] font-semibold text-sm">{member.role}</p>
              {/* Removed description */}
              <p className="text-gray-400 text-xs mt-2">
                Admin: {member.is_admin ? "Yes" : "No"}
              </p>
              <p className="text-gray-400 text-xs mt-2">{member.contact}</p>
              <div className="flex gap-4 mt-4">
                <button onClick={() => handleOpenModal(member)} className="text-blue-400 hover:text-blue-300">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDeleteMember(member.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMember ? "Edit Board Member" : "Add New Board Member"}
      >
        <form onSubmit={handleSaveMember} className="space-y-4" encType="multipart/form-data">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            defaultValue={editingMember?.name || ""}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
            required
          />
          <select
            name="role"
            defaultValue={editingMember?.role || "President"}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
            required
          >
            <option value="President">President</option>
            <option value="Vice President">Vice President</option>
            <option value="Secretary">Secretary</option>
            <option value="Treasurer">Treasurer</option>
            <option value="Tech Lead">Tech Lead</option>
          </select>

          <input
            type="email"
            name="contact"
            placeholder="Contact Email"
            defaultValue={editingMember?.email || ""}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            required
          />

          {/* Password only on add */}
          {!editingMember && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
          )}

          {/* is_admin select */}
          <div>
            <label htmlFor="is_admin" className="text-white block mb-1 select-none">
              Admin Status
            </label>
            <select
              name="is_admin"
              id="is_admin"
              defaultValue={editingMember ? (editingMember.is_admin ? "true" : "false") : "false"}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
              required
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Profile Image (optional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8]"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold transition"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
