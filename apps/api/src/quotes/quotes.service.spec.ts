import { QuotesService } from "./quotes.service";

describe("QuotesService", () => {
  const prisma = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    quote: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    conversation: {
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  } as any;

  const notifications = {
    create: jest.fn(),
  };

  const conversations = {
    getOrCreateConversation: jest.fn(),
  };

  const events = {
    emitToMany: jest.fn(),
  };

  let service: QuotesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuotesService(
      prisma,
      notifications as any,
      events as any,
    );
  });

  it("force la TVA à 0 et garde totalTTC = subtotalHT", async () => {
    prisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      status: "PENDING",
      freelanceId: "free-1",
      establishmentId: "est-1",
      reliefMission: null,
      service: { title: "Atelier mémoire" },
      freelance: { profile: { firstName: "Nora" } },
      establishment: { profile: { firstName: "Samir" } },
      conversation: { id: "conv-1" },
    });
    prisma.quote.create.mockResolvedValue({
      id: "quote-1",
      status: "SENT",
      subtotalHT: 120,
      vatRate: 0,
      vatAmount: 0,
      totalTTC: 120,
      lines: [],
    });

    await service.generateQuote("free-1", {
      bookingId: "booking-1",
      lines: [
        {
          description: "Séance",
          quantity: 1,
          unitPrice: 120,
        },
      ],
      vatRate: 0.2,
    });

    expect(prisma.quote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotalHT: 120,
          vatRate: 0,
          vatAmount: 0,
          totalTTC: 120,
        }),
      }),
    );
    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: expect.not.stringContaining("TTC"),
        }),
      }),
    );
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.not.stringContaining("TTC"),
      }),
    );
  });
});
