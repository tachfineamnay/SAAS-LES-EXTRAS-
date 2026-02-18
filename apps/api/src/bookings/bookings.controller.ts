import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { CancelBookingLineDto } from "./dto/cancel-booking-line.dto";
import { ActionBookingDto } from "./dto/action-booking.dto";
import { BookingsService } from "./bookings.service";

@Controller("bookings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT, UserRole.TALENT)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Get()
  getBookingsPageData(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.getBookingsPageData(user);
  }

  @Post("cancel")
  cancelBookingLine(
    @Body() dto: CancelBookingLineDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.cancelBookingLine(dto, user);
  }

  @Get(":lineType/:lineId/details")
  getBookingLineDetails(
    @Param("lineType") lineType: string,
    @Param("lineId") lineId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.getBookingLineDetails(lineType, lineId, user);
  }

  @Post("confirm")
  confirmBooking(
    @Body() dto: ActionBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.confirmBooking(dto.bookingId, user);
  }

  @Post("complete")
  completeBooking(
    @Body() dto: ActionBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.completeBooking(dto.bookingId, user);
  }
}
