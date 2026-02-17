import { UserRole } from "@prisma/client";

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
};
