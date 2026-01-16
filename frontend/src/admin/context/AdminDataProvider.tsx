import { useState, type ReactNode } from "react";
import {
  AdminDataContext,
  addMemberAPI,
  getMembersAPI,
  deleteMemberAPI,
  updateMemberAPI,
} from "./AdminDataContext";
import type {
  Role,
  Committee,
  Member,
  MemberUpdatePayload,
} from "../admin.types";

/* --------------------------------------------------
   Provider Component (Default Export Only)
-------------------------------------------------- */

export default function AdminDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [members, setMembers] = useState<Member[]>([]);

  const addMember = async (
    name: string,
    email: string,
    password: string,
    role: Role,
    committee: Committee,
    is_admin: boolean,
    memo_tokens: number
  ): Promise<void> => {
    await addMemberAPI(
      name,
      email,
      password,
      role,
      committee,
      is_admin,
      memo_tokens,
      getMembers
    );
  };

  const getMembers = async (): Promise<void> => {
    const fetchedMembers = await getMembersAPI();
    setMembers(fetchedMembers);
  };

  const deleteMember = async (id: string): Promise<void> => {
    await deleteMemberAPI(id);
    setMembers((prev) => prev.filter((u) => u.id !== id));
  };

  const updateMember = async (
    id: string,
    updatedData: MemberUpdatePayload
  ): Promise<void> => {
    await updateMemberAPI(id, updatedData);
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m))
    );
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