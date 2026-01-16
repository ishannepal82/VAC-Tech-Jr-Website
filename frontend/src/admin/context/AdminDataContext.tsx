import {
  createContext,
  useContext,
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
   Type Definitions
-------------------------------------------------- */

type ErrorResponse = {
  msg?: string;
  message?: string;
};

type GetUsersResponse = {
  users: UserApiResponse[];
};

export type AdminDataContextType = {
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

/* --------------------------------------------------
   Context Setup
-------------------------------------------------- */

export const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined
);

/* --------------------------------------------------
   Helper Functions (Non-component exports are OK)
-------------------------------------------------- */

export const handleResponseError = async (
  res: Response,
  fallbackMsg: string
): Promise<never> => {
  let errorData: ErrorResponse = {};

  try {
    errorData = (await res.json()) as ErrorResponse;
  } catch (parseError) {
    console.error("Failed to parse error response:", parseError);
  }

  const message =
    errorData?.msg ||
    errorData?.message ||
    fallbackMsg ||
    `Request failed with status ${res.status}`;

  throw new Error(message);
};

/* --------------------------------------------------
   API Functions
-------------------------------------------------- */

export const addMemberAPI = async (
  name: string,
  email: string,
  password: string,
  role: Role,
  committee: Committee,
  is_admin: boolean,
  memo_tokens: number,
  getMembers: () => Promise<void>
): Promise<void> => {
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
  } catch (error) {
    console.error("❌ Error adding user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add user";
    toast.error(errorMessage);
    throw error;
  }
};

export const getMembersAPI = async (): Promise<Member[]> => {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/users/get-all-users", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      await handleResponseError(res, "Failed to fetch users");
    }

    const data = (await res.json()) as GetUsersResponse;

    const fetchedMembers: Member[] = data.users.map((u: UserApiResponse) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      points: u.points,
      role: u.role,
      committee: u.committee,
      memo_tokens: u.memo_tokens,
      is_admin: u.is_admin,
    }));

    return fetchedMembers;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  }
};

export const deleteMemberAPI = async (id: string): Promise<void> => {
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

    toast.success("User deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete user";
    toast.error(errorMessage);
    throw error;
  }
};

export const updateMemberAPI = async (
  id: string,
  updatedData: MemberUpdatePayload
): Promise<void> => {
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
  } catch (error) {
    console.error("❌ Error updating member:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update member";
    toast.error(errorMessage, { id: toastId });
    throw error;
  }
};

/* --------------------------------------------------
   Consumer Hook
-------------------------------------------------- */

export function useAdminData(): AdminDataContextType {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error("useAdminData must be used inside an AdminDataProvider");
  }

  return context;
}