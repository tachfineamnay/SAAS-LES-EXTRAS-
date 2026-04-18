import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({ token: "credits-token" });
const mockRevalidatePath = vi.fn();

vi.mock("@/lib/api", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));
vi.mock("@/lib/session", () => ({
  getSession: () => mockGetSession(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const { buyPack, getCredits, getCreditPurchaseHistory } = await import("@/actions/credits");

describe("credits actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ token: "credits-token" });
  });

  it("achète un pack et retourne le nouveau solde", async () => {
    mockApiRequest.mockResolvedValue({ availableCredits: 5 });

    const result = await buyPack("PRO");

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/users/me/credits/buy",
      expect.objectContaining({
        method: "POST",
        token: "credits-token",
        body: { packType: "PRO" },
      }),
    );
    expect(result).toEqual({ ok: true, availableCredits: 5 });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/packs");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/account");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/establishment");
  });

  it("retourne le message API lisible en cas d'erreur", async () => {
    mockApiRequest.mockRejectedValue(new Error("Pack de crédits invalide."));

    const result = await buyPack("ENTERPRISE");

    expect(result).toEqual({ error: "Pack de crédits invalide." });
  });

  it("lit le vrai endpoint crédits", async () => {
    mockApiRequest.mockResolvedValue({ availableCredits: 3 });

    const result = await getCredits();

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/users/me/credits",
      expect.objectContaining({
        method: "GET",
        token: "credits-token",
      }),
    );
    expect(result).toBe(3);
  });

  it("propage l'erreur API au lieu de masquer un faux solde à 0", async () => {
    mockApiRequest.mockRejectedValue(new Error("Service crédits indisponible"));

    await expect(getCredits()).rejects.toThrow("Service crédits indisponible");
  });

  it("rejette la lecture du solde si aucune session n'est disponible", async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(getCredits()).rejects.toThrow("Non connecté");
    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it("lit l'historique d'achat sur le nouvel endpoint dédié", async () => {
    mockApiRequest.mockResolvedValue([
      {
        id: "purchase-1",
        amount: 400,
        creditsAdded: 3,
        createdAt: "2026-04-18T10:00:00.000Z",
      },
    ]);

    const result = await getCreditPurchaseHistory();

    expect(mockApiRequest).toHaveBeenCalledWith(
      "/users/me/credits/history",
      expect.objectContaining({
        method: "GET",
        token: "credits-token",
      }),
    );
    expect(result).toEqual([
      {
        id: "purchase-1",
        amount: 400,
        creditsAdded: 3,
        createdAt: "2026-04-18T10:00:00.000Z",
      },
    ]);
  });

  it("propage l'erreur API sur l'historique d'achat", async () => {
    mockApiRequest.mockRejectedValue(new Error("Historique indisponible"));

    await expect(getCreditPurchaseHistory()).rejects.toThrow("Historique indisponible");
  });

  it("rejette l'historique si aucune session n'est disponible", async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(getCreditPurchaseHistory()).rejects.toThrow("Non connecté");
    expect(mockApiRequest).not.toHaveBeenCalled();
  });
});
