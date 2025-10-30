import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Modal from "../components/Modal";

// Mock Data
const initialBoardMembers = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "President",
    description: "Leads the club's vision and strategy.",
    imageUrl: "https://i.pravatar.cc/150?u=alice",
    contact: "alice.j@club.com",
  },
  {
    id: 2,
    name: "Bob Williams",
    role: "Vice President",
    description: "Manages internal affairs and committees.",
    imageUrl: "https://i.pravatar.cc/150?u=bob",
    contact: "bob.w@club.com",
  },
  {
    id: 3,
    name: "Charlie Brown",
    role: "Secretary",
    description: "Handles documentation and communications.",
    imageUrl: "https://i.pravatar.cc/150?u=charlie",
    contact: "charlie.b@club.com",
  },
];

export default function AdminAbout() {
  const [members, setMembers] = useState(initialBoardMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<
    (typeof initialBoardMembers)[0] | null
  >(null);

  const handleOpenModal = (
    member: (typeof initialBoardMembers)[0] | null = null
  ) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleSaveMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Logic to add/update member
    // In a real app, this would be an API call
    console.log("Saving member...");
    handleCloseModal();
  };

  const handleDeleteMember = (id: number) => {
    // In a real app, this would be an API call
    setMembers(members.filter((m) => m.id !== id));
    console.log(`Deleting member with id: ${id}`);
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Board of Directors</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-[#0f172a] rounded-lg p-4 flex flex-col items-center text-center border border-gray-700"
          >
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-24 h-24 rounded-full mb-4 border-2 border-[#5ea4ff]"
            />
            <h3 className="font-bold text-lg text-white">{member.name}</h3>
            <p className="text-[#5ea4ff] font-semibold text-sm">
              {member.role}
            </p>
            <p className="text-gray-400 text-xs mt-2 flex-grow">
              {member.description}
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleOpenModal(member)}
                className="text-blue-400 hover:text-blue-300"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteMember(member.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMember ? "Edit Board Member" : "Add New Board Member"}
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            defaultValue={editingMember?.name}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
            required
          />
          <select
            defaultValue={editingMember?.role}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
          >
            <option>President</option>
            <option>Vice President</option>
            <option>Secretary</option>
            <option>Treasurer</option>
            <option>Tech Lead</option>
          </select>
          <textarea
            placeholder="Description"
            defaultValue={editingMember?.description}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white min-h-[100px]"
          />
          <input
            type="file"
            placeholder="Image URL"
            defaultValue={editingMember?.imageUrl}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8]"
          />
          <input
            type="email"
            placeholder="Contact Email"
            defaultValue={editingMember?.contact}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          />
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
