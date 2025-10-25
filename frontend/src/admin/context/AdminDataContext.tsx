import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";

type Role = "Member" | "Head";
type Committee = "None" | "PR" | "ECA" | "Coding" | "Graphics" | "Hod";

interface Member {
  id?: string;
  name: string;
  email: string;
  points: number;
  role: Role;
  committee: Committee;
  memoTokens: number;
}

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

      setMembers((prev) => [
        ...prev,
        {
          id: data.id,
          name,
          email,
          points: 0,
          role,
          committee,
          memoTokens: memo_tokens,
        },
      ]);

      toast.success("User added successfully");
    } catch (e) {
      console.error("❌ Error adding user:", e);
      toast.error("Failed to add user");
    }
  };

  // ✅ New function to fetch all users
  const getMembers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/get-all-users", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      console.log("✅ Users fetched:", data);

      // Map backend users to Member type
      const fetchedMembers: Member[] = data.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: u.points,
        role: u.role,
        committee: u.committee,
        memoTokens: u.memo_tokens,
      }));

      setMembers(fetchedMembers);
    } catch (e) {
      console.error("❌ Error fetching users:", e);
      toast.error("Failed to fetch users");
    }
  };

  // Optional: fetch users on mount
  // useEffect(() => {
  //   getMembers();
  // }, []);

  const deleteMember = async (id: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/users/delete-user/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete user");

      const data = await res.json();
      console.log("✅ User deleted:", data);

      setMembers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch (e) {
      console.error("❌ Error deleting user:", e);
      toast.error("Failed to delete user");
    }
  };

  const value: AdminDataContextType = {
    members,
    addMember,
    getMembers,
    deleteMember,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
};
