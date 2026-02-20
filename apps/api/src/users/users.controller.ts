import { Body, Controller, Patch, Post, Request, UseGuards, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch("me/onboarding")
    updateOnboarding(@Request() req: any, @Body() body: { step: number;[key: string]: any }) {
        const { step, ...data } = body;
        return this.usersService.updateOnboardingStep(req.user.id, step, data);
    }

    @Post("me/onboarding/complete")
    completeOnboarding(@Request() req: any) {
        return this.usersService.completeOnboarding(req.user.id);
    }
    @Get("talents")
    getTalents() {
        return this.usersService.findAllTalents();
    }
}
