import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

const mockPrismaService = {
  conversation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prisma: any;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { 
          provide: MailService, 
          useValue: { 
            sendMessageNotificationEmail: jest.fn().mockResolvedValue(undefined) 
          } 
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prisma = module.get(PrismaService);
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should create conversation if it does not exist and send message', async () => {
      const senderId = 'user-1';
      const receiverId = 'user-2';
      const conversationId = 'conv-1';

      prisma.user.findUnique.mockResolvedValue({ id: receiverId });
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.conversation.create.mockResolvedValue({ id: conversationId });
      prisma.message.create.mockResolvedValue({ id: 'msg-1', content: 'hello' });

      await service.sendMessage(senderId, { receiverId, content: 'hello' });

      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          participantAId: senderId < receiverId ? senderId : receiverId,
          participantBId: senderId < receiverId ? receiverId : senderId,
        },
      });
      expect(prisma.message.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if receiver does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage('user-1', { receiverId: 'ghost', content: 'test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMessages', () => {
    it('should return messages if user is part of the conversation', async () => {
      const conv = { id: 'conv-1', participantAId: 'user-1', participantBId: 'user-2' };
      prisma.conversation.findUnique.mockResolvedValue(conv);
      prisma.message.findMany.mockResolvedValue([{ id: 'msg-1' }]);

      const msgs = await service.findMessages('conv-1', 'user-1');
      expect(msgs).toHaveLength(1);
    });

    it('should throw ForbiddenException if user is not part of the conversation', async () => {
      const conv = { id: 'conv-1', participantAId: 'user-1', participantBId: 'user-2' };
      prisma.conversation.findUnique.mockResolvedValue(conv);

      await expect(service.findMessages('conv-1', 'hacker')).rejects.toThrow(ForbiddenException);
    });
  });
});
