import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { UpdateOnboardingDto } from "./dto/update-onboarding.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // ── Profil courant ─────────────────────────────────────────────

    @Get("me")
    getMe(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getMe(user.id);
    }

    @Patch("me")
    updateMe(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateMe(user.id, dto);
    }

    // ── Onboarding ─────────────────────────────────────────────────

    @Patch("me/onboarding")
    updateOnboarding(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateOnboardingDto,
    ) {
        return this.usersService.updateOnboardingStep(user.id, dto);
    }

    @Post("me/onboarding/complete")
    completeOnboarding(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.completeOnboarding(user.id);
    }

    // ── Freelances publics ─────────────────────────────────────────

    @Get("freelances")
    getFreelances() {
        return this.usersService.findAllFreelances();
    }

    @Get("freelances/:id")
    getFreelanceById(@Param("id") id: string) {
        return this.usersService.findFreelanceById(id);
    }
}
