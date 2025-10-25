import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";
type Role = "Member" | "Head";
type Committee = "None" | "PR" | "ECA" | "Coding" | "Graphics" | "Hod";

interface Member {
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
  updateMember: (id: string, memberData: Partial<Omit<Member, "id">>) => void;
  deleteMember: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined
);

export const AdminDataProvider = ({ children }: { children: ReactNode }) => {
  const addMember = async (
    name: string,
    email: string,
    password: string,
    role: Role,
    commitee: Committee,
    is_admin: boolean,
    memo_tokens: number
  ) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          points: 0,
          role: role,
          commitee: commitee,
          memo_tokens: memo_tokens,
          is_admin: is_admin,
        }),
      });
      if (!res.ok) {
        console.log(res);
        throw new Error("Failed to add user");
      }

      const data = await res.json();
      console.log(data);
      toast.success("User added successfully");
    } catch (e) {
      console.log("Error adding User", e);
      toast.error("Failed to add user");
    }
  };
  const [members, _setMembers] = useState<Member[]>([]);

  const value: any = {
    members,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
};
