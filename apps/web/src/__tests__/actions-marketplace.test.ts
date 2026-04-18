import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({ token: "test-token" });
const mockRevalidatePath = vi.fn();

vi.mock("@/lib/api", () => ({ apiRequest: (...args: unknown[]) => mockApiRequest(...args) }));
vi.mock("@/lib/session", () => ({ getSession: () => mockGetSession() }));
vi.mock("next/cache", () => ({ revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args) }));

const { createMissionFromRenfort, getMyAteliers, createServiceFromPublish } = await import("@/app/actions/marketplace");

const baseInput = {
  title: "Infirmier de nuit",
  dateStart: "2026-05-01T20:00:00.000Z",
  dateEnd: "2026-05-02T06:00:00.000Z",
  hourlyRate: 32,
  address: "1 rue de la Paix, 75001 Paris",
  isRenfort: true,
  metier: "INFIRMIER",
  shift: "NUIT" as const,
  city: "Paris",
};

describe("createMissionFromRenfort", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ token: "test-token" });
    mockApiRequest.mockResolvedValue({ id: "new-mission-id" });
  });

  it("appelle POST /missions avec les données correctes", async () => {
    await createMissionFromRenfort(baseInput);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/missions",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          title: "Infirmier de nuit",
          isRenfort: true,
          metier: "INFIRMIER",
        }),
      }),
    );
  });

  it("retourne { ok: true } en cas de succès", async () => {
    const result = await createMissionFromRenfort(baseInput);
    expect(result).toEqual({ ok: true });
  });

  it("invalide /dashboard après création", async () => {
    await createMissionFromRenfort(baseInput);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("invalide /dashboard/renforts après création", async () => {
    await createMissionFromRenfort(baseInput);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/renforts");
  });

  it("invalide /marketplace après création", async () => {
    await createMissionFromRenfort(baseInput);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/marketplace");
  });

  it("lance une erreur si la session est absente", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(createMissionFromRenfort(baseInput)).rejects.toThrow("Non connecté");
  });
});

// ─── getMyAteliers ────────────────────────────────────────────────────────────

const mockService = {
  id: "svc-1",
  title: "Zumba thérapeutique",
  description: null,
  price: 100,
  type: "WORKSHOP" as const,
  capacity: 12,
  pricingType: "SESSION" as const,
  pricePerParticipant: null,
  durationMinutes: 60,
  category: null,
  publicCible: null,
  materials: null,
  objectives: null,
  methodology: null,
  evaluation: null,
  slots: null,
};

describe("getMyAteliers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ token: "test-token", user: { id: "u-1" } });
    mockApiRequest.mockResolvedValue([mockService]);
  });

  it("appelle GET /services/my (endpoint dédié)", async () => {
    await getMyAteliers();
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/services/my",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("n'appelle jamais GET /services (pas de sur-fetch)", async () => {
    await getMyAteliers();
    expect(mockApiRequest).not.toHaveBeenCalledWith(
      "/services",
      expect.anything(),
    );
  });

  it("ajoute status ACTIVE à chaque atelier retourné", async () => {
    const result = await getMyAteliers();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "svc-1", status: "ACTIVE" });
  });

  it("trie les ateliers par titre (locale fr)", async () => {
    mockApiRequest.mockResolvedValue([
      { ...mockService, id: "2", title: "Yoga doux" },
      { ...mockService, id: "1", title: "Atelier bien-être" },
      { ...mockService, id: "3", title: "Méditation" },
    ]);
    const result = await getMyAteliers();
    expect(result.map((s) => s.title)).toEqual([
      "Atelier bien-être",
      "Méditation",
      "Yoga doux",
    ]);
  });

  it("retourne [] si la session est absente", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await getMyAteliers();
    expect(result).toEqual([]);
    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it("propage l'erreur en cas d'échec API au lieu de simuler une liste vide", async () => {
    mockApiRequest.mockRejectedValue(new Error("Network error"));
    await expect(getMyAteliers()).rejects.toThrow("Network error");
  });
});

// ─── createServiceFromPublish ─────────────────────────────────────────────────

const baseServiceInput = {
  title: "Zumba thérapeutique",
  price: 100,
  type: "WORKSHOP" as const,
  capacity: 12,
  durationMinutes: 60,
};

describe("createServiceFromPublish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ token: "test-token" });
    mockApiRequest.mockResolvedValue({ id: "new-service-id" });
  });

  it("appelle POST /services avec les données correctes", async () => {
    await createServiceFromPublish(baseServiceInput);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/services",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          title: "Zumba thérapeutique",
          type: "WORKSHOP",
          capacity: 12,
        }),
      }),
    );
  });

  it("retourne { ok: true } en cas de succès", async () => {
    const result = await createServiceFromPublish(baseServiceInput);
    expect(result).toEqual({ ok: true });
  });

  it("invalide /marketplace après création (atelierInvalidationPaths.catalogue)", async () => {
    await createServiceFromPublish(baseServiceInput);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/marketplace");
  });

  it("invalide /dashboard/ateliers après création (atelierInvalidationPaths.mesAteliers)", async () => {
    await createServiceFromPublish(baseServiceInput);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/ateliers");
  });

  it("invalide /dashboard après création", async () => {
    await createServiceFromPublish(baseServiceInput);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("invalide /bookings après création", async () => {
    await createServiceFromPublish(baseServiceInput);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/bookings");
  });

  it("lance une erreur si la session est absente", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(createServiceFromPublish(baseServiceInput)).rejects.toThrow("Non connecté");
  });
});
