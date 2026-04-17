import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateOnboardingDto } from "./dto/update-onboarding.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { MAX_STEP_BY_ROLE } from "../common/constants";
import { BuyCreditsDto, CreditPackType } from "./dto/buy-credits.dto";

const CREDIT_PACKS: Record<CreditPackType, { amount: number; credits: number }> = {
    [CreditPackType.STARTER]: { amount: 150, credits: 1 },
    [CreditPackType.PRO]: { amount: 400, credits: 3 },
    [CreditPackType.ENTERPRISE]: { amount: 600, credits: 5 },
};

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

    async completeOnboarding(userId: string, role: string) {
        const userRole = role as keyof typeof MAX_STEP_BY_ROLE;
        const maxStep = MAX_STEP_BY_ROLE[userRole] || 4;

        return this.prisma.user.update({
            where: { id: userId },
            data: { onboardingStep: maxStep },
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

    async getCredits(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                profile: {
                    select: {
                        availableCredits: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException("Utilisateur introuvable");
        }

        return {
            availableCredits: user.profile?.availableCredits ?? 0,
        };
    }

    async buyCredits(userId: string, dto: BuyCreditsDto) {
        const pack = CREDIT_PACKS[dto.packType];

        if (!pack) {
            throw new BadRequestException("Pack de crédits invalide.");
        }

        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { id: true },
            });

            if (!user) {
                throw new NotFoundException("Utilisateur introuvable");
            }

            await tx.packPurchase.create({
                data: {
                    establishmentId: userId,
                    amount: pack.amount,
                    creditsAdded: pack.credits,
                },
            });

            const profile = await tx.profile.upsert({
                where: { userId },
                create: {
                    userId,
                    firstName: "",
                    lastName: "",
                    skills: [],
                    availableCredits: pack.credits,
                },
                update: {
                    availableCredits: {
                        increment: pack.credits,
                    },
                },
                select: {
                    availableCredits: true,
                },
            });

            return {
                availableCredits: profile.availableCredits,
            };
        });
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

    /**
     * Checks if a freelance is currently on a confirmed/assigned mission.
     */
    async isCurrentlyBusy(userId: string): Promise<boolean> {
        const now = new Date();
        const activeMissionBooking = await this.prisma.booking.findFirst({
            where: {
                freelanceId: userId,
                status: { in: ["CONFIRMED", "IN_PROGRESS"] },
                reliefMission: {
                    dateStart: { lte: now },
                    dateEnd: { gte: now },
                },
            },
        });
        return !!activeMissionBooking;
    }

    /**
     * Returns availability data for the current user.
     */
    async getAvailability(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                isAvailable: true,
                profile: { select: { availableDays: true } },
            },
        });
        if (!user) throw new NotFoundException("Utilisateur introuvable");

        const isCurrentlyBusy = await this.isCurrentlyBusy(userId);

        return {
            isAvailable: user.isAvailable,
            availableDays: user.profile?.availableDays ?? [],
            isCurrentlyBusy,
        };
    }
}

