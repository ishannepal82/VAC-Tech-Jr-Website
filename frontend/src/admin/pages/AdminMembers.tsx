import { useState, useMemo, useEffect } from "react";
import { Search, Edit, Trash2, Plus, Filter } from "lucide-react";
import MemberRankBadge from "../components/MemberRankBadge";
import Modal from "../components/Modal";
import { useAdminData } from "../context/AdminDataContext";

type Role = "Member" | "Head";
type Committee = "None" | "PR" | "ECA" | "Coding" | "Graphics" | "Bod";
type Rank = "Newbie" | "Explorer" | "Builder" | "Developer" | "Hacker";

interface Member {
  id?: string;
  name: string;
  email: string;
  points: number;
  role: Role;
  committee: Committee;
  memo_tokens: number;
  is_admin: boolean;
}

const getRank = (points: number): Rank => {
  if (points < 100) return "Newbie";
  if (points < 350) return "Explorer";
  if (points < 650) return "Builder";
  if (points < 1000) return "Developer";
  return "Hacker";
};

export default function AdminMembers() {
  // Add updateMember to the destructuring assignment
  const { members, addMember, getMembers, deleteMember, updateMember } =
    useAdminData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ role: "All", committee: "All" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [is_admin, setIsAdmin] = useState<boolean>(false);
  const [committee, setCommittee] = useState<Committee>("None");
  const [memo_tokens, setMemoTokens] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  // Near your other state declarations
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  useEffect(() => {
    getMembers();
  }, []);

  const handleOpenModal = (member: Member | null = null) => {
    setEditingMember(member);
    setIsModalOpen(true);
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setRole(member.role);
      setCommittee(member.committee);
      setMemoTokens(member.memo_tokens);
      setIsAdmin(member.is_admin);
      setPoints(member.points);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setCommittee("None");
      setMemoTokens(0);
      setRole("Member");
      setIsAdmin(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setName("");
    setEmail("");
    setPassword("");
    setCommittee("None");
    setMemoTokens(0);
    setRole("Member");
    setIsAdmin(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMember) {
      // ✅ EDIT MODE
      // We call a new 'updateMember' function from the context
      await updateMember(editingMember.id!, {
        name,
        email,
        role,
        committee,
        is_admin,
        memo_tokens,
        points,
        ...(password && { password }),
      });
    } else {
      // ✅ ADD MODE (existing logic)
      await addMember(
        name,
        email,
        password,
        role,
        committee,
        is_admin,
        memo_tokens
      );
    }

    await getMembers(); // refresh list after action
    handleCloseModal();
  };

  // This function opens the confirmation modal
  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // This function runs when the user confirms the deletion
  const confirmDelete = async () => {
    if (memberToDelete) {
      await deleteMember(memberToDelete);
      // No need to call getMembers() if deleteMember already updates the state in your context
    }
    // Close the modal and reset the state
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };
  const filteredMembers = useMemo(() => {
    return members
      .filter((member) => {
        const term = searchTerm.toLowerCase();
        return (
          member.email.toLowerCase().includes(term) ||
          member.name.toLowerCase().includes(term)
        );
      })
      .filter(
        (member) => filters.role === "All" || member.role === filters.role
      )
      .filter(
        (member) =>
          filters.committee === "All" || member.committee === filters.committee
      );
  }, [searchTerm, filters, members]);

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
      {/* Top controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              className="appearance-none bg-[#0f172a] border border-gray-600 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="All">All Roles</option>
              <option value="Member">Member</option>
              <option value="Head">Head</option>
            </select>
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              className="appearance-none bg-[#0f172a] border border-gray-600 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, committee: e.target.value }))
              }
            >
              <option value="All">All Committees</option>
              <option value="PR">PR</option>
              <option value="ECA">ECA</option>
              <option value="Coding">Coding</option>
              <option value="Graphics">Graphics</option>
              <option value="Bod">BOD</option>
              <option value="None">None</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus size={18} /> Add Member
          </button>
        </div>
      </div>
      {/* Members table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-[#9cc9ff] uppercase bg-[#0f172a]">
            <tr>
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Points</th>
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Committee</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr
                key={member.id}
                className="border-b border-gray-700 hover:bg-[#2a3a55]"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {member.name}
                </td>
                <td className="px-6 py-4">{member?.email}</td>
                <td className="px-6 py-4 font-bold">{member.points}</td>
                <td className="px-6 py-4">
                  <MemberRankBadge rank={getRank(member.points)} />
                </td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">{member.committee}</td>

                <td className="px-6 py-4 flex gap-4">
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => handleOpenModal(member)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteClick(member.id!)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMember ? "Edit Member" : "Add New Member"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            >
              <option value="Member">Member</option>
              <option value="Head">Head</option>
            </select>

            <select
              value={committee}
              onChange={(e) => setCommittee(e.target.value as Committee)}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            >
              <option value="None">None</option>
              <option value="PR">PR</option>
              <option value="ECA">ECA</option>
              <option value="Coding">Coding</option>
              <option value="Graphics">Graphics</option>
              <option value="Bod">BOD</option>
            </select>

            <input
              type="number"
              placeholder="Memo Tokens"
              value={memo_tokens}
              onChange={(e) => setMemoTokens(Number(e.target.value))}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="password"
              placeholder={
                editingMember ? "New Password (optional)" : "Password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-2 text-sm text-white"
              required={!editingMember}
            />
            <select
              value={is_admin ? "true" : "false"}
              onChange={(e) => setIsAdmin(e.target.value === "true")}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            >
              <option value="false">Is Not Admin</option>
              <option value="true">Is Admin</option>
            </select>
            <input
              type="number"
              placeholder="Points"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
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
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
      >
        <div className="text-gray-300">
          <p>Are you sure you want to permanently delete this member?</p>
          <p className="mt-2 text-sm text-gray-400">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={cancelDelete}
            className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            Delete Member
          </button>
        </div>
      </Modal>
    </div>
  );
}
