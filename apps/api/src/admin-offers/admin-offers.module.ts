import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminOffersController } from "./admin-offers.controller";
import { AdminOffersService } from "./admin-offers.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminOffersController],
  providers: [AdminOffersService],
})
export class AdminOffersModule {}
