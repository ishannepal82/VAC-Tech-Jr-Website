import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";

type Role = "Member" | "Head";
type Committee = "None" | "PR" | "ECA" | "Coding" | "Graphics" | "Bod";

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

// ✅ 1. Define the type for the data we'll send when updating
// Using Partial<Member> allows us to send only the fields that have changed.
type MemberUpdatePayload = Partial<Omit<Member, "id" | "points">> & {
  password?: string;
  is_admin?: boolean;
  memo_tokens?: number;
  points?: number;
};

// ✅ 2. Update the context type to include the new updateMember function
interface AdminDataContextType {
  members: Member[];
  addMember: (
    name: string,
    email: string,
    password: string,
    role: Role,
    committee: Committee,
    is_admin: boolean,
    memo_tokens: number
  ) => Promise<void>;
  getMembers: () => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  updateMember: (id: string, updatedData: MemberUpdatePayload) => Promise<void>; // New function signature
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined
);

export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>([]);

  const addMember = async (
    name: string,
    email: string,
    password: string,
    role: Role,
    committee: Committee,
    is_admin: boolean,
    memo_tokens: number
  ) => {
    // ... (your existing addMember function, no changes needed here)
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          points: 0,
          role,
          committee,
          memo_tokens,
          is_admin,
        }),
      });
      if (!res.ok) throw new Error("Failed to add user");
      const data = await res.json();
      console.log("✅ User added:", data);
      await getMembers(); // Refresh the entire list to ensure consistency
      toast.success("User added successfully");
    } catch (e) {
      console.error("❌ Error adding user:", e);
      toast.error("Failed to add user");
    }
  };

  const getMembers = async () => {
    // ... (your existing getMembers function with a small fix)
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/get-all-users", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      const fetchedMembers: Member[] = data.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: u.points,
        role: u.role,
        committee: u.committee,
        // ❗️ BUG FIX: Your Member interface uses 'memo_tokens', not 'memoTokens'. This is now correct.
        memo_tokens: u.memo_tokens,
      }));
      setMembers(fetchedMembers);
    } catch (e) {
      console.error("❌ Error fetching users:", e);
    }
  };

  const deleteMember = async (id: string) => {
    // ... (your existing deleteMember function, no changes needed here)
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/users/delete-user/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to delete user");
      setMembers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch (e) {
      console.error("❌ Error deleting user:", e);
      toast.error("Failed to delete user");
    }
  };

  // ✅ 3. Implement the new updateMember function
  const updateMember = async (id: string, updatedData: MemberUpdatePayload) => {
    const toastId = toast.loading("Updating member...");
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/users/edit-user/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update member");
      }

      console.log("✅ User updated successfully");
      toast.success("Member updated successfully", { id: toastId });

      // Update the local state for an instant UI update
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === id ? { ...member, ...updatedData } : member
        )
      );
    } catch (e: any) {
      console.error("❌ Error updating member:", e);
      toast.error(e.message || "Failed to update member", { id: toastId });
    }
  };

  // ✅ 4. Add updateMember to the context value
  const value: AdminDataContextType = {
    members,
    addMember,
    getMembers,
    deleteMember,
    updateMember,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  // ... (no changes needed here)
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
};
