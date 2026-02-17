import { UserRole, UserStatus } from "@prisma/client";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

export type AdminUserProfileDetails = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  jobTitle: string | null;
  bio: string | null;
  avatar: string | null;
};
