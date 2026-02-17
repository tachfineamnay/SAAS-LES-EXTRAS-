import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { ListAdminUsersQueryDto } from "./dto/list-admin-users-query.dto";
import { AdminUsersService } from "./admin-users.service";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.adminUsersService.listUsers(query);
  }

  @Get(":userId")
  getUserById(@Param("userId") userId: string) {
    return this.adminUsersService.getUserById(userId);
  }

  @Post(":userId/verify")
  verifyUser(@Param("userId") userId: string) {
    return this.adminUsersService.verifyUser(userId);
  }

  @Post(":userId/ban")
  banUser(@Param("userId") userId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminUsersService.banUser(userId, user.id);
  }
}
