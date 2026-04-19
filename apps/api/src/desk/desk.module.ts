import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DeskController } from "./desk.controller";
import { DeskService } from "./desk.service";

@Module({
  imports: [AuthModule],
  controllers: [DeskController],
  providers: [DeskService],
})
export class DeskModule {}
