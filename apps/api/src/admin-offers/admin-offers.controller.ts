import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AdminOffersService } from "./admin-offers.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOffersController {
  constructor(private readonly adminOffersService: AdminOffersService) {}

  @Get("missions")
  getMissions() {
    return this.adminOffersService.getMissions();
  }

  @Post("missions/:missionId/delete")
  deleteMission(@Param("missionId") missionId: string) {
    return this.adminOffersService.deleteMission(missionId);
  }

  @Get("services")
  getServices() {
    return this.adminOffersService.getServices();
  }

  @Post("services/:serviceId/feature")
  featureService(@Param("serviceId") serviceId: string) {
    return this.adminOffersService.toggleFeatureService(serviceId);
  }

  @Post("services/:serviceId/hide")
  hideService(@Param("serviceId") serviceId: string) {
    return this.adminOffersService.toggleHideService(serviceId);
  }
}
