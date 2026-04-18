import { Body, Controller, Get, Param, Patch, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { BuyCreditsDto } from "./dto/buy-credits.dto";
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
    @Get("me/availability")
    getAvailability(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getAvailability(user.id);
    }
    @Patch("me")
    updateMe(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateMe(user.id, dto);
    }

    @Get("me/credits")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ESTABLISHMENT, UserRole.FREELANCE)
    getCredits(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getCredits(user.id);
    }

    @Get("me/credits/history")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ESTABLISHMENT, UserRole.FREELANCE)
    getCreditHistory(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getCreditHistory(user.id);
    }

    @Post("me/credits/buy")
    @UseGuards(RolesGuard)
    @Roles(UserRole.ESTABLISHMENT, UserRole.FREELANCE)
    buyCredits(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: BuyCreditsDto,
    ) {
        return this.usersService.buyCredits(user.id, dto);
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
        return this.usersService.completeOnboarding(user.id, user.role);
    }

    @Post("me/diploma")
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: "./uploads",
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
            fileFilter: (req, file, cb) => {
                const allowed = ["image/jpeg", "image/png", "application/pdf"];
                if (allowed.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException("Type de fichier non autorisé. Seuls PDF, JPG et PNG sont acceptés."), false);
                }
            },
        }),
    )
    uploadDiploma(
        @CurrentUser() user: AuthenticatedUser,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException("Aucun fichier fourni");
        }
        
        // Simulating a public URL. In a real application, you might use S3, etc.
        // For V1 Light, returning the local path or dummy cloud URL.
        const fileUrl = `/uploads/${file.filename}`;
        
        return {
            url: fileUrl,
        };
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
