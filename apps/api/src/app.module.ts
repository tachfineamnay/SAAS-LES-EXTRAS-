import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { SentryModule } from "@sentry/nestjs/setup";
import { AdminOffersModule } from "./admin-offers/admin-offers.module";
import { DeskModule } from "./desk/desk.module";
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

import { ReviewsModule } from './reviews/reviews.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MailModule } from './mail/mail.module';
import { QuotesModule } from './quotes/quotes.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000, // 1 minute window
        limit: 60,  // 60 requests per minute globally
      },
      {
        name: "auth",
        ttl: 60000,
        limit: 10,  // 10 auth attempts per minute
      },
    ]),
    PrismaModule,
    AdminUsersModule,
    AdminOffersModule,
    DeskModule,
    AuthModule,
    MissionsModule,
    ServicesModule,
    BookingsModule,
    NotificationsModule,
    InvoicesModule,
    UsersModule,

    ReviewsModule,
    ConversationsModule,
    MailModule,
    QuotesModule,
    EventsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
