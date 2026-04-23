import { Body, Controller, Get, Param, Patch, Post, Res, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { mkdirSync } from "fs";
import { extname, join, resolve } from "path";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { BuyCreditsDto } from "./dto/buy-credits.dto";
import { UpdateOnboardingDto } from "./dto/update-onboarding.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";
import { isFreelanceKycDocumentType } from "./kyc-documents";
import type { Response } from "express";

const PRIVATE_KYC_UPLOAD_DIR = join(process.cwd(), "private-uploads", "kyc");

function createKycFileInterceptor() {
    return FileInterceptor("file", {
        storage: diskStorage({
            destination: (req, _file, cb) => {
                mkdirSync(PRIVATE_KYC_UPLOAD_DIR, { recursive: true });
                cb(null, PRIVATE_KYC_UPLOAD_DIR);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                const userId = ((req as { user?: { id?: string } }).user?.id ?? "user").slice(0, 12);
                const documentType = typeof req.params?.type === "string" && isFreelanceKycDocumentType(req.params.type)
                    ? req.params.type.toLowerCase()
                    : "kyc-document";
                cb(null, `${documentType}-${userId}-${uniqueSuffix}${ext}`);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = ["image/jpeg", "image/png", "application/pdf"];
            if (allowed.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new BadRequestException("Type de fichier non autorisé. Seuls PDF, JPG et PNG sont acceptés."), false);
            }
        },
    });
}

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

    @Get("me/documents")
    @UseGuards(RolesGuard)
    @Roles(UserRole.FREELANCE)
    getMyDocuments(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getMyKycDocuments(user.id);
    }

    @Post("me/documents/:type")
    @UseGuards(RolesGuard)
    @Roles(UserRole.FREELANCE)
    @UseInterceptors(createKycFileInterceptor())
    uploadKycDocument(
        @CurrentUser() user: AuthenticatedUser,
        @Param("type") type: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.usersService.upsertFreelanceDocument(user.id, type, file);
    }

    @Get("me/documents/:documentId/file")
    @UseGuards(RolesGuard)
    @Roles(UserRole.FREELANCE)
    async downloadMyDocument(
        @CurrentUser() user: AuthenticatedUser,
        @Param("documentId") documentId: string,
        @Res() response: Response,
    ) {
        const document = await this.usersService.getMyKycDocumentFile(user.id, documentId);
        response.setHeader("Content-Type", document.mimeType ?? "application/octet-stream");
        response.setHeader(
            "Content-Disposition",
            `inline; filename="${encodeURIComponent(document.filename)}"`,
        );
        return response.sendFile(resolve(document.storagePath));
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
