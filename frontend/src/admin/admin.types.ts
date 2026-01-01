export type Role = "Member" | "Head";
export type Committee = "None" | "PR" | "ECA" | "Coding" | "Graphics" | "Bod";

export interface Member {
  id?: string;
  name: string;
  email: string;
  points: number;
  role: Role;
  committee: Committee;
  memo_tokens: number;
  is_admin: boolean;
}

export type MemberUpdatePayload = Partial<Omit<Member, "id" | "points">> & {
  password?: string;
  is_admin?: boolean;
  memo_tokens?: number;
  points?: number;
};

export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  points: number;
  role: Role;
  committee: Committee;
  memo_tokens: number;
  is_admin: boolean;
}

export interface AdminDataContextType {
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