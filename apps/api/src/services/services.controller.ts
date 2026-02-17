import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServicesService } from "./services.service";

@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.TALENT)
  findAll() {
    return this.servicesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TALENT)
  createService(
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.servicesService.createService(dto, user.id);
  }

  @Post(":serviceId/book")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  bookService(@Param("serviceId") serviceId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.servicesService.bookService(serviceId, user.id);
  }
}
