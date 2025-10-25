import { useState, useMemo } from "react";
import { Search, Edit, Trash2, Plus, Filter } from "lucide-react";
import MemberRankBadge from "../components/MemberRankBadge";
import Modal from "../components/Modal";
import { useAdminData } from "../context/AdminDataContext";
// <-- IMPORT THE CENTRAL "BRAIN"

// --- Type definitions are now defined in your context file, but we can re-declare them here for local use ---
type Role = "Member" | "Head";
type Committee = "None" | "PR" | "ECA" | "Coding" | "Graphics" | "Hod";
type Rank = "Newbie" | "Explorer" | "Builder" | "Developer" | "Hacker";

interface Member {
  name: string;
  email: string;
  points: number;
  role: Role;
  committee: Committee;
  memoTokens: number;
}

const getRank = (points: number): Rank => {
  if (points <= 100) return "Newbie";
  if (points <= 300) return "Explorer";
  if (points <= 600) return "Builder";
  if (points <= 1000) return "Developer";
  return "Hacker";
};

export default function AdminMembers() {
  // === 1. GET DATA AND ACTIONS FROM THE CONTEXT ===
  // The list of members and the functions to change it now come from the central context.
  const { members, addMember } = useAdminData();

  // === 2. LOCAL UI STATE ===
  // State for things that only affect this page (like search, filters, and modals) remains here.
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

  // === 3. HANDLER FUNCTIONS THAT USE THE CONTEXT ===
  const handleOpenModal = (member: Member | null = null) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  // === 4. FILTERING LOGIC (NO CHANGE IN LOGIC, JUST THE DATA SOURCE) ===
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
  }, [searchTerm, filters, members]); // The `members` array from context is now a dependency.

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
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
              <option value="Admin">Admin</option>
              <option value="Lead">Lead</option>
              <option value="Member">Member</option>
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
              <option value="Tech">Tech</option>
              <option value="Events">Events</option>
              <option value="Marketing">Marketing</option>
              <option value="Outreach">Outreach</option>
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-[#9cc9ff] uppercase bg-[#0f172a]">
            <tr>
              <th scope="col" className="px-6 py-3">
                Full Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Points
              </th>
              <th scope="col" className="px-6 py-3">
                Rank
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Committee
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr
                // key={member.id}
                className="border-b border-gray-700 hover:bg-[#2a3a55]"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {member.name}
                </td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4 font-bold">{member.points}</td>
                <td className="px-6 py-4">
                  <MemberRankBadge rank={getRank(member.points)} />
                </td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">{member.committee}</td>
                <td className="px-6 py-4 flex gap-4">
                  <button
                    // onClick={() => handleOpenModal(member)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    // onClick={() => handleDeleteMember(member.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMember ? "Edit Member" : "Add New Member"}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="Name"
              type="text"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              defaultValue={editingMember?.name}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              defaultValue={editingMember?.email}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="role"
              defaultValue={editingMember?.role ?? "Member"}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="Member">Member</option>
              <option value="Head">Head</option>
            </select>
            <select
              name="committee"
              defaultValue={editingMember?.committee ?? "None"}
              onChange={(e) => setCommittee(e.target.value as Committee)}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            >
              <option value="None">HOD</option>
              <option value="Tech">PR</option>
              <option value="Events">ECA</option>
              <option value="Marketing">coding</option>
              <option value="Outreach">Graphics</option>
            </select>
            <input
              name="memoTokens"
              type="number"
              placeholder="Memo Tokens"
              onChange={(e) => setMemoTokens(Number(e.target.value))}
              defaultValue={editingMember?.memoTokens}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
            <select
              name="isAdmin"
              value={is_admin ? "true" : "false"}
              onChange={(e) => setIsAdmin(e.target.value === "true")}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            >
              <option value="true">Is Admin</option>
              <option value="false">Is Not Admin</option>
            </select>
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
              onClick={() => () =>
                addMember(
                  name,
                  email,
                  password,
                  role,
                  committee,
                  is_admin,
                  memo_tokens
                )}
              className="px-6 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold transition"
            >
              Save Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
