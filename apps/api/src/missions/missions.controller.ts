import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { CreateMissionDto } from "./dto/create-mission.dto";
import { FindMissionsQueryDto } from "./dto/find-missions-query.dto";
import { MissionsService } from "./missions.service";

@Controller("missions")
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  createMission(
    @Body() dto: CreateMissionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.missionsService.createMission(dto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  findAll(@Query() filter: FindMissionsQueryDto) {
    return this.missionsService.findAll(filter);
  }

  @Post(":missionId/apply")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  apply(@Param("missionId") missionId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.missionsService.apply(missionId, user.id);
  }
}
