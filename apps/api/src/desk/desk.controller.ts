import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { DeskService } from "./desk.service";
import { AssignDeskRequestDto } from "./dto/assign-desk-request.dto";
import { UpdateDeskRequestStatusDto } from "./dto/update-desk-request-status.dto";
import { RespondDeskRequestDto } from "./dto/respond-desk-request.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeskController {
  constructor(private readonly deskService: DeskService) {}

  @Get("admin/desk-requests")
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.deskService.findAll();
  }

  @Patch("admin/desk-requests/:id/status")
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateDeskRequestStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deskService.updateStatus(id, user.id, dto);
  }

  @Patch("admin/desk-requests/:id/assign")
  @Roles(UserRole.ADMIN)
  assign(
    @Param("id") id: string,
    @Body() dto: AssignDeskRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deskService.assign(id, user.id, dto);
  }

  @Patch("admin/desk-requests/:id/respond")
  @Roles(UserRole.ADMIN)
  respond(
    @Param("id") id: string,
    @Body() dto: RespondDeskRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deskService.respond(id, user.id, dto);
  }

  @Get("desk-requests/mine")
  @Roles(UserRole.FREELANCE)
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.deskService.findMine(user.id);
  }
}
