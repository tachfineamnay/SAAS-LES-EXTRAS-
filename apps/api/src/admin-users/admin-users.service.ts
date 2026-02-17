import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ListAdminUsersQueryDto } from "./dto/list-admin-users-query.dto";
import { AdminUserProfileDetails, AdminUserRow } from "./types/admin-user.types";

function formatUserName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const rawName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return rawName || email;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query: ListAdminUsersQueryDto): Promise<AdminUserRow[]> {
    const where: Prisma.UserWhereInput = {};
    const search = query.search?.trim();

    if (search) {
      where.email = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (query.role && query.role !== "ALL") {
      where.role = query.role;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: formatUserName(user.profile?.firstName, user.profile?.lastName, user.email),
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async getUserById(userId: string): Promise<AdminUserProfileDetails> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            jobTitle: true,
            bio: true,
            avatar: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      id: user.id,
      name: formatUserName(user.profile?.firstName, user.profile?.lastName, user.email),
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      jobTitle: user.profile?.jobTitle ?? null,
      bio: user.profile?.bio ?? null,
      avatar: user.profile?.avatar ?? null,
    };
  }

  async verifyUser(userId: string): Promise<{ ok: true }> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.VERIFIED,
      },
    });

    return { ok: true };
  }

  async banUser(userId: string, actorId: string): Promise<{ ok: true }> {
    if (userId === actorId) {
      throw new BadRequestException("You cannot ban your own account");
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.BANNED,
      },
    });

    return { ok: true };
  }
}
