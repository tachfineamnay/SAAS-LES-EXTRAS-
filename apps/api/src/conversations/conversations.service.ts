import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/conversations.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAllForUser(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      include: {
        participantAUser: {
          include: { profile: true },
        },
        participantBUser: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conv: any) => {
      const otherParticipant =
        conv.participantAId === userId
          ? conv.participantBUser
          : conv.participantAUser;

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        otherParticipant: {
          id: otherParticipant.id,
          firstName: otherParticipant.profile?.firstName,
          lastName: otherParticipant.profile?.lastName,
          avatar: otherParticipant.profile?.avatar,
          role: otherParticipant.role,
        },
        lastMessage: conv.messages[0] || null,
        unreadCount: conv._count.messages,
      };
    });
  }

  async findMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participantAId !== userId &&
      conversation.participantBId !== userId
    ) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getOrCreateConversation(userAId: string, userBId: string) {
    const [participantAId, participantBId] =
      userAId < userBId ? [userAId, userBId] : [userBId, userAId];

    let conversation = await this.prisma.conversation.findUnique({
      where: {
        participantAId_participantBId: {
          participantAId,
          participantBId,
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participantAId,
          participantBId,
        },
      });
    }

    return conversation;
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const { receiverId, content } = dto;

    // Check if receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId: conversation.id,
      },
    });

    // Update conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      include: { profile: true },
    });

    if (receiver.email && sender) {
      const senderName = sender.profile?.firstName || sender.email.split('@')[0];
      if (senderName) {
        this.mailService.sendMessageNotificationEmail(receiver.email, senderName).catch((e: unknown) => console.error(e));
      }
    }

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participantAId !== userId &&
      conversation.participantBId !== userId
    ) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const { count } = await this.prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true, count };
  }
}
