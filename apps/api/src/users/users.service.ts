import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateOnboardingDto } from "./dto/update-onboarding.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Persiste les données d'un step wizard ET met à jour onboardingStep.
     * Les alias établissement (establishmentName → companyName, etc.) sont
     * résolus ici pour que le Profile soit toujours cohérent.
     */
    async updateOnboardingStep(userId: string, dto: UpdateOnboardingDto) {
        const { step, contactName, establishmentName, establishmentType, isAvailable, ...rest } = dto as any;

        // ── Résolution des alias wizard ──────────────────────────
        const profileFields: Record<string, unknown> = { ...rest };

        if (establishmentName) profileFields.companyName = establishmentName;

        // Le type d'établissement (IME, MECS…) va dans jobTitle
        if (establishmentType) profileFields.jobTitle = establishmentType;

        // contactName "Jean Dupont" → firstName="Jean" lastName="Dupont"
        if (contactName) {
            const parts = (contactName as string).trim().split(/\s+/);
            profileFields.firstName = parts[0] ?? "";
            profileFields.lastName = (parts.slice(1).join(" ") || parts[0]) ?? "";
        }

        // Exclure les champs undefined pour ne pas écraser avec null
        Object.keys(profileFields).forEach((k) => {
            if (profileFields[k] === undefined) delete profileFields[k];
        });

        try {
            return await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    onboardingStep: step,
                    ...(typeof isAvailable === "boolean" ? { isAvailable } : {}),
                },
            });

            // Upsert Profile — crée le profil s'il n'existe pas encore
            if (Object.keys(profileFields).length > 0) {
                await tx.profile.upsert({
                    where: { userId },
                    create: {
                            userId,
                            firstName: (profileFields.firstName as string) ?? "",
                            lastName: (profileFields.lastName as string) ?? "",
                            skills: (profileFields.skills as string[] | undefined) ?? [],
                            ...profileFields,
                        },
                        update: profileFields,
                });
            }

            return user;
        });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") throw new NotFoundException("Utilisateur introuvable");
                if (err.code === "P2002") throw new BadRequestException("Donnees en conflit");
            }
            throw err;
        }
    }

    async completeOnboarding(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { onboardingStep: 4 },
        });
    }
    /**
     * Retourne l'utilisateur courant avec son profil.
     * Utilisé par GET /users/me.
     */
    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                onboardingStep: true,
                isAvailable: true,
                createdAt: true,
                profile: true,
            },
        });
        if (!user) throw new NotFoundException("Utilisateur introuvable");
        return user;
    }

    /**
     * Met à jour le profil de l'utilisateur courant.
     * Utilisé par PATCH /users/me.
     */
    async updateMe(userId: string, dto: UpdateProfileDto) {
        const { isAvailable, ...profileFields } = dto;

        // Exclure les champs undefined
        const cleanProfile: Record<string, unknown> = {};
        Object.entries(profileFields).forEach(([k, v]) => {
            if (v !== undefined) cleanProfile[k] = v;
        });

        try {
            return await this.prisma.$transaction(async (tx) => {
            if (typeof isAvailable === "boolean") {
                await tx.user.update({
                    where: { id: userId },
                    data: { isAvailable },
                });
            }

            if (Object.keys(cleanProfile).length > 0) {
                await tx.profile.upsert({
                    where: { userId },
                    create: {
                        userId,
                        firstName: (cleanProfile.firstName as string) ?? "",
                        lastName: (cleanProfile.lastName as string) ?? "",
                        skills: (cleanProfile.skills as string[] | undefined) ?? [],
                        ...cleanProfile,
                    },
                    update: cleanProfile,
                });
            }

            return this.getMe(userId);
        });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") throw new NotFoundException("Utilisateur introuvable");
                if (err.code === "P2002") throw new BadRequestException("Donnees en conflit");
            }
            throw err;
        }
    }

    async findAllFreelances() {
        return this.prisma.user.findMany({
            where: {
                role: "FREELANCE",
                status: "VERIFIED",
            },
            include: {
                profile: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findFreelanceById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id, role: "FREELANCE" },
            include: {
                profile: true,
                reviewsReceived: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                profile: { select: { firstName: true, lastName: true, avatar: true, companyName: true } },
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
                ownerServices: {
                    where: { status: "ACTIVE" },
                    take: 10,
                },
            },
        });
        if (!user) throw new NotFoundException("Freelance introuvable");
        return user;
    }
}


