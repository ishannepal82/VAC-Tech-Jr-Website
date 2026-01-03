import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  Role,
  Committee,
  Member,
  MemberUpdatePayload,
  UserApiResponse,
} from "../admin.types";

/* --------------------------------------------------
   Context setup
-------------------------------------------------- */

type AdminDataContextType = {
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
  updateMember: (
    id: string,
    updatedData: MemberUpdatePayload
  ) => Promise<void>;
};

const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined
);


export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);

  // ✅ Common error handler
  const handleResponseError = async (res: Response, fallbackMsg: string) => {
    let errorData: { msg?: string; message?: string } = {};
    try {
      errorData = await res.json();
    } catch { }

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

      await res.json();
      await getMembers();
      toast.success("User added successfully");
    } catch (e) {
      console.error("❌ Error adding user:", e);
      toast.error(e instanceof Error ? e.message : "Failed to add user");
      throw e;
    }
  };

  const getMembers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/get-all-users", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        await handleResponseError(res, "Failed to fetch users");
      }

      const data: { users: UserApiResponse[] } = await res.json();
      const fetchedMembers: Member[] = data.users.map((u) => ({
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

  const updateMember = async (
    id: string,
    updatedData: MemberUpdatePayload
  ) => {
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

      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m))
      );
    } catch (e) {
      console.error("❌ Error updating member:", e);
      toast.error(
        e instanceof Error ? e.message : "Failed to update member",
        { id: toastId }
      );
      throw e;
    }
  };

  return (
    <AdminDataContext.Provider
      value={{
        members,
        addMember,
        getMembers,
        deleteMember,
        updateMember,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

/* --------------------------------------------------
   Consumer hook
-------------------------------------------------- */

export function useAdminData() {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error(
      "useAdminData must be used inside an AdminDataProvider"
    );
  }

  return context;
}
