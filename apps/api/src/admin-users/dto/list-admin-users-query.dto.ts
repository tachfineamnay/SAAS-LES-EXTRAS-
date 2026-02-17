import { UserRole } from "@prisma/client";
import { IsIn, IsOptional, IsString } from "class-validator";

const ROLE_FILTER_VALUES = [
  UserRole.CLIENT,
  UserRole.TALENT,
  UserRole.ADMIN,
  "ALL",
] as const;

export class ListAdminUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(ROLE_FILTER_VALUES)
  role?: UserRole | "ALL";
}
