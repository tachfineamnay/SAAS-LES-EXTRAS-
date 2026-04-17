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

const { buyPack, getCredits } = await import("@/actions/credits");

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
});
