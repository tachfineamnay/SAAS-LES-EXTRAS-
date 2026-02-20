import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminOffersModule } from "./admin-offers/admin-offers.module";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { HealthController } from "./health.controller";
import { MissionsModule } from "./missions/missions.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ServicesModule } from "./services/services.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { UsersModule } from "./users/users.module";
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AdminUsersModule,
    AdminOffersModule,
    AuthModule,
    MissionsModule,
    ServicesModule,
    BookingsModule,
    NotificationsModule,
    InvoicesModule,
    UsersModule,
    QuotesModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }
