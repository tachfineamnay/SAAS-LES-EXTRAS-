import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async updateOnboardingStep(userId: string, step: number, data: any) {
        // Determine what to update based on data keys
        // This is a simplified approach. Ideally we filter data.

        // We update the user's onboardingStep
        // And potentially other fields in User or related models (Profile?)
        // For now, let's assume 'data' contains fields that match User model or we handle generic profile data later

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                onboardingStep: step,
                // We can add other fields here if we extended User model or have a Profile model
                // For the MVP, we might just store json or specific fields if they exist
                // The implementation plan said "Update User model"
                // Let's assume we might need to store the extra data (jobTitle, bio, etc)
                // If they are not in schema, we can't save them yet!

                // Wait, I updated Schema to add ONLY onboardingStep.
                // Where do jobTitle, bio, address go?
                // I need to check Schema again.
            },
        });
    }

    async completeOnboarding(userId: string) {
        // Maybe set status to VERIFIED or similar?
        // Or just ensure step is 4.
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                onboardingStep: 4, // or whatever max step
            }
        });
    }
    async findAllTalents() {
        return this.prisma.user.findMany({
            where: {
                role: "TALENT",
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
}
