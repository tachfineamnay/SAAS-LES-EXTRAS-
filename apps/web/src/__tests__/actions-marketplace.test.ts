import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({ token: "test-token" });
const mockRevalidatePath = vi.fn();

vi.mock("@/lib/api", () => ({ apiRequest: (...args: unknown[]) => mockApiRequest(...args) }));
vi.mock("@/lib/session", () => ({ getSession: () => mockGetSession() }));
vi.mock("next/cache", () => ({ revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args) }));

const { createMissionFromRenfort } = await import("@/app/actions/marketplace");

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
