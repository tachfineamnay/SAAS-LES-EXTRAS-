import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(createNotificationDto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                userId: createNotificationDto.userId,
                message: createNotificationDto.message,
                type: createNotificationDto.type,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
}
