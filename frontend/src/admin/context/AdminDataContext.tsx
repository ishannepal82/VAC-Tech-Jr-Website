import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

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

// Using Partial<Member> allows sending only changed fields.
type MemberUpdatePayload = Partial<Omit<Member, "id" | "points">> & {
  password?: string;
  is_admin?: boolean;
  memo_tokens?: number;
  points?: number;
};

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
  updateMember: (id: string, updatedData: MemberUpdatePayload) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined
);

export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>([]);

  // ✅ Common error handler for fetch calls
  const handleResponseError = async (res: Response, fallbackMsg: string) => {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      // ignore parsing errors
    }

    const message =
      errorData?.msg ||
      errorData?.message ||
      fallbackMsg ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  };

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

      if (!res.ok) {
        await handleResponseError(res, "Failed to add user");
      }

      const data = await res.json();
      console.log("✅ User added:", data);
      await getMembers();
      toast.success("User added successfully");
    } catch (e) {
      console.error("❌ Error adding user:", e);
      toast.error(e instanceof Error ? e.message : "Failed to add user");
      throw e;
    }
  };

  // ✅ Get all members
  const getMembers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/get-all-users", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        await handleResponseError(res, "Failed to fetch users");
      }

      const data = await res.json();
      const fetchedMembers: Member[] = data.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: u.points,
        role: u.role,
        committee: u.committee,
        memo_tokens: u.memo_tokens,
        is_admin: u.is_admin,
      }));
      setMembers(fetchedMembers);
    } catch (e) {
      console.error("❌ Error fetching users:", e);
      throw e;
    }
  };

  // ✅ Delete a member
  const deleteMember = async (id: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/users/delete-user/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        await handleResponseError(res, "Failed to delete user");
      }

      setMembers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch (e) {
      console.error("❌ Error deleting user:", e);
      toast.error(e instanceof Error ? e.message : "Failed to delete user");
      throw e;
    }
  };

  // ✅ Update a member
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
        await handleResponseError(res, "Failed to update member");
      }

      toast.success(
        "Successfully edited the user! Inform them to log in again to gain access.",
        { id: toastId }
      );

      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === id ? { ...member, ...updatedData } : member
        )
      );
    } catch (e: any) {
      console.error("❌ Error updating member:", e);
      toast.error(
        e instanceof Error ? e.message : "Failed to update member",
        { id: toastId }
      );
      throw e;
    }
  };

  // ✅ Provide all context values
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
  const context = useContext(AdminDataContext);
  if (!context)
    throw new Error("useAdminData must be used within an AdminDataProvider");
  return context;
};
